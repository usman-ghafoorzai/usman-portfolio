import { createContext, useContext } from "react";
import type { PortfolioContent } from "../../application/portfolio-content";

export const PortfolioContentContext = createContext<PortfolioContent | null>(null);

export function usePortfolioContent(): PortfolioContent {
    const content = useContext(PortfolioContentContext);
    if (content === null) {
        throw new Error("usePortfolioContent must be used within PortfolioContentProvider");
    }
    return content;
}
