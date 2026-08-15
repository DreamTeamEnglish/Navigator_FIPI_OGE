(() => {
  'use strict';

  const APP_ID = 54721671;
  const REDIRECT_URL = 'https://dreamteamenglish.github.io/Navigator_FIPI_OGE/';
  const STORAGE_PREFIX = 'oge-navigator-vkid-test:';

  const button = document.querySelector('#vkLoginButton');
  const status = document.querySelector('#vkStatus');

  function setStatus(message, kind = '') {
    status.textContent = message;
    status.className = `status${kind ? ` ${kind}` : ''}`;
  }

  function randomUrlSafe(length = 64) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let out = '';
    for (let i = 0; i < bytes.length; i += 1) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  }

  function prepareVkId() {
    const VKID = window.VKIDSDK;
    if (!VKID?.Config?.init || !VKID?.Auth?.login) {
      throw new Error('VK ID SDK не загрузился. Обновите страницу и попробуйте ещё раз.');
    }

    const state = randomUrlSafe(40);
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

    if (VKID.ConfigAuthMode?.Redirect) {
      config.mode = VKID.ConfigAuthMode.Redirect;
    }

    VKID.Config.init(config);
    return VKID;
  }

  async function startLogin() {
    button.disabled = true;
    setStatus('Открываю VK ID…');

    try {
      const VKID = prepareVkId();
      await VKID.Auth.login();
    } catch (error) {
      console.error('VK ID test failed:', error);
      setStatus(`Ошибка: ${error?.message || error}`, 'error');
      button.disabled = false;
    }
  }

  button.addEventListener('click', startLogin);

  try {
    const VKID = window.VKIDSDK;
    if (!VKID) {
      setStatus('VK ID SDK пока не загрузился. Если сообщение не изменится — обновите страницу.', 'error');
    } else {
      setStatus(`Готово. APP_ID ${APP_ID}. Тест не затрагивает рабочий Navigator.`, 'ok');
    }
  } catch (error) {
    console.error(error);
  }
})();
