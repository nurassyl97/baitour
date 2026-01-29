import { MetadataRoute } from "next";
import { getAllTours } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const tours = getAllTours();
  const baseUrl = "https://traveltours.com"; // Update with your actual domain

  const tourUrls = tours.map((tour) => ({
    url: `${baseUrl}/tour/${tour.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...tourUrls,
  ];
}
