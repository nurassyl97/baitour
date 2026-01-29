import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/booking", "/confirmation"],
    },
    sitemap: "https://traveltours.com/sitemap.xml", // Update with your actual domain
  };
}
