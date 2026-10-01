import { AdminProjectList } from "@/app/(panel)/panel/admin/projects/admin-project-list";

export default function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <AdminProjectList searchParams={searchParams} />;
}
