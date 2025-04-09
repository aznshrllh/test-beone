import { ZodError } from "zod";

//! Error Handling
export type CustomError = {
  message: string;
  status: number;
};

export type AppError = CustomError | Error | ZodError;
