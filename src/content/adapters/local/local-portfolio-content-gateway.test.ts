import { portfolioContentGatewayContract } from "../../testing/gateway-contract";
import { localPortfolioContentGateway } from "./local-portfolio-content-gateway";
import { expect, it } from "vitest";

portfolioContentGatewayContract("local adapter", () => localPortfolioContentGateway);

it("returns the existing About experiences in chronological order with year-only precision", async () => {
    const experiences = await localPortfolioContentGateway.getExperiences();
    expect(experiences.map(({ role, startDate, endDate }) => ({ role, startDate, endDate }))).toEqual([
        { role: "Technical lab assistant", startDate: "2017", endDate: "2019" },
        { role: "Student host", startDate: "2020", endDate: "2023" },
        { role: "Fundraiser", startDate: "2023", endDate: "2023" },
        { role: "Hands-on university projects", startDate: "2023", endDate: "2026" },
    ]);
});
