import { createClient, SupabaseClient } from "@supabase/supabase-js";
import env from "./env";
import { IDatabase, AppError, ErrorCode } from "../types/common";

export class DatabaseService implements IDatabase {
  private client: SupabaseClient;
  private connectionPool: Map<string, SupabaseClient> = new Map();
  private readonly maxConnections = 10;
  private currentConnections = 0;

  constructor() {
    this.client = this.createConnection();
  }

  private createConnection(): SupabaseClient {
    if (this.currentConnections >= this.maxConnections) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Maximum database connections reached",
        503
      );
    }

    const client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'dataridge-backend',
        },
      },
    });

    this.currentConnections++;
    return client;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const { data, error } = await this.client.rpc('execute_sql', {
        sql_query: sql,
        parameters: params || []
      });

      if (error) {
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          `Database query failed: ${error.message}`,
          500,
          { sql, params, error }
        );
      }

      return data as T[];
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Unexpected database error",
        500,
        { sql, params, originalError: error }
      );
    }
  }

  async transaction<T>(callback: (trx: SupabaseClient) => Promise<T>): Promise<T> {
    const trxClient = this.createConnection();
    
    try {
      // Supabase doesn't support explicit transactions in the same way
      // This is a simplified implementation
      const result = await callback(trxClient);
      return result;
    } catch (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Transaction failed",
        500,
        { originalError: error }
      );
    } finally {
      this.currentConnections--;
    }
  }

  async health(): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('health_check')
        .select('1')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    // Cleanup connections
    this.connectionPool.clear();
    this.currentConnections = 0;
  }
}

// Singleton instance
export const databaseService = new DatabaseService();