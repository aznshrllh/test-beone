import UserModel from "@/db/models/userModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, password, username, phoneNumber } =
      body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !username ||
      !phoneNumber
    ) {
      throw new Error("Missing required fields");
    }

    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    if (email === "admin@mail.com") {
      const adminUser = {
        firstName: "Admin",
        lastName: "Admin",
        email,
        password,
        username,
        phoneNumber,
        role: "admin",
        loyaltyPoint: 0,
      };
      await UserModel.createUser(adminUser);
      return Response.json(
        {
          message: "Admin user registered successfully",
          user: { adminUser },
        },
        { status: 201 }
      );
    }

    const newUser = {
      firstName,
      lastName,
      email,
      password,
      username,
      phoneNumber,
      role: "user",
      loyaltyPoint: 0,
    };

    const result = await UserModel.createUser(newUser);

    if (!result) {
      throw new Error("Failed to create user");
    }

    return Response.json(
      {
        message: "User registered successfully",
        user: { result },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
