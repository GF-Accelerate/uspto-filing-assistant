# Visionary AI Systems, Inc. — IP Ecosystem Business Strategy

**CONFIDENTIAL** | Delaware Corporation (State ID: 10468520) | EIN: 41-3757112
Prepared: April 2026 | Founders: Milton Overton & Lisa Overton

---

## 1. Executive Summary

Visionary AI Systems owns a 10-patent portfolio covering voice-first AI infrastructure, multi-vertical data intelligence, and domain-specific automation across 11 live products. This strategy leverages that IP ecosystem through a **freemium data collection model** that feeds PA-7 (Federated Multi-Vertical Industry Learning System) to build proprietary domain LLMs — creating a defensible competitive moat no single-vertical competitor can replicate.

**Core thesis:** Give away product access to collect domain-specific user data. Use that data (anonymized, federated) to train vertical AI models under PA-7. Those models power premium AI features that justify higher ARPU. The cross-vertical data flywheel creates compounding value — each new user in any vertical improves AI quality across all verticals.

**Revenue trajectory:** $49K/mo (Year 1) -> $242K/mo (Year 2) -> $782K/mo (Year 3)

---

## 2. Patent Portfolio Overview

### Visionary AI Systems, Inc.

| ID | Title | Status | Moat Value |
|----|-------|--------|------------|
| PA-1 | Voice-Controlled Database Query + Agent Execution | FILED (64/029,100) | Foundation — voice-to-database is core differentiator |
| PA-2 | Athletic Department Management Platform | Ready | Vertical-specific — athletic domain lock-in |
| PA-3 | Multi-Modal Campaign Orchestration via Voice | Ready | Revenue driver — marketing automation backbone |
| PA-4 | Predictive Sports Revenue Intelligence Engine | Draft | Data asset — predictive models from CSOS data |
| PA-5 | Voice-First Agentic Database Infrastructure (VADI) | Ready | **Platform moat** — 7 primitives, licensable infrastructure |
| PA-6 | Conversational AI-Guided IP Development Platform | Ready | Meta-patent — this app IS the embodiment |
| PA-7 | Federated Multi-Vertical Industry Learning System | Ready | **Data flywheel** — legal foundation for entire strategy |
| PA-8 | Adaptive Multi-Model AI Orchestration | Draft | AI independence — confidence-based model routing |
| PA-9 | Domain-Adaptive Worship & Community Technology | Planned | Vertical expansion — faith community niche |
| PA-10 | Voice-First Financial Planning Infrastructure | Planned | Regulated vertical — high-value data moat |

### Cross-Entity

| ID | Entity | Status |
|----|--------|--------|
| RS-1 | Revenue Shield AI, LLC | FILED (63/862,821) — separate entity, firewalled |
| PGI-1 | Visionary AI Systems Inc | Filing — Milton solo inventor |

---

## 3. Freemium Strategy by Product

### 3.1 Visionary Marketing Automation — PRIMARY DATA ENGINE

**Why free tier:** Lowest privacy risk, highest data volume potential, most mature Stripe integration.

| Feature | Free | Pro ($49/mo) | Enterprise ($499-$2,499/mo) |
|---------|------|-------------|---------------------------|
| Active campaigns | 3 | 25 | Unlimited |
| Contacts | 500 | 10,000 | Unlimited |
| Email sends/mo | 1,000 | 50,000 | Unlimited |
| AI subject line suggestions | 5/mo | Unlimited | Unlimited + custom training |
| Lead scoring | Basic (3 signals) | Advanced (12 signals) | Custom model |
| Analytics retention | 7 days | 90 days | Unlimited + export |
| A/B testing | No | Yes | Multivariate |
| API access | No | Read-only | Full |

**Conversion triggers:**
- 4th campaign creation ("Upgrade to run unlimited campaigns")
- 500-contact limit hit ("Keep growing your audience")
- A/B test attempted ("Unlock A/B testing on Pro")

**PA-7 data collected (Category B — anonymized, opt-in):**
- Campaign engagement curves (time-series)
- Send-time optimization signals
- Subject line token effectiveness
- Audience segment response differentials
- Lead scoring signal weights
- Funnel stage transition probabilities

### 3.2 MDALS Virtual Church — FAITH COMMUNITY VERTICAL

**Why free tier:** Unique domain data no competitor has. Medium privacy risk (religious data sensitivity).

