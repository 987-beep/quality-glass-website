import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/checkout", "/cart", "/login", "/signup", "/api/"],
      },
    ],
    sitemap: "https://quality-glass-website.vercel.app/sitemap.xml",
  };
}
