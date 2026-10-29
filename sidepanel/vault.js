let _db = null;

export function initVault() {
  if (_db) return _db;
  if (typeof Dexie === 'undefined') {
    if (typeof window !== 'undefined' && window.Dexie) {
      const DexieCtor = window.Dexie;
      _db = new DexieCtor('cbv_vault');
      _db.version(1).stores({
        bundles: 'id, name, createdAt'
      });
      return _db;
    }
    throw new Error('Dexie not loaded');
  }
  _db = new Dexie('cbv_vault');
  _db.version(1).stores({
    bundles: 'id, name, createdAt'
  });
  return _db;
}
