import test from 'node:test';
import assert from 'node:assert/strict';
import { createFirebaseAccessHandler } from './yandex-firebase-access-function.mjs';

const projectId = 'dte-auth-pilot';
const claims = {
  aud: projectId,
  iss: `https://securetoken.google.com/${projectId}`,
  sub: 'uid-1',
  email: 'teacher@example.com',
  exp: 4102444800,
  iat: 1700000000,
  auth_time: 1700000000,
};

function parseBody(response) {
  return JSON.parse(response.body || '{}');
}

test('verified Firebase identity gets FULL from YDB lookup', async () => {
  const handler = createFirebaseAccessHandler({
    projectId,
    verifyToken: async () => claims,
    loadAccessRecord: async principalKey => ({
      principal_key: principalKey,
      access_level: 'FULL',
      status: 'ACTIVE',
      role: 'USER',
      display_name: 'Teacher',
    }),
    allowedOrigins: ['https://dreamteamenglish.github.io'],
  });

  const response = await handler({
    httpMethod: 'POST',
    headers: {
      origin: 'https://dreamteamenglish.github.io',
      authorization: 'Bearer token',
    },
  });

  assert.equal(response.statusCode, 200);
  const body = parseBody(response);
  assert.equal(body.ok, true);
  assert.equal(body.access.level, 'FULL');
  assert.equal(body.access.is_full, true);
});

test('missing YDB row returns 403 without revealing internals', async () => {
  const handler = createFirebaseAccessHandler({
    projectId,
    verifyToken: async () => claims,
    loadAccessRecord: async () => null,
  });

  const response = await handler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
  });

  assert.equal(response.statusCode, 403);
  assert.deepEqual(parseBody(response), {
    ok: false,
    access: {
      allowed: false,
      code: 'no_access',
      level: 'NONE',
      is_full: false,
      is_admin: false,
      valid_until: null,
      display_name: '',
    },
  });
});

test('blocked user returns 403', async () => {
  const handler = createFirebaseAccessHandler({
    projectId,
    verifyToken: async () => claims,
    loadAccessRecord: async principalKey => ({
      principal_key: principalKey,
      access_level: 'FULL',
      status: 'BLOCKED',
      role: 'USER',
    }),
  });

  const response = await handler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
  });
  assert.equal(response.statusCode, 403);
  assert.equal(parseBody(response).access.code, 'blocked');
});

test('invalid Firebase token is rejected before YDB lookup', async () => {
  let lookedUp = false;
  const handler = createFirebaseAccessHandler({
    projectId,
    verifyToken: async () => { throw new Error('bad token'); },
    loadAccessRecord: async () => { lookedUp = true; return null; },
  });

  const response = await handler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer bad' },
  });
  assert.equal(response.statusCode, 401);
  assert.equal(lookedUp, false);
  assert.equal(parseBody(response).code, 'invalid_firebase_token');
});

test('YDB error fails closed with 503', async () => {
  const handler = createFirebaseAccessHandler({
    projectId,
    verifyToken: async () => claims,
    loadAccessRecord: async () => { throw new Error('YDB unavailable'); },
  });

  const response = await handler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
  });
  assert.equal(response.statusCode, 503);
  assert.deepEqual(parseBody(response), { ok: false, code: 'access_backend_unavailable' });
});

test('OPTIONS supports Authorization CORS header only for allowed origin', async () => {
  const handler = createFirebaseAccessHandler({
    projectId,
    verifyToken: async () => claims,
    loadAccessRecord: async () => null,
    allowedOrigins: ['https://dreamteamenglish.github.io'],
  });
  const response = await handler({
    httpMethod: 'OPTIONS',
    headers: { origin: 'https://dreamteamenglish.github.io' },
  });
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers['Access-Control-Allow-Origin'], 'https://dreamteamenglish.github.io');
  assert.equal(response.headers['Access-Control-Allow-Headers'], 'Authorization, Content-Type');
});
