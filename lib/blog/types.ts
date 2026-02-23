export type BlogPublishedPost = {
  article_id: string
  external_id: string
  slug: string
  version_id: string
  version: number
  title: string
  excerpt: string | null
  content: unknown
  cover_image_url: string | null
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  updated_at: string
  category_slugs: string[]
  category_names: string[]
  tag_slugs: string[]
  tag_names: string[]
  search_text: string
}

export type BlogTaxonomy = {
  id: string
  slug: string
  name: string
}
