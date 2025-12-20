import { IUserRepository } from "../../repositories/IUserRepository";
import { User } from "../../entities/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { SignJWT } from "jose";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    credentials: z.infer<typeof loginSchema>
  ): Promise<{ token: string; user: User }> {
    const { email, password } = credentials;
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    const algorithm = process.env.JWT_PASSWORD_ALGORITHM;
    if (!algorithm) {
      throw new Error("Server configuration error");
    }
    const expireDuration = process.env.JWT_EXPIRATION_DURATION;
    if (!expireDuration) {
      throw new Error("Server configuration error");
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("Server configuration error");
    }

    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: algorithm })
      .setExpirationTime(expireDuration)
      .sign(new TextEncoder().encode(secret));

    return { token, user: userWithoutPassword as User };
  }
}
