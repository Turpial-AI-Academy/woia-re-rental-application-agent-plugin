---
name: woia-re-rental-application
description: Record versioned rental applications, participant-scoped evidence and n-ary guarantees with competent decision attribution. Use for application intake, submission, guarantee review and scoped evidence linking.
license: MIT
---

# Rental Application

Read [the contract](references/contract.md) before accessing participant data. Resolve current action, target, organization, purpose, participant and field grants; exact Source Authority Map and fresh versioned evidence. Missing access is denial before retrieval.

Use [the reducer](scripts/application.mjs) for rental-application.create/update/submit/evidence.link/decision.record and guarantee.create/update. Request shapes: [schema](schemas/command.schema.json). Runtime guards remain mandatory.

Identity supplies Subject references. Link application+participant+document+version+purpose together. Guarantee participants do not imply coverage: preserve property+obligation scope+coverage scope+terms as a n-ary tuple.

Submission, completeness and score do not authorize acceptance. Accepted guarantees and application decisions require exact competent human attribution, policy and effective validity. No legal applicability or private screening policy is invented.

No contact or financial effects here. Missing-data requests go through Customer Service and Communications. Lease Administration owns Lease; Finance owns money.

The reducer is pure. Trusted caller verifies assertions before loading private records, atomically persists state/history/idempotency via expected revision/CAS and rechecks revocation at commit. Report synthetic regression separately from live adapters, Operator E2E or Production Ready.
