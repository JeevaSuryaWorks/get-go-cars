import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://uxvcwrslreqptvilaeej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4dmN3cnNscmVxcHR2aWxhZWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODEyMDcsImV4cCI6MjA4MDk1NzIwN30.-c8kjgYxWGjgx27sZUBqbN_5FmR9IvHl9_Z3Uhg9biM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('profiles').select('*').limit(5);
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}
test();
