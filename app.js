import { waitForFirebaseAdapter } from './firebase-ready.mjs';

// Navigator_FIPI_OGE v0.9.9Y6 ADMIN POLISH — universal display names · protected self-name edit · MEDIA HYBRID preserved
(() => {
  'use strict';

  const DATA = window.OGE_DATA || { topics: [], buckets: [], tasks: [] };
  const CONFIG = window.OGE_CONFIG || {};
  const DEMO_STATUS_KEY = 'oge-navigator-demo-status-v090';
  const CLOUD_CACHE_PREFIX = 'oge-navigator-teacher-cache-v090:';
  const PENDING_PREFIX = 'oge-navigator-pending-v090:';
  const CATALOG_PAGE_SIZE = 1000;
  const DONUT_PAGE_SIZE = 250;
  const UNTAGGED_TOPIC_ID = '__untagged__';
  const ADMIN_CONTACT_URL = 'https://vk.ru/im?sel=-229391051';
  const ADMIN_CONTACT_TEXT = 'Здравствуйте! Хочу получить доступ к тематическому навигатору по открытому банку заданий ОГЭ ФИПИ (English).';
  const VK_APP_ID = 54721671;
  const VK_REDIRECT_URLS = Object.freeze({
    'https://dreamteamenglish.github.io': 'https://dreamteamenglish.github.io/Navigator_FIPI_OGE/',
    'https://dreamteamenglish.gitverse.site': 'https://dreamteamenglish.gitverse.site/navigator_fipi_oge'
  });
  const DONUT_FUNCTION_URL = 'https://cyskqzsrcoxgxhidmkng.supabase.co/functions/v1/vk-donut-access';
  const DONUT_STORAGE_PREFIX = 'oge-navigator-donut:';
  const BACKUP_GATEWAY_URL = `${CONFIG.supabaseUrl || 'https://cyskqzsrcoxgxhidmkng.supabase.co'}/functions/v1/oge-backup-gateway`;
  const MEDIA_DELIVERY_FUNCTION_URL = `${CONFIG.supabaseUrl || 'https://cyskqzsrcoxgxhidmkng.supabase.co'}/functions/v1/oge-media-delivery`;
  const DELIVERY_FUNCTION_URL = `${CONFIG.supabaseUrl || 'https://cyskqzsrcoxgxhidmkng.supabase.co'}/functions/v1/oge-delivery`;
  const CATALOG_CACHE_DB = 'oge-navigator-protected-catalog-v1';
  const CATALOG_CACHE_STORE = 'catalogs';
  const CATALOG_CACHE_KEY = 'full';
  const BACKUP_PREVIEW_KEY = 'oge-backup-admin-preview-v020';
  const BACKUP_VIEWER_RENDER_VERSION = '0.2.3';
  const SOURCE_PREF_PREFIX = 'oge-navigator-source-pref-v099y3:';
  const MANUAL_ACCESS_FUNCTION_URL = `${CONFIG.supabaseUrl || 'https://cyskqzsrcoxgxhidmkng.supabase.co'}/functions/v1/oge-manual-access`;
  const MANUAL_VK_EMAIL_DOMAIN = 'example.com';
  const PRIMARY_NAVIGATOR_URL = 'https://navigator-fipi-oge-dreamteam.website.yandexcloud.net';
  const RESUME_ACCESS_RECHECK_MS = 5 * 60 * 1000;
  const RESUME_STATUS_RECHECK_MS = 30 * 1000;

  const el = {
    bootState: document.querySelector('#bootState'),
    bootMessage: document.querySelector('#bootMessage'),
    bootDetail: document.querySelector('#bootDetail'),
    bootSlowNote: document.querySelector('#bootSlowNote'),
    accessGate: document.querySelector('#accessGate'),
    appShell: document.querySelector('#appShell'),
    accessMessage: document.querySelector('#accessMessage'),
    openLoginButton: document.querySelector('#openLoginButton'),
    openDonutButton: document.querySelector('#openDonutButton'),
    openDemoButton: document.querySelector('#openDemoButton'),
    headerLoginButton: document.querySelector('#headerLoginButton'),
    signOutButton: document.querySelector('#signOutButton'),
    adminAccessButton: document.querySelector('#adminAccessButton'),
    cloudBadge: document.querySelector('#cloudBadge'),
    sourceBadge: document.querySelector('#sourceBadge'),
    modeKicker: document.querySelector('#modeKicker'),
    brandLogo: document.querySelector('#brandLogo'),
    footerYear: document.querySelector('#footerYear'),
    toast: document.querySelector('#toast'),
    copyAdminTextButton: document.querySelector('#copyAdminTextButton'),

    topic: document.querySelector('#topicSelect'),
    subtopic: document.querySelector('#subtopicSelect'),
    bucket: document.querySelector('#bucketSelect'),
    status: document.querySelector('#statusSelect'),
    search: document.querySelector('#searchInput'),
    reset: document.querySelector('#resetButton'),
    matrix: document.querySelector('#matrix'),
    matrixViewport: document.querySelector('#matrixViewport'),
    scrollLeftButton: document.querySelector('#scrollLeftButton'),
    scrollRightButton: document.querySelector('#scrollRightButton'),
    empty: document.querySelector('#emptyState'),
    selectionTitle: document.querySelector('#selectionTitle'),
    sectionMeta: document.querySelector('#sectionMeta'),
    visibleCount: document.querySelector('#visibleCount'),
    viewedCount: document.querySelector('#viewedCount'),
    usedCount: document.querySelector('#usedCount'),

    authDialog: document.querySelector('#authDialog'),
    authHint: document.querySelector('#authHint'),
    authError: document.querySelector('#authError'),
    loginIdentifier: document.querySelector('#loginIdentifierInput'),
    password: document.querySelector('#passwordInput'),
    signIn: document.querySelector('#signInButton'),
    forgotVkPasswordButton: document.querySelector('#forgotVkPasswordButton'),

    firstPasswordDialog: document.querySelector('#firstPasswordDialog'),
    firstPasswordInput: document.querySelector('#firstPasswordInput'),
    firstPasswordRepeat: document.querySelector('#firstPasswordRepeat'),
    firstPasswordError: document.querySelector('#firstPasswordError'),
    saveFirstPasswordButton: document.querySelector('#saveFirstPasswordButton'),

    recoveryDialog: document.querySelector('#recoveryDialog'),
    closeRecoveryDialogButton: document.querySelector('#closeRecoveryDialogButton'),
    recoveryVkIdInput: document.querySelector('#recoveryVkIdInput'),
    recoveryCodeInput: document.querySelector('#recoveryCodeInput'),
    recoveryPasswordInput: document.querySelector('#recoveryPasswordInput'),
    recoveryPasswordRepeat: document.querySelector('#recoveryPasswordRepeat'),
    recoveryError: document.querySelector('#recoveryError'),
    recoverPasswordButton: document.querySelector('#recoverPasswordButton'),

    recoveryCodeDialog: document.querySelector('#recoveryCodeDialog'),
    recoveryCodeValue: document.querySelector('#recoveryCodeValue'),
    copyRecoveryCodeButton: document.querySelector('#copyRecoveryCodeButton'),
    confirmRecoveryCodeButton: document.querySelector('#confirmRecoveryCodeButton'),

    accessEndedDialog: document.querySelector('#accessEndedDialog'),
    accessEndedText: document.querySelector('#accessEndedText'),
    closeAccessEndedButton: document.querySelector('#closeAccessEndedButton'),

    adminAccessDialog: document.querySelector('#adminAccessDialog'),
    closeAdminAccessDialogButton: document.querySelector('#closeAdminAccessDialogButton'),
    adminDemoState: document.querySelector('#adminDemoState'),
    toggleDemoButton: document.querySelector('#toggleDemoButton'),
    previewDemoButton: document.querySelector('#previewDemoButton'),
    adminUserStats: document.querySelector('#adminUserStats'),
    adminUsersList: document.querySelector('#adminUsersList'),
    adminDonutList: document.querySelector('#adminDonutList'),
    adminParticipantsTab: document.querySelector('#adminParticipantsTab'),
    adminDonutTab: document.querySelector('#adminDonutTab'),
    adminParticipantsPanel: document.querySelector('#adminParticipantsPanel'),
    adminDonutPanel: document.querySelector('#adminDonutPanel'),
    adminParticipantsBadge: document.querySelector('#adminParticipantsBadge'),
    adminDonutBadge: document.querySelector('#adminDonutBadge'),
    createManualVkButton: document.querySelector('#createManualVkButton'),
    refreshAdminUsersButton: document.querySelector('#refreshAdminUsersButton'),
    statsPeriodSelect: document.querySelector('#statsPeriodSelect'), statsFromDate: document.querySelector('#statsFromDate'), statsToDate: document.querySelector('#statsToDate'), refreshStatsButton: document.querySelector('#refreshStatsButton'), statsPeriodLabel: document.querySelector('#statsPeriodLabel'), statsVisits: document.querySelector('#statsVisits'), statsUnique: document.querySelector('#statsUnique'), statsEmail: document.querySelector('#statsEmail'), statsDonut: document.querySelector('#statsDonut'), statsGithub: document.querySelector('#statsGithub'), statsYandex: document.querySelector('#statsYandex'), statsChart: document.querySelector('#statsChart'), statsTooltip: document.querySelector('#statsTooltip'),

    userAccessDialog: document.querySelector('#userAccessDialog'),
    closeUserAccessDialogButton: document.querySelector('#closeUserAccessDialogButton'),
    userAccessNameInput: document.querySelector('#userAccessNameInput'),
    userAccessIdentityInput: document.querySelector('#userAccessIdentityInput'),
    userAccessSelfNote: document.querySelector('#userAccessSelfNote'),
    userStatusSelect: document.querySelector('#userStatusSelect'),
    userAccessLevelSelect: document.querySelector('#userAccessLevelSelect'),
    userExpiryPresetSelect: document.querySelector('#userExpiryPresetSelect'),
    customExpiryLabel: document.querySelector('#customExpiryLabel'),
    customExpiryDate: document.querySelector('#customExpiryDate'),
    cancelUserAccessButton: document.querySelector('#cancelUserAccessButton'),
    saveUserAccessButton: document.querySelector('#saveUserAccessButton'),

    manualVkAdminDialog: document.querySelector('#manualVkAdminDialog'),
    closeManualVkAdminDialogButton: document.querySelector('#closeManualVkAdminDialogButton'),
    manualVkAdminTitle: document.querySelector('#manualVkAdminTitle'),
    manualVkNameInput: document.querySelector('#manualVkNameInput'),
    manualVkIdInput: document.querySelector('#manualVkIdInput'),
    manualVkSourceSelect: document.querySelector('#manualVkSourceSelect'),
    manualVkAdminError: document.querySelector('#manualVkAdminError'),
    createManualVkAccessButton: document.querySelector('#createManualVkAccessButton'),
    adminCredentialsDialog: document.querySelector('#adminCredentialsDialog'),
    adminCredentialsText: document.querySelector('#adminCredentialsText'),
    copyAdminCredentialsButton: document.querySelector('#copyAdminCredentialsButton'),
    closeAdminCredentialsButton: document.querySelector('#closeAdminCredentialsButton'),

    createEmailAccessButton: document.querySelector('#createEmailAccessButton'),
    importSupabaseUsersButton: document.querySelector('#importSupabaseUsersButton'),
    importSupabaseUsersInput: document.querySelector('#importSupabaseUsersInput'),
    emailAccessAdminDialog: document.querySelector('#emailAccessAdminDialog'),
    closeEmailAccessAdminDialogButton: document.querySelector('#closeEmailAccessAdminDialogButton'),
    emailAccessNameInput: document.querySelector('#emailAccessNameInput'),
    emailAccessEmailInput: document.querySelector('#emailAccessEmailInput'),
    emailAccessLevelSelect: document.querySelector('#emailAccessLevelSelect'),
    emailAccessExpiryPresetSelect: document.querySelector('#emailAccessExpiryPresetSelect'),
    emailAccessCustomExpiryLabel: document.querySelector('#emailAccessCustomExpiryLabel'),
    emailAccessCustomExpiryDate: document.querySelector('#emailAccessCustomExpiryDate'),
    emailAccessAdminError: document.querySelector('#emailAccessAdminError'),
    createEmailAccessSubmitButton: document.querySelector('#createEmailAccessSubmitButton'),

    topicDialog: document.querySelector('#topicDialog'),
    topicEditorTaskId: document.querySelector('#topicEditorTaskId'),
    topicEditorAutoTags: document.querySelector('#topicEditorAutoTags'),
    topicOverrideMode: document.querySelector('#topicOverrideMode'),
    topicOverrideRows: document.querySelector('#topicOverrideRows'),
    addTopicRowButton: document.querySelector('#addTopicRowButton'),
    topicOverrideNote: document.querySelector('#topicOverrideNote'),
    saveTopicOverrideButton: document.querySelector('#saveTopicOverrideButton'),
    resetTopicOverrideButton: document.querySelector('#resetTopicOverrideButton'),
    closeTopicDialogButton: document.querySelector('#closeTopicDialogButton')
  };

  let supabaseClient = null;
  let currentUser = null;
  let currentProfile = null;
  let appMode = 'boot'; // boot | gate | demo | donut | admin | teacher | demo_user | pending | blocked
  let tasks = [];
  let baseCards = [];
  let overrideMap = new Map();
  let editingTaskId = null;
  let records = {};
  let refreshInFlight = false;
  let adminProfiles = [];
  let editingAccessUserId = null;
  let demoEnabledState = false;
  let toastTimer = null;
  let donutUserId = null;
  let adminDonutSessions = [];
  let adminStatsUsers = new Map();
  let adminDonutLoadError = '';
  let initialBootPending = true;
  let resumeValidationInFlight = false;
  let resumeValidationTimer = null;
  let lastResumeValidationAt = 0;
  let lastVisibleStatusRefreshAt = 0;
  let bootSlowTimer = null;
  let authActivationPromise = null;
  let authActivationUserId = '';
  let pendingRecoveryContinuation = null;
  let pendingRecoveredLogin = null;
  let manualAdminPrefillVkId = '';
  let backupRuntime = { content_source: 'fipi', yandex_backup_ready: false, backup_version: '0.1.0' };
  let backupPreviewEnabled = sessionStorage.getItem(BACKUP_PREVIEW_KEY) === '1';
  let backupObjectUrls = [];

  function configuredKey() {
    return CONFIG.supabasePublishableKey || CONFIG.supabaseAnonKey || '';
  }

  function normalizeVkId(value) {
    const raw = String(value ?? '').trim();
    const number = Number(raw);
    return /^\d{1,15}$/.test(raw) && Number.isSafeInteger(number) && number > 0 ? raw : '';
  }

  function manualVkEmail(vkId) {
    return `navigator-vk-${vkId}@${MANUAL_VK_EMAIL_DOMAIN}`;
  }

  function resolveLoginIdentifier(value) {
    const raw = String(value ?? '').trim();
    const vkId = normalizeVkId(raw);
    if (vkId) return { kind: 'vk', vkId, email: manualVkEmail(vkId) };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return { kind: 'email', vkId: '', email: raw };
    return null;
  }

  function updateRecoveryVisibility() {
    const login = resolveLoginIdentifier(el.loginIdentifier?.value || '');
    el.forgotVkPasswordButton?.classList.toggle('hidden', !login);
  }

  function usesFirebaseEmergencyAuth() {
    if (CONFIG.authProvider !== 'firebase') return false;
    return Boolean(window.OGE_FIREBASE_AUTH);
  }

  async function currentSupabaseAccessToken() {
    if (!supabaseClient) return '';
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return data?.session?.access_token || '';
  }

  async function callManualAccess(payload, token = '') {
    const headers = { 'Content-Type': 'application/json', apikey: configuredKey() };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(MANUAL_ACCESS_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    let data = {};
    try { data = await response.json(); }
    catch { data = {}; }
    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.code || `HTTP ${response.status}`);
      error.code = data?.code || '';
      error.status = response.status;
      error.retryAfterSeconds = Number(data?.retry_after_seconds || 0);
      throw error;
    }
    return data;
  }

  function manualAccessErrorText(error) {
    const code = String(error?.code || error?.message || '');
    if (code === 'password_too_short') return 'Пароль должен содержать не менее 10 символов.';
    if (code === 'password_too_long') return 'Пароль слишком длинный.';
    if (code === 'invalid_vk_id') return 'Проверьте VK ID: нужны только цифры.';
    if (code === 'vk_already_linked') return 'Для этого VK ID постоянный вход уже создан.';
    if (code === 'invalid_email') return 'Проверьте email.';
    if (code === 'email_already_linked') return 'Для этого email управляемый доступ уже создан.';
    if (code === 'email_auth_exists') return 'Этот email уже существует в Supabase Auth. Новый аккаунт не создан, чтобы не перезаписать существующий доступ.';
    if (code === 'firebase_email_exists') return 'Этот email уже существует в Firebase. Новый аккаунт не создан.';
    if (code === 'firebase_user_missing' || code === 'admin_user_missing') return 'Пользователь не найден в Firebase.';
    if (code === 'firebase_admin_forbidden') return 'Firebase не разрешил административное действие. Проверьте права сервисного аккаунта.';
    if (code === 'firebase_admin_config_missing') return 'Административный ключ Firebase ещё не подключён к функции Яндекса.';
    if (code === 'invalid_recovery') return 'Email / VK ID или код восстановления не совпадают.';
    if (code === 'recovery_locked') {
      const mins = Math.max(1, Math.ceil(Number(error?.retryAfterSeconds || 900) / 60));
      return `Слишком много попыток. Повторите примерно через ${mins} мин.`;
    }
    if (code === 'access_ended') return 'access_ended';
    if (code === 'admin_only') return 'Действие доступно только администратору.';
    return 'Не удалось выполнить действие. Попробуйте ещё раз чуть позже.';
  }

  function clearInlineError(node) {
    if (!node) return;
    node.textContent = '';
    node.classList.add('hidden');
  }

  function showInlineError(node, message) {
    if (!node) return;
    node.textContent = message;
    node.classList.remove('hidden');
  }

  function currentPlatform() {
    const host = String(window.location.hostname || '').toLowerCase();
    if (host.endsWith('github.io')) return 'github';
    if (host.endsWith('yandexcloud.net')) return 'yandex';
    if (host.endsWith('gitverse.site')) return 'gitverse';
    return 'other';
  }

  function isCloudConfigured() {
    if (CONFIG.authProvider === 'firebase') return usesFirebaseEmergencyAuth();
    return Boolean(CONFIG.supabaseUrl && configuredKey() && window.supabase?.createClient);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[ch]));
  }
  const escapeAttr = escapeHtml;

  function safeParse(raw, fallback = {}) {
    try { return JSON.parse(raw || '') || fallback; }
    catch { return fallback; }
  }


  function isAuthenticatedWorkspaceMode() {
    return ['admin', 'teacher', 'demo_user'].includes(appMode);
  }

  function isProfileExpired(profile) {
    if (!profile?.access_expires_at) return false;
    return new Date(profile.access_expires_at).getTime() <= Date.now();
  }

  function showToast(message) {
    if (!el.toast) return;
    window.clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.remove('hidden');
    toastTimer = window.setTimeout(() => el.toast.classList.add('hidden'), 3600);
  }

  function fallbackCopyText(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); }
    finally { area.remove(); }
  }

  function copyAdminContactText() {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(ADMIN_CONTACT_TEXT)
          .then(() => showToast('✓ Текст обращения скопирован — вставьте его в сообщение VK'))
          .catch(() => {
            fallbackCopyText(ADMIN_CONTACT_TEXT);
            showToast('✓ Текст обращения скопирован — вставьте его в сообщение VK');
          });
      } else {
        fallbackCopyText(ADMIN_CONTACT_TEXT);
        showToast('✓ Текст обращения скопирован — вставьте его в сообщение VK');
      }
    } catch {
      fallbackCopyText(ADMIN_CONTACT_TEXT);
      showToast('✓ Текст обращения скопирован — вставьте его в сообщение VK');
    }
  }

  function normalizeRecords(value) {
    const out = {};
    if (!value || typeof value !== 'object') return out;
    for (const [taskId, row] of Object.entries(value)) {
      if (typeof row === 'string') out[taskId] = { status: row, updatedAt: null };
      else if (row && typeof row === 'object' && typeof row.status === 'string') {
        out[taskId] = { status: row.status, updatedAt: row.updatedAt || row.updated_at || null };
      }
    }
    return out;
  }

  function cacheKey(userId) { return `${CLOUD_CACHE_PREFIX}${userId}`; }
  function pendingKey(userId) { return `${PENDING_PREFIX}${userId}`; }

  function loadDemoRecords() {
    return normalizeRecords(safeParse(localStorage.getItem(DEMO_STATUS_KEY), {}));
  }

  function loadCloudCache(userId) {
    return normalizeRecords(safeParse(localStorage.getItem(cacheKey(userId)), {}));
  }

  function saveActiveRecords() {
    if (currentUser && isAuthenticatedWorkspaceMode()) {
      localStorage.setItem(cacheKey(currentUser.id), JSON.stringify(records));
    } else if (appMode === 'demo') {
      localStorage.setItem(DEMO_STATUS_KEY, JSON.stringify(records));
    } else if (appMode === 'donut' && donutUserId) {
      localStorage.setItem(`${DONUT_STORAGE_PREFIX}status:${donutUserId}`, JSON.stringify(records));
    }
  }

  function loadPending(userId) {
    return normalizeRecords(safeParse(localStorage.getItem(pendingKey(userId)), {}));
  }

  function savePending(userId, pending) {
    if (Object.keys(pending).length) localStorage.setItem(pendingKey(userId), JSON.stringify(pending));
    else localStorage.removeItem(pendingKey(userId));
  }

  function taskKey(task) {
    return task.fipiId;
  }

  function getStatus(taskId) {
    return records[taskId]?.status || 'new';
  }

  function nextStatus(status) {
    if (status === 'new') return 'viewed';
    if (status === 'viewed') return 'used';
    return 'new';
  }

  function statusLabel(status) {
    return status === 'used' ? 'использовано' : status === 'viewed' ? 'просмотрено' : 'новое';
  }

  function setBadge(kind, text, title = '') {
    el.cloudBadge.textContent = text;
    el.cloudBadge.title = title;
    el.cloudBadge.className = `cloud-badge ${kind}`;
  }

  function showAccessMessage(message, kind = 'info') {
    el.accessMessage.textContent = message;
    el.accessMessage.className = `access-message ${kind}`;
  }

  function clearAccessMessage() {
    el.accessMessage.textContent = '';
    el.accessMessage.className = 'access-message hidden';
  }

  function showAuthError(message) {
    el.authError.textContent = message;
    el.authError.classList.remove('hidden');
  }

  function clearAuthError() {
    el.authError.textContent = '';
    el.authError.classList.add('hidden');
  }

  function authErrorText(error) {
    const msg = String(error?.message || 'Неизвестная ошибка');
    if (/invalid login credentials/i.test(msg)) return 'Неверный email или пароль.';
    if (/email not confirmed/i.test(msg)) return 'Email ещё не подтверждён. Откройте письмо-приглашение.';
    return msg;
  }

  function normalizeTag(tag) {
    if (!tag || typeof tag !== 'object') return null;
    const topic = tag.topic_id || tag.topic || null;
    if (!topic) return null;
    return {
      topic,
      subtopic: tag.subtopic || null,
      confidence: Number(tag.confidence || 0),
      source: tag.source || null
    };
  }

  function dedupeTags(tags) {
    const seen = new Set();
    const out = [];
    for (const tag of tags || []) {
      if (!tag?.topic) continue;
      const key = `${tag.topic}\u0000${tag.subtopic || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(tag);
    }
    return out;
  }

  function normalizeTask(card, override = null) {
    const autoTags = dedupeTags(
      (Array.isArray(card?.tags) ? card.tags : [])
        .map(normalizeTag)
        .filter(Boolean)
        .sort((a, b) => b.confidence - a.confidence)
    );

    const manualTags = dedupeTags(
      (Array.isArray(override?.manual_tags) ? override.manual_tags : [])
        .map(normalizeTag)
        .filter(Boolean)
    );

    const effectiveTags = override
      ? (override.mode === 'replace'
          ? manualTags
          : dedupeTags([...manualTags, ...autoTags]))
      : autoTags;

    return {
      ...card,
      fipiId: card?.fipiId || card?.fipi_id || '',
      bucket: card?.bucket || '',
      url: card?.url || '',
      liveKesCode: card?.liveKesCode || card?.live_kes_code || null,
      answerType: card?.answerType || card?.answer_type || null,
      topicId: card?.topicId || card?.topic_id || null,
      subtopic: card?.subtopic || null,
      keywords: Array.isArray(card?.keywords) ? card.keywords : [],
      tags: effectiveTags,
      _autoTags: autoTags,
      _override: override || null
    };
  }

  function setTasks(cards, overrides = new Map(), resetAfter = true) {
    baseCards = Array.isArray(cards) ? cards.slice() : [];
    overrideMap = overrides instanceof Map ? overrides : new Map();
    tasks = baseCards
      .map(card => normalizeTask(card, overrideMap.get(card?.fipiId || card?.fipi_id || '') || null))
      .filter(t => t.fipiId && t.bucket && t.url);
    DATA.tasks = tasks;
    populateTopics();
    if (resetAfter) resetFilters(false);
    else populateSubtopics();
    render();
  }

  function availableTopicIds() {
    const ids = new Set();
    for (const task of tasks) for (const tag of task.tags) if (tag.topic) ids.add(tag.topic);
    if (tasks.some(task => !task.tags.length)) ids.add(UNTAGGED_TOPIC_ID);
    return ids;
  }

  function populateTopics() {
    const available = availableTopicIds();
    const options = DATA.topics.filter(t => t.id === 'all' || available.has(t.id));
    const previous = el.topic.value || 'all';
    el.topic.innerHTML = options.map(t => `<option value="${escapeAttr(t.id)}">${escapeHtml(t.name)}</option>`).join('');
    el.topic.value = options.some(t => t.id === previous) ? previous : 'all';
    populateSubtopics();
  }

  function populateSubtopics() {
    const topicId = el.topic.value || 'all';
    const previous = el.subtopic.value || 'all';
    const values = new Set();

    if (topicId !== 'all' && topicId !== UNTAGGED_TOPIC_ID) {
      for (const task of tasks) {
        for (const tag of task.tags) {
          if (tag.topic === topicId && tag.subtopic) values.add(tag.subtopic);
        }
      }
    }

    const sorted = [...values].sort((a, b) => a.localeCompare(b, 'ru'));
    el.subtopic.innerHTML = ['<option value="all">Все подтемы</option>']
      .concat(sorted.map(s => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`))
      .join('');
    el.subtopic.value = sorted.includes(previous) ? previous : 'all';
    el.subtopic.disabled = topicId === UNTAGGED_TOPIC_ID;
  }

  function populateBuckets() {
    if (!el.bucket) return;
    const previous = el.bucket.value || 'all';
    const options = [
      '<option value="all">Все 11 разделов ОГЭ</option>',
      ...DATA.buckets.map(bucket => {
        const range = bucket.range ? ` · ${bucket.range}` : '';
        return `<option value="${escapeAttr(bucket.id)}">${escapeHtml(bucket.section)} · ${escapeHtml(bucket.title)}${escapeHtml(range)}</option>`;
      })
    ];
    el.bucket.innerHTML = options.join('');
    el.bucket.value = DATA.buckets.some(b => b.id === previous) ? previous : 'all';
  }

  function visibleBuckets() {
    const selected = el.bucket?.value || 'all';
    return selected === 'all'
      ? DATA.buckets
      : DATA.buckets.filter(bucket => bucket.id === selected);
  }

  function filterTasks() {
    const topic = el.topic.value || 'all';
    const subtopic = el.subtopic.value || 'all';
    const bucket = el.bucket?.value || 'all';
    const status = el.status.value || 'all';
    const search = el.search.value.trim().toLowerCase();

    return tasks.filter(task => {
      const taskStatus = getStatus(taskKey(task));
      const topicMatch = topic === 'all'
        || (topic === UNTAGGED_TOPIC_ID ? task.tags.length === 0 : task.tags.some(tag => tag.topic === topic));
      const subtopicMatch = subtopic === 'all'
        || (topic !== UNTAGGED_TOPIC_ID && task.tags.some(tag => tag.topic === topic && tag.subtopic === subtopic));
      const bucketMatch = bucket === 'all' || task.bucket === bucket;
      const statusMatch = status === 'all' || taskStatus === status;
      const topicTexts = task.tags.flatMap(tag => {
        const meta = DATA.topics.find(t => t.id === tag.topic);
        return [tag.topic, meta?.name || '', tag.subtopic || ''];
      });
      const haystack = [
        task.fipiId,
        task.liveKesCode || '',
        task.answerType || '',
        ...(task.keywords || []),
        ...topicTexts
      ].join(' ').toLowerCase();
      const searchMatch = !search || haystack.includes(search);
      return topicMatch && subtopicMatch && bucketMatch && statusMatch && searchMatch;
    });
  }

  function isFullSourceWorkspace() {
    if (appMode === 'donut') return Boolean(donutUserId);
    return Boolean(currentUser && ['admin','teacher'].includes(appMode) && currentProfile?.access_level === 'full');
  }

  function sourcePreferenceKey() {
    if (appMode === 'donut' && donutUserId) return `${SOURCE_PREF_PREFIX}vk:${donutUserId}`;
    if (currentUser?.id) return `${SOURCE_PREF_PREFIX}auth:${currentUser.id}`;
    return '';
  }

  function personalSourcePreference() {
    const key = sourcePreferenceKey();
    if (!key) return '';
    const value = localStorage.getItem(key) || '';
    return ['fipi','yandex_backup'].includes(value) ? value : '';
  }

  function effectiveContentSource() {
    if (!isFullSourceWorkspace()) return 'fipi';
    if (!backupRuntime?.yandex_backup_ready) return 'fipi';
    if (appMode === 'admin' && backupPreviewEnabled) return 'yandex_backup';
    return personalSourcePreference() || backupRuntime.content_source || 'fipi';
  }

  function updateSourceBadge() {
    if (!el.sourceBadge) return;
    const visible = isFullSourceWorkspace();
    el.sourceBadge.classList.toggle('hidden', !visible);
    if (!visible) return;

    const effective = effectiveContentSource();
    const yandex = effective === 'yandex_backup';
    el.sourceBadge.textContent = yandex ? 'Источник: ЯНДЕКС' : 'Источник: FIPI';
    el.sourceBadge.disabled = !backupRuntime?.yandex_backup_ready && !yandex;
    el.sourceBadge.classList.toggle('source-yandex', yandex);
    el.sourceBadge.title = !backupRuntime?.yandex_backup_ready
      ? 'Яндекс-резерв временно выключен администратором · используется ФИПИ'
      : (yandex ? 'Нажмите, чтобы перейти на официальный ФИПИ' : 'Нажмите, чтобы открыть задания из Яндекс-резерва');
  }

  function setPersonalSourcePreference(source) {
    if (!isFullSourceWorkspace() || !['fipi','yandex_backup'].includes(source)) return;
    if (source === 'yandex_backup' && !backupRuntime?.yandex_backup_ready) {
      showToast('Яндекс-резерв временно выключен администратором');
      updateSourceBadge();
      return;
    }
    const key = sourcePreferenceKey();
    if (!key) return;
    localStorage.setItem(key, source);
    updateSourceBadge();
    render();
    showToast(source === 'yandex_backup' ? '✓ Ваш источник: Яндекс-резерв' : '✓ Ваш источник: ФИПИ');
  }

  function togglePersonalSource() {
    if (!isFullSourceWorkspace()) return;
    const next = effectiveContentSource() === 'yandex_backup' ? 'fipi' : 'yandex_backup';
    setPersonalSourcePreference(next);
  }

  function backupIsActiveForCards() {
    return effectiveContentSource() === 'yandex_backup';
  }

  async function refreshBackupRuntime() {
    if (!supabaseClient) return backupRuntime;

    try {
      let data;
      let error;

      if (appMode === 'donut') {
        // Donut has no Supabase Auth JWT. This RPC exposes only the harmless
        // global source/ready/version flags; access to actual backup content
        // is still checked server-side by oge-backup-gateway.
        ({ data, error } = await supabaseClient.rpc('oge_backup_runtime_public_v0962'));
      } else {
        if (!currentUser || (!['admin','teacher'].includes(appMode) &&
            currentProfile?.role !== 'admin' && currentProfile?.role !== 'teacher')) {
          return backupRuntime;
        }
        ({ data, error } = await supabaseClient.rpc('oge_backup_runtime_config'));
      }

      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (row) backupRuntime = { ...backupRuntime, ...row };
    } catch (error) {
      console.warn('OGE backup runtime unavailable:', error);
    }

    renderBackupAdminState();
    updateSourceBadge();
    return backupRuntime;
  }

  function revokeBackupObjectUrls() {
    backupObjectUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch {} });
    backupObjectUrls = [];
  }

  function ensureBackupViewerUi() {
    if (!document.querySelector('#ogeBackupViewer')) {
      const dialog = document.createElement('dialog');
      dialog.id = 'ogeBackupViewer';
      dialog.className = 'oge-backup-dialog';
      dialog.innerHTML = `
        <div class="oge-backup-card">
          <div class="oge-backup-toolbar">
            <button id="ogeBackupPrint" class="oge-backup-print" type="button">🖨 Печать / PDF</button>
            <button id="ogeBackupClose" class="oge-backup-close" type="button" aria-label="Закрыть">×</button>
          </div>
          <div id="ogeBackupViewerBody"></div>
        </div>`;
      document.body.appendChild(dialog);
      dialog.querySelector('#ogeBackupClose').addEventListener('click', () => dialog.close());
      dialog.querySelector('#ogeBackupPrint').addEventListener('click', () => window.print());
      dialog.addEventListener('close', revokeBackupObjectUrls);
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    }

    if (!document.querySelector('#ogeBackupViewerStyle')) {
      const style = document.createElement('style');
      style.id = 'ogeBackupViewerStyle';
      style.textContent = `
        .oge-backup-dialog{width:min(1040px,94vw);max-height:92vh;padding:0;border:1px solid rgba(214,171,73,.45);border-radius:18px;background:#07152f;color:#eef4ff;box-shadow:0 28px 80px rgba(0,0,0,.55)}
        .oge-backup-dialog::backdrop{background:rgba(2,8,22,.78);backdrop-filter:blur(3px)}
        .oge-backup-card{position:relative;padding:26px;overflow:auto;max-height:92vh;background:linear-gradient(180deg,#0a1d42 0%,#07152f 100%)}
        .oge-backup-close{position:absolute;right:15px;top:12px;border:0;background:transparent;color:#e8c66a;font-size:30px;cursor:pointer}
        .oge-backup-kicker{font-size:11px;letter-spacing:.16em;color:#e3bf5b;font-weight:800;text-transform:uppercase}
        .oge-backup-title{margin:7px 42px 4px 0;font:700 clamp(25px,3vw,38px)/1.08 Georgia,serif;color:#fff}
        .oge-backup-meta{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 20px}.oge-backup-chip{border:1px solid rgba(227,191,91,.35);border-radius:999px;padding:5px 9px;font-size:12px;color:#d8e4ff;background:rgba(255,255,255,.04)}
        .oge-backup-section{margin:18px 0;padding:17px 18px;border-radius:14px;background:#fff;color:#14213b}.oge-backup-section h4{margin:0 0 10px;color:#17376d;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.oge-backup-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;font-size:15px}
        .oge-backup-media{display:grid;gap:12px}.oge-backup-media img{display:block;max-width:100%;height:auto;margin:auto;border-radius:10px}.oge-backup-media audio{width:100%}
        .oge-backup-table{width:100%;border-collapse:collapse;margin:10px 0;font-size:14px}.oge-backup-table td{border:1px solid #cbd5e4;padding:7px 8px;vertical-align:top}.oge-backup-source-word{width:150px;font-weight:800;white-space:nowrap}.oge-backup-question{font-weight:700}.oge-backup-option-number{width:54px;white-space:nowrap}.oge-backup-group-list{display:grid;gap:12px;margin-top:8px}.oge-backup-group-item{display:grid;grid-template-columns:48px 1fr;gap:12px;padding:13px 14px;border:1px solid #d4dcea;border-radius:11px;background:#f8fafc}.oge-backup-group-item.is-current{border-color:#c99a32;box-shadow:0 0 0 1px rgba(201,154,50,.18)}.oge-backup-group-number{display:flex;align-items:flex-start;justify-content:center;font:800 18px/1.2 Georgia,serif;color:#17376d}.oge-backup-group-prompt{font-weight:700;line-height:1.45;margin-bottom:8px}.oge-backup-group-options{display:flex;flex-wrap:wrap;gap:7px 15px;color:#263b60}.oge-backup-group-option{white-space:nowrap}.oge-backup-exam-number{width:54px;text-align:center;font-weight:800;color:#17376d}.oge-backup-note{font-size:12px;color:#9db1da;margin-top:14px}.oge-backup-loading{padding:30px;text-align:center;color:#d9e4fb}
        .oge-backup-toolbar{position:absolute;right:15px;top:12px;display:flex;align-items:center;gap:8px;z-index:2}.oge-backup-close{position:static!important;border:1px solid rgba(227,191,91,.55)!important;border-radius:8px!important;width:40px;height:40px;line-height:34px;background:rgba(255,255,255,.03)!important;color:#e8c66a!important;font-size:28px!important;cursor:pointer}.oge-backup-print{border:1px solid rgba(227,191,91,.4);border-radius:9px;padding:9px 12px;background:rgba(255,255,255,.05);color:#e7efff;font:inherit;font-size:13px;cursor:pointer}.oge-backup-print:hover,.oge-backup-close:hover{background:rgba(255,255,255,.1)!important}
        .oge-backup-rubric-list{margin:0;padding-left:24px;display:grid;gap:7px}.oge-backup-answer-grid th,.oge-backup-answer-grid td{text-align:center}.oge-backup-answer-grid th:first-child,.oge-backup-answer-grid td:first-child{text-align:left;font-weight:700}.oge-backup-blank-cell{min-width:70px;height:34px}.oge-backup-short-answer td:first-child{width:60px;text-align:center;font-weight:800;color:#17376d}.oge-backup-short-answer td:last-child{width:42%;border-bottom:1px solid #7084a8}.oge-backup-listening-card{display:grid;grid-template-columns:48px 1fr;gap:12px;padding:13px 14px;border:1px solid #d4dcea;border-radius:11px;background:#f8fafc;margin:10px 0}.oge-backup-listening-card.is-current{border-color:#c99a32;box-shadow:0 0 0 1px rgba(201,154,50,.18)}.oge-backup-listening-number{font:800 18px/1.2 Georgia,serif;color:#17376d;text-align:center}.oge-backup-listening-prompt{font-weight:700;line-height:1.45;margin-bottom:8px}.oge-backup-listening-options{display:grid;gap:5px}.oge-backup-letter{white-space:pre-wrap;line-height:1.65}.oge-backup-answer-area{min-height:290px;padding:14px;border:1px solid #b8c4d7;border-radius:10px;background:#fff;outline:none;white-space:pre-wrap;line-height:1.65}.oge-backup-answer-area:empty::before{content:attr(data-placeholder);color:#8b98ad}.oge-backup-answer-hint{margin:0 0 10px;color:#50627f;font-size:13px}
        .oge-backup-admin-panel{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}.oge-backup-admin-actions{display:flex;gap:8px;flex-wrap:wrap}.oge-backup-admin-state{font-size:14px;color:#dce7ff;margin-top:5px}.oge-backup-admin-warn{font-size:11px;color:#9fb2d8;margin-top:5px;max-width:650px}
        @media(max-width:640px){.oge-backup-card{padding:20px 14px}.oge-backup-section{padding:14px}.oge-backup-title{font-size:26px}.oge-backup-print{padding:7px 9px;font-size:12px}.oge-backup-toolbar{right:10px;top:9px}.oge-backup-listening-card{grid-template-columns:38px 1fr}}
        @media print{
          @page{margin:12mm}
          html,body{background:#fff!important;color:#000!important;height:auto!important;overflow:visible!important}
          body>*:not(#ogeBackupViewer){display:none!important}
          #ogeBackupViewer{display:block!important;position:static!important;inset:auto!important;width:100%!important;max-width:none!important;max-height:none!important;height:auto!important;margin:0!important;padding:0!important;overflow:visible!important;border:0!important;border-radius:0!important;background:#fff!important;color:#000!important;box-shadow:none!important}
          #ogeBackupViewer::backdrop{display:none!important;background:transparent!important}
          .oge-backup-card{position:static!important;max-height:none!important;height:auto!important;overflow:visible!important;padding:0!important;background:#fff!important;color:#000!important}
          .oge-backup-toolbar,.oge-backup-close,.oge-backup-print{display:none!important}
          .oge-backup-kicker{color:#555!important}.oge-backup-title{color:#000!important;margin-right:0!important}.oge-backup-chip{color:#222!important;background:#fff!important;border-color:#bbb!important}
          .oge-backup-section{background:#fff!important;color:#000!important;border:1px solid #d7d7d7!important;border-radius:0!important;box-shadow:none!important;margin:10px 0!important;padding:10px 12px!important;break-inside:auto}
          .oge-backup-section h4{color:#000!important}.oge-backup-note{color:#555!important}.oge-backup-media img{max-height:none!important}.oge-backup-media audio{display:none!important}
          .oge-backup-table,.oge-backup-table td,.oge-backup-table th{border-color:#aaa!important;color:#000!important;background:#fff!important}.oge-backup-group-item,.oge-backup-listening-card{background:#fff!important;border-color:#bbb!important;box-shadow:none!important;break-inside:avoid}.oge-backup-group-number,.oge-backup-listening-number,.oge-backup-exam-number{color:#000!important}
          .oge-backup-answer-area{min-height:90mm;border:1px solid #aaa!important;border-radius:0!important;background:#fff!important;color:#000!important}.oge-backup-answer-area:empty::before{content:''}.oge-backup-answer-hint{color:#444!important}
          tr{break-inside:avoid}.oge-backup-title,.oge-backup-meta,.oge-backup-section h4{break-after:avoid}
        }
      `;
      document.head.appendChild(style);
    }
  }

  function ensureBackupAdminControls() {
    const preview = document.querySelector('#ogeBackupPreviewButton');
    const source = document.querySelector('#ogeBackupSourceButton');
    const readyButton = document.querySelector('#ogeBackupReadyButton');

    if (preview && preview.dataset.bound !== '1') {
      preview.dataset.bound = '1';
      preview.addEventListener('click', toggleBackupPreview);
    }
    if (source && source.dataset.bound !== '1') {
      source.dataset.bound = '1';
      source.addEventListener('click', toggleBackupGlobalSource);
    }
    if (readyButton && readyButton.dataset.bound !== '1') {
      readyButton.dataset.bound = '1';
      readyButton.addEventListener('click', toggleBackupReady);
    }
    renderBackupAdminState();
  }

  function renderBackupAdminState() {
    const state = document.querySelector('#ogeBackupAdminState');
    const preview = document.querySelector('#ogeBackupPreviewButton');
    const source = document.querySelector('#ogeBackupSourceButton');
    const readyButton = document.querySelector('#ogeBackupReadyButton');
    const ready = Boolean(backupRuntime?.yandex_backup_ready);
    const globalYandex = backupRuntime?.content_source === 'yandex_backup';

    if (state) {
      state.textContent = `Резерв: ${ready ? 'READY' : 'OFF'} · data v${backupRuntime?.backup_version || '—'} · viewer v${BACKUP_VIEWER_RENDER_VERSION} · по умолчанию: ${globalYandex ? 'Яндекс' : 'FIPI'}${backupPreviewEnabled ? ' · у вас PREVIEW' : ''}`;
    }
    if (preview) {
      preview.disabled = !ready;
      preview.textContent = backupPreviewEnabled ? 'PREVIEW: ON' : 'PREVIEW: OFF';
      preview.classList.toggle('active-state', backupPreviewEnabled);
    }
    if (readyButton) {
      readyButton.classList.toggle('hidden', usesFirebaseEmergencyAuth());
      readyButton.textContent = ready ? 'Резерв: ON' : 'Резерв: OFF';
      readyButton.classList.toggle('active-state', ready);
    }
    if (source) {
      source.classList.toggle('hidden', usesFirebaseEmergencyAuth());
      source.disabled = !ready;
      source.textContent = globalYandex ? 'По умолчанию: Яндекс' : 'По умолчанию: FIPI';
      source.classList.toggle('active-state', globalYandex);
    }
    updateSourceBadge();
  }

  async function toggleBackupPreview() {
    if (appMode !== 'admin' || !backupRuntime?.yandex_backup_ready) return;
    backupPreviewEnabled = !backupPreviewEnabled;
    if (backupPreviewEnabled) sessionStorage.setItem(BACKUP_PREVIEW_KEY, '1');
    else sessionStorage.removeItem(BACKUP_PREVIEW_KEY);
    renderBackupAdminState();
    render();
    showToast(backupPreviewEnabled ? '✓ Предпросмотр Яндекс-резерва включён только для вас' : '✓ Предпросмотр выключен');
  }

  async function toggleBackupGlobalSource() {
    if (appMode !== 'admin' || !supabaseClient) return;
    const next = backupRuntime?.content_source === 'yandex_backup' ? 'fipi' : 'yandex_backup';
    const text = next === 'yandex_backup'
      ? 'Сделать Яндекс-резерв источником ПО УМОЛЧАНИЮ? Пользователи с личным выбором сохранят свой источник.'
      : 'Сделать ФИПИ источником ПО УМОЛЧАНИЮ? Пользователи с личным выбором сохранят свой источник.';
    if (!window.confirm(text)) return;
    try {
      const { data, error } = await supabaseClient.rpc('oge_backup_admin_set_content_source', { p_source: next });
      if (error) throw error;
      backupRuntime.content_source = String(data || next);
      renderBackupAdminState();
      render();
      showToast(next === 'yandex_backup' ? '✓ По умолчанию: Яндекс-резерв' : '✓ По умолчанию: ФИПИ');
    } catch (error) {
      console.error('Backup source switch failed:', error);
      alert(`Не удалось изменить источник по умолчанию: ${error?.message || error}`);
    }
  }

  async function toggleBackupReady() {
    if (appMode !== 'admin' || !supabaseClient) return;
    const next = !Boolean(backupRuntime?.yandex_backup_ready);
    const text = next
      ? 'Включить Яндекс-резерв для FULL-пользователей?'
      : 'Выключить Яндекс-резерв? Все FULL-пользователи сразу будут открывать ФИПИ.';
    if (!window.confirm(text)) return;
    try {
      const { data, error } = await supabaseClient.rpc('oge_backup_admin_set_backup_ready_v099y3', { p_ready: next });
      if (error) throw error;
      backupRuntime.yandex_backup_ready = Boolean(data);
      if (!backupRuntime.yandex_backup_ready) backupRuntime.content_source = 'fipi';
      if (!backupRuntime.yandex_backup_ready && backupPreviewEnabled) {
        backupPreviewEnabled = false;
        sessionStorage.removeItem(BACKUP_PREVIEW_KEY);
      }
      renderBackupAdminState();
      render();
      showToast(next ? '✓ Яндекс-резерв доступен учителям' : '✓ Резерв выключен · используется ФИПИ');
    } catch (error) {
      console.error('Backup ready switch failed:', error);
      alert(`Не удалось изменить доступность резерва: ${error?.message || error}`);
    }
  }

  function backupTextClean(value) {
    return String(value ?? '')
      .replace(/\r/g, '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function backupTextCmp(value) {
    return backupTextClean(value).replace(/\s+/g, ' ').toLowerCase();
  }

  function backupInstructionClean(value) {
    return backupTextClean(value)
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/(\d)\s*[–—-]\s*(\d)/g, '$1–$2')
      .trim();
  }

  function detectBackupExamRange(value, groupCount) {
    const text = backupInstructionClean(value);
    const count = Number(groupCount || 0);
    if (!text || count < 2) return null;
    for (const match of text.matchAll(/(\d{1,2})\s*[–—-]\s*(\d{1,2})/g)) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      if (end >= start && (end - start + 1) === count) return { start, end };
    }
    return null;
  }

  function backupTableRows(tables) {
    const seen = new Set();
    const rows = [];
    const visit = value => {
      if (!Array.isArray(value)) return;
      if (value.length && value.every(cell => !Array.isArray(cell))) {
        const cells = value.map(cell => backupTextClean(cell)).filter(Boolean);
        if (!cells.length) return;
        const key = cells.map(backupTextCmp).join(' | ');
        if (!seen.has(key)) {
          seen.add(key);
          rows.push(cells);
        }
        return;
      }
      value.forEach(visit);
    };
    visit(tables);
    return rows;
  }

  function isGrammarSourceWord(value) {
    const s = backupTextClean(value);
    if (!s || s.length > 38 || /[.!?,;:]/.test(s)) return false;
    const letters = s.replace(/[^A-Za-zА-ЯЁ]/g, '');
    return letters.length > 0 && s === s.toUpperCase();
  }

  function grammarTableHtml(tables, range = null) {
    const rows = backupTableRows(tables);
    const pairs = [];
    const seen = new Set();

    for (const cells of rows) {
      if (cells.length !== 2) continue;
      const left = backupTextClean(cells[0]);
      const right = backupTextClean(cells[1]);
      if (left.length < 8 || !isGrammarSourceWord(right)) continue;
      const key = `${backupTextCmp(left)}|${backupTextCmp(right)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([left.replace(/\s+/g, ' '), right.replace(/\s+/g, ' ')]);
    }

    if (pairs.length < 2) return '';
    const numbered = range && (range.end - range.start + 1) === pairs.length;
    return `<table class="oge-backup-table oge-backup-grammar-table"><tbody>${pairs.map(([left,right], index) => `<tr>${numbered ? `<td class="oge-backup-exam-number">${range.start + index}</td>` : ''}<td>${escapeHtml(left)}</td><td class="oge-backup-source-word">${escapeHtml(right)}</td></tr>`).join('')}</tbody></table>`;
  }

  function choiceTableModel(tables) {
    const rows = backupTableRows(tables);
    const options = [];
    const optionSeen = new Set();

    for (const cells of rows) {
      if (cells.length < 2) continue;
      const c = cells.filter(Boolean);
      if (c.length < 2) continue;
      const number = c[c.length - 2];
      const value = c[c.length - 1];
      if (!/^\d+[.)]?$/u.test(number) || !value || value.length > 220) continue;
      const key = `${number}|${backupTextCmp(value)}`;
      if (optionSeen.has(key)) continue;
      optionSeen.add(key);
      options.push([number, value.replace(/\s+/g, ' ')]);
    }

    if (options.length < 2 || options.length > 8) return null;

    const optionValues = new Set(options.map(([,v]) => backupTextCmp(v)));
    let prompt = '';
    for (const cells of rows) {
      if (cells.length !== 1) continue;
      const candidate = backupTextClean(cells[0]).replace(/\s+/g, ' ');
      const cmp = backupTextCmp(candidate);
      if (candidate.length < 12 || candidate.length > 600) continue;
      if (optionValues.has(cmp)) continue;
      if (/^\d+[.)]?\s/u.test(candidate)) continue;
      if (/^(true|false|not stated)$/i.test(candidate)) continue;
      if (/\n\d+[.)]/.test(cells[0])) continue;
      prompt = candidate;
      break;
    }

    const promptRow = prompt ? `<tr><td colspan="2" class="oge-backup-question">${escapeHtml(prompt)}</td></tr>` : '';
    const optionRows = options.map(([n,v]) => `<tr><td class="oge-backup-option-number">${escapeHtml(n)}</td><td>${escapeHtml(v)}</td></tr>`).join('');
    return {
      prompt,
      options,
      html: `<table class="oge-backup-table oge-backup-choice-table"><tbody>${promptRow}${optionRows}</tbody></table>`
    };
  }

  function splitReadingGroupBody(bodyText, baseCondition) {
    let body = backupTextClean(bodyText);
    let condition = backupInstructionClean(baseCondition);
    if (!body) return { condition, passage: '' };

    const taskMarker = body.search(/(?:^|\n)Задание\s*№\s*\d+/iu);
    if (taskMarker >= 0) body = backupTextClean(body.slice(0, taskMarker));

    const instructionEnd = /соответствующую\s+выбранному\s+Вами\s+варианту\s+ответа\./iu;
    const match = instructionEnd.exec(body);
    if (match) {
      const instruction = body.slice(0, match.index + match[0].length);
      const passage = body.slice(match.index + match[0].length);
      const cleanInstruction = backupInstructionClean(instruction);
      if (cleanInstruction && !backupTextCmp(condition).includes(backupTextCmp(cleanInstruction))) {
        condition = backupInstructionClean(`${condition} ${cleanInstruction}`);
      }
      return { condition, passage: backupTextClean(passage) };
    }

    return { condition, passage: body };
  }

  function readingGroupHtml(groupItems, range, currentFipiId) {
    const items = (Array.isArray(groupItems) ? groupItems : [])
      .slice()
      .sort((a, b) => Number(a.local_position || 0) - Number(b.local_position || 0));

    const blocks = [];
    for (const item of items) {
      const choice = choiceTableModel(item.tables);
      if (!choice || !choice.prompt) continue;
      const local = Number(item.local_position || 0);
      const examNo = range && local > 0 ? range.start + local - 1 : local || '';
      const options = (choice.options || []).map(([n, value]) =>
        `<span class="oge-backup-group-option">${escapeHtml(n)} ${escapeHtml(value)}</span>`
      ).join('');
      blocks.push(`
        <article class="oge-backup-group-item${String(item.fipi_id || '').toUpperCase() === String(currentFipiId || '').toUpperCase() ? ' is-current' : ''}">
          <div class="oge-backup-group-number">${escapeHtml(examNo)}</div>
          <div>
            <div class="oge-backup-group-prompt">${escapeHtml(choice.prompt)}</div>
            <div class="oge-backup-group-options">${options}</div>
          </div>
        </article>`);
    }
    return blocks.length ? `<div class="oge-backup-group-list">${blocks.join('')}</div>` : '';
  }

  function normalizeNumberedLines(value) {
    return backupTextClean(value)
      .replace(/(^|\n)\s*(\d{1,2}[.)])\s*\n\s*(?=\S)/g, '$1$2 ')
      .replace(/(^|\n)\s*([A-FА-Е][.)])\s*\n\s*(?=\S)/g, '$1$2 ');
  }

  function backupGroupPosition(x) {
    const direct = Number(x?.group_position || 0);
    if (direct > 0) return direct;
    const current = String(x?.fipi_id || '').toUpperCase();
    const row = (Array.isArray(x?.group_items) ? x.group_items : [])
      .find(item => String(item?.fipi_id || '').toUpperCase() === current);
    return Number(row?.local_position || 0);
  }

  function parseTaskBlocks(value) {
    const text = backupTextClean(value);
    const re = /(?:^|\n)Задание\s*№\s*(\d+)\.\s*([^\n]*)/giu;
    const matches = [...text.matchAll(re)];
    return matches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
      return {
        number: Number(match[1]),
        heading: backupInstructionClean(match[2] || ''),
        body: backupTextClean(text.slice(start, end)),
        markerIndex: match.index
      };
    });
  }

  function parseChoiceTextBlock(body) {
    const text = backupTextClean(body);
    const re = /(?:^|\n)\s*(\d+)[.)]\s*(?:\n\s*)?/g;
    const matches = [...text.matchAll(re)];
    if (matches.length < 2) return null;
    const prompt = backupTextClean(text.slice(0, matches[0].index));
    const options = matches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
      return [match[1], backupInstructionClean(text.slice(start, end))];
    }).filter(([,value]) => value);
    return prompt && options.length >= 2 ? { prompt: backupInstructionClean(prompt), options } : null;
  }

  function listeningChoiceGroupHtml(blocks, currentNo) {
    const cards = [];
    for (const block of blocks.filter(block => block.number >= 1 && block.number <= 4)) {
      const parsed = parseChoiceTextBlock(block.body);
      if (!parsed) continue;
      cards.push(`<article class="oge-backup-listening-card${block.number === currentNo ? ' is-current' : ''}">
        <div class="oge-backup-listening-number">${block.number}</div>
        <div><div class="oge-backup-listening-prompt">${escapeHtml(parsed.prompt)}</div>
        <div class="oge-backup-listening-options">${parsed.options.map(([n,v]) => `<div><b>${escapeHtml(n)})</b> ${escapeHtml(v)}</div>`).join('')}</div></div>
      </article>`);
    }
    return cards.join('');
  }

  function listeningTask5Model(fullText, blocks) {
    const block = blocks.find(item => item.number === 5);
    if (!block) return null;
    let body = block.body;
    const nextIntro = body.search(/(?:Вы помогаете|Прослушайте аудиозапись интервью)/iu);
    if (nextIntro >= 0) body = backupTextClean(body.slice(0, nextIntro));
    const numbered = [...body.matchAll(/(?:^|\n)\s*([1-6])\.\s*(?:\n\s*)?([^\n]+)/g)];
    const rubrics = numbered.map(match => [Number(match[1]), backupInstructionClean(match[2])]).filter(([,v]) => v);
    const firstRubric = numbered.length ? numbered[0].index : -1;
    const gridMarker = body.search(/(?:^|\n)Запишите\s+в\s+таблицу/iu);
    const instructionEnd = firstRubric >= 0 ? firstRubric : (gridMarker >= 0 ? gridMarker : body.length);
    const instruction = backupInstructionClean(body.slice(0, instructionEnd));
    if (rubrics.length < 4) return null;
    const html = `<div><ol class="oge-backup-rubric-list">${rubrics.map(([,v]) => `<li>${escapeHtml(v)}</li>`).join('')}</ol>
      <table class="oge-backup-table oge-backup-answer-grid"><thead><tr><th>Говорящий</th>${['A','B','C','D','E'].map(x => `<th>${x}</th>`).join('')}</tr></thead>
      <tbody><tr><td>Рубрика</td>${['A','B','C','D','E'].map(() => '<td class="oge-backup-blank-cell"></td>').join('')}</tr></tbody></table></div>`;
    return { instruction, html };
  }

  function listeningShortAnswerModel(fullText, blocks, currentNo) {
    const rows = blocks.filter(block => block.number >= 6).map(block => {
      const prompt = backupInstructionClean(block.body.replace(/_+/g, ' '));
      return { number: block.number, prompt };
    }).filter(row => row.prompt);
    if (!rows.length) return null;
    const firstTask = blocks.find(block => block.number === 6);
    const task5 = blocks.find(block => block.number === 5);
    let intro = '';
    if (task5 && firstTask) {
      const tail = task5.body;
      const idx = tail.search(/(?:Вы помогаете|Прослушайте аудиозапись интервью)/iu);
      if (idx >= 0) intro = backupInstructionClean(tail.slice(idx));
    }
    if (!intro) {
      const marker = fullText.search(/(?:Вы помогаете своему другу|Прослушайте аудиозапись интервью)/iu);
      if (marker >= 0) {
        const cut = fullText.search(/(?:^|\n)Задание\s*№\s*6\./imu);
        intro = backupInstructionClean(fullText.slice(marker, cut > marker ? cut : fullText.length));
      }
    }
    const minNo = Math.min(...rows.map(r => r.number));
    const maxNo = Math.max(...rows.map(r => r.number));
    const html = `<table class="oge-backup-table oge-backup-short-answer"><tbody>${rows.map(row => `<tr${row.number === currentNo ? ' class="is-current"' : ''}><td>${row.number}</td><td>${escapeHtml(row.prompt)}</td><td></td></tr>`).join('')}</tbody></table>`;
    return { instruction: intro, html, minNo, maxNo };
  }

  function cleanReadingMatchingText(value) {
    let text = normalizeNumberedLines(value);
    const marker = /Запишите\s+в\s+таблицу\s+выбранные\s+цифры\s+под\s+соответствующими\s+буквами\./iu;
    const match = marker.exec(text);
    if (match) text = backupTextClean(text.slice(0, match.index + match[0].length));
    return text;
  }

  function readingMatchingQuestionsHtml(value) {
    const text = normalizeNumberedLines(value);
    const aIndex = text.search(/(?:^|\n)A[.)]\s+/imu);
    const questionPart = aIndex >= 0 ? text.slice(0, aIndex) : text;
    const rows = [...questionPart.matchAll(/(?:^|\n)\s*([1-7])[.)]\s+([^\n]+)/g)]
      .map(match => [Number(match[1]), backupInstructionClean(match[2])])
      .filter(([,q]) => q && q.length > 8);
    if (rows.length < 4) return '';
    return `<table class="oge-backup-table"><tbody>${rows.map(([n,q]) => `<tr><td class="oge-backup-exam-number">${n}</td><td>${escapeHtml(q)}</td><td class="oge-backup-blank-cell"></td></tr>`).join('')}</tbody></table>`;
  }

  function splitWritingTask(value) {
    const text = backupTextClean(value);
    const letterStart = text.search(/You have received an email message from/iu);
    if (letterStart < 0) return null;
    const writeStart = text.slice(letterStart).search(/(?:^|\n)Write a message to /imu);
    const absoluteWrite = writeStart >= 0 ? letterStart + writeStart : -1;
    const before = backupTextClean(text.slice(0, letterStart));
    const letter = backupTextClean(text.slice(letterStart, absoluteWrite >= 0 ? absoluteWrite : text.length));
    const after = absoluteWrite >= 0 ? backupTextClean(text.slice(absoluteWrite)) : '';
    return { instruction: backupTextClean([before, after].filter(Boolean).join('\n\n')), letter };
  }

  function splitSpeakingTask1(value) {
    const text = backupTextClean(value);
    const match = text.match(/^(Task\s*1\..*?not\s+have\s+more\s+than\s+2\s+minutes\s+for\s+reading\s+aloud\.)\s*/isu);
    if (!match) return null;
    return {
      instruction: backupInstructionClean(match[1]),
      passage: backupTextClean(text.slice(match[0].length))
    };
  }

  function stripReadingTailCoveredByTable(bodyText, prompt) {
    let body = backupTextClean(bodyText);
    const p = backupTextClean(prompt);
    if (!body || !p) return body;

    let idx = body.indexOf(p);
    if (idx < 0) {
      const flatBody = body.replace(/\s+/g, ' ');
      const flatPrompt = p.replace(/\s+/g, ' ');
      const flatIdx = flatBody.indexOf(flatPrompt);
      if (flatIdx < 0) return body;
      // Do not cut on an approximate index because whitespace collapsing changes
      // offsets. Exact match is the safe path; otherwise keep the body intact.
      return body;
    }

    let cut = idx;
    const before = body.slice(0, idx);
    const taskMatches = [...before.matchAll(/(?:^|\n)Задание\s*№\s*\d+[^\n]*$/gimu)];
    if (taskMatches.length) {
      const last = taskMatches[taskMatches.length - 1];
      if (idx - last.index < 260) cut = last.index;
    }
    return backupTextClean(body.slice(0, cut));
  }

  function compactTableHtml(tables, bodyText) {
    const rows = backupTableRows(tables);
    if (!rows.length) return '';
    const bodyNorm = backupTextCmp(bodyText);
    const filtered = [];

    for (const cells of rows) {
      const key = cells.join(' | ');
      const norm = backupTextCmp(key);
      if (norm.length > 1200) continue;
      if (norm.length > 80 && bodyNorm.includes(norm)) continue;
      filtered.push(cells);
    }

    if (!filtered.length || filtered.length > 36) return '';
    return `<table class="oge-backup-table"><tbody>${filtered.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function prepareBackupViewerContent(x) {
    let condition = backupTextClean(x.condition_text);
    let conditionTitle = 'Условие';
    const kes = String(x.kes || '').trim();
    const groupItems = Array.isArray(x.group_items) ? x.group_items : [];
    const groupCount = groupItems.length || Number(x.group_count || 0);
    const sections = [];
    let showAnswerArea = false;
    let answerTitle = 'Ваш ответ';

    let text = [x.text, x.item_extra]
      .map(backupTextClean)
      .filter(Boolean)
      .filter((value, index, arr) => !arr.some((other, otherIndex) => otherIndex < index && backupTextCmp(other).includes(backupTextCmp(value))))
      .join('\n\n');

    const speakingTask = Number((text.match(/^Task\s*([123])\./iu) || [])[1] || 0);
    const isListening = /^1\.2\./.test(kes);
    const isReadingMatching = /^1\.3\.1(?:\.|$)/.test(kes);
    const isReadingGroup = /^1\.3\.2(?:\.|$)/.test(kes);
    const isReading = /^1\.3\./.test(kes);
    const isGrammarLexis = /^2\./.test(kes) && speakingTask === 0;
    const isWriting = /^1\.4\.3(?:\.|$)/.test(kes);

    const range = detectBackupExamRange([condition, text].filter(Boolean).join('\n'), groupCount);
    let tableHtml = '';
    let tableTitle = 'Варианты / таблица';

    if (isListening) {
      const fullText = backupTextClean([x.condition_text, x.text].filter(Boolean).join('\n'));
      const blocks = parseTaskBlocks(fullText);
      const currentNo = backupGroupPosition(x);
      if (currentNo >= 1 && currentNo <= 4) {
        const first = blocks.find(block => block.number === 1);
        condition = backupInstructionClean(first ? fullText.slice(0, first.markerIndex) : x.condition_text);
        tableHtml = listeningChoiceGroupHtml(blocks, currentNo);
        tableTitle = 'Задания 1–4';
        text = '';
      } else if (currentNo === 5 || /^1\.2\.1(?:\.|$)/.test(kes)) {
        const model = listeningTask5Model(fullText, blocks);
        if (model) {
          condition = model.instruction;
          tableHtml = model.html;
          tableTitle = 'Рубрики и таблица ответа';
          text = '';
        }
      } else if (currentNo >= 6) {
        const model = listeningShortAnswerModel(fullText, blocks, currentNo);
        if (model) {
          condition = model.instruction || 'Прослушайте аудиозапись и впишите ответы.';
          tableHtml = model.html;
          tableTitle = `Задания ${model.minNo}–${model.maxNo}`;
          text = '';
        }
      }
      if (text) {
        condition = backupInstructionClean(condition);
        tableHtml = compactTableHtml(x.tables, text);
      }
    } else if (isGrammarLexis) {
      const taskMarker = text.search(/(?:^|\n)Задание\s*№\s*\d+/iu);
      if (taskMarker > 0) {
        const instructionTail = backupInstructionClean(text.slice(0, taskMarker));
        if (instructionTail && instructionTail.length < 1500 && !backupTextCmp(condition).includes(backupTextCmp(instructionTail))) {
          condition = backupInstructionClean(`${condition} ${instructionTail}`);
        } else condition = backupInstructionClean(condition);
      } else condition = backupInstructionClean(condition);
      tableHtml = grammarTableHtml(x.tables, range) || compactTableHtml(x.tables, '');
      if (tableHtml) {
        text = '';
        if (range) tableTitle = `Задания ${range.start}–${range.end}`;
      }
    } else if (isReadingGroup && groupItems.length > 1) {
      const split = splitReadingGroupBody(text, condition);
      condition = split.condition;
      text = split.passage;
      tableHtml = readingGroupHtml(groupItems, range, x.fipi_id);
      if (tableHtml) tableTitle = range ? `Задания ${range.start}–${range.end}` : 'Задания группы';
      else {
        const choice = choiceTableModel(x.tables);
        if (choice) {
          text = stripReadingTailCoveredByTable(text, choice.prompt);
          tableHtml = choice.html;
        } else tableHtml = compactTableHtml(x.tables, text);
      }
    } else if (isReadingMatching) {
      condition = backupInstructionClean(condition);
      text = cleanReadingMatchingText(text);
      tableHtml = readingMatchingQuestionsHtml(text) || compactTableHtml(x.tables, text);
      tableTitle = 'Вопросы / таблица';
    } else if (isReading) {
      condition = backupInstructionClean(condition);
      const choice = choiceTableModel(x.tables);
      if (choice) {
        text = stripReadingTailCoveredByTable(text, choice.prompt);
        tableHtml = choice.html;
      } else tableHtml = compactTableHtml(x.tables, text);
    } else if (isWriting) {
      const writing = splitWritingTask(text);
      if (writing) {
        conditionTitle = 'Инструкция';
        condition = writing.instruction || backupTextClean(condition);
        sections.push({ title: 'Письмо', text: writing.letter, className: 'oge-backup-letter' });
        text = '';
        tableHtml = '';
        showAnswerArea = true;
        answerTitle = 'Ваш ответ (100–120 слов)';
      } else {
        condition = backupInstructionClean(condition);
        tableHtml = compactTableHtml(x.tables, text);
      }
    } else {
      if (speakingTask === 1) {
        const speaking = splitSpeakingTask1(text);
        if (speaking) {
          conditionTitle = 'Инструкция';
          condition = speaking.instruction;
          sections.push({ title: 'Текст для чтения', text: speaking.passage });
          text = '';
          tableHtml = '';
        }
      } else if (speakingTask === 3) {
        condition = backupInstructionClean(condition);
        tableHtml = '';
      } else {
        condition = backupInstructionClean(condition);
        tableHtml = compactTableHtml(x.tables, text);
      }
    }

    return {
      condition,
      conditionTitle,
      text: backupTextClean(text),
      tableHtml,
      tableTitle,
      range,
      sections,
      showAnswerArea,
      answerTitle
    };
  }

  async function currentAccessToken() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    const token = data?.session?.access_token || '';
    if (!token) throw new Error('Нет активной email-сессии Supabase.');
    return token;
  }

  async function currentBackupAccess() {
    if (usesFirebaseEmergencyAuth()) return { kind: 'firebase' };
    if (appMode === 'donut') {
      const token = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}session`) || '';
      if (!token) throw new Error('Сессия VK Donut завершена. Войдите через VK снова.');
      return { kind: 'donut', token };
    }
    return { kind: 'email', token: await currentAccessToken() };
  }

  function backupGatewayHeaders(access) {
    if (typeof access === 'string') return { Authorization: `Bearer ${access}` };
    if (access?.kind === 'donut') return { 'X-OGE-Donut-Session': access.token };
    if (access?.token) return { Authorization: `Bearer ${access.token}` };
    return {};
  }

  async function fetchBackupItemPayload(fipiId, access) {
    if (access?.kind === 'firebase') {
      return window.OGE_FIREBASE_AUTH.requestBackupItem(fipiId);
    }
    // VK Donut does not have a Supabase Auth JWT, so its protected backup item
    // is resolved server-side by oge-backup-gateway using X-OGE-Donut-Session.
    if (access?.kind === 'donut') {
      const response = await fetch(`${BACKUP_GATEWAY_URL}?fipi_id=${encodeURIComponent(fipiId)}`, {
        headers: backupGatewayHeaders(access)
      });
      const raw = await response.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}
      if (!response.ok || !data) throw new Error(`${response.status} ${data?.error || raw || 'Backup item unavailable'}`);
      return data;
    }

    // ADMIN / email FULL keep the proven enriched RPC path. It returns the
    // complete structured OGE card (KES, text, variants/tables, media metadata).
    const { data, error } = await supabaseClient.rpc('oge_backup_get_item_v3', { p_fipi_id: fipiId });
    if (error) throw error;
    return data || {};
  }

  async function fetchLegacyBackupMediaBlob(mediaId, access) {
    const response = await fetch(`${BACKUP_GATEWAY_URL}?media_id=${encodeURIComponent(mediaId)}`, {
      headers: backupGatewayHeaders(access)
    });
    if (!response.ok) throw new Error(`legacy media ${mediaId}: HTTP ${response.status}`);
    return response.blob();
  }

  function validateSignedMediaUrl(value) {
    try {
      const u = new URL(String(value || ''));
      if (u.protocol !== 'https:' || u.hostname !== 'storage.yandexcloud.net') return false;
      const expectedPrefix = '/navigator-fipi-protected-data-dreamteam/oge/media/';
      return u.pathname.startsWith(expectedPrefix);
    } catch {
      return false;
    }
  }

  async function fetchObjectStorageMedia(mediaId, access) {
    if (access?.kind === 'firebase') {
      const signed = await window.OGE_FIREBASE_AUTH.requestBackupMedia(mediaId);
      return {
        url: signed.url,
        direct: true,
        expiresAt: signed.expires_at || '',
        objectKey: signed.object_key || ''
      };
    }
    // The historical hidden Donut session is not a Supabase Auth JWT.
    // Keep it on the proven legacy gateway. Current VK-ID/email FULL logins
    // use Supabase Auth and therefore take the direct Object Storage route.
    if (access?.kind === 'donut') {
      throw new Error('legacy donut media session');
    }

    const headers = backupGatewayHeaders(access);
    if (!headers.Authorization) throw new Error('Supabase media session missing');

    const response = await fetch(
      `${MEDIA_DELIVERY_FUNCTION_URL}?media_id=${encodeURIComponent(mediaId)}`,
      { headers }
    );

    const raw = await response.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch {}

    if (!response.ok || !data?.url) {
      throw new Error(`object media ${mediaId}: HTTP ${response.status} ${data?.error || raw || 'signed URL unavailable'}`);
    }
    if (!validateSignedMediaUrl(data.url)) {
      throw new Error(`object media ${mediaId}: unexpected signed URL`);
    }

    return {
      url: data.url,
      direct: true,
      expiresAt: data.expires_at || '',
      objectKey: data.object_key || ''
    };
  }

  async function resolveBackupMediaSource(mediaId, access) {
    try {
      const direct = await fetchObjectStorageMedia(mediaId, access);
      console.info(`OGE media ${mediaId}: Object Storage direct`);
      return direct;
    } catch (error) {
      console.warn(`OGE media ${mediaId}: Object Storage unavailable; legacy Yandex.Disk fallback`, error);
      const blob = await fetchLegacyBackupMediaBlob(mediaId, access);
      const url = URL.createObjectURL(blob);
      backupObjectUrls.push(url);
      return { url, direct: false, expiresAt: '', objectKey: '' };
    }
  }

  async function renderBackupMedia(container, media, token) {
    const images = (media || []).filter(m => m.kind === 'image');
    const audio = (media || []).filter(m => m.kind === 'audio');
    const other = (media || []).filter(m => !['image','audio'].includes(m.kind));

    if (images.length) {
      const section = document.createElement('section');
      section.className = 'oge-backup-section';
      section.innerHTML = '<h4>Картинка</h4><div class="oge-backup-media"></div>';
      container.appendChild(section);
      const box = section.querySelector('.oge-backup-media');
      for (const m of images) {
        try {
          const source = await resolveBackupMediaSource(m.media_id, token);
          const img = document.createElement('img');
          img.src = source.url;
          img.alt = `Изображение задания ${m.media_id}`;
          img.dataset.delivery = source.direct ? 'object-storage' : 'legacy-disk';
          box.appendChild(img);
        } catch (error) {
          box.insertAdjacentHTML('beforeend', `<div class="oge-backup-note">Не удалось открыть изображение: ${escapeHtml(error?.message || error)}</div>`);
        }
      }
    }

    if (audio.length) {
      const section = document.createElement('section');
      section.className = 'oge-backup-section';
      section.innerHTML = '<h4>▶ Аудио</h4><div class="oge-backup-media"></div>';
      container.appendChild(section);
      const box = section.querySelector('.oge-backup-media');
      for (const m of audio) {
        try {
          const source = await resolveBackupMediaSource(m.media_id, token);
          const player = document.createElement('audio');
          player.controls = true;
          player.preload = 'metadata';
          player.src = source.url;
          player.dataset.delivery = source.direct ? 'object-storage' : 'legacy-disk';
          if (source.expiresAt) player.dataset.signedUrlExpiresAt = source.expiresAt;
          box.appendChild(player);
        } catch (error) {
          box.insertAdjacentHTML('beforeend', `<div class="oge-backup-note">Не удалось открыть аудио: ${escapeHtml(error?.message || error)}</div>`);
        }
      }
    }

    if (other.length) {
      container.insertAdjacentHTML('beforeend', `<div class="oge-backup-note">Дополнительных media: ${other.length}</div>`);
    }
  }

  async function openBackupTask(fipiId) {
    ensureBackupViewerUi();
    const dialog = document.querySelector('#ogeBackupViewer');
    const body = document.querySelector('#ogeBackupViewerBody');
    revokeBackupObjectUrls();
    body.innerHTML = '<div class="oge-backup-loading">Открываю Яндекс-резерв…</div>';
    if (typeof dialog.showModal === 'function') dialog.showModal();

    try {
      const token = await currentBackupAccess();
      const x = await fetchBackupItemPayload(fipiId, token);
      body.innerHTML = `
        <span class="oge-backup-kicker">OGE · ЯНДЕКС-РЕЗЕРВ</span>
        <h2 class="oge-backup-title">Задание ${escapeHtml(x.fipi_id || fipiId)}</h2>
        <div class="oge-backup-meta">
          <span class="oge-backup-chip">КЭС ${escapeHtml(x.kes || '—')}</span>
          ${x.answer_type ? `<span class="oge-backup-chip">${escapeHtml(x.answer_type)}</span>` : ''}
          <span class="oge-backup-chip">data v${escapeHtml(x.clean_version || backupRuntime?.backup_version || '0.2')}</span>
          <span class="oge-backup-chip">viewer v${BACKUP_VIEWER_RENDER_VERSION}</span>
        </div>`;

      const prepared = prepareBackupViewerContent(x);
      if (prepared.condition) {
        body.insertAdjacentHTML('beforeend', `<section class="oge-backup-section"><h4>${escapeHtml(prepared.conditionTitle || 'Условие')}</h4><div class="oge-backup-text">${escapeHtml(prepared.condition)}</div></section>`);
      }

      // Core order stays: instruction/condition -> image -> audio -> task content.
      await renderBackupMedia(body, x.media || [], token);

      for (const section of prepared.sections || []) {
        const cls = section.className ? ` ${escapeAttr(section.className)}` : '';
        const inner = section.html || `<div class="oge-backup-text${cls}">${escapeHtml(section.text || '')}</div>`;
        body.insertAdjacentHTML('beforeend', `<section class="oge-backup-section"><h4>${escapeHtml(section.title || 'Материал')}</h4>${inner}</section>`);
      }

      if (prepared.text) {
        body.insertAdjacentHTML('beforeend', `<section class="oge-backup-section"><h4>Текст</h4><div class="oge-backup-text">${escapeHtml(prepared.text)}</div></section>`);
      }

      if (prepared.tableHtml) {
        body.insertAdjacentHTML('beforeend', `<section class="oge-backup-section"><h4>${escapeHtml(prepared.tableTitle || 'Варианты / таблица')}</h4>${prepared.tableHtml}</section>`);
      }

      if (prepared.showAnswerArea) {
        body.insertAdjacentHTML('beforeend', `<section class="oge-backup-section"><h4>${escapeHtml(prepared.answerTitle || 'Ваш ответ')}</h4><p class="oge-backup-answer-hint">Поле можно заполнить на экране или оставить пустым для распечатки.</p><div class="oge-backup-answer-area" contenteditable="true" spellcheck="true" data-placeholder="Напишите ответ здесь…"></div></section>`);
      }

      body.insertAdjacentHTML('beforeend', `<div class="oge-backup-note">Резервная копия открытого банка ФИПИ · ${escapeHtml(x.parse_status || '')}${x.official_fipi_url ? ' · оригинал ФИПИ сохранён в карточке' : ''}</div>`);
    } catch (error) {
      console.error('OGE backup viewer failed:', error);
      body.innerHTML = `<div class="oge-backup-loading">Не удалось открыть резерв: ${escapeHtml(error?.message || error)}</div>`;
    }
  }

  function taskCard(task) {
    const key = taskKey(task);
    const status = getStatus(key);

    const topicNames = task.tags.slice(0, 3).map(tag => {
      const topic = DATA.topics.find(t => t.id === tag.topic);
      const label = topic ? topic.name : tag.topic;
      const detail = tag.subtopic ? ` · ${tag.subtopic}` : '';
      const manual = tag.source === 'manual_admin' ? 'Ручная разметка администратора' : '';
      const confidence = tag.confidence ? `Уверенность: ${Math.round(tag.confidence * 100)}%` : '';
      return `<span class="oge-topic-tag${manual ? ' manual-tag' : ''}" title="${escapeAttr([`${label}${detail}`, manual, confidence].filter(Boolean).join(' · '))}">${escapeHtml(label)}${escapeHtml(detail)}</span>`;
    }).join('');

    const noTopic = !topicNames
      ? '<span class="oge-topic-tag muted-tag" title="Без тематической метки">Без тематической метки</span>'
      : '';

    const kes = task.liveKesCode ? `КЭС ${task.liveKesCode}` : 'КЭС —';

    const editButton = appMode === 'admin' && !usesFirebaseEmergencyAuth()
      ? `<button class="oge-topic-edit-button" type="button" data-edit-topic="${escapeAttr(key)}" title="Изменить темы и подтемы">✎</button>`
      : '';

    const manualMarker = task._override
      ? `<span class="oge-manual-marker" title="Есть ручная тематическая правка">ручная</span>`
      : '';

    return `<article
      class="oge-task-card status-${escapeAttr(status)}${task._override ? ' has-manual-override' : ''}"
      tabindex="0"
      role="link"
      data-open-task="${escapeAttr(key)}"
      data-task-url="${escapeAttr(task.url)}"
      aria-label="Открыть задание ФИПИ ${escapeAttr(task.fipiId)}">
        <div class="oge-card-top">
          <span class="oge-fipi-ref">FIPI ${escapeHtml(task.fipiId)}</span>
          <div class="oge-card-top-actions">
            ${manualMarker}
            ${editButton}
          </div>
        </div>

        <div class="oge-kes-line">${escapeHtml(kes)}</div>

        <div class="oge-topic-tags">
          ${topicNames}${noTopic}
        </div>

        <div class="oge-card-footer">
          <button
            class="oge-status-button"
            type="button"
            data-task="${escapeAttr(key)}"
            data-status="${escapeAttr(status)}"
            title="Статус: ${escapeAttr(statusLabel(status))}. Нажмите, чтобы переключить.">
            ${status === 'used' ? '★ Использовано' : status === 'viewed' ? '◉ Просмотрено' : '○ Новое'}
          </button>
          <span class="oge-open-hint">${backupIsActiveForCards() ? 'ОТКРЫТЬ · ЯНДЕКС' : 'ОТКРЫТЬ ↗'}</span>
        </div>
      </article>`;
  }

  function updateStats(visibleTasks) {
    el.visibleCount.textContent = visibleTasks.length;
    el.viewedCount.textContent = visibleTasks.filter(t => getStatus(taskKey(t)) === 'viewed').length;
    el.usedCount.textContent = visibleTasks.filter(t => getStatus(taskKey(t)) === 'used').length;
  }

  function updateSelection(visibleTasks = []) {
    const topic = DATA.topics.find(t => t.id === el.topic.value);
    const topicName = topic?.name || 'Все темы';
    const subtopic = el.subtopic.value;
    const bucket = DATA.buckets.find(b => b.id === (el.bucket?.value || 'all'));
    const status = el.status.value || 'all';
    const search = el.search.value.trim();

    const parts = [
      subtopic === 'all' ? topicName : `${topicName} → ${subtopic}`
    ];
    if (bucket) parts.push(`${bucket.title}${bucket.range ? ` · ${bucket.range}` : ''}`);
    if (status !== 'all') parts.push(statusLabel(status));
    if (search) parts.push(`«${search}»`);

    if (el.selectionTitle) el.selectionTitle.textContent = parts.join(' · ');
    if (el.sectionMeta) {
      el.sectionMeta.textContent = `${visibleTasks.length} карточек · ${visibleBuckets().length} ${visibleBuckets().length === 1 ? 'раздел' : 'разделов'}`;
    }
  }

  function render() {
    if (appMode === 'gate' || appMode === 'pending' || appMode === 'blocked') return;

    const oldLeft = el.matrixViewport?.scrollLeft || 0;
    const oldTop = el.matrixViewport?.scrollTop || 0;

    const visibleTasks = filterTasks();
    const bucketsToShow = visibleBuckets();
    const byBucket = Object.fromEntries(bucketsToShow.map(b => [b.id, []]));

    for (const task of visibleTasks) {
      if (byBucket[task.bucket]) byBucket[task.bucket].push(task);
    }

    el.matrix.style.setProperty('--oge-matrix-cols', String(Math.max(1, bucketsToShow.length)));

    el.matrix.innerHTML = bucketsToShow.map(bucket => {
      const cards = byBucket[bucket.id] || [];
      return `<section class="oge-bucket">
        <header class="oge-bucket-head">
          <span class="oge-bucket-section">${escapeHtml(bucket.section)}</span>
          <h3>${escapeHtml(bucket.title)}</h3>
          <div class="oge-bucket-bottom">
            <span class="oge-bucket-range">${escapeHtml(bucket.range || '')}</span>
            <span class="oge-bucket-count">${cards.length} ${cards.length === 1 ? 'карточка' : 'карточек'}</span>
          </div>
        </header>

        <div class="oge-card-stack">
          ${cards.length
            ? cards.map(taskCard).join('')
            : '<div class="oge-bucket-empty">По текущему фильтру заданий нет</div>'}
        </div>
      </section>`;
    }).join('');

    el.empty.classList.toggle('hidden', visibleTasks.length !== 0);
    updateStats(visibleTasks);
    updateSelection(visibleTasks);

    document.querySelectorAll('.oge-status-button').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        setStatus(button.dataset.task, nextStatus(button.dataset.status));
      });
    });

    document.querySelectorAll('[data-edit-topic]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        openTopicEditor(button.dataset.editTopic);
      });
    });

    document.querySelectorAll('[data-open-task]').forEach(card => {
      const openTask = () => {
        const taskId = card.dataset.openTask;
        if (backupIsActiveForCards() && taskId) {
          void openBackupTask(taskId);
          return;
        }
        const url = card.dataset.taskUrl;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      };

      card.addEventListener('click', event => {
        if (event.target.closest('button')) return;
        openTask();
      });

      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target.closest('button')) return;
        event.preventDefault();
        openTask();
      });
    });

    if (el.matrixViewport) {
      el.matrixViewport.scrollLeft = oldLeft;
      el.matrixViewport.scrollTop = oldTop;
    }
  }

  function resetFilters(doRender = true) {
    if (el.topic.options.length) el.topic.value = 'all';
    populateSubtopics();
    el.subtopic.value = 'all';
    if (el.bucket) el.bucket.value = 'all';
    el.status.value = 'all';
    el.search.value = '';
    if (doRender) render();
  }

  async function setStatus(taskId, status) {
    const localTime = new Date().toISOString();
    records[taskId] = { status, updatedAt: localTime };
    saveActiveRecords();
    render();

    if (!supabaseClient || !currentUser || !isAuthenticatedWorkspaceMode()) return;

    setBadge('syncing', 'SYNCING…', 'Сохраняю изменение');
    const { data, error } = await supabaseClient
      .from('teacher_task_status')
      .upsert({ user_id: currentUser.id, task_id: taskId, status }, { onConflict: 'user_id,task_id' })
      .select('task_id,status,updated_at')
      .single();

    if (error) {
      const pending = loadPending(currentUser.id);
      pending[taskId] = { status, updatedAt: localTime };
      savePending(currentUser.id, pending);
      setBadge('warning', 'SYNC PENDING', 'Изменение сохранено локально и будет отправлено позже');
      console.error('Status save failed:', error);
      return;
    }

    records[taskId] = { status: data.status, updatedAt: data.updated_at };
    saveActiveRecords();
    const pending = loadPending(currentUser.id);
    delete pending[taskId];
    savePending(currentUser.id, pending);
    setSecureBadge();
  }

  async function flushPending() {
    if (!supabaseClient || !currentUser) return true;
    const pending = loadPending(currentUser.id);
    const entries = Object.entries(pending);
    if (!entries.length) return true;

    for (const [taskId, row] of entries) {
      const { error } = await supabaseClient
        .from('teacher_task_status')
        .upsert({ user_id: currentUser.id, task_id: taskId, status: row.status }, { onConflict: 'user_id,task_id' });
      if (error) return false;
      delete pending[taskId];
    }
    savePending(currentUser.id, pending);
    return true;
  }

  async function fetchCloudRows() {
    const rows = [];
    for (let from = 0; ; from += CATALOG_PAGE_SIZE) {
      const to = from + CATALOG_PAGE_SIZE - 1;
      const { data, error } = await supabaseClient
        .from('teacher_task_status')
        .select('task_id,status,updated_at')
        .eq('user_id', currentUser.id)
        .order('task_id', { ascending: true })
        .range(from, to);
      if (error) throw error;
      const page = data || [];
      rows.push(...page);
      if (page.length < CATALOG_PAGE_SIZE) break;
    }
    return rows;
  }

  async function loadCloudStatuses() {
    if (!supabaseClient || !currentUser || refreshInFlight) return;
    refreshInFlight = true;
    try {
      const pendingFlushed = await flushPending();
      const cloudRows = await fetchCloudRows();
      const cloudRecords = Object.fromEntries(cloudRows.map(row => [row.task_id, { status: row.status, updatedAt: row.updated_at }]));
      if (pendingFlushed) records = cloudRecords;
      else records = { ...cloudRecords, ...loadCloudCache(currentUser.id), ...loadPending(currentUser.id) };
      saveActiveRecords();
      render();
      setSecureBadge();
    } catch (error) {
      console.error('Cloud status load failed:', error);
      records = loadCloudCache(currentUser.id);
      render();
      setBadge('warning', 'OFFLINE CACHE', 'Не удалось загрузить статусы; показана локальная копия');
    } finally {
      refreshInFlight = false;
    }
  }

  async function fetchCatalogPage(pageIndex) {
    const from = pageIndex * CATALOG_PAGE_SIZE;
    const to = from + CATALOG_PAGE_SIZE - 1;
    const { data, error } = await supabaseClient
      .from('navigator_tasks')
      .select('card')
      .order('fipi_id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    return data || [];
  }

  async function fetchFullCatalogLegacy() {
    // Legacy rollback path: protected PostgREST catalog in Supabase.
    // Keep this intact throughout HYBRID stabilization.
    const firstPages = await Promise.all([fetchCatalogPage(0), fetchCatalogPage(1)]);
    const cards = firstPages.flatMap(page => page.map(row => row.card).filter(Boolean));
    if (firstPages[1].length < CATALOG_PAGE_SIZE) return cards;

    for (let pageIndex = 2; ; pageIndex += 1) {
      const page = await fetchCatalogPage(pageIndex);
      cards.push(...page.map(row => row.card).filter(Boolean));
      if (page.length < CATALOG_PAGE_SIZE) break;
    }
    return cards;
  }

  function openCatalogCacheDb() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB is unavailable'));
      const request = indexedDB.open(CATALOG_CACHE_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CATALOG_CACHE_STORE)) {
          db.createObjectStore(CATALOG_CACHE_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
      request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked'));
    });
  }

  async function readCatalogCache() {
    const db = await openCatalogCacheDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(CATALOG_CACHE_STORE, 'readonly');
        const request = tx.objectStore(CATALOG_CACHE_STORE).get(CATALOG_CACHE_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('IndexedDB read failed'));
      });
    } finally {
      db.close();
    }
  }

  async function writeCatalogCache(entry) {
    const db = await openCatalogCacheDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(CATALOG_CACHE_STORE, 'readwrite');
        tx.objectStore(CATALOG_CACHE_STORE).put(entry, CATALOG_CACHE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('IndexedDB write failed'));
        tx.onabort = () => reject(tx.error || new Error('IndexedDB write aborted'));
      });
    } finally {
      db.close();
    }
  }

  async function clearCatalogCache() {
    try {
      const db = await openCatalogCacheDb();
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(CATALOG_CACHE_STORE, 'readwrite');
          tx.objectStore(CATALOG_CACHE_STORE).delete(CATALOG_CACHE_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error || new Error('IndexedDB delete failed'));
          tx.onabort = () => reject(tx.error || new Error('IndexedDB delete aborted'));
        });
      } finally {
        db.close();
      }
    } catch (error) {
      console.warn('OGE catalog cache cleanup skipped:', error);
    }
  }

  async function sha256HexBuffer(buffer) {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function parseCompressedCatalog(buffer, descriptor) {
    if (!(buffer instanceof ArrayBuffer)) throw new Error('Catalog bytes are invalid.');
    if (Number(descriptor.bytes) && buffer.byteLength !== Number(descriptor.bytes)) {
      throw new Error(`Catalog size mismatch: ${buffer.byteLength} != ${descriptor.bytes}`);
    }

    const digest = await sha256HexBuffer(buffer);
    if (digest !== String(descriptor.sha256 || '').toLowerCase()) {
      throw new Error('Catalog SHA-256 mismatch.');
    }

    if (typeof DecompressionStream !== 'function') {
      throw new Error('This browser does not support gzip catalog decoding.');
    }

    const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    const payload = JSON.parse(text);
    const cards = Array.isArray(payload?.cards) ? payload.cards : [];
    const expectedCount = Number(descriptor.card_count || 0);

    if (!cards.length || (expectedCount && cards.length !== expectedCount)) {
      throw new Error(`Catalog card count mismatch: ${cards.length} != ${expectedCount || 'expected'}`);
    }

    const ids = new Set();
    for (const card of cards) {
      const fipiId = String(card?.fipiId || card?.fipi_id || '');
      if (!fipiId || !card?.bucket || !card?.url || ids.has(fipiId)) {
        throw new Error('Catalog semantic validation failed.');
      }
      ids.add(fipiId);
    }

    return cards;
  }

  async function requestObjectStorageCatalogDescriptor() {
    const token = await currentAccessToken();
    const response = await fetch(DELIVERY_FUNCTION_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });

    let data = null;
    try { data = await response.json(); } catch {}

    if (response.status === 409 && data?.error === 'object_storage_not_enabled') {
      return null;
    }
    if (!response.ok || !data?.ok || !data?.catalog?.url) {
      const error = new Error(`Object Storage delivery unavailable (${response.status}).`);
      error.status = response.status;
      error.payload = data;
      throw error;
    }
    return data;
  }

  async function fetchFullCatalogFromDescriptor(delivery) {
    const descriptor = delivery.catalog;
    const cacheIdentity = `${descriptor.version || ''}:${descriptor.sha256 || ''}`;

    try {
      const cached = await readCatalogCache();
      if (cached?.identity === cacheIdentity && cached?.bytes instanceof ArrayBuffer) {
        if (el.bootDetail) el.bootDetail.textContent = `Доступ подтверждён · локальный каталог ${descriptor.version}`;
        try {
          const cards = await parseCompressedCatalog(cached.bytes, descriptor);
          console.info(`OGE catalog ${descriptor.version}: IndexedDB cache hit (${cards.length} cards).`);
          return cards;
        } catch (error) {
          console.warn('Cached OGE catalog failed verification; refreshing:', error);
          await clearCatalogCache();
        }
      }
    } catch (error) {
      console.warn('OGE IndexedDB cache unavailable; continuing with network:', error);
    }

    if (el.bootDetail) el.bootDetail.textContent = `Доступ подтверждён · загружаю каталог ${descriptor.version}`;
    let bytes;
    if (descriptor.encoding === 'base64' && descriptor.data) {
      const binary = atob(descriptor.data);
      const decoded = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) decoded[i] = binary.charCodeAt(i);
      bytes = decoded.buffer;
    } else {
      const response = await fetch(descriptor.url, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error(`Object Storage catalog HTTP ${response.status}.`);
      bytes = await response.arrayBuffer();
    }
    const cards = await parseCompressedCatalog(bytes, descriptor);

    try {
      await writeCatalogCache({
        identity: cacheIdentity,
        version: descriptor.version,
        sha256: descriptor.sha256,
        card_count: descriptor.card_count,
        bytes,
        stored_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('OGE catalog cache write skipped:', error);
    }

    console.info(`OGE catalog ${descriptor.version}: Object Storage download (${cards.length} cards, ${bytes.byteLength} bytes).`);
    return cards;
  }

  async function fetchFullCatalogFromObjectStorage() {
    const delivery = await requestObjectStorageCatalogDescriptor();
    if (!delivery) return null;
    return fetchFullCatalogFromDescriptor(delivery);
  }

  async function fetchFullCatalog() {
    try {
      const objectStorageCards = await fetchFullCatalogFromObjectStorage();
      if (objectStorageCards) return objectStorageCards;
      console.info('OGE delivery manifest is LEGACY; using protected Supabase catalog.');
    } catch (error) {
      console.warn('OGE Object Storage delivery failed; falling back to protected Supabase catalog:', error);
      if (el.bootDetail) el.bootDetail.textContent = 'Защищённый резервный путь · загружаю каталог';
    }
    return fetchFullCatalogLegacy();
  }


  async function fetchTopicOverrides() {
    const map = new Map();
    for (let from = 0; ; from += CATALOG_PAGE_SIZE) {
      const to = from + CATALOG_PAGE_SIZE - 1;
      const { data, error } = await supabaseClient
        .from('task_topic_overrides')
        .select('fipi_id,mode,manual_tags,note,updated_at,updated_by')
        .order('fipi_id', { ascending: true })
        .range(from, to);
      if (error) throw error;
      const page = data || [];
      for (const row of page) map.set(row.fipi_id, row);
      if (page.length < CATALOG_PAGE_SIZE) break;
    }
    return map;
  }

  function editorTopics() {
    return DATA.topics.filter(t => !['all', UNTAGGED_TOPIC_ID].includes(t.id));
  }

  function subtopicsForTopic(topicId) {
    const configured = DATA.subtopics?.[topicId];
    if (Array.isArray(configured)) return configured.slice();

    const values = new Set();
    for (const task of tasks) {
      for (const tag of [...(task._autoTags || []), ...(task.tags || [])]) {
        if (tag.topic === topicId && tag.subtopic) values.add(tag.subtopic);
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'ru'));
  }

  function makeTopicRow(topicId = '', subtopic = '') {
    const row = document.createElement('div');
    row.className = 'topic-editor-row';

    const topicSelect = document.createElement('select');
    topicSelect.className = 'topic-editor-topic';
    topicSelect.innerHTML = ['<option value="">Выберите тему</option>']
      .concat(editorTopics().map(t => `<option value="${escapeAttr(t.id)}">${escapeHtml(t.name)}</option>`))
      .join('');
    topicSelect.value = topicId || '';

    const subtopicSelect = document.createElement('select');
    subtopicSelect.className = 'topic-editor-subtopic';

    const fillSubtopics = (selected = '') => {
      const values = topicSelect.value ? subtopicsForTopic(topicSelect.value) : [];
      subtopicSelect.innerHTML = ['<option value="">Без подтемы</option>']
        .concat(values.map(s => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`))
        .join('');
      subtopicSelect.value = values.includes(selected) ? selected : '';
      subtopicSelect.disabled = !topicSelect.value;
    };

    fillSubtopics(subtopic || '');
    topicSelect.addEventListener('change', () => fillSubtopics(''));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'topic-row-remove';
    remove.textContent = '×';
    remove.title = 'Убрать эту тему';
    remove.addEventListener('click', () => {
      if (el.topicOverrideRows.children.length > 1) row.remove();
      else {
        topicSelect.value = '';
        fillSubtopics('');
      }
    });

    row.append(topicSelect, subtopicSelect, remove);
    return row;
  }

  function renderAutoTagsReference(task) {
    const autoTags = task?._autoTags || [];
    if (!autoTags.length) {
      el.topicEditorAutoTags.innerHTML = '<span class="task-tag muted-tag">Без автоматической тематической метки</span>';
      return;
    }
    el.topicEditorAutoTags.innerHTML = autoTags.map(tag => {
      const meta = DATA.topics.find(t => t.id === tag.topic);
      const label = meta?.name || tag.topic;
      const detail = tag.subtopic ? ` · ${tag.subtopic}` : '';
      return `<span class="task-tag">${escapeHtml(label)}${escapeHtml(detail)}</span>`;
    }).join('');
  }

  function openTopicEditor(taskId) {
    if (appMode !== 'admin') return;
    const task = tasks.find(t => t.fipiId === taskId);
    if (!task) return;

    editingTaskId = taskId;
    el.topicEditorTaskId.textContent = taskId;
    renderAutoTagsReference(task);

    const override = overrideMap.get(taskId) || null;
    el.topicOverrideMode.value = override?.mode || (task._autoTags?.length ? 'add' : 'replace');
    el.topicOverrideNote.value = override?.note || '';
    el.topicOverrideRows.innerHTML = '';

    const manualTags = Array.isArray(override?.manual_tags) ? override.manual_tags : [];
    if (manualTags.length) {
      for (const tag of manualTags) {
        el.topicOverrideRows.appendChild(makeTopicRow(tag.topic_id || tag.topic || '', tag.subtopic || ''));
      }
    } else {
      el.topicOverrideRows.appendChild(makeTopicRow());
    }

    el.resetTopicOverrideButton.disabled = !override;
    if (typeof el.topicDialog.showModal === 'function') el.topicDialog.showModal();
  }

  function collectManualTags() {
    const rows = [...el.topicOverrideRows.querySelectorAll('.topic-editor-row')];
    const tags = [];
    const seen = new Set();

    for (const row of rows) {
      const topicId = row.querySelector('.topic-editor-topic')?.value || '';
      const subtopic = row.querySelector('.topic-editor-subtopic')?.value || '';
      if (!topicId) continue;
      const key = `${topicId}\u0000${subtopic}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const meta = DATA.topics.find(t => t.id === topicId);
      tags.push({
        topic_id: topicId,
        topic: meta?.name || topicId,
        subtopic: subtopic || null,
        source: 'manual_admin'
      });
    }
    return tags;
  }

  async function saveTopicOverride() {
    if (appMode !== 'admin' || !editingTaskId || !currentUser) return;

    const manualTags = collectManualTags();
    const payload = {
      fipi_id: editingTaskId,
      mode: el.topicOverrideMode.value === 'replace' ? 'replace' : 'add',
      manual_tags: manualTags,
      note: el.topicOverrideNote.value.trim() || null,
      updated_by: currentUser.id,
      updated_at: new Date().toISOString()
    };

    el.saveTopicOverrideButton.disabled = true;
    try {
      const { data, error } = await supabaseClient
        .from('task_topic_overrides')
        .upsert(payload, { onConflict: 'fipi_id' })
        .select('fipi_id,mode,manual_tags,note,updated_at,updated_by')
        .single();

      if (error) throw error;
      overrideMap.set(data.fipi_id, data);
      setTasks(baseCards, overrideMap, false);
      el.topicDialog.close();
      setBadge('live', 'ADMIN · SECURE', 'Ручная тематическая правка сохранена');
    } catch (error) {
      console.error('Topic override save failed:', error);
      alert(`Не удалось сохранить разметку: ${error?.message || error}`);
    } finally {
      el.saveTopicOverrideButton.disabled = false;
    }
  }

  async function resetTopicOverride() {
    if (appMode !== 'admin' || !editingTaskId || !currentUser) return;
    if (!overrideMap.has(editingTaskId)) return;

    el.resetTopicOverrideButton.disabled = true;
    try {
      const { error } = await supabaseClient
        .from('task_topic_overrides')
        .delete()
        .eq('fipi_id', editingTaskId);

      if (error) throw error;
      overrideMap.delete(editingTaskId);
      setTasks(baseCards, overrideMap, false);
      el.topicDialog.close();
      setBadge('live', 'ADMIN · SECURE', 'Ручная правка сброшена');
    } catch (error) {
      console.error('Topic override reset failed:', error);
      alert(`Не удалось сбросить разметку: ${error?.message || error}`);
    } finally {
      el.resetTopicOverrideButton.disabled = false;
    }
  }

  function mergeAccessIdentity(profile, manual, emailAccess) {
    if (!profile) return profile;
    const m = manual || null;
    const e = emailAccess || null;
    return {
      ...profile,
      login_kind: m ? 'vk_manual' : (e ? 'email_managed' : 'email'),
      vk_user_id: m?.vk_user_id ?? null,
      display_name: profile?.display_name ?? m?.display_name ?? e?.display_name ?? null,
      must_change_password: Boolean(m?.must_change_password ?? e?.must_change_password),
      manual_access_source: m?.access_source ?? null,
      manual_access_created_at: m?.created_at ?? null,
      email_access_created_at: e?.created_at ?? null
    };
  }

  async function fetchProfile(userId) {
    const [profileResult, manualResult, emailResult] = await Promise.all([
      supabaseClient
        .from('profiles')
        .select('id,email,role,status,access_level,access_expires_at,created_at,updated_at')
        .eq('id', userId)
        .single(),
      supabaseClient.rpc('oge_my_manual_vk_access_v097y'),
      supabaseClient.rpc('oge_my_email_access_v099y')
    ]);
    if (profileResult.error) throw profileResult.error;
    if (manualResult.error) throw manualResult.error;
    if (emailResult.error) throw emailResult.error;
    const manual = Array.isArray(manualResult.data) ? (manualResult.data[0] || null) : (manualResult.data || null);
    const emailAccess = Array.isArray(emailResult.data) ? (emailResult.data[0] || null) : (emailResult.data || null);
    return mergeAccessIdentity(profileResult.data, manual, emailAccess);
  }

  function showForcedPasswordDialog() {
    stopBootSlowTimer();
    appMode = 'password_change';
    document.body.classList.remove('oge-workspace-mode');
    el.bootState?.classList.add('hidden');
    el.accessGate?.classList.add('hidden');
    el.appShell?.classList.add('hidden');
    el.headerLoginButton?.classList.add('hidden');
    el.signOutButton?.classList.add('hidden');
    el.adminAccessButton?.classList.add('hidden');
    clearInlineError(el.firstPasswordError);
    el.firstPasswordInput.value = '';
    el.firstPasswordRepeat.value = '';
    if (typeof el.firstPasswordDialog?.showModal === 'function' && !el.firstPasswordDialog.open) {
      el.firstPasswordDialog.showModal();
    }
    window.setTimeout(() => el.firstPasswordInput?.focus(), 40);
  }

  function showAccessEnded(message = 'Срок доступа к Navigator закончился.') {
    const hadUser = Boolean(currentUser);
    showGate('blocked');
    if (el.accessEndedText) el.accessEndedText.textContent = message;
    if (typeof el.accessEndedDialog?.showModal === 'function' && !el.accessEndedDialog.open) {
      el.accessEndedDialog.showModal();
    }
    if (hadUser && supabaseClient) {
      void supabaseClient.auth.signOut({ scope: 'local' }).catch(error => console.warn('Local sign-out after access end failed:', error));
    }
    currentUser = null;
    currentProfile = null;
    el.headerLoginButton?.classList.remove('hidden');
    el.signOutButton?.classList.add('hidden');
  }

  function setSecureBadge() {
    if (appMode === 'admin') setBadge('live', 'ADMIN · SECURE', 'Полный защищённый доступ администратора');
    else if (appMode === 'teacher') setBadge('live', 'TEACHER · SECURE', 'Полный защищённый доступ учителя');
    else if (appMode === 'demo_user') setBadge('demo', 'DEMO · INVITED', 'Персональный ограниченный доступ по приглашению');
    else if (appMode === 'donut') setBadge('live', 'VK DONUT · ACTIVE', 'Подписка VK Donut проверена на сервере');
  }

  function enterApp(mode) {
    stopBootSlowTimer();
    appMode = mode;
    document.body.classList.add('oge-workspace-mode');
    if (el.bootState) el.bootState.classList.add('hidden');
    clearAccessMessage();
    el.accessGate.classList.add('hidden');
    el.appShell.classList.remove('hidden');
    el.headerLoginButton.classList.add('hidden');
    el.signOutButton.classList.remove('hidden');
    el.adminAccessButton.classList.toggle('hidden', mode !== 'admin');

    if (mode === 'demo') {
      el.modeKicker.textContent = 'DEMO · 44 CURATED TASKS';
      el.signOutButton.textContent = 'Выйти из DEMO';
      setBadge('demo', `DEMO · ${tasks.length}`, 'Ограниченная демонстрационная выборка');
    } else if (mode === 'demo_user') {
      el.modeKicker.textContent = 'DEMO · INVITED ACCESS';
      el.signOutButton.textContent = 'Выйти';
      setSecureBadge();
    } else if (mode === 'donut') {
      el.modeKicker.textContent = 'VK DONUT · FULL ACCESS';
      el.signOutButton.textContent = 'Выйти';
      setSecureBadge();
    } else {
      el.modeKicker.textContent = 'LEXICAL FIRST';
      el.signOutButton.textContent = 'Выйти';
      setSecureBadge();
    }
    updateSourceBadge();
    render();
  }

  function stopBootSlowTimer() {
    if (bootSlowTimer) window.clearTimeout(bootSlowTimer);
    bootSlowTimer = null;
  }

  function showGate(mode = 'gate', message = '', kind = 'info') {
    stopBootSlowTimer();
    appMode = mode;
    document.body.classList.remove('oge-workspace-mode');
    if (el.bootState) el.bootState.classList.add('hidden');
    tasks = [];
    baseCards = [];
    overrideMap = new Map();
    editingTaskId = null;
    DATA.tasks = [];
    records = {};
    el.appShell.classList.add('hidden');
    el.accessGate.classList.remove('hidden');
    el.headerLoginButton.classList.toggle('hidden', Boolean(currentUser));
    el.signOutButton.classList.toggle('hidden', !currentUser);
    el.adminAccessButton.classList.add('hidden');
    el.sourceBadge?.classList.add('hidden');
    el.signOutButton.textContent = 'Выйти';
    setBadge('protected', 'PROTECTED', 'Каталог защищён Supabase Auth + RLS');
    if (message) showAccessMessage(message, kind);
    else clearAccessMessage();
  }

  function showBoot(message = 'Открываю Navigator…', detail = 'Восстанавливаю сохранённый вход') {
    stopBootSlowTimer();
    appMode = 'boot';
    document.body.classList.remove('oge-workspace-mode');
    el.appShell.classList.add('hidden');
    el.accessGate.classList.add('hidden');
    el.headerLoginButton.classList.add('hidden');
    el.signOutButton.classList.add('hidden');
    el.adminAccessButton.classList.add('hidden');
    if (el.bootMessage) el.bootMessage.textContent = message;
    if (el.bootDetail) el.bootDetail.textContent = detail;
    if (el.bootSlowNote) el.bootSlowNote.textContent = 'Повторный вход обычно не требуется';
    if (el.bootState) el.bootState.classList.remove('hidden');
    clearAccessMessage();
    bootSlowTimer = window.setTimeout(() => {
      if (appMode !== 'boot') return;
      if (el.bootSlowNote) el.bootSlowNote.textContent = 'Связь с защищённым каталогом занимает больше обычного — Navigator продолжает загрузку';
    }, 3500);
  }

  async function startDemo() {
    clearAccessMessage();
    if (!CONFIG.firebaseAccessUrl) {
      showAccessMessage('DEMO-сервер ещё не подключён.', 'error');
      return;
    }

    el.openDemoButton.disabled = true;
    el.openDemoButton.textContent = 'Открываю DEMO…';
    try {
      const response = await fetch(`${CONFIG.firebaseAccessUrl}?mode=demo`, { method: 'GET', cache: 'no-store' });
      const payload = await response.json().catch(() => null);
      const cards = Array.isArray(payload?.cards) ? payload.cards : [];
      if (!response.ok || !payload?.ok || payload?.mode !== 'demo' || cards.length !== 44) {
        throw new Error(payload?.error || `DEMO server ${response.status}`);
      }

      records = loadDemoRecords();
      setTasks(cards, new Map());
      enterApp('demo');
    } catch (error) {
      console.error('DEMO load failed:', error);
      showAccessMessage('Не удалось открыть DEMO. Попробуйте чуть позже.', 'error');
    } finally {
      el.openDemoButton.disabled = false;
      el.openDemoButton.textContent = 'Попробовать DEMO';
    }
  }

  function currentVkRedirectUrl() {
    const redirect = VK_REDIRECT_URLS[window.location.origin];
    if (!redirect) {
      throw new Error('VK Donut доступен только на официальных адресах Navigator: GitHub Pages или GitVerse Pages.');
    }
    return redirect;
  }

  function randomUrlSafe(length, alphabet) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let out = '';
    for (let i = 0; i < bytes.length; i += 1) out += alphabet[bytes[i] % alphabet.length];
    return out;
  }

  function cleanCallbackUrl() {
    const url = new URL(window.location.href);
    ['code', 'device_id', 'state', 'type'].forEach(key => url.searchParams.delete(key));
    history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }

  function startDonutLogin() {
    clearAccessMessage();
    try {
      const VKID = window.VKIDSDK;
      if (!VKID?.Config?.init || !VKID?.Auth?.login) throw new Error('VK ID SDK не загрузился. Обновите страницу.');
      const state = randomUrlSafe(40, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-');
      const codeVerifier = randomUrlSafe(72, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~');
      const redirectUrl = currentVkRedirectUrl();
      sessionStorage.setItem(`${DONUT_STORAGE_PREFIX}state`, state);
      sessionStorage.setItem(`${DONUT_STORAGE_PREFIX}verifier`, codeVerifier);
      sessionStorage.setItem(`${DONUT_STORAGE_PREFIX}redirect`, redirectUrl);
      VKID.Config.init({ app: VK_APP_ID, redirectUrl, state, codeVerifier,
        ...(VKID.ConfigAuthMode?.Redirect ? { mode: VKID.ConfigAuthMode.Redirect } : {}) });
      el.openDonutButton.disabled = true;
      showAccessMessage('Открываю VK ID…', 'info');
      VKID.Auth.login().catch(error => {
        el.openDonutButton.disabled = false;
        showAccessMessage(`Не удалось открыть VK ID: ${error?.message || error}`, 'error');
      });
    } catch (error) {
      el.openDonutButton.disabled = false;
      showAccessMessage(error?.message || String(error), 'error');
    }
  }

  async function callDonutFunction(body, authToken = '') {
    const response = await fetch(DONUT_FUNCTION_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }, body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      const error = new Error(data?.error || `Ошибка сервера (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function fetchDonutCatalog(token) {
    const cards = [];
    for (let offset = 0; ; offset += DONUT_PAGE_SIZE) {
      const data = await callDonutFunction({ action: 'catalog', session_token: token, offset, limit: DONUT_PAGE_SIZE });
      const page = Array.isArray(data.cards) ? data.cards : [];
      cards.push(...page);
      if (page.length < DONUT_PAGE_SIZE) break;
    }
    return cards;
  }

  async function enterDonutSession(token, vkUserId) {
    showBoot('Загружаю защищённый каталог…');
    const cards = await fetchDonutCatalog(token);
    if (!cards.length) throw new Error('Защищённый каталог не вернул карточки.');
    donutUserId = String(vkUserId);
    records = normalizeRecords(safeParse(localStorage.getItem(`${DONUT_STORAGE_PREFIX}status:${donutUserId}`), {}));
    setTasks(cards, new Map());
    enterApp('donut');
    await refreshBackupRuntime();
  }

  async function processDonutCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const deviceId = url.searchParams.get('device_id');
    const state = url.searchParams.get('state');
    if (!code && !deviceId && !state) return false;
    showBoot('Проверяю подписку VK Donut…');
    try {
      const expectedState = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}state`) || '';
      const codeVerifier = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}verifier`) || '';
      const redirectUrl = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}redirect`) || currentVkRedirectUrl();
      if (!code || !deviceId || !state || !expectedState || !codeVerifier) throw new Error('Данные входа неполные. Начните вход через VK заново.');
      if (state !== expectedState) throw new Error('State не совпадает. Начните вход через VK заново.');
      const result = await callDonutFunction({ action: 'exchange', code, device_id: deviceId, state,
        expected_state: expectedState, code_verifier: codeVerifier, redirect_uri: redirectUrl });
      if (!result.is_don) {
        showGate('gate', 'Активная подписка VK Donut не найдена. Можно открыть DEMO или войти по приглашению.', 'warning');
        return true;
      }
      if (result.blocked) {
        showGate('blocked', 'Доступ к Navigator заблокирован администратором.', 'error');
        return true;
      }
      sessionStorage.setItem(`${DONUT_STORAGE_PREFIX}session`, result.session_token);
      sessionStorage.setItem(`${DONUT_STORAGE_PREFIX}vk_user_id`, String(result.vk_user_id));
      await enterDonutSession(result.session_token, result.vk_user_id);
      return true;
    } catch (error) {
      console.error('VK Donut access failed:', error);
      showGate('gate', `Не удалось проверить VK Donut: ${error?.message || error}`, 'error');
      return true;
    } finally {
      sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}state`);
      sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}verifier`);
      sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}redirect`);
      cleanCallbackUrl();
    }
  }

  async function recordEmailAccess(accessLevel) {
    if (!supabaseClient || !currentUser) return;
    const key = `oge-navigator-access-session:${currentUser.id}`;
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) { sessionId = crypto.randomUUID(); sessionStorage.setItem(key, sessionId); }

    const payload = {
      p_session_id: sessionId,
      p_access_level: accessLevel,
      p_platform: currentPlatform()
    };
    const v2 = await supabaseClient.rpc('record_navigator_access_v096', payload);
    if (!v2.error) return;

    // Safe fallback while the SQL migration has not yet been installed.
    const legacy = await supabaseClient.rpc('record_navigator_access', {
      p_session_id: sessionId,
      p_access_level: accessLevel
    });
    if (legacy.error) console.error('Access event save failed:', legacy.error);
  }

  async function activateAuthenticatedSession(user) {
    if (!user?.id) return;
    if (authActivationPromise && authActivationUserId === user.id) return authActivationPromise;

    authActivationUserId = user.id;
    authActivationPromise = activateAuthenticatedSessionCore(user);
    try {
      return await authActivationPromise;
    } finally {
      if (authActivationUserId === user.id) {
        authActivationPromise = null;
        authActivationUserId = '';
      }
    }
  }

  async function activateFirebaseSession(firebaseUser) {
    if (!firebaseUser?.uid) return;
    const user = { id: firebaseUser.uid, email: firebaseUser.email || '', raw: firebaseUser };
    currentUser = user;
    currentProfile = null;
    showBoot('Проверяю доступ…', 'Firebase подтверждён · проверяю право FULL');

    try {
      const access = await window.OGE_FIREBASE_AUTH.requestOgeAccess();
      currentProfile = access.profile;
      if (currentProfile.must_change_password) {
        showForcedPasswordDialog();
        return;
      }
      records = loadCloudCache(user.id);
      showBoot('Загружаю защищённый каталог…', 'Доступ подтверждён · 1735 заданий');
      const cards = await fetchFullCatalogFromDescriptor(access);
      setTasks(cards, new Map());
      backupRuntime = {
        content_source: 'fipi',
        yandex_backup_ready: true,
        backup_version: '0.2.2-firebase'
      };
      enterApp(access.profile.role === 'admin' ? 'admin' : 'teacher');
      lastResumeValidationAt = Date.now();
      lastVisibleStatusRefreshAt = Date.now();
    } catch (error) {
      console.error('Firebase access activation failed:', error);
      const blocked = ['access_blocked', 'access_expired', 'access_missing', 'access_pending', 'full_required']
        .includes(String(error?.code || ''));
      if (blocked) showAccessEnded(error.message || 'Доступ к Navigator закрыт.');
      else showGate('blocked', error.message || 'Не удалось проверить доступ к защищённому каталогу.', 'error');
    }
  }

  async function activateAuthenticatedSessionCore(user) {
    currentUser = user;
    currentProfile = null;
    showBoot('Проверяю доступ…', 'Сессия найдена · подтверждаю права');

    try {
      const profile = await fetchProfile(user.id);
      currentProfile = profile;

      if (profile.status === 'pending') {
        showGate('pending', 'Доступ ожидает подтверждения администратора.', 'warning');
        return;
      }
      if (profile.status === 'blocked') {
        showAccessEnded('Ваш доступ к Navigator завершён.');
        return;
      }
      if (profile.status !== 'active' || !['admin', 'teacher'].includes(profile.role)) {
        showAccessEnded('Для этого аккаунта нет активного доступа к Navigator.');
        return;
      }
      if (isProfileExpired(profile)) {
        showAccessEnded('Срок доступа к Navigator закончился.');
        return;
      }

      if (['vk_manual', 'email_managed'].includes(profile.login_kind) && profile.must_change_password) {
        showForcedPasswordDialog();
        return;
      }

      records = loadCloudCache(user.id);

      if (profile.role === 'teacher' && profile.access_level === 'demo') {
        showBoot('Открываю DEMO…', 'Доступ подтверждён · загружаю подборку');
        const { data, error } = await supabaseClient.rpc('get_demo_tasks');
        if (error) throw error;
        const cards = (data || []).map(row => row.card).filter(Boolean);
        if (!cards.length) throw new Error('Персональная DEMO-подборка недоступна.');
        setTasks(cards, new Map());
        enterApp('demo_user');
        void recordEmailAccess('demo');
        void loadCloudStatuses();
        return;
      }

      if (profile.access_level !== 'full') {
        showAccessEnded('Для этого аккаунта нет полного доступа к каталогу.');
        return;
      }

      showBoot('Загружаю защищённый каталог…', 'Доступ подтверждён · 1735 заданий');
      const [cards, overrides] = await Promise.all([
        fetchFullCatalog(),
        fetchTopicOverrides(),
        refreshBackupRuntime()
      ]);
      if (cards.length !== 1735) {
        console.warn(`Protected catalog returned ${cards.length} cards; expected 1735.`);
      }
      setTasks(cards, overrides);
      enterApp(profile.role === 'admin' ? 'admin' : 'teacher');

      // Statistics and personal task statuses are non-critical background work.
      // Backup source was already fetched in parallel with the catalog above,
      // so the very first card click respects the global FIPI/Yandex switch.
      void recordEmailAccess(profile.role === 'admin' ? 'admin' : 'full');
      void loadCloudStatuses();
      lastResumeValidationAt = Date.now();
      lastVisibleStatusRefreshAt = Date.now();
    } catch (error) {
      console.error('Access activation failed:', error);
      showGate('blocked', 'Не удалось проверить доступ к защищённому каталогу. Попробуйте позже.', 'error');
    }
  }

  function formatAccessExpiry(value) {
    if (!value) return 'бессрочно';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const expired = date.getTime() <= Date.now();
    const text = date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return expired ? `истёк · ${text}` : `до ${text}`;
  }

  function statusDisplay(status) {
    if (status === 'active') return 'ACTIVE';
    if (status === 'blocked') return 'BLOCKED';
    return 'PENDING';
  }

  function accessDisplay(level) {
    return level === 'demo' ? 'DEMO' : 'FULL';
  }

  async function fetchAdminProfiles() {
    if (usesFirebaseEmergencyAuth()) {
      const directory = await window.OGE_FIREBASE_AUTH.requestAdminDirectory();
      return directory.users.map(row => ({
        ...row,
        id: row.firebase_uid,
        email: row.login_kind === 'vk_manual' ? '' : row.login_label,
        vk_user_id: row.login_kind === 'vk_manual' ? row.login_label : null,
        login_kind: row.login_kind === 'vk_manual' ? 'vk_manual' : 'email_managed',
      }));
    }
    const [profilesResult, manualResult, emailResult] = await Promise.all([
      supabaseClient
        .from('profiles')
        .select('id,email,display_name,role,status,access_level,access_expires_at,created_at,updated_at')
        .order('created_at', { ascending: true }),
      supabaseClient.rpc('oge_admin_manual_vk_directory_v097y'),
      supabaseClient.rpc('oge_admin_email_directory_v099y')
    ]);
    if (profilesResult.error) throw profilesResult.error;
    if (manualResult.error) throw manualResult.error;
    if (emailResult.error) throw emailResult.error;
    const manualRows = Array.isArray(manualResult.data) ? manualResult.data : [];
    const emailRows = Array.isArray(emailResult.data) ? emailResult.data : [];
    const manualByUser = new Map(manualRows.map(row => [String(row.auth_user_id), row]));
    const emailByUser = new Map(emailRows.map(row => [String(row.auth_user_id), row]));
    return (profilesResult.data || []).map(profile => mergeAccessIdentity(
      profile,
      manualByUser.get(String(profile.id)) || null,
      emailByUser.get(String(profile.id)) || null
    ));
  }

  async function fetchAdminDonutSessions() {
    if (usesFirebaseEmergencyAuth()) return [];
    const { data, error } = await supabaseClient.rpc('admin_donut_directory_v096');
    if (!error) return Array.isArray(data) ? data : [];

    // Backward-compatible fallback for GitHub before the v0.9.6 SQL is installed.
    const session = await supabaseClient.auth.getSession();
    const token = session.data?.session?.access_token || '';
    if (!token) throw error;
    const result = await callDonutFunction({ action: 'admin_sessions' }, token);
    return Array.isArray(result.sessions) ? result.sessions : [];
  }

  async function revokeDonutSession(vkUserId) {
    if (!window.confirm(`Завершить активную Donut-сессию VK ID ${vkUserId}?`)) return;

    const rpc = await supabaseClient.rpc('admin_revoke_donut_sessions_v096', {
      p_vk_user_id: Number(vkUserId)
    });
    if (rpc.error) {
      const { data } = await supabaseClient.auth.getSession();
      await callDonutFunction({ action: 'admin_revoke', vk_user_id: Number(vkUserId) }, data?.session?.access_token || '');
    }
    await refreshAdminPanel();
  }

  async function setDonutBlocked(vkUserId, blocked) {
    const label = blocked ? 'Заблокировать' : 'Разблокировать';
    if (!window.confirm(`${label} VK ID ${vkUserId}?`)) return;

    const rpc = await supabaseClient.rpc('admin_set_donut_blocked_v096', {
      p_vk_user_id: Number(vkUserId),
      p_blocked: Boolean(blocked)
    });
    if (rpc.error) {
      const { data } = await supabaseClient.auth.getSession();
      await callDonutFunction({ action: 'admin_set_blocked', vk_user_id: Number(vkUserId), blocked }, data?.session?.access_token || '');
    }
    await refreshAdminPanel();
  }

  async function fetchDemoEnabled() {
    if (usesFirebaseEmergencyAuth()) {
      const directory = await window.OGE_FIREBASE_AUTH.requestAdminDirectory();
      return Boolean(directory.demo_enabled);
    }
    const { data, error } = await supabaseClient.rpc('demo_is_enabled');
    if (error) throw error;
    return Boolean(data);
  }

  function statsRange() {
    const to = new Date();
    const days = Number(el.statsPeriodSelect.value) || 30;
    let from = new Date(to.getTime() - days * 86400000);
    if (el.statsPeriodSelect.value === 'custom') {
      if (el.statsFromDate.value) from = new Date(`${el.statsFromDate.value}T00:00:00`);
      if (el.statsToDate.value) to.setTime(new Date(`${el.statsToDate.value}T23:59:59.999`).getTime());
    }
    return { from, to };
  }

  function renderStatsChart(rows = []) {
    if (!el.statsChart) return;
    if (!rows.length) {
      el.statsChart.innerHTML = '<div class="admin-users-empty">Данных пока нет.</div><div id="statsTooltip" class="stats-tooltip hidden" role="tooltip"></div>';
      el.statsTooltip = document.querySelector('#statsTooltip');
      return;
    }

    const w = 760, h = 112, px = 24, py = 16;
    const max = Math.max(1, ...rows.map(r => Number(r.visits) || 0));
    const pts = rows.map((r, i) => {
      const rawDay = String(r.day || '');
      const date = /^\d{4}-\d{2}-\d{2}/.test(rawDay)
        ? new Date(`${rawDay.slice(0,10)}T00:00:00`)
        : new Date(rawDay);
      const label = Number.isNaN(date.getTime())
        ? rawDay
        : date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return {
        x: px + (rows.length === 1 ? (w - px * 2) / 2 : i * (w - px * 2) / (rows.length - 1)),
        y: h - py - (Number(r.visits) || 0) * (h - py * 2) / max,
        v: Number(r.visits) || 0,
        d: label
      };
    });

    el.statsChart.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="График входов">
        <line x1="${px}" y1="${h-py}" x2="${w-px}" y2="${h-py}" class="stats-axis"/>
        <polyline points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" class="stats-line"/>
        ${pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" class="stats-dot" tabindex="0" data-date="${escapeAttr(p.d)}" data-visits="${p.v}"><title>${escapeHtml(p.d)} · ${p.v} входов</title></circle>`).join('')}
      </svg>
      <div id="statsTooltip" class="stats-tooltip hidden" role="tooltip"></div>`;

    el.statsTooltip = document.querySelector('#statsTooltip');
    const showTip = (event) => {
      const dot = event.currentTarget;
      if (!el.statsTooltip) return;
      const chartRect = el.statsChart.getBoundingClientRect();
      const dotRect = dot.getBoundingClientRect();
      el.statsTooltip.innerHTML = `<strong>${escapeHtml(dot.dataset.date || '')}</strong><span>${escapeHtml(dot.dataset.visits || '0')} входов</span>`;
      el.statsTooltip.style.left = `${dotRect.left - chartRect.left + dotRect.width / 2}px`;
      el.statsTooltip.style.top = `${Math.max(2, dotRect.top - chartRect.top - 8)}px`;
      el.statsTooltip.classList.remove('hidden');
    };
    const hideTip = () => el.statsTooltip?.classList.add('hidden');

    el.statsChart.querySelectorAll('.stats-dot').forEach(dot => {
      dot.addEventListener('mouseenter', showTip);
      dot.addEventListener('focus', showTip);
      dot.addEventListener('mouseleave', hideTip);
      dot.addEventListener('blur', hideTip);
    });
  }

  async function refreshStatistics() {
    if (appMode !== 'admin') return;
    const { from, to } = statsRange();
    if (el.statsPeriodLabel) {
      el.statsPeriodLabel.textContent = `${from.toLocaleDateString('ru-RU')} — ${to.toLocaleDateString('ru-RU')}`;
    }

    if (usesFirebaseEmergencyAuth()) {
      el.statsVisits.textContent = '—';
      el.statsUnique.textContent = String(adminProfiles.length || 0);
      el.statsEmail.textContent = String(adminProfiles.filter(row => row.login_kind === 'email_managed').length);
      el.statsDonut.textContent = String(adminProfiles.filter(row => row.login_kind === 'vk_manual').length);
      if (el.statsGithub) el.statsGithub.textContent = '—';
      if (el.statsYandex) el.statsYandex.textContent = '—';
      adminStatsUsers = new Map();
      renderStatsChart([]);
      return;
    }

    let { data, error } = await supabaseClient.rpc('admin_navigator_stats_v096', {
      p_from: from.toISOString(),
      p_to: to.toISOString()
    });

    if (error) {
      const legacy = await supabaseClient.rpc('admin_navigator_stats', {
        p_from: from.toISOString(),
        p_to: to.toISOString()
      });
      data = legacy.data;
      error = legacy.error;
    }
    if (error) throw error;

    const s = data || {};
    el.statsVisits.textContent = s.visits || 0;
    el.statsUnique.textContent = s.unique_users || 0;
    el.statsEmail.textContent = s.email_visits || 0;
    el.statsDonut.textContent = s.donut_visits || 0;
    if (el.statsGithub) el.statsGithub.textContent = s.github_visits || 0;
    if (el.statsYandex) el.statsYandex.textContent = s.yandex_visits || 0;

    adminStatsUsers = new Map((s.users || []).map(r => [`${r.user_kind}:${r.user_key}`, r]));
    renderStatsChart(s.daily || []);
  }

  function profileDisplayLabel(profile) {
    if (profile?.login_kind === 'vk_manual') {
      return profile.display_name || (profile.vk_user_id ? `VK ID ${profile.vk_user_id}` : 'VK-доступ');
    }
    if (profile?.login_kind === 'email_managed') return profile.display_name || profile.email || 'Email-доступ';
    return profile?.display_name || profile?.email || profile?.id || 'Пользователь';
  }

  function isDonutManualProfile(profile) {
    return Boolean(profile && profile.login_kind === 'vk_manual' && profile.manual_access_source === 'donut');
  }

  function linkedManualProfile(vkUserId) {
    const key = String(vkUserId ?? '');
    return adminProfiles.find(profile => profile.login_kind === 'vk_manual' && String(profile.vk_user_id ?? '') === key) || null;
  }

  function buildAdminDonutDirectory() {
    const manualByVk = new Map();
    adminProfiles.forEach(profile => {
      if (!isDonutManualProfile(profile) || !profile.vk_user_id) return;
      manualByVk.set(String(profile.vk_user_id), profile);
    });

    const byVk = new Map();
    adminDonutSessions.forEach(row => {
      const key = String(row?.vk_user_id ?? '');
      if (!key) return;
      byVk.set(key, {
        vk_user_id: key,
        legacy: row,
        manual: manualByVk.get(key) || null
      });
    });

    // A Yandex Donut login may exist even if this VK ID never created a legacy
    // GitHub Donut session (for example, an administrator created it manually).
    // Keep that person on the Donut tab anyway; VK ID is the single merge key.
    manualByVk.forEach((profile, key) => {
      if (byVk.has(key)) return;
      byVk.set(key, {
        vk_user_id: key,
        legacy: null,
        manual: profile
      });
    });

    return Array.from(byVk.values());
  }

  function renderAdminUsers() {
    const rows = adminProfiles;
    const participantRows = rows.filter(profile => profile.role === 'admin' || !isDonutManualProfile(profile));
    const emailRows = participantRows.filter(profile => profile.login_kind !== 'vk_manual');
    const inviteVkRows = participantRows.filter(profile => profile.login_kind === 'vk_manual');
    const active = participantRows.filter(profile => profile.status === 'active' && !isProfileExpired(profile)).length;
    const pending = participantRows.filter(profile => profile.status === 'pending').length;
    const blocked = participantRows.filter(profile => profile.status === 'blocked').length;
    const donorDirectory = buildAdminDonutDirectory();

    el.adminUserStats.textContent = `Участники: ${participantRows.length} · Email: ${emailRows.length} · VK invite: ${inviteVkRows.length} · Active: ${active} · Pending: ${pending} · Blocked: ${blocked}`;
    if (el.adminParticipantsBadge) el.adminParticipantsBadge.textContent = String(participantRows.length);
    if (el.adminDonutBadge) el.adminDonutBadge.textContent = adminDonutLoadError ? '!' : String(donorDirectory.length);

    el.adminUsersList.innerHTML = participantRows.length ? participantRows.map(profile => {
      const self = profile.id === currentUser?.id;
      const activity = adminStatsUsers.get(`email:${profile.id}`);
      const expired = isProfileExpired(profile);
      const statusClass = expired ? 'blocked' : (profile.status || 'pending');
      const levelClass = profile.access_level === 'demo' ? 'demo' : 'full';
      const joined = profile.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : '—';
      const expiry = formatAccessExpiry(profile.access_expires_at);
      const visits = activity?.login_count || 0;
      const lastLogin = profile.last_login_at
        ? new Date(profile.last_login_at).toLocaleString('ru-RU')
        : 'ещё не входил';
      const manual = profile.login_kind === 'vk_manual';
      const managedEmail = profile.login_kind === 'email_managed';
      const label = profileDisplayLabel(profile);
      const source = profile.role === 'admin' ? 'admin' : manual ? 'VK · invite' : managedEmail ? 'email · invite' : 'invite';
      let actions = `<button class="admin-mini-button" type="button" data-user-edit="${escapeAttr(profile.id)}">Изменить</button>`;
      if (self) {
        actions += '<span class="admin-self-note">Ваш аккаунт</span>';
      } else {
        const nextStatus = profile.status === 'blocked' ? 'active' : 'blocked';
        actions += `${manual ? `<button class="admin-mini-button" type="button" data-manual-reset="${escapeAttr(profile.id)}">Сбросить пароль</button>` : managedEmail ? `<button class="admin-mini-button" type="button" data-email-reset="${escapeAttr(profile.id)}">Сбросить пароль</button>` : ''}<button class="admin-mini-button ${profile.status === 'blocked' ? 'success-soft' : 'danger-soft'}" type="button" data-user-quick="${escapeAttr(profile.id)}" data-next-status="${escapeAttr(nextStatus)}">${profile.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}</button>`;
      }
      return `<article class="admin-user-card${self ? ' self' : ''}"><div class="admin-user-main"><div class="admin-user-name">${escapeHtml(label)}</div>${manual ? `<div class="admin-user-id">VK ID ${escapeHtml(profile.vk_user_id || '—')}</div>` : profile.display_name ? `<div class="admin-user-id">${escapeHtml(profile.email || '—')}</div>` : ''}<div class="admin-user-chips"><span class="admin-chip${manual ? ' vk-manual' : ''}">${manual ? 'VK ID' : 'EMAIL'}</span><span class="admin-chip ${levelClass}">${escapeHtml(accessDisplay(profile.access_level))}</span><span class="admin-chip ${statusClass}">${expired ? 'EXPIRED' : escapeHtml(statusDisplay(profile.status))}</span>${profile.must_change_password ? '<span class="admin-chip password-change">TEMP PASSWORD</span>' : ''}${profile.role === 'admin' ? '<span class="admin-chip admin-role">ADMIN</span>' : ''}</div></div><div class="admin-user-info"><span>Добавлен: <strong>${escapeHtml(joined)}</strong></span><span>Срок: <strong>${escapeHtml(expiry)}</strong></span></div><div class="admin-user-info"><span>${usesFirebaseEmergencyAuth() ? 'Последний вход' : 'Входов за период'}: <strong>${escapeHtml(usesFirebaseEmergencyAuth() ? lastLogin : visits)}</strong></span><span>Источник: <strong>${escapeHtml(source)}</strong></span></div><div class="admin-user-actions">${actions}</div></article>`;
    }).join('') : '<div class="admin-users-empty">Пользователей пока нет.</div>';

    const connected = donorDirectory.filter(item => Boolean(item.manual)).length;
    const waiting = donorDirectory.filter(item => Boolean(item.legacy) && !item.manual).length;
    const migrationSummary = `<div class="admin-user-stats admin-user-stats-top">Доны: ${donorDirectory.length} · Яндекс подключён: ${connected} · Нужно перенести: ${waiting}</div>`;

    el.adminDonutList.innerHTML = donorDirectory.length ? migrationSummary + donorDirectory.map(item => {
      const row = item.legacy;
      const manual = item.manual;
      const vkId = item.vk_user_id;
      const legacyName = row ? [row.first_name, row.last_name].filter(Boolean).join(' ') : '';
      const name = manual?.display_name || legacyName || `VK ID ${vkId}`;
      const firstSeen = row?.first_seen_at
        ? new Date(row.first_seen_at).toLocaleString('ru-RU')
        : (manual?.created_at ? new Date(manual.created_at).toLocaleString('ru-RU') : '—');
      const verified = row?.last_verified_at ? new Date(row.last_verified_at).toLocaleString('ru-RU') : '—';
      const sessionActive = Boolean(row?.session_expires_at) && new Date(row.session_expires_at).getTime() > Date.now();
      const sessionText = sessionActive ? `до ${new Date(row.session_expires_at).toLocaleString('ru-RU')}` : 'нет активной сессии';
      const legacyActivity = adminStatsUsers.get(`donut:${vkId}`);
      const yandexActivity = manual ? adminStatsUsers.get(`email:${manual.id}`) : null;
      const legacyVisits = legacyActivity?.login_count || 0;
      const yandexVisits = yandexActivity?.login_count || 0;
      const manualStatus = manual ? (isProfileExpired(manual) ? 'EXPIRED' : statusDisplay(manual.status)) : 'NOT CONNECTED';
      const manualStatusClass = !manual ? 'pending' : (isProfileExpired(manual) ? 'blocked' : (manual.status || 'pending'));
      const legacyStatusText = !row ? 'NO LEGACY' : row.blocked ? 'BLOCKED' : row.last_don_status ? 'DONUT ACTIVE' : 'NOT ACTIVE';
      const legacyStatusClass = !row ? 'pending' : row.blocked ? 'blocked' : row.last_don_status ? 'active' : 'pending';

      const manualActions = manual
        ? `<button class="admin-mini-button" type="button" data-user-edit-linked="${escapeAttr(manual.id)}">Изменить</button><button class="admin-mini-button" type="button" data-manual-reset="${escapeAttr(manual.id)}">Сбросить пароль</button>`
        : `<button class="admin-mini-button success-soft" type="button" data-manual-create-vk="${escapeAttr(vkId)}" data-manual-create-name="${escapeAttr(name)}">Создать вход на Яндекс</button>`;
      const legacyBlock = row && !manual
        ? `<button class="admin-mini-button ${row.blocked ? 'success-soft' : 'danger-soft'}" type="button" data-donut-block="${escapeAttr(vkId)}" data-blocked="${row.blocked ? 'false' : 'true'}">${row.blocked ? 'Разблокировать' : 'Заблокировать'}</button>`
        : '';

      return `<article class="admin-user-card${sessionActive ? ' online-now' : ''}"><div class="admin-user-main"><div class="admin-user-name">${escapeHtml(name)}</div><div class="admin-user-id">VK ID ${escapeHtml(vkId)}</div><div class="admin-user-chips"><span class="admin-chip">VK DONUT</span><span class="admin-chip full">FULL</span><span class="admin-chip ${legacyStatusClass}">${escapeHtml(legacyStatusText)}</span><span class="admin-chip ${manualStatusClass}">YANDEX ${escapeHtml(manualStatus)}</span>${manual?.must_change_password ? '<span class="admin-chip password-change">TEMP PASSWORD</span>' : ''}${sessionActive ? '<span class="admin-chip active">SESSION</span>' : ''}</div></div><div class="admin-user-info"><span>GitHub/Donut: <strong>${row ? escapeHtml(legacyStatusText) : 'нет старой записи'}</strong></span><span>Яндекс: <strong>${manual ? escapeHtml(manualStatus) : 'не подключён'}</strong></span></div><div class="admin-user-info"><span>Входов GitHub/Donut: <strong>${escapeHtml(legacyVisits)}</strong></span><span>Входов Яндекс: <strong>${escapeHtml(yandexVisits)}</strong></span></div><div class="admin-user-info"><span>Впервые: <strong>${escapeHtml(firstSeen)}</strong></span>${row ? `<span>Проверка Donut: <strong>${escapeHtml(verified)}</strong></span>` : '<span>Проверка Donut: <strong>—</strong></span>'}</div>${row ? `<div class="admin-user-info"><span>Сессия GitHub: <strong>${escapeHtml(sessionText)}</strong></span></div>` : ''}<div class="admin-user-actions">${sessionActive ? `<button class="admin-mini-button" type="button" data-donut-revoke="${escapeAttr(vkId)}">Завершить сессию</button>` : ''}${manualActions}${legacyBlock}</div></article>`;
    }).join('') : (adminDonutLoadError
      ? `<div class="admin-users-empty error-text">VK Donut: ${escapeHtml(adminDonutLoadError)}</div>`
      : '<div class="admin-users-empty">VK Donut-пользователей пока нет. Для нового пользователя нажмите «+ VK-доступ».</div>');

    el.adminUsersList.querySelectorAll('[data-user-edit]').forEach(button => button.addEventListener('click', () => openUserAccessEditor(button.dataset.userEdit)));
    el.adminUsersList.querySelectorAll('[data-user-quick]').forEach(button => button.addEventListener('click', () => quickSetUserStatus(button.dataset.userQuick, button.dataset.nextStatus)));
    document.querySelectorAll('[data-user-edit-linked]').forEach(button => button.addEventListener('click', () => openUserAccessEditor(button.dataset.userEditLinked)));
    document.querySelectorAll('[data-manual-reset]').forEach(button => button.addEventListener('click', () => resetManualVkPassword(button.dataset.manualReset)));
    document.querySelectorAll('[data-email-reset]').forEach(button => button.addEventListener('click', () => resetManagedEmailPassword(button.dataset.emailReset)));
    el.adminDonutList.querySelectorAll('[data-manual-create-vk]').forEach(button => button.addEventListener('click', () => openManualVkAdminDialog(button.dataset.manualCreateVk, button.dataset.manualCreateName, 'donut')));
    el.adminDonutList.querySelectorAll('[data-donut-revoke]').forEach(button => button.addEventListener('click', () => revokeDonutSession(button.dataset.donutRevoke)));
    el.adminDonutList.querySelectorAll('[data-donut-block]').forEach(button => button.addEventListener('click', () => setDonutBlocked(button.dataset.donutBlock, button.dataset.blocked === 'true')));
  }


  function setAdminTab(tab = 'participants') {
    const donut = tab === 'donut';
    el.adminParticipantsTab?.classList.toggle('active', !donut);
    el.adminDonutTab?.classList.toggle('active', donut);
    el.adminParticipantsPanel?.classList.toggle('hidden', donut);
    el.adminDonutPanel?.classList.toggle('hidden', !donut);
  }

  function renderAdminDemoState() {
    if (el.adminDemoState) {
      el.adminDemoState.textContent = demoEnabledState ? 'ON' : 'OFF';
      el.adminDemoState.className = 'hidden';
    }
    if (el.toggleDemoButton) {
      el.toggleDemoButton.textContent = demoEnabledState ? 'DEMO: ON' : 'DEMO: OFF';
      el.toggleDemoButton.classList.toggle('active-state', demoEnabledState);
    }
  }

  async function refreshAdminPanel() {
    if (appMode !== 'admin' || !currentUser) return;

    el.adminUserStats.textContent = 'Загрузка…';
    el.adminUsersList.innerHTML = '<div class="admin-users-empty">Загружаю пользователей…</div>';
    el.adminDonutList.innerHTML = '<div class="admin-users-empty">Загружаю VK Donut…</div>';
    adminDonutLoadError = '';

    const [profilesResult, demoResult, donutResult] = await Promise.allSettled([
      fetchAdminProfiles(),
      fetchDemoEnabled(),
      fetchAdminDonutSessions()
    ]);

    if (profilesResult.status === 'fulfilled') {
      adminProfiles = profilesResult.value;
    } else {
      console.error('Email participant load failed:', profilesResult.reason);
      adminProfiles = [];
      el.adminUsersList.innerHTML = `<div class="admin-users-empty error-text">Email: ${escapeHtml(profilesResult.reason?.message || profilesResult.reason || 'ошибка загрузки')}</div>`;
    }

    if (demoResult.status === 'fulfilled') {
      demoEnabledState = demoResult.value;
    } else {
      console.error('DEMO state load failed:', demoResult.reason);
    }

    if (donutResult.status === 'fulfilled') {
      adminDonutSessions = donutResult.value;
    } else {
      console.error('Donut directory load failed:', donutResult.reason);
      adminDonutSessions = [];
      adminDonutLoadError = String(donutResult.reason?.message || donutResult.reason || 'ошибка загрузки');
    }

    renderAdminDemoState();
    renderAdminUsers();
  }

  async function openAdminPanel() {
    if (appMode !== 'admin') return;
    ensureBackupAdminControls();
    if (typeof el.adminAccessDialog.showModal === 'function') el.adminAccessDialog.showModal();

    await Promise.allSettled([
      refreshBackupRuntime(),
      refreshAdminPanel(),
      refreshStatistics()
    ]);

    renderBackupAdminState();
    renderAdminDemoState();
    renderAdminUsers();
  }

  async function toggleDemoFromAdmin() {
    if (appMode !== 'admin') return;
    el.toggleDemoButton.disabled = true;
    try {
      const next = !demoEnabledState;
      if (usesFirebaseEmergencyAuth()) {
        demoEnabledState = await window.OGE_FIREBASE_AUTH.adminSetDemo(next);
        renderAdminDemoState();
        showToast(demoEnabledState ? '✓ Публичный DEMO включён' : '✓ Публичный DEMO выключен');
        return;
      }
      const { data, error } = await supabaseClient.rpc('set_demo_enabled', { p_enabled: next });
      if (error) throw error;
      demoEnabledState = Boolean(data);
      renderAdminDemoState();
      showToast(demoEnabledState ? '✓ Публичный DEMO включён' : '✓ Публичный DEMO выключен');
    } catch (error) {
      console.error('DEMO toggle failed:', error);
      alert(`Не удалось изменить DEMO: ${error?.message || error}`);
    } finally {
      el.toggleDemoButton.disabled = false;
    }
  }

  function localDateInputValue(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function openUserAccessEditor(userId) {
    if (appMode !== 'admin') return;
    const profile = adminProfiles.find(p => p.id === userId);
    if (!profile) return;

    const self = profile.id === currentUser?.id;
    editingAccessUserId = userId;
    el.userAccessNameInput.value = profile.display_name || '';
    el.userAccessIdentityInput.value = profile.login_kind === 'vk_manual'
      ? `VK ID ${profile.vk_user_id || '—'}`
      : (profile.email || userId);
    el.userStatusSelect.value = profile.status || 'pending';
    el.userAccessLevelSelect.value = profile.access_level === 'demo' ? 'demo' : 'full';

    if (profile.access_expires_at) {
      el.userExpiryPresetSelect.value = 'custom';
      el.customExpiryDate.value = localDateInputValue(profile.access_expires_at);
      el.customExpiryLabel.classList.remove('hidden');
    } else {
      el.userExpiryPresetSelect.value = 'none';
      el.customExpiryDate.value = '';
      el.customExpiryLabel.classList.add('hidden');
    }

    // The owner may edit their display name, but cannot accidentally alter
    // their own ADMIN/FULL/status/expiry from this dialog.
    el.userStatusSelect.disabled = self;
    el.userAccessLevelSelect.disabled = self;
    el.userExpiryPresetSelect.disabled = self;
    el.customExpiryDate.disabled = self;
    el.userAccessSelfNote.classList.toggle('hidden', !self);

    if (typeof el.userAccessDialog.showModal === 'function') el.userAccessDialog.showModal();
    window.setTimeout(() => el.userAccessNameInput?.focus(), 40);
  }

  function resolveExpiryFromEditor() {
    const preset = el.userExpiryPresetSelect.value;
    if (preset === 'none') return null;

    if (preset === 'custom') {
      if (!el.customExpiryDate.value) throw new Error('Выберите дату окончания доступа.');
      const [year, month, day] = el.customExpiryDate.value.split('-').map(Number);
      const end = new Date(year, month - 1, day, 23, 59, 59, 999);
      return end.toISOString();
    }

    const days = Number(preset);
    if (![1, 3, 7].includes(days)) return null;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  async function callAdminSetUserDisplayName(profile, displayName) {
    if (usesFirebaseEmergencyAuth()) return profile;
    const { data, error } = await supabaseClient.rpc('admin_set_user_display_name', {
      p_user_id: profile.id,
      p_display_name: displayName || null
    });
    if (error) throw error;
    return data;
  }

  async function callAdminSetUserAccess(profile, nextStatus, nextLevel, nextExpiry) {
    if (usesFirebaseEmergencyAuth()) {
      return window.OGE_FIREBASE_AUTH.adminUpdateUser({
        firebase_uid: profile.id,
        status: nextStatus,
        access_level: nextLevel,
        access_expires_at: nextExpiry,
        display_name: String(el.userAccessNameInput?.value || profile.display_name || '').trim(),
      });
    }
    const { data, error } = await supabaseClient.rpc('admin_set_user_access', {
      p_user_id: profile.id,
      p_status: nextStatus,
      p_access_level: nextLevel,
      p_access_expires_at: nextExpiry
    });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  }

  async function syncLegacyDonutBlockIfLinked(profile, status) {
    if (usesFirebaseEmergencyAuth()) return;
    if (profile?.login_kind !== 'vk_manual' || !profile.vk_user_id) return;
    const legacy = adminDonutSessions.find(row => String(row.vk_user_id) === String(profile.vk_user_id));
    if (!legacy) return;
    try {
      const { error } = await supabaseClient.rpc('admin_set_donut_blocked_v096', {
        p_vk_user_id: Number(profile.vk_user_id),
        p_blocked: status === 'blocked'
      });
      if (error) throw error;
    } catch (error) {
      console.warn('Legacy Donut block sync deferred:', error);
    }
  }

  async function saveUserAccess() {
    if (appMode !== 'admin' || !editingAccessUserId) return;
    const profile = adminProfiles.find(p => p.id === editingAccessUserId);
    if (!profile) return;

    const self = profile.id === currentUser?.id;
    const displayName = String(el.userAccessNameInput.value || '').trim();
    if (displayName.length > 160) {
      alert('Имя слишком длинное: максимум 160 символов.');
      return;
    }

    el.saveUserAccessButton.disabled = true;
    try {
      if (!self) {
        const expiry = resolveExpiryFromEditor();
        await callAdminSetUserAccess(
          profile,
          el.userStatusSelect.value,
          el.userAccessLevelSelect.value,
          expiry
        );
        await syncLegacyDonutBlockIfLinked(profile, el.userStatusSelect.value);
      }

      await callAdminSetUserDisplayName(profile, displayName);

      el.userAccessDialog.close();
      editingAccessUserId = null;
      await refreshAdminPanel();
      showToast(self ? '✓ Имя администратора обновлено' : '✓ Пользователь обновлён');
    } catch (error) {
      console.error('User editor save failed:', error);
      alert(`Не удалось сохранить изменения: ${error?.message || error}`);
    } finally {
      el.saveUserAccessButton.disabled = false;
    }
  }

  async function quickSetUserStatus(userId, nextStatus) {
    if (appMode !== 'admin') return;
    const profile = adminProfiles.find(p => p.id === userId);
    if (!profile || profile.id === currentUser?.id) return;

    const label = nextStatus === 'blocked' ? 'заблокировать' : 'разрешить доступ для';
    if (!window.confirm(`${label} ${profileDisplayLabel(profile)}?`)) return;

    try {
      let expiry = profile.access_expires_at || null;
      if (nextStatus === 'active' && expiry && new Date(expiry).getTime() <= Date.now()) expiry = null;
      await callAdminSetUserAccess(profile, nextStatus, profile.access_level || 'full', expiry);
      await syncLegacyDonutBlockIfLinked(profile, nextStatus);
      await refreshAdminPanel();
      showToast(nextStatus === 'blocked' ? '✓ Пользователь заблокирован' : '✓ Доступ активирован');
    } catch (error) {
      console.error('Quick access update failed:', error);
      alert(`Не удалось изменить доступ: ${error?.message || error}`);
    }
  }

  function openManualVkAdminDialog(vkId = '', displayName = '', source = 'donut') {
    if (appMode !== 'admin') return;
    manualAdminPrefillVkId = normalizeVkId(vkId);
    const migratingLegacyDonut = Boolean(manualAdminPrefillVkId && source !== 'invite');
    el.manualVkNameInput.value = String(displayName || '');
    el.manualVkIdInput.value = manualAdminPrefillVkId;
    el.manualVkSourceSelect.value = source === 'invite' ? 'invite' : 'donut';
    el.manualVkIdInput.disabled = Boolean(manualAdminPrefillVkId);
    el.manualVkSourceSelect.disabled = migratingLegacyDonut;
    el.manualVkAdminTitle.textContent = migratingLegacyDonut ? 'Создать вход на Яндекс для Donut' : 'Создать постоянный VK-вход';
    el.createManualVkAccessButton.textContent = migratingLegacyDonut ? 'Создать вход на Яндекс' : 'Создать доступ';
    clearInlineError(el.manualVkAdminError);
    if (typeof el.manualVkAdminDialog?.showModal === 'function' && !el.manualVkAdminDialog.open) el.manualVkAdminDialog.showModal();
    window.setTimeout(() => (el.manualVkNameInput.value ? el.createManualVkAccessButton : el.manualVkNameInput)?.focus(), 40);
  }

  function credentialsMessage(result, reset = false) {
    const name = String(result.display_name || '').trim();
    const isEmail = result.login_kind === 'email_managed' || Boolean(result.email && !result.vk_user_id);
    return [
      name ? `Здравствуйте, ${name}!` : 'Здравствуйте!',
      '',
      reset ? 'Для вас создан новый временный пароль к OGE Lexical Navigator.' : 'Ваш постоянный доступ к OGE Lexical Navigator готов.',
      '',
      isEmail ? `Email: ${result.email}` : `VK ID: ${result.vk_user_id}`,
      `Временный пароль: ${result.temporary_password}`,
      '',
      `Открыть Navigator: ${PRIMARY_NAVIGATOR_URL}`,
      '',
      'Введите эти данные в обычной форме входа. При первом входе Navigator попросит придумать свой пароль и покажет код восстановления. Сохраните этот код.'
    ].join('\n');
  }

  function showAdminCredentials(result, reset = false) {
    el.adminCredentialsText.textContent = credentialsMessage(result, reset);
    if (typeof el.adminCredentialsDialog?.showModal === 'function' && !el.adminCredentialsDialog.open) el.adminCredentialsDialog.showModal();
  }

  function normalizeEmail(value) {
    const email = String(value ?? '').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320 ? email : '';
  }

  function openEmailAccessAdminDialog() {
    if (appMode !== 'admin') return;
    el.emailAccessNameInput.value = '';
    el.emailAccessEmailInput.value = '';
    el.emailAccessLevelSelect.value = 'full';
    el.emailAccessExpiryPresetSelect.value = 'none';
    el.emailAccessCustomExpiryDate.value = '';
    el.emailAccessCustomExpiryLabel.classList.add('hidden');
    clearInlineError(el.emailAccessAdminError);
    if (typeof el.emailAccessAdminDialog?.showModal === 'function' && !el.emailAccessAdminDialog.open) el.emailAccessAdminDialog.showModal();
    window.setTimeout(() => el.emailAccessNameInput?.focus(), 40);
  }

  function resolveEmailAccessExpiry() {
    const preset = el.emailAccessExpiryPresetSelect.value;
    if (preset === 'none') return null;
    if (preset === 'custom') {
      const day = el.emailAccessCustomExpiryDate.value;
      if (!day) throw new Error('Выберите дату окончания доступа.');
      return new Date(`${day}T23:59:59.999`).toISOString();
    }
    const days = Number(preset);
    if (![1, 3, 7].includes(days)) return null;
    return new Date(Date.now() + days * 86400000).toISOString();
  }

  async function createManagedEmailAccess() {
    clearInlineError(el.emailAccessAdminError);
    const email = normalizeEmail(el.emailAccessEmailInput.value);
    const displayName = el.emailAccessNameInput.value.trim();
    if (!email) return showInlineError(el.emailAccessAdminError, 'Введите корректный email.');

    el.createEmailAccessSubmitButton.disabled = true;
    try {
      if (usesFirebaseEmergencyAuth()) {
        const result = await window.OGE_FIREBASE_AUTH.adminCreateUser({
          login_kind: 'email',
          login_label: email,
          display_name: displayName || email,
          access_level: el.emailAccessLevelSelect.value,
          access_expires_at: resolveEmailAccessExpiry(),
        });
        el.emailAccessAdminDialog.close();
        await refreshAdminPanel();
        showAdminCredentials(result, false);
        return;
      }
      const token = await currentSupabaseAccessToken();
      const result = await callManualAccess({
        action: 'create_email_access',
        email,
        display_name: displayName,
        access_level: el.emailAccessLevelSelect.value,
        access_expires_at: resolveEmailAccessExpiry()
      }, token);
      el.emailAccessAdminDialog.close();
      await refreshAdminPanel();
      showAdminCredentials(result, false);
    } catch (error) {
      const mapped = manualAccessErrorText(error);
      showInlineError(el.emailAccessAdminError, mapped === 'Не удалось выполнить действие. Попробуйте ещё раз чуть позже.' ? (error?.message || mapped) : mapped);
    } finally {
      el.createEmailAccessSubmitButton.disabled = false;
    }
  }

  function downloadJsonFile(filename, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importSupabaseUsersFile(file) {
    if (!usesFirebaseEmergencyAuth() || appMode !== 'admin' || !file) return;
    let payload;
    try {
      payload = JSON.parse(await file.text());
    } catch {
      alert('Файл импорта не является корректным JSON.');
      return;
    }
    const users = Array.isArray(payload?.users) ? payload.users : [];
    if (!users.length || users.length > 100) {
      alert('В файле импорта нет пользователей или их слишком много.');
      return;
    }
    if (!window.confirm(`Перенести в Firebase пользователей: ${users.length}? Уже существующие аккаунты будут только обновлены.`)) return;

    el.importSupabaseUsersButton.disabled = true;
    el.importSupabaseUsersButton.textContent = `Импорт 0/${users.length}`;
    const results = [];
    for (let index = 0; index < users.length; index += 1) {
      const user = users[index];
      try {
        results.push({ ok: true, ...(await window.OGE_FIREBASE_AUTH.adminImportUser(user)) });
      } catch (error) {
        results.push({ ok: false, login_label: user?.login_label || '', error: error?.code || error?.message || 'import_failed' });
      }
      el.importSupabaseUsersButton.textContent = `Импорт ${index + 1}/${users.length}`;
    }
    const created = results.filter(row => row.ok && row.created).length;
    const updated = results.filter(row => row.ok && !row.created).length;
    const failed = results.filter(row => !row.ok).length;
    downloadJsonFile('OGE_FIREBASE_MIGRATION_RESULT.json', {
      migrated_at: new Date().toISOString(), created, updated, failed, users: results,
    });
    await refreshAdminPanel();
    el.importSupabaseUsersButton.disabled = false;
    el.importSupabaseUsersButton.textContent = 'Импорт Supabase';
    showToast(`✓ Импорт: создано ${created} · обновлено ${updated} · ошибок ${failed}`);
  }


  async function createManualVkAccess() {
    clearInlineError(el.manualVkAdminError);
    const vkId = normalizeVkId(el.manualVkIdInput.value);
    const displayName = el.manualVkNameInput.value.trim();
    if (!vkId) return showInlineError(el.manualVkAdminError, 'Проверьте VK ID: нужны только цифры.');
    if (!displayName) return showInlineError(el.manualVkAdminError, 'Введите имя пользователя.');

    el.createManualVkAccessButton.disabled = true;
    try {
      if (usesFirebaseEmergencyAuth()) {
        const result = await window.OGE_FIREBASE_AUTH.adminCreateUser({
          login_kind: 'vk_manual',
          login_label: vkId,
          display_name: displayName,
          access_level: 'full',
          access_expires_at: null,
        });
        el.manualVkAdminDialog.close();
        await refreshAdminPanel();
        showAdminCredentials(result, false);
        return;
      }
      const token = await currentSupabaseAccessToken();
      const result = await callManualAccess({
        action: 'create_access',
        vk_user_id: vkId,
        display_name: displayName,
        source: el.manualVkSourceSelect.value
      }, token);
      el.manualVkAdminDialog.close();
      await refreshAdminPanel();
      showAdminCredentials(result, false);
    } catch (error) {
      showInlineError(el.manualVkAdminError, manualAccessErrorText(error));
    } finally {
      el.createManualVkAccessButton.disabled = false;
    }
  }

  async function resetManualVkPassword(userId) {
    const profile = adminProfiles.find(row => row.id === userId && row.login_kind === 'vk_manual');
    if (!profile) return;
    if (!window.confirm(`Создать новый временный пароль для ${profileDisplayLabel(profile)}? Старый пароль перестанет работать.`)) return;
    try {
      if (usesFirebaseEmergencyAuth()) {
        const result = await window.OGE_FIREBASE_AUTH.adminResetPassword(profile.id);
        await refreshAdminPanel();
        showAdminCredentials({ ...profile, ...result, vk_user_id: profile.vk_user_id, login_kind: 'vk_manual' }, true);
        return;
      }
      const token = await currentSupabaseAccessToken();
      const result = await callManualAccess({ action: 'reset_password', auth_user_id: profile.id }, token);
      await refreshAdminPanel();
      showAdminCredentials(result, true);
    } catch (error) {
      alert(manualAccessErrorText(error));
    }
  }

  async function resetManagedEmailPassword(userId) {
    const profile = adminProfiles.find(row => row.id === userId && row.login_kind === 'email_managed');
    if (!profile) return;
    if (!window.confirm(`Создать новый временный пароль для ${profileDisplayLabel(profile)}? Старый пароль перестанет работать.`)) return;
    try {
      if (usesFirebaseEmergencyAuth()) {
        const result = await window.OGE_FIREBASE_AUTH.adminResetPassword(profile.id);
        await refreshAdminPanel();
        showAdminCredentials({ ...profile, ...result, email: profile.email, login_kind: 'email_managed' }, true);
        return;
      }
      const token = await currentSupabaseAccessToken();
      const result = await callManualAccess({ action: 'reset_email_password', auth_user_id: profile.id }, token);
      await refreshAdminPanel();
      showAdminCredentials(result, true);
    } catch (error) {
      alert(manualAccessErrorText(error));
    }
  }

  function copyAdminCredentials() {
    const text = el.adminCredentialsText?.textContent || '';
    if (!text) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('✓ Сообщение с доступом скопировано')).catch(() => {
        fallbackCopyText(text); showToast('✓ Сообщение с доступом скопировано');
      });
    } else {
      fallbackCopyText(text); showToast('✓ Сообщение с доступом скопировано');
    }
  }

  function openAuthDialog() {
    clearAuthError();
    if (el.authHint) el.authHint.textContent = 'Введите email или VK ID, который вы получили для доступа к Navigator.';
    updateRecoveryVisibility();
    if (typeof el.authDialog.showModal === 'function' && !el.authDialog.open) el.authDialog.showModal();
    window.setTimeout(() => el.loginIdentifier?.focus(), 40);
  }

  async function signIn() {
    clearAuthError();
    if (CONFIG.authProvider === 'firebase') {
      if (!usesFirebaseEmergencyAuth()) return showAuthError('Firebase ещё не готов. Обновите страницу через несколько секунд.');
      const identifier = String(el.loginIdentifier?.value || '').trim();
      const password = el.password.value;
      if (!identifier || !password) return showAuthError('Введите email или числовой VK ID и пароль.');
      el.signIn.disabled = true;
      try {
        const user = await window.OGE_FIREBASE_AUTH.signIn(identifier, password);
        if (el.authDialog?.open) el.authDialog.close();
        await activateFirebaseSession(user);
      } catch (error) {
        const code = String(error?.code || '');
        if (code.includes('user-disabled')) {
          if (el.authDialog?.open) el.authDialog.close();
          return showAccessEnded('Доступ заблокирован администратором.');
        }
        showAuthError(code.includes('invalid-credential')
          ? 'Неверный email / VK ID или пароль.'
          : (error?.message || 'Не удалось войти.'));
      } finally {
        el.signIn.disabled = false;
      }
      return;
    }
    if (!supabaseClient) return showAuthError('Supabase не настроен в config.js.');

    const login = resolveLoginIdentifier(el.loginIdentifier?.value || '');
    const password = el.password.value;
    if (!login || !password) return showAuthError('Введите email или числовой VK ID и пароль.');

    el.signIn.disabled = true;
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email: login.email, password });
      if (error) {
        if (String(error?.code || '') === 'user_banned') {
          el.authDialog.close();
          showAccessEnded('Ваш доступ к Navigator завершён.');
          return;
        }
        return showAuthError(/invalid login credentials/i.test(String(error?.message || ''))
          ? 'Неверный email / VK ID или пароль.'
          : authErrorText(error));
      }

      if (el.authDialog?.open) el.authDialog.close();
      if (data?.user) await activateAuthenticatedSession(data.user);
    } finally {
      el.signIn.disabled = false;
    }
  }

  function openRecoveryDialog() {
    clearInlineError(el.recoveryError);
    const identifier = String(el.loginIdentifier?.value || '').trim();
    el.recoveryVkIdInput.value = identifier;
    el.recoveryCodeInput.value = '';
    el.recoveryPasswordInput.value = '';
    el.recoveryPasswordRepeat.value = '';
    if (el.authDialog?.open) el.authDialog.close();
    if (typeof el.recoveryDialog?.showModal === 'function' && !el.recoveryDialog.open) el.recoveryDialog.showModal();
    window.setTimeout(() => (identifier ? el.recoveryCodeInput : el.recoveryVkIdInput)?.focus(), 40);
  }

  async function handlePasswordRecovery() {
    if (!usesFirebaseEmergencyAuth()) return openRecoveryDialog();
    clearAuthError();
    const identifier = String(el.loginIdentifier?.value || '').trim();
    if (!identifier) return showAuthError('Сначала введите email или числовой VK ID.');
    try {
      await window.OGE_FIREBASE_AUTH.sendPasswordReset(identifier);
      showAuthError('Письмо для смены пароля отправлено. Проверьте почту.');
    } catch (error) {
      showAuthError(error?.message || 'Не удалось отправить письмо.');
    }
  }

  function showRecoveryCode(code, continuation, recoveredLogin = null) {
    pendingRecoveryContinuation = continuation;
    pendingRecoveredLogin = recoveredLogin;
    el.recoveryCodeValue.textContent = code;
    if (el.firstPasswordDialog?.open) el.firstPasswordDialog.close();
    if (el.recoveryDialog?.open) el.recoveryDialog.close();
    if (typeof el.recoveryCodeDialog?.showModal === 'function' && !el.recoveryCodeDialog.open) {
      el.recoveryCodeDialog.showModal();
    }
  }

  async function saveFirstPassword() {
    clearInlineError(el.firstPasswordError);
    const password = el.firstPasswordInput.value;
    const repeat = el.firstPasswordRepeat.value;
    if (password.length < 10) return showInlineError(el.firstPasswordError, 'Пароль должен содержать не менее 10 символов.');
    if (password !== repeat) return showInlineError(el.firstPasswordError, 'Пароли не совпадают.');

    el.saveFirstPasswordButton.disabled = true;
    try {
      if (usesFirebaseEmergencyAuth()) {
        await window.OGE_FIREBASE_AUTH.changePassword(password);
        if (currentProfile) currentProfile.must_change_password = false;
        if (el.firstPasswordDialog?.open) el.firstPasswordDialog.close();
        await activateFirebaseSession(currentUser?.raw);
        return;
      }
      const token = await currentSupabaseAccessToken();
      const result = await callManualAccess({ action: 'set_first_password', new_password: password }, token);
      const identifier = currentProfile?.login_kind === 'vk_manual'
        ? normalizeVkId(currentProfile?.vk_user_id || '')
        : String(currentProfile?.email || '').trim();
      if (currentProfile) currentProfile.must_change_password = false;
      showRecoveryCode(result.recovery_code, 'login', identifier ? { identifier, password } : null);
    } catch (error) {
      const text = manualAccessErrorText(error);
      if (text === 'access_ended') {
        if (el.firstPasswordDialog?.open) el.firstPasswordDialog.close();
        showAccessEnded('Ваш доступ к Navigator завершён.');
      } else {
        showInlineError(el.firstPasswordError, text);
      }
    } finally {
      el.saveFirstPasswordButton.disabled = false;
    }
  }

  async function recoverPassword() {
    clearInlineError(el.recoveryError);
    const identifier = String(el.recoveryVkIdInput.value || '').trim();
    const login = resolveLoginIdentifier(identifier);
    const recoveryCode = el.recoveryCodeInput.value.trim();
    const password = el.recoveryPasswordInput.value;
    const repeat = el.recoveryPasswordRepeat.value;
    if (!login) return showInlineError(el.recoveryError, 'Введите корректный email или числовой VK ID.');
    if (!recoveryCode) return showInlineError(el.recoveryError, 'Введите код восстановления.');
    if (password.length < 10) return showInlineError(el.recoveryError, 'Пароль должен содержать не менее 10 символов.');
    if (password !== repeat) return showInlineError(el.recoveryError, 'Пароли не совпадают.');

    el.recoverPasswordButton.disabled = true;
    try {
      const result = await callManualAccess({
        action: 'recover_password',
        login_identifier: identifier,
        recovery_code: recoveryCode,
        new_password: password
      });
      showRecoveryCode(result.recovery_code, 'login', { identifier, password });
    } catch (error) {
      const text = manualAccessErrorText(error);
      if (text === 'access_ended') {
        if (el.recoveryDialog?.open) el.recoveryDialog.close();
        showAccessEnded('Ваш доступ к Navigator завершён.');
      } else {
        showInlineError(el.recoveryError, text);
      }
    } finally {
      el.recoverPasswordButton.disabled = false;
    }
  }

  async function confirmRecoveryCodeAndContinue() {
    if (el.recoveryCodeDialog?.open) el.recoveryCodeDialog.close();
    const continuation = pendingRecoveryContinuation;
    const recovered = pendingRecoveredLogin;
    pendingRecoveryContinuation = null;
    pendingRecoveredLogin = null;

    if (continuation === 'activate' && currentUser) {
      await activateAuthenticatedSession(currentUser);
      return;
    }
    if (continuation === 'login' && recovered) {
      showBoot('Вхожу в Navigator…', 'Новый пароль сохранён · открываю каталог');
      const login = resolveLoginIdentifier(recovered.identifier || '');
      if (!login) {
        showGate('gate');
        openAuthDialog();
        showAuthError('Пароль сохранён. Войдите новым паролем.');
        return;
      }
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: login.email,
        password: recovered.password
      });
      if (error) {
        showGate('gate');
        openAuthDialog();
        el.loginIdentifier.value = recovered.identifier || '';
        updateRecoveryVisibility();
        showAuthError('Пароль изменён, но автоматический вход не удался. Введите новый пароль ещё раз.');
      } else if (data?.user) {
        await activateAuthenticatedSession(data.user);
      }
    }
  }

  function copyRecoveryCode() {
    const code = el.recoveryCodeValue?.textContent || '';
    if (!code) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(() => showToast('✓ Код восстановления скопирован')).catch(() => {
        fallbackCopyText(code); showToast('✓ Код восстановления скопирован');
      });
    } else {
      fallbackCopyText(code); showToast('✓ Код восстановления скопирован');
    }
  }


  async function leaveCurrentMode() {
    if (appMode === 'donut') {
      sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}session`);
      sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}vk_user_id`);
      donutUserId = null;
      showGate('gate');
      return;
    }
    if (appMode === 'demo') {
      if (currentUser) await activateAuthenticatedSession(currentUser);
      else showGate('gate');
      return;
    }
    if (usesFirebaseEmergencyAuth() && currentUser) {
      sessionStorage.removeItem(`oge-navigator-access-session:${currentUser.id}`);
      await window.OGE_FIREBASE_AUTH.signOut();
      currentUser = null;
      currentProfile = null;
      showGate('gate');
      return;
    }
    if (supabaseClient && currentUser) {
      sessionStorage.removeItem(`oge-navigator-access-session:${currentUser.id}`);
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.error('Sign out failed:', error);
      currentUser = null;
      currentProfile = null;
      showGate('gate');
      return;
    }
    showGate('gate');
  }

  async function confirmSupabaseSessionAfterResume() {
    const first = await supabaseClient.auth.getSession();
    if (first.error) throw first.error;
    if (first.data?.session?.user) return first.data.session.user;

    // Mobile/desktop browsers may briefly restore the document before the auth
    // storage/token-refresh pipeline settles. Confirm the empty state once more
    // before replacing a visible workspace with the login gate.
    await new Promise(resolve => window.setTimeout(resolve, 320));
    const second = await supabaseClient.auth.getSession();
    if (second.error) throw second.error;
    return second.data?.session?.user || null;
  }

  async function validateCurrentDonutSessionSilently(token) {
    // `catalog` is already the protected session-aware endpoint. Asking for one
    // card validates the token without rebuilding/hiding the visible Navigator.
    await callDonutFunction({ action: 'catalog', session_token: token, offset: 0, limit: 1 });
  }

  async function recoverSessionOnResume() {
    if (!supabaseClient || resumeValidationInFlight || initialBootPending) return;
    if (appMode === 'demo' || appMode === 'password_change') return;
    resumeValidationInFlight = true;
    lastResumeValidationAt = Date.now();

    try {
      // Legacy Donut workspace is validated quietly. No boot screen, no catalog
      // reload, and no check on every quick return from a FIPI tab.
      if (appMode === 'donut') {
        const token = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}session`) || '';
        const vkUserId = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}vk_user_id`) || '';
        if (!token || !vkUserId) {
          donutUserId = null;
          showGate('gate', 'Сессия VK Donut завершена. Войдите снова.', 'warning');
          return;
        }
        try {
          await validateCurrentDonutSessionSilently(token);
          void refreshBackupRuntime();
        } catch (error) {
          if (Number(error?.status) === 401) {
            sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}session`);
            sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}vk_user_id`);
            donutUserId = null;
            showGate('gate', 'Сессия VK Donut истекла. Войдите снова.', 'warning');
          } else {
            console.warn('Donut resume validation deferred:', error);
          }
        }
        return;
      }

      const user = await confirmSupabaseSessionAfterResume();
      if (!user) {
        currentUser = null;
        currentProfile = null;
        if (!['gate','pending','blocked'].includes(appMode)) showGate('gate');
        return;
      }

      const needsActivation = currentUser?.id !== user.id || !['admin','teacher','demo_user'].includes(appMode);
      if (needsActivation) {
        await activateAuthenticatedSession(user);
        return;
      }

      // Positive access check only. A temporary network problem never replaces
      // a visible Navigator with login/boot. Only an actual blocked/expired row does.
      try {
        const profile = await fetchProfile(user.id);
        currentProfile = profile;
        if (profile.status === 'blocked') {
          showAccessEnded('Ваш доступ к Navigator завершён.');
          return;
        }
        if (profile.status !== 'active' || isProfileExpired(profile)) {
          showAccessEnded(isProfileExpired(profile) ? 'Срок доступа к Navigator закончился.' : 'Для этого аккаунта нет активного доступа к Navigator.');
          return;
        }
        if (profile.login_kind === 'vk_manual' && profile.must_change_password) {
          showForcedPasswordDialog();
          return;
        }
      } catch (error) {
        console.warn('Silent access recheck deferred:', error);
        return;
      }

      if (Date.now() - lastVisibleStatusRefreshAt >= RESUME_STATUS_RECHECK_MS) {
        lastVisibleStatusRefreshAt = Date.now();
        void loadCloudStatuses();
      }
    } catch (error) {
      console.error('Session resume check failed:', error);
      // TRUE no-flicker: network/refresh errors leave the current workspace visible.
    } finally {
      resumeValidationInFlight = false;
    }
  }

  function scheduleResumeValidation(force = false) {
    if (initialBootPending || !supabaseClient) return;
    if (!force && Date.now() - lastResumeValidationAt < RESUME_ACCESS_RECHECK_MS) return;
    if (resumeValidationTimer) window.clearTimeout(resumeValidationTimer);
    resumeValidationTimer = window.setTimeout(() => {
      resumeValidationTimer = null;
      recoverSessionOnResume();
    }, 220);
  }


  async function handleAuthStateChange(event, session) {
    const user = session?.user || null;
    if (!user) {
      if (initialBootPending) return;

      // A transient empty event is common during tab suspension/bfcache restore.
      // Never hide a working Navigator here; perform the authoritative check in
      // the background after the page is visible.
      if (appMode === 'demo' || appMode === 'donut') return;
      if (document.visibilityState === 'visible') scheduleResumeValidation();
      return;
    }

    if (appMode === 'demo' && event === 'INITIAL_SESSION') return;
    if (currentUser?.id === user.id && ['admin','teacher','demo_user','pending','blocked','password_change'].includes(appMode)) {
      if (isAuthenticatedWorkspaceMode() && Date.now() - lastVisibleStatusRefreshAt >= RESUME_STATUS_RECHECK_MS) {
        lastVisibleStatusRefreshAt = Date.now();
        void loadCloudStatuses();
      }
      return;
    }
    await activateAuthenticatedSession(user);
  }

  async function initCloud() {
    if (CONFIG.authProvider === 'firebase') {
      if (!usesFirebaseEmergencyAuth()) {
        await waitForFirebaseAdapter({
          getAdapter: () => window.OGE_FIREBASE_AUTH || null,
          target: window,
          timeoutMs: 8000
        });
      }
      if (!usesFirebaseEmergencyAuth()) {
        initialBootPending = false;
        showGate('gate', 'Вход загружается медленнее обычного. DEMO уже доступно; для входа попробуйте ещё раз через несколько секунд.', 'info');
        return false;
      }
      el.openDonutButton?.classList.add('hidden');
      el.adminAccessButton?.classList.add('hidden');
      const user = window.OGE_FIREBASE_AUTH.getSession();
      if (user) await activateFirebaseSession(user);
      window.OGE_FIREBASE_AUTH.onSessionChanged(nextUser => {
        if (nextUser && nextUser.uid !== currentUser?.id) void activateFirebaseSession(nextUser);
        if (!nextUser && currentUser) {
          currentUser = null;
          currentProfile = null;
          showGate('gate');
        }
      });
      initialBootPending = false;
      return true;
    }
    if (!isCloudConfigured()) {
      el.openLoginButton.disabled = true;
      el.openDemoButton.disabled = true;
      el.headerLoginButton.disabled = true;
      if (el.openDonutButton) el.openDonutButton.disabled = false;
      initialBootPending = false;
      showGate('gate', 'Supabase ещё не подключён. Заполните Project URL и Publishable/anon key в config.js.', 'warning');
      return false;
    }

    supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, configuredKey(), {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) console.error('Session read failed:', error);
    const user = data?.session?.user || null;
    if (user) await activateAuthenticatedSession(user);

    supabaseClient.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => handleAuthStateChange(event, session), 0);
    });
    return true;
  }

  function refreshWhenVisible() {
    if (document.visibilityState !== 'visible') return;
    if (CONFIG.authProvider === 'firebase') return;
    if (currentUser && isAuthenticatedWorkspaceMode() && Date.now() - lastVisibleStatusRefreshAt >= RESUME_STATUS_RECHECK_MS) {
      lastVisibleStatusRefreshAt = Date.now();
      void loadCloudStatuses();
    }
  }

  window.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (CONFIG.authProvider === 'firebase') return;
    if (appMode === 'donut' || (currentUser && isAuthenticatedWorkspaceMode())) {
      void refreshBackupRuntime();
    }
  }, 60000);

  // Low-frequency access check while the Navigator stays open. It is silent and
  // never shows boot; it only reacts to a confirmed blocked/expired state.
  window.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (CONFIG.authProvider === 'firebase') return;
    if (appMode === 'donut' || (currentUser && isAuthenticatedWorkspaceMode())) scheduleResumeValidation();
  }, RESUME_ACCESS_RECHECK_MS);

  el.topic.addEventListener('change', () => { populateSubtopics(); render(); });
  el.subtopic.addEventListener('change', render);
  el.bucket.addEventListener('change', () => {
    if (el.matrixViewport) el.matrixViewport.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    render();
  });
  el.status.addEventListener('change', render);
  el.search.addEventListener('input', render);
  el.reset.addEventListener('click', () => resetFilters(true));
  el.openLoginButton.addEventListener('click', openAuthDialog);
  el.openDonutButton.addEventListener('click', startDonutLogin);
  el.headerLoginButton.addEventListener('click', openAuthDialog);
  el.openDemoButton.addEventListener('click', startDemo);
  el.signOutButton.addEventListener('click', leaveCurrentMode);
  el.sourceBadge?.addEventListener('click', togglePersonalSource);
  el.signIn.addEventListener('click', signIn);
  el.password.addEventListener('keydown', e => { if (e.key === 'Enter') signIn(); });
  el.loginIdentifier?.addEventListener('keydown', e => { if (e.key === 'Enter') signIn(); });
  el.loginIdentifier?.addEventListener('input', updateRecoveryVisibility);
  el.forgotVkPasswordButton?.addEventListener('click', handlePasswordRecovery);
  el.saveFirstPasswordButton?.addEventListener('click', saveFirstPassword);
  el.firstPasswordRepeat?.addEventListener('keydown', e => { if (e.key === 'Enter') saveFirstPassword(); });
  el.recoverPasswordButton?.addEventListener('click', recoverPassword);
  el.recoveryPasswordRepeat?.addEventListener('keydown', e => { if (e.key === 'Enter') recoverPassword(); });
  el.closeRecoveryDialogButton?.addEventListener('click', () => el.recoveryDialog.close());
  el.copyRecoveryCodeButton?.addEventListener('click', copyRecoveryCode);
  el.confirmRecoveryCodeButton?.addEventListener('click', confirmRecoveryCodeAndContinue);
  el.closeAccessEndedButton?.addEventListener('click', () => el.accessEndedDialog.close());
  el.firstPasswordDialog?.addEventListener('cancel', e => e.preventDefault());
  el.recoveryCodeDialog?.addEventListener('cancel', e => e.preventDefault());


  el.adminAccessButton.addEventListener('click', openAdminPanel);
  el.closeAdminAccessDialogButton.addEventListener('click', () => el.adminAccessDialog.close());
  el.toggleDemoButton.addEventListener('click', toggleDemoFromAdmin);
  el.previewDemoButton.addEventListener('click', () => {
    el.adminAccessDialog.close();
    startDemo();
  });
  el.refreshAdminUsersButton.addEventListener('click', async () => { await Promise.allSettled([refreshAdminPanel(), refreshStatistics(), refreshBackupRuntime()]); renderBackupAdminState(); renderAdminDemoState(); renderAdminUsers(); });
  el.adminParticipantsTab?.addEventListener('click', () => setAdminTab('participants'));
  el.adminDonutTab?.addEventListener('click', () => setAdminTab('donut'));
  el.createManualVkButton?.addEventListener('click', () => openManualVkAdminDialog('', '', 'donut'));
  el.createEmailAccessButton?.addEventListener('click', openEmailAccessAdminDialog);
  el.importSupabaseUsersButton?.addEventListener('click', () => el.importSupabaseUsersInput?.click());
  el.importSupabaseUsersInput?.addEventListener('change', async () => {
    const file = el.importSupabaseUsersInput.files?.[0] || null;
    el.importSupabaseUsersInput.value = '';
    await importSupabaseUsersFile(file);
  });
  el.closeEmailAccessAdminDialogButton?.addEventListener('click', () => el.emailAccessAdminDialog.close());
  el.createEmailAccessSubmitButton?.addEventListener('click', createManagedEmailAccess);
  el.emailAccessEmailInput?.addEventListener('keydown', e => { if (e.key === 'Enter') createManagedEmailAccess(); });
  el.emailAccessExpiryPresetSelect?.addEventListener('change', () => {
    el.emailAccessCustomExpiryLabel.classList.toggle('hidden', el.emailAccessExpiryPresetSelect.value !== 'custom');
  });
  el.closeManualVkAdminDialogButton?.addEventListener('click', () => el.manualVkAdminDialog.close());
  el.createManualVkAccessButton?.addEventListener('click', createManualVkAccess);
  el.manualVkIdInput?.addEventListener('keydown', e => { if (e.key === 'Enter') createManualVkAccess(); });
  el.copyAdminCredentialsButton?.addEventListener('click', copyAdminCredentials);
  el.closeAdminCredentialsButton?.addEventListener('click', () => el.adminCredentialsDialog.close());
  el.refreshStatsButton.addEventListener('click', async () => { await refreshStatistics(); renderAdminUsers(); });
  el.statsPeriodSelect.addEventListener('change', () => {
    const custom = el.statsPeriodSelect.value === 'custom';
    el.statsFromDate.classList.toggle('hidden', !custom);
    el.statsToDate.classList.toggle('hidden', !custom);
  });

  el.closeUserAccessDialogButton.addEventListener('click', () => el.userAccessDialog.close());
  el.cancelUserAccessButton.addEventListener('click', () => el.userAccessDialog.close());
  el.saveUserAccessButton.addEventListener('click', saveUserAccess);
  el.userExpiryPresetSelect.addEventListener('change', () => {
    el.customExpiryLabel.classList.toggle('hidden', el.userExpiryPresetSelect.value !== 'custom');
  });

  document.querySelectorAll('[data-admin-contact]').forEach(link => {
    link.addEventListener('click', () => copyAdminContactText());
  });
  el.copyAdminTextButton?.addEventListener('click', copyAdminContactText);

  function scrollMatrix(direction) {
    if (!el.matrixViewport) return;
    const column = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--oge-col-width')) || 286;
    el.matrixViewport.scrollBy({ left: direction * (column + 12) * 2, top: 0, behavior: 'smooth' });
  }

  el.scrollLeftButton.addEventListener('click', () => scrollMatrix(-1));
  el.scrollRightButton.addEventListener('click', () => scrollMatrix(1));

  el.addTopicRowButton.addEventListener('click', () => {
    el.topicOverrideRows.appendChild(makeTopicRow());
  });
  el.saveTopicOverrideButton.addEventListener('click', saveTopicOverride);
  el.resetTopicOverrideButton.addEventListener('click', resetTopicOverride);
  el.closeTopicDialogButton.addEventListener('click', () => el.topicDialog.close());

  document.addEventListener('visibilitychange', () => {
    refreshWhenVisible();
    if (document.visibilityState === 'visible') scheduleResumeValidation();
  });
  window.addEventListener('pageshow', event => {
    // `persisted` is true for back-forward cache; mobile browsers are also free
    // to reload instead, so run the same safe resume check for every pageshow.
    scheduleResumeValidation();
  });
  window.addEventListener('online', () => {
    if (currentUser && isAuthenticatedWorkspaceMode()) loadCloudStatuses();
  });

  ensureBackupViewerUi();
  ensureBackupAdminControls();
  populateBuckets();
  setAdminTab('participants');

  el.footerYear.textContent = String(new Date().getFullYear());
  el.brandLogo.addEventListener('error', () => {
    if (!el.brandLogo.src.endsWith('brand-logo-fallback.svg')) el.brandLogo.src = 'assets/brand-logo-fallback.svg';
  }, { once: true });

  async function bootstrap() {
    showBoot('Открываю Navigator…', 'Восстанавливаю сохранённый вход');
    const cloudReady = await initCloud();
    if (!cloudReady) return;

    if (currentUser) {
      initialBootPending = false;
      return;
    }

    if (await processDonutCallback()) {
      initialBootPending = false;
      return;
    }

    const token = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}session`) || '';
    const vkUserId = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}vk_user_id`) || '';
    if (token && vkUserId) {
      try {
        await enterDonutSession(token, vkUserId);
        initialBootPending = false;
        return;
      } catch (error) {
        sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}session`);
        sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}vk_user_id`);
        initialBootPending = false;
        showGate('gate', 'Сессия VK Donut истекла. Войдите через VK снова.', 'warning');
        return;
      }
    }

    initialBootPending = false;
    showGate('gate');
  }


  bootstrap();
})();
