import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseLoginIdentifier,
  recoveryRouteForIdentifier,
  firebaseAuthErrorText,
} from './firebase-auth-core.mjs';

test('email login is normalized without changing it to a synthetic identity', () => {
  assert.deepEqual(parseLoginIdentifier('  Teacher@Example.COM  '), {
    kind: 'email',
    identifier: 'teacher@example.com',
    email: 'teacher@example.com',
  });
});

test('numeric VK ID maps to the Firebase synthetic email used by the pilot', () => {
  assert.deepEqual(parseLoginIdentifier(' 900000001 '), {
    kind: 'vk',
    identifier: '900000001',
    email: 'vk-900000001@dreamteam.invalid',
    vkId: '900000001',
  });
});

test('invalid identifiers are rejected', () => {
  assert.equal(parseLoginIdentifier('not-an-email'), null);
  assert.equal(parseLoginIdentifier('vk-abc'), null);
  assert.equal(parseLoginIdentifier(''), null);
});

test('password recovery uses email for email accounts and administrator for VK ID', () => {
  assert.deepEqual(recoveryRouteForIdentifier('teacher@example.com'), {
    kind: 'email',
    email: 'teacher@example.com',
  });
  assert.deepEqual(recoveryRouteForIdentifier('900000001'), {
    kind: 'admin',
    vkId: '900000001',
  });
});

test('Firebase disabled-user error becomes the administrator-block message', () => {
  assert.equal(
    firebaseAuthErrorText({ code: 'auth/user-disabled' }),
    'Доступ заблокирован администратором.'
  );
});

test('credential errors do not reveal whether the account exists', () => {
  for (const code of ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found']) {
    assert.equal(
      firebaseAuthErrorText({ code }),
      'Неверный логин или пароль.'
    );
  }
});
