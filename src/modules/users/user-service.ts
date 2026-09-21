import { prisma } from "@/lib/prisma";

export class UserService {
  /**
   * Fetch all users with role, department, and counts of assignments and
   * sessions for the user management dashboard.
   */
  static async getUsers(options?: {
    search?: string;
    roleId?: string;
    isActive?: boolean;
  }) {
    return prisma.user.findMany({
      where: {
        ...(options?.search
          ? {
              OR: [
                { name: { contains: options.search } },
                { email: { contains: options.search } },
              ],
            }
          : {}),
        ...(options?.roleId ? { roleId: options.roleId } : {}),
        ...(options?.isActive !== undefined
          ? { isActive: options.isActive }
          : {}),
      },
      include: {
        role: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            assignedAssets: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetch all roles with their permission counts for the roles table.
   */
  static async getRoles() {
    return prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}
