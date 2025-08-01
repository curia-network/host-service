Thanks! I now have everything I need to write an end-to-end setup for deploying Ergo IRC server, Soju bouncer, and The Lounge web client to Railway and for running them locally via Docker. I’ll make sure it fits with your current GitHub-based deployment model, matches the infrastructure layout you shared (Postgres, Redis, bucket, etc.), and uses Railway domains and secrets cleanly.

I’ll also include a local dev setup that mirrors production closely, but without SSL requirements.

I’ll share the complete instruction set for your Cursor AI assistant shortly.


# Implementing a Modern IRC Stack (Ergo + Soju + The Lounge)

## Project Structure and Repositories

We will organize the IRC stack into three separate projects (repositories), one for each component. This mirrors the microservice approach and allows deploying each service to Railway independently (or as multiple services within one Railway project):

* **`cg-ircd-ergo`** – Contains the Ergo IRC server code/config. For example:

  ```text
  cg-ircd-ergo/
  ├── Dockerfile
  ├── ircd.yaml        # Ergo config (YAML)
  └── entrypoint.sh    # (optional) startup script for config tweaks or cert generation
  ```

* **`cg-irc-bouncer`** – Contains the Soju bouncer service. For example:

  ```text
  cg-irc-bouncer/
  ├── Dockerfile
  ├── soju.conf        # Soju config (ini-style)
  └── init-user.sh     # (optional) script to create admin or run migrations
  ```

* **`cg-irc-client`** – Contains The Lounge web client. For example:

  ```text
  cg-irc-client/
  ├── Dockerfile
  ├── config.js        # The Lounge configuration (JavaScript)
  └── public/          # (optional) custom assets or plugin scripts
  ```

Each repo is built into a container image and deployed as its own Railway service, following the same patterns as existing CG services. This separation allows independent version control and scaling for each component, unless a combined setup proves clearly superior (in this case, separate services are preferred).

## Continuous Deployment on Railway

Each repository can be linked to Railway for CI/CD. You can use GitHub Actions to build and deploy, or leverage Railway’s GitHub integration:

* **GitHub Actions**: For example, add a workflow to build the Docker image on push and deploy to Railway. If using Railway’s CLI, a job could run `railway up` or use `railway login` and `railway deploy`. Alternatively, use Docker Hub and Railway’s container deploy.

* **Railway project setup**: In Railway, create a single project (e.g. “CommonGround IRC”) and add three services: “ergo”, “soju”, and “thelounge”. Connect each service to its respective Git repo. Railway will auto-build Dockerfiles by default. Ensure the **build command** and **start command** are correct if not using the Dockerfile’s defaults (Railway’s Nixpacks aren’t needed since we provide Dockerfiles).

* **Domains and SSL**: Railway provides an automatic `<project-name>.up.railway.app` domain for HTTP services with SSL. We will exploit this for The Lounge (which runs an HTTP server). For the IRC daemons (Ergo and Soju), which use TCP, we will either use Railway’s generated domain with a WebSocket/HTTPS listener or configure custom domains with TLS. (Railway’s auto SSL covers HTTP/WS on port 80/443 – we’ll configure Soju to listen on `443` with WebSocket support to leverage this, as described later.)

* **Example**: Suppose the Railway project domain is `curia-production.up.railway.app`. After deployment, you might set custom subdomains:

  * `irc.curia.network` -> points to Soju’s service (for IRC clients)
  * `embed.curia.network` -> points to The Lounge’s service (for web UI)
    Railway will provision SSL certs for `irc.curia.network` and `embed.curia.network` automatically when added to the project.

No manual servers are needed — just push code, and Railway will deploy containers. Each service should also include a health check if possible (Railway will keep it running; for non-HTTP services like IRC, you can use a dummy HTTP listener or rely on container running status).

## Environment Variables and Secrets

We will use environment variables to configure database connections, credentials, and integration settings. These should be set in Railway for production and mirrored in a local `.env` for development:

* **PostgreSQL**: Railway’s Postgres addon injects a `DATABASE_URL` (or separate `PGHOST`, `PGUSER`, etc.). We’ll use this for Soju’s DB. For example:

  * `SOJU_DB_URL` (override default) – e.g. `postgres://<user>:<pass>@<host>:<port>/<dbname>?sslmode=require`
  * Alternatively, use individual vars: `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, etc., and construct the connection string in `soju.conf`. Soju expects a space-separated DSN for Postgres.

* **Redis**: If The Lounge or other services need Redis (e.g. for caching or session storage), set `REDIS_URL`. Railway’s Redis addon typically provides this. (In our base setup, The Lounge doesn’t require Redis explicitly, but it’s available for future scaling or plugin use.)

* **CG Identity Integration**:

  * If using external auth for Soju, set the URL or credentials needed. For example, `SOJU_AUTH_URL=https://curia.network/api/irc-auth` for an HTTP auth endpoint (explained below).
  * You might also set a shared secret or token if the auth API requires one for trust.

