import { EnhancedCompanyService } from '../../../src/services/enhanced-company.service';
import { CompanyRepository } from '../../../src/repositories/company.repository';
import { AppError, ErrorCode } from '../../../src/types/common';
import { cacheService } from '../../../src/services/cache.service';

// Mock dependencies
jest.mock('../../../src/repositories/company.repository');
jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/services/logger.service');

describe('EnhancedCompanyService', () => {
  let companyService: EnhancedCompanyService;
  let mockCompanyRepository: jest.Mocked<CompanyRepository>;

  beforeEach(() => {
    mockCompanyRepository = new CompanyRepository({} as any) as jest.Mocked<CompanyRepository>;
    companyService = new EnhancedCompanyService(mockCompanyRepository);
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    const mockCompanyData = {
      name: 'Test Company',
      contact_email: 'test@company.com',
      contact_phone: '+1234567890',
      address: '123 Test St',
    };

    const userId = 'user-123';
    const requestId = 'req-123';

    it('should create a company successfully', async () => {
      const expectedCompany = {
        id: 'company-123',
        ...mockCompanyData,
        user_id: userId,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockCompanyRepository.checkNameExists.mockResolvedValue(false);
      mockCompanyRepository.findByEmail.mockResolvedValue(null);
      mockCompanyRepository.create.mockResolvedValue(expectedCompany);

      const result = await companyService.createCompany(mockCompanyData, userId, requestId);

      expect(mockCompanyRepository.checkNameExists).toHaveBeenCalledWith('Test Company');
      expect(mockCompanyRepository.findByEmail).toHaveBeenCalledWith('test@company.com');
      expect(mockCompanyRepository.create).toHaveBeenCalledWith({
        ...mockCompanyData,
        user_id: userId,
      });
      expect(result).toEqual(expectedCompany);
    });

    it('should throw error if company name already exists', async () => {
      mockCompanyRepository.checkNameExists.mockResolvedValue(true);

      await expect(
        companyService.createCompany(mockCompanyData, userId, requestId)
      ).rejects.toThrow(AppError);

      await expect(
        companyService.createCompany(mockCompanyData, userId, requestId)
      ).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
        message: 'Company name already exists',
        statusCode: 409,
      });
    });

    it('should throw error if company email already exists', async () => {
      const existingCompany = {
        id: 'existing-123',
        name: 'Existing Company',
        contact_email: 'test@company.com',
        user_id: 'other-user',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockCompanyRepository.checkNameExists.mockResolvedValue(false);
      mockCompanyRepository.findByEmail.mockResolvedValue(existingCompany as any);

      await expect(
        companyService.createCompany(mockCompanyData, userId, requestId)
      ).rejects.toThrow(AppError);

      await expect(
        companyService.createCompany(mockCompanyData, userId, requestId)
      ).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
        message: 'Company with this email already exists',
        statusCode: 409,
      });
    });
  });

  describe('getCompanyById', () => {
    const companyId = 'company-123';
    const userId = 'user-123';
    const requestId = 'req-123';

    it('should return company if user has access', async () => {
      const mockCompany = {
        id: companyId,
        name: 'Test Company',
        contact_email: 'test@company.com',
        user_id: userId,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockCompanyRepository.findById.mockResolvedValue(mockCompany as any);

      const result = await companyService.getCompanyById(companyId, userId, requestId);

      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(result).toEqual(mockCompany);
    });

    it('should throw error if company not found', async () => {
      mockCompanyRepository.findById.mockResolvedValue(null);

      await expect(
        companyService.getCompanyById(companyId, userId, requestId)
      ).rejects.toThrow(AppError);

      await expect(
        companyService.getCompanyById(companyId, userId, requestId)
      ).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
        message: 'Company not found',
        statusCode: 404,
      });
    });

    it('should throw error if user does not have access', async () => {
      const mockCompany = {
        id: companyId,
        name: 'Test Company',
        contact_email: 'test@company.com',
        user_id: 'other-user',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockCompanyRepository.findById.mockResolvedValue(mockCompany as any);

      await expect(
        companyService.getCompanyById(companyId, userId, requestId)
      ).rejects.toThrow(AppError);

      await expect(
        companyService.getCompanyById(companyId, userId, requestId)
      ).rejects.toMatchObject({
        code: ErrorCode.AUTHORIZATION_ERROR,
        message: 'Access denied to this company',
        statusCode: 403,
      });
    });
  });

  describe('updateCompany', () => {
    const companyId = 'company-123';
    const userId = 'user-123';
    const requestId = 'req-123';

    const existingCompany = {
      id: companyId,
      name: 'Old Company',
      contact_email: 'old@company.com',
      user_id: userId,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    const updateData = {
      name: 'New Company',
      contact_email: 'new@company.com',
    };

    beforeEach(() => {
      mockCompanyRepository.findById.mockResolvedValue(existingCompany as any);
    });

    it('should update company successfully', async () => {
      const updatedCompany = {
        ...existingCompany,
        ...updateData,
        updated_at: '2023-01-02T00:00:00Z',
      };

      mockCompanyRepository.checkNameExists.mockResolvedValue(false);
      mockCompanyRepository.findByEmail.mockResolvedValue(null);
      mockCompanyRepository.update.mockResolvedValue(updatedCompany as any);

      const result = await companyService.updateCompany(companyId, updateData, userId, requestId);

      expect(mockCompanyRepository.checkNameExists).toHaveBeenCalledWith('New Company', companyId);
      expect(mockCompanyRepository.findByEmail).toHaveBeenCalledWith('new@company.com');
      expect(mockCompanyRepository.update).toHaveBeenCalledWith(companyId, updateData);
      expect(result).toEqual(updatedCompany);
    });

    it('should throw error if new name conflicts', async () => {
      mockCompanyRepository.checkNameExists.mockResolvedValue(true);

      await expect(
        companyService.updateCompany(companyId, updateData, userId, requestId)
      ).rejects.toThrow(AppError);

      await expect(
        companyService.updateCompany(companyId, updateData, userId, requestId)
      ).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
        message: 'Company name already exists',
        statusCode: 409,
      });
    });

    it('should throw error if new email conflicts', async () => {
      const conflictingCompany = {
        id: 'other-company',
        contact_email: 'new@company.com',
      };

      mockCompanyRepository.checkNameExists.mockResolvedValue(false);
      mockCompanyRepository.findByEmail.mockResolvedValue(conflictingCompany as any);

      await expect(
        companyService.updateCompany(companyId, updateData, userId, requestId)
      ).rejects.toThrow(AppError);

      await expect(
        companyService.updateCompany(companyId, updateData, userId, requestId)
      ).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
        message: 'Company with this email already exists',
        statusCode: 409,
      });
    });
  });
});