| Feature | Free | Ministry ($29/mo) | Cathedral ($199/mo) |
|---------|------|-------------------|---------------------|
| Congregation size | 50 members | 500 members | Unlimited |
| Sermon hosting | 5 | Unlimited | Unlimited + analytics |
| Community features | Basic chat | Groups + events | Full platform |
| AI sermon insights | No | Basic | Advanced + prep |
| Giving integration | No | Basic | Full + reporting |
| Content library | Public only | Denomination-specific | Custom + AI curation |

**CRITICAL PRIVACY RULE:** Religious data (prayer requests, denomination, beliefs) is NEVER used for PA-7 training. GDPR Article 9 special category. Only non-religious engagement patterns (content viewing duration, event attendance timing) contribute to PA-7.

**PA-7 data collected (Category B — extra anonymization):**
- Content engagement curves (how long users engage)
- Community interaction graph metrics (density, clustering — NOT individual edges)
- Event attendance patterns (day/time/seasonality)
- Group formation/dissolution patterns

### 3.3 AI Interactive Vision Board — VOLUME PLAY

**Why fully free:** Lowest privacy risk, widest funnel, engagement pattern data at scale.

| Feature | Free | Premium ($9/mo) |
|---------|------|-----------------|
| Vision boards | 3 | Unlimited |
| AI goal suggestions | Basic | Personalized + cross-domain |
| Progress tracking | Manual | Automated + reminders |
| Community | View only | Full participation |

**PA-7 data collected (Category B):**
- Goal category distributions
- Engagement pattern correlations
- Goal completion rates by category/timeframe
- Cross-goal correlation patterns

### 3.4 FirePath Financial Aid — NO FREE TIER

**Why no free tier:** Financial data is too regulated (GLBA, SOX). Free tier signals "you are the product" — destroys trust.

| Feature | 14-Day Trial | Individual ($19/mo) | Advisor ($99/mo) |
|---------|-------------|---------------------|-------------------|
| Pension calculator | Full | Full | Full + batch |
| Monte Carlo sims | Full | Full | Unlimited + custom |
| Plaid integration | No | Yes | Yes + multi-client |
| Reports | Basic | Standard | Custom + white-label |

**PA-7 data collected (Category B — MAXIMUM anonymization, k>=50, epsilon=0.5):**
- Aggregate spending category distributions (never individual)
- Retirement readiness score distributions (statistical summaries only)
- Savings rate trajectories (anonymized cohort curves)
- Financial goal completion rates by goal type

### 3.5 Revenue Shield — FIREWALLED

No free tier. Separate LLC. No data sharing with VAIS without formal DPA.

---

## 4. PA-7 Data Pipeline Architecture

### Data Categories

| Category | Description | Used for PA-7? | Anonymization |
|----------|-------------|----------------|---------------|
| A — Functional | Required for product operation | No | N/A — stays in product |
| B — Analytical | Behavioral patterns (opt-in) | Yes | PII scrub -> k-anonymity -> differential privacy |
| C — Sensitive | PII, financial, religious | Never | Encrypted at rest, access-logged |

### Anonymization Pipeline

```
User Action -> Product Event Log -> PII Scrubber (strip identifiers)
  -> k-Anonymity (k >= 50, no data point < 50 users)
  -> Differential Privacy (epsilon per vertical)
  -> Temporal Aggregation (weekly minimum)
  -> Anonymized Feature Store
  -> PA-7 Federated Learning
```

**Differential privacy epsilon values:**
- Marketing data: epsilon = 1.0 (moderate noise, high utility)
- Financial data: epsilon = 0.5 (significant noise, strict privacy)
- Community data: epsilon = 0.1 (maximum noise — religious-adjacent)
- Personal growth: epsilon = 0.8 (moderate-low noise)

### Federated Learning Protocol

Each vertical trains a LOCAL model on its anonymized feature store. Only **gradient updates** (mathematical weight deltas, NOT raw data) cross vertical boundaries. The aggregation server uses Federated Averaging (FedAvg) to combine updates into a cross-vertical meta-model.

```
Marketing Model ─┐
MDALS Model ─────┼─> Gradient Updates ─> Aggregation Server ─> Meta-Model
Vision Board ────┤                         (no raw data)
FirePath Model ──┘
```

The meta-model learns cross-vertical patterns (e.g., "Tuesday engagement" discovered independently by marketing and community verticals) that can be applied to verticals with insufficient data.

