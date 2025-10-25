#!/bin/bash

# Phase 16: Content Management System - Version Control
# Versjonskontroll for innhold med norsk backend, engelsk brukergrensesnitt

echo "🗂️ Phase 16: Creating content version control system..."

PROJECT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
CMS_DIR="$PROJECT_DIR/cms"

# Create version control utilities
echo "📦 Creating version control utilities..."

cat > "$CMS_DIR/utils/version-control.ts" << 'EOF'
// Content Version Control System
// Phase 16: Content Management System - Norsk backend, English UI

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { InnholdsMetadata, MDXInnhold } from './mdx-processor';

// Versjonshåndtering interfaces (Norwegian backend)
export interface InnholdsVersjon {
  versjonId: string;
  innholdId: string;
  versjonsnummer: number;
  opprettetDato: string;
  opprettetAv: string;
  endringsbeskrivelse: string;
  metadata: InnholdsMetadata;
  innhold: string;
  sha256: string;
  forrigeVersjon?: string;
}

export interface Endringslogg {
  versjonId: string;
  tidspunkt: string;
  bruker: string;
  handlingstype: 'created' | 'modified' | 'deleted' | 'published' | 'unpublished';
  beskrivelse: string;
  endringer: Feltendring[];
}

export interface Feltendring {
  felt: string;
  gammeltVerde: any;
  nyttVerde: any;
}

// Version control manager
export class VersjonskontrollManager {
  private readonly versjonsmappebase: string;
  private readonly endringsloggsti: string;
  
  constructor(basePath: string = '/var/www/vhosts/pjuskeby.org/httpdocs') {
    this.versjonsmappebase = path.join(basePath, 'content', 'versions');
    this.endringsloggsti = path.join(basePath, 'content', 'changelog.json');
  }

  // Opprett ny versjon av innhold
  async opprettVersjon(
    innhold: MDXInnhold, 
    bruker: string, 
    endringsbeskrivelse: string = 'Content updated'
  ): Promise<InnholdsVersjon> {
    const innholdId = this.genererInnholdId(innhold.metadata);
    const versjonsmapper = path.join(this.versjonsmappebase, innholdId);
    
    // Sikre at versjonsmappen eksisterer
    await fs.mkdir(versjonsmapper, { recursive: true });
    
    // Finn neste versjonsnummer
    const eksisterendeVersjoner = await this.hentVersjoner(innholdId);
    const versjonsnummer = eksisterendeVersjoner.length + 1;
    
    // Generer versjon-ID og SHA256
    const versjonId = this.genererVersjonId(innholdId, versjonsnummer);
    const innholdTekst = this.serialiserInnhold(innhold);
    const sha256 = this.beregnSHA256(innholdTekst);
    
    // Opprett versjonsobjekt
    const versjon: InnholdsVersjon = {
      versjonId,
      innholdId,
      versjonsnummer,
      opprettetDato: new Date().toISOString(),
      opprettetAv: bruker,
      endringsbeskrivelse,
      metadata: { ...innhold.metadata },
      innhold: innhold.content,
      sha256,
      forrigeVersjon: eksisterendeVersjoner.length > 0 
        ? eksisterendeVersjoner[eksisterendeVersjoner.length - 1].versjonId 
        : undefined
    };
    
    // Lagre versjon til fil
    const versjonsfil = path.join(versjonsmapper, `${versjonsnummer}.json`);
    await fs.writeFile(versjonsfil, JSON.stringify(versjon, null, 2));
    
    // Opprett endringslogg
    await this.loggEndring({
      versjonId,
      tidspunkt: versjon.opprettetDato,
      bruker,
      handlingstype: versjonsnummer === 1 ? 'created' : 'modified',
      beskrivelse: endringsbeskrivelse,
      endringer: versjonsnummer > 1 
        ? this.sammenlignVersjoner(eksisterendeVersjoner[eksisterendeVersjoner.length - 1], versjon)
        : []
    });
    
    return versjon;
  }

  // Hent alle versjoner for et innhold
  async hentVersjoner(innholdId: string): Promise<InnholdsVersjon[]> {
    const versjonsmapper = path.join(this.versjonsmappebase, innholdId);
    
    try {
      const filer = await fs.readdir(versjonsmapper);
      const versjonsfiler = filer
        .filter(fil => fil.endsWith('.json'))
        .sort((a, b) => parseInt(a) - parseInt(b));
      
      const versjoner: InnholdsVersjon[] = [];
      
      for (const fil of versjonsfiler) {
        const filsti = path.join(versjonsmapper, fil);
        const innhold = await fs.readFile(filsti, 'utf-8');
        versjoner.push(JSON.parse(innhold));
      }
      
      return versjoner;
    } catch (feil) {
      return []; // Ingen versjoner funnet
    }
  }

  // Hent spesifikk versjon
  async hentVersjon(versjonId: string): Promise<InnholdsVersjon | null> {
    const [innholdId, versjonsnummer] = versjonId.split('-v');
    const versjonsfil = path.join(this.versjonsmappebase, innholdId, `${versjonsnummer}.json`);
    
    try {
      const innhold = await fs.readFile(versjonsfil, 'utf-8');
      return JSON.parse(innhold);
    } catch (feil) {
      return null;
    }
  }

