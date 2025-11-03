#!/bin/bash

# ExploreKG Server - Security Testing Script
# Run this script to perform basic security checks

echo "🛡️ ExploreKG Server - Security Testing Suite"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:4000"
API_BASE="$BASE_URL/api/v1"

echo -e "\n📋 Starting Security Tests...\n"

# Test 1: Basic Health Check
echo -e "${YELLOW}Test 1: Basic Health Check${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$response" -eq 200 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $response)${NC}"
fi

# Test 2: Security Headers Check
echo -e "\n${YELLOW}Test 2: Security Headers Check${NC}"
headers=$(curl -s -I "$BASE_URL/api/health")

# Check for important security headers
check_header() {
    local header=$1
    local description=$2
    if echo "$headers" | grep -qi "$header"; then
        echo -e "${GREEN}✅ $description present${NC}"
    else
        echo -e "${RED}❌ $description missing${NC}"
    fi
}

check_header "X-Frame-Options" "X-Frame-Options"
check_header "X-Content-Type-Options" "X-Content-Type-Options"
check_header "X-XSS-Protection" "X-XSS-Protection"
check_header "Strict-Transport-Security" "HSTS"
check_header "Content-Security-Policy" "CSP"

# Test 3: Rate Limiting Check
echo -e "\n${YELLOW}Test 3: Rate Limiting Check${NC}"
echo "Testing rate limiting (making 10 rapid requests)..."

rate_limit_test() {
    local endpoint=$1
    local success_count=0
    local blocked_count=0
    
    for i in {1..10}; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE$endpoint")
        if [ "$response" -eq 429 ]; then
            ((blocked_count++))
        elif [ "$response" -eq 200 ] || [ "$response" -eq 404 ]; then
            ((success_count++))
        fi
        sleep 0.1
    done
    
    echo "Successful requests: $success_count, Blocked requests: $blocked_count"
    if [ "$blocked_count" -gt 0 ]; then
        echo -e "${GREEN}✅ Rate limiting is working${NC}"
    else
        echo -e "${YELLOW}⚠️ Rate limiting might not be active${NC}"
    fi
}

rate_limit_test "/travel-packs"

# Test 4: Input Validation Check
echo -e "\n${YELLOW}Test 4: Input Validation Check${NC}"

# Test SQL injection attempt
echo "Testing SQL injection protection..."
sql_injection_payload='{"email":"admin@test.com","fullName":"test\"; DROP TABLE guests; --","phone":"+1234567890"}'
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_BASE/guests" \
    -H "Content-Type: application/json" \
    -d "$sql_injection_payload")

if [ "$response" -eq 400 ] || [ "$response" -eq 422 ]; then
    echo -e "${GREEN}✅ SQL injection protection working${NC}"
else
    echo -e "${RED}❌ SQL injection protection might be bypassed (HTTP $response)${NC}"
fi

# Test XSS attempt
echo "Testing XSS protection..."
xss_payload='{"email":"test@test.com","fullName":"<script>alert(\"xss\")</script>","phone":"+1234567890"}'
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_BASE/guests" \
    -H "Content-Type: application/json" \
    -d "$xss_payload")

if [ "$response" -eq 400 ] || [ "$response" -eq 422 ]; then
    echo -e "${GREEN}✅ XSS protection working${NC}"
else
    echo -e "${RED}❌ XSS protection might be bypassed (HTTP $response)${NC}"
fi

# Test 5: NoSQL Injection Check
echo -e "\n${YELLOW}Test 5: NoSQL Injection Check${NC}"
nosql_payload='{"email":{"$ne":""},"fullName":"test","phone":"+1234567890"}'
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_BASE/guests" \
    -H "Content-Type: application/json" \
    -d "$nosql_payload")

if [ "$response" -eq 400 ] || [ "$response" -eq 422 ]; then
    echo -e "${GREEN}✅ NoSQL injection protection working${NC}"
else
    echo -e "${RED}❌ NoSQL injection protection might be bypassed (HTTP $response)${NC}"
fi

# Test 6: Honeypot Endpoints
echo -e "\n${YELLOW}Test 6: Honeypot Endpoints Check${NC}"
honeypot_endpoints=("/admin" "/wp-admin" "/phpmyadmin" "/.env")

for endpoint in "${honeypot_endpoints[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    if [ "$response" -eq 404 ]; then
        echo -e "${GREEN}✅ Honeypot $endpoint responding correctly${NC}"
    else
        echo -e "${RED}❌ Honeypot $endpoint unexpected response (HTTP $response)${NC}"
    fi
done

# Test 7: Large Payload Test
echo -e "\n${YELLOW}Test 7: Large Payload Protection${NC}"
large_payload=$(printf '{"email":"test@test.com","fullName":"%*s","phone":"+1234567890"}' 10000 | tr ' ' 'a')
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_BASE/guests" \
    -H "Content-Type: application/json" \
    -d "$large_payload")

if [ "$response" -eq 413 ] || [ "$response" -eq 400 ]; then
    echo -e "${GREEN}✅ Large payload protection working${NC}"
else
    echo -e "${YELLOW}⚠️ Large payload accepted (HTTP $response)${NC}"
fi

# Test 8: Security Monitoring Endpoint
echo -e "\n${YELLOW}Test 8: Security Monitoring${NC}"
if curl -s "$API_BASE/security/status" | grep -q "securityLevel"; then
    echo -e "${GREEN}✅ Security monitoring endpoint accessible${NC}"
else
    echo -e "${YELLOW}⚠️ Security monitoring endpoint not responding${NC}"
fi

# Summary
echo -e "\n${YELLOW}Security Test Summary${NC}"
echo "================================================"
echo -e "${GREEN}✅ Tests completed successfully indicate good security posture${NC}"
echo -e "${RED}❌ Failed tests require immediate attention${NC}"
echo -e "${YELLOW}⚠️ Warning tests should be reviewed${NC}"
echo ""
echo "For detailed security analysis, check the logs and security dashboard."
echo "Monitor /api/v1/security/status for real-time security metrics."

echo -e "\n🔒 Security testing complete!"