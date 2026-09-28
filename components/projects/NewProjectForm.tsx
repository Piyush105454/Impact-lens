"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/client-api";

export const PROJECT_TYPES = ["Environmental Restoration", "Renewable Energy", "Water & Sanitation", "Waste Management", "Forestry & Biodiversity", "Agriculture & Livelihoods", "Education", "Health"];

export interface ProjectFormValues {
  name: string;
  type: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  focusActivity: string;
  status?: Project["status"];
}

export function ProjectFields({ values, onChange, errors, showStatus }: { values: ProjectFormValues; onChange: (v: ProjectFormValues) => void; errors?: string | null; showStatus?: boolean }) {
  const set = (k: keyof ProjectFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange({ ...values, [k]: e.target.value });
  return (
    <div className="grid gap-5">
      <div>
        <Label htmlFor="name" className="mb-1.5 block text-sm">Project name</Label>
        <Input id="name" required minLength={3} value={values.name} onChange={set("name")} placeholder="e.g. Upper Lake Shoreline Cleanup" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="type" className="mb-1.5 block text-sm">Project type</Label>
          <Select id="type" value={values.type} onChange={set("type")}>
            {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="location" className="mb-1.5 block text-sm">Location</Label>
          <Input id="location" required value={values.location} onChange={set("location")} placeholder="District, State" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="start" className="mb-1.5 block text-sm">Start date</Label>
          <Input id="start" type="date" required value={values.startDate} onChange={set("startDate")} />
        </div>
        <div>
          <Label htmlFor="end" className="mb-1.5 block text-sm">End date</Label>
          <Input id="end" type="date" required value={values.endDate} onChange={set("endDate")} />
        </div>
      </div>
      <div className={showStatus ? "grid gap-5 sm:grid-cols-2" : ""}>
        <div>
          <Label htmlFor="focus" className="mb-1.5 block text-sm">Primary activity to track</Label>
          <Input id="focus" value={values.focusActivity} onChange={set("focusActivity")} placeholder="e.g. Waste Removal" />
        </div>
        {showStatus && (
          <div>
            <Label htmlFor="status" className="mb-1.5 block text-sm">Status</Label>
            <Select id="status" value={values.status} onChange={set("status")}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="description" className="mb-1.5 block text-sm">Description</Label>
        <Textarea id="description" value={values.description} onChange={set("description")} placeholder="What the project does and what the field media should show." />
      </div>
      {errors && <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{errors}</p>}
    </div>
  );
}

export function NewProjectForm() {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>({ name: "", type: PROJECT_TYPES[0], location: "", startDate: "", endDate: "", description: "", focusActivity: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const p = await api<Project>("/api/projects", { json: values });
      toast.success("Project created", { description: p.name });
      router.push(`/projects/${p.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border bg-surface p-6 sm:p-8">
      <ProjectFields values={values} onChange={setValues} errors={error} />
      <div className="mt-8 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Create project</Button>
      </div>
    </form>
  );
}
