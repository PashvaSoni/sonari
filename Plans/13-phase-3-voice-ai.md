# 13 — Phase 3: Voice & AI

**Last-updated:** 2026-07-03
**Duration:** 4–6 weeks
**Goal:** hands-free billing plus proactive AI insights.

---

## Feature list

### Voice-to-bill
- [ ] Browser mic capture with silence detection
- [ ] Streaming STT via Whisper (or Deepgram)
- [ ] Multi-language toggle (English + Hindi + regional — auto-detect via provider)
- [ ] LLM extraction of intent with structured JSON output (Zod-validated)
- [ ] Rule-engine validation (any hallucinated math is rejected; totals always come from `packages/domain`)
- [ ] Confirmation UI with uncertain fields flagged
- [ ] Full offline degradation: mic disabled with a "connect to internet for voice" toast

### Chat mode LLM upgrade
- [ ] Same LLM stack now powers chat mode (still with quick-reply chips + deterministic reducer)
- [ ] Free-text answers ("do gram ka chain") are parsed via LLM
- [ ] Auto-suggest customer, item, and old gold from history

### AI insights
- [ ] "Today's brief" widget on dashboard — one-paragraph LLM summary of yesterday's business + suggestions ("Silver rates rose 3%; consider updating price tags on silver stock.")
- [ ] Anomaly alerts (wastage % outside karigar's usual range, big discounts, unusual payment mix)
- [ ] Smart replies for customer WhatsApp queries (opt-in, human-in-loop confirm)

### Search upgrade
- [ ] Natural-language search "chains under 10 gram in stock" → runs a structured query
- [ ] Semantic search over notes and item descriptions (embeddings in pgvector)

### Domain prompt library
- [ ] `packages/llm/prompts` versioned prompts
- [ ] Eval harness: 200 gold-standard prompts + expected outputs, run in CI
- [ ] Metric: extraction accuracy ≥ 95% on eval set before shipping to any tenant

---

## Architecture notes

- LLM is **never** trusted for money math.
- LLM output must match Zod schema; on failure, retry once with error included in the prompt.
- Cost caps per tenant per day (config in plan features).
- Provider fallback chain (Anthropic → OpenAI → Groq) with per-tenant preference.

---

## Non-goals for Phase 3
- Fine-tuned models — deferred until we have real transcript data
- End-customer chatbots (Phase 4)
- Predictive stock ordering (Phase 4)

---

## Acceptance criteria

- [ ] 30-second voice input generates a correctly totalled draft bill in 95%+ of test cases
- [ ] LLM voice cost per bill < ₹2 average
- [ ] Users can complete a bill via voice in < 45 seconds median
- [ ] Anomaly alerts have ≤ 1 false positive per store per week
