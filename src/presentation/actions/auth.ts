"use server";

import { serverContainer } from "@/services/server/server_container";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function registerAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = registerSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    const registerUseCase = serverContainer.resolve("registerUseCase");
    await registerUseCase.execute({ email, password });
  } catch (err) {
    return { error: (err as Error).message };
  }

  redirect("/login");
}

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    const loginUseCase = serverContainer.resolve("loginUseCase");
    const { token } = await loginUseCase.execute({ email, password });
    const cookieLivetime = process.env.COOKIE_LIVE_DURATION;
    if (!cookieLivetime) {
      throw new Error("Configuration error");
    }

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: parseInt(cookieLivetime), // default 1 day
      path: "/",
    });
  } catch (err) {
    return { error: (err as Error).message };
  }

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}
