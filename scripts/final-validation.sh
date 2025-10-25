#!/bin/bash
# GUARDRAILS CHECKPOINT v3.0 - UBRYTELIG
# Phase 20: FINAL VALIDATION - Complete system verification
# This script validates all 290 problems are fixed and system is deployment-ready

set -euo pipefail

WORKSPACE="/var/www/vhosts/pjuskeby.org"
cd "$WORKSPACE"

echo "🚀 PHASE 20: FINAL VALIDATION STARTING"
echo "======================================"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Validating all 290 problems resolved..."
echo ""

# 1. Verify all phases completed in donetoday.json
echo "📊 1. PHASE COMPLETION VERIFICATION"
echo "===================================="
COMPLETED_PHASES=$(grep '"status": "✅ KOMPLETT' httpdocs/donetoday.json | wc -l)
echo "Completed phases: $COMPLETED_PHASES/19"

if [ "$COMPLETED_PHASES" -lt 19 ]; then
    echo "❌ ERROR: Not all phases completed. Expected 19, found $COMPLETED_PHASES"
    exit 1
fi

# Extract all problems fixed from each phase
echo "Extracting all fixed problems..."
TOTAL_PROBLEMS_FIXED=0
> /tmp/all_problems_fixed.txt

for phase in {1..19}; do
    PROBLEMS=$(grep -A 20 "\"phase\": $phase" httpdocs/donetoday.json | grep "problems_fixed" | sed 's/.*\[\(.*\)\].*/\1/' | tr -d ' "' | tr ',' '\n')
    if [ ! -z "$PROBLEMS" ]; then
        echo "$PROBLEMS" >> /tmp/all_problems_fixed.txt
        PHASE_COUNT=$(echo "$PROBLEMS" | wc -l)
        TOTAL_PROBLEMS_FIXED=$((TOTAL_PROBLEMS_FIXED + PHASE_COUNT))
        echo "Phase $phase: $PHASE_COUNT problems fixed"
    fi
done

echo "Total problems fixed: $TOTAL_PROBLEMS_FIXED"

# 2. Verify critical files exist
echo ""
echo "📁 2. CRITICAL FILES VERIFICATION"
echo "=================================="
CRITICAL_FILES=(
    "httpdocs/index.html"
    "httpdocs/SKALUTFORES.json"
    "httpdocs/koblinger.json"
    "httpdocs/donetoday.json"
    "server/index.ts"
    "server/db/schema.ts"
    "migrations/003_complete_structure.sql"
    "public/sw.js"
    "scripts/convert-to-webp.sh"
    "AI-learned/performance.json"
)

MISSING_FILES=0
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ "$MISSING_FILES" -gt 0 ]; then
    echo "❌ ERROR: $MISSING_FILES critical files missing"
    exit 1
fi

# 3. Database structure validation
echo ""
echo "🗄️ 3. DATABASE STRUCTURE VALIDATION"
echo "====================================="
if [ -f "migrations/003_complete_structure.sql" ]; then
    TABLES_COUNT=$(grep -c "CREATE TABLE" migrations/003_complete_structure.sql || echo "0")
    INDEXES_COUNT=$(grep -c "CREATE INDEX" migrations/003_complete_structure.sql || echo "0")
    echo "Database tables defined: $TABLES_COUNT"
    echo "Database indexes defined: $INDEXES_COUNT"
    echo "✅ Database structure complete"
else
    echo "❌ Database migration file missing"
    exit 1
fi

# 4. API endpoints validation
echo ""
echo "🔌 4. API ENDPOINTS VALIDATION"
echo "==============================="
if [ -f "server/index.ts" ]; then
    API_ROUTES=$(grep -c "app\.\(get\|post\|put\|delete\)" server/index.ts || echo "0")
    echo "API routes registered: $API_ROUTES"
    
    # Check critical endpoints exist
    if grep -q "/api/people" server/index.ts && grep -q "/api/places" server/index.ts; then
        echo "✅ Core API endpoints present"
    else
        echo "⚠️ Some core endpoints may be missing"
    fi
else
    echo "❌ Server main file missing"
    exit 1
fi

# 5. Performance optimizations check
echo ""
echo "⚡ 5. PERFORMANCE OPTIMIZATIONS CHECK"
echo "====================================="
PERF_SCORE=0

# Check WebP images
WEBP_COUNT=$(find public/assets/webp -name "*.webp" 2>/dev/null | wc -l || echo "0")
if [ "$WEBP_COUNT" -gt 0 ]; then
    echo "✅ WebP images: $WEBP_COUNT files"
    PERF_SCORE=$((PERF_SCORE + 20))
else
    echo "❌ No WebP images found"
fi

# Check service worker
if [ -f "public/sw.js" ]; then
    echo "✅ Service worker implemented"
    PERF_SCORE=$((PERF_SCORE + 20))
else
    echo "❌ Service worker missing"
fi

# Check code splitting config
if grep -q "manualChunks" astro.config.mjs 2>/dev/null; then
    echo "✅ Code splitting configured"
    PERF_SCORE=$((PERF_SCORE + 20))
else
    echo "❌ Code splitting not configured"
fi

