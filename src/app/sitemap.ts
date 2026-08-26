import type { MetadataRoute } from "next";
import { getAllCourses } from "@/lib/courses";
import { getProblems } from "@/lib/problems";

const BASE_URL = "https://mathitout.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const courses = getAllCourses();
  const problems = getProblems();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/auth/signin`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/auth/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${BASE_URL}/learn/${course.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const problemPages: MetadataRoute.Sitemap = problems.map((p) => ({
    url: `${BASE_URL}/solve?p=${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...coursePages, ...problemPages];
}
