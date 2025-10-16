/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

// COPILOT: Ikke foreslå "mock data". Les baseline fra httpdocs/json, ellers avbryt.

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { join } from 'path';

const PROJECT_ROOT = '/var/www/vhosts/pjuskeby.org';

const FORBIDDEN_PATTERNS = [
  { pattern: /\bTODO\b/gi, name: 'TODO' },
  { pattern: /\bFIXME\b/gi, name: 'FIXME' },
  { pattern: /\bplaceholder\b/gi, name: 'placeholder' },
  { pattern: /\bcoming soon\b/gi, name: 'coming soon' },
  { pattern: /\blorem ipsum\b/gi, name: 'lorem ipsum' },
  { pattern: /\bmock(?:Data|ed)?\b/gi, name: 'mock' },
  { pattern: /\bdummy\b/gi, name: 'dummy' },
  { pattern: /\bTBD\b/gi, name: 'TBD' },
  { pattern: /\bher kommer\b/gi, name: 'her kommer' },
  { pattern: /\/\/ \.\.\.(?!\s*existing code)/gi, name: '// ...' }
];

const ALLOWED_PATHS = [
  'AI-learned/antimønstre.json',
  'docs/',
  'test/',
  '__tests__/',
  '*.test.ts',
  '*.spec.ts',
  'scripts/lint-no-placeholder.ts',
  'scripts/validate-koblinger.ts',
  'scripts/lib/log-action.ts',
  'scripts/wipe-dynamic-data.ts'
];

interface ScanResult {
  file: string;
  line: number;
  pattern: string;
  match: string;
  context: string;
}

function isAllowedPath(filePath: string): boolean {
  return ALLOWED_PATHS.some(allowed => {
    if (allowed.endsWith('/')) {
      return filePath.includes(allowed);
    }
    return filePath.includes(allowed);
  });
}

async function scanFile(filePath: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  
  if (isAllowedPath(filePath)) {
    return results;
  }

  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip lines that are clearly pattern definitions or Copilot hints
      if (line.includes('{ pattern:') || 
          line.includes('COPILOT:') || 
          line.includes('// COPILOT')) {
        continue;
      }
      
      for (const { pattern, name } of FORBIDDEN_PATTERNS) {
        const matches = line.match(pattern);
        if (matches) {
          results.push({
            file: filePath.replace(PROJECT_ROOT + '/', ''),
            line: i + 1,
            pattern: name,
            match: matches[0],
            context: line.trim()
          });
        }
      }
    }
  } catch (error) {
    // Skip filer vi ikke kan lese (binære, etc.)
  }

  return results;
}

async function main() {
  console.log('🔍 Skanner for forbudte placeholders...\n');

  const patterns = [
    'httpdocs/**/*.{ts,tsx,js,jsx,json,md,mdx}',
    'src/**/*.{ts,tsx,js,jsx,json,md,mdx}',
    'scripts/**/*.{ts,js}',
    'packages/**/*.{ts,tsx,js,jsx,json}',
    'content/**/*.{md,mdx,json}'
  ];

  const allResults: ScanResult[] = [];

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: PROJECT_ROOT,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.astro/**']
    });

    for (const file of files) {
      const results = await scanFile(file);
      allResults.push(...results);
    }
  }

  if (allResults.length === 0) {
    console.log('✅ Ingen forbudte placeholders funnet!\n');
    process.exit(0);
  } else {
    console.error('❌ FORBUDTE PLACEHOLDERS FUNNET:\n');
    
    const byFile = allResults.reduce((acc, result) => {
      if (!acc[result.file]) acc[result.file] = [];
      acc[result.file].push(result);
      return acc;
    }, {} as Record<string, ScanResult[]>);

    for (const [file, results] of Object.entries(byFile)) {
      console.error(`\n📄 ${file}:`);
      results.forEach(r => {
        console.error(`   Linje ${r.line}: ${r.pattern} → "${r.match}"`);
        console.error(`   Kontekst: ${r.context}`);
      });
    }

    console.error(`\n❌ Totalt ${allResults.length} brudd funnet.`);
    console.error('Fjern alle placeholders før commit.\n');
    process.exit(1);
  }
}

main();
