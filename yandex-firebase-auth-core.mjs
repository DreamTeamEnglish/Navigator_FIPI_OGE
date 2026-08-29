const VK_EMAIL_RE = /^vk-(\d{1,15})@dreamteam\.invalid$/i;

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

export function extractBearerToken(value) {
  const match = /^Bearer\s+(.+)$/i.exec(String(value || '').trim());
  return match ? match[1].trim() : '';
}

export function validateFirebaseClaims(claims, projectId, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!projectId) throw new Error('missing_project_id');
  if (!claims || typeof claims !== 'object') throw new Error('invalid_claims');
  if (claims.aud !== projectId) throw new Error('invalid_audience');
  if (claims.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('invalid_issuer');
  if (!String(claims.sub || '').trim()) throw new Error('missing_subject');
  if (!Number.isFinite(Number(claims.exp)) || Number(claims.exp) <= nowSeconds) throw new Error('token_expired');
  if (!Number.isFinite(Number(claims.iat)) || Number(claims.iat) > nowSeconds) throw new Error('issued_in_future');
  if (!Number.isFinite(Number(claims.auth_time)) || Number(claims.auth_time) > nowSeconds) throw new Error('auth_in_future');
  return claims;
}

export function principalFromFirebaseClaims(claims) {
  const firebaseUid = String(claims?.sub || claims?.user_id || '').trim();
  if (!firebaseUid) throw new Error('missing_firebase_uid');

  const rawEmail = String(claims?.email || '').trim().toLowerCase();
  const vk = VK_EMAIL_RE.exec(rawEmail);
  if (vk) {
    return {
      principalKey: `vk:${vk[1]}`,
      kind: 'vk',
      vkId: vk[1],
      email: '',
      firebaseUid,
    };
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return {
      principalKey: `email:${rawEmail}`,
      kind: 'email',
      vkId: '',
      email: rawEmail,
      firebaseUid,
    };
  }

  return {
    principalKey: `firebase:${firebaseUid}`,
    kind: 'firebase',
    vkId: '',
    email: '',
    firebaseUid,
  };
}

export function createPilotAuthHandler({ projectId, verifyToken, allowedOrigins = [] }) {
  if (typeof verifyToken !== 'function') throw new Error('verifyToken_required');

  return async function pilotAuthHandler(event = {}) {
    const method = String(event.httpMethod || event.requestContext?.http?.method || 'POST').toUpperCase();
    const headers = event.headers || {};
    const origin = headers.origin || headers.Origin || '';

    if (method === 'OPTIONS') {
      const response = jsonResponse(204, {}, origin, allowedOrigins);
      response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
      return response;
    }

    if (method !== 'POST') return jsonResponse(405, { ok: false, code: 'method_not_allowed' }, origin, allowedOrigins);

    const token = extractBearerToken(headers.authorization || headers.Authorization || '');
    if (!token) return jsonResponse(401, { ok: false, code: 'missing_bearer_token' }, origin, allowedOrigins);

    let claims;
    try {
      claims = await verifyToken(token, projectId);
      validateFirebaseClaims(claims, projectId);
    } catch (error) {
      return jsonResponse(401, { ok: false, code: 'invalid_firebase_token' }, origin, allowedOrigins);
    }

    const principal = principalFromFirebaseClaims(claims);
    return jsonResponse(200, {
      ok: true,
      identity: {
        principal_key: principal.principalKey,
        kind: principal.kind,
        firebase_uid: principal.firebaseUid,
        email: principal.email || undefined,
        vk_id: principal.vkId || undefined,
      },
      access: null,
      next: 'ydb_access_lookup',
    }, origin, allowedOrigins);
  };
}
