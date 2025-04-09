import UserModel from "@/db/models/userModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") as string;
    const user = await UserModel.getUserById(userId);

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
