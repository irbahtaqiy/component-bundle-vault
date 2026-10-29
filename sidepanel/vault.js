let _db = null;

export function initVault() {
  if (_db) return _db;
  const DexieCtor = (typeof Dexie !== 'undefined') ? Dexie : ((typeof window !== 'undefined' && window.Dexie) ? window.Dexie : null);
  if (!DexieCtor) {
    throw new Error('Dexie not loaded');
  }
  _db = new DexieCtor('cbv_vault');
  _db.version(1).stores({
    bundles: 'id, name, createdAt'
  });
  return _db;
}
