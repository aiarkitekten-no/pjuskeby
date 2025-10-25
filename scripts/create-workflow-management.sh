#!/bin/bash

# Phase 16: Content Management System - Workflow Management
# Arbeidsflytbehandling for innholdsgodkjenning med engelsk UI

echo "🔄 Phase 16: Creating content workflow management system..."

PROJECT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
CMS_DIR="$PROJECT_DIR/cms"

# Create workflow management utilities
echo "📋 Creating workflow management utilities..."

cat > "$CMS_DIR/utils/workflow-manager.ts" << 'EOF'
// Content Workflow Management System
// Phase 16: Content Management System - Norwegian backend, English UI

import fs from 'fs/promises';
import path from 'path';
import { InnholdsMetadata, MDXInnhold } from './mdx-processor';
import { versjonskontroll } from './version-control';

// Arbeidsflyt interfaces (Norwegian backend terminology)
export interface ArbeidsflytStatus {
  status: 'draft' | 'review' | 'approved' | 'published' | 'rejected' | 'archived';
  tidspunkt: string;
  bruker: string;
  kommentar?: string;
}

export interface ArbeidsflytRegler {
  tillatteOverganger: Record<string, string[]>;
  påkrevdRoller: Record<string, string[]>;
  automatiskeHandlinger: Record<string, string[]>;
}

export interface InnholdGodkjenning {
  innholdId: string;
  gjeldendStatus: ArbeidsflytStatus;
  statusHistorikk: ArbeidsflytStatus[];
  påkrevdGodkjennere: string[];
  godkjennere: Godkjenning[];
  opprettetDato: string;
  sisteOppdatering: string;
}

export interface Godkjenning {
  bruker: string;
  tidspunkt: string;
  beslutning: 'approved' | 'rejected' | 'needs_changes';
  kommentar?: string;
}

export interface Brukerrolle {
  brukerId: string;
  roller: string[];
  tilganger: string[];
}

// Workflow manager class
export class ArbeidsflytManager {
  private readonly arbeidsflytsti: string;
  private readonly rollersti: string;
  private arbeidsflytRegler: ArbeidsflytRegler;
  
  constructor(basePath: string = '/var/www/vhosts/pjuskeby.org/httpdocs') {
    this.arbeidsflytsti = path.join(basePath, 'content', 'workflow');
    this.rollersti = path.join(basePath, 'content', 'roles.json');
    
    // Standard arbeidsflytregler
    this.arbeidsflytRegler = {
      tillatteOverganger: {
        'draft': ['review', 'archived'],
        'review': ['approved', 'rejected', 'draft'],
        'approved': ['published', 'draft'],
        'published': ['archived', 'draft'],
        'rejected': ['draft', 'archived'],
        'archived': ['draft']
      },
      påkrevdRoller: {
        'review': ['editor', 'admin'],
        'approved': ['reviewer', 'admin'],
        'published': ['publisher', 'admin'],
        'archived': ['admin']
      },
      automatiskeHandlinger: {
        'published': ['notify_subscribers', 'update_sitemap'],
        'archived': ['remove_from_search_index']
      }
    };
  }

  // Initialiser arbeidsflyt for nytt innhold
  async initialiserArbeidsflyt(
    innhold: MDXInnhold, 
    opprettetAv: string
  ): Promise<InnholdGodkjenning> {
    const innholdId = this.genererInnholdId(innhold.metadata);
    
    const arbeidsflyt: InnholdGodkjenning = {
      innholdId,
      gjeldendStatus: {
        status: 'draft',
        tidspunkt: new Date().toISOString(),
        bruker: opprettetAv,
        kommentar: 'Content created'
      },
      statusHistorikk: [{
        status: 'draft',
        tidspunkt: new Date().toISOString(),
        bruker: opprettetAv,
        kommentar: 'Content created'
      }],
      påkrevdGodkjennere: await this.finnPåkrevdGodkjennere(innhold.metadata.category),
      godkjennere: [],
      opprettetDato: new Date().toISOString(),
      sisteOppdatering: new Date().toISOString()
    };
    
    await this.lagreArbeidsflyt(arbeidsflyt);
    return arbeidsflyt;
  }

