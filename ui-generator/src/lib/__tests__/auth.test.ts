import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock jose
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation((payload) => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
  jwtVerify: vi.fn(),
}));

// Mock next/headers cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock server-only (it throws at import time in client environments)
vi.mock("server-only", () => ({}));

import {
  createSession,
  getSession,
  deleteSession,
  verifySession,
} from "@/lib/auth";
import { SignJWT, jwtVerify } from "jose";

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSession", () => {
    test("creates a JWT token and sets it as a cookie", async () => {
      await createSession("user-123", "test@example.com");

      expect(SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          email: "test@example.com",
          expiresAt: expect.any(Date),
        })
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "auth-token",
        "mock-jwt-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          expires: expect.any(Date),
        })
      );
    });

    test("sets expiration to 7 days from now", async () => {
      const before = Date.now();
      await createSession("user-123", "test@example.com");
      const after = Date.now();

      const setCall = mockCookieStore.set.mock.calls[0];
      const expires = setCall[2].expires as Date;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs);
      expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs);
    });
  });

  describe("getSession", () => {
    test("returns session payload when valid token exists", async () => {
      const mockPayload = {
        userId: "user-123",
        email: "test@example.com",
        expiresAt: new Date(),
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: "HS256" },
      });

      const session = await getSession();

      expect(session).toEqual(mockPayload);
      expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
    });

    test("returns null when no token exists", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const session = await getSession();

      expect(session).toBeNull();
      expect(jwtVerify).not.toHaveBeenCalled();
    });

    test("returns null when token verification fails", async () => {
      mockCookieStore.get.mockReturnValue({ value: "invalid-token" });
      vi.mocked(jwtVerify).mockRejectedValue(new Error("Invalid token"));

      const session = await getSession();

      expect(session).toBeNull();
    });
  });

  describe("deleteSession", () => {
    test("deletes the auth cookie", async () => {
      await deleteSession();

      expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
    });
  });

  describe("verifySession", () => {
    test("returns session payload when request has valid token", async () => {
      const mockPayload = {
        userId: "user-123",
        email: "test@example.com",
        expiresAt: new Date(),
      };

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: "HS256" },
      });

      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          cookie: "auth-token=valid-token",
        },
      });

      const session = await verifySession(request);

      expect(session).toEqual(mockPayload);
    });

    test("returns null when request has no token", async () => {
      const request = new NextRequest("http://localhost:3000/api/test");

      const session = await verifySession(request);

      expect(session).toBeNull();
      expect(jwtVerify).not.toHaveBeenCalled();
    });

    test("returns null when token verification fails", async () => {
      vi.mocked(jwtVerify).mockRejectedValue(new Error("Expired token"));

      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          cookie: "auth-token=expired-token",
        },
      });

      const session = await verifySession(request);

      expect(session).toBeNull();
    });
  });
});
