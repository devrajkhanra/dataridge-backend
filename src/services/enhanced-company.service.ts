import { CompanyRepository, Company } from "../repositories/company.repository";
import { AppError, ErrorCode, PaginationParams, PaginatedResponse } from "../types/common";
import { loggerService } from "./logger.service";
import { cacheService } from "./cache.service";

export interface CreateCompanyData {
  name: string;
  logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
}

export interface UpdateCompanyData {
  name?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

export class EnhancedCompanyService {
  constructor(private companyRepository: CompanyRepository) {}

  async createCompany(
    data: CreateCompanyData,
    userId: string,
    requestId: string
  ): Promise<Company> {
    try {
      loggerService.info("Creating company", {
        requestId,
        userId,
        action: 'create_company',
        metadata: { name: data.name },
      });

      // Check if company name already exists
      const nameExists = await this.companyRepository.checkNameExists(data.name);
      if (nameExists) {
        throw new AppError(
          ErrorCode.CONFLICT,
          "Company name already exists",
          409,
          { name: data.name }
        );
      }

      // Check if email already exists
      const emailExists = await this.companyRepository.findByEmail(data.contact_email);
      if (emailExists) {
        throw new AppError(
          ErrorCode.CONFLICT,
          "Company with this email already exists",
          409,
          { email: data.contact_email }
        );
      }

      const company = await this.companyRepository.create({
        ...data,
        user_id: userId,
      });

      // Invalidate user's company list cache
      await cacheService.del(`user_companies:${userId}`);

      loggerService.info("Company created successfully", {
        requestId,
        userId,
        action: 'company_created',
        metadata: { companyId: company.id, name: company.name },
      });

      return company;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      loggerService.error("Failed to create company", error as Error, {
        requestId,
        userId,
        action: 'create_company_failed',
        metadata: { name: data.name },
      });

      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to create company",
        500,
        { originalError: error }
      );
    }
  }

  async getCompanyById(
    id: string,
    userId: string,
    requestId: string
  ): Promise<Company> {
    try {
      const company = await this.companyRepository.findById(id);
      
      if (!company) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          "Company not found",
          404,
          { id }
        );
      }

      // Check if user has access to this company
      if (company.user_id !== userId) {
        throw new AppError(
          ErrorCode.AUTHORIZATION_ERROR,
          "Access denied to this company",
          403,
          { companyId: id, userId }
        );
      }

      return company;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to fetch company",
        500,
        { id, originalError: error }
      );
    }
  }

  async getCompaniesByUser(
    userId: string,
    pagination?: PaginationParams,
    requestId?: string
  ): Promise<PaginatedResponse<Company> | Company[]> {
    try {
      const cacheKey = `user_companies:${userId}`;
      
      // Try cache first for non-paginated requests
      if (!pagination) {
        const cached = await cacheService.get<Company[]>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const companies = await this.companyRepository.findAll(
        { user_id: userId },
        pagination
      );

      // Cache non-paginated results
      if (!pagination && Array.isArray(companies)) {
        await cacheService.set(cacheKey, companies, 300);
      }

      return companies;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to fetch user companies",
        500,
        { userId, originalError: error }
      );
    }
  }

  async updateCompany(
    id: string,
    data: UpdateCompanyData,
    userId: string,
    requestId: string
  ): Promise<Company> {
    try {
      loggerService.info("Updating company", {
        requestId,
        userId,
        action: 'update_company',
        metadata: { companyId: id },
      });

      // Check if company exists and user has access
      const existingCompany = await this.getCompanyById(id, userId, requestId);

      // Check if new name conflicts with existing companies
      if (data.name && data.name !== existingCompany.name) {
        const nameExists = await this.companyRepository.checkNameExists(data.name, id);
        if (nameExists) {
          throw new AppError(
            ErrorCode.CONFLICT,
            "Company name already exists",
            409,
            { name: data.name }
          );
        }
      }

      // Check if new email conflicts with existing companies
      if (data.contact_email && data.contact_email !== existingCompany.contact_email) {
        const emailExists = await this.companyRepository.findByEmail(data.contact_email);
        if (emailExists && emailExists.id !== id) {
          throw new AppError(
            ErrorCode.CONFLICT,
            "Company with this email already exists",
            409,
            { email: data.contact_email }
          );
        }
      }

      const updatedCompany = await this.companyRepository.update(id, data);

      // Invalidate caches
      await cacheService.del(`user_companies:${userId}`);

      loggerService.info("Company updated successfully", {
        requestId,
        userId,
        action: 'company_updated',
        metadata: { companyId: id },
      });

      return updatedCompany;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      loggerService.error("Failed to update company", error as Error, {
        requestId,
        userId,
        action: 'update_company_failed',
        metadata: { companyId: id },
      });

      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to update company",
        500,
        { id, originalError: error }
      );
    }
  }

  async deleteCompany(
    id: string,
    userId: string,
    requestId: string
  ): Promise<void> {
    try {
      loggerService.info("Deleting company", {
        requestId,
        userId,
        action: 'delete_company',
        metadata: { companyId: id },
      });

      // Check if company exists and user has access
      await this.getCompanyById(id, userId, requestId);

      // TODO: Check for dependent records (projects, labor, etc.)
      // This should be implemented based on business rules

      await this.companyRepository.delete(id);

      // Invalidate caches
      await cacheService.del(`user_companies:${userId}`);

      loggerService.info("Company deleted successfully", {
        requestId,
        userId,
        action: 'company_deleted',
        metadata: { companyId: id },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      loggerService.error("Failed to delete company", error as Error, {
        requestId,
        userId,
        action: 'delete_company_failed',
        metadata: { companyId: id },
      });

      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to delete company",
        500,
        { id, originalError: error }
      );
    }
  }

  async getAllCompanies(
    pagination?: PaginationParams,
    requestId?: string
  ): Promise<PaginatedResponse<Company> | Company[]> {
    try {
      return await this.companyRepository.findAll({}, pagination);
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to fetch all companies",
        500,
        { originalError: error }
      );
    }
  }
}