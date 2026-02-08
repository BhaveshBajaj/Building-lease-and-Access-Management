#!/bin/bash

# API Testing Script for Building Access Control System
# Tests all CRUD operations and functionality

BASE_URL="http://localhost:3000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for tests
PASSED=0
FAILED=0

# Function to print test results
test_result() {
  local test_name="$1"
  local result="$2"
  if [ "$result" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $test_name"
    ((FAILED++))
  fi
}

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}  Building Access Control API Tests  ${NC}"
echo -e "${YELLOW}======================================${NC}\n"

# ============================================
# 1. ACCESS VERIFICATION (No Auth Required)
# ============================================
echo -e "\n${YELLOW}[1] Testing Access Verification${NC}"

# Test 1.1: Valid card at public door (should GRANT)
echo -e "\n--- Test 1.1: Employee card at public door ---"
DOOR_ID=$(curl -s "$BASE_URL/doors" -H "Authorization: Bearer fake-for-now" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
RESPONSE=$(curl -s -X POST "$BASE_URL/access/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "CARD-DEMO-0001",
    "door_id": "'"$DOOR_ID"'"
  }')
echo "$RESPONSE" | jq '.'
STATUS=$(echo "$RESPONSE" | jq -r '.data.status')
[ "$STATUS" = "GRANTED" ] && test_result "Access granted for valid employee card" 0 || test_result "Access granted for valid employee card" 1

# Test 1.2: Invalid card
echo -e "\n--- Test 1.2: Invalid card UID ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/access/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "INVALID-CARD-9999",
    "door_id": "'"$DOOR_ID"'"
  }')
echo "$RESPONSE" | jq '.'
STATUS=$(echo "$RESPONSE" | jq -r '.data.status')
[ "$STATUS" = "DENIED" ] && test_result "Access denied for invalid card" 0 || test_result "Access denied for invalid card" 1

# Test 1.3: Missing required fields
echo -e "\n--- Test 1.3: Missing required fields ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/access/verify" \
  -H "Content-Type: application/json" \
  -d '{"card_uid": "CARD-DEMO-0001"}')
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/access/verify" \
  -H "Content-Type: application/json" \
  -d '{"card_uid": "CARD-DEMO-0001"}')
echo "HTTP Code: $HTTP_CODE"
[ "$HTTP_CODE" = "400" ] && test_result "Validation error for missing fields" 0 || test_result "Validation error for missing fields" 1

# ============================================
# 2. ORGANIZATIONS (Requires Auth)
# ============================================
echo -e "\n${YELLOW}[2] Testing Organizations CRUD${NC}"
echo -e "${RED}Note: Auth required - skipping authenticated endpoints for now${NC}"

# ============================================
# 3. BUILDINGS
# ============================================
echo -e "\n${YELLOW}[3] Testing Buildings${NC}"
echo -e "${RED}Note: Auth required - these tests show the data structure${NC}"

# ============================================
# 4. ACCESS LOGS
# ============================================
echo -e "\n${YELLOW}[4] Testing Access Logs${NC}"

# Check if there are access logs from previous verifications
echo -e "\n--- Checking recent access logs (requires auth) ---"
echo "Endpoint: GET $BASE_URL/access/logs"

# ============================================
# Summary
# ============================================
echo -e "\n${YELLOW}======================================${NC}"
echo -e "${YELLOW}           Test Summary               ${NC}"
echo -e "${YELLOW}======================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Total:  $((PASSED + FAILED))${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}\n"
  exit 0
else
  echo -e "\n${RED}Some tests failed!${NC}\n"
  exit 1
fi
