// Simple test for clearApolloKeys logic (no browser required)
(function () {
  function makeStorage() {
    const store = Object.create(null);
    return {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      keys: () => Object.keys(store),
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
  }

  const localStorageMock = makeStorage();
  const sessionStorageMock = makeStorage();

  // populate with test keys
  localStorageMock.setItem('apollo_cache_1', 'x');
  localStorageMock.setItem('other_key', 'keep');
  sessionStorageMock.setItem('apollo_current_tenant', 'tenant-123');
  sessionStorageMock.setItem('apollo_token', 'tok');
  sessionStorageMock.setItem('apollo_something_else', 'y');

  function clearApolloKeys(localStor, sessionStor) {
    try {
      localStor.keys().forEach(k => { if (k.startsWith('apollo_')) localStor.removeItem(k); });
    } catch (e) { /* ignore */ }
    try {
      sessionStor.keys().forEach(k => { if (k.startsWith('apollo_')) sessionStor.removeItem(k); });
    } catch (e) { /* ignore */ }
    try { sessionStor.removeItem('apollo_current_tenant'); } catch (e) { /* ignore */ }
  }

  // Run cleaner
  clearApolloKeys(localStorageMock, sessionStorageMock);

  // Assertions
  const localKeys = localStorageMock.keys();
  const sessionKeys = sessionStorageMock.keys();

  const localApolloLeft = localKeys.some(k => k.startsWith('apollo_'));
  const sessionApolloLeft = sessionKeys.some(k => k.startsWith('apollo_'));
  const tenantLeft = sessionStorageMock.getItem('apollo_current_tenant');

  let ok = true;
  if (localApolloLeft) { console.error('FAIL: localStorage still contains apollo_ keys:', localKeys); ok = false; }
  if (sessionApolloLeft) { console.error('FAIL: sessionStorage still contains apollo_ keys:', sessionKeys); ok = false; }
  if (tenantLeft) { console.error('FAIL: apollo_current_tenant still present:', tenantLeft); ok = false; }
  if (localStorageMock.getItem('other_key') !== 'keep') { console.error('FAIL: non-apollo key removed'); ok = false; }

  if (ok) {
    console.log('PASS: clearApolloKeys removed apollo_* and apollo_current_tenant as expected');
    process.exit(0);
  } else {
    console.error('Test failed');
    process.exit(2);
  }
})();
