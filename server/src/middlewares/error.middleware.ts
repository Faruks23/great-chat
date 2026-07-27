// import { Request, Response, NextFunction } from 'express';

// export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
//   console.error(err);
//   res.status(500).json({ message: err.message || 'Internal server error' });
// }


import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/errors/AppError";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}