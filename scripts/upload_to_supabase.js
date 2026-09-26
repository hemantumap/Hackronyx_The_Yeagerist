import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..');
const datasetsDir = path.join(baseDir, 'datasets');

const isDryRun = process.argv.includes('--dry-run');

console.log('='.repeat(70));
console.log('⚡ SUPABASE DATASET UPLOADER (Zero-dependency PostgREST API)');
console.log('='.repeat(70));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!isDryRun && (!supabaseUrl || !supabaseKey)) {
  console.log(`
ℹ️  How to upload programmatically to Supabase:

Option 1: Drag & drop CSV files directly via Supabase Web Dashboard (Easiest & Fastest!)
  - Open Supabase -> Table Editor -> Import CSV from 'datasets/csv/'

Option 2: Run this script with your project credentials:
  On Windows PowerShell:
    $env:SUPABASE_URL="https://your-project-id.supabase.co"
    $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
    node scripts/upload_to_supabase.js

💡 Run dry-run simulation:
    node scripts/upload_to_supabase.js --dry-run
`);
  process.exit(1);
}

async function uploadToTable(tableName, items) {
  console.log(`📦 Table '${tableName}': ${items.length} records...`);
  if (isDryRun) {
    console.log(`   ✅ [DRY-RUN] Validated ${items.length} records for table '${tableName}'.`);
    return;
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}`;
  const BATCH_SIZE = 50;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(chunk)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed writing to ${tableName}: ${res.status} ${res.statusText} - ${errText}`);
    }
    console.log(`   ✨ Inserted records ${i + 1} - ${Math.min(i + BATCH_SIZE, items.length)} into '${tableName}'`);
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

  // Upload in dependency order (departments & employees first, then expenses, approvals, budgets)
  await uploadToTable('departments', departments);
  await uploadToTable('employees', employees);
  await uploadToTable('expense_categories', categories);
  await uploadToTable('budgets', budgets);
  await uploadToTable('expenses', expenses);
  await uploadToTable('approvals', approvals);
  await uploadToTable('budget_alerts', alerts);

  console.log('\n' + '='.repeat(70));
  if (isDryRun) {
    console.log('🎉 DRY-RUN SIMULATION COMPLETE! Ready for Supabase import.');
  } else {
    console.log('🎉 UPLOAD COMPLETE! All data is populated in your Supabase PostgreSQL database.');
  }
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('Fatal error during Supabase upload:', err.message);
  process.exit(1);
});
