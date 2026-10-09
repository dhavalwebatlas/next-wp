import type { NextConfig } from "next";

const wordpressHostname = process.env.WORDPRESS_HOSTNAME;
const wordpressUrl = process.env.WORDPRESS_URL;

// Local installs (XAMPP/MAMP etc.) are often served over plain http
const wordpressProtocol = wordpressUrl?.startsWith("http://") ? "http" : "https";

// Next.js refuses to optimize images whose host resolves to a private IP (SSRF guard).
// For WordPress running on this machine, let the browser load images directly
// instead of turning that guard off with `dangerouslyAllowLocalIP`.
const isLocalWordPress =
  !!wordpressHostname &&
  (["localhost", "127.0.0.1", "::1"].includes(wordpressHostname) ||
    /\.(localhost|local|test)$/.test(wordpressHostname));

const nextConfig: NextConfig = {
  // Standalone is for Docker/Railway; Vercel handles its own tracing/standalone
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  images: {
    unoptimized: isLocalWordPress,
    remotePatterns: wordpressHostname
      ? [
          {
            protocol: wordpressProtocol,
            hostname: wordpressHostname,
            port: "",
            pathname: "/**",
          },
        ]
      : [],
  },
  async redirects() {
    if (!wordpressUrl) {
      return [];
    }
    return [
      {
        source: "/admin",
        destination: `${wordpressUrl}/wp-admin`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
