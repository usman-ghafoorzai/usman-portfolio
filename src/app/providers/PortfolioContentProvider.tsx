import type { ReactNode } from "react";
import type { PortfolioContent } from "../../application/portfolio-content";
import { PortfolioContentContext } from "./portfolio-content-context";

type PortfolioContentProviderProps = {
    readonly content: PortfolioContent;
    readonly children: ReactNode;
};

export function PortfolioContentProvider({ content, children }: PortfolioContentProviderProps) {
    return (
        <PortfolioContentContext.Provider value={content}>
            {children}
        </PortfolioContentContext.Provider>
    );
}