* **IRC Credentials**:

  * Set an **Ergo server password** that Soju will use when connecting (to restrict direct access). For example, `ERGO_PASS=<randomlongpassword>`. Ergo’s config can read this (or we can bake it into config securely).
  * Optionally, define a default **Soju admin** account via env (if not using external auth). E.g. `SOJU_ADMIN_USER` and `SOJU_ADMIN_PASS` to be used by an init script that runs `sojuctl create-user`. This helps bootstrap an admin user on first deploy.

* **The Lounge**:

  * If running The Lounge in private mode (with user accounts), you’d set an initial admin user via env or CLI. In our case (public mode), no login is needed, so mostly we’ll use env to configure host/port dynamically for dev vs prod.
  * For example, you might set `IRC_HOST=soju:6697` and `IRC_TLS=true` in dev, and `IRC_HOST=irc.curia.network` in prod, then have `config.js` read from env when building the defaults.

On Railway, configure these variables in the project’s **Environment** tab for each service (Railway allows scoping env vars per service). For local development, a `.env` file can be used with `docker-compose` (as shown later) to supply the same values.

## Database Setup (Postgres for Soju)

**Soju** will use PostgreSQL to store user accounts, network configurations, and message history (Soju supports both SQLite and Postgres as drivers). We need to set up the schema for Soju in Postgres:

* **Schema initialization**: Soju comes with a helper `sojuctl` and `sojudb` for managing the database. In practice, simply running Soju with a fresh Postgres connection will create the necessary tables on first run (Soju will run migrations automatically if the DSN is provided). To be safe, our Docker entrypoint can call `sojuctl` for any needed setup. For example:

  ```sh
  # In init-user.sh (called on container start if DB is empty)
  sojuctl -config /etc/soju/soju.conf create-user "$SOJU_ADMIN_USER" -admin <<EOF
  $SOJU_ADMIN_PASS
  EOF
  ```

  This creates an initial admin user in the Postgres DB. (The password is read from STDIN here to avoid logging it.)

* **Postgres user**: In dev, we’ll create a Postgres user/database for soju (see Docker Compose section). In Railway, the addon gives a default user and DB. Ensure the connection string is correct in `soju.conf`:

  ```ini
  db postgres "host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD} dbname=${PGDATABASE} sslmode=require"
  ```

  (Railway’s `sslmode` can remain `require` since their certificate is trusted, or use `disable` in dev if needed.)

**Ergo** can also use a database for persistent history, but currently Ergo only supports MySQL for that feature. Given Common Ground’s preference for Postgres, we will **not** set up a separate MySQL for Ergo. Instead, we’ll rely on Soju for message storage and leave Ergo’s history in memory (the default). Ergo’s integrated NickServ/ChanServ data is stored in its own data file (or memory) and doesn’t require an external DB by default.

**Redis** is not explicitly required by either Ergo or Soju. We include it as part of the stack in case The Lounge or other parts use it (e.g., The Lounge in private mode can use memory/Redis for scrollback). In our configuration, The Lounge will use SQLite files for history logging by default, but you can configure it to use Redis as a cache or for sessions if scaling out horizontally. (For example, if you run multiple Lounge instances behind a load balancer, you’d configure a shared session store in Redis.)

## Configuring and Deploying **Ergo** (IRC Server)

Ergo (also known as Oragono) is a modern IRCv3 server with integrated services (NickServ for user accounts, ChanServ, etc.) and bouncer-like features (history replay, multi-client support). We will configure Ergo as the core IRC server for the Common Ground chat:

* **Dockerfile**: We can use the official Ergo image or build from source. For simplicity, use the official image `ergochat/ergo` and copy in our config. For example:

  ```dockerfile
  FROM ergochat/ergo:latest
  COPY ircd.yaml /ergo/ircd.yaml
  CMD ["ergo", "run", "--conf", "/ergo/ircd.yaml"]
  ```

  This assumes the base image contains the `ergo` binary and a default config.

