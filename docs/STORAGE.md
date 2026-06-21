# Storage Integration

This template includes a minimal `storage.d1v.ai` upload example for authenticated users.

## What is included

- storage environment variable detection
- server-side storage wrapper
- `POST /api/profile/avatar`
- homepage upload entry for the signed-in user

## Required environment variables

```env
STORAGE_BASE_URL=https://storage.d1v.ai
STORAGE_API_KEY=sk_xxxxxxxxxxxxxxxxx
```

Optional:

```env
STORAGE_PUBLIC_BASE_URL=https://storage.d1v.ai/public/files
STORAGE_PROJECT_ID=project_xxx
STORAGE_PROJECT_EMAIL=project-id@d1vproject.d1v.ai
```

## Behavior when env is missing

- UI keeps the upload entry visible but disabled
- API routes return a clear storage configuration error
- code comments and UI point to `https://storage.d1v.ai/docs`

## Docs

- Product docs: `https://storage.d1v.ai/docs`
- Public API pattern: see `storage.d1v.ai` upload init / complete endpoints
