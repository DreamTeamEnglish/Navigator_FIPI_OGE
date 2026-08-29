export function waitForFirebaseAdapter({ getAdapter, target, timeoutMs = 8000 }) {
  const current = getAdapter();
  if (current) return Promise.resolve(current);

  return new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      target.removeEventListener('oge-firebase-auth-ready', onReady);
      target.removeEventListener('oge-firebase-auth-error', onError);
      resolve(value);
    };
    const onReady = () => finish(getAdapter() || null);
    const onError = () => finish(null);
    const timer = setTimeout(() => finish(getAdapter() || null), timeoutMs);
    target.addEventListener('oge-firebase-auth-ready', onReady, { once: true });
    target.addEventListener('oge-firebase-auth-error', onError, { once: true });
  });
}