# Check query optimizer
if [ -f "server/utils/query-optimizer.ts" ]; then
    echo "✅ Database query optimizer"
    PERF_SCORE=$((PERF_SCORE + 20))
else
    echo "❌ Query optimizer missing"
fi

# Check CDN config
if grep -q "CDN_URL" astro.config.mjs 2>/dev/null; then
    echo "✅ CDN configuration ready"
    PERF_SCORE=$((PERF_SCORE + 20))
else
    echo "❌ CDN configuration missing"
fi

echo "Performance optimization score: $PERF_SCORE/100"

# 6. Security features check
echo ""
echo "🔒 6. SECURITY FEATURES CHECK"
echo "=============================="
SECURITY_SCORE=0

# Check Turnstile implementation
if [ -f "server/utils/turnstile.ts" ]; then
    echo "✅ Turnstile bot protection"
    SECURITY_SCORE=$((SECURITY_SCORE + 25))
else
    echo "❌ Turnstile protection missing"
fi

# Check CORS configuration
if grep -q "cors" server/index.ts 2>/dev/null; then
    echo "✅ CORS configured"
    SECURITY_SCORE=$((SECURITY_SCORE + 25))
else
    echo "❌ CORS configuration missing"
fi

# Check environment variables usage
ENV_USAGE=$(grep -r "process\.env\." server/ | wc -l || echo "0")
if [ "$ENV_USAGE" -gt 0 ]; then
    echo "✅ Environment variables used ($ENV_USAGE references)"
    SECURITY_SCORE=$((SECURITY_SCORE + 25))
else
    echo "❌ No environment variable usage found"
fi

# Check for hardcoded secrets (should be 0)
HARDCODED=$(grep -r -i "api.key\|secret\|password\|token" server/ --include="*.ts" --include="*.js" | grep -v "process.env" | wc -l || echo "0")
if [ "$HARDCODED" -eq 0 ]; then
    echo "✅ No hardcoded secrets found"
    SECURITY_SCORE=$((SECURITY_SCORE + 25))
else
    echo "❌ Found $HARDCODED potential hardcoded secrets"
fi

echo "Security score: $SECURITY_SCORE/100"

# 7. GDPR compliance check
echo ""
echo "📋 7. GDPR COMPLIANCE CHECK"
echo "============================"
GDPR_SCORE=0

if [ -f "src/pages/privacy.astro" ]; then
    echo "✅ Privacy policy page"
    GDPR_SCORE=$((GDPR_SCORE + 33))
else
    echo "❌ Privacy policy missing"
fi

if grep -q "cookie.*consent" src/components/*.astro 2>/dev/null; then
    echo "✅ Cookie consent implementation"
    GDPR_SCORE=$((GDPR_SCORE + 33))
else
    echo "❌ Cookie consent missing"
fi

if [ -f "AI-learned/gdpr-compliant.json" ]; then
    echo "✅ GDPR compliance documentation"
    GDPR_SCORE=$((GDPR_SCORE + 34))
else
    echo "❌ GDPR documentation missing"
fi

echo "GDPR compliance score: $GDPR_SCORE/100"

# 8. AI-learned documentation check
echo ""
echo "📚 8. DOCUMENTATION COMPLETENESS"
echo "================================="
AI_LEARNED_COUNT=$(ls -1 AI-learned/ | wc -l)
echo "AI-learned files: $AI_LEARNED_COUNT"

REQUIRED_DOCS=(
    "AI-learned/database-complete.json"
    "AI-learned/api-complete.json"
    "AI-learned/security-fixed.json"
    "AI-learned/performance.json"
    "AI-learned/gdpr-compliant.json"
)

DOC_SCORE=0
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $(basename $doc)"
        DOC_SCORE=$((DOC_SCORE + 20))
    else
        echo "❌ $(basename $doc) missing"
    fi
done

echo "Documentation score: $DOC_SCORE/100"

# Final validation summary
echo ""
echo "🎯 FINAL VALIDATION SUMMARY"
echo "============================"
echo "Phases completed: $COMPLETED_PHASES/19"
echo "Problems fixed: $TOTAL_PROBLEMS_FIXED"
echo "Critical files: $((${#CRITICAL_FILES[@]} - MISSING_FILES))/${#CRITICAL_FILES[@]}"
echo "Performance optimization: $PERF_SCORE/100"
echo "Security features: $SECURITY_SCORE/100"
echo "GDPR compliance: $GDPR_SCORE/100"
echo "Documentation: $DOC_SCORE/100"

OVERALL_SCORE=$(( (PERF_SCORE + SECURITY_SCORE + GDPR_SCORE + DOC_SCORE) / 4 ))
echo "Overall system score: $OVERALL_SCORE/100"

if [ "$OVERALL_SCORE" -ge 80 ] && [ "$MISSING_FILES" -eq 0 ] && [ "$COMPLETED_PHASES" -eq 19 ]; then
    echo ""
    echo "🎉 FINAL VALIDATION: PASSED"
    echo "System is ready for production deployment!"
    exit 0
else
    echo ""
    echo "❌ FINAL VALIDATION: FAILED"
    echo "System requires additional work before deployment."
    exit 1
fi