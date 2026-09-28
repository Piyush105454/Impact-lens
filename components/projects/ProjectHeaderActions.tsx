"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import type { MediaAsset } from "@/types";
import { Button } from "@/components/ui/button";
import { UploadMediaDialog } from "@/components/media/UploadMediaDialog";

export function ProjectHeaderActions({ projectId, projectName, sampleAssets }: { projectId: string; projectName: string; sampleAssets: MediaAsset[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}><Upload /> Upload Media</Button>
      <Button asChild><Link href={`/projects/${projectId}/report`}><FileText /> Generate Report</Link></Button>
      <UploadMediaDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
        projectName={projectName}
        sampleAssets={sampleAssets}
        onUploaded={(a) => {
          router.refresh();
          if (a[0]?.source === "cloudinary") toast.message("Added to media library", { action: { label: "View", onClick: () => router.push(`/projects/${projectId}/media`) } });
        }}
      />
    </>
  );
}
