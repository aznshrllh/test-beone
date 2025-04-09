import jwt from "jsonwebtoken";
import * as jose from "jose";

const jwtSecret = process.env.JWT_SECRET as string;

export function signToken(payload: {
  _id: string;
  email: string;
  role: "admin" | "user";
}) {
  return jwt.sign(payload, jwtSecret);
}

export async function verifyTokenJose<T>(token: string) {
  // Only use jose verification on the server side
  if (typeof window === "undefined") {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify<T>(token, secret);
    return payload;
  }

  // For client-side, just decode the token
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(base64)) as T;
}
