import { Type, Static } from "@sinclair/typebox";

export const CompanySetupSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  logo_url: Type.Optional(Type.String({ format: "uri" })),
  contact_email: Type.String({ format: "email" }),
  contact_phone: Type.Optional(Type.String({ pattern: "^[0-9-()+ ]+$" })),
  address: Type.Optional(Type.String()),
  user_schema: Type.Optional(
    Type.Array(
      Type.Object({
        table_name: Type.String({ minLength: 1 }),
        column_name: Type.String({ minLength: 1 }),
        data_type: Type.Union([
          Type.Literal("TEXT"),
          Type.Literal("INTEGER"),
          Type.Literal("NUMERIC"),
          Type.Literal("BOOLEAN"),
          Type.Literal("TIMESTAMP"),
          Type.Literal("DATE"),
          Type.Literal("JSONB"),
          Type.Literal("TEXT[]"),
          Type.Literal("UUID"),
        ]),
        is_required: Type.Boolean({ default: false }),
        constraints: Type.Optional(Type.Array(Type.String())),
      })
    )
  ),
});

export const DynamicUserAddSchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  user_id: Type.String({ format: "uuid" }),
  data: Type.Record(Type.String(), Type.Any()),
});

export const DynamicUserQuerySchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  filters: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export type CompanySetup = Static<typeof CompanySetupSchema>;
export type DynamicUserAdd = Static<typeof DynamicUserAddSchema>;
export type DynamicUserQuery = Static<typeof DynamicUserQuerySchema>;
