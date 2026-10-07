import { begin, finish, fields, human, requireValue as need, references } from './guard.mjs';

export const actions = ['rental-application.create', 'rental-application.update', 'rental-application.submit', 'rental-application.evidence.link', 'guarantee.create', 'guarantee.update', 'rental-application.decision.record'];
export const initialState = organization => ({ organization, revision: 0, applications: {}, guarantees: {}, operations: {}, history: [] });
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
const own = (map, key) => Object.hasOwn(map, key);
function scoped(request, participants, selectedFields) {
  need(Array.isArray(participants) && participants.length && participants.every(p => id(p) && request.authority.participants?.includes(p)), 'PARTICIPANT_ACCESS_DENIED');
  need(Array.isArray(selectedFields) && selectedFields.every(f => id(f) && request.authority.fields?.includes(f)), 'FIELD_ACCESS_DENIED');
}
function participants(request, rows) {
  need(Array.isArray(rows) && rows.length && rows.every(p => p && id(p.subject_id) && id(p.participant_role) && Object.keys(p).every(k => ['subject_id','participant_role'].includes(k))), 'PARTICIPANTS_REQUIRED');
  need(new Set(rows.map(p => `${p.subject_id}|${p.participant_role}`)).size === rows.length, 'DUPLICATE_PARTICIPANT');
  scoped(request, rows.map(p => p.subject_id), ['participants']);
  references(request, rows.map(p => p.subject_id));
}
function values(request, rows, members) {
  need(Array.isArray(rows), 'FIELD_VALUES_REQUIRED');
  const keys = new Set();
  for (const row of rows) {
    fields(row, ['subject_id','field','value']);
    need(members.includes(row.subject_id) && id(row.field), 'FIELD_PARTICIPANT_MISMATCH');
    scoped(request, [row.subject_id], [row.field]);
    need(typeof row.value === 'string' && row.value.length <= 4096, 'INVALID_FIELD_VALUE');
    const key = `${row.subject_id}|${row.field}`;
    need(!keys.has(key), 'DUPLICATE_FIELD'); keys.add(key);
  }
}
export function apply(state, request) {
  need(['leasing','customer-service','legal-compliance','data'].includes(request.authority?.department), 'DEPARTMENT_DENIED');
  if(['legal-compliance','data'].includes(request.authority.department)) need(request.action==='rental-application.evidence.link','CONTRIBUTION_ONLY');
  if(request.action?.startsWith('guarantee.')) need(request.authority.department==='leasing','COMPETENT_OWNER_REQUIRED');
  if(request.action==='rental-application.decision.record' || request.payload?.status==='ACCEPTED') need(request.authority.department==='leasing','COMPETENT_OWNER_REQUIRED');
  const context = begin(state, request, actions, 'woia-re-rental-application');
  if (context.replay) return { state: context.next, result: context.replay };
  const p = request.payload, n = context.next;
  need(id(request.target), 'INVALID_TARGET');
  let entity, result;
  if (request.action === 'rental-application.create') {
    fields(p, ['property_id','terms_ref','participants','field_values']);
    need(!own(n.applications,request.target), 'APPLICATION_EXISTS');
    participants(request,p.participants); references(request,[p.property_id,p.terms_ref]);
    scoped(request,p.participants.map(x=>x.subject_id),['property_id','terms_ref']);
    values(request,p.field_values,p.participants.map(x=>x.subject_id));
    entity={id:request.target,version:1,status:'DRAFT',participants:structuredClone(p.participants),property_id:p.property_id,terms_ref:p.terms_ref,field_values:structuredClone(p.field_values),evidence_links:[],decisions:[],versions:[]};
    n.applications[request.target]=entity;
  } else if (request.action.startsWith('rental-application.')) {
    // Access is checked on the requested scope before retrieving any domain record.
    need(Array.isArray(request.participant_scope) && request.participant_scope.length, 'PARTICIPANT_ACCESS_DENIED');
    scoped(request,request.participant_scope,request.field_scope);
    need(own(n.applications,request.target),'APPLICATION_NOT_FOUND'); entity=n.applications[request.target];
    need(request.participant_scope.every(s=>entity.participants.some(x=>x.subject_id===s)), 'PARTICIPANT_MISMATCH');
    if (request.action === 'rental-application.update') {
      fields(p,['field_values']); need(entity.status==='DRAFT','DRAFT_REQUIRED');
      values(request,p.field_values,request.participant_scope);
      need(p.field_values.every(v=>request.field_scope.includes(v.field)), 'REQUEST_FIELD_SCOPE');
      entity.versions.push(structuredClone({...entity,versions:undefined})); entity.version++;
      for (const v of p.field_values) { const i=entity.field_values.findIndex(x=>x.subject_id===v.subject_id&&x.field===v.field); if(i<0) entity.field_values.push(structuredClone(v)); else entity.field_values[i]=structuredClone(v); }
    } else if (request.action === 'rental-application.evidence.link') {
      fields(p,['subject_id','document_id','document_version_id','evidence_purpose']);
      need(request.participant_scope.includes(p.subject_id), 'EVIDENCE_PARTICIPANT_SCOPE');
      scoped(request,[p.subject_id],['evidence_links']); need(request.field_scope.includes('evidence_links'),'REQUEST_FIELD_SCOPE');
      need(id(p.evidence_purpose),'EVIDENCE_PURPOSE_REQUIRED'); references(request,[p.document_id,p.document_version_id]);
      need(!entity.evidence_links.some(x=>JSON.stringify(x)===JSON.stringify(p)), 'DUPLICATE_EVIDENCE'); entity.evidence_links.push(structuredClone(p));
    } else {
      need(entity.participants.every(x=>request.participant_scope.includes(x.subject_id)), 'FULL_PARTICIPANT_SCOPE_REQUIRED');
      if(request.action==='rental-application.submit') {
        fields(p,[]); scoped(request,request.participant_scope,['status']); need(request.field_scope.includes('status'),'REQUEST_FIELD_SCOPE'); need(entity.status==='DRAFT','DRAFT_REQUIRED'); entity.status='SUBMITTED';
      } else {
        fields(p,['decision','application_version','reason_ref']);
        scoped(request,request.participant_scope,['decisions']); need(request.field_scope.includes('decisions'),'REQUEST_FIELD_SCOPE');
        need(entity.status==='SUBMITTED' && p.application_version===entity.version, 'SUBMITTED_VERSION_REQUIRED');
        need(['ACCEPTED','REJECTED','DEFERRED'].includes(p.decision),'DECISION_REQUIRED'); references(request,[p.reason_ref]); human(request);
        entity.decisions.push({ ...structuredClone(p), evidence:structuredClone(request.evidence), approval_ref:request.human_decision.reference });
        // Submission status is not rewritten as a Lease, payment or possession fact.
      }
    }
  } else {
    fields(p,['application_id','participants','coverage','status']);
    participants(request,p.participants); scoped(request,p.participants.map(x=>x.subject_id),['coverage','status']);
    references(request,[p.application_id]); need(own(n.applications,p.application_id),'APPLICATION_NOT_FOUND');
    need(p.participants.every(x=>n.applications[p.application_id].participants.some(y=>y.subject_id===x.subject_id)), 'GUARANTEE_PARTICIPANT_MISMATCH');
    need(Array.isArray(p.coverage)&&p.coverage.length,'NARY_COVERAGE_REQUIRED');
    const keys=new Set();
    for(const c of p.coverage) {
      fields(c,['property_id','obligation_scope_code','coverage_scope_id','terms_ref']);
      need(id(c.obligation_scope_code)&&id(c.coverage_scope_id), 'NARY_COVERAGE_REQUIRED'); references(request,[c.property_id,c.terms_ref]);
      const key=JSON.stringify([c.property_id,c.obligation_scope_code,c.coverage_scope_id]); need(!keys.has(key),'DUPLICATE_COVERAGE');keys.add(key);
    }
    need(['PROPOSED','ACCEPTED'].includes(p.status),'GUARANTEE_STATUS_REQUIRED'); if(p.status==='ACCEPTED') human(request);
    const exists=own(n.guarantees,request.target);
    need(request.action==='guarantee.create' ? !exists : exists, 'GUARANTEE_EXISTENCE');
    if(exists) need(n.guarantees[request.target].application_id===p.application_id,'GUARANTEE_APPLICATION_IMMUTABLE');
    const previous=exists?n.guarantees[request.target]:null;
    entity={id:request.target,...structuredClone(p),version:previous?previous.version+1:1,versions:previous?[...previous.versions,structuredClone({...previous,versions:undefined})]:[]}; n.guarantees[request.target]=entity;
  }
  result={id:entity.id,version:entity.version,status:entity.status,external_contact_executed:false,financial_effect_executed:false};
  return finish(context,request,result);
}

/** Project only authorized fields; adapter must authorize before loading private storage. */
export function projectApplication(load, request) {
  const a=request.authority;
  need(['leasing','customer-service','legal-compliance','data'].includes(a?.department), 'DEPARTMENT_DENIED');
  need(a?.authenticated && a.actor && a.policy_revision && a.current && !a.revoked && !a.hold && !a.emergency_stop && a.organization===request.organization && a.purpose===request.purpose && a.resources?.includes(request.target) && actions.includes(request.action) && a.actions?.includes(request.action), 'CURRENT_AUTHORITY_REQUIRED');
  need(Date.parse(request.now)>=Date.parse(a.valid_from)&&Date.parse(request.now)<Date.parse(a.valid_until),'CURRENT_AUTHORITY_REQUIRED');
  scoped(request,request.participant_scope,request.field_scope);
  const entity=load(request.organization,request.target); need(entity,'APPLICATION_NOT_FOUND');
  return entity.field_values.filter(x=>request.participant_scope.includes(x.subject_id)&&request.field_scope.includes(x.field)).map(x=>structuredClone(x));
}
