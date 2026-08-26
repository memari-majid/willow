import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/sme", destination: "/sources", permanent: false },
      { source: "/sme/login", destination: "/sources", permanent: false },
      { source: "/sme/:path*", destination: "/sources", permanent: false },
    ];
  },
};

export default withWorkflow(nextConfig);
