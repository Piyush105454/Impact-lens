import { redirect } from "next/navigation";
import { PRIMARY_DEMO_PROJECT_ID } from "@/lib/demo/demoProjects";
import { listFeaturedProjects } from "@/services/projects";

export default async function SearchRedirect({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [first] = await listFeaturedProjects();
  const id = first?.id ?? PRIMARY_DEMO_PROJECT_ID;
  redirect(`/projects/${id}/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}
