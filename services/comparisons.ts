import "server-only";
import { getRepository } from "./repository";
import { getAIProvider } from "./ai";
import { aiInputUrl } from "./media";

export async function compareAssets(projectId: string, beforeAssetId: string, afterAssetId: string, origin: string) {
  const repo = getRepository();
  const [project, before, after] = await Promise.all([repo.getProject(projectId), repo.getMedia(beforeAssetId), repo.getMedia(afterAssetId)]);
  if (!project || !before || !after) return null;
  const comparison = await getAIProvider().compareImages({
    project,
    before,
    after,
    beforeUrl: aiInputUrl(before, origin),
    afterUrl: aiInputUrl(after, origin),
  });
  await repo.saveComparison(comparison);
  return comparison;
}
