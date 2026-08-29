import { createPilotAuthHandler } from './yandex-firebase-auth-core.mjs';
import { createFirebaseTokenVerifier } from './yandex-firebase-token-verifier.mjs';

const DEFAULT_ORIGINS = [
  'https://dreamteamenglish.github.io',
  'https://navigator-fipi-oge-dreamteam.website.yandexcloud.net',
];

export function buildHandler({
  projectId = '',
  allowedOrigins = DEFAULT_ORIGINS,
  verifyToken = null,
} = {}) {
  if (!String(projectId).trim()) throw new Error('FIREBASE_PROJECT_ID is required');
  const verifier = verifyToken || createFirebaseTokenVerifier({ projectId });
  return createPilotAuthHandler({ projectId, verifyToken: verifier, allowedOrigins });
}

let cachedHandler = null;
let cachedSignature = '';

function envAllowedOrigins() {
  const raw = String(process.env.OGE_FIREBASE_ALLOWED_ORIGINS || '').trim();
  if (!raw) return DEFAULT_ORIGINS;
  return raw.split(',').map(value => value.trim()).filter(Boolean);
}

export async function handler(event) {
  const projectId = String(process.env.FIREBASE_PROJECT_ID || '').trim();
  if (!projectId) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ ok: false, code: 'server_not_configured' }),
    };
  }

  const allowedOrigins = envAllowedOrigins();
  const signature = `${projectId}|${allowedOrigins.join(',')}`;
  if (!cachedHandler || cachedSignature !== signature) {
    cachedHandler = buildHandler({ projectId, allowedOrigins });
    cachedSignature = signature;
  }
  return cachedHandler(event);
}
