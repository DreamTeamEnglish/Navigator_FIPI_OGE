import {
  extractBearerToken,
  validateFirebaseClaims,
  principalFromFirebaseClaims,
} from './yandex-firebase-auth-core.mjs';
import { evaluateAccess, publicAccessPayload } from './ydb-access-core.mjs';

function jsonResponse(statusCode, body, origin = '', allowedOrigins = []) {
  const allowed = allowedOrigins.includes(origin) ? origin : '';
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (allowed) headers['Access-Control-Allow-Origin'] = allowed;
  return { statusCode, headers, body: JSON.stringify(body) };
}

export function createFirebaseAccessHandler({
  projectId,
  verifyToken,
  loadAccessRecord,
  allowedOrigins = [],
  now = () => new Date(),
}) {
  if (!String(projectId || '').trim()) throw new Error('projectId_required');
  if (typeof verifyToken !== 'function') throw new Error('verifyToken_required');
  if (typeof loadAccessRecord !== 'function') throw new Error('loadAccessRecord_required');

  return async function firebaseAccessHandler(event = {}) {
    const method = String(event.httpMethod || event.requestContext?.http?.method || 'POST').toUpperCase();
    const headers = event.headers || {};
    const origin = headers.origin || headers.Origin || '';

    if (method === 'OPTIONS') {
      const response = jsonResponse(204, {}, origin, allowedOrigins);
      response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
      return response;
    }

    if (method !== 'POST') {
      return jsonResponse(405, { ok: false, code: 'method_not_allowed' }, origin, allowedOrigins);
    }

    const token = extractBearerToken(headers.authorization || headers.Authorization || '');
    if (!token) {
      return jsonResponse(401, { ok: false, code: 'missing_bearer_token' }, origin, allowedOrigins);
    }

    let principal;
    try {
      const claims = await verifyToken(token, projectId);
      validateFirebaseClaims(claims, projectId);
      principal = principalFromFirebaseClaims(claims);
    } catch {
      return jsonResponse(401, { ok: false, code: 'invalid_firebase_token' }, origin, allowedOrigins);
    }

    let record;
    try {
      record = await loadAccessRecord(principal.principalKey, principal);
    } catch {
      return jsonResponse(503, { ok: false, code: 'access_backend_unavailable' }, origin, allowedOrigins);
    }

    const access = evaluateAccess(record, principal, now());
    const payload = publicAccessPayload(access);

    if (!access.allowed) {
      return jsonResponse(403, { ok: false, access: payload }, origin, allowedOrigins);
    }

    return jsonResponse(200, {
      ok: true,
      identity: {
        kind: principal.kind,
        email: principal.email || undefined,
        vk_id: principal.vkId || undefined,
      },
      access: payload,
    }, origin, allowedOrigins);
  };
}
