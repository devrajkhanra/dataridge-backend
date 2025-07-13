import { Type, Static } from "@sinclair/typebox";

export const UserRegisterSchema = Type.Object({
  company_id: Type.String({ format: "uuid" }),
  role_id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
});

export const UserLoginSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
});

export const UserVerifyOTPSchema = Type.Object({
  email: Type.String({ format: "email" }),
  otp: Type.String({ minLength: 6, maxLength: 6 }),
  purpose: Type.Union([
    Type.Literal("password_reset"),
    Type.Literal("user_validation"),
  ]),
});

export type UserRegister = Static<typeof UserRegisterSchema>;
export type UserLogin = Static<typeof UserLoginSchema>;
export type UserVerifyOTP = Static<typeof UserVerifyOTPSchema>;
