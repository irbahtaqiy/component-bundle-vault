export function initVault() {
  const db = new Dexie('ComponentBundleVault');
  db.version(1).stores({
    bundles: 'id, name, createdAt'
  });
  return db;
}
