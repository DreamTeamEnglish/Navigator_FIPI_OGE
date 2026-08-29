import { createVerify } from 'node:crypto';

const CERT_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

function decodeJsonPart(part, code) {
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
  } catch {
    throw new Error(code);
  }
}

export async function fetchFirebaseCertificates(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch_unavailable');
  const response = await fetchImpl(CERT_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`certificate_fetch_failed_${response.status}`);
  const certificates = await response.json();
  const cacheControl = response.headers?.get?.('cache-control') || '';
  const match = /max-age=(\d+)/i.exec(cacheControl);
  const maxAgeSeconds = match ? Math.max(60, Number(match[1])) : 300;
  return { certificates, maxAgeSeconds };
}

export function createFirebaseTokenVerifier({
  projectId,
  fetchCertificates = () => fetchFirebaseCertificates(),
}) {
  if (!projectId) throw new Error('missing_project_id');

  let cachedCertificates = null;
  let cacheExpiresAt = 0;

  async function certificates() {
    if (cachedCertificates && Date.now() < cacheExpiresAt) return cachedCertificates;
    const result = await fetchCertificates();
    cachedCertificates = result?.certificates || {};
    const ttl = Math.max(60, Number(result?.maxAgeSeconds || 300));
    cacheExpiresAt = Date.now() + ttl * 1000;
    return cachedCertificates;
  }

  return async function verifyFirebaseIdToken(token) {
    const parts = String(token || '').split('.');
    if (parts.length !== 3 || parts.some(part => !part)) throw new Error('invalid_jwt_format');

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = decodeJsonPart(encodedHeader, 'invalid_jwt_header');
    const payload = decodeJsonPart(encodedPayload, 'invalid_jwt_payload');

    if (header.alg !== 'RS256') throw new Error('invalid_algorithm');
    const kid = String(header.kid || '').trim();
    if (!kid) throw new Error('missing_key_id');

    const certMap = await certificates();
    const publicKey = certMap[kid];
    if (!publicKey) throw new Error('unknown_key_id');

    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();
    const signature = Buffer.from(encodedSignature, 'base64url');
    if (!verifier.verify(publicKey, signature)) throw new Error('invalid_signature');

    return payload;
  };
}