* **ircd.yaml configuration**: Start by copying Ergo’s `default.yaml` to `ircd.yaml` and modify:

  1. **Network and Server name**: Set `network.name` and `server.name` to something relevant (e.g., `CommonGround` and `irc.curia.network`).

  2. **Listeners**: Enable a TLS listener on the standard IRC TLS port 6697. Since Railway will not automatically handle TLS on arbitrary ports, we have two options:

     * Use a self-signed or Let’s Encrypt cert within Ergo. For production, we prefer real certificates. We can mount a certificate (Railway allows adding certs via variables or storage). For now, enable TLS on 6697 with placeholders:

       ```yaml
       server:
         listeners:
           ":6697":
             tls:
               cert: /etc/ergo/tls/fullchain.pem
               key: /etc/ergo/tls/privkey.pem
             proxy: false
             min-tls-version: 1.2
       ```

       Ensure the cert files are provided (we might use the Railway domain’s cert if we front with a proxy, but since we have Soju in front, a self-signed cert is acceptable).
     * Alternatively, run Ergo’s WebSocket listener on port 80/443 to leverage Railway’s domain. For example, Ergo can listen on a port with `websocket: true`. This would allow a reverse proxy or client to connect via `wss://` on the Railway domain. However, since we have The Lounge and Soju, we don’t need Ergo itself to serve websockets publicly.

  3. **Server password**: To restrict who can connect directly, set a server connection password. Under `server.listeners[":6697"]`, add:

     ```yaml
     password: "${ERGO_PASS}"
     ```

     and set `ERGO_PASS` in Railway to a strong value. Soju will use this when connecting (as an IRC server password, not to be confused with NickServ). This ensures only our bouncer (with the password) can connect to Ergo’s IRC port.

  4. **Services and Accounts**: Ergo by default has NickServ enabled. We can leave it on – users connecting through Soju might not manually use NickServ, but having services allows channel registration, etc. Consider enabling `accounts.registration.enabled: false` if you *don’t* want users registering accounts on Ergo (since CG users are already registered in our system). We might also set `accounts.require-sasl: true` globally if we wanted to enforce all clients authenticate (Ergo supports require-sasl for Tor by config, and can be set network-wide). However, because only Soju connects to Ergo, we can skip requiring SASL on Ergo and rely on the server password for security.

  5. **History**: Leave `history.enabled: true` but **persistent** storage off (the default). Ergo will keep a rolling memory buffer of messages (e.g., last 2048 messages per channel) for replay to clients that support `CHATHISTORY`. We won’t configure MySQL, since we’re not using it (Ergo’s `datastore.mysql.enabled` stays `false`).

  6. **Other**: Adjust `maxclients` or oper settings as needed (e.g., set an oper for admin via `opers:` section, hashed password). Also, whitelist the Soju container’s IP for WebIRC if using that (not necessary here).

* **Railway deployment**: Once `ircd.yaml` is configured, deploy the container. In Railway, map the service’s port to `6697`. (Railway will by default expose port 80 for HTTP apps, but for a TCP service you can specify the internal port. The service will still be reachable at `<service>.up.railway.app:6697` for testing.) Since Railway’s default domain SSL is meant for HTTP, connecting to `irc.curia.network:6697` will use our Ergo’s TLS (with our cert). We either need to use a valid cert (obtain via Let’s Encrypt using DNS or use the same cert as Soju’s domain) or instruct clients to trust our self-signed cert (not ideal publicly). A simpler approach: we won’t expose Ergo directly to end-users — they will connect via Soju and The Lounge. Ergo’s port can even be made “internal only” if Railway supported that (not currently, so a strong password achieves similar protection).

Ergo will now be running on Railway with Postgres and Redis available (though it doesn’t use them) and with automatic restart, etc. The IRC server forms the backend of our chat system.

## Configuring and Deploying **Soju** (IRC Bouncer)

Soju is the multi-user IRC bouncer that will maintain persistent connections to the Ergo server on behalf of each user. It allows multiple client devices per user and stores message history for playback. Key steps to configure Soju:

* **Dockerfile**: Soju’s official builds are on SourceHut, so we’ll build from source. For example:

  ```dockerfile
  FROM golang:1.20-alpine AS build
  RUN apk add --no-cache git build-base
  ENV SOJU_VERSION=v0.7.0
  RUN git clone https://git.sr.ht/~emersion/soju /src && \
      cd /src && git checkout $SOJU_VERSION && \
      make soju sojuctl sojudb

  FROM alpine:3.18
  # Create soju user, etc. (optional)
  COPY --from=build /src/soju /usr/bin/soju
  COPY --from=build /src/sojuctl /usr/bin/sojuctl
  COPY --from=build /src/sojudb /usr/bin/sojudb
  COPY soju.conf /etc/soju/soju.conf
  COPY init-user.sh /usr/bin/init-user.sh
  CMD ["/usr/bin/soju", "-config", "/etc/soju/soju.conf"]
  ```

  This builds Soju and includes our config and an init script.

