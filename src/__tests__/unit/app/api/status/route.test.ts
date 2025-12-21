/**
 * @jest-environment node
 */
import { GET } from "@/app/api/status/route";
import { db } from "@/data/db";
import { NextRequest } from "next/server";

// Mock the database
jest.mock("@/data/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

describe("GET /api/status", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALLOW_PUBLIC_HEALTH_CHECK = "false";
    process.env.NEXT_PUBLIC_APP_VERSION = "1.0.0";
    process.env.NEXT_PUBLIC_COMMIT_HASH = "abc1234";
    process.env.NEXT_PUBLIC_BUILD_TIME = "2024-01-01T00:00:00.000Z";
  });

  const createMockRequest = (ip: string, forwardedFor?: string) => {
    const headers = new Headers();
    if (forwardedFor) {
      headers.set("x-forwarded-for", forwardedFor);
    }
    
    // We need to mock the `ip` property which is not directly settable on NextRequest
    // but the code accesses it via (req as any).ip
    const req = new NextRequest("http://localhost/api/status", {
      headers,
    });
    
    Object.defineProperty(req, "ip", {
      value: ip,
      configurable: true,
    });

    return req;
  };

  it("should return 403 if accessed from public IP and public check is disabled", async () => {
    mockRequest = createMockRequest("8.8.8.8");
    
    const response = await GET(mockRequest);
    
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({
      error: "Forbidden: Access restricted to internal network.",
    });
  });

  it("should return 200 if accessed from localhost", async () => {
    mockRequest = createMockRequest("127.0.0.1");
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await GET(mockRequest);
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.services.database).toBe("connected");
    expect(body.build).toEqual({
      version: "1.0.0",
      commit: "abc1234",
      time: "2024-01-01T00:00:00.000Z",
    });
  });

  it("should return 200 if accessed from private IP (10.x.x.x)", async () => {
    mockRequest = createMockRequest("10.0.0.5");
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await GET(mockRequest);
    
    expect(response.status).toBe(200);
  });

  it("should return 200 if ALLOW_PUBLIC_HEALTH_CHECK is true", async () => {
    process.env.ALLOW_PUBLIC_HEALTH_CHECK = "true";
    mockRequest = createMockRequest("8.8.8.8");
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await GET(mockRequest);
    
    expect(response.status).toBe(200);
  });

  it("should return 503 if database is disconnected", async () => {
    mockRequest = createMockRequest("127.0.0.1");
    (db.query as jest.Mock).mockRejectedValueOnce(new Error("DB Connection Failed"));

    const response = await GET(mockRequest);
    
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe("error");
    expect(body.services.database).toBe("disconnected");
    expect(body.services.error).toBe("DB Connection Failed");
  });
});
