// OGE Navigator — Firebase browser adapter (pilot only)
// This file runs alongside the existing Supabase code. It does NOT replace it yet.
(() => {
  'use strict';

  const APP_NAME = 'oge-firebase-auth-pilot';
  const REQUIRED_CONFIG_KEYS = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  function invalidConfig(config) {
    if (!config || typeof config !== 'object') return true;
    return REQUIRED_CONFIG_KEYS.some(key => {
      const value = String(config[key] ?? '').trim();
      return !value || /^PASTE_/i.test(value);
    });
  }

  function exposeFailure(message) {
    window.OGE_FIREBASE_AUTH = Object.freeze({
      mode: 'pilot',
      ready: false,
      error: message,
    });
    console.warn(`[OGE Firebase pilot] ${message}`);
  }

  try {
    const config = window.OGE_FIREBASE_CONFIG;
    const firebase = window.firebase;

    if (invalidConfig(config)) {
      exposeFailure('Firebase configuration is missing or still contains placeholders.');
      return;
    }

    if (!firebase?.initializeApp) {
      exposeFailure('Firebase App SDK did not load.');
      return;
    }

    let app = Array.isArray(firebase.apps)
      ? firebase.apps.find(candidate => candidate?.name === APP_NAME)
      : null;

    if (!app) app = firebase.initializeApp(config, APP_NAME);

    if (!app?.auth) {
      exposeFailure('Firebase Authentication SDK did not load.');
      return;
    }

    const auth = app.auth();
    auth.languageCode = 'ru';

    window.OGE_FIREBASE_AUTH = Object.freeze({
      mode: 'pilot',
      ready: true,
      appName: APP_NAME,
      signIn(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
      },
      sendPasswordResetEmail(email) {
        return auth.sendPasswordResetEmail(email);
      },
      signOut() {
        return auth.signOut();
      },
      currentUser() {
        return auth.currentUser || null;
      },
      onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(callback);
      },
    });

    console.info('[OGE Firebase pilot] Browser adapter ready. Supabase flow remains unchanged.');
  } catch (error) {
    exposeFailure(error?.message || String(error));
  }
})();
