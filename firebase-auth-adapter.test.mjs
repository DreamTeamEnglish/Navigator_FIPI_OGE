import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

async function runAdapter({ config, firebase }) {
  const source = await fs.readFile(new URL('./firebase-auth-adapter.js', import.meta.url), 'utf8');
  const window = { OGE_FIREBASE_CONFIG: config, firebase };
  const context = vm.createContext({ window, console });
  vm.runInContext(source, context, { filename: 'firebase-auth-adapter.js' });
  return window;
}

const validConfig = Object.freeze({
  apiKey: 'public-web-api-key',
  authDomain: 'dte-auth-pilot.firebaseapp.com',
  projectId: 'dte-auth-pilot',
  storageBucket: 'dte-auth-pilot.firebasestorage.app',
  messagingSenderId: '383382536615',
  appId: '1:383382536615:web:test',
});

function makeFirebaseFake() {
  const calls = [];
  const auth = {
    languageCode: 'en',
    currentUser: null,
    signInWithEmailAndPassword(email, password) {
      calls.push(['signIn', email, password]);
      return Promise.resolve({ user: { email } });
    },
    sendPasswordResetEmail(email) {
      calls.push(['reset', email]);
      return Promise.resolve();
    },
    signOut() {
      calls.push(['signOut']);
      return Promise.resolve();
    },
    onAuthStateChanged(callback) {
      calls.push(['onAuthStateChanged']);
      callback(null);
      return () => {};
    },
  };
  const app = { auth: () => auth };
  const firebase = {
    apps: [],
    initializeApp(config, name) {
      calls.push(['initializeApp', config, name]);
      this.apps.push(app);
      return app;
    },
  };
  return { firebase, calls, auth };
}

test('adapter initializes a named Firebase app without touching Supabase', async () => {
  const { firebase, calls, auth } = makeFirebaseFake();
  const window = await runAdapter({ config: validConfig, firebase });

  assert.equal(window.OGE_FIREBASE_AUTH.ready, true);
  assert.equal(window.OGE_FIREBASE_AUTH.mode, 'pilot');
  assert.equal(auth.languageCode, 'ru');
  assert.deepEqual(calls[0], ['initializeApp', validConfig, 'oge-firebase-auth-pilot']);
});

test('adapter exposes auth methods for the later Navigator integration', async () => {
  const { firebase, calls } = makeFirebaseFake();
  const window = await runAdapter({ config: validConfig, firebase });

  await window.OGE_FIREBASE_AUTH.signIn('teacher@example.com', 'secret');
  await window.OGE_FIREBASE_AUTH.sendPasswordResetEmail('teacher@example.com');
  await window.OGE_FIREBASE_AUTH.signOut();

  assert.deepEqual(calls.slice(1), [
    ['signIn', 'teacher@example.com', 'secret'],
    ['reset', 'teacher@example.com'],
    ['signOut'],
  ]);
});

test('adapter refuses placeholder configuration instead of breaking the existing Navigator', async () => {
  const { firebase, calls } = makeFirebaseFake();
  const window = await runAdapter({
    config: { ...validConfig, apiKey: 'PASTE_API_KEY_HERE' },
    firebase,
  });

  assert.equal(window.OGE_FIREBASE_AUTH.ready, false);
  assert.match(window.OGE_FIREBASE_AUTH.error, /configuration/i);
  assert.equal(calls.length, 0);
});
