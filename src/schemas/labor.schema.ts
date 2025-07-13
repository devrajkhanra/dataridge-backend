import { Type, Static } from "@sinclair/typebox";

export const LaborAddSchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  project_id: Type.String({ format: "uuid" }),
  user_id: Type.Optional(Type.String({ format: "uuid" })),
  first_name: Type.String({ minLength: 1 }),
  last_name: Type.String({ minLength: 1 }),
  employee_id: Type.String({ pattern: "^[A-Z0-9-]+$" }),
  pf_number: Type.Optional(Type.String({ pattern: "^[A-Z0-9/]+$" })),
  esi_number: Type.Optional(Type.String({ pattern: "^[0-9-]+$" })),
  designation: Type.String({ minLength: 1 }),
  contact_number: Type.Optional(Type.String({ pattern: "^[0-9-()+ ]+$" })),
  emergency_contact: Type.Optional(Type.String({ pattern: "^[0-9-()+ ]+$" })),
  address: Type.Optional(Type.String()),
  date_of_birth: Type.Optional(Type.String({ format: "date" })),
  joining_date: Type.String({ format: "date" }),
  training_records: Type.Optional(Type.Record(Type.String(), Type.String())),
  status: Type.Optional(
    Type.Union(
      [
        Type.Literal("active"),
        Type.Literal("inactive"),
        Type.Literal("terminated"),
      ],
      { default: "active" }
    )
  ),
});

export const LaborUpdateSchema = Type.Object({
  labor_id: Type.String({ format: "uuid" }),
  first_name: Type.Optional(Type.String({ minLength: 1 })),
  last_name: Type.Optional(Type.String({ minLength: 1 })),
  pf_number: Type.Optional(Type.String({ pattern: "^[A-Z0-9/]+$" })),
  esi_number: Type.Optional(Type.String({ pattern: "^[0-9-]+$" })),
  designation: Type.Optional(Type.String({ minLength: 1 })),
  contact_number: Type.Optional(Type.String({ pattern: "^[0-9-()+ ]+$" })),
  emergency_contact: Type.Optional(Type.String({ pattern: "^[0-9-()+ ]+$" })),
  address: Type.Optional(Type.String()),
  date_of_birth: Type.Optional(Type.String({ format: "date" })),
  training_records: Type.Optional(Type.Record(Type.String(), Type.String())),
  status: Type.Optional(
    Type.Union([
      Type.Literal("active"),
      Type.Literal("inactive"),
      Type.Literal("terminated"),
    ])
  ),
});

export const LaborQuerySchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  project_id: Type.String({ format: "uuid" }),
  filters: Type.Optional(
    Type.Object({
      employee_id: Type.Optional(Type.String()),
      designation: Type.Optional(Type.String({ minLength: 1 })),
      status: Type.Optional(
        Type.Union([
          Type.Literal("active"),
          Type.Literal("inactive"),
          Type.Literal("terminated"),
        ])
      ),
    })
  ),
});

export type LaborAdd = Static<typeof LaborAddSchema>;
export type LaborUpdate = Static<typeof LaborUpdateSchema>;
export type LaborQuery = Static<typeof LaborQuerySchema>;
