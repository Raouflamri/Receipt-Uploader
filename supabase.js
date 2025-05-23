// supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://mywotdmfnuewctbanedi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d290ZG1mbnVld2N0YmFuZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjA5ODIsImV4cCI6MjA2MzU5Njk4Mn0.81yT4CRzXsHvqFh7g_DE3dsXcqRAN-gzai5KEStXPvk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
