#!/bin/bash

# Quick cURL Testing Examples
# This script demonstrates manual API testing with curl

echo "=== Getting Door IDs from Database ==="
echo ""

# We'll use the Node.js to get door IDs since we don't have auth tokens
node -e "
require('dotenv').config();
const supabase = require('./src/config/database');

(async () => {
  const { data } = await supabase.from('door').select('id, name, door_groups:door_door_group(door_group:door_group_id(type))');
  
  const publicDoor = data.find(d => d.name === 'Main Entrance');
  const privateDoor = data.find(d => d.name === 'Suite 101 Door');
  const restrictedDoor = data.find(d => d.name === 'Server Room');
  
  console.log('PUBLIC_DOOR_ID=' + publicDoor.id);
  console.log('PRIVATE_DOOR_ID=' + privateDoor.id);
  console.log('RESTRICTED_DOOR_ID=' + restrictedDoor.id);
})();
" > /tmp/door_ids.sh

source /tmp/door_ids.sh

echo ""
echo "=== Testing with cURL ==="
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Employee card at PUBLIC door (should GRANT)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST http://localhost:3000/api/v1/access/verify \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "CARD-DEMO-0001",
    "door_id": "'$PUBLIC_DOOR_ID'"
  }' | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Employee card at PRIVATE door (should DENY)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST http://localhost:3000/api/v1/access/verify \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "CARD-DEMO-0001",
    "door_id": "'$PRIVATE_DOOR_ID'"
  }' | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Manager card at PRIVATE door (should GRANT)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST http://localhost:3000/api/v1/access/verify \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "CARD-DEMO-0002",
    "door_id": "'$PRIVATE_DOOR_ID'"
  }' | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: IT Admin at RESTRICTED door (should GRANT)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST http://localhost:3000/api/v1/access/verify \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "CARD-DEMO-0003",
    "door_id": "'$RESTRICTED_DOOR_ID'"
  }' | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Invalid card (should DENY)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST http://localhost:3000/api/v1/access/verify \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "FAKE-CARD-9999",
    "door_id": "'$PUBLIC_DOOR_ID'"
  }' | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Missing field (should return 400)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST http://localhost:3000/api/v1/access/verify \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "CARD-DEMO-0001"
  }' | jq '.status, .message'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s http://localhost:3000/api/v1/health | jq '.'

echo ""
echo "✅ All manual cURL tests complete!"
