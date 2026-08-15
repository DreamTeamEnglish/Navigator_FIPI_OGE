(() => {
  'use strict';

  const DATA = window.OGE_DATA || { topics: [], buckets: [], tasks: [] };
  const CONFIG = window.OGE_CONFIG || {};
  const DEMO_STATUS_KEY = 'oge-navigator-demo-status-v090';
  const CLOUD_CACHE_PREFIX = 'oge-navigator-teacher-cache-v090:';
  const PENDING_PREFIX = 'oge-navigator-pending-v090:';
  const CATALOG_PAGE_SIZE = 1000;
  const UNTAGGED_TOPIC_ID = '__untagged__';

  const el = {
    accessGate: document.querySelector('#accessGate'),
    appShell: document.querySelector('#appShell'),
    accessMessage: document.querySelector('#accessMessage'),
    openLoginButton: document.querySelector('#openLoginButton'),
    openDemoButton: document.querySelector('#openDemoButton'),
    headerLoginButton: document.querySelector('#headerLoginButton'),
    signOutButton: document.querySelector('#signOutButton'),
    cloudBadge: document.querySelector('#cloudBadge'),
    modeKicker: document.querySelector('#modeKicker'),
    brandLogo: document.querySelector('#brandLogo'),
    footerYear: document.querySelector('#footerYear'),

    topic: document.querySelector('#topicSelect'),
    subtopic: document.querySelector('#subtopicSelect'),
    status: document.querySelector('#statusSelect'),
    search: document.querySelector('#searchInput'),
    reset: document.querySelector('#resetButton'),
    matrix: document.querySelector('#matrix'),
    empty: document.querySelector('#emptyState'),
    selectionTitle: document.querySelector('#selectionTitle'),
    visibleCount: document.querySelector('#visibleCount'),
    viewedCount: document.querySelector('#viewedCount'),
    usedCount: document.querySelector('#usedCount'),

    authDialog: document.querySelector('#authDialog'),
    authHint: document.querySelector('#authHint'),
    authError: document.querySelector('#authError'),
    email: document.querySelector('#emailInput'),
    password: document.querySelector('#passwordInput'),
    signIn: document.querySelector('#signInButton'),

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
  let appMode = 'gate'; // gate | demo | admin | teacher | pending | blocked
  let tasks = [];
  let baseCards = [];
  let overrideMap = new Map();
  let editingTaskId = null;
  let records = {};
  let refreshInFlight = false;

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
    if (currentUser && (appMode === 'admin' || appMode === 'teacher')) {
      localStorage.setItem(cacheKey(currentUser.id), JSON.stringify(records));
    } else if (appMode === 'demo') {
      localStorage.setItem(DEMO_STATUS_KEY, JSON.stringify(records));
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

  function filterTasks() {
    const topic = el.topic.value || 'all';
    const subtopic = el.subtopic.value || 'all';
    const status = el.status.value || 'all';
    const search = el.search.value.trim().toLowerCase();

    return tasks.filter(task => {
      const taskStatus = getStatus(taskKey(task));
      const topicMatch = topic === 'all'
        || (topic === UNTAGGED_TOPIC_ID ? task.tags.length === 0 : task.tags.some(tag => tag.topic === topic));
      const subtopicMatch = subtopic === 'all'
        || (topic !== UNTAGGED_TOPIC_ID && task.tags.some(tag => tag.topic === topic && tag.subtopic === subtopic));
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
      return topicMatch && subtopicMatch && statusMatch && searchMatch;
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
      return `<span class="task-tag${manual ? ' manual-tag' : ''}" title="${escapeAttr([manual, confidence].filter(Boolean).join(' · '))}">${escapeHtml(label)}${escapeHtml(detail)}</span>`;
    }).join('');

    const noTopic = !topicNames ? '<span class="task-tag muted-tag">Без тематической метки</span>' : '';
    const kes = task.liveKesCode ? `КЭС ${task.liveKesCode}` : 'КЭС —';
    const editButton = appMode === 'admin'
      ? `<button class="topic-edit-button" type="button" data-edit-topic="${escapeAttr(key)}" title="Изменить темы и подтемы">✎</button>`
      : '';
    const manualMarker = task._override
      ? `<span class="manual-marker" title="Есть ручная тематическая правка">ручная</span>`
      : '';

    return `<article class="task-card">
      <div class="task-main">
        <a class="task-link" href="${escapeAttr(task.url)}" target="_blank" rel="noopener noreferrer" title="Открыть исходное задание на ФИПИ">${escapeHtml(task.fipiId)} ↗</a>
        <div class="task-actions">
          <button class="status-toggle" type="button" data-task="${escapeAttr(key)}" data-status="${escapeAttr(status)}" title="Статус: ${escapeAttr(statusLabel(status))}. Нажмите, чтобы переключить."></button>
        </div>
      </div>
      <div class="task-meta-row">
        <div class="task-title">${escapeHtml(kes)} ${manualMarker}</div>
        ${editButton}
      </div>
      <div class="task-tags">${topicNames}${noTopic}</div>
    </article>`;
  }

  function updateStats(visibleTasks) {
    el.visibleCount.textContent = visibleTasks.length;
    el.viewedCount.textContent = visibleTasks.filter(t => getStatus(taskKey(t)) === 'viewed').length;
    el.usedCount.textContent = visibleTasks.filter(t => getStatus(taskKey(t)) === 'used').length;
  }

  function updateSelection() {
    const topic = DATA.topics.find(t => t.id === el.topic.value);
    const topicName = topic?.name || 'Все темы';
    const subtopic = el.subtopic.value;
    el.selectionTitle.textContent = subtopic === 'all' ? topicName : `${topicName} → ${subtopic}`;
  }

  function render() {
    if (appMode === 'gate' || appMode === 'pending' || appMode === 'blocked') return;

    const visibleTasks = filterTasks();
    const byBucket = Object.fromEntries(DATA.buckets.map(b => [b.id, []]));
    for (const task of visibleTasks) if (byBucket[task.bucket]) byBucket[task.bucket].push(task);

    el.matrix.innerHTML = DATA.buckets.map(bucket => {
      const cards = byBucket[bucket.id];
      return `<section class="bucket">
        <div class="bucket-head">
          <div class="bucket-section">${escapeHtml(bucket.section)}</div>
          <h4>${escapeHtml(bucket.title)}</h4>
          <span class="bucket-range">${escapeHtml(bucket.range)}</span>
        </div>
        <div class="bucket-body">
          ${cards.length ? cards.map(taskCard).join('') : '<div class="bucket-empty">—</div>'}
        </div>
      </section>`;
    }).join('');

    el.empty.classList.toggle('hidden', visibleTasks.length !== 0);
    updateStats(visibleTasks);
    updateSelection();

    document.querySelectorAll('.status-toggle').forEach(button => {
      button.addEventListener('click', () => setStatus(button.dataset.task, nextStatus(button.dataset.status)));
    });
    document.querySelectorAll('[data-edit-topic]').forEach(button => {
      button.addEventListener('click', () => openTopicEditor(button.dataset.editTopic));
    });
  }

  function resetFilters(doRender = true) {
    if (el.topic.options.length) el.topic.value = 'all';
    populateSubtopics();
    el.subtopic.value = 'all';
    el.status.value = 'all';
    el.search.value = '';
    if (doRender) render();
  }

  async function setStatus(taskId, status) {
    const localTime = new Date().toISOString();
    records[taskId] = { status, updatedAt: localTime };
    saveActiveRecords();
    render();

    if (!supabaseClient || !currentUser || !(appMode === 'admin' || appMode === 'teacher')) return;

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
      .select('id,email,role,status')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  function setSecureBadge() {
    if (appMode === 'admin') setBadge('live', 'ADMIN · SECURE', 'Полный защищённый доступ администратора');
    else if (appMode === 'teacher') setBadge('live', 'TEACHER · SECURE', 'Полный защищённый доступ учителя');
  }

  function enterApp(mode) {
    appMode = mode;
    clearAccessMessage();
    el.accessGate.classList.add('hidden');
    el.appShell.classList.remove('hidden');
    el.headerLoginButton.classList.add('hidden');
    el.signOutButton.classList.remove('hidden');

    if (mode === 'demo') {
      el.modeKicker.textContent = 'DEMO · 44 CURATED TASKS';
      el.signOutButton.textContent = 'Выйти из DEMO';
      setBadge('demo', `DEMO · ${tasks.length}`, 'Ограниченная демонстрационная выборка');
    } else {
      el.modeKicker.textContent = 'LEXICAL FIRST';
      el.signOutButton.textContent = 'Выйти';
      setSecureBadge();
    }
    render();
  }

  function showGate(mode = 'gate', message = '', kind = 'info') {
    appMode = mode;
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
    el.signOutButton.textContent = 'Выйти';
    setBadge('protected', 'PROTECTED', 'Каталог защищён Supabase Auth + RLS');
    if (message) showAccessMessage(message, kind);
    else clearAccessMessage();
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

  async function activateAuthenticatedSession(user) {
    currentUser = user;
    currentProfile = null;
    showGate('gate');
    showAccessMessage('Проверяю доступ…', 'info');

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

      const [cards, overrides] = await Promise.all([
        fetchFullCatalog(),
        fetchTopicOverrides()
      ]);
      if (cards.length !== 1735) {
        console.warn(`Protected catalog returned ${cards.length} cards; expected 1735.`);
      }
      records = loadCloudCache(user.id);
      setTasks(cards, overrides);
      enterApp(profile.role === 'admin' ? 'admin' : 'teacher');
      await loadCloudStatuses();
    } catch (error) {
      console.error('Access activation failed:', error);
      showGate('blocked', 'Не удалось проверить доступ к защищённому каталогу. Попробуйте позже.', 'error');
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
    if (appMode === 'demo') {
      if (currentUser) await activateAuthenticatedSession(currentUser);
      else showGate('gate');
      return;
    }
    if (supabaseClient && currentUser) {
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.error('Sign out failed:', error);
      return;
    }
    showGate('gate');
  }

  async function handleAuthStateChange(event, session) {
    const user = session?.user || null;
    if (!user) {
      currentUser = null;
      currentProfile = null;
      if (appMode !== 'demo') showGate('gate');
      return;
    }

    if (appMode === 'demo' && event === 'INITIAL_SESSION') return;
    if (currentUser?.id === user.id && ['admin','teacher','pending','blocked'].includes(appMode) && event === 'INITIAL_SESSION') return;
    await activateAuthenticatedSession(user);
  }

  async function initCloud() {
    if (!isCloudConfigured()) {
      el.openLoginButton.disabled = true;
      el.openDemoButton.disabled = true;
      el.headerLoginButton.disabled = true;
      showGate('gate', 'Supabase ещё не подключён. Заполните Project URL и Publishable/anon key в config.js.', 'warning');
      return;
    }

    supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, configuredKey(), {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) console.error('Session read failed:', error);
    const user = data?.session?.user || null;
    if (user) await activateAuthenticatedSession(user);
    else showGate('gate');

    supabaseClient.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => handleAuthStateChange(event, session), 0);
    });
  }

  function refreshWhenVisible() {
    if (document.visibilityState === 'visible' && currentUser && (appMode === 'admin' || appMode === 'teacher')) {
      loadCloudStatuses();
    }
  }

  el.topic.addEventListener('change', () => { populateSubtopics(); render(); });
  el.subtopic.addEventListener('change', render);
  el.status.addEventListener('change', render);
  el.search.addEventListener('input', render);
  el.reset.addEventListener('click', () => resetFilters(true));
  el.openLoginButton.addEventListener('click', openAuthDialog);
  el.headerLoginButton.addEventListener('click', openAuthDialog);
  el.openDemoButton.addEventListener('click', startDemo);
  el.signOutButton.addEventListener('click', leaveCurrentMode);
  el.signIn.addEventListener('click', signIn);
  el.password.addEventListener('keydown', e => { if (e.key === 'Enter') signIn(); });

  el.addTopicRowButton.addEventListener('click', () => {
    el.topicOverrideRows.appendChild(makeTopicRow());
  });
  el.saveTopicOverrideButton.addEventListener('click', saveTopicOverride);
  el.resetTopicOverrideButton.addEventListener('click', resetTopicOverride);
  el.closeTopicDialogButton.addEventListener('click', () => el.topicDialog.close());

  document.addEventListener('visibilitychange', refreshWhenVisible);
  window.addEventListener('online', () => {
    if (currentUser && (appMode === 'admin' || appMode === 'teacher')) loadCloudStatuses();
  });

  el.footerYear.textContent = String(new Date().getFullYear());
  el.brandLogo.addEventListener('error', () => {
    if (!el.brandLogo.src.endsWith('brand-logo-fallback.svg')) el.brandLogo.src = 'assets/brand-logo-fallback.svg';
  }, { once: true });

  showGate('gate');
  initCloud();
})();
