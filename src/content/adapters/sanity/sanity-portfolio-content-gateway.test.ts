import { describe, expect, it, vi } from "vitest";
import { loadPortfolioContent } from "../../../application/portfolio-content";
import { portfolioContentGatewayContract } from "../../testing/gateway-contract";
import { mapSanityPortfolioSnapshot } from "./sanity-content-mapper";
import { parseSanityPortfolioSnapshot } from "./sanity-content-schema";
import { createSanityPortfolioContentGateway } from "./sanity-portfolio-content-gateway";
import { sanitySnapshotFixture } from "./sanity-snapshot.fixture";

portfolioContentGatewayContract("Sanity", () => createSanityPortfolioContentGateway({
    fetch: vi.fn().mockResolvedValue(sanitySnapshotFixture()),
}));

describe("Sanity gateway snapshot ownership", () => {
    it("lazily shares one in-flight request across the concurrent application load", async () => {
        let resolveFetch!: (value: unknown) => void;
        const pending = new Promise<unknown>(resolve => { resolveFetch = resolve; });
        const client = { fetch: vi.fn().mockReturnValue(pending) };
        const gateway = createSanityPortfolioContentGateway(client);
        expect(client.fetch).not.toHaveBeenCalled();
        const contentPromise = loadPortfolioContent(gateway);
        expect(client.fetch).toHaveBeenCalledTimes(1);
        const raw = sanitySnapshotFixture();
        resolveFetch(raw);
        expect(await contentPromise).toEqual(mapSanityPortfolioSnapshot(parseSanityPortfolioSnapshot(raw)));
        expect(client.fetch).toHaveBeenCalledTimes(1);
    });

    it("retains the same domain values and uses cached projects for slug lookup", async () => {
        const client = { fetch: vi.fn().mockResolvedValue(sanitySnapshotFixture()) };
        const gateway = createSanityPortfolioContentGateway(client);
        const first = await loadPortfolioContent(gateway);
        const second = await loadPortfolioContent(gateway);
        for (const key of Object.keys(first) as (keyof typeof first)[]) {
            expect(second[key]).toBe(first[key]);
        }
        const project = first.projects[0]!;
        expect(await gateway.getProjectBySlug(project.slug)).toBe(project);
        expect(await gateway.getProjectBySlug("missing-project")).toBeNull();
        expect(client.fetch).toHaveBeenCalledTimes(1);
    });

    it("shares the original transport failure and retries only on a later explicit call", async () => {
        let rejectFetch!: (reason: unknown) => void;
        const pending = new Promise<unknown>((_resolve, reject) => { rejectFetch = reject; });
        const client = { fetch: vi.fn().mockReturnValueOnce(pending).mockResolvedValue(sanitySnapshotFixture()) };
        const gateway = createSanityPortfolioContentGateway(client);
        const resultsPromise = Promise.allSettled([gateway.getProfile(), gateway.getProjects(), gateway.getSiteContent()]);
        expect(client.fetch).toHaveBeenCalledTimes(1);
        const error = new Error("Offline");
        rejectFetch(error);
        const results = await resultsPromise;
        for (const result of results) {
            expect(result.status).toBe("rejected");
            if (result.status === "rejected") expect(result.reason).toBe(error);
        }
        expect(client.fetch).toHaveBeenCalledTimes(1);
        const profile = await gateway.getProfile();
        expect(profile.name).toBe("Example");
        expect(await gateway.getProfile()).toBe(profile);
        await gateway.getProjects();
        expect(client.fetch).toHaveBeenCalledTimes(2);
    });

    it("rejects invalid snapshots and allows a later valid load", async () => {
        const client = { fetch: vi.fn().mockResolvedValueOnce({ profile: null }).mockResolvedValue(sanitySnapshotFixture()) };
        const gateway = createSanityPortfolioContentGateway(client);
        await expect(loadPortfolioContent(gateway)).rejects.toThrow();
        expect(client.fetch).toHaveBeenCalledTimes(1);
        const content = await loadPortfolioContent(gateway);
        expect(content.projects).toHaveLength(3);
        expect(client.fetch).toHaveBeenCalledTimes(2);
    });

    it("keeps successful caches independent between gateway instances", async () => {
        const client = { fetch: vi.fn().mockResolvedValue(sanitySnapshotFixture()) };
        const first = createSanityPortfolioContentGateway(client);
        const second = createSanityPortfolioContentGateway(client);
        const [a, b] = await Promise.all([first.getProfile(), second.getProfile()]);
        expect(a).toEqual(b);
        expect(a).not.toBe(b);
        expect(client.fetch).toHaveBeenCalledTimes(2);
    });
});