* **soju.conf (Configuration)**: Soju’s config is simple (one directive per line). Here’s what we’ll include:

  ```ini
  # soju.conf
  hostname irc.curia.network           ;# The hostname Soju presents (use CG domain for proper hostmasking)
  title CommonGround IRC Bouncer
  listen ircs://0.0.0.0:6697           ;# Listen on TCP 6697 with TLS for IRC clients
  listen wss://0.0.0.0:443            ;# (Optional) Listen on 443 for WebSocket clients (for The Lounge or other web UIs)
  tls /etc/soju/certs/fullchain.pem /etc/soju/certs/privkey.pem  ;# TLS cert for ircs:// and wss://
  db postgres "host=${PGHOST} port=${PGPORT} user=${PGUSER} password=${PGPASSWORD} dbname=${PGDATABASE} sslmode=require"
  message-store db                     ;# store messages in the DB (enables full chathistory search)
  http-origin https://embed.curia.network https://curia.network ;# Allow these origins for WebSocket (CORS):contentReference[oaicite:13]{index=13}
  http-ingress https://irc.curia.network ;# External URL for our wss:// listener (for generating WS URIs):contentReference[oaicite:14]{index=14}
  auth http ${SOJU_AUTH_URL}          ;# Use external HTTP auth for user login:contentReference[oaicite:15]{index=15}
  enable-user-on-auth true            ;# Auto-create users on successful external auth:contentReference[oaicite:16]{index=16}
  max-user-networks 1                 ;# (Optional) limit each user to 1 upstream network (just our Ergo)
  ```

  A few notes on this config:

  * We use **two listeners**: one on `ircs://:6697` for conventional IRC clients (TLS), and one on `wss://:443` to accept WebSocket connections over TLS. The latter is useful if The Lounge (or a browser) wants to connect directly via WebSocket. Railway will treat the service as web traffic on port 443, enabling the automatic domain and SSL. We specify allowed `http-origin` patterns so that the WebSocket handshake will be accepted from our domains.
  * The `tls` line points to certificate files. In production, we’ll mount the same cert used for `irc.curia.network` (Railway can provide an environment var for the cert/private key, or we use a wildcard cert for `*.curia.network`). Alternatively, we could terminate TLS at Railway and run Soju’s `listen https://:443` (which speaks HTTP) – but Soju’s `wss://` listener already handles TLS internally.
  * **Database**: We use the `postgres` driver with the environment-infused DSN as discussed. Soju will create tables for users, networks, messages, etc., in this database on first run.
  * **Message store**: `message-store db` means all IRC messages are stored in the Postgres DB (enabling replay and search across restarts).
  * **Authentication**: We set `auth http` to integrate with Common Ground’s user system. Soju will perform an HTTP Basic Auth request to our provided URL for every connection attempt. We need to implement this endpoint in our CG backend (e.g., an API route `/irc-auth`) to verify the credentials:

    * The request will contain an `Authorization: Basic <base64(username:password)>`. The CG server should decode and verify this against its user database.
    * On **200 OK**, Soju considers the credentials valid and (with `enable-user-on-auth true`) will auto-create the bouncer account if it doesn’t exist. On 403, Soju rejects login.
    * This way, **every CG user can use their normal username/password to log into the IRC bouncer**, and we don’t need to pre-provision each one. Their IRC bouncer accounts are created on-the-fly, always staying in sync with CG credentials. (If CG uses hashed passwords, the auth endpoint can check the hash – since Soju just needs a yes/no.)
  * Because all users authenticate externally, you might want at least one admin user in Soju for maintenance. We created one via `init-user.sh` (with `-admin`). Alternatively, you could designate that anyone in a certain CG role becomes admin by customizing Soju (not by default). For now, the admin user can be used for running Soju’s IRC commands like `BouncerServ` management (list users, etc.).

* **Connecting Soju to Ergo**: We need Soju to connect upstream to our Ergo server for each user. How does Soju know what IRC network to connect to? There are two ways:

  1. **Preconfigure a network for each user**: Not scalable to do manually. Instead, we rely on Soju’s automatic network creation. If a client’s username includes a network suffix (like `alice/ergo`), Soju will interpret “ergo” as the network hostname if not already set. We can leverage this by having clients specify a network on connect.
  2. **Default network**: Since we only have one upstream (our Ergo), we can cheat: treat the provided `hostname` as the default network. Soju’s docs: *“If a network specified in the username doesn't exist, and the network name is a valid hostname, the network will be automatically added.”* In practice, if the user connects as `alice/irc.curia.network`, Soju will create a new network entry for `irc.curia.network:6697 TLS` and connect to it.

  In our config, we limited `max-user-networks 1` to keep things simple. We’ll have The Lounge client always request the same network (our ergo). The Ergo server password we set earlier must be supplied to Soju when it creates the network. We can accomplish this by using Soju’s **BouncerServ** command after creation, or by encoding it in the client connection (Soju supports sending a server password via the `PASS` command or `-pass` flag on network create). We will handle it on the client side (The Lounge will provide the server password as part of connection password).

