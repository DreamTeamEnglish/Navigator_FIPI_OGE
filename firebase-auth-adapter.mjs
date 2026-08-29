import { identifierToFirebaseEmail, validateAccessPayload } from './firebase-auth-core.mjs';

export function createFirebaseAuthAdapter({ auth, ops, accessUrl, fetchImpl = fetch }) {
  if (!auth || !ops) throw new Error('Firebase adapter dependencies are missing.');

  async function requestProtected(params = {}) {
    const user = auth.currentUser;
    if (!user) throw new Error('Сессия Firebase не найдена.');
    if (!accessUrl) throw new Error('Сервер доступа OGE ещё не подключён.');
    const token = await user.getIdToken(true);
    const url = new URL(accessUrl);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetchImpl(url.toString(), {
      method: 'GET', headers: { 'X-Firebase-Token': token }, cache: 'no-store',
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      const error = new Error(payload?.error || `Ошибка сервера доступа (${response.status}).`);
      error.code = payload?.error || 'access_service_error';
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  return Object.freeze({
    async signIn(identifier, password) {
      const email = identifierToFirebaseEmail(identifier);
      const result = await ops.signInWithEmailAndPassword(auth, email, password);
      return result.user;
    },

    async signOut() {
      await ops.signOut(auth);
    },

    getSession() {
      return auth.currentUser || null;
    },

    onSessionChanged(callback) {
      return ops.onAuthStateChanged(auth, callback);
    },

    async requestOgeAccess() {
      return validateAccessPayload(await requestProtected());
    },

    async requestBackupItem(fipiId) {
      const payload = await requestProtected({ mode: 'backup-item', fipi_id: fipiId });
      if (!payload.item || typeof payload.item !== 'object') throw new Error('Invalid backup item payload.');
      return payload.item;
    },

    async requestBackupMedia(mediaId) {
      const payload = await requestProtected({ mode: 'backup-media', media_id: mediaId });
      const url = String(payload?.media?.url || '');
      if (!url.startsWith('https://storage.yandexcloud.net/')) throw new Error('Invalid backup media URL.');
      return payload.media;
    },

    async sendPasswordReset(identifier) {
      const email = identifierToFirebaseEmail(identifier);
      if (/^vk-\d+@dreamteam\.invalid$/i.test(email)) {
        throw new Error('Для восстановления доступа по VK ID напишите администратору.');
      }
      await ops.sendPasswordResetEmail(auth, email);
    },
  });
}

async function bootstrapBrowserAdapter() {
  const config = window.OGE_CONFIG || {};
  if (config.authProvider !== 'firebase') return;

  const [{ initializeApp }, authModule] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js'),
  ]);

  const app = initializeApp(config.firebase);
  const auth = authModule.getAuth(app);
  await authModule.setPersistence(auth, authModule.browserLocalPersistence);
  window.OGE_FIREBASE_AUTH = createFirebaseAuthAdapter({
    auth,
    ops: authModule,
    accessUrl: config.firebaseAccessUrl,
  });
  window.dispatchEvent(new CustomEvent('oge-firebase-auth-ready'));
}

if (typeof window !== 'undefined') {
  try {
    await bootstrapBrowserAdapter();
  } catch (error) {
    console.error('Firebase emergency auth bootstrap failed:', error);
    window.dispatchEvent(new CustomEvent('oge-firebase-auth-error', { detail: { message: error.message } }));
  }
}
