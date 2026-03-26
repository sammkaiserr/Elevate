import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zxrcdmyqxxvysyajuxyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cmNkbXlxeHh2eXN5YWp1eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjMzNzUsImV4cCI6MjA4OTkzOTM3NX0.OzuXykDgIF4reihLHHj7UR186sU-vLASKsIr4EXsH9c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
