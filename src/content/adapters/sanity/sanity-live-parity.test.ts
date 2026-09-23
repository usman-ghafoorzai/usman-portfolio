// @vitest-environment node
import { env } from "node:process";
import { expect, it } from "vitest";
import { getDotPath, isValiError } from "valibot";
import { loadPortfolioContent } from "../../../application/portfolio-content";
import { assertPortfolioParity, assertSemanticParity } from "../../testing/portfolio-parity";
import { localPortfolioContentGateway } from "../local/local-portfolio-content-gateway";
import { createPublishedSanityClient } from "./sanity-client";
import { createSanityPortfolioContentGateway } from "./sanity-portfolio-content-gateway";
import { SANITY_PORTFOLIO_QUERY } from "./sanity-portfolio-query";

it.skipIf(env.SANITY_LIVE_PARITY !== "1")("live published Sanity content has semantic parity with local content", async () => {
    const projectId = env.SANITY_LIVE_PROJECT_ID?.trim();
    const dataset = env.SANITY_LIVE_DATASET?.trim();
    if (!projectId || !dataset) {
        throw new Error("SANITY_LIVE_PARITY=1 requires SANITY_LIVE_PROJECT_ID and SANITY_LIVE_DATASET");
    }
    const client = createPublishedSanityClient({ projectId, dataset })
        .withConfig({ perspective: "published", useCdn: false });
    let fetchCount = 0;
    const sanityGateway = createSanityPortfolioContentGateway({
        async fetch(query: string): Promise<unknown> {
            fetchCount += 1;
            expect(query).toBe(SANITY_PORTFOLIO_QUERY);
            return client.fetch<unknown>(query);
        },
    });
    const localContent = await loadPortfolioContent(localPortfolioContentGateway);
    const sanityContent = await loadPortfolioContent(sanityGateway).catch((error: unknown) => {
        if (isValiError(error)) {
            const issue = error.issues[0];
            // Valibot issues retain the full input; avoid serializing the portfolio in test output.
            throw new Error(`LIVE PARITY BLOCKED: snapshot validation failed\nfetchCount: ${fetchCount}\npath: ${issue ? getDotPath(issue) : "snapshot"}\nreason: ${issue?.message ?? error.message}`);
        }
        throw error;
    });
    expect(fetchCount).toBe(1);
    const counts = {
        profile: sanityContent.profile ? 1 : 0,
        siteContent: sanityContent.siteContent ? 1 : 0,
        projects: sanityContent.projects.length,
        experiences: sanityContent.experiences.length,
        technologies: sanityContent.technologies.length,
        capabilityAreas: sanityContent.capabilityAreas.length,
    };
    expect(counts).toEqual({ profile: 1, siteContent: 1, projects: 7, experiences: 4, technologies: 49, capabilityAreas: 7 });
    assertPortfolioParity(localContent, sanityContent);
    const project = localContent.projects[0];
    if (!project) throw new Error("Local content must contain a project for slug verification");
    assertSemanticParity(project, await sanityGateway.getProjectBySlug(project.slug), "projectBySlug");
    expect(await sanityGateway.getProjectBySlug("definitely-not-a-real-project-slug")).toBeNull();
    expect(fetchCount).toBe(1);
    console.info("LIVE PARITY PASSED", { fetchCount, counts });
}, 60_000);
