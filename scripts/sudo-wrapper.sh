#!/bin/bash
# Sudo wrapper for daily-story.sh automation
# Allows non-root user to perform specific operations

BASE_DIR="/var/www/vhosts/pjuskeby.org"

case "$1" in
  copy-story-image)
    # Copy image from /tmp/ to public/, dist/client/, or httpdocs/
    SRC="$2"
    DEST="$3"
    
    if [[ ! "$SRC" =~ ^/tmp/.*\.png$ ]]; then
      echo "Error: Source must be a PNG file in /tmp/"
      exit 1
    fi
    
    if [[ ! "$DEST" =~ ^$BASE_DIR/(public|dist/client|httpdocs)/assets/agatha/(story|person|place|business|street)/.*\.png$ ]]; then
      echo "Error: Destination must be in allowed directories"
      exit 1
    fi
    
    # Create directory if needed
    mkdir -p "$(dirname "$DEST")" 2>/dev/null
    
    # Copy and set permissions
    cp "$SRC" "$DEST" && \
    chown pjuskebysverden:psacln "$DEST" && \
    chmod 644 "$DEST"
    ;;
    
  fix-permissions)
    # Fix permissions on dist/ and httpdocs/ before build
    TARGET="$2"
    
    if [[ "$TARGET" == "dist" ]]; then
      chown -R pjuskebysverden:psacln "$BASE_DIR/dist" 2>/dev/null || true
    elif [[ "$TARGET" == "httpdocs" ]]; then
      chown -R pjuskebysverden:psacln "$BASE_DIR/httpdocs" 2>/dev/null || true
    elif [[ "$TARGET" == "both" ]]; then
      chown -R pjuskebysverden:psacln "$BASE_DIR/dist" 2>/dev/null || true
      chown -R pjuskebysverden:psacln "$BASE_DIR/httpdocs" 2>/dev/null || true
    else
      echo "Error: Target must be 'dist', 'httpdocs', or 'both'"
      exit 1
    fi
    ;;
    
  *)
    echo "Usage: $0 {copy-story-image|fix-permissions} [args]"
    exit 1
    ;;
esac
