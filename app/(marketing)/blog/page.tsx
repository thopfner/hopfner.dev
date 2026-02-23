import Link from "next/link"
import type { Metadata } from "next"

import {
  listBlogCategories,
  listBlogTags,
  listPublishedBlogPosts,
} from "@/lib/blog/get-published-posts"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog | hopfner.dev",
  description: "Automation and AI insights, case-driven practical guides, and execution playbooks.",
}

type SearchParams = {
  page?: string
  q?: string
  tag?: string
  category?: string
}

function parsePage(value: string | undefined): number {
  const n = Number(value ?? "1")
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

function buildBlogHref(params: {
  page?: number
  q?: string
  tag?: string
  category?: string
}) {
  const search = new URLSearchParams()

  if (params.page && params.page > 1) search.set("page", String(params.page))
  if (params.q && params.q.trim()) search.set("q", params.q.trim())
  if (params.tag && params.tag.trim()) search.set("tag", params.tag.trim())
  if (params.category && params.category.trim()) search.set("category", params.category.trim())

  const query = search.toString()
  return query ? `/blog?${query}` : "/blog"
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolved = await searchParams

  const page = parsePage(resolved.page)
  const q = (resolved.q ?? "").trim()
  const tag = (resolved.tag ?? "").trim().toLowerCase()
  const category = (resolved.category ?? "").trim().toLowerCase()

  const [postsResult, tags, categories] = await Promise.all([
    listPublishedBlogPosts({
      page,
      pageSize: 10,
      q,
      tag,
      category,
    }),
    listBlogTags(),
    listBlogCategories(),
  ])

  const { items, total, pageSize } = postsResult
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const featured = items[0] ?? null
  const rest = items.slice(1)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Blog</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Execution-first AI & automation insights</h1>
        <p className="max-w-3xl text-sm text-foreground/75 sm:text-base">
          Practical breakdowns, implementation playbooks, and operator notes from real automation work.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-card/30 p-4 sm:p-5">
        <form action="/blog" method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-foreground/70">Search</span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search title, excerpt, body"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-foreground/70">Tag</span>
            <select
              name="tag"
              defaultValue={tag}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All tags</option>
              {tags.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-foreground/70">Category</span>
            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background"
            >
              Apply
            </button>
            <Link
              href="/blog"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      {featured ? (
        <section className="mb-8">
          <article className="overflow-hidden rounded-2xl border border-border bg-card/30">
            {featured.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.cover_image_url}
                alt={featured.title}
                className="h-64 w-full object-cover sm:h-80"
              />
            ) : null}
            <div className="space-y-3 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Featured</p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <Link href={`/blog/${featured.slug}`} className="hover:underline">
                  {featured.title}
                </Link>
              </h2>
              {featured.excerpt ? <p className="text-sm text-foreground/80 sm:text-base">{featured.excerpt}</p> : null}
              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/65">
                <span>{featured.published_at ? new Date(featured.published_at).toLocaleDateString() : ""}</span>
                {featured.tag_names.slice(0, 3).map((name) => (
                  <span key={name} className="rounded border border-border px-2 py-0.5">#{name}</span>
                ))}
              </div>
            </div>
          </article>
        </section>
      ) : null}

      <section className="space-y-3">
        {rest.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((post) => (
              <article key={post.version_id} className="rounded-xl border border-border bg-card/20 p-4">
                <h3 className="text-lg font-semibold tracking-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt ? (
                  <p className="mt-2 text-sm text-foreground/75 line-clamp-3">{post.excerpt}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                  <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</span>
                  {post.tag_names.slice(0, 2).map((name) => (
                    <span key={name} className="rounded border border-border px-2 py-0.5">#{name}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/20 p-6 text-sm text-foreground/75">
            No published posts match your filters yet.
          </div>
        )}
      </section>

      <footer className="mt-8 flex items-center justify-between gap-2 text-sm">
        <span className="text-foreground/70">
          Page {page} of {totalPages} · {total} result{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={buildBlogHref({
              page: Math.max(1, page - 1),
              q,
              tag,
              category,
            })}
            aria-disabled={page <= 1}
            className={`rounded-md border px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-card"}`}
          >
            Previous
          </Link>
          <Link
            href={buildBlogHref({
              page: Math.min(totalPages, page + 1),
              q,
              tag,
              category,
            })}
            aria-disabled={page >= totalPages}
            className={`rounded-md border px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-card"}`}
          >
            Next
          </Link>
        </div>
      </footer>
    </main>
  )
}