---

## 5. Revenue Projections

### Year 1 — Foundation ($49K/mo)

| Product | Free Users | Paid Users | ARPU | Monthly Revenue |
|---------|-----------|-----------|------|-----------------|
| Marketing Automation | 2,000 | 200 | $149 | $29,800 |
| MDALS Virtual Church | 500 | 50 | $79 | $3,950 |
| FirePath Financial | 0 | 300 | $49 | $14,700 |
| AI Vision Board | 5,000 | 100 | $9 | $900 |
| **Total** | **7,500** | **650** | | **$49,350/mo** |

Focus: Marketing Automation free tier growth. Only MA generates enough data for PA-7.

### Year 2 — AI Features ($242K/mo)

| Product | Free Users | Paid Users | ARPU | Monthly Revenue |
|---------|-----------|-----------|------|-----------------|
| Marketing Automation | 8,000 | 800 | $199 | $159,200 |
| MDALS Virtual Church | 2,000 | 200 | $99 | $19,800 |
| FirePath Financial | 0 | 1,000 | $59 | $59,000 |
| AI Vision Board | 15,000 | 500 | $9 | $4,500 |
| **Total** | **25,000** | **2,500** | | **$242,500/mo** |

ARPU increases: PA-7 models enable premium AI features (better lead scoring, smarter recommendations).

### Year 3 — Cross-Vertical Moat ($782K/mo)

| Product | Free Users | Paid Users | ARPU | Monthly Revenue |
|---------|-----------|-----------|------|-----------------|
| Marketing Automation | 20,000 | 2,000 | $249 | $498,000 |
| MDALS Virtual Church | 5,000 | 500 | $119 | $59,500 |
| FirePath Financial | 0 | 3,000 | $69 | $207,000 |
| AI Vision Board | 40,000 | 2,000 | $9 | $18,000 |
| **Total** | **65,000** | **7,500** | | **$782,500/mo** |

PA-7 data flywheel fully operational. Cross-vertical insights create features competitors cannot replicate.

### Year 3+ — API Licensing Revenue

PA-7 models can be licensed as APIs:
- Marketing Engagement Timing API: $0.001-0.01/call
- Community Health Index API: $500-2,000/mo
- Financial Wellness Signal API: $1,000-5,000/mo
- Estimated API licensing: $10K-50K/mo additional

---

## 6. Filing Priority (Updated)

| Priority | Patent | Action | Cost | Rationale |
|----------|--------|--------|------|-----------|
| 1 | PA-5 VADI | File immediately | $320 | Platform licensing moat — 7 primitives |
| 2 | PA-7 Federated Learning | File THIS WEEK | $320 | **Legal foundation for entire data strategy** |
| 3 | PA-2 + PA-3 | File by April 27 | $640 | CRITICAL deadline — 23 days remaining |
| 4 | PA-6 IP Platform | File this week | $320 | Patent Filing Assistant = live evidence |
| 5 | PA-8 Multi-Model | Draft by May | $320 | Confidence routing + ephemeral tokens |
| 6 | PA-4 Revenue Intel | File May 27 | $320 | Predictive sports analytics |
| 7 | PA-9 Worship Tech | File June | $320 | Denomination-aware vertical |
| 8 | PA-10 Financial | File June | $320 | Regulated financial vertical |

**Total remaining filing cost: $2,880** (9 provisionals x $320)

**KEY CHANGE: PA-7 elevated to Priority 2.** Without PA-7 filed, any competitor could implement the same federated learning approach across verticals. PA-7 is the legal foundation for the entire freemium-to-domain-LLM strategy. File before launching any free tiers.

---

## 7. Privacy Compliance Framework

### Regulatory Requirements

| Regulation | Applies To | Key Requirements |
|------------|-----------|------------------|
| CCPA/CPRA | All products (CA users) | Right to know, delete, opt-out of "sale" |
| GDPR | All products (EU users) | Lawful basis, data minimization, Art. 9 for religious |
| GLBA | FirePath only | Financial privacy notices, opt-out of non-affiliate sharing |
| FTC Act Sec 5 | All products | No unfair/deceptive data practices |

### Consent Architecture

Every product at registration:
1. **[Required]** Terms of Service + Privacy Policy (enables Category A)
2. **[Optional]** "Contribute anonymized data to improve AI" (enables Category B / PA-7)
3. **[Optional]** "Receive cross-product recommendations" (enables PA-7 inference)

