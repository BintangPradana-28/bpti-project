import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Users, Shield, Laptop, CheckCircle2, XCircle } from "lucide-react";
import { UserService } from "@/modules/users/user-service";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { UserModal } from "@/components/modals/user-modal";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  type UserType = Awaited<ReturnType<typeof UserService.getUsers>>[number];
  type RoleType = Awaited<ReturnType<typeof UserService.getRoles>>[number];

  let users: UserType[] = [];
  let roles: RoleType[] = [];
  let departments: Array<{ id: string; name: string; code: string }> = [];

  try {
    const [usersRes, rolesRes, departmentsRes] = await Promise.all([
      UserService.getUsers(),
      UserService.getRoles(),
      prisma.department.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    ]);
    users = usersRes;
    roles = rolesRes;
    departments = departmentsRes;
  } catch {
    users = [];
    roles = [];
    departments = [];
  }

  const activeUsersCount = users.filter((u) => u.isActive).length;
  const totalAssetsHeld = users.reduce((sum, u) => sum + (u._count?.assignedAssets || 0), 0);

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case "SUPER_ADMIN":
        return <Badge variant="destructive">Super Admin</Badge>;
      case "INVENTORY_ADMIN":
        return <Badge variant="warning">Inventory Admin</Badge>;
      case "IT_STAFF":
        return <Badge variant="default">IT Staff</Badge>;
      case "MANAGER":
        return <Badge variant="secondary">Manager</Badge>;
      case "AUDITOR":
        return <Badge variant="outline" className="border-purple-500/30 text-purple-400">Auditor</Badge>;
      case "VIEWER":
        return <Badge variant="outline" className="text-slate-400">Viewer</Badge>;
      default:
        return <Badge variant="outline">{roleName || "No Role"}</Badge>;
    }
  };

  return (
    <AppShell
      title="Pengguna & Hak Akses"
      subtitle="Daftar akun pengguna sistem, penugasan peran (RBAC), dan keanggotaan departemen"
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Total Akun
              </CardTitle>
              <Users className="h-4 w-4 text-sky-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <p className="text-xs text-slate-400 mt-1">Pengguna terdaftar di sistem</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Pengguna Aktif
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeUsersCount}</div>
              <p className="text-xs text-slate-400 mt-1">Akses login aktif</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Peran Sistem
              </CardTitle>
              <Shield className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{roles.length}</div>
              <p className="text-xs text-slate-400 mt-1">Definisi peran hak akses (RBAC)</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Pemegang Aset
              </CardTitle>
              <Laptop className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalAssetsHeld}</div>
              <p className="text-xs text-slate-400 mt-1">Total aset yang sedang dipegang</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Daftar Akun: <span className="font-bold text-white">{users.length} pengguna</span>
          </div>

          <div className="flex items-center gap-2">
            <UserModal roles={roles} departments={departments} />
          </div>
        </div>

        {/* Users Master Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-400" />
              Direktori Pengguna & Departemen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profil Pengguna</TableHead>
                  <TableHead>Peran Sistem</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead className="text-right">Aset Dipegang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terdaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada akun pengguna terdaftar.
                      <p className="text-xs text-slate-500 mt-1">
                        Klik tombol &ldquo;Invite User&rdquo; di atas untuk mengundang pengguna baru.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role?.name)}</TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {user.department ? `${user.department.name} (${user.department.code})` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-cyan-400">
                        {user._count?.assignedAssets || 0}
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <XCircle className="h-3.5 w-3.5" />
                            Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {formatDate(user.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Roles & Security Permissions Matrix */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              Role-Based Access Control (RBAC) Definitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No roles defined in the database.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {role.name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {role._count?.users || 0} users
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {role.description || "Configured RBAC role"}
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Permissions Assigned</span>
                      <span className="font-mono text-sky-400 font-medium">
                        {role._count?.permissions || 0} permissions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
