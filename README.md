# USPTO Patent Filing Assistant

> AI-powered provisional patent filing assistant for Visionary AI Systems Inc

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GF-Accelerate/uspto-filing-assistant)

**Live:** [uspto-filing-assistant.vercel.app](https://uspto-filing-assistant.vercel.app)  
**Owner:** Visionary AI Systems Inc — Milton & Lisa Overton  
**Status:** Patent Pending — U.S. Provisional Applications Filed March 28, 2026

---

## What This Does

A production-grade, AI-first web application that prepares, validates, and guides
US provisional patent applications through the USPTO Patent Center filing process.

The AI (Claude) handles all document preparation and validation. You handle
authentication (ID.me + MFA) and the final Submit click — as USPTO requires.

### Key Features

- **Patent Portfolio Dashboard** — track all 5 patents with live deadline countdowns
- **6-Step Filing Wizard** — AI extracts filing data, generates cover sheet, validates
- **14-Point HITL Checklist** — human-in-the-loop compliance gate before filing
- **Step-by-Step Guide** — pre-populated Patent Center walkthrough
- **Filing Receipt Recorder** — saves application numbers and starts 12-month clock
- **Fee Calculator** — current USPTO fees with small entity rates
- **Deadline Tracker** — color-coded urgency for all critical dates

---

## Patent Portfolio

| ID | Title | Status | Deadline |
|----|-------|--------|----------|
| PA-1 | Voice-Controlled Database Query + Autonomous Agent Execution | Filed ✓ | Mar 28, 2027 |
| PA-2 | Athletic Department Management Platform | Ready to file | Apr 27, 2026 |
| PA-3 | Multi-Modal Campaign Orchestration via Voice | Ready to file | Apr 27, 2026 |
| PA-4 | Predictive Sports Revenue Intelligence Engine | In progress | May 27, 2026 |
| PA-5 | Voice-First Agentic Database Infrastructure | Planned | — |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Deployment | Vercel |
| State | React hooks + localStorage |

---

## Quick Start

```bash
# Clone
git clone https://github.com/GF-Accelerate/uspto-filing-assistant.git
cd uspto-filing-assistant

# Install
npm install

# Configure
cp .env.example .env
# Edit .env: add your VITE_ANTHROPIC_API_KEY

# Develop
npm run dev

# Build
npm run build
```

---

## Environment Variables

```bash
VITE_ANTHROPIC_API_KEY=sk-ant-...   # Required: get from console.anthropic.com
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Set `VITE_ANTHROPIC_API_KEY` in Vercel environment variables
4. Deploy — builds automatically on every push to `main`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

---

## Why Authentication Cannot Be Automated

USPTO Patent Center now requires [ID.me](https://id.me) biometric verification
(government photo ID + live video selfie) and multi-factor authentication via
Okta Verify. These security requirements are intentional human verification
checkpoints that no AI tool can bypass. This application handles everything up to
and after authentication — the login step itself requires your physical presence.

---

## AI Development

This project follows AI-first development practices. See [CLAUDE.md](./CLAUDE.md)
for complete instructions for AI coding assistants.

---

## Legal

Patent Pending — U.S. Provisional Patent Applications filed March 28, 2026.  
Assignee: Visionary AI Systems Inc, Kennesaw GA 30144.  
Inventors: Milton Overton & Lisa Overton.

This software assists in preparing patent applications. It does not constitute
legal advice. Consult a registered USPTO patent attorney before filing.
