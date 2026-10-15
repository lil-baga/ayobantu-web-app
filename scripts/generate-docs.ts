import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '../obsidian-vault/docs');
const APP_DIR = path.join(__dirname, '../app');
const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate Routes doc
function generateRoutesDoc() {
  const routes: string[] = [];
  
  function scanDir(dir: string, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const routePath = prefix + '/' + entry.name;
      
      if (entry.isDirectory()) {
        if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
          scanDir(fullPath, prefix + '/:' + entry.name.slice(1, -1));
        } else if (!entry.name.startsWith('_') && !entry.name.startsWith('.')) {
          scanDir(fullPath, routePath);
        }
      } else if (entry.name === 'page.tsx' || entry.name === 'route.ts') {
        routes.push(prefix || '/');
      }
    }
  }
  
  scanDir(APP_DIR);
  
  const content = `# API Routes & Pages

Generated: ${new Date().toISOString()}

## All Routes

${routes.sort().map(r => `- \`${r}\``).join('\n')}

## Categories

### Public Routes
${routes.filter(r => !r.includes('/admin') && !r.includes('/api')).map(r => `- \`${r}\``).join('\n')}

### Admin Routes
${routes.filter(r => r.includes('/admin')).map(r => `- \`${r}\``).join('\n')}

### API Routes
${routes.filter(r => r.includes('/api')).map(r => `- \`${r}\``).join('\n')}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'routes.md'), content);
  console.log('✅ Generated routes.md');
}

// Generate Migrations doc
function generateMigrationsDoc() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('⚠️  Migrations directory not found');
    return;
  }

  const migrations = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const content = `# Database Migrations

Generated: ${new Date().toISOString()}

Total: ${migrations.length} migrations

## Migration Files

${migrations.map((m, i) => `${i + 1}. \`${m}\``).join('\n')}

## Schema Summary

- Tables: 11
- Views: 1 (campaign_funds)
- Storage Buckets: 2 (campaign-images, disbursement-proofs)
- RLS Policies: Enabled on all tables
- Triggers: update_updated_at, donation_after_payment
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'migrations.md'), content);
  console.log('✅ Generated migrations.md');
}

// Generate Database Schema doc
function generateSchemaDoc() {
  const content = `# Database Schema

Generated: ${new Date().toISOString()}

## Tables

### Core Tables
1. **staff_profiles** - Admin/Finance user profiles
2. **campaigns** - Donation campaigns
3. **donations** - Donation records
4. **donor_contacts** - Encrypted donor contact info
5. **payments** - Payment tracking (local mode)
6. **disbursements** - Fund disbursements
7. **disbursement_proofs** - Proof uploads
8. **campaign_updates** - Campaign progress updates
9. **reports** - Campaign reports from public
10. **receipt_notifications** - Receipt email queue
11. **audit_logs** - Audit trail

### Views
- **campaign_funds** - Aggregated fund calculations per campaign

## Storage Buckets
- **campaign-images** - Campaign cover images (public)
- **disbursement-proofs** - Disbursement proof files (private)

## Key Relationships
- campaigns → donations (1:n)
- donations → payments (1:1)
- donations → donor_contacts (1:1)
- campaigns → disbursements (1:n)
- disbursements → disbursement_proofs (1:n)
- campaigns → campaign_updates (1:n)
- campaigns → reports (1:n)

## Security
- RLS enabled on all tables
- Donor contacts encrypted with AES-256-GCM
- Admin/Finance role checks via JWT claims
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'database-schema.md'), content);
  console.log('✅ Generated database-schema.md');
}

// Run all generators
console.log('🚀 Generating documentation...\n');
generateRoutesDoc();
generateMigrationsDoc();
generateSchemaDoc();
console.log('\n✅ Documentation generation complete!');
