"use server";

import { revalidatePath } from "next/cache";
import { UserService } from "@/modules/users/user-service";
import { createUserSchema, CreateUserInput } from "@/lib/validations/user";
import { requirePermission, PERMISSIONS } from "@/lib/session";

export async function createUserAction(input: CreateUserInput) {
  try {
    const actor = await requirePermission(PERMISSIONS.USER_MANAGE);
    const validated = createUserSchema.parse(input);

    const user = await UserService.createUser({
      ...validated,
      actorId: actor.id,
    });

    revalidatePath("/users");
    revalidatePath("/assignments");
    revalidatePath("/audit");
    revalidatePath("/dashboard");

    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan pengguna baru.",
    };
  }
}
