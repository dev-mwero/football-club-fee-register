import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code ?? getDefaultCode(statusCode);
    this.details = details;
  }
}

export function badRequest(message: string, code?: string, details?: unknown) {
  return new ApiError(400, message, code, details);
}

export function unauthorized(message: string = "Authentication required") {
  return new ApiError(401, message, "UNAUTHORIZED");
}

export function forbidden(
  message: string = "You do not have permission to do this",
) {
  return new ApiError(403, message, "FORBIDDEN");
}

export function notFound(message: string, code?: string) {
  return new ApiError(404, message, code ?? "NOT_FOUND");
}

export function conflict(message: string, code?: string) {
  return new ApiError(409, message, code ?? "CONFLICT");
}

export function tooManyRequests(message: string) {
  return new ApiError(429, message, "TOO_MANY_REQUESTS");
}

function getDefaultCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_ERROR";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 502:
      return "BAD_GATEWAY";
    default:
      return "INTERNAL_ERROR";
  }
}

interface ErrorDetails {
  name?: string;
  code?: string | number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, unknown>;
  path?: string;
  value?: unknown;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ApiError(
      422,
      "Validation failed",
      "VALIDATION_ERROR",
      error.flatten().fieldErrors,
    );
  }

  if (error instanceof SyntaxError) {
    return new ApiError(
      400,
      "The request body contains invalid JSON",
      "INVALID_JSON",
    );
  }

  const details = error as ErrorDetails;

  if (
    details?.code === 11000 ||
    details?.name === "MongoServerError" ||
    details?.name === "MongoBulkWriteError"
  ) {
    const field = details.keyValue
      ? Object.keys(details.keyValue).join(", ")
      : "value";
    return new ApiError(
      409,
      `A record with this ${field} already exists`,
      "DUPLICATE_KEY",
      details.keyValue,
    );
  }

  if (details?.name === "ValidationError") {
    return new ApiError(
      422,
      "The provided data is invalid",
      "DATABASE_VALIDATION_ERROR",
      details.errors,
    );
  }

  if (details?.name === "CastError") {
    return new ApiError(
      400,
      details.path
        ? `Invalid ${details.path} value provided`
        : "Invalid identifier provided",
      "INVALID_VALUE",
    );
  }

  return new ApiError(500, "Internal server error", "INTERNAL_ERROR");
}

export function toErrorResponse(
  error: unknown,
  context?: string,
): NextResponse {
  const apiError = toApiError(error);
  const errorDetails =
    error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : error;

  if (apiError.statusCode >= 500) {
    logger.error(apiError.message, {
      code: apiError.code,
      context,
      error: errorDetails,
    });
  } else {
    logger.warn(apiError.message, {
      code: apiError.code,
      statusCode: apiError.statusCode,
      context,
      error: errorDetails,
    });
  }

  const body: {
    success: false;
    error: string;
    code: string;
    details?: unknown;
  } = {
    success: false,
    error: apiError.message,
    code: apiError.code,
  };

  if (apiError.details !== undefined) {
    body.details = apiError.details;
  }

  return NextResponse.json(body, { status: apiError.statusCode });
}
