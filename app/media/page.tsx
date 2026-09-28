import type { Metadata } from "next";
import { getRepository } from "@/services/repository";
import { MediaGallery } from "@/components/media/MediaGallery";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaLibraryPage() {
  const repo = getRepository();
  const [media, projects, stats] = await Promise.all([repo.listMedia(), repo.listProjects(), repo.getDashboardStats()]);
  const names = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  return (
    <>
      <PageHeader title="Media library" description="Field photos and videos across every project, with AI analysis and source asset references." />
      <MediaGallery assets={media} totalCount={stats.mediaAssets} projectNames={names} />
    </>
  );
}
