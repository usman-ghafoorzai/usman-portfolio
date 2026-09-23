import type { PortfolioContent } from "../../application/portfolio-content";

function fail(path: string, local: unknown, sanity: unknown, reason = "value mismatch"): never {
    const display = (value: unknown) => JSON.stringify(value) ?? "undefined";
    throw new Error(`PARITY FAILED\npath: ${path}\nreason: ${reason}\nlocal: ${display(local)}\nsanity: ${display(sanity)}`);
}

/** Reports the first differing domain field; array positions remain significant. */
export function assertSemanticParity(local: unknown, sanity: unknown, path = "content"): void {
    if (Object.is(local, sanity)) return;
    if (Array.isArray(local) && Array.isArray(sanity)) {
        if (local.length !== sanity.length) fail(`${path}.length`, local.length, sanity.length);
        for (let index = 0; index < local.length; index++) {
            assertSemanticParity(local[index], sanity[index], `${path}[${index}]`);
        }
        return;
    }
    if (local !== null && sanity !== null && typeof local === "object" && typeof sanity === "object"
        && !Array.isArray(local) && !Array.isArray(sanity)) {
        const a = local as Record<string, unknown>;
        const b = sanity as Record<string, unknown>;
        for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
            const field = `${path}.${key}`;
            if (!Object.hasOwn(a, key) || !Object.hasOwn(b, key)) {
                fail(field, a[key], b[key], Object.hasOwn(a, key) ? "missing Sanity field" : "unexpected Sanity field");
            }
            assertSemanticParity(a[key], b[key], field);
        }
        return;
    }
    fail(path, local, sanity);
}

/** The sole ordering exception: local declaration order versus Sanity stableId order. */
export function assertPortfolioParity(local: PortfolioContent, sanity: PortfolioContent): void {
    const normalize = (content: PortfolioContent): PortfolioContent => ({
        ...content,
        technologies: [...content.technologies].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    });
    assertSemanticParity(normalize(local), normalize(sanity), "portfolio");
}
