import { portfolioContentGatewayContract } from "../../testing/gateway-contract";
import { localPortfolioContentGateway } from "./local-portfolio-content-gateway";

portfolioContentGatewayContract("local adapter", () => localPortfolioContentGateway);
