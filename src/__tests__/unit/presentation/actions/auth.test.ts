import {
  registerAction,
  loginAction,
  logoutAction,
} from "@/presentation/actions/auth";
import { serverContainer } from "@/services/server/server_container";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

jest.mock("@/services/server/server_container", () => ({
  serverContainer: {
    resolve: jest.fn(),
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Auth Actions", () => {
  let mockRegisterUseCase: { execute: jest.Mock };
  let mockLoginUseCase: { execute: jest.Mock };
  let mockCookieStore: { set: jest.Mock; delete: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.COOKIE_LIVE_DURATION = "86400";

    mockRegisterUseCase = { execute: jest.fn() };
    mockLoginUseCase = { execute: jest.fn() };
    mockCookieStore = { set: jest.fn(), delete: jest.fn() };

    (serverContainer.resolve as jest.Mock).mockImplementation((key: string) => {
      if (key === "registerUseCase") return mockRegisterUseCase;
      if (key === "loginUseCase") return mockLoginUseCase;
      return null;
    });

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
  });

  describe("registerAction", () => {
    it("should return validation error for invalid input", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "123"); // Too short

      const result = await registerAction(null, formData);

      expect(result).toHaveProperty("error");
      expect(mockRegisterUseCase.execute).not.toHaveBeenCalled();
    });

    it("should register successfully and redirect", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      mockRegisterUseCase.execute.mockResolvedValue(undefined);

      await registerAction(null, formData);

      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should return error if use case fails", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      mockRegisterUseCase.execute.mockRejectedValue(new Error("Email exists"));

      const result = await registerAction(null, formData);

      expect(result).toEqual({ error: "Email exists" });
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("loginAction", () => {
    it("should return validation error for invalid input", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "");

      const result = await loginAction(null, formData);

      expect(result).toHaveProperty("error");
      expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    });

    it("should login successfully, set cookie, and redirect", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      mockLoginUseCase.execute.mockResolvedValue({ token: "fake-token" });

      await loginAction(null, formData);

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "token",
        "fake-token",
        expect.objectContaining({
          httpOnly: true,
          path: "/",
        })
      );
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("should return error if use case fails", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "wrongpassword");

      mockLoginUseCase.execute.mockRejectedValue(
        new Error("Invalid credentials")
      );

      const result = await loginAction(null, formData);

      expect(result).toEqual({ error: "Invalid credentials" });
      expect(mockCookieStore.set).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("logoutAction", () => {
    it("should delete token cookie and redirect", async () => {
      await logoutAction();

      expect(mockCookieStore.delete).toHaveBeenCalledWith("token");
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});
