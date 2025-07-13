import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PostgrestError } from "@supabase/supabase-js";
import { ProjectTableSchema } from "../types/index";
import env from "../config/env";

export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  async createTable(schema: ProjectTableSchema): Promise<void> {
    try {
      const columns = schema.columns || [];
      for (const col of columns) {
        const columnDefinition = `${col.column_name} ${col.data_type}${
          col.is_required ? " NOT NULL" : ""
        }`;
        const { error } = await this.client.rpc("create_table", {
          table_name: schema.table_name,
          column_def: columnDefinition,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const error = err as PostgrestError;
      throw new Error(`Failed to create table: ${error.message}`);
    }
  }

  async modifyTable(schema: ProjectTableSchema): Promise<void> {
    try {
      const columns = schema.columns || [];
      for (const col of columns) {
        const columnDefinition = `${col.column_name} ${col.data_type}${
          col.is_required ? " NOT NULL" : ""
        }`;
        const { error } = await this.client.rpc("modify_table", {
          table_name: schema.table_name,
          column_def: columnDefinition,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const error = err as PostgrestError;
      throw new Error(`Failed to modify table: ${error.message}`);
    }
  }
}
