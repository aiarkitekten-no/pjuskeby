#!/bin/sh

# Pjuskeby Pre-commit Hook
# Blokkerer commits med forbudte placeholders
#
# Installer:
#   cp scripts/pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit

echo "🔒 Pjuskeby Guardrails: Sjekker for forbudte placeholders..."

# Kjør placeholder-linting (krever Node.js/ts-node)
if command -v ts-node >/dev/null 2>&1; then
    ts-node scripts/lint-no-placeholder.ts
    LINT_EXIT=$?
else
    echo "⚠️  ts-node ikke funnet. Hopper over placeholder-sjekk."
    LINT_EXIT=0
fi

if [ $LINT_EXIT -ne 0 ]; then
    echo ""
    echo "❌ COMMIT BLOKKERT: Forbudte placeholders funnet."
    echo "Fjern TODO, FIXME, mock, dummy, etc. før commit."
    echo ""
    exit 1
fi

# Sjekk at .env ikke committes
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo ""
    echo "❌ COMMIT BLOKKERT: .env må ALDRI committes!"
    echo "Fjern .env fra staging: git reset HEAD .env"
    echo ""
    exit 1
fi

# Sjekk at koblinger.json er gyldig
if git diff --cached --name-only | grep -q "koblinger.json"; then
    echo "📋 koblinger.json endret, validerer..."
    if command -v ts-node >/dev/null 2>&1; then
        ts-node scripts/validate-koblinger.ts
        KOBLINGER_EXIT=$?
        if [ $KOBLINGER_EXIT -ne 0 ]; then
            echo ""
            echo "❌ COMMIT BLOKKERT: koblinger.json har valideringsfeil."
            echo ""
            exit 1
        fi
    fi
fi

echo "✅ Guardrails OK. Fortsetter med commit."
exit 0