  // Oppdater arbeidsflyt status
  async oppdaterStatus(
    innholdId: string,
    nyStatus: ArbeidsflytStatus['status'],
    bruker: string,
    kommentar?: string
  ): Promise<InnholdGodkjenning> {
    const arbeidsflyt = await this.hentArbeidsflyt(innholdId);
    if (!arbeidsflyt) {
      throw new Error(`Workflow not found for content: ${innholdId}`);
    }
    
    // Valider overgang
    await this.validerStatusOvergang(arbeidsflyt.gjeldendStatus.status, nyStatus, bruker);
    
    const nyStatusObjekt: ArbeidsflytStatus = {
      status: nyStatus,
      tidspunkt: new Date().toISOString(),
      bruker,
      kommentar
    };
    
    // Oppdater arbeidsflyt
    arbeidsflyt.gjeldendStatus = nyStatusObjekt;
    arbeidsflyt.statusHistorikk.push(nyStatusObjekt);
    arbeidsflyt.sisteOppdatering = new Date().toISOString();
    
    // Utfør automatiske handlinger
    await this.utførAutomatiskeHandlinger(nyStatus, innholdId);
    
    await this.lagreArbeidsflyt(arbeidsflyt);
    return arbeidsflyt;
  }

  // Legg til godkjenning
  async leggTilGodkjenning(
    innholdId: string,
    bruker: string,
    beslutning: Godkjenning['beslutning'],
    kommentar?: string
  ): Promise<InnholdGodkjenning> {
    const arbeidsflyt = await this.hentArbeidsflyt(innholdId);
    if (!arbeidsflyt) {
      throw new Error(`Workflow not found for content: ${innholdId}`);
    }
    
    // Sjekk om bruker allerede har godkjent
    const eksisterendeGodkjenning = arbeidsflyt.godkjennere.find(g => g.bruker === bruker);
    if (eksisterendeGodkjenning) {
      throw new Error('User has already provided approval for this content');
    }
    
    const godkjenning: Godkjenning = {
      bruker,
      tidspunkt: new Date().toISOString(),
      beslutning,
      kommentar
    };
    
    arbeidsflyt.godkjennere.push(godkjenning);
    arbeidsflyt.sisteOppdatering = new Date().toISOString();
    
    // Sjekk om alle påkrevde godkjennelser er mottatt
    if (this.erAlleGodkjennelserMottatt(arbeidsflyt)) {
      await this.oppdaterStatus(innholdId, 'approved', 'system', 'All required approvals received');
    }
    
    await this.lagreArbeidsflyt(arbeidsflyt);
    return arbeidsflyt;
  }

  // Valider status overgang
  private async validerStatusOvergang(
    gjeldendStatus: string,
    nyStatus: string,
    bruker: string
  ): Promise<void> {
    const tillatteOverganger = this.arbeidsflytRegler.tillatteOverganger[gjeldendStatus];
    if (!tillatteOverganger?.includes(nyStatus)) {
      throw new Error(`Invalid status transition from ${gjeldendStatus} to ${nyStatus}`);
    }
    
    const påkrevdRoller = this.arbeidsflytRegler.påkrevdRoller[nyStatus];
    if (påkrevdRoller && påkrevdRoller.length > 0) {
      const brukerroller = await this.hentBrukerroller(bruker);
      const harTilgang = påkrevdRoller.some(rolle => brukerroller.includes(rolle));
      
      if (!harTilgang) {
        throw new Error(`User ${bruker} does not have required role for status ${nyStatus}`);
      }
    }
  }

  // Finn påkrevde godkjennere basert på kategori
  private async finnPåkrevdGodkjennere(kategori: string): Promise<string[]> {
    // Standard godkjennelseskrav
    const godkjennelseskrav: Record<string, string[]> = {
      'story': ['content_reviewer'],
      'person': ['historian', 'content_reviewer'],
      'place': ['historian', 'geographer']
    };
    
    return godkjennelseskrav[kategori] || ['content_reviewer'];
  }

  // Sjekk om alle godkjennelser er mottatt
  private erAlleGodkjennelserMottatt(arbeidsflyt: InnholdGodkjenning): boolean {
    const godkjenteAvbrukertyper = arbeidsflyt.godkjennere
      .filter(g => g.beslutning === 'approved')
      .map(g => g.bruker);
    
    return arbeidsflyt.påkrevdGodkjennere.every(påkrevd => 
      godkjenteAvbrukertyper.includes(påkrevd)
    );
  }

  // Utfør automatiske handlinger
  private async utførAutomatiskeHandlinger(status: string, innholdId: string): Promise<void> {
    const handlinger = this.arbeidsflytRegler.automatiskeHandlinger[status];
    if (!handlinger) return;
    
    for (const handling of handlinger) {
      try {
        switch (handling) {
          case 'notify_subscribers':
            await this.varsleBrukere(innholdId, 'Content published');
            break;
          case 'update_sitemap':
            await this.oppdaterSitemap(innholdId);
            break;
          case 'remove_from_search_index':
            await this.fjernFraSøkeindeks(innholdId);
            break;
        }
      } catch (feil) {
        console.error(`Failed to execute automatic action ${handling}:`, feil);
      }
    }
  }

