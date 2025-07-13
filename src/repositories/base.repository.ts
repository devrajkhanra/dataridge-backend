import { SupabaseClient } from "@supabase/supabase-js";
import { AppError, ErrorCode, PaginationParams, PaginatedResponse } from "../types/common";
import { loggerService } from "../services/logger.service";
import { cacheService } from "../services/cache.service";

export abstract class BaseRepository<T extends { id: string }> {
  protected client: SupabaseClient;
  protected tableName: string;
  protected cachePrefix: string;

  constructor(client: SupabaseClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
    this.cachePrefix = `${tableName}:`;
  }

  async findById(id: string, useCache: boolean = true): Promise<T | null> {
    try {
      const cacheKey = `${this.cachePrefix}${id}`;
      
      if (useCache) {
        const cached = await cacheService.get<T>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to fetch ${this.tableName} by id`,
          500,
          { id, error }
        );
      }

      if (useCache && data) {
        await cacheService.set(cacheKey, data, 300);
      }

      return data as T;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        `Unexpected error fetching ${this.tableName}`,
        500,
        { id, originalError: error }
      );
    }
  }

  async findAll(
    filters: Record<string, any> = {},
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<T> | T[]> {
    try {
      let query = this.client.from(this.tableName).select('*', { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply pagination
      if (pagination) {
        const { page, limit, sortBy, sortOrder } = pagination;
        const offset = (page - 1) * limit;

        query = query.range(offset, offset + limit - 1);

        if (sortBy) {
          query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        }
      }

      const { data, error, count } = await query;

      if (error) {
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to fetch ${this.tableName} list`,
          500,
          { filters, pagination, error }
        );
      }

      if (pagination && count !== null) {
        const totalPages = Math.ceil(count / pagination.limit);
        return {
          data: data as T[],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: count,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1,
          },
        };
      }

      return data as T[];
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        `Unexpected error fetching ${this.tableName} list`,
        500,
        { filters, pagination, originalError: error }
      );
    }
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to create ${this.tableName}`,
          500,
          { data, error }
        );
      }

      // Invalidate cache
      await this.invalidateCache(result.id);

      loggerService.info(`${this.tableName} created`, {
        requestId: 'repository',
        action: 'create',
        resource: this.tableName,
        metadata: { id: result.id },
      });

      return result as T;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        `Unexpected error creating ${this.tableName}`,
        500,
        { data, originalError: error }
      );
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new AppError(
            ErrorCode.NOT_FOUND,
            `${this.tableName} not found`,
            404,
            { id }
          );
        }
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to update ${this.tableName}`,
          500,
          { id, data, error }
        );
      }

      // Invalidate cache
      await this.invalidateCache(id);

      loggerService.info(`${this.tableName} updated`, {
        requestId: 'repository',
        action: 'update',
        resource: this.tableName,
        metadata: { id },
      });

      return result as T;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        `Unexpected error updating ${this.tableName}`,
        500,
        { id, data, originalError: error }
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to delete ${this.tableName}`,
          500,
          { id, error }
        );
      }

      // Invalidate cache
      await this.invalidateCache(id);

      loggerService.info(`${this.tableName} deleted`, {
        requestId: 'repository',
        action: 'delete',
        resource: this.tableName,
        metadata: { id },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        `Unexpected error deleting ${this.tableName}`,
        500,
        { id, originalError: error }
      );
    }
  }

  protected async invalidateCache(id: string): Promise<void> {
    try {
      await cacheService.del(`${this.cachePrefix}${id}`);
    } catch (error) {
      loggerService.warn("Cache invalidation failed", {
        requestId: 'repository',
        action: 'cache_invalidation_failed',
        metadata: { table: this.tableName, id },
      });
    }
  }

  protected async invalidateListCache(pattern?: string): Promise<void> {
    try {
      // In a real Redis implementation, you would use pattern matching
      // For now, we'll just flush the entire cache
      await cacheService.flush();
    } catch (error) {
      loggerService.warn("List cache invalidation failed", {
        requestId: 'repository',
        action: 'list_cache_invalidation_failed',
        metadata: { table: this.tableName, pattern },
      });
    }
  }
}

export { BaseRepository }