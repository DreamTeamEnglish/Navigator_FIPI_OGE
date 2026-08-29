import test from 'node:test';
import assert from 'node:assert/strict';

import { createFirebaseAuthAdapter } from '../firebase-auth-adapter.mjs';

function testHarness({ accessPayload, signedIn = true } = {}) {
  const calls = { signIn: null, authorization: '', signedOut: 0, reset: null };
  const user = { uid: 'uid-1', email: 'vk-900000001@dreamteam.invalid', getIdToken: async force => {
    assert.equal(force, true);
    return 'test-id-token';
  } };
  const auth = { currentUser: signedIn ? user : null };
  const ops = {
    signInWithEmailAndPassword: async (_auth, email, password) => {
      calls.signIn = [email, password];
      return { user };
    },
    signOut: async () => { calls.signedOut += 1; },
    onAuthStateChanged: (_auth, callback) => { callback(user); return () => {}; },
    sendPasswordResetEmail: async (_auth, email) => { calls.reset = email; },
  };
  const fetchImpl = async (_url, init) => {
    calls.authorization = init.headers.Authorization;
    return {
      ok: true,
      json: async () => accessPayload || {
        ok: true,
        profile: { role: 'teacher', status: 'active', access_level: 'full', access_expires_at: null },
        catalog: {
          url: 'https://storage.yandexcloud.net/signed',
          version: '2026.08.24.1-bcc853de34ab',
          bytes: 382742,
          sha256: 'b'.repeat(64),
          card_count: 1735,
        },
      },
    };
  };
  const adapter = createFirebaseAuthAdapter({ auth, ops, accessUrl: 'https://access.example.test', fetchImpl });
  return { adapter, calls, user };
}

test('maps numeric VK ID before Firebase sign-in', async () => {
  const { adapter, calls } = testHarness();
  await adapter.signIn('900000001', 'secret');
  assert.deepEqual(calls.signIn, ['vk-900000001@dreamteam.invalid', 'secret']);
});

test('sends a freshly issued Firebase ID token to the Yandex endpoint', async () => {
  const { adapter, calls } = testHarness();
  const result = await adapter.requestOgeAccess();
  assert.equal(calls.authorization, 'Bearer test-id-token');
  assert.equal(result.catalog.card_count, 1735);
});

test('signs out through Firebase', async () => {
  const { adapter, calls } = testHarness();
  await adapter.signOut();
  assert.equal(calls.signedOut, 1);
});

test('offers reset only for real email accounts', async () => {
  const { adapter, calls } = testHarness();
  await adapter.sendPasswordReset('Teacher@Example.com');
  assert.equal(calls.reset, 'teacher@example.com');
  await assert.rejects(() => adapter.sendPasswordReset('900000001'), /администратору/i);
});

test('rejects access when no Firebase session exists', async () => {
  const { adapter } = testHarness({ signedIn: false });
  await assert.rejects(() => adapter.requestOgeAccess(), /сессия/i);
});
