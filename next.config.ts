import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  images: {
    remotePatterns: [new URL("https://cdn.sanity.io/**")],
  },
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
