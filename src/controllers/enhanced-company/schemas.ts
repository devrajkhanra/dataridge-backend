import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&.]+$/, "Company name contains invalid characters"),
  logo_url: z.string()
    .url("Invalid logo URL")
    .optional()
    .or(z.literal("")),
  contact_email: z.string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  contact_phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updateCompanySchema = z.object({
  name: z.string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&.]+$/, "Company name contains invalid characters")
    .optional(),
  logo_url: z.string()
    .url("Invalid logo URL")
    .optional()
    .or(z.literal("")),
  contact_email: z.string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .optional(),
  contact_phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export const companyParamsSchema = z.object({
  id: z.string()
    .uuid("Invalid company ID format"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),
  limit: z.coerce.number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  sortBy: z.string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid sort field")
    .optional(),
  sortOrder: z.enum(["asc", "desc"])
    .default("desc"),
}).partial();

// Schema for company user schema operations
export const companyUserSchemaSchema = z.object({
  id: z.string()
    .uuid()
    .default(() => crypto.randomUUID()),
  company_id: z.string()
    .uuid("Invalid company ID")
    .default("default"),
  table_name: z.string()
    .min(1, "Table name is required")
    .max(63, "Table name too long")
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Invalid table name format"),
  column_name: z.string()
    .min(1, "Column name is required")
    .max(63, "Column name too long")
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Invalid column name format"),
  data_type: z.enum([
    "TEXT",
    "INTEGER",
    "NUMERIC",
    "BOOLEAN",
    "TIMESTAMP",
    "DATE",
    "JSONB",
    "TEXT[]",
    "UUID",
  ]),
  is_required: z.boolean(),
  constraints: z.array(z.string()).optional(),
  status: z.enum(["active", "pending_removal"]).default("active"),
  created_at: z.string().default(() => new Date().toISOString()),
  updated_at: z.string().default(() => new Date().toISOString()),
});