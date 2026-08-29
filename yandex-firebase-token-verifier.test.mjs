import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createSign } from 'node:crypto';
import { createFirebaseTokenVerifier } from './yandex-firebase-token-verifier.mjs';

const b64url = input => Buffer.from(JSON.stringify(input)).toString('base64url');

function makeToken(privateKey, claims, kid = 'kid-1') {
  const header = b64url({ alg: 'RS256', typ: 'JWT', kid });
  const payload = b64url(claims);
  const signingInput = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey).toString('base64url');
  return `${signingInput}.${signature}`;
}

function claims(projectId) {
  const now = Math.floor(Date.now() / 1000);
  return {
    aud: projectId,
    iss: `https://securetoken.google.com/${projectId}`,
    sub: 'uid-1',
    user_id: 'uid-1',
    email: 'teacher@example.com',
    exp: now + 3600,
    iat: now - 60,
    auth_time: now - 120,
  };
}

test('verifier checks an RS256 Firebase-style token using the matching Google certificate key', async () => {
  const projectId = 'dte-auth-pilot';
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
  let fetchCount = 0;

  const verify = createFirebaseTokenVerifier({
    projectId,
    fetchCertificates: async () => {
      fetchCount += 1;
      return { certificates: { 'kid-1': publicPem }, maxAgeSeconds: 3600 };
    },
  });

  const token = makeToken(privateKey, claims(projectId));
  const decoded = await verify(token);
  assert.equal(decoded.sub, 'uid-1');
  assert.equal(decoded.email, 'teacher@example.com');

  await verify(token);
  assert.equal(fetchCount, 1, 'certificate cache should be reused');
});

test('verifier rejects a token with a missing key id or broken signature', async () => {
  const projectId = 'dte-auth-pilot';
  const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicPem = keys.publicKey.export({ type: 'spki', format: 'pem' });

  const verify = createFirebaseTokenVerifier({
    projectId,
    fetchCertificates: async () => ({ certificates: { 'kid-1': publicPem }, maxAgeSeconds: 3600 }),
  });

  await assert.rejects(() => verify(makeToken(keys.privateKey, claims(projectId), 'unknown')), /unknown_key_id/);
  await assert.rejects(() => verify(makeToken(other.privateKey, claims(projectId))), /invalid_signature/);
});

test('verifier rejects non-RS256 JWT headers before certificate lookup', async () => {
  const projectId = 'dte-auth-pilot';
  const header = b64url({ alg: 'HS256', kid: 'kid-1' });
  const payload = b64url(claims(projectId));
  const token = `${header}.${payload}.AAAA`;
  let fetched = false;

  const verify = createFirebaseTokenVerifier({
    projectId,
    fetchCertificates: async () => { fetched = true; return { certificates: {}, maxAgeSeconds: 1 }; },
  });

  await assert.rejects(() => verify(token), /invalid_algorithm/);
  assert.equal(fetched, false);
});
