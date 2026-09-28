import { getRepository } from "@/services/repository";
import { DEMO_USER } from "@/lib/config";
import { DEMO_ORG_NAME } from "@/lib/demo/demoProjects";
import { TopNav } from "./TopNav";

export async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const activity = await getRepository().listActivity(6);
  return (
    <div className="min-h-screen">
      <TopNav activity={activity} user={{ name: DEMO_USER.name, email: DEMO_USER.email, role: DEMO_USER.role, org: DEMO_ORG_NAME }} />
      <main id="main" className="container pb-20 pt-8">
        {children}
      </main>
    </div>
  );
}
