import { FastifyInstance } from "fastify";
import { NotificationType } from "../types";

export class NotificationService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async notifyRoleChange(role: { id: string; name: string }): Promise<void> {
    try {
      const { error } = await this.fastify.supabase
        .from("notifications")
        .insert({
          type: "role_updated" as NotificationType,
          payload: role,
        });
      if (error) throw error;
    } catch (err) {
      const error = err as Error;
      this.fastify.log.error(error.message);
      throw new Error("Failed to notify role change");
    }
  }

  async notifyUserChange(user: { id: string; email: string }): Promise<void> {
    try {
      const { error } = await this.fastify.supabase
        .from("notifications")
        .insert({
          type: "user_added" as NotificationType,
          payload: user,
        });
      if (error) throw error;
    } catch (err) {
      const error = err as Error;
      this.fastify.log.error(error.message);
      throw new Error("Failed to notify user change");
    }
  }

  async notify(type: NotificationType, payload: any): Promise<void> {
    try {
      const { error } = await this.fastify.supabase
        .from("notifications")
        .insert({ type, payload });
      if (error) throw error;
    } catch (err) {
      const error = err as Error;
      this.fastify.log.error(error.message);
      throw new Error("Failed to send notification");
    }
  }
}
