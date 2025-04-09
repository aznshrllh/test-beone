import UserModel from "@/db/models/userModel";
import { comparePassword } from "@/helpers/bcryptjs";
import errorHandler from "@/helpers/errorHandler";
import { signToken } from "@/helpers/jwt";
import { AppError } from "@/types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      throw { message: "Missing required fields", status: 400 };
    }

    const existingUser = await UserModel.findUserByEmail(email);

    if (!existingUser) {
      throw { message: "Invalid email or password", status: 401 };
    }

    const isPasswordMatch = comparePassword(password, existingUser.password);

    if (!isPasswordMatch) {
      throw { message: "Invalid email or password", status: 401 };
    }

    const access_token = signToken({
      _id: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role?.toString() as "admin" | "user",
    });

    console.log("Access Token from api login:", access_token);

    const response = NextResponse.json(
      { message: "Login successful", access_token },
      { status: 200 }
    );

    const cookieStore = await cookies();
    cookieStore.set({ name: "authorization", value: `Bearer ${access_token}` });

    return response;
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
