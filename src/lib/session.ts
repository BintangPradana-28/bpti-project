import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  PERMISSIONS,
  PermissionKey,
  ROLE_DEFAULT_PERMISSIONS,
  hasPermission,
} from "@/lib/rbac";

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        department: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: Sesi login diperlukan untuk melakukan tindakan ini.");
  }
  if (!user.isActive) {
    throw new Error("FORBIDDEN: Akun pengguna Anda sedang dinonaktifkan.");
  }
  return user;
}

export async function requirePermission(permission: PermissionKey) {
  const user = await requireAuth();
  const roleName = user.role?.name;

  // Aggregate explicit permissions from DB and fallback default permissions
  const explicitPermissions =
    user.role?.permissions.map((p) => p.permission.name) || [];
  const defaultPermissions = roleName
    ? ROLE_DEFAULT_PERMISSIONS[roleName] || []
    : [];
  const allPermissions = Array.from(
    new Set([...explicitPermissions, ...defaultPermissions])
  );

  if (!hasPermission(allPermissions, permission)) {
    throw new Error(
      `FORBIDDEN: Anda tidak memiliki hak akses [${permission}] untuk melakukan aksi ini.`
    );
  }

  return user;
}

export async function requireAnyPermission(permissions: PermissionKey[]) {
  const user = await requireAuth();
  const roleName = user.role?.name;

  const explicitPermissions =
    user.role?.permissions.map((p) => p.permission.name) || [];
  const defaultPermissions = roleName
    ? ROLE_DEFAULT_PERMISSIONS[roleName] || []
    : [];
  const allPermissions = Array.from(
    new Set([...explicitPermissions, ...defaultPermissions])
  );

  const granted = permissions.some((permission) =>
    hasPermission(allPermissions, permission)
  );

  if (!granted) {
    throw new Error(
      `FORBIDDEN: Anda tidak memiliki hak akses [${permissions.join(", ")}] untuk melakukan aksi ini.`
    );
  }

  return user;
}

import { redirect } from "next/navigation";

export async function requirePageAuth() {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    redirect("/login?callbackUrl=/dashboard");
  }
  return user;
}

export async function requirePagePermission(permission: PermissionKey) {
  const user = await requirePageAuth();
  const roleName = user.role?.name;

  const explicitPermissions =
    user.role?.permissions.map((p) => p.permission.name) || [];
  const defaultPermissions = roleName
    ? ROLE_DEFAULT_PERMISSIONS[roleName] || []
    : [];
  const allPermissions = Array.from(
    new Set([...explicitPermissions, ...defaultPermissions])
  );

  if (!hasPermission(allPermissions, permission)) {
    redirect("/dashboard?error=unauthorized");
  }

  return user;
}

export { PERMISSIONS };

