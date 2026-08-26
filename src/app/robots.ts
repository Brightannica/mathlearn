import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/dashboard", "/learn/", "/practice", "/solve/", "/tools", "/visualizations"],
      },
    ],
    sitemap: "https://mathitout.app/sitemap.xml",
  };
}
