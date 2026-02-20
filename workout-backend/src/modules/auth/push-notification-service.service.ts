import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { UserEntity } from "../../entities/user.entity";
import { PushDeviceEntity } from "../../entities/push-device.entity";

export type PushNotificationChannels = "task-alerts" | "general-alerts" | "default";

interface PushNotificationOptions {
  channelId?: PushNotificationChannels;
  sound?: string | null;
  priority?: "default" | "normal" | "high";
  data?: Record<string, any>;
}

@Injectable()
export class PushNotificationService {
  private expo: Expo;

  constructor(
    @InjectRepository(UserEntity)
    private readonly profileRepository: Repository<UserEntity>,
    @InjectRepository(PushDeviceEntity)
    private readonly pushDeviceRepository: Repository<PushDeviceEntity>,
  ) {
    this.expo = new Expo();
  }

  async sendNotification(
    from: string | "system",
    to: string,
    message: string,
    options: PushNotificationOptions = {},
  ): Promise<void> {
    try {
      let sender = null;

      if (from !== "system") {
        sender = await this.profileRepository.findOne({
          where: [{ uuid: from }, { email: from }],
        });
        if (!sender) {
          throw new HttpException("Sender not found", HttpStatus.NOT_FOUND);
        }
      }

      const recipientProfile = await this.profileRepository.findOne({
        where: [{ uuid: to }, { email: to }],
      });
      if (!recipientProfile) {
        throw new HttpException("Recipient not found", HttpStatus.NOT_FOUND);
      }

      const pushDevices = await this.pushDeviceRepository.find({
        where: { userUUID: recipientProfile.uuid },
      });

      const validTokens = pushDevices
        .map(device => device.pushToken)
        .filter(
          (token): token is string =>
            typeof token === "string" && Expo.isExpoPushToken(token),
        );

      if (validTokens.length === 0) {
        console.warn(
          `Skipping push notification; invalid or missing token for ${recipientProfile.uuid}`,
        );
        return;
      }

      const notificationMessages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        sound: options.sound ?? "default",
        title:
          from === "system"
            ? "System Notification"
            : `New Notification from ${sender?.firstName || "Unknown Sender"}`,
        body: message,
        data: { from, to, ...(options.data ?? {}) },
        channelId: options.channelId ?? "general-alerts",
        priority: options.priority ?? "high",
      }));

      const ticket = await this.expo.sendPushNotificationsAsync(
        notificationMessages,
      );
      console.log("Push notification sent:", ticket);
    } catch (error) {
      console.error("Error sending push notification:", error);
      throw new HttpException(
        error.message || "Failed to send notification",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
