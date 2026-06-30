"use server";

import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/schema";
import { signIn, auth } from "@/lib/auth";

export async function getSessionUser() {
  const session = await auth();
  return session?.user || null;
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validation
  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (name.trim().length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  if (!email.includes("@") || !email.includes(".")) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  await dbConnect();

  // Check if user already exists
  const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    // Auto-sign in after registration
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    return { success: true };
  } catch {
    return { error: "Invalid email or password." };
  }
}
