import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('index wires Firebase pilot before the existing Navigator app without removing Supabase', async () => {
  const html = await fs.readFile(new URL('./index.html', import.meta.url), 'utf8');
  const supabase = html.indexOf('@supabase/supabase-js@2');
  const firebaseApp = html.indexOf('firebase-app-compat.js');
  const firebaseAuth = html.indexOf('firebase-auth-compat.js');
  const firebaseConfig = html.indexOf('firebase-config.js');
  const firebaseAdapter = html.indexOf('firebase-auth-adapter.js');
  const app = html.indexOf('app.js?v=099y6-admin-1');

  assert.ok(supabase >= 0, 'existing Supabase SDK must remain');
  assert.ok(firebaseApp > supabase, 'Firebase App SDK must be added after Supabase');
  assert.ok(firebaseAuth > firebaseApp, 'Firebase Auth SDK must follow Firebase App SDK');
  assert.ok(firebaseConfig > firebaseAuth, 'Firebase config must load after SDKs');
  assert.ok(firebaseAdapter > firebaseConfig, 'adapter must load after Firebase config');
  assert.ok(app > firebaseAdapter, 'existing Navigator app must load after the pilot adapter');
});
