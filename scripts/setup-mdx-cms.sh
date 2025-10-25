#!/bin/bash

# Phase 16: Content Management System - MDX Processing
# Innholdshåndteringssystem med MDX og norsk backend, engelsk brukergrensesnitt

echo "📝 Phase 16: Setting up Content Management System with MDX..."

PROJECT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
CONTENT_DIR="$PROJECT_DIR/content"
CMS_DIR="$PROJECT_DIR/cms"

# Create content management directory structure
echo "📁 Creating content management structure..."
mkdir -p "$CONTENT_DIR/stories"
mkdir -p "$CONTENT_DIR/people" 
mkdir -p "$CONTENT_DIR/places"
mkdir -p "$CONTENT_DIR/drafts/stories"
mkdir -p "$CONTENT_DIR/drafts/people"
mkdir -p "$CONTENT_DIR/drafts/places"
mkdir -p "$CONTENT_DIR/published"
mkdir -p "$CONTENT_DIR/templates"
mkdir -p "$CMS_DIR/components"
mkdir -p "$CMS_DIR/utils"
mkdir -p "$CMS_DIR/api"

# Install MDX and content management dependencies
echo "📦 Installing MDX and CMS dependencies..."
cd "$PROJECT_DIR"

npm install --save \
    @mdx-js/mdx \
    @mdx-js/react \
    @mdx-js/rollup \
    remark-frontmatter \
    remark-gfm \
    remark-html \
    rehype-stringify \
    gray-matter \
    date-fns \
    slugify \
    unified \
    vfile \
    react-md-editor \
    @uiw/react-md-editor \
    @uiw/react-markdown-preview

# Create MDX processing utilities  
echo "⚙️ Creating MDX processing utilities..."
cat > "$CMS_DIR/utils/mdx-processor.ts" << 'EOF'
// MDX Processing Utilities
// Phase 16: Content Management System - MDX + Norsk backend, English UI

import { compile } from '@mdx-js/mdx';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import slugify from 'slugify';
import { format } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

// MDX innholdsprosessering - Norwegian comments, English interface
export interface InnholdsMetadata {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  lastModified: string;
  status: 'draft' | 'review' | 'published';
  category: 'story' | 'person' | 'place';
  tags: string[];
  slug: string;
}

export interface MDXInnhold {
  metadata: InnholdsMetadata;
  content: string;
  compiledMDX: string;
  wordCount: number;
  readingTime: number;
}

// MDX kompilator med norsk konfiguration
export class MDXProsessor {
  private readonly innholdssti: string;
  
  constructor(contentPath: string = '/var/www/vhosts/pjuskeby.org/httpdocs/content') {
    this.innholdssti = contentPath;
  }

  // Parse frontmatter og MDX innhold
  async parseMDX(filsti: string): Promise<MDXInnhold> {
    try {
      const filInnhold = await fs.readFile(filsti, 'utf-8');
      const { data: metadata, content } = matter(filInnhold);
      
      // Kompiler MDX til JavaScript
      const kompiletMDX = await this.kompilerMDX(content);
      
      // Beregn lesetid (Norwegian calculation logic)
      const ordtelling = this.tellOrd(content);
      const lesetid = Math.ceil(ordtelling / 200); // 200 ord per minutt
      
      return {
        metadata: this.validerMetadata(metadata),
        content,
        compiledMDX: kompiletMDX,
        wordCount: ordtelling,
        readingTime: lesetid
      };
    } catch (feil) {
      throw new Error(`Failed to parse MDX file: ${feil.message}`);
    }
  }

  // Kompiler MDX med plugins
  private async kompilerMDX(innhold: string): Promise<string> {
    const resultat = await compile(innhold, {
      remarkPlugins: [remarkFrontmatter, remarkGfm],
      development: process.env.NODE_ENV === 'development'
    });
    
    return String(resultat);
  }

