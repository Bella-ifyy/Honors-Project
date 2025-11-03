import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailNotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"workout" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        text: text || "",
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendTaskReminderEmail(
    to: string,
    taskTitle: string,
    taskDescription: string,
    dueDate: Date,
  ): Promise<void> {
    const formattedDate = new Date(dueDate).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const subject = `Task Reminder: ${taskTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8665F4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .task-details { background-color: white; padding: 15px; border-left: 4px solid #8665F4; margin: 15px 0; }
            .due-date { color: #FF5E5E; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Task Reminder</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>This is a friendly reminder about your upcoming task:</p>
              <div class="task-details">
                <h2>${taskTitle}</h2>
                <p>${taskDescription || "No description provided"}</p>
                <p><strong>Due Date:</strong> <span class="due-date">${formattedDate}</span></p>
              </div>
              <p>Don't forget to complete this task on time!</p>
              <div class="footer">
                <p>You're receiving this email because you have email notifications enabled in workout.</p>
                <p>&copy; ${new Date().getFullYear()} workout. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendDailyDigestEmail(
    to: string,
    tasks: Array<{
      title: string;
      description: string;
      dueDate: Date;
      priority: string;
    }>,
  ): Promise<void> {
    const subject = `Daily Digest: You have ${tasks.length} task(s) today`;

    const tasksList = tasks
      .map(
        (task) => `
        <div class="task-item">
          <h3>${task.title}</h3>
          <p>${task.description || "No description"}</p>
          <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" },
          )}</p>
          <p><strong>Priority:</strong> <span class="priority-${task.priority.toLowerCase()}">${
          task.priority
        }</span></p>
        </div>
      `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8665F4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .task-item { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #8665F4; }
            .priority-high { color: #FF5E5E; font-weight: bold; }
            .priority-medium { color: #FFD166; font-weight: bold; }
            .priority-low { color: #06D6A0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Daily Task Digest</h1>
              <p>${new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>
            </div>
            <div class="content">
              <p>Good morning! Here are your tasks for today:</p>
              ${tasksList}
              <div class="footer">
                <p>You're receiving this daily digest because you have it enabled in workout.</p>
                <p>&copy; ${new Date().getFullYear()} workout. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendDailyPlanningEmail(
    to: string,
    context: {
      tasks: Array<{
        title: string;
        description: string;
        dueDate: Date;
        priority: string;
      }>;
      totalTasks: number;
      pendingTasks: number;
      notesCount: number;
    },
  ): Promise<void> {
    const { tasks, totalTasks, pendingTasks, notesCount } = context;
    const subject =
      pendingTasks > 0
        ? `Morning Planning: ${pendingTasks} task${
            pendingTasks === 1 ? "" : "s"
          } waiting`
        : "Morning Planning: Set your focus for today";

    const tasksList =
      tasks.length > 0
        ? tasks
            .map(
              (task) => `
        <div class="task-item">
          <h3>${task.title}</h3>
          <p>${task.description || "No description provided"}</p>
          <p><strong>Due:</strong> ${
            task.dueDate
              ? new Date(task.dueDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Anytime"
          }</p>
          <p><strong>Priority:</strong> <span class="priority-${task.priority.toLowerCase()}">${
                task.priority
              }</span></p>
        </div>
      `,
            )
            .join("")
        : `<p>You have no scheduled tasks today. Use this time to capture new tasks or review your notes.</p>`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8665F4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .summary { background-color: white; padding: 15px; border-left: 4px solid #8665F4; margin: 15px 0; }
            .task-item { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #8665F4; }
            .priority-high { color: #FF5E5E; font-weight: bold; }
            .priority-medium { color: #FFD166; font-weight: bold; }
            .priority-low { color: #06D6A0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Good Morning!</h1>
              <p>${new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>
            </div>
            <div class="content">
              <div class="summary">
                <p><strong>Today's Snapshot</strong></p>
                <p>${pendingTasks} of ${totalTasks} task${
      totalTasks === 1 ? "" : "s"
    } still need your attention.</p>
                <p>You have ${notesCount} note${
      notesCount === 1 ? "" : "s"
    } saved in workout.</p>
              </div>
              <p>Here's what to focus on first:</p>
              ${tasksList}
              <div class="footer">
                <p>You're receiving this reminder because daily planning notifications are enabled in workout.</p>
                <p>&copy; ${new Date().getFullYear()} workout. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendEveningReviewEmail(
    to: string,
    context: {
      pendingTasks: Array<{
        title: string;
        description: string;
        dueDate: Date;
        priority: string;
      }>;
      pendingCount: number;
      completedCount: number;
      overdueCount: number;
    },
  ): Promise<void> {
    const { pendingTasks, pendingCount, completedCount, overdueCount } =
      context;

    const subject =
      pendingCount > 0
        ? `Evening Review: ${pendingCount} task${
            pendingCount === 1 ? "" : "s"
          } remaining`
        : "Evening Review: You're all caught up";

    const pendingList =
      pendingTasks.length > 0
        ? pendingTasks
            .map(
              (task) => `
        <div class="task-item">
          <h3>${task.title}</h3>
          <p>${task.description || "No description provided"}</p>
          <p><strong>Due:</strong> ${
            task.dueDate
              ? new Date(task.dueDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Anytime"
          }</p>
          <p><strong>Priority:</strong> <span class="priority-${task.priority.toLowerCase()}">${
                task.priority
              }</span></p>
        </div>
      `,
            )
            .join("")
        : `<p>Everything scheduled for today is complete. Take a moment to celebrate your wins!</p>`;

    const overdueLine =
      overdueCount > 0
        ? `<p><strong>${overdueCount}</strong> overdue task${
            overdueCount === 1 ? " still needs" : "s still need"
          } your attention.</p>`
        : "<p>No overdue tasks are waiting.</p>";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F57C00; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .summary { background-color: white; padding: 15px; border-left: 4px solid #F57C00; margin: 15px 0; }
            .task-item { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #8665F4; }
            .priority-high { color: #FF5E5E; font-weight: bold; }
            .priority-medium { color: #FFD166; font-weight: bold; }
            .priority-low { color: #06D6A0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Evening Review</h1>
              <p>${new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>
            </div>
            <div class="content">
              <div class="summary">
                <p><strong>Today’s Progress</strong></p>
                <p>${completedCount} task${
      completedCount === 1 ? "" : "s"
    } completed today.</p>
                <p>${pendingCount} task${
      pendingCount === 1 ? " remains" : "s remain"
    } on your list.</p>
                ${overdueLine}
              </div>
              <p>${
                pendingCount > 0
                  ? "Here’s what’s still open:"
                  : "Relax and recharge—you’re all caught up!"
              }</p>
              ${pendingList}
              <div class="footer">
                <p>You're receiving this reminder because evening review notifications are enabled in workout.</p>
                <p>&copy; ${new Date().getFullYear()} workout. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const subject = "Welcome to workout!";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8665F4; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { background-color: #8665F4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to workout!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Thank you for joining workout! We're excited to help you manage your tasks and notes efficiently.</p>
              <p>With workout, you can:</p>
              <ul>
                <li>Create and organize tasks with priorities and due dates</li>
                <li>Write and categorize notes/journal entries</li>
                <li>Get push and email notifications for task reminders</li>
                <li>Track your productivity with insightful dashboards</li>
              </ul>
              <p>Get started now and take control of your productivity!</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} workout. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const subject = "Password Reset Request - workout";
    const resetUrl = `${
      process.env.FRONTEND_URL || "https://workout.app"
    }/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F96418; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { background-color: #F96418; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .button:hover { background-color: #e55a0f; }
            .reset-token { background-color: #f0f0f0; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; margin: 15px 0; word-break: break-all; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>We received a request to reset your password for your workout account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <div class="reset-token">${resetUrl}</div>
              <div class="warning">
                <strong>Important:</strong> This link will expire in 24 hours for security reasons. If you didn't request this password reset, please ignore this email.
              </div>
              <p>If you continue to have problems, please contact our support team.</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} workout. All rights reserved.</p>
                <p>This email was sent to ${to}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }
}
