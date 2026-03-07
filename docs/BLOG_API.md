# Blog Ingest API

## Endpoint

`POST /admin/api/internal/blog/ingest`

## Auth

Header required:

`x-api-key: <BLOG_INGEST_API_KEY>`

## Payload

Single JSON object:

- `id` (stable external article id)
- `title`
- `excerpt` (optional)
- `content` (JSON blocks)
- `seoTitle` (optional)
- `seoDescription` (optional)
- `categories` (string[])
- `tags` (string[])

## Behavior

- If `id` is new: creates a new article + draft version `v1`.
- If `id` already exists: creates a new draft version on the same article.
- Categories and tags are upserted by slug/name.

## Responses

- `200 { ok: true, articleId, versionId, version, status }`
- `400 { error }` (invalid payload)
- `401 { error }` (invalid/missing API key)
- `500 { error }` (server/database failure)
