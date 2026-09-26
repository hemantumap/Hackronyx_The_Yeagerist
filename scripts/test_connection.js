import { supabase } from '../supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('='.repeat(70));
console.log('🔌 TESTING SUPABASE CONNECTION');
console.log('='.repeat(70));

const key = process.env.SUPABASE_ANON_KEY;
if (!key || key.includes('paste_your_anon_key')) {
  console.error(`
❌ Missing SUPABASE_ANON_KEY in .env!

1. Go to your Supabase project dashboard:
   https://supabase.com/dashboard/project/skinzibcogjnximrmuwj/settings/api
2. Copy the "anon" (public) API key.
3. Open your .env file and replace 'paste_your_anon_key_here' with your real key.
4. Run:
   npm run test:supabase
`);
  process.exit(1);
}

async function testConnection() {
  console.log(`Connecting to: ${process.env.SUPABASE_URL}...`);

  try {
    // Try querying expenses table
    const { data, error, count } = await supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .limit(3);

    if (error) {
      console.error('❌ Connection error from Supabase:', error.message);
      if (error.code === '42P01') {
        console.error('👉 The table "expenses" has not been created yet or table name differs.');
      }
      process.exit(1);
    }

    console.log(`\n🎉 CONNECTION SUCCESSFUL!`);
    console.log(`📊 Found ${count !== null ? count : data.length} records in the 'expenses' table.`);
    console.log('\nSample records fetched from your database:');
    data.forEach(item => {
      console.log(` - [${item.expenseId || item.id}] ${item.category}: ₹${item.amount} (${item.status}) - ${item.vendor}`);
    });
    console.log('\n' + '='.repeat(70));
    console.log('🚀 Everything is connected and ready for your frontend/backend!');
    console.log('='.repeat(70));
  } catch (err) {
    console.error('❌ Network error:', err.message);
    process.exit(1);
  }
}

testConnection();
