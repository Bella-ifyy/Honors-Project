import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { DelegateEntity } from "../../entities/delegate.entity";
import { UserEntity } from "../../entities/user.entity";
import { NoteShareEntity } from "../../entities/note-share.entity";
import { TaskShareEntity } from "../../entities/task-share.entity";

@Injectable()
export class DelegateService {
  constructor(
    @InjectRepository(DelegateEntity)
    private readonly delegateRepository: Repository<DelegateEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(NoteShareEntity)
    private readonly noteShareRepository: Repository<NoteShareEntity>,
    @InjectRepository(TaskShareEntity)
    private readonly taskShareRepository: Repository<TaskShareEntity>,
  ) {}

  async listDelegates(ownerUUID: string) {
    const delegates = await this.delegateRepository.find({ where: { ownerUUID } });
    if (!delegates.length) {
      return [];
    }
    const delegateUUIDs = delegates.map(delegate => delegate.delegateUUID);
    const users = await this.userRepository.find({ where: { uuid: In(delegateUUIDs) } });
    return users.map(user => ({
      uuid: user.uuid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
  }

  async addDelegate(ownerUUID: string, email: string) {
    if (!email?.trim()) {
      throw new BadRequestException("Email is required");
    }
    const delegateUser = await this.userRepository.findOne({ where: { email } });
    if (!delegateUser) {
      throw new NotFoundException("No account found for that email");
    }
    if (delegateUser.uuid === ownerUUID) {
      throw new BadRequestException("You cannot add yourself as a delegate");
    }

    const existing = await this.delegateRepository.findOne({
      where: { ownerUUID, delegateUUID: delegateUser.uuid },
    });
    if (!existing) {
      const delegate = this.delegateRepository.create({
        ownerUUID,
        delegateUUID: delegateUser.uuid,
      });
      await this.delegateRepository.save(delegate);
    }

    return {
      uuid: delegateUser.uuid,
      email: delegateUser.email,
      firstName: delegateUser.firstName,
      lastName: delegateUser.lastName,
    };
  }

  async removeDelegate(ownerUUID: string, delegateUUID: string) {
    await this.delegateRepository.delete({ ownerUUID, delegateUUID });
    await this.noteShareRepository.delete({ ownerUUID, delegateUUID });
    await this.taskShareRepository.delete({ ownerUUID, delegateUUID });
    return { message: "Delegate removed" };
  }

  async isDelegateForOwner(ownerUUID: string, delegateUUID: string): Promise<boolean> {
    const match = await this.delegateRepository.findOne({
      where: { ownerUUID, delegateUUID },
    });
    return Boolean(match);
  }
}
