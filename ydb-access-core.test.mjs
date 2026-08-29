import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAccessRecord,
  evaluateAccess,
  publicAccessPayload,
} from './ydb-access-core.mjs';

const identity = {
  principalKey: 'email:teacher@example.com',
  kind: 'email',
  email: 'teacher@example.com',
  vkId: '',
  firebaseUid: 'firebase-uid-1',
};

test('missing YDB row denies protected access', () => {
  const result = evaluateAccess(null, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'no_access');
});

test('ACTIVE FULL record grants FULL', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    access_level: 'FULL',
    status: 'ACTIVE',
    role: 'USER',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, true);
  assert.equal(result.accessLevel, 'FULL');
  assert.equal(result.isAdmin, false);
});

test('ADMIN role grants full access plus admin flag', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    access_level: 'FULL',
    status: 'ACTIVE',
    role: 'ADMIN',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, true);
  assert.equal(result.accessLevel, 'FULL');
  assert.equal(result.isAdmin, true);
});

test('BLOCKED overrides FULL and ADMIN', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    access_level: 'FULL',
    status: 'BLOCKED',
    role: 'ADMIN',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'blocked');
  assert.equal(result.isAdmin, false);
});

test('expired FULL record is denied', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    access_level: 'FULL',
    status: 'ACTIVE',
    role: 'USER',
    valid_until: '2026-08-28T23:59:59Z',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'expired');
});

test('future valid_until keeps FULL active', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    access_level: 'FULL',
    status: 'ACTIVE',
    role: 'USER',
    valid_until: '2026-09-10T00:00:00Z',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, true);
});

test('bound Firebase UID must match', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    firebase_uid: 'someone-else',
    access_level: 'FULL',
    status: 'ACTIVE',
    role: 'USER',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'identity_mismatch');
});

test('unbound migrated row can be read by matching canonical principal', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    firebase_uid: null,
    access_level: 'FULL',
    status: 'ACTIVE',
    role: 'USER',
    source: 'migration',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, true);
});

test('principal mismatch is denied even when row is FULL', () => {
  const result = evaluateAccess({
    principal_key: 'email:other@example.com',
    access_level: 'FULL',
    status: 'ACTIVE',
    role: 'USER',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'identity_mismatch');
});

test('DEMO record never becomes FULL', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    access_level: 'DEMO',
    status: 'ACTIVE',
    role: 'USER',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  assert.equal(result.allowed, true);
  assert.equal(result.accessLevel, 'DEMO');
  assert.equal(result.isFull, false);
});

test('normalization rejects unknown status/role/access values safely', () => {
  const record = normalizeAccessRecord({
    principal_key: identity.principalKey,
    access_level: 'SUPERUSER',
    status: 'MAYBE',
    role: 'ROOT',
  });
  assert.equal(record.accessLevel, 'NONE');
  assert.equal(record.status, 'BLOCKED');
  assert.equal(record.role, 'USER');
});

test('public payload exposes only browser-safe access fields', () => {
  const result = evaluateAccess({
    principal_key: identity.principalKey,
    firebase_uid: identity.firebaseUid,
    access_level: 'FULL',
    status: 'ACTIVE',
    role: 'USER',
    source: 'admin',
    note: 'private administrator note',
    display_name: 'Teacher',
  }, identity, new Date('2026-08-29T10:00:00Z'));
  const payload = publicAccessPayload(result);
  assert.deepEqual(payload, {
    allowed: true,
    code: 'ok',
    level: 'FULL',
    is_full: true,
    is_admin: false,
    valid_until: null,
    display_name: 'Teacher',
  });
  assert.equal('note' in payload, false);
  assert.equal('source' in payload, false);
  assert.equal('firebase_uid' in payload, false);
});
