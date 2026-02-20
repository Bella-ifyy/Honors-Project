import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { getManager, Repository } from "typeorm";
import { sign, verify } from "jsonwebtoken";
import { compare } from "bcrypt";
import { JWT_SECRET } from "../../config";
import { UserEntity } from "../../entities/user.entity";
import { TaskService } from "../task/task.service";
import { PushDeviceEntity } from "../../entities/push-device.entity";
import { EmailNotificationService } from "../notification/email-notification.service";
import { NoteService } from "../note/note.service";
import { NotificationPreferenceEntity } from "../../entities/notification-preference.entity";
import { TaskEntity } from "../../entities/task.entity";
import { NoteEntity } from "../../entities/note.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PushDeviceEntity)
    private readonly pushDeviceRepository: Repository<PushDeviceEntity>,
    @InjectRepository(NotificationPreferenceEntity)
    private readonly notificationPreferenceRepository: Repository<NotificationPreferenceEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
    private taskService: TaskService,
    private emailNotificationService: EmailNotificationService,
    private noteService: NoteService,
  ) {}

  currentUser(user: any) {
    console.log(user);
  }

  async repairUserData(authHeader: string, userUUID: string) {
    const candidates = [authHeader].filter(Boolean) as string[];
    if (authHeader?.startsWith("Bearer ")) {
      const tokenOnly = authHeader.substring(7);
      candidates.push(tokenOnly);
    }

    const noteQuery = this.noteRepository
      .createQueryBuilder()
      .update()
      .set({ userUUID })
      .where("userUUID LIKE :likeValue", { likeValue: "Bearer %" });

    if (candidates.length > 0) {
      noteQuery.orWhere("userUUID IN (:...candidates)", { candidates });
    }

    const noteUpdate = await noteQuery.execute();

    const taskQuery = this.taskRepository
      .createQueryBuilder()
      .update()
      .set({ userUUID })
      .where("userUUID LIKE :likeValue", { likeValue: "Bearer %" });

    if (candidates.length > 0) {
      taskQuery.orWhere("userUUID IN (:...candidates)", { candidates });
    }

    const taskUpdate = await taskQuery.execute();

    return {
      notesUpdated: noteUpdate.affected ?? 0,
      tasksUpdated: taskUpdate.affected ?? 0,
    };
  }

  async create(createUserDto: any) {
    console.log(createUserDto);
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });

    if (userByEmail) {
      throw new HttpException(
        "Email is taken ",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    const newUserRepo = await this.userRepository.save(newUser);

    await this.taskService.createTask(
      {
        title: "Create Your First Task",
        description: "Create Your First Task",
        dueDate: new Date(),
        category: "Personal",
      },
      newUserRepo.uuid,
    );

    try {
      await this.emailNotificationService.sendWelcomeEmail(
        newUserRepo.email,
        newUserRepo.firstName,
      );
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    return { ...newUserRepo, token: this.generateJWT(newUser) };
  }

  async updateUserPassword(user_id: any, newPassword: string) {
    console.log(user_id);
    const user = await this.userRepository.findOne({ id: user_id });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    user.password = newPassword;
    Object.assign(user, user);
    return await this.userRepository.save(user);
  }

  async login(loginUserDto: any) {
    const user = await this.userRepository.findOne({
      email: loginUserDto.email,
    });
    if (!user) {
      throw new HttpException(
        "Credentials are not valid",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = loginUserDto.password == user.password;

    if (!isPasswordCorrect) {
      throw new HttpException(
        "Credentials are not valid",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    delete user.password;
    return this.buildUserResponse(user);
  }

  generateJWT(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): {
    user: {
      firstName: string;
      lastName: string;
      userRoles?: string[];
      image: string;
      password: string;
      roles?: string;
      bio: string;
      id: number;
      email: string;
      token: string;
    };
  } {
    return {
      user: {
        ...user,
        token: this.generateJWT(user),
      },
    };
  }

  async findByUUID(uuid: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ uuid: uuid });
  }

  async findByID(id: number): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne({ id });
  }

  async getUsers(query: any): Promise<any> {
    const { page = 1, limit = 30 } = query;
    const skip = (page - 1) * limit;

    const entityManager = getManager();

    const rawQuery = `
    SELECT \`users\`.*, \`employeeData\`.*
    FROM \`users\`
    LEFT JOIN \`employeeData\` ON \`employeeData\`.\`user_id\` = \`users\`.\`id\`
    ORDER BY \`users\`.\`id\` DESC
    LIMIT ${limit}
    OFFSET ${skip}
  `;

    const countQuery = `
    SELECT COUNT(\`users\`.\`id\`) as count
    FROM \`users\`
    LEFT JOIN \`employeeData\` ON \`employeeData\`.\`user_id\` = \`users\`.\`id\`
  `;

    const [data, totalCount] = await Promise.all([
      entityManager.query(rawQuery),
      entityManager.query(countQuery),
    ]);

    const total = totalCount[0].count;

    return {
      data,
      pagination: {
        totalCount: total,
        currentPage: page,
        perPage: limit,
      },
    };
  }

  async addPushToken(
    payload: { pushToken: string },
    authToken: string,
  ): Promise<any> {
    try {
      const rawAuth = authToken?.trim();
      const bearerStripped = rawAuth?.startsWith("Bearer ")
        ? rawAuth.substring(7).trim()
        : rawAuth;

      let userUUID: string | undefined = rawAuth;

      if (bearerStripped) {
        try {
          const decoded: any = verify(bearerStripped, JWT_SECRET);
          if (decoded?.id) {
            const user = await this.userRepository.findOne({ id: decoded.id });
            if (user?.uuid) {
              userUUID = user.uuid;
            }
          }
        } catch (err) {
        }
      }

      if (!userUUID && (payload as any)?.userUUID) {
        userUUID = (payload as any).userUUID;
      }

      if (!payload?.pushToken) {
        throw new HttpException("Missing push token", HttpStatus.BAD_REQUEST);
      }

      const existingRecord = await this.pushDeviceRepository.findOne({
        where: { pushToken: payload.pushToken },
      });

      if (existingRecord) {
        if (userUUID && existingRecord.userUUID !== userUUID) {
          existingRecord.userUUID = userUUID;
          return await this.pushDeviceRepository.save(existingRecord);
        }
        return existingRecord;
      }

      const newPushDevice = this.pushDeviceRepository.create({
        pushToken: payload?.pushToken,
        userUUID,
      });
      return await this.pushDeviceRepository.save(newPushDevice);
    } catch (error) {
      console.error("Error adding push token:", error);
      throw new Error("Failed to add push token");
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        return {
          message:
            "If an account with that email exists, we've sent a password reset link.",
          success: true,
        };
      }

      const resetToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      try {
        await this.emailNotificationService.sendPasswordResetEmail(
          user.email,
          user.firstName,
          resetToken,
        );
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }

      return {
        message:
          "If an account with that email exists, we've sent a password reset link.",
        success: true,
      };
    } catch (error) {
      console.error("Error in forgot password:", error);
      throw new HttpException(
        "Failed to process password reset request",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(email: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      await this.taskService.deleteUserTasks(user.uuid);

      await this.noteService.deleteUserNotes(user.uuid);

      await this.pushDeviceRepository.delete({ userUUID: user.uuid });

      await this.userRepository.remove(user);

      return {
        message: "User deleted successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new HttpException(
        "Failed to delete user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAccount(userUUID: string, password: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ uuid: userUUID });

      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      const isPasswordCorrect = password === user.password;
      if (!isPasswordCorrect) {
        throw new HttpException(
          "Invalid password",
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.taskService.deleteUserTasks(user.uuid);

      await this.noteService.deleteUserNotes(user.uuid);

      await this.pushDeviceRepository.delete({ userUUID: user.uuid });

      await this.notificationPreferenceRepository.delete({ userUUID: user.uuid });

      await this.userRepository.remove(user);

      return {
        message: "Account deleted successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to delete account",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
