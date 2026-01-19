import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock server-only (it throws when imported in non-server context)
vi.mock("server-only", () => ({}));

// Mock jose
const mockJwtVerify = vi.fn();
const mockSignJWT = {
  setProtectedHeader: vi.fn().mockReturnThis(),
  setExpirationTime: vi.fn().mockReturnThis(),
  setIssuedAt: vi.fn().mockReturnThis(),
  sign: vi.fn().mockResolvedValue("mock-jwt-token"),
};

vi.mock("jose", () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
  SignJWT: vi.fn(() => mockSignJWT),
}));

// Import after mocks are set up
const { getSession, createSession, deleteSession } = await import("../auth");

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const session = await getSession();

    expect(session).toBeNull();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
  });

  it("returns null when cookie value is empty", async () => {
    mockCookieStore.get.mockReturnValue({ value: "" });

    const session = await getSession();

    expect(session).toBeNull();
  });

  it("returns session payload when valid token is present", async () => {
    const payload = {
      userId: "user-123",
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockJwtVerify.mockResolvedValue({ payload });

    const session = await getSession();

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("user-123");
    expect(session?.email).toBe("test@example.com");
    expect(mockJwtVerify).toHaveBeenCalledTimes(1);
    expect(mockJwtVerify.mock.calls[0][0]).toBe("valid-token");
  });

  it("returns null when token is invalid", async () => {
    mockCookieStore.get.mockReturnValue({ value: "invalid-token" });
    mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

    const session = await getSession();

    expect(session).toBeNull();
  });

  it("returns null when token verification throws", async () => {
    mockCookieStore.get.mockReturnValue({ value: "some-token" });
    mockJwtVerify.mockRejectedValue(new Error("JWT verification failed"));

    const session = await getSession();

    expect(session).toBeNull();
  });

  it("returns null when token is expired", async () => {
    mockCookieStore.get.mockReturnValue({ value: "expired-token" });
    mockJwtVerify.mockRejectedValue(new Error("jwt expired"));

    const session = await getSession();

    expect(session).toBeNull();
  });

  it("returns null when token signature is invalid", async () => {
    mockCookieStore.get.mockReturnValue({ value: "bad-signature-token" });
    mockJwtVerify.mockRejectedValue(new Error("signature verification failed"));

    const session = await getSession();

    expect(session).toBeNull();
  });
});

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignJWT.setProtectedHeader.mockReturnThis();
    mockSignJWT.setExpirationTime.mockReturnThis();
    mockSignJWT.setIssuedAt.mockReturnThis();
    mockSignJWT.sign.mockResolvedValue("mock-jwt-token");
  });

  it("creates a session and sets cookie with correct options", async () => {
    await createSession("user-456", "user@example.com");

    expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
    const [cookieName, token, options] = mockCookieStore.set.mock.calls[0];

    expect(cookieName).toBe("auth-token");
    expect(token).toBe("mock-jwt-token");
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.expires).toBeInstanceOf(Date);
  });

  it("sets cookie expiration to 7 days in the future", async () => {
    const now = Date.now();
    await createSession("user-456", "user@example.com");

    const [, , options] = mockCookieStore.set.mock.calls[0];
    const expiresTime = options.expires.getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    // Allow 1 second tolerance for test execution time
    expect(expiresTime).toBeGreaterThan(now + sevenDaysMs - 1000);
    expect(expiresTime).toBeLessThan(now + sevenDaysMs + 1000);
  });

  it("creates JWT with correct payload", async () => {
    const { SignJWT } = await import("jose");

    await createSession("user-789", "another@example.com");

    expect(SignJWT).toHaveBeenCalled();
    expect(mockSignJWT.setProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
    expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith("7d");
    expect(mockSignJWT.setIssuedAt).toHaveBeenCalled();
    expect(mockSignJWT.sign).toHaveBeenCalled();
  });
});

describe("deleteSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the auth cookie", async () => {
    await deleteSession();

    expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
  });
});
