import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { hashPassword } from "better-auth/crypto";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  roleId: string;
  departmentId?: string;
  isActive?: boolean;
  actorId: string;
}

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

  /**
   * Create a new organizational user with a secure hashed credential Account,
   * role assignment, department affiliation, and audit log tracking.
   */
  static async createUser(dto: CreateUserDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error(`Email '${dto.email}' sudah terdaftar dalam sistem.`);
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
          roleId: dto.roleId,
          departmentId: dto.departmentId || null,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
          emailVerified: true,
        },
        include: {
          role: true,
          department: true,
        },
      });

      await tx.account.create({
        data: {
          accountId: newUser.id,
          providerId: "credential",
          userId: newUser.id,
          password: hashedPassword,
        },
      });

      return newUser;
    });

    await recordAudit({
      actorId: dto.actorId,
      action: "user.create",
      entity: "User",
      entityId: user.id,
      afterState: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        departmentId: user.departmentId,
        isActive: user.isActive,
      },
    });

    return user;
  }
}
