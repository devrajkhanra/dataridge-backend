import { FastifyInstance } from "fastify";
import { NotificationType } from "../types/index";

export class NotificationService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async notifyRoleChange(
    role: { id: string; name: string },
    company_id: string
  ): Promise<void> {
    try {
      const { error } = await this.fastify.supabase
        .from("notifications")
        .insert({
          action: "role_updated" as NotificationType,
          company_id,
          message: `Role ${role.name} updated`,
          sent_to: { user_ids: [] },
        });
      if (error) throw error;
    } catch (err) {
      throw new Error("Failed to notify role change");
    }
  }

  async notifyUserChange(
    user: { id: string; email: string },
    company_id: string
  ): Promise<void> {
    try {
      const { error } = await this.fastify.supabase
        .from("notifications")
        .insert({
          action: "user_added" as NotificationType,
          company_id,
          user_id: user.id,
          message: `User ${user.email} added`,
          sent_to: { user_ids: [user.id] },
        });
      if (error) throw error;
    } catch (err) {
      throw new Error("Failed to notify user change");
    }
  }

  async notify(
    type: NotificationType,
    payload: {
      company_id?: string;
      user_id?: string;
      project_id?: string;
      message: string;
      sent_to: { user_ids: string[] };
    }
  ): Promise<void> {
    try {
      const { error } = await this.fastify.supabase
        .from("notifications")
        .insert({
          action: type,
          company_id: payload.company_id,
          user_id: payload.user_id,
          project_id: payload.project_id,
          message: payload.message,
          sent_to: payload.sent_to,
        });
      if (error) throw error;
    } catch (err) {
      throw new Error("Failed to send notification");
    }
  }
}
