import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = isGitHubActions && repositoryName ? `/${repositoryName}` : "";

export default function nextConfig(phase: string): NextConfig {
  return {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? "tmp/next-dev" : ".next",
  };
}