* **Deployment**: When deploying Soju to Railway, ensure the service is marked as “deploy on port 443” (since we want Railway’s domain for the WebSocket listener). In the Railway manifest or settings, set the service to use **port 443**. Railway will then expose `soju-service.up.railway.app` on HTTPS/WS. Since we also have our own TLS in Soju, this might be double TLS. We have two choices:

  * Disable Railway’s TLS termination (if possible) and use a TCP pass-through. (Railway doesn’t currently support arbitrary TCP with custom domains, but a workaround is to use Cloudflare or ngrok).
  * Instead, use `listen https://:443` in Soju with no internal TLS (just HTTP upgrade to WS) and let Railway handle TLS. This requires building Soju with `caddy-l4` or similar proxy, which complicates things. A simpler approach: use **ngrok for dev** and **Railway’s direct domain for prod**.

  Given the complexity, we will do this: **Soju listens on 6697 with TLS** for direct IRC and **on 443 with WebSocket+TLS**. Railway will assign the service a domain (say `soju-production.up.railway.app`). We will add a custom domain `irc.curia.network` pointing to that. We’ll also add an alias for the same service `irc-ws.curia.network` if needed for websockets (or reuse `irc.curia.network` since it’s wss on port 443).

  The cert for `irc.curia.network` is provided by Railway. We should use that in Soju to avoid self-signed. Railway allows downloading the cert/key via the UI; we can then set them as env vars and mount into the container. For example, set `SOJU_TLS_CERT` and `SOJU_TLS_KEY` in Railway (each containing the PEM data) and in Docker entrypoint write them to `/etc/soju/certs`. Then Soju will present a valid SSL certificate for both 6697 and wss\://443 connections.

Once Soju is up, any IRC client can connect to it:

* **External IRC client**: Set server `irc.curia.network`, port 6697, use SSL, and enable SASL PLAIN with your CG username/password. This will log you into the bouncer (Soju), which will then connect you to the Ergo network and hold your connection. (The first time, it auto-adds the network – you might see a message like “Network *irc.curia.network* added.”)
* We can verify Soju’s integration by connecting with a test user: it should accept the same credentials as the CG site.

## Configuring and Deploying **The Lounge** (Web IRC Client)

The Lounge will serve as the web UI for our IRC. We will embed it into the Common Ground app via an iframe. To simplify integration, we’ll run The Lounge in **public mode** (no login screen) and lock it to using our Soju bouncer with SASL. In this mode, The Lounge acts as a client that connects only when a user is actively in the browser, which is fine because Soju will buffer messages when they are away.

Key configuration steps:

* **Dockerfile**: We can use the official The Lounge image (or Node 16+). For example:

  ```dockerfile
  FROM node:18-alpine
  RUN npm install -g thelounge@4.x    # install The Lounge globally
  COPY config.js /home/node/.lounge/config.js
  EXPOSE 9000
  USER node
  CMD ["thelounge", "start", "--config", "/home/node/.lounge/config.js"]
  ```

  This installs The Lounge and uses our custom config. The Lounge will listen on port 9000 by default (we can change or let Railway set \$PORT).

* **config.js**: The Lounge’s config is a JS module. We will modify:

  * `public: true` to disable login (anyone can use it).
  * `defaults` to predefine our IRC network settings.
  * `lockNetwork: true` to prevent changes to host/port.
  * Optionally, `maxHistory` if we want to cap client-side buffer (by default 10000 lines) and `messageStorage` for logging.

  Example `config.js`:

  ```js
  "use strict";

  module.exports = {
    public: true,
    theme: "default",
    defaults: {
      name: "CommonGround IRC",
      host: process.env.IRC_HOST || "irc.curia.network",
      port: process.env.IRC_PORT || 6697,
      password: "",        // We will supply the SASL password at runtime, not in config
      tls: true,
      rejectUnauthorized: true,
      nick: "cguser%%%%",   // default nick (will be replaced with actual username)
      username: "",         // let The Lounge use nick as username by default
      realname: "CommonGround User",
      join: "#general"      // e.g., auto-join a default channel
    },
    lockNetwork: true,
    // Other settings:
    maxHistory: 1000,
    messageStorage: ["sqlite", "text"],  // store logs in ~/.lounge (for persistence across dev restarts)
    // ...
  };
  ```

  In this setup, when The Lounge loads, it will show a connect form already filled with **CommonGround IRC** as the network. The user will only need to enter their nickname and bouncer password. But since we want a seamless experience, we’ll automate that with the embedding step.

  Note: The `password` field in defaults is left empty. We don’t put a static value here because each user’s SASL password is different (their CG account password). Instead, we’ll inject it via the iframe script. The Lounge will use this `password` as the SASL password if the IRC server supports SASL PLAIN – which Soju does. The `nick` default is “cguser%%%%”, meaning if the user doesn’t choose a nick, it generates one like `cguser1234`. We’ll override this with their actual username.

  We set `rejectUnauthorized: true` to verify TLS certs. Since we have a valid cert on Soju’s `irc.curia.network`, this is fine. In dev, we might set it false if using self-signed.

