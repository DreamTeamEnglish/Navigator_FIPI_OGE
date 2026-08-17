// Navigator_FIPI_OGE v0.9.4.2 — TRUE no-flicker + dual-host VK Donut
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

  const el = {
    bootState: document.querySelector('#bootState'),
    bootMessage: document.querySelector('#bootMessage'),
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
    email: document.querySelector('#emailInput'),
    password: document.querySelector('#passwordInput'),
    signIn: document.querySelector('#signInButton'),

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
    refreshAdminUsersButton: document.querySelector('#refreshAdminUsersButton'),
    statsPeriodSelect: document.querySelector('#statsPeriodSelect'), statsFromDate: document.querySelector('#statsFromDate'), statsToDate: document.querySelector('#statsToDate'), refreshStatsButton: document.querySelector('#refreshStatsButton'), statsPeriodLabel: document.querySelector('#statsPeriodLabel'), statsVisits: document.querySelector('#statsVisits'), statsUnique: document.querySelector('#statsUnique'), statsEmail: document.querySelector('#statsEmail'), statsDonut: document.querySelector('#statsDonut'), statsChart: document.querySelector('#statsChart'),

    userAccessDialog: document.querySelector('#userAccessDialog'),
    closeUserAccessDialogButton: document.querySelector('#closeUserAccessDialogButton'),
    userAccessEmail: document.querySelector('#userAccessEmail'),
    userStatusSelect: document.querySelector('#userStatusSelect'),
    userAccessLevelSelect: document.querySelector('#userAccessLevelSelect'),
    userExpiryPresetSelect: document.querySelector('#userExpiryPresetSelect'),
    customExpiryLabel: document.querySelector('#customExpiryLabel'),
    customExpiryDate: document.querySelector('#customExpiryDate'),
    cancelUserAccessButton: document.querySelector('#cancelUserAccessButton'),
    saveUserAccessButton: document.querySelector('#saveUserAccessButton'),

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
  let initialBootPending = true;
  let resumeValidationInFlight = false;
  let resumeValidationTimer = null;

  function configuredKey() {
    return CONFIG.supabasePublishableKey || CONFIG.supabaseAnonKey || '';
  }

  function isCloudConfigured() {
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
      '<option value="all">Все 11 разделов</option>',
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

    const editButton = appMode === 'admin'
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
          <span class="oge-open-hint">ОТКРЫТЬ ↗</span>
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

    el.selectionTitle.textContent = parts.join(' · ');
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

  async function fetchFullCatalog() {
    const cards = [];
    for (let from = 0; ; from += CATALOG_PAGE_SIZE) {
      const to = from + CATALOG_PAGE_SIZE - 1;
      const { data, error } = await supabaseClient
        .from('navigator_tasks')
        .select('card')
        .order('fipi_id', { ascending: true })
        .range(from, to);
      if (error) throw error;
      const page = data || [];
      cards.push(...page.map(row => row.card).filter(Boolean));
      if (page.length < CATALOG_PAGE_SIZE) break;
    }
    return cards;
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

  async function fetchProfile(userId) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id,email,role,status,access_level,access_expires_at,created_at,updated_at')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  function setSecureBadge() {
    if (appMode === 'admin') setBadge('live', 'ADMIN · SECURE', 'Полный защищённый доступ администратора');
    else if (appMode === 'teacher') setBadge('live', 'TEACHER · SECURE', 'Полный защищённый доступ учителя');
    else if (appMode === 'demo_user') setBadge('demo', 'DEMO · INVITED', 'Персональный ограниченный доступ по приглашению');
    else if (appMode === 'donut') setBadge('live', 'VK DONUT · ACTIVE', 'Подписка VK Donut проверена на сервере');
  }

  function enterApp(mode) {
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
    render();
  }

  function showGate(mode = 'gate', message = '', kind = 'info') {
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
    el.signOutButton.textContent = 'Выйти';
    setBadge('protected', 'PROTECTED', 'Каталог защищён Supabase Auth + RLS');
    if (message) showAccessMessage(message, kind);
    else clearAccessMessage();
  }

  function showBoot(message = 'Загружаю Navigator…') {
    appMode = 'boot';
    document.body.classList.remove('oge-workspace-mode');
    el.appShell.classList.add('hidden');
    el.accessGate.classList.add('hidden');
    el.headerLoginButton.classList.add('hidden');
    el.signOutButton.classList.add('hidden');
    el.adminAccessButton.classList.add('hidden');
    if (el.bootMessage) el.bootMessage.textContent = message;
    if (el.bootState) el.bootState.classList.remove('hidden');
    clearAccessMessage();
  }

  async function startDemo() {
    clearAccessMessage();
    if (!supabaseClient) {
      showAccessMessage('Подключение Supabase не настроено. Сначала заполните config.js.', 'error');
      return;
    }

    el.openDemoButton.disabled = true;
    el.openDemoButton.textContent = 'Открываю DEMO…';
    try {
      const { data, error } = await supabaseClient.rpc('get_demo_tasks');
      if (error) throw error;
      const cards = (data || []).map(row => row.card).filter(Boolean);

      if (!cards.length) {
        const { data: enabled, error: enabledError } = await supabaseClient.rpc('demo_is_enabled');
        if (enabledError) throw enabledError;
        if (!enabled) showAccessMessage('Демо-доступ временно недоступен.', 'warning');
        else showAccessMessage('Демо-подборка пока не настроена.', 'warning');
        return;
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
    const { error } = await supabaseClient.rpc('record_navigator_access', { p_session_id: sessionId, p_access_level: accessLevel });
    if (error) console.error('Access event save failed:', error);
  }

  async function activateAuthenticatedSession(user) {
    currentUser = user;
    currentProfile = null;
    showBoot('Проверяю доступ…');

    try {
      const profile = await fetchProfile(user.id);
      currentProfile = profile;

      if (profile.status === 'pending') {
        showGate('pending', 'Доступ ожидает подтверждения администратора.', 'warning');
        return;
      }
      if (profile.status === 'blocked') {
        showGate('blocked', 'Доступ к Navigator приостановлен.', 'error');
        return;
      }
      if (profile.status !== 'active' || !['admin', 'teacher'].includes(profile.role)) {
        showGate('blocked', 'Для этого аккаунта нет активного доступа к каталогу.', 'error');
        return;
      }
      if (isProfileExpired(profile)) {
        showGate('blocked', 'Срок доступа завершён. Обратитесь к администратору.', 'warning');
        return;
      }

      records = loadCloudCache(user.id);

      if (profile.role === 'teacher' && profile.access_level === 'demo') {
        const { data, error } = await supabaseClient.rpc('get_demo_tasks');
        if (error) throw error;
        const cards = (data || []).map(row => row.card).filter(Boolean);
        if (!cards.length) throw new Error('Персональная DEMO-подборка недоступна.');
        setTasks(cards, new Map());
        enterApp('demo_user');
        await recordEmailAccess('demo');
        await loadCloudStatuses();
        return;
      }

      if (profile.access_level !== 'full') {
        showGate('blocked', 'Для этого аккаунта нет полного доступа к каталогу.', 'error');
        return;
      }

      const [cards, overrides] = await Promise.all([
        fetchFullCatalog(),
        fetchTopicOverrides()
      ]);
      if (cards.length !== 1735) {
        console.warn(`Protected catalog returned ${cards.length} cards; expected 1735.`);
      }
      setTasks(cards, overrides);
      enterApp(profile.role === 'admin' ? 'admin' : 'teacher');
      await recordEmailAccess(profile.role === 'admin' ? 'admin' : 'full');
      await loadCloudStatuses();
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
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id,email,role,status,access_level,access_expires_at,created_at,updated_at')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function fetchAdminDonutSessions() {
    const { data } = await supabaseClient.auth.getSession();
    const token = data?.session?.access_token || '';
    if (!token) return [];
    const result = await callDonutFunction({ action: 'admin_sessions' }, token);
    return Array.isArray(result.sessions) ? result.sessions : [];
  }

  async function revokeDonutSession(vkUserId) {
    if (!window.confirm(`Завершить активную Donut-сессию VK ID ${vkUserId}?`)) return;
    const { data } = await supabaseClient.auth.getSession();
    await callDonutFunction({ action: 'admin_revoke', vk_user_id: Number(vkUserId) }, data?.session?.access_token || '');
    await refreshAdminPanel();
  }

  async function setDonutBlocked(vkUserId, blocked) {
    const label = blocked ? 'Заблокировать' : 'Разблокировать';
    if (!window.confirm(`${label} VK ID ${vkUserId}?`)) return;
    const { data } = await supabaseClient.auth.getSession();
    await callDonutFunction({ action: 'admin_set_blocked', vk_user_id: Number(vkUserId), blocked }, data?.session?.access_token || '');
    await refreshAdminPanel();
  }

  async function fetchDemoEnabled() {
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
    if (!rows.length) { el.statsChart.innerHTML = '<div class="admin-users-empty">Данных пока нет.</div>'; return; }
    const w=760,h=210,px=34,py=24,max=Math.max(1,...rows.map(r=>Number(r.visits)||0));
    const pts=rows.map((r,i)=>({x:px+(rows.length===1?0:i*(w-px*2)/(rows.length-1)),y:h-py-(Number(r.visits)||0)*(h-py*2)/max,v:Number(r.visits)||0,d:String(r.day)}));
    el.statsChart.innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="img"><line x1="${px}" y1="${h-py}" x2="${w-px}" y2="${h-py}" class="stats-axis"/><polyline points="${pts.map(p=>`${p.x},${p.y}`).join(' ')}" class="stats-line"/>${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3" class="stats-dot"><title>${escapeHtml(p.d)}: ${p.v}</title></circle>`).join('')}</svg>`;
  }

  async function refreshStatistics() {
    if (appMode !== 'admin') return;
    const {from,to}=statsRange();
    el.statsPeriodLabel.textContent=`${from.toLocaleDateString('ru-RU')} — ${to.toLocaleDateString('ru-RU')}`;
    const {data,error}=await supabaseClient.rpc('admin_navigator_stats',{p_from:from.toISOString(),p_to:to.toISOString()});
    if(error) throw error; const s=data||{};
    el.statsVisits.textContent=s.visits||0; el.statsUnique.textContent=s.unique_users||0; el.statsEmail.textContent=s.email_visits||0; el.statsDonut.textContent=s.donut_visits||0;
    adminStatsUsers=new Map((s.users||[]).map(r=>[`${r.user_kind}:${r.user_key}`,r])); renderStatsChart(s.daily||[]);
  }

  function renderAdminUsers() {
    const rows = adminProfiles;
    const active = rows.filter(p => p.status === 'active' && !isProfileExpired(p)).length;
    const pending = rows.filter(p => p.status === 'pending').length;
    const blocked = rows.filter(p => p.status === 'blocked').length;
    const activeDonuts = adminDonutSessions.filter(row => row.session_expires_at && !row.blocked).length;

    el.adminUserStats.textContent = `Email: ${rows.length} · Active: ${active} · Pending: ${pending} · Blocked: ${blocked} · VK Donut: ${adminDonutSessions.length}`;
    if (el.adminParticipantsBadge) el.adminParticipantsBadge.textContent = String(rows.length);
    if (el.adminDonutBadge) el.adminDonutBadge.textContent = String(adminDonutSessions.length);

    el.adminUsersList.innerHTML = rows.length ? rows.map(profile => {
      const self = profile.id === currentUser?.id;
      const activity = adminStatsUsers.get(`email:${profile.id}`);
      const expired = isProfileExpired(profile);
      const statusClass = expired ? 'blocked' : (profile.status || 'pending');
      const levelClass = profile.access_level === 'demo' ? 'demo' : 'full';
      const joined = profile.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : '—';
      const expiry = formatAccessExpiry(profile.access_expires_at);
      const visits = activity?.login_count || 0;
      let actions = '<span class="admin-self-note">Ваш аккаунт</span>';
      if (!self) {
        const nextStatus = profile.status === 'blocked' ? 'active' : 'blocked';
        actions = `<button class="admin-mini-button" type="button" data-user-edit="${escapeAttr(profile.id)}">Изменить</button><button class="admin-mini-button ${profile.status === 'blocked' ? 'success-soft' : 'danger-soft'}" type="button" data-user-quick="${escapeAttr(profile.id)}" data-next-status="${escapeAttr(nextStatus)}">${profile.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}</button>`;
      }
      return `<article class="admin-user-card${self ? ' self' : ''}"><div class="admin-user-main"><div class="admin-user-name">${escapeHtml(profile.email || profile.id)}</div><div class="admin-user-chips"><span class="admin-chip">EMAIL</span><span class="admin-chip ${levelClass}">${escapeHtml(accessDisplay(profile.access_level))}</span><span class="admin-chip ${statusClass}">${expired ? 'EXPIRED' : escapeHtml(statusDisplay(profile.status))}</span>${profile.role === 'admin' ? '<span class="admin-chip admin-role">ADMIN</span>' : ''}</div></div><div class="admin-user-info"><span>Добавлен: <strong>${escapeHtml(joined)}</strong></span><span>Срок: <strong>${escapeHtml(expiry)}</strong></span></div><div class="admin-user-info"><span>Входов за период: <strong>${escapeHtml(visits)}</strong></span><span>Источник: <strong>${profile.role === 'admin' ? 'admin' : 'invite'}</strong></span></div><div class="admin-user-actions">${actions}</div></article>`;
    }).join('') : '<div class="admin-users-empty">Email-пользователей пока нет.</div>';

    const donuts = adminDonutSessions;
    el.adminDonutList.innerHTML = donuts.length ? donuts.map(row => {
      const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || `VK ID ${row.vk_user_id}`;
      const firstSeen = row.first_seen_at ? new Date(row.first_seen_at).toLocaleString('ru-RU') : '—';
      const verified = row.last_verified_at ? new Date(row.last_verified_at).toLocaleString('ru-RU') : '—';
      const sessionActive = Boolean(row.session_expires_at) && new Date(row.session_expires_at).getTime() > Date.now();
      const sessionText = sessionActive ? `до ${new Date(row.session_expires_at).toLocaleString('ru-RU')}` : 'нет активной сессии';
      const activity = adminStatsUsers.get(`donut:${row.vk_user_id}`);
      return `<article class="admin-user-card${sessionActive ? ' online-now' : ''}"><div class="admin-user-main"><div class="admin-user-name">${escapeHtml(name)}</div><div class="admin-user-id">VK ID ${escapeHtml(row.vk_user_id)}</div><div class="admin-user-chips"><span class="admin-chip">VK DONUT</span><span class="admin-chip full">FULL</span><span class="admin-chip ${row.blocked ? 'blocked' : row.last_don_status ? 'active' : 'pending'}">${row.blocked ? 'BLOCKED' : row.last_don_status ? 'DONUT ACTIVE' : 'NOT ACTIVE'}</span>${sessionActive ? '<span class="admin-chip active">SESSION</span>' : ''}</div></div><div class="admin-user-info"><span>Впервые: <strong>${escapeHtml(firstSeen)}</strong></span><span>Проверка: <strong>${escapeHtml(verified)}</strong></span></div><div class="admin-user-info"><span>Сессия: <strong>${escapeHtml(sessionText)}</strong></span><span>Входов за период: <strong>${escapeHtml(activity?.login_count || 0)}</strong></span></div><div class="admin-user-actions">${sessionActive ? `<button class="admin-mini-button" type="button" data-donut-revoke="${escapeAttr(row.vk_user_id)}">Завершить сессию</button>` : ''}<button class="admin-mini-button ${row.blocked ? 'success-soft' : 'danger-soft'}" type="button" data-donut-block="${escapeAttr(row.vk_user_id)}" data-blocked="${row.blocked ? 'false' : 'true'}">${row.blocked ? 'Разблокировать' : 'Заблокировать'}</button></div></article>`;
    }).join('') : '<div class="admin-users-empty">VK Donut-пользователей пока нет.</div>';

    el.adminUsersList.querySelectorAll('[data-user-edit]').forEach(button => button.addEventListener('click', () => openUserAccessEditor(button.dataset.userEdit)));
    el.adminUsersList.querySelectorAll('[data-user-quick]').forEach(button => button.addEventListener('click', () => quickSetUserStatus(button.dataset.userQuick, button.dataset.nextStatus)));
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
    el.adminDemoState.textContent = demoEnabledState ? '● Включено' : '○ Выключено';
    el.adminDemoState.className = demoEnabledState ? 'demo-state on' : 'demo-state off';
    el.toggleDemoButton.textContent = demoEnabledState ? 'Выключить' : 'Включить';
  }

  async function refreshAdminPanel() {
    if (appMode !== 'admin' || !currentUser) return;
    el.adminUserStats.textContent = 'Загрузка…';
    el.adminUsersList.innerHTML = '<div class="admin-users-empty">Загружаю пользователей…</div>';
    el.adminDonutList.innerHTML = '<div class="admin-users-empty">Загружаю VK Donut…</div>';
    try {
      const [profiles, enabled, donutSessions] = await Promise.all([
        fetchAdminProfiles(),
        fetchDemoEnabled(),
        fetchAdminDonutSessions()
      ]);
      adminProfiles = profiles;
      adminDonutSessions = donutSessions;
      demoEnabledState = enabled;
      renderAdminDemoState();
      renderAdminUsers();
    } catch (error) {
      console.error('Admin panel refresh failed:', error);
      el.adminUserStats.textContent = 'Не удалось загрузить данные';
      const html = `<div class="admin-users-empty error-text">${escapeHtml(error?.message || error)}</div>`;
      el.adminUsersList.innerHTML = html;
      el.adminDonutList.innerHTML = html;
    }
  }

  async function openAdminPanel() {
    if (appMode !== 'admin') return;
    if (typeof el.adminAccessDialog.showModal === 'function') el.adminAccessDialog.showModal();
    await Promise.all([refreshAdminPanel(), refreshStatistics()]);
    renderAdminUsers();
  }

  async function toggleDemoFromAdmin() {
    if (appMode !== 'admin') return;
    el.toggleDemoButton.disabled = true;
    try {
      const next = !demoEnabledState;
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
    if (!profile || profile.id === currentUser?.id) return;

    editingAccessUserId = userId;
    el.userAccessEmail.textContent = profile.email || userId;
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

    if (typeof el.userAccessDialog.showModal === 'function') el.userAccessDialog.showModal();
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

  async function callAdminSetUserAccess(profile, nextStatus, nextLevel, nextExpiry) {
    const { data, error } = await supabaseClient.rpc('admin_set_user_access', {
      p_user_id: profile.id,
      p_status: nextStatus,
      p_access_level: nextLevel,
      p_access_expires_at: nextExpiry
    });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  }

  async function saveUserAccess() {
    if (appMode !== 'admin' || !editingAccessUserId) return;
    const profile = adminProfiles.find(p => p.id === editingAccessUserId);
    if (!profile) return;

    el.saveUserAccessButton.disabled = true;
    try {
      const expiry = resolveExpiryFromEditor();
      await callAdminSetUserAccess(
        profile,
        el.userStatusSelect.value,
        el.userAccessLevelSelect.value,
        expiry
      );
      el.userAccessDialog.close();
      editingAccessUserId = null;
      await refreshAdminPanel();
      showToast('✓ Доступ пользователя обновлён');
    } catch (error) {
      console.error('User access save failed:', error);
      alert(`Не удалось изменить доступ: ${error?.message || error}`);
    } finally {
      el.saveUserAccessButton.disabled = false;
    }
  }

  async function quickSetUserStatus(userId, nextStatus) {
    if (appMode !== 'admin') return;
    const profile = adminProfiles.find(p => p.id === userId);
    if (!profile || profile.id === currentUser?.id) return;

    const label = nextStatus === 'blocked' ? 'заблокировать' : 'разрешить доступ для';
    if (!window.confirm(`${label} ${profile.email || 'этого пользователя'}?`)) return;

    try {
      let expiry = profile.access_expires_at || null;
      if (nextStatus === 'active' && expiry && new Date(expiry).getTime() <= Date.now()) expiry = null;
      await callAdminSetUserAccess(profile, nextStatus, profile.access_level || 'full', expiry);
      await refreshAdminPanel();
      showToast(nextStatus === 'blocked' ? '✓ Пользователь заблокирован' : '✓ Доступ активирован');
    } catch (error) {
      console.error('Quick access update failed:', error);
      alert(`Не удалось изменить доступ: ${error?.message || error}`);
    }
  }

  function openAuthDialog() {
    clearAuthError();
    el.authHint.textContent = 'Введите email и пароль приглашённого аккаунта.';
    if (typeof el.authDialog.showModal === 'function') el.authDialog.showModal();
  }

  async function signIn() {
    clearAuthError();
    if (!supabaseClient) return showAuthError('Supabase не настроен в config.js.');
    const email = el.email.value.trim();
    const password = el.password.value;
    if (!email || !password) return showAuthError('Введите email и пароль.');

    el.signIn.disabled = true;
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) return showAuthError(authErrorText(error));
      el.authDialog.close();
    } finally {
      el.signIn.disabled = false;
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
    resumeValidationInFlight = true;

    try {
      // Donut workspace: validate in the background. Never call enterDonutSession
      // here because it intentionally shows the boot screen and reloads catalog.
      if (appMode === 'donut') {
        const token = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}session`) || '';
        const vkUserId = sessionStorage.getItem(`${DONUT_STORAGE_PREFIX}vk_user_id`) || '';
        if (!token || !vkUserId) {
          donutUserId = null;
          showGate('gate', 'Сессия VK Donut завершена. Войдите через VK снова.', 'warning');
          return;
        }
        try {
          await validateCurrentDonutSessionSilently(token);
        } catch (error) {
          if (Number(error?.status) === 401) {
            sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}session`);
            sessionStorage.removeItem(`${DONUT_STORAGE_PREFIX}vk_user_id`);
            donutUserId = null;
            showGate('gate', 'Сессия VK Donut истекла. Войдите через VK снова.', 'warning');
          } else {
            console.warn('Donut resume validation deferred:', error);
            // Offline/server hiccup: keep the already-open Navigator visible.
          }
        }
        return;
      }

      if (appMode === 'demo') return;

      const user = await confirmSupabaseSessionAfterResume();
      if (user) {
        const needsActivation = currentUser?.id !== user.id || !['admin','teacher','demo_user'].includes(appMode);
        if (needsActivation) await activateAuthenticatedSession(user);
        else if (isAuthenticatedWorkspaceMode()) await loadCloudStatuses();
        return;
      }

      // Only now, after a double confirmation, is the session truly absent.
      currentUser = null;
      currentProfile = null;
      if (!['gate','pending','blocked'].includes(appMode)) showGate('gate');
    } catch (error) {
      console.error('Session resume check failed:', error);
      // TRUE no-flicker: temporary network/refresh errors never replace a visible
      // Navigator with boot/login. The current screen stays untouched.
    } finally {
      resumeValidationInFlight = false;
    }
  }

  function scheduleResumeValidation() {
    if (initialBootPending || !supabaseClient) return;
    if (resumeValidationTimer) window.clearTimeout(resumeValidationTimer);
    resumeValidationTimer = window.setTimeout(() => {
      resumeValidationTimer = null;
      recoverSessionOnResume();
    }, 120);
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
    if (currentUser?.id === user.id && ['admin','teacher','demo_user','pending','blocked'].includes(appMode)) {
      if (isAuthenticatedWorkspaceMode()) void loadCloudStatuses();
      return;
    }
    await activateAuthenticatedSession(user);
  }

  async function initCloud() {
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
    if (document.visibilityState === 'visible' && currentUser && isAuthenticatedWorkspaceMode()) {
      loadCloudStatuses();
    }
  }

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
  el.signIn.addEventListener('click', signIn);
  el.password.addEventListener('keydown', e => { if (e.key === 'Enter') signIn(); });


  el.adminAccessButton.addEventListener('click', openAdminPanel);
  el.closeAdminAccessDialogButton.addEventListener('click', () => el.adminAccessDialog.close());
  el.toggleDemoButton.addEventListener('click', toggleDemoFromAdmin);
  el.previewDemoButton.addEventListener('click', () => {
    el.adminAccessDialog.close();
    startDemo();
  });
  el.refreshAdminUsersButton.addEventListener('click', async () => { await Promise.all([refreshAdminPanel(), refreshStatistics()]); renderAdminUsers(); });
  el.adminParticipantsTab?.addEventListener('click', () => setAdminTab('participants'));
  el.adminDonutTab?.addEventListener('click', () => setAdminTab('donut'));
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

  populateBuckets();
  setAdminTab('participants');

  el.footerYear.textContent = String(new Date().getFullYear());
  el.brandLogo.addEventListener('error', () => {
    if (!el.brandLogo.src.endsWith('brand-logo-fallback.svg')) el.brandLogo.src = 'assets/brand-logo-fallback.svg';
  }, { once: true });

  async function bootstrap() {
    showBoot('Загружаю Navigator…');
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
