import { Response } from "express";

type TMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPage?: number;
};

type TResponse<T> = {
  statusCode?: number;
  success: boolean;
  message?: string;
  data?: T;
  meta?: TMeta;
};

export const sendResponse = <T>(
  res: Response,
  {
    statusCode,
    success,
    message,
    data,
    meta,
  }: TResponse<T>
) => {
  return res.status(statusCode || 200).json({
    success,
    message,
    meta,
    data,
  });
};