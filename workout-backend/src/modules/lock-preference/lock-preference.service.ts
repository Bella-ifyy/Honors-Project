import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LockPreferenceEntity } from "../../entities/lock-preference.entity";
import { hash, compare } from "bcrypt";

const BCRYPT_ROUNDS = 12;

export type LockPreferenceUpdate = Partial<
  Pick<
    LockPreferenceEntity,
    | "appLockEnabled"
    | "diaryLockEnabled"
    | "tasksLockEnabled"
    | "notesLockEnabled"
    | "requireBiometrics"
    | "diaryModuleEnabled"
  >
>;

@Injectable()
export class LockPreferenceService {
  constructor(
    @InjectRepository(LockPreferenceEntity)
    private readonly lockPreferenceRepository: Repository<LockPreferenceEntity>,
  ) {}

  async getOrCreate(userUUID: string): Promise<LockPreferenceEntity> {
    let record = await this.lockPreferenceRepository.findOne({ where: { userUUID } });
    if (!record) {
      record = this.lockPreferenceRepository.create({ userUUID });
      record = await this.lockPreferenceRepository.save(record);
    }
    return record;
  }

  async updatePreferences(
    userUUID: string,
    updates: LockPreferenceUpdate,
  ): Promise<LockPreferenceEntity> {
    const preference = await this.getOrCreate(userUUID);
    Object.assign(preference, updates);
    return this.lockPreferenceRepository.save(preference);
  }

  async setPassword(
    userUUID: string,
    newPassword: string,
    currentPassword?: string,
  ): Promise<{ hasPassword: boolean }> {
    if (!newPassword || newPassword.length < 4) {
      throw new BadRequestException("Password must be at least 4 characters long");
    }

    const preference = await this.getOrCreate(userUUID);

    if (preference.passwordHash && currentPassword) {
      const matches = await compare(currentPassword, preference.passwordHash);
      if (!matches) {
        throw new BadRequestException("Current password is incorrect");
      }
    } else if (preference.passwordHash && !currentPassword) {
      throw new BadRequestException("Current password is required to update");
    }

    preference.passwordHash = await hash(newPassword, BCRYPT_ROUNDS);
    preference.passwordUpdatedAt = new Date();
    await this.lockPreferenceRepository.save(preference);
    return { hasPassword: true };
  }

  async verifyPassword(userUUID: string, password: string): Promise<boolean> {
    const preference = await this.getOrCreate(userUUID);
    if (!preference.passwordHash) {
      throw new BadRequestException("Password is not configured");
    }
    return compare(password, preference.passwordHash);
  }
}
