import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHandler } from './yandex-firebase-auth-function.mjs';

test('buildHandler refuses to start without a Firebase project id', () => {
  assert.throws(() => buildHandler({ projectId: '' }), /FIREBASE_PROJECT_ID/);
});

test('buildHandler accepts an injected verifier for isolated Yandex-function tests', async () => {
  const now = Math.floor(Date.now() / 1000);
  const handler = buildHandler({
    projectId: 'dte-auth-pilot',
    allowedOrigins: ['https://dreamteamenglish.github.io'],
    verifyToken: async () => ({
      aud: 'dte-auth-pilot',
      iss: 'https://securetoken.google.com/dte-auth-pilot',
      sub: 'uid-1',
      email: 'vk-900000001@dreamteam.invalid',
      exp: now + 3600,
      iat: now - 60,
      auth_time: now - 120,
    }),
  });

  const response = await handler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer pilot-token', origin: 'https://dreamteamenglish.github.io' },
  });
  const body = JSON.parse(response.body);
  assert.equal(response.statusCode, 200);
  assert.equal(body.identity.principal_key, 'vk:900000001');
  assert.equal(body.next, 'ydb_access_lookup');
});
