import { Type, Static } from "@sinclair/typebox";

export const SchemaAddSchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  project_id: Type.String({ format: "uuid" }),
  table_name: Type.String({ minLength: 1 }),
  columns: Type.Array(
    Type.Object({
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
  ),
});

export type SchemaAdd = Static<typeof SchemaAddSchema>;
