import { IUserRepository } from "../../repositories/IUserRepository";
import { User } from "../../entities/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: z.infer<typeof registerSchema>): Promise<User> {
    const validatedData = registerSchema.parse(data);

    const existingUser = await this.userRepository.findByEmail(
      validatedData.email
    );
    if (existingUser) {
      throw new Error("User already exists");
    }
    const passwordSalt = process.env.PASSWORD_SALT_ROUNDS;
    if (!passwordSalt) {
      throw new Error("Server configuration error");
    }
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      parseInt(passwordSalt)
    );

    return this.userRepository.create({
      email: validatedData.email,
      password: hashedPassword,
    });
  }
}
