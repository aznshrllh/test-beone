import { ObjectId } from "mongodb";
import { ZodError } from "zod";

//! Error Handling
export type CustomError = {
  message: string;
  status: number;
};

export type AppError = CustomError | Error | ZodError;

export type Product = {
  _id?: ObjectId | string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
};

export type User = {
  _id?: ObjectId | string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  loyaltyPoint?: number;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
};

export type Transaction = {
  _id?: ObjectId | string;
  userId?: ObjectId | string;
  items: Product[];
  totalPrice: number;
  loyaltyPointEarned: number;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
};
