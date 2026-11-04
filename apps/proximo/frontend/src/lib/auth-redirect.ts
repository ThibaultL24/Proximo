// src/lib/auth-redirect.ts
import type { User } from "../types";

export function homePathForRole(role: User["role"]) {
  if (role === "super_admin") return "/plateforme";
  if (role === "admin") return "/admin";
  if (role === "client") return "/espace-client";
  return "/espace-commercant";
}
