import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractBearerToken,
  validateFirebaseClaims,
  principalFromFirebaseClaims,
  createPilotAuthHandler,
} from './yandex-firebase-auth-core.mjs';

const PROJECT = 'dte-auth-pilot';
const NOW = 1_800_000_000;

function validClaims(overrides = {}) {
  return {
    aud: PROJECT,
    iss: `https://securetoken.google.com/${PROJECT}`,
    sub: 'firebase-uid-123',
    user_id: 'firebase-uid-123',
    email: 'teacher@example.com',
    email_verified: true,
    exp: NOW + 3600,
    iat: NOW - 60,
    auth_time: NOW - 120,
    ...overrides,
  };
}

test('extractBearerToken accepts only Bearer authorization', () => {
  assert.equal(extractBearerToken('Bearer abc.def.ghi'), 'abc.def.ghi');
  assert.equal(extractBearerToken('bearer token'), 'token');
  assert.equal(extractBearerToken('Basic abc'), '');
  assert.equal(extractBearerToken(''), '');
});

test('validateFirebaseClaims accepts a current token for this Firebase project', () => {
  assert.doesNotThrow(() => validateFirebaseClaims(validClaims(), PROJECT, NOW));
});

test('validateFirebaseClaims rejects wrong audience and issuer', () => {
  assert.throws(() => validateFirebaseClaims(validClaims({ aud: 'other-project' }), PROJECT, NOW), /invalid_audience/);
  assert.throws(() => validateFirebaseClaims(validClaims({ iss: 'https:\/\/securetoken.google.com\/other-project' }), PROJECT, NOW), /invalid_issuer/);
});

test('validateFirebaseClaims rejects expired and future-issued tokens', () => {
  assert.throws(() => validateFirebaseClaims(validClaims({ exp: NOW - 1 }), PROJECT, NOW), /token_expired/);
  assert.throws(() => validateFirebaseClaims(validClaims({ iat: NOW + 1 }), PROJECT, NOW), /issued_in_future/);
  assert.throws(() => validateFirebaseClaims(validClaims({ auth_time: NOW + 1 }), PROJECT, NOW), /auth_in_future/);
});

test('numeric VK synthetic email maps to a stable VK principal', () => {
  assert.deepEqual(
    principalFromFirebaseClaims(validClaims({ email: 'vk-900000001@dreamteam.invalid' })),
    {
      principalKey: 'vk:900000001',
      kind: 'vk',
      vkId: '900000001',
      email: '',
      firebaseUid: 'firebase-uid-123',
    },
  );
});

test('normal email maps to a stable email principal', () => {
  assert.deepEqual(
    principalFromFirebaseClaims(validClaims({ email: 'Teacher@Example.COM' })),
    {
      principalKey: 'email:teacher@example.com',
      kind: 'email',
      vkId: '',
      email: 'teacher@example.com',
      firebaseUid: 'firebase-uid-123',
    },
  );
});

test('handler returns verified identity but deliberately does not grant FULL before YDB step', async () => {
  const handler = createPilotAuthHandler({
    projectId: PROJECT,
    verifyToken: async token => {
      assert.equal(token, 'firebase-token');
      const liveNow = Math.floor(Date.now() / 1000);
      return validClaims({ exp: liveNow + 3600, iat: liveNow - 60, auth_time: liveNow - 120 });
    },
    allowedOrigins: ['https://dreamteamenglish.github.io'],
  });

  const result = await handler({
    httpMethod: 'POST',
    headers: {
      origin: 'https://dreamteamenglish.github.io',
      authorization: 'Bearer firebase-token',
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.headers['Access-Control-Allow-Origin'], 'https://dreamteamenglish.github.io');
  const body = JSON.parse(result.body);
  assert.equal(body.ok, true);
  assert.equal(body.identity.principal_key, 'email:teacher@example.com');
  assert.equal(body.access, null);
  assert.equal(body.next, 'ydb_access_lookup');
});

test('handler refuses a missing or invalid Firebase token', async () => {
  const handler = createPilotAuthHandler({
    projectId: PROJECT,
    verifyToken: async () => { throw new Error('invalid_signature'); },
    allowedOrigins: ['https://dreamteamenglish.github.io'],
  });

  const missing = await handler({ httpMethod: 'POST', headers: {} });
  assert.equal(missing.statusCode, 401);
  assert.equal(JSON.parse(missing.body).code, 'missing_bearer_token');

  const invalid = await handler({ httpMethod: 'POST', headers: { authorization: 'Bearer bad' } });
  assert.equal(invalid.statusCode, 401);
  assert.equal(JSON.parse(invalid.body).code, 'invalid_firebase_token');
});
