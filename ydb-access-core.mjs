const ALLOWED_LEVELS = new Set(['FULL', 'DEMO', 'NONE']);
const ALLOWED_STATUS = new Set(['ACTIVE', 'BLOCKED']);
const ALLOWED_ROLES = new Set(['USER', 'ADMIN']);

function clean(value) {
  return String(value ?? '').trim();
}

function toIsoOrNull(value) {
  const raw = clean(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizeAccessRecord(record) {
  if (!record || typeof record !== 'object') return null;

  const principalKey = clean(record.principal_key || record.principalKey);
  if (!principalKey) return null;

  const rawLevel = clean(record.access_level || record.accessLevel).toUpperCase();
  const rawStatus = clean(record.status).toUpperCase();
  const rawRole = clean(record.role).toUpperCase();

  return {
    principalKey,
    firebaseUid: clean(record.firebase_uid || record.firebaseUid) || null,
    accessLevel: ALLOWED_LEVELS.has(rawLevel) ? rawLevel : 'NONE',
    status: ALLOWED_STATUS.has(rawStatus) ? rawStatus : 'BLOCKED',
    role: ALLOWED_ROLES.has(rawRole) ? rawRole : 'USER',
    validUntil: toIsoOrNull(record.valid_until || record.validUntil),
    displayName: clean(record.display_name || record.displayName) || '',
    source: clean(record.source) || '',
  };
}

function denied(code, record = null) {
  return {
    allowed: false,
    code,
    accessLevel: 'NONE',
    isFull: false,
    isAdmin: false,
    validUntil: record?.validUntil || null,
    displayName: record?.displayName || '',
  };
}

export function evaluateAccess(record, identity, now = new Date()) {
  const normalized = normalizeAccessRecord(record);
  if (!normalized) return denied('no_access');

  const principalKey = clean(identity?.principalKey);
  const firebaseUid = clean(identity?.firebaseUid);

  if (!principalKey || normalized.principalKey !== principalKey) {
    return denied('identity_mismatch', normalized);
  }

  if (normalized.firebaseUid && normalized.firebaseUid !== firebaseUid) {
    return denied('identity_mismatch', normalized);
  }

  if (normalized.status === 'BLOCKED') {
    return denied('blocked', normalized);
  }

  if (normalized.validUntil) {
    const expiry = new Date(normalized.validUntil).getTime();
    const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
    if (!Number.isFinite(nowMs) || expiry <= nowMs) {
      return denied('expired', normalized);
    }
  }

  if (normalized.accessLevel === 'NONE') {
    return denied('no_access', normalized);
  }

  const isFull = normalized.accessLevel === 'FULL';
  const isAdmin = isFull && normalized.role === 'ADMIN';

  return {
    allowed: true,
    code: 'ok',
    accessLevel: normalized.accessLevel,
    isFull,
    isAdmin,
    validUntil: normalized.validUntil,
    displayName: normalized.displayName,
  };
}

export function publicAccessPayload(result) {
  return {
    allowed: Boolean(result?.allowed),
    code: clean(result?.code) || 'no_access',
    level: clean(result?.accessLevel) || 'NONE',
    is_full: Boolean(result?.isFull),
    is_admin: Boolean(result?.isAdmin),
    valid_until: result?.validUntil || null,
    display_name: clean(result?.displayName) || '',
  };
}
