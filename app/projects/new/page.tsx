import type { Metadata } from "next";
import { NewProjectForm } from "@/components/projects/NewProjectForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New project" description="Set up a project to collect field media, run AI analysis and generate impact reports." />
      <NewProjectForm />
    </div>
  );
}
