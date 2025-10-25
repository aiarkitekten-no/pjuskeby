/**
 * GUARDRAILS CHECKPOINT v3.0 - UBRYTELIG
 * Entity Mention Detection System
 * Automatically detects and tracks mentions of people, places, businesses, streets in stories
 */

import fs from 'fs/promises';
import path from 'path';

// Entity data interfaces
interface Person {
  name: string;
  bio?: string;
  street?: string;
  age?: number;
  hobbies?: string[];
  workplace?: string;
  aliases?: string[];
}

interface Place {
  name: string;
  description?: string;
  aliases?: string[];
}

interface Business {
  name: string;
  description?: string;
  category?: string;
  aliases?: string[];
}

// Streets are stored as simple string array
type Street = string;

interface EntityMention {
  entityType: 'person' | 'place' | 'business' | 'street';
  entityId: string;
  entityName: string;
  mentionContext: string;
  mentionPosition: number;
  confidenceScore: number;
}

export type { EntityMention };

export class EntityMentionDetector {
  private entities: {
    people: Person[];
    places: Place[];
    businesses: Business[];
    streets: Street[];
  } = {
    people: [],
    places: [],
    businesses: [],
    streets: []
  };

  private initialized = false;

  /**
   * Initialize the detector by loading all entity data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load entity data from JSON files
      const dataPath = path.join(process.cwd(), 'httpdocs', 'json');
      
      const [peopleData, placesData, businessesData, streetsData] = await Promise.all([
        fs.readFile(path.join(dataPath, 'people.json'), 'utf-8'),
        fs.readFile(path.join(dataPath, 'placespjuskeby.json'), 'utf-8'),
        fs.readFile(path.join(dataPath, 'businesses.json'), 'utf-8'),
        fs.readFile(path.join(dataPath, 'streets.json'), 'utf-8')
      ]);

      this.entities.people = JSON.parse(peopleData);
      this.entities.places = JSON.parse(placesData);
      this.entities.businesses = JSON.parse(businessesData);
      this.entities.streets = JSON.parse(streetsData); // This is a string array

      this.initialized = true;
      console.log('✅ Entity mention detector initialized with:', {
        people: this.entities.people.length,
        places: this.entities.places.length,
        businesses: this.entities.businesses.length,
        streets: this.entities.streets.length
      });
    } catch (error) {
      console.error('❌ Failed to initialize entity mention detector:', error);
      throw error;
    }
  }

  /**
   * Detect all entity mentions in a story
   */
  async detectMentions(storyContent: string): Promise<EntityMention[]> {
    await this.initialize();

    const mentions: EntityMention[] = [];

    // Detect people mentions
    for (const person of this.entities.people) {
      const personMentions = this.findEntityMentions(
        storyContent,
        {
          ...person,
          id: this.generateEntityId(person)
        },
        'person'
      );
      mentions.push(...personMentions);
    }

    // Detect place mentions
    for (const place of this.entities.places) {
      const placeMentions = this.findEntityMentions(
        storyContent,
        {
          ...place,
          id: this.generateEntityId(place)
        },
        'place'
      );
      mentions.push(...placeMentions);
    }

    // Detect business mentions
    for (const business of this.entities.businesses) {
      const businessMentions = this.findEntityMentions(
        storyContent,
        {
          ...business,
          id: this.generateEntityId(business)
        },
        'business'
      );
      mentions.push(...businessMentions);
    }

    // Detect street mentions (streets are simple strings)
    for (let i = 0; i < this.entities.streets.length; i++) {
      const street = this.entities.streets[i];
      const streetMentions = this.findEntityMentions(
        storyContent,
        {
          name: street,
          id: this.generateStreetId(street)
        },
        'street'
      );
      mentions.push(...streetMentions);
    }

    // Remove duplicate mentions (same entity mentioned multiple times)
    const uniqueMentions = this.deduplicateMentions(mentions);

    console.log(`🔍 Detected ${uniqueMentions.length} unique entity mentions`);
    return uniqueMentions;
  }

