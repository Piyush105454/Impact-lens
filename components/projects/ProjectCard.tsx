import Image from "next/image";
import Link from "next/link";
import { Droplets, Leaf, MapPin, Sun, TreePine, Recycle } from "lucide-react";
import type { Project } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn, formatPeriod, titleCase } from "@/lib/utils";

function iconFor(type: string) {
  const t = type.toLowerCase();
  if (t.includes("energy") || t.includes("solar")) return Sun;
  if (t.includes("water")) return Droplets;
  if (t.includes("forest") || t.includes("agro") || t.includes("tree")) return TreePine;
  if (t.includes("waste")) return Recycle;
  return Leaf;
}

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const Icon = iconFor(project.type);
  return (
    <Link href={`/projects/${project.id}`} className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-surface transition-colors hover:border-primary/40", className)}>
      <div className="relative aspect-[16/9] bg-surface-raised">
        {project.coverUrl ? (
          <Image src={project.coverUrl} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 field-grid flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-surface text-primary"><Icon className="h-6 w-6" /></span>
          </div>
        )}
        <Badge variant={project.status === "completed" ? "default" : "secondary"} className="absolute left-3 top-3 bg-black/60 backdrop-blur">{titleCase(project.status)}</Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted-foreground">{project.type}</p>
        <h3 className="mt-1 text-lg font-semibold leading-snug group-hover:text-primary">{project.name}</h3>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {project.location}</p>
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
