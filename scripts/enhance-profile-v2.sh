#!/bin/bash

# enhance-profile-v2.sh
# Complete automated profile enhancement for Pjuskeby entities
# Based on learnings from Boris Blundercheek implementation (2025-10-25)
# Updated 2025-10-26: Added street support with dedicated generation scripts
# 
# This script MUST be run as root to handle all file operations automatically
# See AI-learned/peoplemaker.json for complete documentation

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"  && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default values
DRY_RUN=false
URL=""
ENTITY_TYPE=""
SLUG=""

# Logging functions
log() { echo -e "${BLUE}ℹ${NC}  $1"; }
success() { echo -e "${GREEN}✓${NC}  $1"; }
warning() { echo -e "${YELLOW}⚠${NC}  $1"; }
error() { echo -e "${RED}✗${NC}  $1"; exit 1; }
step() { echo -e "\n${CYAN}▶${NC}  ${CYAN}$1${NC}\n"; }

show_help() {
    cat << EOF
${CYAN}Pjuskeby Profile Enhancement Tool v2.1${NC}

${GREEN}Usage:${NC}
    $0 <URL> [--dry-run] [--help]

${GREEN}Arguments:${NC}
    URL                 Full URL to entity profile
                        Examples:
                          https://pjuskeby.org/personer/boris-blundercheek
                          https://pjuskeby.org/bedrifter/the-sock-exchange
                          https://pjuskeby.org/gater/snoreberry-lane

${GREEN}Options:${NC}
    --dry-run           Preview actions without executing
    -h, --help          Show this help message

${GREEN}Requirements:${NC}
    - OpenAI API key in environment (for bio/profile generation)
    - Runware API key configured (for portraits/images)
    - sudo access (uses sudo-wrapper.sh for file operations)

${GREEN}What this script does:${NC}
    For People/Businesses/Places:
      1. Fetches existing profile data
      2. Generates extended biography (800-1200 words, Agatha style)
      3. Creates AI portrait (1024x1024, vintage aesthetic)
    
    For Streets:
      1. Fetches existing street data
      2. Generates extended profile (Norwegian small-town charm)
      3. Creates AI street scene (1024x768, whimsical aesthetic)
    
    Then for all types:
      4. Deploys to ALL required locations
      5. Restarts PM2
      6. Verifies content is live

${GREEN}Examples:${NC}
    # Preview what would be done
    $0 https://pjuskeby.org/gater/gnomewobble-rise --dry-run
    
    # Execute full enhancement
    $0 https://pjuskeby.org/gater/gnomewobble-rise

${YELLOW}Note:${NC} See AI-learned/peoplemaker.json and AI-learned/streets-system.md for documentation

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        http*)
            URL="$1"
            shift
            ;;
        *)
            error "Unknown option: $1\nUse --help for usage information"
            ;;
    esac
done

# Validate URL
if [ -z "$URL" ]; then
    error "URL required. Use --help for usage information"
fi

# Note: This script uses sudo-wrapper.sh for privileged operations
# No need to run the entire script as root

# Extract entity type and slug from URL
step "Step 1/7: Parsing URL"

