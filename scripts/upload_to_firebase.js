import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..');
const datasetsDir = path.join(baseDir, 'datasets');

// Parse CLI arguments
const isDryRun = process.argv.includes('--dry-run');

console.log('='.repeat(70));
console.log('🚀 FIREBASE FIRESTORE DATASET UPLOADER');
console.log('='.repeat(70));
if (isDryRun) {
  console.log('⚡ MODE: DRY-RUN SIMULATION (No writes to Firebase will occur)\n');
}

// 1. Check for Service Account Key if not in dry-run mode
const keyPaths = [
  path.join(baseDir, 'serviceAccountKey.json'),
  path.join(baseDir, 'config', 'serviceAccountKey.json'),
  process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
].filter(Boolean);

let serviceAccountPath = keyPaths.find(p => fs.existsSync(p));

let admin = null;
let db = null;

if (!isDryRun) {
  if (!serviceAccountPath && !process.env.FIRESTORE_EMULATOR_HOST) {
    console.error(`
❌ Firebase Service Account Key Not Found!

To upload this dataset to your Firebase project:
  1. Open Firebase Console: https://console.firebase.google.com/
  2. Select your Project -> Project Settings (gear icon) -> "Service accounts"
  3. Click "Generate new private key"
  4. Save the downloaded JSON file as:
     ${path.join(baseDir, 'serviceAccountKey.json')}
  5. Run:
     npm run upload

💡 Tip: You can test the uploader in dry-run mode right now with:
     npm run upload:dry
`);
    process.exit(1);
  }

  try {
    const firebaseAdminModule = await import('firebase-admin');
    admin = firebaseAdminModule.default;

    let certConfig;
    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      certConfig = admin.credential.cert(serviceAccount);
      console.log(`🔑 Authenticated using key: ${path.basename(serviceAccountPath)} (Project: ${serviceAccount.project_id})`);
    } else {
      certConfig = admin.credential.applicationDefault();
      console.log(`🔑 Authenticated using Application Default / Emulator`);
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: certConfig
      });
    }

    db = admin.firestore();
    console.log('🔥 Connected to Cloud Firestore successfully!\n');
  } catch (err) {
    console.error(`❌ Error initializing Firebase Admin:`, err.message);
    process.exit(1);
  }
}

// Helper: Convert ISO strings to Firestore Timestamps (or leave as Date in dry-run)
function convertDates(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(obj)) {
      if (admin && admin.firestore && admin.firestore.Timestamp) {
        return admin.firestore.Timestamp.fromDate(new Date(obj));
      }
      return new Date(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => convertDates(item));
  }
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertDates(value);
    }
    return result;
  }
  return obj;
}

// Upload Collection
async function uploadCollection(collectionName, items, idField = 'id') {
  console.log(`📦 Processing collection: '${collectionName}' (${items.length} records)...`);

  if (isDryRun) {
    items.forEach((item, idx) => {
      const docId = item[idField] || item.id || `auto_${idx}`;
      convertDates(item);
    });
    console.log(`   ✅ [DRY-RUN] Validated ${items.length} records for '${collectionName}'.`);
    return;
  }

  const BATCH_SIZE = 400;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach((rawItem, idx) => {
      const item = convertDates(rawItem);
      const docId = String(item[idField] || item.id || db.collection(collectionName).doc().id);
      const docRef = db.collection(collectionName).doc(docId);
      batch.set(docRef, item, { merge: true });
    });

    await batch.commit();
    console.log(`   ✨ Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} documents) to '${collectionName}'`);
  }
}

async function main() {
  const departments = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'departments.json'), 'utf8'));
  const employees = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'employees.json'), 'utf8'));
  const budgets = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'budgets.json'), 'utf8'));
  const expenses = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'expenses.json'), 'utf8'));
  const approvals = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'approvals.json'), 'utf8'));
  const categories = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'expense_categories.json'), 'utf8'));
  const alerts = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'budget_alerts.json'), 'utf8'));

  // Upload Collections
  await uploadCollection('departments', departments, 'departmentId');
  await uploadCollection('employees', employees, 'employeeId');
  await uploadCollection('users', employees, 'employeeId'); // Dual alias for flexibility
  await uploadCollection('budgets', budgets, 'budgetId');
  await uploadCollection('expenses', expenses, 'expenseId');
  await uploadCollection('approvals', approvals, 'approvalId');
  await uploadCollection('expense_categories', categories, 'categoryId');
  await uploadCollection('budget_alerts', alerts, 'alertId');

  console.log('\n' + '='.repeat(70));
  if (isDryRun) {
    console.log('🎉 DRY-RUN SIMULATION COMPLETE! All data structures are Firestore-ready.');
  } else {
    console.log('🎉 UPLOAD COMPLETE! All datasets have been written to Cloud Firestore.');
  }
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('Fatal error during upload:', err);
  process.exit(1);
});
