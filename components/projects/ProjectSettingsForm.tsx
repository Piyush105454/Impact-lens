"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { api } from "@/lib/client-api";
import { ProjectFields, type ProjectFormValues } from "./NewProjectForm";

export function ProjectSettingsForm({ project }: { project: Project }) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>({
    name: project.name,
    type: project.type,
    location: project.location,
    startDate: project.startDate,
    endDate: project.endDate,
    description: project.description,
    focusActivity: project.focusActivity,
    status: project.status,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api<Project>(`/api/projects/${project.id}`, { method: "PUT", json: values });
      toast.success("Project settings saved");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await api(`/api/projects/${project.id}`, { method: "DELETE" });
      toast.success("Project deleted", { description: project.name });
      router.push("/projects");
      router.refresh();
    } catch (err) {
      toast.error("Could not delete project", { description: err instanceof Error ? err.message : undefined });
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
      <form onSubmit={save} className="rounded-3xl border bg-surface p-6 sm:p-8">
        <h2 className="mb-6 text-xl font-semibold">Project details</h2>
        <ProjectFields values={values} onChange={setValues} errors={error} showStatus />
        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Save changes</Button>
        </div>
      </form>
      <div className="h-fit rounded-3xl border border-destructive/30 bg-surface p-6">
        <h2 className="text-lg font-semibold">Delete project</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Removes the project, its media records, AI analysis and reports from the workspace. Original files remain in Cloudinary.</p>
        <Button variant="destructive" className="mt-5" onClick={() => setConfirm(true)}><Trash2 /> Delete project</Button>
      </div>
      <Sheet open={confirm} onOpenChange={setConfirm}>
        <SheetContent side="center">
          <SheetTitle className="text-lg font-semibold">Delete {project.name}?</SheetTitle>
          <SheetDescription className="mt-2 text-sm text-muted-foreground">This can&apos;t be undone.</SheetDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={remove} disabled={deleting}>{deleting && <Loader2 className="animate-spin" />} Delete project</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