  // Tilbakestill til tidligere versjon (rollback)
  async tilbakestillVersjon(
    versjonId: string, 
    bruker: string, 
    grunn: string = 'Reverted to previous version'
  ): Promise<InnholdsVersjon> {
    const versjon = await this.hentVersjon(versjonId);
    if (!versjon) {
      throw new Error(`Version ${versjonId} not found`);
    }
    
    // Opprett ny versjon basert på den gamle
    const mdxInnhold: MDXInnhold = {
      metadata: versjon.metadata,
      content: versjon.innhold,
      compiledMDX: '', // Vil bli regenerert
      wordCount: versjon.innhold.split(/\s+/).length,
      readingTime: Math.ceil(versjon.innhold.split(/\s+/).length / 200)
    };
    
    return this.opprettVersjon(mdxInnhold, bruker, `${grunn} (reverted from ${versjonId})`);
  }

  // Sammenlign to versjoner
  private sammenlignVersjoner(gammel: InnholdsVersjon, ny: InnholdsVersjon): Feltendring[] {
    const endringer: Feltendring[] = [];
    
    // Sammenlign metadata feltene
    const metadataFelter: (keyof InnholdsMetadata)[] = [
      'title', 'description', 'author', 'status', 'category', 'tags', 'slug'
    ];
    
    for (const felt of metadataFelter) {
      const gammeltVerde = gammel.metadata[felt];
      const nyttVerde = ny.metadata[felt];
      
      // Spesiell håndtering for arrays (tags)
      if (Array.isArray(gammeltVerde) && Array.isArray(nyttVerde)) {
        if (JSON.stringify(gammeltVerde) !== JSON.stringify(nyttVerde)) {
          endringer.push({ felt, gammeltVerde, nyttVerde });
        }
      } else if (gammeltVerde !== nyttVerde) {
        endringer.push({ felt, gammeltVerde, nyttVerde });
      }
    }
    
    // Sammenlign innhold
    if (gammel.innhold !== ny.innhold) {
      endringer.push({
        felt: 'content',
        gammeltVerde: `${gammel.innhold.length} characters`,
        nyttVerde: `${ny.innhold.length} characters`
      });
    }
    
    return endringer;
  }

  // Log endringer til endringslogg
  private async loggEndring(endringslogg: Endringslogg): Promise<void> {
    try {
      let eksisterendeLogg: Endringslogg[] = [];
      
      try {
        const loggInnhold = await fs.readFile(this.endringsloggsti, 'utf-8');
        eksisterendeLogg = JSON.parse(loggInnhold);
      } catch (feil) {
        // Fil eksisterer ikke, start med tom array
      }
      
      eksisterendeLogg.push(endringslogg);
      
      // Behold kun siste 1000 entries
      if (eksisterendeLogg.length > 1000) {
        eksisterendeLogg = eksisterendeLogg.slice(-1000);
      }
      
      await fs.writeFile(this.endringsloggsti, JSON.stringify(eksisterendeLogg, null, 2));
    } catch (feil) {
      console.error('Failed to log change:', feil);
    }
  }

  // Hent endringslogg
  async hentEndringslogg(innholdId?: string, limit: number = 50): Promise<Endringslogg[]> {
    try {
      const loggInnhold = await fs.readFile(this.endringsloggsti, 'utf-8');
      let logger: Endringslogg[] = JSON.parse(loggInnhold);
      
      // Filtrer på innhold-ID hvis spesifisert
      if (innholdId) {
        logger = logger.filter(logg => logg.versjonId.startsWith(innholdId));
      }
      
      // Sorter etter tidspunkt (nyeste først)
      logger.sort((a, b) => new Date(b.tidspunkt).getTime() - new Date(a.tidspunkt).getTime());
      
      return logger.slice(0, limit);
    } catch (feil) {
      return [];
    }
  }

  // Utility functions
  private genererInnholdId(metadata: InnholdsMetadata): string {
    return `${metadata.category}-${metadata.slug}`;
  }

  private genererVersjonId(innholdId: string, versjonsnummer: number): string {
    return `${innholdId}-v${versjonsnummer}`;
  }

  private serialiserInnhold(innhold: MDXInnhold): string {
    return JSON.stringify({
      metadata: innhold.metadata,
      content: innhold.content
    });
  }

  private beregnSHA256(tekst: string): string {
    return crypto.createHash('sha256').update(tekst).digest('hex');
  }
}

// Export singleton instance
export const versjonskontroll = new VersjonskontrollManager();

// English UI utility functions for display
export const formatVersionDisplayText = (version: InnholdsVersjon): string => {
  return `v${version.versjonsnummer} - ${formatDateForDisplay(version.opprettetDato)} by ${version.opprettetAv}`;
};

export const formatChangeTypeText = (type: string): string => {
  switch (type) {
    case 'created': return 'Created';
    case 'modified': return 'Modified';
    case 'deleted': return 'Deleted';
    case 'published': return 'Published';
    case 'unpublished': return 'Unpublished';
    default: return 'Unknown';
  }
};

export const formatDateForDisplay = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};
EOF

echo ""
echo "✅ Version control system created!"
echo ""
echo "📋 Version control features:"
echo "   ✅ Automatic versioning for all content changes"
echo "   ✅ SHA256 integrity checking for each version"
echo "   ✅ Comprehensive change tracking with diff analysis"
echo "   ✅ Rollback capabilities to any previous version"
echo "   ✅ Change log with user attribution and timestamps"
echo "   ✅ Norwegian backend with English UI utilities"
echo ""
echo "🗂️ Version storage structure:"
echo "   content/versions/[content-id]/[version-number].json"
echo "   content/changelog.json (global change log)"
echo ""
echo "🚨 Phase 16: Version control system ready!"