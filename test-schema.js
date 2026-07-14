const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  const { data, error } = await supabase.from('Course').select('fee').limit(1);
  console.log('SCHEMA DATA:', JSON.stringify(data));
  console.log('SCHEMA ERROR:', JSON.stringify(error));

  const { data: d2, error: e2 } = await supabase
    .from('Course')
    .select('*, inCharge:User(*), batches:Batch(*, instructor:User(*))')
    .eq('id', '12476e8d-7b4f-4155-8b6c-334d6a8371e0')
    .single();

  console.log('COURSE DATA:', JSON.stringify(d2));
  console.log('COURSE ERROR:', JSON.stringify(e2));
}

checkSchema();
