import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, app, config, adapter] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../config.js', import.meta.url), 'utf8'),
  readFile(new URL('../firebase-auth-adapter.mjs', import.meta.url), 'utf8'),
]);

test('loads the Firebase adapter before the Navigator application', () => {
  const adapterIndex = html.indexOf('firebase-auth-adapter.mjs');
  const appIndex = html.indexOf('app.js?v=');
  assert.ok(adapterIndex > 0);
  assert.ok(appIndex > adapterIndex);
});

test('selects Firebase emergency mode from configuration', () => {
  assert.match(config, /authProvider:\s*["']firebase["']/);
  assert.match(app, /function usesFirebaseEmergencyAuth\(\)/);
  assert.match(app, /OGE_FIREBASE_AUTH/);
});

test('keeps legacy Supabase and VK Donut rollback code', () => {
  assert.match(app, /supabaseClient\.auth\.signInWithPassword/);
  assert.match(app, /vk-donut-access/);
  assert.match(app, /fetchFullCatalogLegacy/);
});

test('uses the Yandex descriptor directly in Firebase mode', () => {
  assert.match(app, /requestOgeAccess/);
  assert.match(app, /fetchFullCatalogFromDescriptor/);
  assert.match(app, /activateFirebaseSession/);
});

test('does not require Supabase configuration for Firebase startup', () => {
  assert.match(app, /usesFirebaseEmergencyAuth\(\)[\s\S]{0,200}return Boolean\(window\.OGE_FIREBASE_AUTH\)/);
});

test('waits for Firebase bootstrap before starting the Navigator module', () => {
  assert.match(html, /type="module"[^>]+firebase-auth-adapter\.mjs/);
  assert.match(adapter, /await bootstrapBrowserAdapter\(\)/);
});
