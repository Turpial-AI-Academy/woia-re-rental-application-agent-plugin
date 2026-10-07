# WOIA RE Rental Application v0.5.0

Thin shared provider for versioned applications, participant/field-scoped evidence, n-ary guarantees and competent decision recording. Submission, acceptance, Lease, payment and possession remain separate facts.

Portable [Skill](skills/woia-re-rental-application/SKILL.md), [contract](skills/woia-re-rental-application/references/contract.md), [reducer](skills/woia-re-rental-application/scripts/application.mjs) and command schema. No MCP, orchestrator, financial execution or contact adapter. Trusted caller supplies authentic assertions and atomic CAS persistence.

Maintenance: mise run bootstrap; mise run doctor; mise exec -- pnpm test; mise run ci:fast. Clean candidate: Ecosystem v0.5.4 mise run plugin:certify-thin --repo <absolute-path>.

Candidate 0.5.0 is not a release. Synthetic regression is not Operator E2E or Production Ready. Maintenance validation scope is recorded in VALIDATION.md.
