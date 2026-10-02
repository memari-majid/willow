import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/chat", destination: "/demo", permanent: false },
      { source: "/chat/:path*", destination: "/demo", permanent: false },
      { source: "/sign-in", destination: "/demo", permanent: false },
      { source: "/sign-up", destination: "/demo", permanent: false },
      { source: "/sme", destination: "/sources", permanent: false },
      { source: "/sme/login", destination: "/sources", permanent: false },
      { source: "/sme/:path*", destination: "/sources", permanent: false },
    ];
  },
};

export default withWorkflow(nextConfig);
