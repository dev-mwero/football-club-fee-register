import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  ApiError,
  badRequest,
  conflict,
  notFound,
  toErrorResponse,
  tooManyRequests,
  unauthorized,
} from "@/lib/errors";

async function readErrorResponse(response: Response): Promise<{
  success: boolean;
  error: string;
  code: string;
  details?: unknown;
}> {
  return response.json();
}

describe("ApiError", () => {
  it("infers a default code from the status code", () => {
    const error = new ApiError(409, "Conflict");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
  });

  it("keeps an explicit code", () => {
    const error = new ApiError(409, "Already invited", "PENDING_INVITE_EXISTS");
    expect(error.code).toBe("PENDING_INVITE_EXISTS");
  });
});

describe("convenience constructors", () => {
  it("builds descriptive errors", () => {
    expect(badRequest("Bad").statusCode).toBe(400);
    expect(unauthorized().code).toBe("UNAUTHORIZED");
    expect(notFound("Gone").code).toBe("NOT_FOUND");
    expect(conflict("Taken").code).toBe("CONFLICT");
    expect(tooManyRequests("Slow").statusCode).toBe(429);
  });
});

describe("toErrorResponse", () => {
  it("preserves ApiError status, message and code", async () => {
    const response = toErrorResponse(
      conflict("A pending invitation already exists for this email"),
      "test",
    );
    expect(response.status).toBe(409);
    const body = await readErrorResponse(response);
    expect(body.success).toBe(false);
    expect(body.error).toContain("pending invitation");
    expect(body.code).toBe("CONFLICT");
  });

  it("maps Zod errors to 422 with field details", async () => {
    const result = z.object({ email: z.string().email() }).safeParse({
      email: "not-an-email",
    });
    const response = toErrorResponse(result.error, "test");
    expect(response.status).toBe(422);
    const body = await readErrorResponse(response);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.details).toHaveProperty("email");
  });

  it("maps invalid JSON to 400", async () => {
    const response = toErrorResponse(
      new SyntaxError("Unexpected end of JSON input"),
      "test",
    );
    expect(response.status).toBe(400);
    const body = await readErrorResponse(response);
    expect(body.code).toBe("INVALID_JSON");
  });

  it("maps duplicate key errors to 409", async () => {
    const response = toErrorResponse(
      { name: "MongoServerError", code: 11000, keyValue: { email: "a@b.com" } },
      "test",
    );
    expect(response.status).toBe(409);
    const body = await readErrorResponse(response);
    expect(body.code).toBe("DUPLICATE_KEY");
    expect(body.error).toContain("email");
  });

  it("maps cast errors to 400", async () => {
    const response = toErrorResponse(
      { name: "CastError", path: "_id" },
      "test",
    );
    expect(response.status).toBe(400);
    const body = await readErrorResponse(response);
    expect(body.code).toBe("INVALID_VALUE");
  });

  it("hides internal details for unknown errors but still maps to 500", async () => {
    const response = toErrorResponse(
      new Error("db connection refused"),
      "test",
    );
    expect(response.status).toBe(500);
    const body = await readErrorResponse(response);
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body.error).toBe("Internal server error");
  });

  it("returns success:false on every error response", async () => {
    const response = toErrorResponse(badRequest("Nope"), "test");
    const body = await readErrorResponse(response);
    expect(body.success).toBe(false);
  });
});
