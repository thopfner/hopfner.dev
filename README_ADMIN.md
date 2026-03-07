# Admin Routes

The admin UI lives inside the same Next.js app and is served under `https://hopfner.dev/admin`.

Key routes:
- Login: `/admin/login`
- Pages: `/admin/pages`
- Global sections: `/admin/global-sections`
- Admin APIs: `/admin/api/*`

Environment:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
```

Notes:
- Admin auth callback: `/admin/auth/callback`
- The app runs behind Nginx, but production is a single Next.js process
- Safe deployment helper: `npm run deploy:safe`