  // Hent arbeidsflyt
  async hentArbeidsflyt(innholdId: string): Promise<InnholdGodkjenning | null> {
    const filsti = path.join(this.arbeidsflytsti, `${innholdId}.json`);
    
    try {
      const innhold = await fs.readFile(filsti, 'utf-8');
      return JSON.parse(innhold);
    } catch (feil) {
      return null;
    }
  }

  // Lagre arbeidsflyt
  private async lagreArbeidsflyt(arbeidsflyt: InnholdGodkjenning): Promise<void> {
    await fs.mkdir(this.arbeidsflytsti, { recursive: true });
    const filsti = path.join(this.arbeidsflytsti, `${arbeidsflyt.innholdId}.json`);
    await fs.writeFile(filsti, JSON.stringify(arbeidsflyt, null, 2));
  }

  // Hent brukerroller
  private async hentBrukerroller(brukerId: string): Promise<string[]> {
    try {
      const rollerInnhold = await fs.readFile(this.rollersti, 'utf-8');
      const roller: Brukerrolle[] = JSON.parse(rollerInnhold);
      const brukerrolle = roller.find(r => r.brukerId === brukerId);
      return brukerrolle?.roller || [];
    } catch (feil) {
      // Standard roller hvis ingen spesifikke roller er definert
      return ['content_creator'];
    }
  }

  // List alle arbeidsflyter med status
  async listArbeidsflyter(status?: string): Promise<InnholdGodkjenning[]> {
    try {
      const filer = await fs.readdir(this.arbeidsflytsti);
      const arbeidsflytfiler = filer.filter(fil => fil.endsWith('.json'));
      
      const arbeidsflyter: InnholdGodkjenning[] = [];
      
      for (const fil of arbeidsflytfiler) {
        const filsti = path.join(this.arbeidsflytsti, fil);
        const innhold = await fs.readFile(filsti, 'utf-8');
        const arbeidsflyt: InnholdGodkjenning = JSON.parse(innhold);
        
        if (!status || arbeidsflyt.gjeldendStatus.status === status) {
          arbeidsflyter.push(arbeidsflyt);
        }
      }
      
      return arbeidsflyter.sort((a, b) => 
        new Date(b.sisteOppdatering).getTime() - new Date(a.sisteOppdatering).getTime()
      );
    } catch (feil) {
      return [];
    }
  }

  // Utility functions
  private genererInnholdId(metadata: InnholdsMetadata): string {
    return `${metadata.category}-${metadata.slug}`;
  }

  private async varsleBrukere(innholdId: string, melding: string): Promise<void> {
    // Implementer varsling (e-post, webhook, etc.)
    console.log(`Notification for ${innholdId}: ${melding}`);
  }

  private async oppdaterSitemap(innholdId: string): Promise<void> {
    // Implementer sitemap oppdatering
    console.log(`Updating sitemap for ${innholdId}`);
  }

  private async fjernFraSøkeindeks(innholdId: string): Promise<void> {
    // Implementer søkeindeks fjerning
    console.log(`Removing ${innholdId} from search index`);
  }
}

// Export singleton instance
export const arbeidsflytManager = new ArbeidsflytManager();

// English UI utility functions
export const getWorkflowStatusDisplayText = (status: string): string => {
  switch (status) {
    case 'draft': return 'Draft';
    case 'review': return 'Under Review';
    case 'approved': return 'Approved';
    case 'published': return 'Published';
    case 'rejected': return 'Rejected';
    case 'archived': return 'Archived';
    default: return 'Unknown';
  }
};

export const getApprovalDecisionText = (decision: string): string => {
  switch (decision) {
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'needs_changes': return 'Needs Changes';
    default: return 'Unknown';
  }
};

export const getAllowedTransitions = (currentStatus: string): string[] => {
  const transitions: Record<string, string[]> = {
    'draft': ['review', 'archived'],
    'review': ['approved', 'rejected', 'draft'],
    'approved': ['published', 'draft'],
    'published': ['archived', 'draft'],
    'rejected': ['draft', 'archived'],
    'archived': ['draft']
  };
  
  return transitions[currentStatus] || [];
};
EOF

echo ""
echo "✅ Workflow management system created!"
echo ""
echo "📋 Workflow management features:"
echo "   ✅ Complete content approval workflow (draft → review → approved → published)"
echo "   ✅ Role-based permissions and access control"
echo "   ✅ Multi-user approval system with tracking"
echo "   ✅ Automatic actions on status changes"
echo "   ✅ Comprehensive workflow history and audit trail"
echo "   ✅ Norwegian backend with English UI utilities"
echo ""
echo "🔄 Workflow states:"
echo "   📝 Draft → 👁️ Review → ✅ Approved → 🌐 Published"
echo "   🚫 Rejected → 📝 Draft (back to editing)"
echo "   📦 Archived (for deprecated content)"
echo ""
echo "🚨 Phase 16: Workflow management system ready!"