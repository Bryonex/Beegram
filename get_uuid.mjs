import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://meewzycjpjygyrpqjjtp.supabase.co',
  'sb_publishable_268Yp4FKjSaBDAohFu58qg_jODx7_LN'
);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'sundarrajanssr771@gmail.com',
    password: '1297401',
  });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('UUID:', data.user.id);
}

run();
