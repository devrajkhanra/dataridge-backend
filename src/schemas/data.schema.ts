import { Type, Static } from "@sinclair/typebox";

export const DataInsertSchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  project_id: Type.String({ format: "uuid" }),
  table_name: Type.String({ minLength: 1 }),
  data: Type.Record(Type.String(), Type.Any()),
});

export const DataUpdateSchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  project_id: Type.String({ format: "uuid" }),
  table_name: Type.String({ minLength: 1 }),
  id: Type.String({ format: "uuid" }),
  data: Type.Record(Type.String(), Type.Any()),
});

export const DataQuerySchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  project_id: Type.String({ format: "uuid" }),
  table_name: Type.String({ minLength: 1 }),
  filters: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export type DataInsert = Static<typeof DataInsertSchema>;
export type DataUpdate = Static<typeof DataUpdateSchema>;
export type DataQuery = Static<typeof DataQuerySchema>;
