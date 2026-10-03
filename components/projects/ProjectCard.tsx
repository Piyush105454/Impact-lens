import Image from "next/image";
import Link from "next/link";
import { Droplets, Leaf, MapPin, Sun, TreePine, Recycle } from "lucide-react";
import type { MediaAsset, Project } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn, formatPeriod, titleCase } from "@/lib/utils";
import { assetSrc } from "@/lib/media-url";

function iconFor(type: string) {
  const t = type.toLowerCase();
  if (t.includes("energy") || t.includes("solar")) return Sun;
  if (t.includes("water")) return Droplets;
  if (t.includes("forest") || t.includes("agro") || t.includes("tree")) return TreePine;
  if (t.includes("waste")) return Recycle;
  return Leaf;
}

export function ProjectCard({ project, mediaAssets, className }: { project: Project; mediaAssets?: MediaAsset[]; className?: string }) {
  const Icon = iconFor(project.type);

  const beforeAsset = mediaAssets?.find((a) => a.phase === "before") ?? mediaAssets?.[0];
  const afterAsset =
    mediaAssets?.find((a) => a.phase === "after" && a.id !== beforeAsset?.id) ??
    mediaAssets?.find((a) => a.phase === "during" && a.id !== beforeAsset?.id) ??
    mediaAssets?.find((a) => a.id !== beforeAsset?.id);

  const isSplit = Boolean(beforeAsset && afterAsset && beforeAsset.id !== afterAsset.id);
  const singleAsset = !isSplit ? (beforeAsset ?? mediaAssets?.[0]) : null;

  return (
    <Link href={`/projects/${project.id}`} className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-surface transition-colors hover:border-primary/40", className)}>
      <div className="relative aspect-[16/9] bg-surface-raised overflow-hidden">
        {isSplit ? (
          <div className="grid h-full w-full grid-cols-2 divide-x-2 divide-background/80">
            <div className="relative h-full w-full bg-black/40">
              <Image src={assetSrc(beforeAsset!, { width: 600, poster: true })} alt={`Before: ${beforeAsset!.filename}`} fill sizes="25vw" className="object-cover" />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-phase-before backdrop-blur">
                Before
              </span>
            </div>
            <div className="relative h-full w-full bg-black/40">
              <Image src={assetSrc(afterAsset!, { width: 600, poster: true })} alt={`After: ${afterAsset!.filename}`} fill sizes="25vw" className="object-cover" />
              <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-phase-after backdrop-blur">
                {titleCase(afterAsset!.phase)}
              </span>
            </div>
          </div>
        ) : singleAsset ? (
          <div className="relative h-full w-full">
            <Image src={assetSrc(singleAsset, { width: 800, poster: true })} alt={singleAsset.filename} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur">
              {titleCase(singleAsset.phase)}
            </span>
          </div>
        ) : project.coverUrl ? (
          <Image src={project.coverUrl} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 field-grid flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-surface text-primary">
              <Icon className="h-6 w-6" />
            </span>
          </div>
        )}
        <Badge variant={project.status === "completed" ? "default" : "secondary"} className="absolute left-3 top-3 bg-black/60 backdrop-blur z-10">
          {titleCase(project.status)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted-foreground">{project.type}</p>
        <h3 className="mt-1 text-lg font-semibold leading-snug group-hover:text-primary">{project.name}</h3>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {project.location}
        </p>
        <p className="text-xs text-muted-foreground">{formatPeriod(project.startDate, project.endDate)}</p>
        <div className="mt-auto pt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{project.stats.mediaAssets} media assets</span>
            <span className="font-medium tabular-nums">{project.stats.analyzedPercent}% AI analyzed</span>
          </div>
          <Progress value={project.stats.analyzedPercent} label={`${project.name} AI analyzed`} />
        </div>
      </div>
    </Link>
  );
}
