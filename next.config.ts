import type { NextConfig } from "next";
import { execSync } from "child_process";
import packageJson from "./package.json";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const buildTime = new Date().toISOString();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
};

export default nextConfig;
