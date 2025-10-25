#!/bin/bash

# enhance-profile-v2.sh
# Complete automated profile enhancement for Pjuskeby entities
# Based on learnings from Boris Blundercheek implementation (2025-10-25)
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
${CYAN}Pjuskeby Profile Enhancement Tool v2.0${NC}

${GREEN}Usage:${NC}
    $0 <URL> [--dry-run] [--help]

${GREEN}Arguments:${NC}
    URL                 Full URL to entity profile
                        Examples:
                          https://pjuskeby.org/personer/boris-blundercheek
                          https://pjuskeby.org/bedrifter/the-sock-exchange

${GREEN}Options:${NC}
    --dry-run           Preview actions without executing
    -h, --help          Show this help message

${GREEN}Requirements:${NC}
    - Must run as root (handles sudo operations automatically)
    - OpenAI API key in environment (for bio generation)
    - Runware API key configured (for portraits)

${GREEN}What this script does:${NC}
    1. Fetches existing profile data
    2. Generates extended biography (800-1200 words, Agatha style)
    3. Creates AI portrait (1024x1024, vintage aesthetic)
    4. Deploys to ALL required locations:
       - content/data/{slug}-extended.json
       - public/assets/agatha/{type}/{slug}.png
       - dist/client/assets/agatha/{type}/{slug}.png  ← CRITICAL
       - httpdocs/assets/agatha/{type}/{slug}.png
    5. Restarts PM2
    6. Verifies biography and image are live

${GREEN}Examples:${NC}
    # Preview what would be done
    $0 https://pjuskeby.org/personer/nigel-noodlefork --dry-run
    
    # Execute full enhancement
    $0 https://pjuskeby.org/personer/nigel-noodlefork

${YELLOW}Note:${NC} See AI-learned/peoplemaker.json for full documentation

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

# Check if running as root
if [ "$EUID" -ne 0 ] && [ "$DRY_RUN" = false ]; then
    error "This script must be run as root (to handle file permissions automatically)\nRun: sudo $0 $URL"
fi

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
ENTITY_AGE=$(echo "$ENTITY_DATA" | jq -r '.age // 0')
ENTITY_OCCUPATION=$(echo "$ENTITY_DATA" | jq -r '.occupation // ""')

log "Found: $ENTITY_NAME"
log "ID: $ENTITY_ID"
success "Existing data fetched"

# Step 3: Check reference profile for style
step "Step 3/7: Checking reference profile"

REFERENCE_FILE="content/data/milly-wiggleflap-extended.json"
if [ ! -f "$REFERENCE_FILE" ]; then
    warning "Reference profile not found: $REFERENCE_FILE"
    REFERENCE_WORD_COUNT=971
else
    REFERENCE_WORD_COUNT=$(jq -r '.bio_full' "$REFERENCE_FILE" | wc -w)
    log "Reference (Milly Wiggleflap): $REFERENCE_WORD_COUNT words"
fi

TARGET_WORD_COUNT=1000
log "Target word count: $TARGET_WORD_COUNT words"
success "Reference checked"

# Step 4: Generate extended biography
step "Step 4/7: Generating extended biography"

TEMP_EXTENDED="/tmp/${SLUG}-extended.json"

if [ "$DRY_RUN" = true ]; then
    log "Would generate biography with:"
    log "  • Target: $TARGET_WORD_COUNT words"
    log "  • Style: Whimsical, absurd (Milly Wiggleflap reference)"
    log "  • Sections: Workplace, Theory/Hobby, Collection, Ritual, Loves, Hates, Daily Life"
    log "Would save to: $TEMP_EXTENDED"
    success "Biography generation simulated"
else
    log "Using OpenAI GPT-4 to generate 1000-1200 word biography"
    log "Reference: Milly Wiggleflap ($REFERENCE_WORD_COUNT words)"
    log ""
    
    # Generate biography using OpenAI
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
    
    if [ ! -f "$TEMP_EXTENDED" ]; then
        error "Extended JSON not found at $TEMP_EXTENDED after generation"
    fi
    
    # Validate JSON
    if ! jq '.' "$TEMP_EXTENDED" > /dev/null 2>&1; then
        error "Invalid JSON in $TEMP_EXTENDED. Run: jq '.' $TEMP_EXTENDED"
    fi
    
    # Check word count - use type-specific field name
    if [ "$ENTITY_TYPE" = "person" ]; then
        BIO_WORD_COUNT=$(jq -r '.bio_full' "$TEMP_EXTENDED" | wc -w | xargs)
    else
        BIO_WORD_COUNT=$(jq -r '.description_full' "$TEMP_EXTENDED" | wc -w | xargs)
    fi
    log "Content word count: $BIO_WORD_COUNT words"
    
    if [ "$BIO_WORD_COUNT" -lt 800 ]; then
        warning "Word count is below 800 words (got $BIO_WORD_COUNT)"
    fi
    
    success "Extended JSON generated and validated"
