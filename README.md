# WOIA RE Rental Application v0.5.6

Thin shared provider for versioned applications, participant/field-scoped evidence, n-ary guarantees and competent decision recording. Submission, acceptance, Lease, payment and possession remain separate facts.

Portable [Skill](skills/woia-re-rental-application/SKILL.md), [contract](skills/woia-re-rental-application/references/contract.md), [reducer](skills/woia-re-rental-application/scripts/application.mjs) and command schema. No MCP, orchestrator, financial execution or contact adapter. Trusted caller supplies authentic assertions and atomic CAS persistence.

Maintenance: validate a clean exact candidate through WOIA Ecosystem `plugin:certify-thin`; repositories with local tooling also expose `ci:fast` and `release:check`.

Candidate 0.5.6 is not a release. Synthetic regression is not Operator E2E or Production Ready. Maintenance validation scope is recorded in VALIDATION.md.

## Maintenance

Edit only this canonical repository. Keep `plugin.json`, `package.json` and `dev.woia/manifest.json` versions aligned. From the canonical WOIA Ecosystem repository, run `mise run plugin:certify-thin --repo <absolute-plugin-repository>`, then use its release preparation/publication tasks. Install and update consumers from immutable published artifacts; keep Project personalization in overlays.