MDALS additional: Explicit disclosure that NO religious data feeds AI training — ever.
FirePath additional: GLBA Privacy Notice (separate document, annual re-notification).

### Legal Budget

- Privacy attorney (AI/ML data use): $10K-20K
- GLBA compliance specialist (FirePath): $5K-10K
- Religious data protection attorney (MDALS): $5K-8K
- Ongoing annual privacy audit: $15K-25K/year
- **Total Year 1: $35K-63K**

---

## 8. Competitive Moat Analysis

### Why This Is Hard to Replicate

1. **Patent Fence (10 patents):** Competitors cannot implement voice-to-database (PA-1), VADI infrastructure (PA-5), or federated cross-vertical learning (PA-7) without licensing.

2. **Cross-Vertical Data Flywheel:** No single-vertical competitor (HubSpot, Tithe.ly, Betterment) has access to cross-vertical behavioral data. The PA-7 meta-model improves ALL verticals simultaneously.

3. **HITL Non-Bypass Gate:** Every patent includes non-bypassable human authorization — distinguishes from LangGraph, CrewAI, and HumanLayer which allow programmatic bypass.

4. **Time-to-Replicate:** A competitor would need to:
   - Build 4+ products across different verticals (12-24 months)
   - Accumulate sufficient domain data in each (12-18 months)
   - Implement federated learning without violating PA-7 (requires license)
   - Total: 2-4 years minimum, if they start today

5. **Network Effects:** Cross-product integrations (e.g., faith-based fundraising via Marketing + MDALS) create switching costs and compound user value.

---

## 9. Strategic Recommendations

### Immediate (This Week)
1. File PA-5 VADI ($320) — platform licensing moat
2. File PA-7 Federated Learning ($320) — data strategy legal foundation
3. Sign Assignment Agreement (Milton/Lisa -> VAIS)
4. Enter PGI-1 filing receipt data

### Near-Term (April 2026)
5. File PA-2 + PA-3 by April 27 ($640) — CRITICAL deadline
6. File PA-6 ($320) — Patent Filing Assistant is live evidence
7. Enable Marketing Automation free tier with Category B consent
8. Launch AI Vision Board free tier

### Medium-Term (May-June 2026)
9. Draft PA-8 spec (confidence routing + ephemeral tokens)
10. File PA-4 ($320)
11. Begin MDALS free tier with restricted data collection
12. Launch FirePath 14-day trial (no free tier)
13. Set up anonymization pipeline (PII scrubber + k-anonymity)

### Long-Term (H2 2026)
14. First PA-7 vertical model training (Marketing Automation data)
15. File PA-9, PA-10 ($640)
16. Deploy AI-powered premium features (send-time optimization, predictive scoring)
17. Begin cross-vertical federated aggregation
18. Engage privacy counsel for annual audit

---

## 10. Implementation Phases

### Phase 1: Foundation (Months 1-3)
- File PA-5, PA-7, PA-2, PA-3, PA-6
- Launch Marketing Automation + Vision Board free tiers
- Implement Category B consent and event collection
- Budget: $1,920 (filing) + $15K (legal)

### Phase 2: First Models (Months 4-6)
- Train first engagement model on Marketing Automation data
- Launch MDALS free tier (restricted Category B)
- Launch FirePath 14-day trial
- Deploy first AI features to Marketing paid tiers
- Budget: $2K/mo (compute)

### Phase 3: Cross-Vertical (Months 7-12)
- File PA-8, PA-4, PA-9, PA-10
- Implement federated aggregation (Marketing + Vision Board)
- Begin cross-product recommendation engine
- First external privacy audit
- Budget: $960 (filing) + $5K/mo (compute) + $20K (audit)

### Phase 4: Scale (Months 13-24)
- Add MDALS and FirePath vertical models
- Full four-vertical federated learning operational
- Launch API licensing program for PA-7 models
- Budget: $8K/mo (compute) + $25K/year (audit)

### Phase 5: Moat (Months 25-36)
- PA-7 data flywheel fully operational
- AI features = primary product differentiation
- Cross-vertical insights create un-replicable advantage
- Consider acquisition of complementary vertical products
- Target: $782K/mo ARR

---

*This document is the property of Visionary AI Systems, Inc. and is intended for internal strategic planning purposes only.*
