import { createClient } from "@sanity/client";

/** Configuration is supplied by the future composition root, never read from the environment here. */
export function createPublishedSanityClient({ projectId, dataset }: { projectId: string; dataset: string }) {
    return createClient({
        projectId,
        dataset,
        perspective: "published",
        useCdn: true,
        apiVersion: "2026-09-22",
    });
}
