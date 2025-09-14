import { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../../plugins/db";
import { User } from "../../user/models/user.model";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };
  if (!email || !password) {
    return reply
      .status(400)
      .send({ message: "Email and password are required." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );
    const user: User = result.rows[0];
    return reply.status(201).send({ id: user.id, email: user.email });
  } catch (err: any) {
    if (err.code === "23505") {
      return reply.status(409).send({ message: "Email already exists." });
    }
    return reply.status(500).send({ message: "Registration failed." });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };
  if (!email || !password) {
    return reply
      .status(400)
      .send({ message: "Email and password are required." });
  }
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user: User = result.rows[0];
  if (!user) {
    return reply.status(401).send({ message: "Invalid credentials." });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return reply.status(401).send({ message: "Invalid credentials." });
  }
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  reply.setCookie("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/token/refresh",
  });
  return reply.send({ accessToken });
}
