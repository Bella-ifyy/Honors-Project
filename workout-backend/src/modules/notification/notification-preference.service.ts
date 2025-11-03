import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationPreferenceEntity } from "../../entities/notification-preference.entity";

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreferenceEntity)
    private readonly notificationPreferenceRepository: Repository<NotificationPreferenceEntity>,
  ) {}

  async getOrCreatePreferences(
    userUUID: string,
  ): Promise<NotificationPreferenceEntity> {
    let preferences = await this.notificationPreferenceRepository.findOne({
      where: { userUUID },
    });

    if (!preferences) {
      preferences = this.notificationPreferenceRepository.create({ userUUID });
      await this.notificationPreferenceRepository.save(preferences);
    }

    return preferences;
  }

  async updatePreferences(
    userUUID: string,
    updates: Partial<NotificationPreferenceEntity>,
  ): Promise<NotificationPreferenceEntity> {
    let preferences = await this.notificationPreferenceRepository.findOne({
      where: { userUUID },
    });

    if (!preferences) {
      preferences = this.notificationPreferenceRepository.create({
        userUUID,
        ...updates,
      });
    } else {
      Object.assign(preferences, updates);
      preferences.updatedAt = new Date();
    }

    return await this.notificationPreferenceRepository.save(preferences);
  }

  async shouldSendPushNotification(userUUID: string): Promise<boolean> {
    const preferences = await this.getOrCreatePreferences(userUUID);
    return preferences.pushNotifications && preferences.taskReminderPush;
  }

  async shouldSendEmailNotification(userUUID: string): Promise<boolean> {
    const preferences = await this.getOrCreatePreferences(userUUID);
    return preferences.emailNotifications && preferences.taskReminderEmail;
  }
}
