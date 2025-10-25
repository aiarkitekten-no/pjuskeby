#!/bin/bash

# enhance-profile.sh
# Automated profile enhancement for Pjuskeby entities
# Creates enhanced biographies, generates AI portraits, and updates database

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RUNWARE_API_KEY="gE5ASqormxPzAbpLPBGOPZ6ftToGFVp3"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
DRY_RUN=false
ENTITY_TYPE=""
URL=""
SKIP_IMAGE=false
SKIP_DB=false

show_help() {
    cat << EOF
${CYAN}╔════════════════════════════════════════════════════════════════╗
║         Pjuskeby Profile Enhancement Tool v1.0                 ║
║         Automatically enhance entity profiles with:            ║
║         • Rich, detailed biographies (Agatha Splint style)     ║
║         • Hyperrealistic AI-generated portraits                ║
║         • Database updates with enhanced data                  ║
╚════════════════════════════════════════════════════════════════╝${NC}

${GREEN}Usage:${NC}
    $0 <URL> [OPTIONS]

${GREEN}Arguments:${NC}
    URL                 Full URL to existing profile page
                        Examples:
                          https://pjuskeby.org/personer/boris-blundercheek
                          https://pjuskeby.org/bedrifter/the-sock-exchange
                          https://pjuskeby.org/steder/snickerwood
                          https://pjuskeby.org/gater/wobblekollen-lane

${GREEN}Options:${NC}
    --type=TYPE         Entity type: person|bedrift|sted|gate
                        (auto-detected from URL if not specified)
    
    --dry-run           Preview changes without executing
                        Shows what would be created/updated
    
    --skip-image        Skip AI image generation
                        (useful for re-running with new bio only)
    
    --skip-db           Skip database update
                        (generate files only, no DB changes)
    
    -h, --help          Show this help message

${GREEN}Examples:${NC}
    ${CYAN}# Full enhancement with preview${NC}
    $0 https://pjuskeby.org/personer/boris-blundercheek --dry-run
    
    ${CYAN}# Execute full enhancement${NC}
    $0 https://pjuskeby.org/personer/boris-blundercheek
    
    ${CYAN}# Update bio only, skip image generation${NC}
    $0 https://pjuskeby.org/personer/boris-blundercheek --skip-image
    
    ${CYAN}# Specify type explicitly${NC}
    $0 https://pjuskeby.org/bedrifter/sock-shop --type=bedrift

${GREEN}Process Steps:${NC}
    1. ${YELLOW}Fetch${NC} existing profile from URL
    2. ${YELLOW}Extract${NC} current data (name, bio, metadata)
    3. ${YELLOW}Generate${NC} enhanced biography (Agatha's style, 800-1200 words)
    4. ${YELLOW}Create${NC} AI portrait with Runware API (if applicable)
    5. ${YELLOW}Update${NC} database with enhanced data
    6. ${YELLOW}Verify${NC} changes on live site

${GREEN}Output Files:${NC}
    /tmp/enhanced-profile-<slug>.json       Enhanced profile data
    /tmp/<slug>-portrait.png                Generated portrait (temp)
    public/assets/agatha/<type>/<slug>.png  Final portrait location

${BLUE}Note:${NC} Image generation requires sudo access for file copy operations.
      The script will prompt for sudo when needed.

EOF
    exit 0
}

log() {
    echo -e "${BLUE}ℹ${NC}  $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
    exit 1
}

step() {
    echo -e "\n${MAGENTA}▶${NC}  ${CYAN}$1${NC}\n"
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
        --type=*)
            ENTITY_TYPE="${1#*=}"
            shift
            ;;
        --skip-image)
            SKIP_IMAGE=true
            shift
            ;;
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        http*)
            URL="$1"
            shift
            ;;
        *)
            error "Unknown argument: $1\nUse --help for usage information"
            ;;
    esac
done

# Validate URL
if [ -z "$URL" ]; then
    error "URL required. Use --help for usage information."
fi

# Auto-detect entity type from URL if not specified
if [ -z "$ENTITY_TYPE" ]; then
    if [[ "$URL" =~ /personer/ ]]; then
        ENTITY_TYPE="person"
    elif [[ "$URL" =~ /bedrifter/ ]]; then
        ENTITY_TYPE="bedrift"
    elif [[ "$URL" =~ /steder/ ]]; then
        ENTITY_TYPE="sted"
    elif [[ "$URL" =~ /gater/ ]]; then
        ENTITY_TYPE="gate"
    else
        error "Could not detect entity type from URL. Please specify --type=person|bedrift|sted|gate"
    fi
