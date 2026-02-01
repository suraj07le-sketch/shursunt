import { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "hhcpczniwlirkljbigcl.supabase.co",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
  /* devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  }, */
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
