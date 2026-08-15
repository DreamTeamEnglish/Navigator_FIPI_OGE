(() => {
  'use strict';

  const APP_ID = 54721671;
  const REDIRECT_URL = 'https://dreamteamenglish.github.io/Navigator_FIPI_OGE/';
  const FUNCTION_URL = 'https://cyskqzsrcoxgxhidmkng.supabase.co/functions/v1/vk-donut-check';
  const STORAGE_PREFIX = 'oge-navigator-vkid-donut-test:';

  const loginButton = document.querySelector('#vkLoginButton');
  const checkButton = document.querySelector('#checkDonutButton');
  const callbackInput = document.querySelector('#callbackUrl');
  const loginStatus = document.querySelector('#loginStatus');
  const checkStatus = document.querySelector('#checkStatus');
  const resultBox = document.querySelector('#resultBox');
  const resultVkId = document.querySelector('#resultVkId');
  const resultDonut = document.querySelector('#resultDonut');
  const resultCheckedAt = document.querySelector('#resultCheckedAt');

  function setStatus(el, message, kind = '') {
    el.textContent = message;
    el.className = `status${kind ? ` ${kind}` : ''}`;
  }

  function randomUrlSafe(length = 72) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let out = '';
    for (let i = 0; i < bytes.length; i += 1) out += alphabet[bytes[i] % alphabet.length];
    return out;
  }

  function randomState(length = 40) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let out = '';
    for (let i = 0; i < bytes.length; i += 1) out += alphabet[bytes[i] % alphabet.length];
    return out;
  }

  function prepareVkId() {
    const VKID = window.VKIDSDK;
    if (!VKID?.Config?.init || !VKID?.Auth?.login) {
      throw new Error('VK ID SDK не загрузился. Обновите страницу и попробуйте снова.');
    }

    const state = randomState(40);
    const codeVerifier = randomUrlSafe(72);

    localStorage.setItem(`${STORAGE_PREFIX}state`, state);
    localStorage.setItem(`${STORAGE_PREFIX}code_verifier`, codeVerifier);
    localStorage.setItem(`${STORAGE_PREFIX}started_at`, new Date().toISOString());

    const config = {
      app: APP_ID,
      redirectUrl: REDIRECT_URL,
      state,
      codeVerifier
    };

    if (VKID.ConfigAuthMode?.Redirect) config.mode = VKID.ConfigAuthMode.Redirect;
    VKID.Config.init(config);
    return VKID;
  }

  async function startLogin() {
    loginButton.disabled = true;
    setStatus(loginStatus, 'Открываю VK ID…');

    try {
      const VKID = prepareVkId();
      await VKID.Auth.login();
    } catch (error) {
      console.error('VK ID login failed:', error);
      setStatus(loginStatus, `Ошибка: ${error?.message || error}`, 'error');
      loginButton.disabled = false;
    }
  }

  function parseCallbackUrl(raw) {
    const value = String(raw || '').trim();
    if (!value) throw new Error('Сначала вставьте callback URL.');

    let url;
    try { url = new URL(value); }
    catch { throw new Error('Не удалось распознать URL. Скопируйте его целиком из адресной строки.'); }

    if (url.origin !== 'https://dreamteamenglish.github.io' || url.pathname !== '/Navigator_FIPI_OGE/') {
      throw new Error('Это не callback основного Navigator. Нужен адрес /Navigator_FIPI_OGE/ после входа через VK.');
    }

    const code = url.searchParams.get('code') || '';
    const deviceId = url.searchParams.get('device_id') || '';
    const state = url.searchParams.get('state') || '';

    if (!code || !deviceId || !state) {
      throw new Error('В URL нет полного набора code + device_id + state. Выполните новый вход через VK.');
    }

    return { code, deviceId, state };
  }

  async function checkDonut() {
    checkButton.disabled = true;
    resultBox.classList.remove('show');
    setStatus(checkStatus, 'Проверяю временный код и VK Donut…');

    try {
      const callback = parseCallbackUrl(callbackInput.value);
      const expectedState = localStorage.getItem(`${STORAGE_PREFIX}state`) || '';
      const codeVerifier = localStorage.getItem(`${STORAGE_PREFIX}code_verifier`) || '';
      const startedAt = localStorage.getItem(`${STORAGE_PREFIX}started_at`) || '';

      if (!expectedState || !codeVerifier) {
        throw new Error('В этом браузере не найден PKCE-код теста. Сначала нажмите «Войти через VK» именно на этой странице.');
      }

      if (callback.state !== expectedState) {
        throw new Error('State не совпадает. Не используйте URL от предыдущего входа — выполните новый вход через VK.');
      }

      if (startedAt) {
        const ageMs = Date.now() - new Date(startedAt).getTime();
        if (Number.isFinite(ageMs) && ageMs > 9 * 60 * 1000) {
          throw new Error('Код почти наверняка истёк. Выполните новый вход через VK и сразу повторите проверку.');
        }
      }

      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: callback.code,
          device_id: callback.deviceId,
          state: callback.state,
          expected_state: expectedState,
          code_verifier: codeVerifier
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || `Edge Function вернула HTTP ${response.status}`);
      }

      resultVkId.textContent = String(data.vk_user_id ?? '—');
      resultDonut.textContent = data.is_don ? 'ДА · активный дон' : 'НЕТ · активная подписка не найдена';
      resultDonut.className = data.is_don ? 'yes' : 'no';
      resultCheckedAt.textContent = data.checked_at ? `Проверено: ${new Date(data.checked_at).toLocaleString('ru-RU')}` : '';
      resultBox.classList.add('show');
      setStatus(checkStatus, '✓ Серверная проверка завершена.', 'ok');

      localStorage.removeItem(`${STORAGE_PREFIX}state`);
      localStorage.removeItem(`${STORAGE_PREFIX}code_verifier`);
      localStorage.removeItem(`${STORAGE_PREFIX}started_at`);
    } catch (error) {
      console.error('Donut check failed:', error);
      setStatus(checkStatus, `Ошибка: ${error?.message || error}`, 'error');
    } finally {
      checkButton.disabled = false;
    }
  }

  loginButton.addEventListener('click', startLogin);
  checkButton.addEventListener('click', checkDonut);

  if (window.VKIDSDK) {
    setStatus(loginStatus, `Готово. APP_ID ${APP_ID}.`, 'ok');
  } else {
    setStatus(loginStatus, 'VK ID SDK пока не загрузился. Если сообщение не изменится — обновите страницу.', 'error');
  }
})();
