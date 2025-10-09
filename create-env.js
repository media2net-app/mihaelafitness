const fs = require('fs');

const envContent = `# Supabase Database - Transaction Mode (Direct Connection)
DATABASE_URL="postgres://postgres.efpqeufpwnwuyzsuikhf:ETxEgx2E6UDUfwLt@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_BDEIjRMqxsTZRKa8_24ZkD97dbXRvynyDlTAFkRHmagcicX"

# JWT Authentication
JWT_SECRET="mihaela_fitness_super_secret_jwt_key_2024_production"

# Application Settings
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:6001"
NEXTAUTH_SECRET="mihaela_fitness_nextauth_secret_2024_production"

# Supabase Config (optional)
NEXT_PUBLIC_SUPABASE_URL="https://efpqeufpwnwuyzsuikhf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcHFldWZwd253dXl6c3Vpa2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTU0MjAsImV4cCI6MjA3NTU5MTQyMH0.HMaeEOgnVRGlLoLWJ2U4RdyrfMfawzhBiig0pazMqVM"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcHFldWZwd253dXl6c3Vpa2hmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxNTQyMCwiZXhwIjoyMDc1NTkxNDIwfQ.GorUXRP5ya0z-42VD77tEQ8_vL36vMFXHBJ3-qNP3tk"
`;

fs.writeFileSync('.env.local', envContent);
console.log('✅ .env.local created with Transaction Mode URL!');
console.log('📋 Using direct connection: db.efpqeufpwnwuyzsuikhf.supabase.co');

