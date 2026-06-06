import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const cspHeader = `
  default-src 'self';
  script-src 'self'${isDev ? " 'unsafe-eval'" : ""} 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  connect-src 'self' https: ws: wss: http:;
  media-src 'self' blob: data: https:;
  frame-src 'self' blob: data: https: http:;
`;

const nextConfig: NextConfig = {
  // standalone is needed for Docker/VPS self-hosting. Set NEXT_OUTPUT=standalone
  // in your VPS build env. Leave unset on Vercel (preview deployments).
  ...(process.env.NEXT_OUTPUT === "standalone" && { output: "standalone" }),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
