const VK_EMAIL_DOMAIN = 'dreamteam.invalid';

export function parseLoginIdentifier(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    return {
      kind: 'vk',
      identifier: raw,
      email: `vk-${raw}@${VK_EMAIL_DOMAIN}`,
      vkId: raw,
    };
  }

  const email = raw.toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      kind: 'email',
      identifier: email,
      email,
    };
  }

  return null;
}

export function recoveryRouteForIdentifier(value) {
  const login = parseLoginIdentifier(value);
  if (!login) return null;
  if (login.kind === 'vk') return { kind: 'admin', vkId: login.vkId };
  return { kind: 'email', email: login.email };
}

export function firebaseAuthErrorText(error) {
  const code = String(error?.code || '');
  if (code === 'auth/user-disabled') return 'Доступ заблокирован администратором.';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(code)) {
    return 'Неверный логин или пароль.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Слишком много попыток. Подождите немного и попробуйте снова.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Не удалось связаться с Firebase. Проверьте интернет и попробуйте снова.';
  }
  if (code === 'auth/invalid-email') return 'Введите корректный email или числовой VK ID.';
  return 'Не удалось выполнить вход. Попробуйте ещё раз.';
}
