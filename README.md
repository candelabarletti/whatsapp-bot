# 💬 AI Customer Service Bot for WhatsApp & Instagram

An AI-powered customer service bot that answers WhatsApp and Instagram DMs
for small businesses. It receives incoming messages through Meta's webhooks,
uses Claude to generate replies grounded in the business's own information,
and stores conversations in a database so the bot keeps context across
messages.

Built as a real product: the goal is to offer it to local businesses that
get the same questions over and over (hours, prices, availability, bookings)
and can't answer every DM in real time.

<!-- TODO: add a GIF or screenshots of a real conversation here.
     This is the single most useful thing for anyone visiting the repo. -->
<!-- ![Demo](docs/demo.gif) -->

---

## How it works

```
Customer sends a DM (WhatsApp / Instagram)
            │
            ▼
┌───────────────────────┐
│  Meta Webhook          │  Meta forwards the message to the bot's
│  (server.js)           │  public endpoint
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Conversation history  │  Loads previous messages for this customer
│  (Prisma + database)   │  so the bot remembers the context
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Claude                │  Generates a reply using the business info
│                        │  + conversation history
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Meta Graph API        │  Sends the reply back to the customer
└───────────────────────┘
```

<!-- TODO: adjust the diagram if your flow is different
     (e.g. if the bot escalates to a human, add that step). -->

---

## Features

- Handles both **WhatsApp** and **Instagram** DMs from a single backend
- Replies grounded in each business's own information (hours, services, prices, FAQs)
- **Persistent conversation memory** per customer, stored with Prisma
- Configurable per business through environment variables
<!-- TODO: add or remove features so this matches exactly what the bot does today -->

---

## Tech stack

Node.js · JavaScript · Anthropic Claude API · Meta Graph API (WhatsApp Cloud API + Instagram Messaging) · Prisma ORM · <!-- TODO: database (SQLite / PostgreSQL) -->

---

## Project structure

```
whatsapp-bot/
├── server.js          Entry point: webhook endpoints for Meta
├── src/               Bot logic (message handling, Claude calls, Meta API)
├── prisma/            Database schema and migrations
├── scripts/           Utility scripts
├── prisma.config.ts   Prisma configuration
├── .env.example       Required environment variables (no real values)
└── package.json
```

<!-- TODO: list the main files inside src/ with one line each,
     like the support-triage-agent README does -->

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then fill in `.env` with your own values:

| Variable | What it is |
|---|---|
| `ANTHROPIC_API_KEY` | API key from console.anthropic.com |
| `META_ACCESS_TOKEN` | Access token from your Meta developer app |
| `META_VERIFY_TOKEN` | Any string you choose; Meta uses it to verify the webhook |
| `DATABASE_URL` | Database connection string for Prisma |

<!-- TODO: replace this table with the exact variable names in your .env.example -->

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Start the server

```bash
node server.js
```

### 5. Connect the Meta webhook

Meta needs a public HTTPS URL to send messages to. For local testing you can
use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then, in your Meta developer app, set the webhook URL to
`https://<your-ngrok-url>/webhook` and use the same `META_VERIFY_TOKEN` you put
in `.env`.

<!-- TODO: confirm the port and the webhook path match server.js -->

---

## Design choices

- **One backend for two channels:** WhatsApp and Instagram messages both
  arrive through Meta webhooks, so a single server handles both instead of
  maintaining two separate bots.
- **Conversation history in a database:** LLMs don't remember previous
  messages on their own. Storing each customer's history with Prisma lets the
  bot answer follow-up questions naturally.
- **Secrets stay out of the repo:** all keys and tokens live in `.env`, which
  is git-ignored. `.env.example` documents what's needed without exposing
  real values.

---

## Roadmap

- [ ] Hand off to a human when the bot isn't confident or the customer asks for a person
- [ ] Simple dashboard for the business owner to review conversations
- [ ] Per-business knowledge base (upload FAQs instead of editing config)
- [ ] Deploy to a hosted server for 24/7 availability

<!-- TODO: keep only the items you actually plan to build -->

---

## Author

**Candela Barletti** · [GitHub](https://github.com/candelabarletti)