* **Railway deployment**: Expose The Lounge on port 80 (or whatever \$PORT Railway assigns) so that it gets an `embed.curia.network` domain with SSL. After deployment, verify you can open the web interface (it should show a connect page).

* **Local adjustments**: In dev (Docker Compose), we might set `IRC_HOST=soju` and `IRC_PORT=6667` with `tls:false` to connect to the local Soju container without TLS.

At this point, the Lounge is running as a standalone web app. In *public mode*, it doesn’t store user accounts; each browser session is ephemeral. When a user connects, The Lounge will open a connection to Soju (the network settings are pre-filled and network is locked to our bouncer). However, the user still needs to input:

* **Nickname**: We can default it to their username (perhaps via a query param or by pre-filling via embed script).
* **Server password**: This is actually the *SASL password* (their CG credentials) which needs to be provided to Soju. The Lounge UI uses the “Server password” field for SASL if SASL is supported.

We will handle these via the integration described next.

## Local Development with Docker Compose

For a local development environment that closely mirrors production, we’ll use **Docker Compose**. This allows us to run Ergo, Soju, The Lounge, plus Postgres and Redis on localhost, with configuration paralleling Railway’s setup (minus SSL).

Create a `docker-compose.yml` in a dev directory (or one of the repos for convenience):

```yaml
version: "3.9"
services:
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=soju
      - POSTGRES_PASSWORD=soju
      - POSTGRES_DB=soju
    networks:
      - irc-net
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    networks:
      - irc-net
    volumes:
      - redisdata:/data

  ergo:
    build: ../cg-ircd-ergo   # path to ergo Dockerfile
    image: cg/ergo:dev
    networks:
      - irc-net
    ports:
      - "6667:6667"   # expose plaintext IRC for testing (localhost:6667)
    environment:
      ERGO_PASS: "devpass123"   # server password that soju will use
    command: ["ergo", "run", "--conf", "/ergo/ircd.yaml"]
    depends_on:
      - db
      - redis

  soju:
    build: ../cg-irc-bouncer
    image: cg/soju:dev
    networks:
      - irc-net
    # Expose ports for local access:
    ports:
      - "6697:6697"   # TLS port (you can test with an IRC client with self-signed)
      - "6000:6000"   # (Optional) if you use a plain port for WS or ident
    environment:
      PGHOST: db
      PGUSER: soju
      PGPASSWORD: soju
      PGDATABASE: soju
      # Use plain connection to Ergo in dev:
      SOJU_UPSTREAM_HOST: ergo
      SOJU_UPSTREAM_PORT: 6667
      SOJU_UPSTREAM_PASS: "devpass123"
      SOJU_AUTH_URL: "http://host.docker.internal:3000/dev-auth" 
          # (For dev, maybe point to a local mock auth server or skip auth)
    depends_on:
      - db
      - ergo

  lounge:
    build: ../cg-irc-client
    image: cg/lounge:dev
    networks:
      - irc-net
    ports:
      - "9000:9000"   # The Lounge UI on localhost:9000
    environment:
      IRC_HOST: "soju"
      IRC_PORT: 6667
      IRC_TLS: "false"
    # No depends_on, The Lounge can start anytime (will retry connect until soju up)

networks:
  irc-net:
    driver: bridge

volumes:
  pgdata:
  redisdata:
```

Let’s break down what this Compose setup does:

