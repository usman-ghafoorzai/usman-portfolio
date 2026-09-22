import { describe, expect, it, vi } from "vitest";
import { createPublishedSanityClient } from "./sanity-client";
import { parseSanityPortfolioSnapshot } from "./sanity-content-schema";
import { fetchSanityPortfolioSnapshot, SANITY_PORTFOLIO_QUERY } from "./sanity-portfolio-query";
import { sanitySnapshotFixture } from "./sanity-snapshot.fixture";

describe("Sanity snapshot transport", () => {
    it("uses one snapshot fetch and returns parsed data with unknown metadata removed", async () => {
        const raw = { ...sanitySnapshotFixture(), unexpectedMetadata: "discard me" };
        const client = { fetch: vi.fn<(query: string) => Promise<unknown>>().mockResolvedValue(raw) };
        const result = await fetchSanityPortfolioSnapshot(client);
        expect(client.fetch).toHaveBeenCalledExactlyOnceWith(SANITY_PORTFOLIO_QUERY);
        expect(result).toEqual(parseSanityPortfolioSnapshot(raw));
        expect(result).not.toBe(raw);
        expect(result).not.toHaveProperty("unexpectedMetadata");
        expect(result.siteContent.about.education[0]).not.toHaveProperty("_key");
    });

    it("rejects malformed query output", async () => {
        const client = { fetch: vi.fn().mockResolvedValue({ profile: null }) };
        await expect(fetchSanityPortfolioSnapshot(client)).rejects.toThrow();
        expect(client.fetch).toHaveBeenCalledTimes(1);
    });

    it("rejects snapshot invariant failures", async () => {
        const raw = sanitySnapshotFixture();
        raw.technologies = [];
        await expect(fetchSanityPortfolioSnapshot({ fetch: vi.fn().mockResolvedValue(raw) })).rejects.toThrow(/technology/);
    });

    it("propagates transport failures without returning fallback content", async () => {
        const error = new Error("Transport failed");
        const client = { fetch: vi.fn().mockRejectedValue(error) };
        await expect(fetchSanityPortfolioSnapshot(client)).rejects.toBe(error);
        expect(client.fetch).toHaveBeenCalledTimes(1);
    });

    it("conditionally projects optional live and location fields", () => {
        expect(SANITY_PORTFOLIO_QUERY).toMatch(/links\s*\{\s*github,\s*defined\(live\)\s*=>\s*\{\s*live\s*\}/);
        expect(SANITY_PORTFOLIO_QUERY).toMatch(/defined\(location\)\s*=>\s*\{\s*location\s*\}/);
    });

    it("dereferences both technology arrays and capability evidence with source identities", () => {
        expect(SANITY_PORTFOLIO_QUERY.match(/technologies\[\]->\s*\{\s*_id,\s*_type,\s*stableId\s*\}/g)).toHaveLength(2);
        expect(SANITY_PORTFOLIO_QUERY).toMatch(/capabilityEvidence\[\]\s*\{\s*"capability":\s*capability->\s*\{\s*_id,\s*_type,\s*stableId\s*\},\s*priority/);
    });

    it("selects fixed singletons and leaves the capability collection unfiltered", () => {
        for (const singleton of ["profile", "siteContent"]) {
            expect(SANITY_PORTFOLIO_QUERY).toContain(`*[_id == "${singleton}" && _type == "${singleton}"][0]`);
        }
        expect(SANITY_PORTFOLIO_QUERY).toMatch(/"capabilityAreas":\s*\*\[_type == "capabilityArea"\]\s*\{/);
        expect(SANITY_PORTFOLIO_QUERY).toMatch(/"slug":\s*slug\.current/);
    });

    it("configures public published reads through the documented client config API", () => {
        const client = createPublishedSanityClient({ projectId: "test1234", dataset: "testing" });
        expect(client.config()).toMatchObject({
            projectId: "test1234", dataset: "testing", perspective: "published",
            useCdn: true, apiVersion: "2026-09-22",
        });
        expect(client.config().token).toBeUndefined();
        // This assignment also verifies that the real client satisfies the narrow fetch interface.
        const reader: Parameters<typeof fetchSanityPortfolioSnapshot>[0] = client;
        expect(reader).toBe(client);
    });
});
