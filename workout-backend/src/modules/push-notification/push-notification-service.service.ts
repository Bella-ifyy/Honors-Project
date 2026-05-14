import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { PushDeviceEntity } from "../../entities/push-device.entity";
import { UserEntity } from "../../entities/user.entity";

@Injectable()
export class PushNotificationService {
  private expo: Expo;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,

    @InjectRepository(PushDeviceEntity)
    private readonly pushDeviceRepository: Repository<PushDeviceEntity>,
  ) {
    this.expo = new Expo();
  }

  async sendNotification(
    from: string,
    to: string,
    message: string,
    options: {
      channelId?: "task-alerts" | "general-alerts" | "default";
      sound?: string | null;
      priority?: "default" | "normal" | "high";
      data?: Record<string, any>;
    } = {},
  ): Promise<void> {
    try {
      const recipientProfile = await this.userEntityRepository.findOne({
        where: [{ uuid: to }, { email: to }],
      });
      if (!recipientProfile) {
        console.log("Recipient not found", HttpStatus.NOT_FOUND);
        return;
      }

      const pushDevices = await this.pushDeviceRepository.find({
        where: { userUUID: recipientProfile.uuid },
      });

      const validTokens = pushDevices
        .map((device) => device.pushToken)
        .filter(
          (token): token is string =>
            typeof token === "string" && Expo.isExpoPushToken(token),
        );

      if (validTokens.length === 0) {
        console.log(
          "Recipient push token not found or invalid",
          HttpStatus.NOT_FOUND,
        );
        return;
      }

      const notificationMessages: ExpoPushMessage[] = validTokens.map(
        (token) => ({
          to: token,
          sound: options.sound ?? "default",
          title: from,
          body: message,
          data: { from, to, ...(options.data ?? {}) },
          channelId: options.channelId ?? "general-alerts",
          priority: options.priority ?? "high",
        }),
      );

      await this.expo.sendPushNotificationsAsync(notificationMessages);
      console.log("Push notification sent:", recipientProfile?.email);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}