* **Postgres (db)** and **Redis** services for local usage. We use simple credentials (user `soju`/pass `soju`). The Soju service uses these to connect. Redis isn’t explicitly used by our services right now, but it’s running in case we plug it in (for instance, you could configure The Lounge to use Redis for session storage if needed).
* **Ergo**: Listens on `6667` without TLS (we exposed it for local testing). The `ERGO_PASS` is set to `devpass123` and the `ircd.yaml` should reference it in the listener config (or we bake it into the config for dev). Ergo will allow plaintext on this port since it’s local network only.
* **Soju**: We pass environment to point it at the local Ergo:

  * We might modify `soju.conf` for dev to listen on plaintext for easier debugging (e.g., `listen irc+insecure://0.0.0.0:6667` for no TLS on client side). In the above compose, we exposed 6697 for TLS if we want to test with a real client; but The Lounge will use the plaintext port to avoid cert issues in dev.
  * We provided `SOJU_UPSTREAM_HOST=ergo` and port 6667 so that Soju connects to the Ergo container. We also gave `SOJU_UPSTREAM_PASS` to match `ERGO_PASS`.
  * In practice, we can’t directly feed these env vars into soju.conf (it’s not templated). Instead, we might generate the network entry via `sojuctl` in dev, or run Soju without external auth in dev for simplicity. Another approach: run Soju with an initial network: Soju’s CLI can create a network for all users, but since external auth creates users dynamically, auto-add might be easier. For dev, we could just manually create a user and network to simulate a single user.
  * We also pointed `SOJU_AUTH_URL` to a dummy endpoint; for dev, you might not have the full CG backend. You can set `auth internal` for dev (remove the `auth http` line or comment it out in `soju.conf` for local testing, allowing a test user to be created manually).
* **The Lounge**: Connects to Soju on plain TCP (`IRC_TLS:false`). It uses `soju` (the Docker service DNS) as host, which the lounge container will resolve to Soju’s IP. We exposed port 9000 so you can open `http://localhost:9000/` to load the Lounge interface. In config, `lockNetwork` is true, so the network is fixed to “CommonGround IRC (soju)”. The user will see a prompt for nickname and *Server Password*.
* **Startup order**: We have dependencies to ensure DB is up before Soju, and Ergo before Soju (so that when Soju tries to connect upstream it finds Ergo). The Lounge can start anytime.

Now you can run `docker-compose up` and have the whole stack running locally. Use `ngrok` on port 9000 if you want to test the web UI with HTTPS (ngrok will give an HTTPS URL that you can use to embed in a local version of CG app). We have Redis running as well, which you could use to test any caching or to point The Lounge’s SQLite to an in-memory FS.

**Note:** In dev mode, since The Lounge is public, anyone who finds the interface could try to connect. That’s fine on localhost. In production, The Lounge will be served at `embed.curia.network` and presumably behind auth (because the main app controls who can access that page). It’s okay that The Lounge itself has no auth because we’ll embed it in a context where the user is already authed.

## Embedding The Lounge in Common Ground (iframe & postMessage Integration)

The final step is to integrate The Lounge client into the Common Ground web app so that users can seamlessly access IRC. We will embed The Lounge’s web UI in an `<iframe>` on a page in the CG app and use `window.postMessage` to communicate the user’s credentials for auto-login.

**Embedding via iframe**:

* Add an HTML iframe in the CG web frontend, pointing to the Lounge’s URL. For example:

  ```html
  <iframe id="ircFrame" src="https://embed.curia.network" width="100%" height="600"></iframe>
  ```

  Ensure the domain `embed.curia.network` is the one serving The Lounge (with SSL). The Lounge does not set X-Frame-Options denying embedding (no such header by default), so it should display inside an iframe.

* The CG app will know the current user’s username (and possibly an auth token or password). We do **not** want to handle plain-text passwords in the front-end unnecessarily, but since we opted to use CG credentials directly for IRC, we have a couple choices:

  * **Ask the user for an IRC-specific password** (not great UX).
  * **Use their existing password**. If the CG frontend has it (usually it won’t, since it’s hashed on server side), that’s not directly available. Instead, we can create an **IRC access token** for each session.

For simplicity, let’s assume we generate a temporary **IRC token** (maybe JWT or a random string) when the user opens the chat iframe. The CG backend could place this token in a small JS snippet or send via postMessage. We would then have the Soju auth endpoint accept that token as well. (Alternatively, one might bypass this and actually use the user’s real password by asking them once, but that’s less seamless.)

However, to keep things straightforward: we’ll assume the CG app *can* get the user’s plaintext password or a token that Soju will accept. (If using OAuth2 method in Soju, it could accept an OAuth token – but we used basic auth. We could adapt the auth endpoint: if password == “<someToken>”, verify the token server-side.)

**Using postMessage**:

