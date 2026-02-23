import type { MetadataRoute } from "next"

import { getSupabasePublicClient } from "@/lib/cms/supabase"

function siteBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hopfner.dev"
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteBaseUrl()
  const supabase = getSupabasePublicClient()

  const { data: blogRows } = await supabase
    .from("blog_published_posts")
    .select("slug, published_at, updated_at")
    .order("published_at", { ascending: false, nullsFirst: false })

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/home`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  const blogEntries: MetadataRoute.Sitemap = (blogRows ?? []).map((row) => ({
    url: `${base}/blog/${row.slug}`,
    lastModified: row.updated_at ?? row.published_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticEntries, ...blogEntries]
}
