import UserModel from "@/db/models/userModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

export async function GET() {
  try {
    const user = await UserModel.getAllUsers();

    if (!user) {
      throw new Error("User not found");
    }

    return Response.json(
      {
        message: "User retrieved successfully",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
