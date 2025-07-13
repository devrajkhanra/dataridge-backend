import { Type, Static } from "@sinclair/typebox";

export const RoleAddSchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  role_name: Type.String({ minLength: 1 }),
  permissions: Type.Array(Type.String()),
  hierarchy_level: Type.Number({ minimum: 1 }),
});

export const RoleUpdateSchema = Type.Object({
  role_id: Type.String({ format: "uuid" }),
  role_name: Type.Optional(Type.String({ minLength: 1 })),
  permissions: Type.Optional(Type.Array(Type.String())),
  hierarchy_level: Type.Optional(Type.Number({ minimum: 1 })),
});

export const RoleQuerySchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
});

export type RoleAdd = Static<typeof RoleAddSchema>;
export type RoleUpdate = Static<typeof RoleUpdateSchema>;
export type RoleQuery = Static<typeof RoleQuerySchema>;
