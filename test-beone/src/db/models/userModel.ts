import { z } from "zod";
import { database, connect } from "../configs/mongoDB";
import { ObjectId } from "mongodb";
import { hashPassword } from "@/helpers/bcryptjs";
import { TUser } from "@/types";

const userSchema = z.object({
  _id: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(6),
  phoneNumber: z.string().optional(),
  loyaltyPoint: z.number().optional(),
  role: z.enum(["admin", "user"]),
  isDeleted: z.boolean().optional(),
});

export default class UserModel {
  static async collection() {
    connect();
    const { db } = database();

    const collection = db.collection<TUser>("users");
    return collection;
  }

  static async createUser(userData: TUser) {
    try {
      const collection = await this.collection();

      const verifiedUser = userSchema.parse(userData);

      const newUser = {
        ...verifiedUser,
        password: hashPassword(verifiedUser.password),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      const existingUser = await this.findUserByEmail(verifiedUser.email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      const result = await collection.insertOne(newUser);
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  static async getUserById(userId: string) {
    try {
      const collection = await this.collection();
      const userObjectId = new ObjectId(userId);
      const user = await collection.findOne({ _id: userObjectId });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }
  }

  static async findUserByEmail(email: string) {
    try {
      const collection = await this.collection();

      const user = await collection.findOne({
        email,
      });

      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw new Error("Failed to find user by email");
    }
  }

  static async getAllUsers() {
    try {
      const collection = await this.collection();
      const users = await collection
        .find({
          isDeleted: false,
        })
        .project({
          password: 0,
          isDeleted: 0,
          createdAt: 0,
          updatedAt: 0,
        })
        .sort({ createdAt: -1 })
        .toArray();
      return users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch all users");
    }
  }
}
