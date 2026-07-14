const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testQuery() {
  const { data, error } = await supabase
    .from('Course')
    .select('*, inCharge:User(*), batches:Batch(*, instructor:User(*))')
    .eq('id', '12476e8d-7b4f-4155-8b6c-334d6a8371e0')
    .single();

  console.log('DATA:', JSON.stringify(data, null, 2));
  console.log('ERROR:', JSON.stringify(error, null, 2));
}

testQuery();
