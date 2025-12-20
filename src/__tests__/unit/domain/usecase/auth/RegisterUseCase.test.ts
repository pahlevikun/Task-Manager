import { RegisterUseCase } from "@/domain/use-cases/auth/RegisterUseCase";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { User } from "@/domain/entities/User";

describe("RegisterUseCase", () => {
  let registerUseCase: RegisterUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    registerUseCase = new RegisterUseCase(mockUserRepository);
  });

  it("should register a new user successfully", async () => {
    const email = "test@example.com";
    const password = "password123";
    const hashedPassword = "hashed_password";
    const newUser: User = {
      id: "1",
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(newUser);

    const result = await registerUseCase.execute({ email, password });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(result).toEqual(newUser);
  });

  it("should throw an error if email is already registered", async () => {
    const email = "test@example.com";
    const password = "password123";
    const existingUser: User = {
      id: "1",
      email,
      password: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(registerUseCase.execute({ email, password })).rejects.toThrow(
      "User already exists"
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
