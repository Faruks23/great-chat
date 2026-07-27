import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { catchAsync } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/ApiResponse";

/**
 * ==========================================
 * POST /auth/login
 * User Login
 * ==========================================
 */
export const login = catchAsync(async (req, res) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    success: true,
    message: "Login successful",
    data: result,
  });
});

/**
 * ==========================================
 * POST /auth/register
 * Register New User
 * ==========================================
 */
export const register = catchAsync(async (req, res) => {
  const result = await AuthService.register(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Registration successful",
    data: result,
  });
});

/**
 * ==========================================
 * POST /auth/refresh
 * Generate New Access Token
 * ==========================================
 */
export const refresh = catchAsync(async (req, res) => {
  const result = await AuthService.refresh(req.body);

  sendResponse(res, {
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
});
