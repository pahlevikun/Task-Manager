import { LoginUseCase } from "@/domain/use-cases/auth/LoginUseCase";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { User } from "@/domain/entities/User";
import bcrypt from "bcryptjs";

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));
jest.mock("jose", () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mock-token"),
  })),
}));

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    loginUseCase = new LoginUseCase(
      mockUserRepository as unknown as IUserRepository
    );
    jest.clearAllMocks();
  });

  it("should return user and token when credentials are valid", async () => {
    const mockUser: User = {
      id: "123",
      email: "test@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await loginUseCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.token).toBe("mock-token");
    expect(result.user.id).toBe("123");
    expect(result.user.email).toBe("test@example.com");
    expect(result.user).not.toHaveProperty("password");
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
  });

  it("should throw error when user not found", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw error when password invalid", async () => {
    const mockUser: User = {
      id: "123",
      email: "test@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      loginUseCase.execute({
        email: "test@example.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should use default secret if JWT_SECRET is not set", async () => {
    delete process.env.JWT_SECRET;

    const mockUser: User = {
      id: "123",
      email: "test@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    await expect(
      loginUseCase.execute({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Invalid credentials");
  });
});
