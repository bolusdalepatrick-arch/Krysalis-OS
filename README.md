# 🦞 Krysalis OS

> A beautiful, unified local command centre for your team's AI agents.
> Built exclusively for the Krysalis ecosystem.

![local](https://img.shields.io/badge/runs-localhost-22d3ee?style=flat-square)
![private](https://img.shields.io/badge/data-stays_local-a855f7?style=flat-square)
![voice](https://img.shields.io/badge/voice-built_in-ec4899?style=flat-square)

A single, powerful dashboard for Claude Code, OpenClaw, Hermes, and your team's custom CLI agents.

Chat. Voice input. Goals. Journal.
Every interaction is auto-logged to the team vault, securely and locally.

---

## ✨ Features

- 💬 **Multi-Agent Chat:** Chat with multiple AI agents from one dashboard.
- 🎤 **Voice Input:** Talk to agents directly via Chrome/Safari.
- 🧠 **Vault Sync:** Every chat becomes a markdown note.
- 🎯 **Goals & Tracking:** Set goals and manage team kanban boards.
- ✨ **Mission-control Aesthetic:** Aurora gradients, glass panels, voice-pulse animations.

---

## 🟢 Deployment

Krysalis OS is designed to be deployed via Docker to a VPS (e.g. Hetzner). 
It runs out-of-the-box using the provided `docker-compose.yml`.

```bash
docker-compose up -d
```

## ⚙️ Configuration

Your team's configuration is mounted automatically to `/app/config`. You can map specific vault locations directly in the docker volumes.

### Minimal config.json

```json
{
  "claude": "/usr/local/bin/claude",
  "openclaw": "/usr/local/bin/openclaw",
  "vaultRoot": "/app/vault",
  "goalCategories": ["Development", "Marketing", "Operations"]
}
```

---

## 🔒 Privacy & Security

- **Self-Hosted:** No third-party accounts, no telemetry.
- Your chats are written **only** to your configured vault.

---

## 📜 Licence

Proprietary. Exclusively for internal Krysalis team use.
