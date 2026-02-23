import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { BlogContent } from "@/components/blog/blog-content"
import { getPublishedBlogPostBySlug } from "@/lib/blog/get-published-posts"

type Params = {
  slug: string
}

function absoluteUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hopfner.dev"
  return `${siteUrl}${path}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Blog post not found | hopfner.dev",
    }
  }

  const title = post.seo_title?.trim() || post.title
  const description = post.seo_description?.trim() || post.excerpt?.trim() || "Blog article"
  const path = `/blog/${post.slug}`

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl(path),
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
      publishedTime: post.published_at ?? undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)

  if (!post) notFound()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-3">
        <Link href="/blog" className="text-sm text-foreground/70 hover:underline">
          ← Back to blog
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
          {post.excerpt ? <p className="text-base text-foreground/75">{post.excerpt}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/65">
          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</span>
          {post.category_names.map((name) => (
            <span key={`cat-${name}`} className="rounded border border-border px-2 py-0.5">{name}</span>
          ))}
          {post.tag_names.map((name) => (
            <span key={`tag-${name}`} className="rounded border border-border px-2 py-0.5">#{name}</span>
          ))}
        </div>
      </header>

      {post.cover_image_url ? (
        <figure className="mb-8 overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-auto w-full object-cover"
          />
        </figure>
      ) : null}

      <article className="space-y-5">
        <BlogContent content={post.content} />
      </article>
    </main>
  )
}
