# Canonical rental contract


RentalApplication is property/terms context, not acceptance. ApplicationParticipant retains Subject+role. ApplicationEvidenceLink retains application+subject+document+version+purpose. Guarantee is distinct from participant role. GuaranteeCoverage preserves property+obligation scope+coverage scope+terms.

apply(state,request) validates current grant/source/evidence and operation/revision before mutation. Create is DRAFT; updates retain versions; submit records submission only. Evidence never promotes extraction into accepted fact. Decision requires submitted exact application version and competent human attribution. Guarantee updates retain originals; ACCEPTED requires exact competent decision. No payment, lease or possession inference.

Authority carries organization/actor/current policy revision/purpose/actions/resources/participants/fields, validity/revocation/hold/stop. participant_scope and field_scope narrow operations; full participant scope is required for submission and decisions. projectApplication checks scope before storage callback and projects participant+field tuples; it is an internal projection helper, not an invented action.

Leasing owns all mutations and competent decisions. Customer Service may record intake create/update/submit/evidence links within exact grants. Legal Compliance and Data contribute evidence links only; they cannot create/submit applications or mutate guarantees. Their authorized field projections remain available. All guarantee mutations require Leasing, even when proposed and even with a generic resource grant.

Source assertion carries organization, writer provider, source, fact kinds, targets, map revision, effective validity and conflict/revocation. Evidence carries original source/reference/version, recorded/freshness time and fact kind. Human decision binds competent principal, organization, action, target, exact payload digest, policy revision, reference and effective window. Trusted Core/organization resolution supplies assertions; user self-assertions are not proof. Digest uses exact JSON serialization: preserve approved material unchanged.

Caller must atomically persist state/history/replay with expected revision, fencing and source business uniqueness and recheck current authority at commit. Helpers are not storage, form/Documents adapters, approval-resolution or live runtime enforcement. No universal backend, screening rules or financial policy is selected.