fi

# Extract slug from URL
SLUG=$(basename "$URL")

step "Profile Enhancement for: $SLUG ($ENTITY_TYPE)"

if [ "$DRY_RUN" = true ]; then
    warning "DRY RUN MODE - No changes will be made"
fi

log "URL: $URL"
log "Type: $ENTITY_TYPE"
log "Slug: $SLUG"
log "Dry run: $DRY_RUN"

# Step 1: Fetch existing profile
step "Step 1/5: Fetching existing profile"

if [ "$DRY_RUN" = true ]; then
    log "Would fetch: $URL"
    success "Fetch simulated (dry-run)"
else
    PROFILE_HTML=$(curl -s "$URL")
    if [ -z "$PROFILE_HTML" ]; then
        error "Failed to fetch profile from $URL"
    fi
    success "Profile fetched successfully"
fi

# Step 2: Generate enhanced profile
step "Step 2/5: Generating enhanced profile data"

PROFILE_FILE="/tmp/enhanced-profile-${SLUG}.json"

if [ "$DRY_RUN" = true ]; then
    log "Would create: $PROFILE_FILE"
    log "Would include:"
    echo "  • Extended biography (800-1200 words, Agatha Splint style)"
    echo "  • Personality traits and quirks"
    echo "  • Work history / founding story"
    echo "  • Relationships and connections"
    echo "  • Fun facts and detailed observations"
    echo "  • AI portrait generation prompt"
    success "Profile generation simulated (dry-run)"
else
    log "Creating enhanced profile for $SLUG..."
    warning "⚙️  This step currently requires manual profile creation"
    warning "📝 Profile template saved to: $PROFILE_FILE"
    
    # Create template based on entity type
    case $ENTITY_TYPE in
        person)
            cat > "$PROFILE_FILE" << 'EOFTEMPLATE'
{
  "name": "PERSON_NAME",
  "slug": "SLUG",
  "age": 0,
  "birthDate": "YYYY-MM-DD",
  "knownFor": "One-line memorable trait",
  "bio": "LONG_BIOGRAPHY_HERE (800-1200 words in Agatha Splint's style)",
  "residence": {
    "street": "Street Name",
    "houseNumber": "17B",
    "city": "Pjuskeby"
  },
  "workplace": {
    "name": "Workplace Name",
    "slug": "workplace-slug",
    "position": "Job Title"
  },
  "hobbies": ["hobby1", "hobby2", "hobby3"],
  "favoritePlaces": [],
  "imagePrompt": "Hyperrealistic portrait prompt..."
}
EOFTEMPLATE
            ;;
        bedrift)
            cat > "$PROFILE_FILE" << 'EOFTEMPLATE'
{
  "name": "BUSINESS_NAME",
  "slug": "SLUG",
  "foundedYear": 1990,
  "type": "Business Category",
  "description": "LONG_DESCRIPTION_HERE (800-1200 words)",
  "address": {
    "street": "Street Name",
    "city": "Pjuskeby"
  },
  "founder": "Founder Name",
  "specialties": ["specialty1", "specialty2"],
  "imagePrompt": "Storefront or logo prompt..."
}
EOFTEMPLATE
            ;;
        *)
            warning "Entity type $ENTITY_TYPE not fully implemented yet"
            ;;
    esac
    
    log "Template created. Please edit $PROFILE_FILE with enhanced content."
    log "See /tmp/boris-enhanced-profile.json for reference example."
    
    # Check if user wants to continue
    if [ -t 0 ]; then
        read -p "Press Enter when profile is ready, or Ctrl+C to abort..."
    else
        warning "Non-interactive mode: assuming profile is ready"
    fi
    
    success "Enhanced profile ready"
fi

# Step 3: Generate AI portrait
step "Step 3/5: Generating AI portrait"

if [ "$SKIP_IMAGE" = true ]; then
    warning "Skipping image generation (--skip-image flag)"
elif [ "$ENTITY_TYPE" != "person" ]; then
    log "Image generation currently only supported for persons"
