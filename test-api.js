#!/usr/bin/env node

/**
 * Comprehensive API Test Suite
 * Tests all CRUD operations and functionality
 */

require('dotenv').config();
const supabase = require('./src/config/database');

const BASE_URL = 'http://localhost:3000/api/v1';
const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

let passed = 0;
let failed = 0;

// Helper function to make HTTP requests
async function request(method, path, data = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let json = null;
    
    try {
      json = JSON.parse(text);
    } catch (e) {
      // Response is not JSON
    }

    return {
      status: response.status,
      data: json,
      text: text
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message
    };
  }
}

// Test result helper
function testResult(name, passed_test) {
  if (passed_test) {
    console.log(`${COLORS.GREEN}✓${COLORS.RESET} ${name}`);
    passed++;
  } else {
    console.log(`${COLORS.RED}✗${COLORS.RESET} ${name}`);
    failed++;
  }
}

// Main test suite
async function runTests() {
  console.log(`\n${COLORS.YELLOW}${'='.repeat(50)}${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}  Building Access Control API Tests${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}${'='.repeat(50)}${COLORS.RESET}\n`);

  // Get test data from database
  console.log(`${COLORS.BLUE}Fetching test data from database...${COLORS.RESET}`);
  
  const { data: doors } = await supabase.from('door').select('*').limit(6);
  const { data: employees } = await supabase.from('employee').select('*').limit(4);
  const { data: organizations } = await supabase.from('organization').select('*').limit(2);
  const { data: buildings } = await supabase.from('building').select('*').limit(1);
  
  if (!doors || doors.length === 0) {
    console.log(`${COLORS.RED}No demo data found. Run 'npm run seed' first.${COLORS.RESET}\n`);
    process.exit(1);
  }

  const publicDoor = doors.find(d => d.name === 'Main Entrance');
  const privateDoor = doors.find(d => d.name === 'Suite 101 Door');
  const restrictedDoor = doors.find(d => d.name === 'Server Room');

  console.log(`${COLORS.GREEN}✓ Test data loaded${COLORS.RESET}\n`);

  // ============================================
  // 1. ACCESS VERIFICATION (No Auth)
  // ============================================
  console.log(`${COLORS.YELLOW}[1] Access Verification (Public Endpoint)${COLORS.RESET}\n`);

  // Test 1.1: Valid employee card at public door (GRANTED)
  console.log('--- Test 1.1: Employee card at public door ---');
  let response = await request('POST', '/access/verify', {
    card_uid: 'CARD-DEMO-0001',
    door_id: publicDoor.id
  });
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'Employee can access public door',
    response.status === 200 && response.data?.status === 'GRANTED'
  );

  // Test 1.2: Manager card at private door (GRANTED)
  console.log('\n--- Test 1.2: Manager card at private office door ---');
  response = await request('POST', '/access/verify', {
    card_uid: 'CARD-DEMO-0002',
    door_id: privateDoor.id
  });
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'Manager can access private office door',
    response.status === 200 && response.data?.status === 'GRANTED'
  );

  // Test 1.3: Employee card at private door (DENIED)
  console.log('\n--- Test 1.3: Employee card at private door (should be DENIED) ---');
  response = await request('POST', '/access/verify', {
    card_uid: 'CARD-DEMO-0001',
    door_id: privateDoor.id
  });
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'Employee cannot access private office door',
    response.status === 200 && response.data?.status === 'DENIED'
  );

  // Test 1.4: IT Admin card at restricted door (GRANTED)
  console.log('\n--- Test 1.4: IT Admin card at restricted area ---');
  response = await request('POST', '/access/verify', {
    card_uid: 'CARD-DEMO-0003',
    door_id: restrictedDoor.id
  });
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'IT Admin can access restricted area',
    response.status === 200 && response.data?.status === 'GRANTED'
  );

  // Test 1.5: Employee card at restricted door (DENIED)
  console.log('\n--- Test 1.5: Employee card at restricted area (should be DENIED) ---');
  response = await request('POST', '/access/verify', {
    card_uid: 'CARD-DEMO-0001',
    door_id: restrictedDoor.id
  });
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'Employee cannot access restricted area',
    response.status === 200 && response.data?.status === 'DENIED'
  );

  // Test 1.6: Invalid card
  console.log('\n--- Test 1.6: Invalid card UID ---');
  response = await request('POST', '/access/verify', {
    card_uid: 'INVALID-CARD-XXX',
    door_id: publicDoor.id
  });
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'Invalid card is denied',
    response.status === 200 && response.data?.status === 'DENIED'
  );

  // Test 1.7: Missing required field (validation)
  console.log('\n--- Test 1.7: Missing door_id (validation error) ---');
  response = await request('POST', '/access/verify', {
    card_uid: 'CARD-DEMO-0001'
  });
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'Missing field returns 400 error',
    response.status === 400
  );

  // Test 1.8: Invalid UUID format
  console.log('\n--- Test 1.8: Invalid UUID format for door_id ---');
  response = await request('POST', '/access/verify', {
    card_uid: 'CARD-DEMO-0001',
    door_id: 'not-a-uuid'
  });
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'Invalid UUID format returns 400 error',
    response.status === 400
  );

  // ============================================
  // 2. HEALTH CHECK
  // ============================================
  console.log(`\n${COLORS.YELLOW}[2] Health Check${COLORS.RESET}\n`);
  
  response = await request('GET', '/health');
  console.log(JSON.stringify(response.data, null, 2));
  testResult(
    'Health check returns OK',
    response.status === 200 && response.data?.status === 'ok'
  );

  // ============================================
  // 3. DATABASE VERIFICATION
  // ============================================
  console.log(`\n${COLORS.YELLOW}[3] Database Structure Verification${COLORS.RESET}\n`);

  // Verify demo data exists
  const { data: cards } = await supabase.from('access_card').select('*');
  testResult('Access cards exist in database', cards && cards.length === 4);

  const { data: doorGroups } = await supabase.from('door_group').select('*');
  testResult('Door groups exist (PUBLIC, PRIVATE, RESTRICTED)', doorGroups && doorGroups.length === 3);

  const { data: roles } = await supabase.from('access_role').select('*').eq('is_system_role', true);
  testResult('System roles exist (Employee, Manager, IT Admin)', roles && roles.length === 3);

  const { data: permissions } = await supabase.from('role_door_group_permission').select('*');
  testResult('Role permissions exist', permissions && permissions.length > 0);

  // Verify junction table
  const { data: doorDoorGroups } = await supabase.from('door_door_group').select('*');
  testResult('Door-to-DoorGroup mappings exist', doorDoorGroups && doorDoorGroups.length > 0);

  // ============================================
  // 4. PERMISSION VERIFICATION
  // ============================================
  console.log(`\n${COLORS.YELLOW}[4] Permission System Verification${COLORS.RESET}\n`);

  // Get Employee role permissions
  const employeeRole = roles.find(r => r.name === 'Employee');
  const { data: empPerms } = await supabase
    .from('role_door_group_permission')
    .select('*, door_group(*)')
    .eq('role_id', employeeRole.id);
  
  console.log('Employee role permissions:', empPerms.map(p => p.door_group.type).join(', '));
  testResult('Employee has PUBLIC access only', empPerms.length === 1 && empPerms[0].door_group.type === 'PUBLIC');

  // Get Manager role permissions
  const managerRole = roles.find(r => r.name === 'Manager');
  const { data: mgrPerms } = await supabase
    .from('role_door_group_permission')
    .select('*, door_group(*)')
    .eq('role_id', managerRole.id);
  
  console.log('Manager role permissions:', mgrPerms.map(p => p.door_group.type).join(', '));
  testResult('Manager has PUBLIC + PRIVATE access', mgrPerms.length === 2);

  // Get IT Admin role permissions
  const itAdminRole = roles.find(r => r.name === 'IT Admin');
  const { data: adminPerms } = await supabase
    .from('role_door_group_permission')
    .select('*, door_group(*)')
    .eq('role_id', itAdminRole.id);
  
  console.log('IT Admin role permissions:', adminPerms.map(p => p.door_group.type).join(', '));
  testResult('IT Admin has all access (PUBLIC + PRIVATE + RESTRICTED)', adminPerms.length === 3);

  // ============================================
  // 5. ACCESS LOG VERIFICATION
  // ============================================
  console.log(`\n${COLORS.YELLOW}[5] Access Log Verification${COLORS.RESET}\n`);

  const { data: logs, count } = await supabase
    .from('access_log')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .limit(5);

  console.log(`Total access log entries: ${count}`);
  if (logs && logs.length > 0) {
    console.log('Recent logs:');
    logs.forEach(log => {
      const status = log.status === 'GRANTED' ? COLORS.GREEN : COLORS.RED;
      console.log(`  ${status}${log.status}${COLORS.RESET} - Card: ${log.card_uid} - ${new Date(log.timestamp).toISOString()}`);
    });
  }
  testResult('Access logs are being recorded', logs && logs.length > 0);

  // ============================================
  // 6. CARD-EMPLOYEE RELATIONSHIP
  // ============================================
  console.log(`\n${COLORS.YELLOW}[6] Card-Employee Relationship${COLORS.RESET}\n`);

  const { data: cardWithEmployee } = await supabase
    .from('access_card')
    .select('*, employee(*, access_role(*))')
    .eq('card_uid', 'CARD-DEMO-0001')
    .single();

  console.log('CARD-DEMO-0001 belongs to:', cardWithEmployee?.employee?.name);
  console.log('Role:', cardWithEmployee?.employee?.access_role?.name);
  testResult(
    'Card has proper employee and role linkage',
    cardWithEmployee && cardWithEmployee.employee && cardWithEmployee.employee.access_role
  );

  // ============================================
  // Summary
  // ============================================
  console.log(`\n${COLORS.YELLOW}${'='.repeat(50)}${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}           Test Summary${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}${'='.repeat(50)}${COLORS.RESET}`);
  console.log(`${COLORS.GREEN}Passed: ${passed}${COLORS.RESET}`);
  console.log(`${COLORS.RED}Failed: ${failed}${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}Total:  ${passed + failed}${COLORS.RESET}`);

  if (failed === 0) {
    console.log(`\n${COLORS.GREEN}✓ All tests passed!${COLORS.RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${COLORS.RED}✗ Some tests failed!${COLORS.RESET}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${COLORS.RED}Test suite error:${COLORS.RESET}`, error);
  process.exit(1);
});
