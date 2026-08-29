const VK_TECHNICAL_DOMAIN = 'dreamteam.invalid';
const EXPECTED_CATALOG_BYTES = 382742;
const EXPECTED_CARD_COUNT = 1735;

export function identifierToFirebaseEmail(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (/^\d{1,15}$/.test(normalized)) return `vk-${normalized}@${VK_TECHNICAL_DOMAIN}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return normalized;
  throw new Error('Введите email или числовой VK ID.');
}

function invalidCatalog() {
  return new Error('Invalid OGE catalog descriptor.');
}

export function validateAccessPayload(payload) {
  if (!payload || payload.ok !== true || typeof payload.profile !== 'object') {
    throw new Error('Invalid OGE access payload.');
  }

  const { profile, catalog } = payload;
  if (!['admin', 'teacher'].includes(profile.role)
    || profile.status !== 'active'
    || profile.access_level !== 'full') {
    throw new Error('Invalid OGE access profile.');
  }

  if (!catalog || typeof catalog !== 'object') throw invalidCatalog();

  let validDelivery = false;
  if (catalog.encoding === 'base64') {
    validDelivery = /^H4sI[A-Za-z0-9+/=]{32,}$/.test(String(catalog.data || ''));
  } else {
    try { validDelivery = new URL(String(catalog.url || '')).protocol === 'https:'; }
    catch { validDelivery = false; }
  }

  if (!validDelivery
    || Number(catalog.bytes) !== EXPECTED_CATALOG_BYTES
    || !/^[a-f0-9]{64}$/.test(String(catalog.sha256 || ''))
    || Number(catalog.card_count) !== EXPECTED_CARD_COUNT
    || !String(catalog.version || '').trim()) {
    throw invalidCatalog();
  }

  return payload;
}

export function accessErrorMessage(code) {
  const messages = {
    access_blocked: 'Доступ заблокирован администратором.',
    access_expired: 'Срок доступа к Navigator закончился.',
    access_missing: 'Для этого аккаунта нет доступа к Navigator.',
    access_pending: 'Доступ ожидает подтверждения администратора.',
    full_required: 'Для этого аккаунта нет полного доступа к каталогу.',
    invalid_token: 'Сессия завершена. Войдите снова.',
  };
  return messages[code] || 'Не удалось подтвердить доступ к Navigator.';
}