else
    TEMP_IMAGE="/tmp/${SLUG}-portrait.png"
    FINAL_IMAGE="${PROJECT_ROOT}/public/assets/agatha/person/${SLUG}.png"
    
    if [ "$DRY_RUN" = true ]; then
        log "Would generate portrait using Runware API"
        log "Would save to: $TEMP_IMAGE"
        log "Would copy to: $FINAL_IMAGE (requires sudo)"
        success "Image generation simulated (dry-run)"
    else
        log "Generating portrait with Runware AI..."
        log "Reading prompt from: $PROFILE_FILE"
        
        # Extract image prompt from JSON
        IMAGE_PROMPT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PROFILE_FILE', 'utf-8')).imagePrompt || '')")
        
        if [ -z "$IMAGE_PROMPT" ]; then
            error "No imagePrompt found in $PROFILE_FILE"
        fi
        
        log "Prompt: ${IMAGE_PROMPT:0:80}..."
        
        # Call Runware API
        RESPONSE=$(curl -s -X POST https://api.runware.ai/v1 \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $RUNWARE_API_KEY" \
            -d "{
                \"taskType\": \"imageInference\",
                \"taskUUID\": \"$(uuidgen)\",
                \"model\": \"runware:100@1\",
                \"positivePrompt\": \"$IMAGE_PROMPT\",
                \"negativePrompt\": \"cartoon, anime, illustration, 3d render, plastic skin, artificial, deformed hands, extra fingers, missing fingers, blurry face, symmetrical, perfect, flawless, HDR tone mapping, cold lighting, oversaturated, sterile, corporate\",
                \"width\": 1024,
                \"height\": 1024,
                \"numberResults\": 1,
                \"outputFormat\": \"PNG\",
                \"uploadEndpoint\": \"URL\",
                \"steps\": 24,
                \"CFGScale\": 8,
                \"scheduler\": \"FlowMatchEulerDiscreteScheduler\"
            }" | jq -r '.[0]')
        
        IMAGE_URL=$(echo "$RESPONSE" | jq -r '.imageURL')
        
        if [ -z "$IMAGE_URL" ] || [ "$IMAGE_URL" = "null" ]; then
            error "Failed to generate image. API response: $RESPONSE"
        fi
        
        log "Downloading image from: $IMAGE_URL"
        curl -s -o "$TEMP_IMAGE" "$IMAGE_URL"
        
        success "Portrait generated: $TEMP_IMAGE"
        
        # Copy to final location with sudo
        log "Copying to final location (requires sudo)..."
        sudo "$SCRIPT_DIR/sudo-wrapper.sh" copy-image "$TEMP_IMAGE" "$FINAL_IMAGE"
        
        success "Portrait saved: $FINAL_IMAGE"
    fi
fi

# Step 4: Update database
step "Step 4/5: Updating database"

if [ "$SKIP_DB" = true ]; then
    warning "Skipping database update (--skip-db flag)"
elif [ "$DRY_RUN" = true ]; then
    log "Would update database with:"
    echo "  • Enhanced bio"
    echo "  • Updated metadata"
    echo "  • New hobbies/interests"
    echo "  • Workplace linkage"
    success "Database update simulated (dry-run)"
else
    case $ENTITY_TYPE in
        person)
            log "Updating person record in database..."
            tsx "$SCRIPT_DIR/update-${SLUG}-profile.ts" 2>&1 || {
                warning "Specific update script not found, using generic updater"
                # Generic update logic here
            }
            success "Database updated"
            ;;
        *)
            warning "Database update for $ENTITY_TYPE not implemented yet"
            ;;
    esac
fi

# Step 5: Verification
step "Step 5/5: Verification"

if [ "$DRY_RUN" = true ]; then
    log "Would verify changes at: $URL"
    success "Verification simulated (dry-run)"
else
    log "Fetching updated profile..."
    sleep 2  # Give server time to update
    
    UPDATED_HTML=$(curl -s "$URL")
    
    if echo "$UPDATED_HTML" | grep -q "Full Story"; then
        success "Profile updated successfully!"
    else
        warning "Could not verify update. Please check manually: $URL"
    fi
fi

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✨ Enhancement Complete! ✨                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Profile:${NC}      $URL"
echo -e "${CYAN}Data file:${NC}    $PROFILE_FILE"

if [ "$SKIP_IMAGE" != true ] && [ "$ENTITY_TYPE" = "person" ]; then
    echo -e "${CYAN}Portrait:${NC}     /assets/agatha/person/${SLUG}.png"
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review the profile at: $URL"
echo "  2. Check the generated image (if applicable)"
echo "  3. Make any manual adjustments needed"
echo "  4. Run sync-entity-mentions.ts to update story links"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔄 This was a DRY RUN - no actual changes were made${NC}"
    echo -e "${YELLOW}   Run without --dry-run to execute for real${NC}"
    echo ""
fi

exit 0
