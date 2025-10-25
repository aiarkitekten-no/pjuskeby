#!/bin/bash
# Allows non-root to write to specific directories
ALLOWED_DIR="/var/www/vhosts/pjuskeby.org/public/assets/agatha"
if [[ "$1" == "copy-image" && "$2" =~ ^/tmp/ && "$3" =~ ^$ALLOWED_DIR ]]; then
    cp "$2" "$3" && chown pjuskebysverden:psacln "$3" && chmod 644 "$3"
fi
