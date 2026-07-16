# DEPLOY — CACCO Command Platform (`cacco`)

Deployment for the astrikos.xyz server, per `deployment_context.md`.

> **This POC is frontend-only.** `src/services/api.js` returns mock promises and
> `src/services/socket.js` serves a static seed with `connected: false` — there is
> no REST API and no websocket server in this repo (`socket.io` is not even a
> dependency). Only the frontend is deployed. Backend port **4305** and the
> subdomain `cacco-api.astrikos.xyz` are **reserved, not live** — do not add the
> `astriverse.conf` block or the Cloudflare DNS record until a backend exists,
> or the subdomain will serve 502s. The block is in the appendix for that day.

---

## 1. Process table

| Thing | Value |
| --- | --- |
| POC name | `cacco` |
| Frontend port | **3305** |
| Frontend subdomain | `cacco.astrikos.xyz` (Cloudflare **Orange**) |
| pm2 frontend name | `cacco_3305` |
| Build tool | Create React App (`react-scripts`) |
| Build output | `client/build` (**not** `dist`) |
| Backend port | **4305** — *reserved, nothing listens* |
| Backend subdomain | `cacco-api.astrikos.xyz` — *reserved, do not create yet* |
| pm2 backend name | `cacco_be_4305` — *n/a, no backend process* |

## 2. Port registry row

Append to §6 of `deployment_context.md`:

| POC | Frontend | Backend | Status |
| --- | --- | --- | --- |
| cacco | 3305 | 4305 (reserved) | frontend live |

---

## 3. Build + start

```bash
# ── Frontend (static SPA) ─────────────────────────────────────────
cd <repo>/client
npm install
npm run build                                    # → client/build

pm2 start serve --name "cacco_3305" -- ./build -s -p 3305
pm2 save
```

Notes:
- Run these from `client/`, **not** the repo root. The root `npm run build`
  also works (it delegates via `--prefix client`), but the `pm2 start` path
  `./build` is relative to `client/`.
- The `-s` flag is required — it rewrites all deep routes to `index.html`.
  Without it, `/surveillance` and every other React Router path 404 on refresh.
- CRA inlines `REACT_APP_*` at **build** time. Changing `client/.env.production`
  requires a rebuild + `pm2 restart cacco_3305`, not just a restart.

There is **no backend `pm2 start`** for this POC.

<details>
<summary>Alternative: serve via the bundled <code>server.js</code></summary>

The repo root has an Express static server that reads `process.env.PORT`. The
`serve` command above follows the deployment convention and is preferred; this
is only if you want the Express process instead:

```bash
cd <repo>
PORT=3305 pm2 start server.js --name "cacco_3305"
```
</details>

---

## 4. nginx

### `astrikos.conf` — frontend (add this)

```nginx
server {
    listen 8443 ssl;
    ssl_certificate     /etc/certs/astrikos.xyz/fullchain.pem;
    ssl_certificate_key /etc/certs/astrikos.xyz/privkey.pem;
    server_name cacco.astrikos.xyz;
    location / {
        add_header 'Access-Control-Allow-Origin' '*' always;
        proxy_pass http://127.0.0.1:3305;
    }
}
```

### `astriverse.conf` — backend

**Nothing to add.** No backend process exists. Adding a block that proxies to
`127.0.0.1:4305` would return 502 on every request. See the appendix.

Apply:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

> The repo's own `nginx.conf` at the root is for the Docker image only
> (it serves the build on port 80 inside the container). It is unrelated to the
> server-side `astrikos.conf` block above — don't confuse the two.

---

## 5. Cloudflare DNS

| Record | Setting |
| --- | --- |
| `cacco.astrikos.xyz` | **Orange** (proxied) |
| `cacco-api.astrikos.xyz` | **Do not create yet** — no backend to point it at |

---

## 6. Verify

```bash
curl -k https://cacco.astrikos.xyz:8443            # → SPA HTML, <title>CACCO Command Platform</title>
curl -k https://cacco.astrikos.xyz:8443/surveillance   # → 200 + same HTML (SPA fallback)
```

Both were confirmed locally against `127.0.0.1:3305` before this file was written.

There is no backend curl for this POC.

---

## Appendix — when a real backend lands on 4305

Three steps, in order:

1. **Backend must read `process.env.PORT`** and listen on 4305, serving REST
   *and* websockets on that one port.
2. Add to `astriverse.conf` (needs `map $http_upgrade $connection_upgrade {…}`
   once at the top of the file):

```nginx
server {
    listen 8443 ssl;
    ssl_certificate     /etc/certs/astrikos.xyz/fullchain.pem;
    ssl_certificate_key /etc/certs/astrikos.xyz/privkey.pem;
    server_name cacco-api.astrikos.xyz;
    location / {
        proxy_pass http://127.0.0.1:4305;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
        proxy_buffering off;
    }
}
```

3. Cloudflare: create `cacco-api.astrikos.xyz` as **Gray** (DNS-only, for websockets).

`client/.env.production` already points `REACT_APP_API_URL` / `REACT_APP_SOCKET_URL`
at `https://cacco-api.astrikos.xyz:8443`, so no env change is needed — but the
frontend must be **rebuilt** to pick them up, and `src/services/{api,socket}.js`
must be rewritten to actually read them and call the backend. Today they read
neither.
