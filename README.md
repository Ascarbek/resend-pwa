# resend-pwa

A self-hosted, installable email client (PWA) for [Resend](https://resend.com).
Receive mail via Resend inbound webhooks, get push notifications on your devices,
and send mail through the Resend API. **No database** — email data lives in Resend,
preferences live in your browser's `localStorage`, and the little server state there is
(push subscriptions) is kept in a local `data.json` file.

> Status: early scaffold. Not usable yet.

## Prerequisites

- A domain verified in Resend, with **receiving** enabled (MX records configured).
- A Resend API key.
- A publicly reachable HTTPS host for this server (required for webhooks and Web Push).

## Quick start

```sh
cp .env.example .env
bun install
bun run vapid          # paste the printed keys into .env
bun run build          # build the PWA
bun run start          # serve on http://localhost:3000
```

In Resend, create a webhook pointing to `https://<your-host>/webhooks/resend`
subscribed to `email.received`, and put its signing secret in `RESEND_WEBHOOK_SECRET`.

### Docker

```sh
docker compose up -d --build
```

Server state is stored in `./data/data.json` (mounted at `/app/data`). Back it up if you like;
losing it only means each device has to reopen the app to re-enable notifications.

## Development

```sh
bun run dev   # Bun server on :3000 + Vite dev server on :5173 (proxies /api, /webhooks)
```

## License

MIT