fi

# Step 5: Generate AI portrait
step "Step 5/7: Generating AI portrait"

TEMP_IMAGE="/tmp/${SLUG}.png"

if [ "$DRY_RUN" = true ]; then
    log "Would generate image using:"
    log "  • API: Runware (https://api.runware.ai/v1)"
    log "  • Model: runware:100@1 (SDXL Base)"
    log "  • Size: 1024x1024 PNG"
    log "  • Style: Vintage hand-tinted photograph"
    log "  • Type-specific prompting (person/business/place/street)"
    log "Would download to: $TEMP_IMAGE"
    success "Image generation simulated"
else
    # Read type-specific fields from extended JSON
    if [ "$ENTITY_TYPE" = "person" ]; then
        PORTRAIT_GENDER=$(jq -r '.gender // "unknown"' "$TEMP_EXTENDED")
        PORTRAIT_AGE=$(jq -r '.age // "N/A"' "$TEMP_EXTENDED")
        PORTRAIT_TRAITS=$(jq -r '.traits | join(", ")' "$TEMP_EXTENDED")
        
        log "Generating image with:"
        log "  • Type: $ENTITY_TYPE"
        log "  • Gender: $PORTRAIT_GENDER"
        log "  • Age: $PORTRAIT_AGE"
        log "  • Traits: $PORTRAIT_TRAITS"
    else
        # For business/place/street - use description/features
        PORTRAIT_GENDER="N/A"
        PORTRAIT_AGE="N/A"
        
        # For businesses: include name and category for better context
        if [ "$ENTITY_TYPE" = "business" ]; then
            BUSINESS_NAME=$(jq -r '.name // "Unknown Business"' "$TEMP_EXTENDED")
            BUSINESS_CATEGORY=$(jq -r '.category // ""' "$TEMP_EXTENDED")
            BUSINESS_KEYWORDS=$(jq -r '.business_keywords // ""' "$TEMP_EXTENDED")
            BUSINESS_DESC=$(jq -r '.description_short // .description // ""' "$TEMP_EXTENDED")
            
            # Build detailed prompt with keywords for better accuracy
            if [ -n "$BUSINESS_KEYWORDS" ]; then
                PORTRAIT_TRAITS="${BUSINESS_NAME} | Keywords: ${BUSINESS_KEYWORDS} | ${BUSINESS_DESC}"
            elif [ -n "$BUSINESS_CATEGORY" ]; then
                PORTRAIT_TRAITS="${BUSINESS_NAME} - ${BUSINESS_CATEGORY}: ${BUSINESS_DESC}"
            else
                PORTRAIT_TRAITS="${BUSINESS_NAME}: ${BUSINESS_DESC}"
            fi
        else
            # For place/street - use characteristics or description
            PORTRAIT_TRAITS=$(jq -r 'if (.characteristics // []) | length > 0 then (.characteristics | join(", ")) elif (.features // []) | length > 0 then (.features | join(", ")) else (.description_short // .description // "whimsical Norwegian location") end' "$TEMP_EXTENDED")
        fi
        
        log "Generating image with:"
        log "  • Type: $ENTITY_TYPE"
        log "  • Description: $PORTRAIT_TRAITS"
    fi
    log ""
    
    # Use the new generate-portrait.mjs script (now takes entity type)
    log "Calling generate-portrait.mjs (this may take 15-30 seconds)..."
    PORTRAIT_OUTPUT=$(node scripts/generate-portrait.mjs "$SLUG" "$ENTITY_TYPE" "$PORTRAIT_GENDER" "$PORTRAIT_AGE" "$PORTRAIT_TRAITS" 2>&1)
    
    if [ $? -ne 0 ]; then
        error "Image generation failed:\n$PORTRAIT_OUTPUT"
    fi
    
    echo "$PORTRAIT_OUTPUT"
    
    if [ ! -f "$TEMP_IMAGE" ]; then
        error "Image not found at $TEMP_IMAGE after generation"
    fi
    
    IMAGE_SIZE=$(du -h "$TEMP_IMAGE" | cut -f1)
    log "Downloaded: $IMAGE_SIZE"
    success "Portrait generated successfully"
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
    chown pjuskebysverden:psacln "$EXTENDED_DEST"
    chmod 644 "$EXTENDED_DEST"
    
    success "✓ Extended JSON deployed: $EXTENDED_DEST"
    
    log "Deploying image to PUBLIC (source for builds)..."
    
    PUBLIC_DEST="public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    mkdir -p "$(dirname "$PUBLIC_DEST")"
    cp "$TEMP_IMAGE" "$PUBLIC_DEST"
    chown pjuskebysverden:psacln "$PUBLIC_DEST"
    chmod 644 "$PUBLIC_DEST"
    
    success "✓ Image deployed to public/: $PUBLIC_DEST"
    
    log "Deploying image to DIST/CLIENT (CRITICAL - Astro SSR serves from here)..."
    
    DIST_DEST="dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    mkdir -p "$(dirname "$DIST_DEST")"
    cp "$TEMP_IMAGE" "$DIST_DEST"
    chown pjuskebysverden:psacln "$DIST_DEST"
    chmod 644 "$DIST_DEST"
    
    success "✓ Image deployed to dist/client/: $DIST_DEST"
    
    log "Deploying image to HTTPDOCS (final web serving)..."
    
    HTTPDOCS_DEST="httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    mkdir -p "$(dirname "$HTTPDOCS_DEST")"
    rsync -a "$DIST_DEST" "$HTTPDOCS_DEST"
    chown pjuskebysverden:psacln "$HTTPDOCS_DEST"
    chmod 644 "$HTTPDOCS_DEST"
    
    success "✓ Image deployed to httpdocs/: $HTTPDOCS_DEST"
    
    log "Restarting PM2..."
    su - pjuskebysverden -c "pm2 restart pjuskeby-web" > /dev/null 2>&1
    
    sleep 3
    
    success "PM2 restarted"
