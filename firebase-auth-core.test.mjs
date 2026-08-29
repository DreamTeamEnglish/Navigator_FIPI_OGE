import test from 'node:test';
import assert from 'node:assert/strict';

import {
  accessErrorMessage,
  identifierToFirebaseEmail,
  validateAccessPayload,
} from '../firebase-auth-core.mjs';

const validPayload = () => ({
  ok: true,
  profile: {
    role: 'teacher',
    status: 'active',
    access_level: 'full',
    access_expires_at: null,
    must_change_password: false,
  },
  catalog: {
    url: 'https://storage.yandexcloud.net/signed-catalog',
    version: '2026.08.24.1-bcc853de34ab',
    bytes: 382742,
    sha256: 'a'.repeat(64),
    card_count: 1735,
  },
});

test('maps a numeric VK ID to its hidden Firebase email', () => {
  assert.equal(identifierToFirebaseEmail(' 900000001 '), 'vk-900000001@dreamteam.invalid');
});

test('normalizes a real email without changing its identity', () => {
  assert.equal(identifierToFirebaseEmail(' Teacher@Example.com '), 'teacher@example.com');
});

test('rejects an invalid identifier', () => {
  assert.throws(() => identifierToFirebaseEmail('teacher'), /email или числовой VK ID/i);
});

test('accepts an active FULL access payload with the pinned catalog shape', () => {
  assert.equal(validateAccessPayload(validPayload()).profile.role, 'teacher');
});

test('accepts an authenticated embedded gzip catalog from the Yandex function', () => {
  const payload = validPayload();
  delete payload.catalog.url;
  payload.catalog.encoding = 'base64';
  payload.catalog.data = 'H4sIAAAAAAAA' + 'A'.repeat(32);
  assert.equal(validateAccessPayload(payload).catalog.encoding, 'base64');
});

test('rejects a non-HTTPS catalog URL', () => {
  const payload = validPayload();
  payload.catalog.url = 'http://unsafe.example/catalog.gz';
  assert.throws(() => validateAccessPayload(payload), /catalog/i);
});

test('rejects catalog metadata that does not describe the pinned OGE catalog', () => {
  for (const mutate of [
    payload => { payload.catalog.bytes = 1; },
    payload => { payload.catalog.sha256 = 'bad'; },
    payload => { payload.catalog.card_count = 44; },
  ]) {
    const payload = validPayload();
    mutate(payload);
    assert.throws(() => validateAccessPayload(payload), /catalog/i);
  }
});

test('rejects access that is not active FULL', () => {
  for (const mutate of [
    payload => { payload.profile.status = 'blocked'; },
    payload => { payload.profile.access_level = 'demo'; },
    payload => { payload.profile.role = 'visitor'; },
  ]) {
    const payload = validPayload();
    mutate(payload);
    assert.throws(() => validateAccessPayload(payload), /access/i);
  }
});

test('maps server access failures to safe Russian messages', () => {
  assert.equal(accessErrorMessage('access_blocked'), 'Доступ заблокирован администратором.');
  assert.equal(accessErrorMessage('access_expired'), 'Срок доступа к Navigator закончился.');
  assert.equal(accessErrorMessage('access_missing'), 'Для этого аккаунта нет доступа к Navigator.');
});