  /**
   * Find mentions of a specific entity in text
   */
  private findEntityMentions(
    text: string,
    entity: Person | Place | Business | { name: string; id: string },
    entityType: 'person' | 'place' | 'business' | 'street'
  ): EntityMention[] {
    const mentions: EntityMention[] = [];
    
    // Get all possible names for this entity (main name + aliases)
    let names: string[] = [];
    
    if (entityType === 'street') {
      // Street is just a string, wrapped in an object
      names = [(entity as { name: string; id: string }).name];
    } else {
      // Other entities have name and optional aliases
      const entityWithAliases = entity as Person | Place | Business;
      names = [entityWithAliases.name, ...(entityWithAliases.aliases || [])];
    }
    
    for (const name of names) {
      if (!name || name.length < 2) continue;
      
      // Create case-insensitive regex with word boundaries
      const regex = new RegExp(`\\b${this.escapeRegex(name)}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const position = match.index;
        const context = this.extractContext(text, position, name.length);
        
        // Calculate confidence based on context and exact match
        const entityName = entityType === 'street' 
          ? (entity as { name: string; id: string }).name 
          : (entity as Person | Place | Business).name;
        const confidence = this.calculateConfidence(name, entityName, context, entityType);
        
        const entityId = entityType === 'street' 
          ? (entity as { name: string; id: string }).id
          : this.generateEntityId(entity as Person | Place | Business);
        
        mentions.push({
          entityType,
          entityId,
          entityName, // Always use canonical name
          mentionContext: context,
          mentionPosition: position,
          confidenceScore: confidence
        });
      }
    }
    
    return mentions;
  }

  /**
   * Extract surrounding context for a mention
   */
  private extractContext(text: string, position: number, matchLength: number): string {
    const contextRadius = 50; // Characters before and after
    const start = Math.max(0, position - contextRadius);
    const end = Math.min(text.length, position + matchLength + contextRadius);
    
    return text.substring(start, end).trim();
  }

  /**
   * Calculate confidence score for a mention
   */
  private calculateConfidence(
    matchedName: string,
    canonicalName: string,
    context: string,
    entityType: string
  ): number {
    let confidence = 0.8; // Base confidence
    
    // Exact name match gets higher confidence
    if (matchedName.toLowerCase() === canonicalName.toLowerCase()) {
      confidence += 0.15;
    }
    
    // Proper context indicators boost confidence
    const contextIndicators = {
      person: ['sa', 'fortalte', 'møtte', 'snakket med', 'ifølge'],
      place: ['i', 'på', 'ved', 'nær', 'til', 'fra'],
      business: ['hos', 'på', 'butikk', 'restaurant', 'cafe', 'bedrift'],
      street: ['gate', 'vei', 'plass', 'i', 'på', 'langs']
    };
    
    const indicators = contextIndicators[entityType as keyof typeof contextIndicators] || [];
    const hasContextIndicator = indicators.some(indicator => 
      context.toLowerCase().includes(indicator)
    );
    
    if (hasContextIndicator) {
      confidence += 0.05;
    }
    
    // Cap at 1.0
    return Math.min(1.0, confidence);
  }

  /**
   * Remove duplicate mentions of the same entity
   */
  private deduplicateMentions(mentions: EntityMention[]): EntityMention[] {
    const seen = new Set<string>();
    const unique: EntityMention[] = [];
    
    for (const mention of mentions) {
      const key = `${mention.entityType}:${mention.entityId}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(mention);
      }
    }
    
    return unique;
  }

  /**
   * Generate a consistent ID for an entity
   */
  private generateEntityId(entity: Person | Place | Business): string {
    return entity.name.toLowerCase()
      .replace(/[æåä]/g, 'a')
      .replace(/[øö]/g, 'o')  
      .replace(/[éè]/g, 'e')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate a consistent ID for a street (which is just a string)
   */
  private generateStreetId(streetName: string): string {
    return streetName.toLowerCase()
      .replace(/[æåä]/g, 'a')
      .replace(/[øö]/g, 'o')
      .replace(/[éè]/g, 'e')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get statistics about loaded entities
   */
  getEntityStats() {
    return {
      people: this.entities.people.length,
      places: this.entities.places.length,
      businesses: this.entities.businesses.length,
      streets: this.entities.streets.length,
      total: this.entities.people.length + 
             this.entities.places.length + 
             this.entities.businesses.length + 
             this.entities.streets.length
    };
  }
}

// Export singleton instance
export const entityMentionDetector = new EntityMentionDetector();