import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import { AppError, ErrorCode } from "../types/common";

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export class CompanyRepository extends BaseRepository<Company> {
  constructor(client: SupabaseClient) {
    super(client, 'companies');
  }

  async findByUserId(userId: string): Promise<Company[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          "Failed to fetch companies by user",
          500,
          { userId, error }
        );
      }

      return data as Company[];
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Unexpected error fetching companies by user",
        500,
        { userId, originalError: error }
      );
    }
  }

  async findByEmail(email: string): Promise<Company | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('contact_email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          "Failed to fetch company by email",
          500,
          { email, error }
        );
      }

      return data as Company;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Unexpected error fetching company by email",
        500,
        { email, originalError: error }
      );
    }
  }

  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('id')
        .eq('name', name);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          "Failed to check company name existence",
          500,
          { name, excludeId, error }
        );
      }

      return data.length > 0;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Unexpected error checking company name",
        500,
        { name, excludeId, originalError: error }
      );
    }
  }
}