if [[ "$URL" =~ https://pjuskeby\.org/personer/([a-z0-9-]+) ]]; then
    ENTITY_TYPE="person"
    ENTITY_TYPE_PLURAL="personer"
    SLUG="${BASH_REMATCH[1]}"
elif [[ "$URL" =~ https://pjuskeby\.org/bedrifter/([a-z0-9-]+) ]]; then
    ENTITY_TYPE="business"
    ENTITY_TYPE_PLURAL="bedrifter"
    SLUG="${BASH_REMATCH[1]}"
elif [[ "$URL" =~ https://pjuskeby\.org/steder/([a-z0-9-]+) ]]; then
    ENTITY_TYPE="place"
    ENTITY_TYPE_PLURAL="steder"
    SLUG="${BASH_REMATCH[1]}"
elif [[ "$URL" =~ https://pjuskeby\.org/gater/([a-z0-9-]+) ]]; then
    ENTITY_TYPE="street"
    ENTITY_TYPE_PLURAL="gater"
    SLUG="${BASH_REMATCH[1]}"
else
    error "Invalid URL format. Must be https://pjuskeby.org/{personer|bedrifter|steder|gater}/{slug}"
fi

log "Entity type: $ENTITY_TYPE"
log "Slug: $SLUG"
success "URL parsed successfully"

# Step 2: Fetch existing data
step "Step 2/7: Fetching existing data"

# Map Norwegian plural to English file names
case $ENTITY_TYPE in
    person)   NORMALIZED_FILE="content/data/people.normalized.json" ;;
    business) NORMALIZED_FILE="content/data/businesses.normalized.json" ;;
    place)    NORMALIZED_FILE="content/data/places.normalized.json" ;;
    street)   NORMALIZED_FILE="content/data/streets.normalized.json" ;;
    *)        NORMALIZED_FILE="content/data/${ENTITY_TYPE_PLURAL}.normalized.json" ;;
esac

if [ ! -f "$NORMALIZED_FILE" ]; then
    error "Normalized data file not found: $NORMALIZED_FILE"
fi

log "Reading from: $NORMALIZED_FILE"

# Extract entity data using jq
ENTITY_DATA=$(jq ".[] | select(.slug == \"$SLUG\")" "$NORMALIZED_FILE")

if [ -z "$ENTITY_DATA" ] || [ "$ENTITY_DATA" = "null" ]; then
    error "Entity with slug '$SLUG' not found in $NORMALIZED_FILE"
fi

ENTITY_NAME=$(echo "$ENTITY_DATA" | jq -r '.name')
ENTITY_ID=$(echo "$ENTITY_DATA" | jq -r '.id')

log "Found: $ENTITY_NAME"
log "ID: $ENTITY_ID"
success "Existing data fetched"

# Step 3: Check reference profile for style
step "Step 3/7: Checking reference profile"

if [ "$ENTITY_TYPE" = "street" ]; then
    REFERENCE_FILE="content/data/snoreberry-lane-extended.json"
    if [ ! -f "$REFERENCE_FILE" ]; then
        warning "Reference street profile not found: $REFERENCE_FILE"
        REFERENCE_WORD_COUNT=200
    else
        REFERENCE_WORD_COUNT=$(jq -r '.description' "$REFERENCE_FILE" | wc -w)
        log "Reference (Snoreberry Lane): $REFERENCE_WORD_COUNT words"
    fi
    TARGET_WORD_COUNT=200
else
    REFERENCE_FILE="content/data/milly-wiggleflap-extended.json"
    if [ ! -f "$REFERENCE_FILE" ]; then
        warning "Reference profile not found: $REFERENCE_FILE"
        REFERENCE_WORD_COUNT=971
    else
        REFERENCE_WORD_COUNT=$(jq -r '.bio_full' "$REFERENCE_FILE" | wc -w)
        log "Reference (Milly Wiggleflap): $REFERENCE_WORD_COUNT words"
    fi
    TARGET_WORD_COUNT=1000
fi

log "Target word count: $TARGET_WORD_COUNT words"
success "Reference checked"

# Step 4: Generate extended profile/biography
step "Step 4/7: Generating extended content"

TEMP_EXTENDED="/tmp/${SLUG}-extended.json"

if [ "$DRY_RUN" = true ]; then
    if [ "$ENTITY_TYPE" = "street" ]; then
        log "Would generate street profile with:"
        log "  • Target: 150-200 words"
        log "  • Style: Norwegian small-town charm (Astrid Lindgren/Anne-Cath Vestly)"
        log "  • Sections: Description, Features, Mythological Sightings, Anecdotes, Fun Facts"
    else
        log "Would generate biography with:"
        log "  • Target: $TARGET_WORD_COUNT words"
        log "  • Style: Whimsical, absurd (Milly Wiggleflap reference)"
        log "  • Sections: Workplace, Theory/Hobby, Collection, Ritual, Loves, Hates, Daily Life"
    fi
    log "Would save to: $TEMP_EXTENDED"
    success "Content generation simulated"
else
    if [ "$ENTITY_TYPE" = "street" ]; then
        log "Using OpenAI GPT-4o to generate street profile (150-200 words)"
        log "Style: Norwegian small-town charm"
        log ""
        
        log "Calling generate-street-profile.ts..."
        log ""
        
        # Run with real-time output and capture exit code
        node scripts/generate-biography.mjs "$SLUG" "street"
        PROFILE_EXIT_CODE=$?
        
        if [ $PROFILE_EXIT_CODE -ne 0 ]; then
            error "❌ Street profile generation failed with exit code: $PROFILE_EXIT_CODE"
        fi
        
        log ""
        
        # generate-biography.mjs writes to /tmp/ - move it to our temp location
        if [ ! -f "/tmp/${SLUG}-extended.json" ]; then
            error "❌ Extended JSON not found at /tmp/${SLUG}-extended.json after generation"
        fi
        
        cp "/tmp/${SLUG}-extended.json" "$TEMP_EXTENDED"
    else
        log "Using OpenAI GPT-4 to generate 1000-1200 word biography"
        log "Reference: Milly Wiggleflap ($REFERENCE_WORD_COUNT words)"
        log ""
        
        log "Calling generate-biography.mjs..."
        BIO_OUTPUT=$(node scripts/generate-biography.mjs "$SLUG" "$ENTITY_TYPE" 2>&1)
        
        if [ $? -ne 0 ]; then
            error "Biography generation failed:\n$BIO_OUTPUT"
        fi
        
        echo "$BIO_OUTPUT"
        
        # Extract gender from output (only for person entities)
        GENDER=$(echo "$BIO_OUTPUT" | grep "^GENDER=" | cut -d'=' -f2 || echo "")
        if [ -n "$GENDER" ]; then
            log "Detected gender: $GENDER"
        fi
    fi
    
    if [ ! -f "$TEMP_EXTENDED" ]; then
        error "Extended JSON not found at $TEMP_EXTENDED after generation"
    fi
    
    # Validate JSON
    if ! jq '.' "$TEMP_EXTENDED" > /dev/null 2>&1; then
        error "Invalid JSON in $TEMP_EXTENDED. Run: jq '.' $TEMP_EXTENDED"
    fi
    
    # Check word count - use type-specific field name
    if [ "$ENTITY_TYPE" = "street" ]; then
        CONTENT_WORD_COUNT=$(jq -r '.description' "$TEMP_EXTENDED" | wc -w | xargs)
    elif [ "$ENTITY_TYPE" = "person" ]; then
        CONTENT_WORD_COUNT=$(jq -r '.bio_full' "$TEMP_EXTENDED" | wc -w | xargs)
    else
        CONTENT_WORD_COUNT=$(jq -r '.description_full' "$TEMP_EXTENDED" | wc -w | xargs)
    fi
    log "Content word count: $CONTENT_WORD_COUNT words"
    
    if [ "$ENTITY_TYPE" != "street" ] && [ "$CONTENT_WORD_COUNT" -lt 800 ]; then
        warning "Word count is below 800 words (got $CONTENT_WORD_COUNT)"
    fi
    
    success "Extended JSON generated and validated"
fi

# Step 5: Generate AI image/portrait
step "Step 5/7: Generating AI image"

TEMP_IMAGE="/tmp/${SLUG}.png"

if [ "$DRY_RUN" = true ]; then
    if [ "$ENTITY_TYPE" = "street" ]; then
        log "Would generate street scene using:"
        log "  • API: Runware"
        log "  • Model: Deliberate V2"
        log "  • Size: 1024x768 PNG"
        log "  • Style: Norwegian small-town, children playing, mythological creatures"
    else
        log "Would generate portrait using:"
        log "  • API: Runware"
        log "  • Model: runware:100@1 (SDXL Base)"
        log "  • Size: 1024x1024 PNG"
        log "  • Style: Vintage hand-tinted photograph"
    fi
    log "Would download to: $TEMP_IMAGE"
    success "Image generation simulated"
else
    if [ "$ENTITY_TYPE" = "street" ]; then
        log "Generating street scene with Runware (1024x768)..."
        log "Style: Norwegian small-town with mythological creatures"
        log ""
        
        log "Calling generate-street-image.mjs (this may take 15-30 seconds)..."
        log ""
        
        # Run with real-time output and capture exit code
        node scripts/generate-street-image.mjs "$SLUG"
        IMAGE_EXIT_CODE=$?
        
        if [ $IMAGE_EXIT_CODE -ne 0 ]; then
            error "❌ Street image generation failed with exit code: $IMAGE_EXIT_CODE"
        fi
        
        log ""
        
        # Verify image was generated
        if [ ! -f "public/assets/agatha/street/${SLUG}.png" ]; then
            error "❌ Image not found at public/assets/agatha/street/${SLUG}.png after generation"
        fi
        
        # Move from public location to temp for deployment
        cp "public/assets/agatha/street/${SLUG}.png" "$TEMP_IMAGE"
        log "✅ Copied image to temp location for deployment"
        success "Street image generated and prepared for deployment"
    else
        # Read type-specific fields from extended JSON
        if [ "$ENTITY_TYPE" = "person" ]; then
            PORTRAIT_GENDER=$(jq -r '.gender // "unknown"' "$TEMP_EXTENDED")
            PORTRAIT_AGE=$(jq -r '.age // "N/A"' "$TEMP_EXTENDED")
            PORTRAIT_TRAITS=$(jq -r '.traits | join(", ")' "$TEMP_EXTENDED")
            
            log "Generating portrait with:"
            log "  • Type: $ENTITY_TYPE"
            log "  • Gender: $PORTRAIT_GENDER"
            log "  • Age: $PORTRAIT_AGE"
            log "  • Traits: $PORTRAIT_TRAITS"
        else
            PORTRAIT_GENDER="N/A"
            PORTRAIT_AGE="N/A"
            
            if [ "$ENTITY_TYPE" = "business" ]; then
                BUSINESS_NAME=$(jq -r '.name // "Unknown Business"' "$TEMP_EXTENDED")
                BUSINESS_CATEGORY=$(jq -r '.category // ""' "$TEMP_EXTENDED")
                BUSINESS_KEYWORDS=$(jq -r '.business_keywords // ""' "$TEMP_EXTENDED")
                BUSINESS_DESC=$(jq -r '.description_short // .description // ""' "$TEMP_EXTENDED")
                
                if [ -n "$BUSINESS_KEYWORDS" ]; then
                    PORTRAIT_TRAITS="${BUSINESS_NAME} | Keywords: ${BUSINESS_KEYWORDS} | ${BUSINESS_DESC}"
                elif [ -n "$BUSINESS_CATEGORY" ]; then
                    PORTRAIT_TRAITS="${BUSINESS_NAME} - ${BUSINESS_CATEGORY}: ${BUSINESS_DESC}"
                else
                    PORTRAIT_TRAITS="${BUSINESS_NAME}: ${BUSINESS_DESC}"
                fi
            else
                PORTRAIT_TRAITS=$(jq -r 'if (.characteristics // []) | length > 0 then (.characteristics | join(", ")) elif (.features // []) | length > 0 then (.features | join(", ")) else (.description_short // .description // "whimsical Norwegian location") end' "$TEMP_EXTENDED")
            fi
            
            log "Generating image with:"
            log "  • Type: $ENTITY_TYPE"
            log "  • Description: $PORTRAIT_TRAITS"
        fi
        log ""
        
        log "Calling generate-portrait.mjs (this may take 15-30 seconds)..."
        PORTRAIT_OUTPUT=$(node scripts/generate-portrait.mjs "$SLUG" "$ENTITY_TYPE" "$PORTRAIT_GENDER" "$PORTRAIT_AGE" "$PORTRAIT_TRAITS" 2>&1)
        
        if [ $? -ne 0 ]; then
            error "Image generation failed:\n$PORTRAIT_OUTPUT"
        fi
        
        echo "$PORTRAIT_OUTPUT"
    fi
    
    if [ ! -f "$TEMP_IMAGE" ]; then
        error "Image not found at $TEMP_IMAGE after generation"
    fi
    
    IMAGE_SIZE=$(du -h "$TEMP_IMAGE" | cut -f1)
    log "Image size: $IMAGE_SIZE"
    success "Image generated successfully"
fi

# Step 6: Deploy files to ALL required locations
step "Step 6/7: Deploying files (CRITICAL STEP)"

if [ "$DRY_RUN" = true ]; then
    log "Would deploy extended JSON to:"
    log "  1. content/data/${SLUG}-extended.json"
    log ""
    log "Would deploy image to:"
    log "  1. public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    log "  2. dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png  ← CRITICAL for Astro SSR"
    log "  3. httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    log ""
    log "Would restart PM2"
    success "Deployment simulated"
else
    log "Deploying extended JSON..."
    
    EXTENDED_DEST="content/data/${SLUG}-extended.json"
    cp "$TEMP_EXTENDED" "$EXTENDED_DEST"
    
    success "✓ Extended JSON deployed: $EXTENDED_DEST"
    
    log "Verifying image in PUBLIC (source for builds)..."
    
    PUBLIC_DEST="public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    if [ ! -f "$PUBLIC_DEST" ]; then
        error "❌ Image not found at $PUBLIC_DEST - generation script should have created it"
    fi
    
    success "✓ Image verified in public/: $PUBLIC_DEST"
    
    log "Deploying image to DIST/CLIENT (CRITICAL - Astro SSR serves from here)..."
    
    DIST_DEST="dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    DIST_DIR="$(dirname "$DIST_DEST")"
    
    # Create directory if it doesn't exist
    if [ ! -d "$DIST_DIR" ]; then
        mkdir -p "$DIST_DIR"
    fi
    
    # Try direct copy first, use sudo-wrapper if permission denied
    if ! cp "$PUBLIC_DEST" "$DIST_DEST" 2>/dev/null; then
        log "Permission denied, using sudo-wrapper..."
        sudo "$SCRIPT_DIR/sudo-wrapper.sh" copy-image "$TEMP_IMAGE" "$DIST_DEST"
    fi
    
    success "✓ Image deployed to dist/client/: $DIST_DEST"
    
    log "Deploying image to HTTPDOCS (final web serving)..."
    
    HTTPDOCS_DEST="httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    mkdir -p "$(dirname "$HTTPDOCS_DEST")"
    
    # Image already exists in httpdocs from generation script, verify it
    if [ -f "$HTTPDOCS_DEST" ]; then
        success "✓ Image already in httpdocs/: $HTTPDOCS_DEST"
    else
        sudo "$SCRIPT_DIR/sudo-wrapper.sh" copy-image "$TEMP_IMAGE" "$HTTPDOCS_DEST"
        success "✓ Image deployed to httpdocs/: $HTTPDOCS_DEST"
    fi
    
    log "Restarting PM2..."
    pm2 restart pjuskeby-web > /dev/null 2>&1
    
    sleep 3
    
    success "PM2 restarted"
fi

# Step 7: Verification
step "Step 7/7: Verification"

if [ "$DRY_RUN" = true ]; then
    log "Would verify:"
    if [ "$ENTITY_TYPE" = "street" ]; then
        log "  • Profile visible at $URL"
    else
        log "  • Biography visible at $URL"
    fi
    log "  • Image returns HTTP 200: https://pjuskeby.org/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    success "Verification simulated"
else
    log "Verifying content..."
    sleep 2  # Give PM2 time to stabilize
    
    if [ "$ENTITY_TYPE" = "street" ]; then
        if curl -s "$URL" | grep -q "About the street"; then
            success "✓ Profile is visible on page"
        else
            warning "⚠ Could not confirm profile visibility (check manually)"
        fi
    else
        if curl -s "$URL" | grep -q "The Full Story of"; then
            success "✓ Biography is visible on page"
        else
            warning "⚠ Could not confirm biography visibility (check manually)"
        fi
    fi
    
    log "Verifying image..."
    
    # Check all file locations
    LOCATIONS_OK=true
    
    if [ -f "public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png" ]; then
        success "✓ public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png exists"
    else
        warning "✗ public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png MISSING"
        LOCATIONS_OK=false
    fi
    
    if [ -f "dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png" ]; then
        success "✓ dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png exists (CRITICAL)"
    else
        warning "✗ dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png MISSING (CRITICAL)"
        LOCATIONS_OK=false
    fi
    
    if [ -f "httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png" ]; then
        success "✓ httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png exists"
    else
        warning "✗ httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png MISSING"
        LOCATIONS_OK=false
    fi
    
    # Check HTTP accessibility
    IMAGE_HTTP_STATUS=$(curl -sI "https://pjuskeby.org/assets/agatha/${ENTITY_TYPE}/${SLUG}.png" | head -1)
    
    if echo "$IMAGE_HTTP_STATUS" | grep -q "200"; then
        success "✓ Image is accessible via web (HTTP 200)"
    else
        warning "✗ Image returned: $IMAGE_HTTP_STATUS"
        warning "  URL: https://pjuskeby.org/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
        LOCATIONS_OK=false
    fi
    
    if [ "$LOCATIONS_OK" = false ]; then
        error "❌ Image deployment verification FAILED - not all locations have the image"
    else
        success "✅ All image locations verified successfully!"
    fi
fi

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✨ Enhancement Complete! ✨                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Profile URL:${NC}      $URL"
echo -e "${CYAN}Extended JSON:${NC}    content/data/${SLUG}-extended.json"
echo -e "${CYAN}Image:${NC}            https://pjuskeby.org/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
echo ""
echo -e "${GREEN}Files deployed to:${NC}"
echo "  ✓ content/data/${SLUG}-extended.json"
echo "  ✓ public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
echo "  ✓ dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png  ← CRITICAL"
echo "  ✓ httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Visit: $URL"
if [ "$ENTITY_TYPE" = "street" ]; then
    echo "  2. Verify profile appears on the page"
    echo "  3. Verify street scene image loads"
else
    echo "  2. Verify biography appears in 'The Full Story' section"
    echo "  3. Verify portrait image loads without fallback"
fi
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔄 This was a DRY RUN - no changes made${NC}"
    echo -e "${YELLOW}   Run without --dry-run to execute${NC}"
fi

echo -e "${BLUE}📖 Full documentation: AI-learned/peoplemaker.json, AI-learned/streets-system.md${NC}"
echo ""

exit 0
