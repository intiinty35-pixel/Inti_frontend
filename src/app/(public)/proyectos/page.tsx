import { redirect } from "next/navigation";

export default function ProjectsPage() {
  redirect("/propiedades?operation=buy&type=projects");
}