* In the CG parent window (the main app), after the iframe loads, send a message:

  ```js
  const ircFrame = document.getElementById("ircFrame").contentWindow;
  ircFrame.postMessage({
    type: "irc-login",
    nick: currentUser.username,
    pass: ircLoginToken  // could be the actual password or a token that the auth endpoint will accept
  }, "https://embed.curia.network");
  ```

  We send it to the Lounge’s origin. We include the desired nick and password.

* In The Lounge (iframe) side, we need a way to receive this message and act on it. We can achieve this by injecting a small client-side script. There are a few ways:

  * Build a custom Lounge plugin that runs in the browser.
  * Or simply insert a `<script>` in The Lounge’s `index.html` (since we control the container, we can serve an extra script file).

For example, we add in `public/iframe-login.js`:

```js
window.addEventListener("message", (event) => {
  if (event.origin !== "https://curia.network") return;  // only accept from main site
  const data = event.data;
  if (data && data.type === "irc-login") {
    const { nick, pass } = data;
    // Fill in the form fields if present:
    const nickInput = document.querySelector("input[name='nick']");
    const passInput = document.querySelector("input[name='password']");
    if (nickInput && passInput) {
      nickInput.value = nick;
      passInput.value = pass;
      document.querySelector("form.connect").submit();
    }
  }
});
```

This script listens for the `irc-login` message. When received, it finds the nickname and password input fields in The Lounge’s connect form, fills them, and programmatically submits the form. The form submission triggers The Lounge to connect to the network using those credentials (nick as the IRC nick, password as the server/SASL password).

We need to ensure this script is loaded on The Lounge page. We can accomplish that by editing The Lounge’s `index.html` template or via a plugin. The simplest hack: create a plugin that adds a script tag. The Lounge docs allow adding custom client scripts via the plugin API, or we can simply serve a static file and modify the HTML if needed. For brevity, assume we’ve added a line in the lounge config to include this script.

* **postMessage security**: We specify the target origin in `postMessage` (embed.curia.network) and check the sender origin on receipt (curia.network). This ensures only our main app can control the iframe.

* **Workflow**: When a logged-in CG user navigates to the chat page:

  1. The iframe loads `embed.curia.network` (Lounge). Lounge shows the connect UI.
  2. The CG app obtains an IRC auth token from the server (maybe via an AJAX call or embedded in the page).
  3. The CG app sends the postMessage with user’s username (nick) and token.
  4. The script in Lounge receives it, populates the form, and submits.
  5. The Lounge then connects to Soju:

     * It uses `nick` as the IRC nickname (and likely SASL username).
     * It uses `password` as the SASL password (the token).
     * Soju’s auth HTTP endpoint sees the token as the “password”. We can modify our auth logic: if the password looks like a token, verify it (e.g., check a cache or database of valid tokens issued). If valid, find which user it corresponds to and accept. Soju will then auto-create or log in that user account.
     * Soju connects to Ergo on behalf of the user. The Lounge now displays the IRC channels.
  6. The user is now in the web chat without manually logging in or entering anything.

* **Channel embedding**: If you want to embed a specific channel view (say #general) automatically, you can include `join: "#general"` in the defaults or use The Lounge’s client API to join channels. The Lounge by default will auto-join whatever channels were last open; since public mode doesn’t persist, using `defaults.join` ensures they see a channel on connect.

* **Posting messages back to parent**: (Out of scope, but if needed, we could also forward certain events back to the main app using postMessage, e.g., to notify the parent about mentions or unread counts, by writing a Lounge plugin that calls `parent.postMessage`.)

At this point, we have a fully integrated IRC solution:

* **Ergo** provides the IRC protocol layer (channels, messaging, server-side features).
* **Soju** provides multi-device persistence, storing messages in Postgres and authenticating users via CG’s identity.
* **The Lounge** provides a modern web interface accessible as an iframe, connecting to Soju via secure WebSocket/TLS using SASL credentials.
* **Redis** (though not heavily used in this config) is running and could be leveraged to share session state if we ever run multiple Lounge instances or to offload message storage from SQLite to memory. (The Lounge in private mode can persist history in Redis, but here we rely on Soju for history.)

All components can be launched in development via Docker Compose and in production on Railway with minimal changes (mostly enabling TLS and adjusting hostnames). This setup ensures that Common Ground users automatically get an IRC identity (via SASL through Soju, tied to their CG account) and can join IRC channels to chat in real-time. The Lounge’s interface can be embedded wherever needed in the CG app (for example, in an `<iframe>` or modal), and communicate with the host page using `postMessage` for a seamless experience.

**Sources:**

* Ergo official config and features
* Soju usage and configuration (Postgres, external auth)
* The Lounge configuration for public mode and defaults
* The Lounge integration and persistence notes
* Soju bouncer usage (multi-user, SASL login)
