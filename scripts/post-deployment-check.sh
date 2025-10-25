#!/bin/bash
# Post-deployment health check script

echo "🔍 POST-DEPLOYMENT HEALTH CHECK"
echo "==============================="

# 1. Check if server is responding
if curl -f -s http://localhost:4100/health >/dev/null; then
    echo "✅ Server is responding"
else
    echo "❌ Server is not responding"
    exit 1
fi

# 2. Check database connection
if curl -f -s http://localhost:4100/api/health/db >/dev/null; then
    echo "✅ Database connection working"
else
    echo "❌ Database connection failed"
    exit 1
fi

# 3. Check critical endpoints
ENDPOINTS=("/" "/api/people" "/api/places" "/kart")
for endpoint in "${ENDPOINTS[@]}"; do
    if curl -f -s "http://localhost:4100$endpoint" >/dev/null; then
        echo "✅ $endpoint responding"
    else
        echo "❌ $endpoint failed"
        exit 1
    fi
done

# 4. Check performance optimizations
if [ -f "public/sw.js" ] && [ -d "public/assets/webp" ]; then
    echo "✅ Performance optimizations active"
else
    echo "❌ Performance optimizations missing"
    exit 1
fi

echo ""
echo "🎉 POST-DEPLOYMENT CHECK: PASSED"
echo "System is healthy and ready for production traffic"
