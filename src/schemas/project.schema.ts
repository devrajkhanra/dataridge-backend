import { Type, Static } from "@sinclair/typebox";

export const ProjectAddSchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  name: Type.String({ minLength: 1 }),
  location: Type.Optional(Type.String()),
  project_manager_id: Type.Optional(Type.String({ format: "uuid" })),
  owner_id: Type.Optional(Type.String({ format: "uuid" })),
  tables: Type.Optional(
    Type.Array(
      Type.Object({
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
      })
    )
  ),
});

export type ProjectAdd = Static<typeof ProjectAddSchema>;
