# Social Syndication Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Merchants publish once to FO feed + Facebook, Instagram, LinkedIn (demo without keys, live when env configured).

**Architecture:** Signature service + provider adapters + OAuth endpoints; orchestrator unchanged in spirit; merchant publish UI with connect + provider checkboxes.

**Tech Stack:** Rails 8 API, React merchant dashboard, Meta/LinkedIn OAuth when env present.

## Global Constraints

- Providers V1: facebook, instagram, linkedin only in merchant UI
- Text signature on network posts; optional photo; no generated banner
- Subscription required to publish/syndicate
- Demo mode when META_*/LINKEDIN_* missing or token == "demo"

---

### Task 1: Backend signature + adapters + config
### Task 2: OAuth + social_accounts demo/live connect
### Task 3: Wire PublicationCreator / SocialPublisher
### Task 4: Merchant publish UI
### Task 5: Env example + smoke test
