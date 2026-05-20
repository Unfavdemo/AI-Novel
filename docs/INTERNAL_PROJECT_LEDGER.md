# Internal project ledger

> **Internal use only** — for pricing calculations and delivery tracking. Not shown in the public app.

## Client contract

| Item | Amount | Notes |
|------|--------|-------|
| Total contract | $1,200 USD | |
| Deposit received | $500 USD | Cash App |
| Remaining balance | $700 USD | Due upon project completion |

## Store & infrastructure fees

| Item | Cost | Billing |
|------|------|---------|
| Apple App Store | $100/year | Developer Program |
| Google Play Store | $25 one-time | Registration |

## AI API operational costs (ongoing)

| Service | Dev / testing | Post-launch scale |
|---------|---------------|-------------------|
| ElevenLabs | Free tier (`ELEVENLABS_PLAN=free`, ~10k chars/mo cap in app) | Starter ~$5/mo (`ELEVENLABS_PLAN=starter`) + usage |
| OpenAI (manuscript) | Pay-as-you-go tokens | Scales with generation volume |

Token and character usage are recorded in the `usage_events` table for monthly rollups.

## Build reference

See [CLIENT_PRICING_AND_TCO.md](./CLIENT_PRICING_AND_TCO.md) for five-year TCO scenarios and non-AI hosting estimates.