  // Tell ord i innhold (Norwegian logic)
  private tellOrd(tekst: string): number {
    return tekst
      .replace(/```[\s\S]*?```/g, '') // Fjern kodeblokker
      .replace(/`[^`]+`/g, '') // Fjern inline kode
      .split(/\s+/)
      .filter(ord => ord.length > 0).length;
  }

  // Valider og normaliser metadata
  private validerMetadata(metadata: any): InnholdsMetadata {
    const normaliserteMetadata: InnholdsMetadata = {
      title: metadata.title || 'Untitled Content',
      description: metadata.description || '',
      author: metadata.author || 'Unknown Author',
      publishedDate: metadata.publishedDate || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: metadata.status || 'draft',
      category: metadata.category || 'story',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      slug: metadata.slug || slugify(metadata.title || '', { lower: true })
    };

    // Valider status verdier
    if (!['draft', 'review', 'published'].includes(normaliserteMetadata.status)) {
      normaliserteMetadata.status = 'draft';
    }

    return normaliserteMetadata;
  }

  // Save MDX content with frontmatter
  async lagreInnhold(metadata: InnholdsMetadata, innhold: string): Promise<string> {
    const frontmatter = this.opprettFrontmatter(metadata);
    const fullInnhold = `${frontmatter}\n\n${innhold}`;
    
    const kategoriMappe = path.join(this.innholdssti, metadata.category === 'story' ? 'stories' : metadata.category);
    const statusMappe = metadata.status === 'published' ? kategoriMappe : path.join(this.innholdssti, 'drafts', metadata.category);
    
    // Sikre at mappen eksisterer
    await fs.mkdir(statusMappe, { recursive: true });
    
    const filsti = path.join(statusMappe, `${metadata.slug}.mdx`);
    await fs.writeFile(filsti, fullInnhold, 'utf-8');
    
    return filsti;
  }

  // Opprett YAML frontmatter
  private opprettFrontmatter(metadata: InnholdsMetadata): string {
    return `---
title: "${metadata.title}"
description: "${metadata.description}"
author: "${metadata.author}"
publishedDate: "${metadata.publishedDate}"
lastModified: "${metadata.lastModified}"
status: "${metadata.status}"
category: "${metadata.category}"
tags: [${metadata.tags.map(tag => `"${tag}"`).join(', ')}]
slug: "${metadata.slug}"
---`;
  }

  // List all content by category and status
  async listInnhold(kategori?: string, status?: string): Promise<MDXInnhold[]> {
    const innholdListe: MDXInnhold[] = [];
    
    const kategorier = kategori ? [kategori] : ['stories', 'people', 'places'];
    
    for (const kat of kategorier) {
      const mappe = status === 'published' 
        ? path.join(this.innholdssti, kat)
        : path.join(this.innholdssti, 'drafts', kat);
      
      try {
        const filer = await fs.readdir(mappe);
        const mdxFiler = filer.filter(fil => fil.endsWith('.mdx'));
        
        for (const fil of mdxFiler) {
          const filsti = path.join(mappe, fil);
          const innhold = await this.parseMDX(filsti);
          
          if (!status || innhold.metadata.status === status) {
            innholdListe.push(innhold);
          }
        }
      } catch (feil) {
        // Mappe eksisterer ikke, fortsett
        continue;
      }
    }
    
    return innholdListe.sort((a, b) => 
      new Date(b.metadata.lastModified).getTime() - new Date(a.metadata.lastModified).getTime()
    );
  }

  // Search content
  async søkInnhold(søketerm: string, kategori?: string): Promise<MDXInnhold[]> {
    const alleInnhold = await this.listInnhold(kategori);
    const søketermLower = søketerm.toLowerCase();
    
    return alleInnhold.filter(innhold => 
      innhold.metadata.title.toLowerCase().includes(søketermLower) ||
      innhold.metadata.description.toLowerCase().includes(søketermLower) ||
      innhold.content.toLowerCase().includes(søketermLower) ||
      innhold.metadata.tags.some(tag => tag.toLowerCase().includes(søketermLower))
    );
  }
}

// Export singleton instance
export const mdxProsessor = new MDXProsessor();

// Utility functions for English UI
export const formatDateForUI = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case 'draft': return 'Draft';
    case 'review': return 'Under Review';
    case 'published': return 'Published';
    default: return 'Unknown';
  }
};

export const getCategoryDisplayText = (category: string): string => {
  switch (category) {
    case 'story': return 'Story';
    case 'person': return 'Person';
    case 'place': return 'Place';
    default: return 'Content';
  }
};
EOF

echo ""
echo "✅ MDX processing system created!"
echo ""
echo "📋 MDX features implemented:"
echo "   ✅ Frontmatter parsing with metadata validation"
echo "   ✅ MDX compilation with remark plugins"
echo "   ✅ Content organization by category and status"
echo "   ✅ Word count and reading time calculation"
echo "   ✅ Search functionality across all content"
echo "   ✅ Norwegian backend with English UI utilities"
echo ""
echo "📁 Content structure:"
echo "   content/stories/ (published stories)"
echo "   content/people/ (published people profiles)"
echo "   content/places/ (published place descriptions)"
echo "   content/drafts/ (draft content by category)"
echo ""
echo "🚨 Phase 16: Content management foundation ready!"