fi

# Step 7: Verification
step "Step 7/7: Verification"

if [ "$DRY_RUN" = true ]; then
    log "Would verify:"
    log "  • Biography visible at $URL"
    log "  • Image returns HTTP 200: https://pjuskeby.org/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    success "Verification simulated"
else
    log "Verifying biography..."
    sleep 2  # Give PM2 time to stabilize
    
    if curl -s "$URL" | grep -q "The Full Story of"; then
        success "✓ Biography is visible on page"
    else
        warning "⚠ Could not confirm biography visibility (check manually)"
    fi
    
    log "Verifying image..."
    
    IMAGE_HTTP_STATUS=$(curl -sI "https://pjuskeby.org/assets/agatha/${ENTITY_TYPE}/${SLUG}.png" | head -1)
    
    if echo "$IMAGE_HTTP_STATUS" | grep -q "200"; then
        success "✓ Image is accessible (HTTP 200)"
    else
        warning "⚠ Image returned: $IMAGE_HTTP_STATUS"
        warning "  Check: https://pjuskeby.org/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
    fi
    
    log "Checking file locations..."
    
    ls -lh "content/data/${SLUG}-extended.json" 2>&1 | head -1
    ls -lh "public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png" 2>&1 | head -1
    ls -lh "dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png" 2>&1 | head -1
    ls -lh "httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png" 2>&1 | head -1
fi

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✨ Enhancement Complete! ✨                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Profile URL:${NC}      $URL"
echo -e "${CYAN}Extended JSON:${NC}    content/data/${SLUG}-extended.json"
echo -e "${CYAN}Portrait:${NC}         https://pjuskeby.org/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
echo ""
echo -e "${GREEN}Files deployed to:${NC}"
echo "  ✓ content/data/${SLUG}-extended.json"
echo "  ✓ public/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
echo "  ✓ dist/client/assets/agatha/${ENTITY_TYPE}/${SLUG}.png  ← CRITICAL"
echo "  ✓ httpdocs/assets/agatha/${ENTITY_TYPE}/${SLUG}.png"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Visit: $URL"
echo "  2. Verify biography appears in 'The Full Story' section"
echo "  3. Verify portrait image loads without fallback"
echo "  4. Check word count is 800-1200 (reference: Milly = $REFERENCE_WORD_COUNT)"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔄 This was a DRY RUN - no changes made${NC}"
    echo -e "${YELLOW}   Run without --dry-run to execute${NC}"
fi

echo -e "${BLUE}📖 Full documentation: AI-learned/peoplemaker.json${NC}"
echo ""

exit 0
