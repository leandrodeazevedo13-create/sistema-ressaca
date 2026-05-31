// supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://hyrxnsgcktbsmvaocwxe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cnhuc2dja3Ric212YW9jd3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzg4ODcsImV4cCI6MjA5NTgxNDg4N30.8pmKPk8CPPqCTKdZ3LghMKOjI1bygnYOpmRkBnEKi5k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);