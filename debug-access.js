#!/usr/bin/env node

/**
 * Debug script to check door and permission data
 */

require('dotenv').config();
const supabase = require('./src/config/database');

async function debug() {
  console.log('\n=== DOOR DATA DEBUG ===\n');

  // 1. Check doors
  const { data: doors } = await supabase
    .from('door')
    .select(`
      *,
      door_groups:door_door_group(
        door_group:door_group_id(*)
      )
    `);

  console.log('Doors with groups:');
  doors.forEach(door => {
    console.log(`\n${door.name}:`);
    console.log(`  Groups: ${door.door_groups?.length || 0}`);
    door.door_groups?.forEach(dg => {
      console.log(`    - ${dg.door_group?.type || 'NULL'} (${dg.door_group?.name || 'NULL'})`);
    });
  });

  // 2. Check roles and permissions
  console.log('\n\n=== ROLE PERMISSIONS ===\n');
  
  const { data: roles } = await supabase
    .from('access_role')
    .select('*')
    .eq('is_system_role', true);

  for (const role of roles) {
    const { data: perms } = await supabase
      .from('role_door_group_permission')
      .select('*, door_group(*)')
      .eq('role_id', role.id);

    console.log(`\n${role.name}:`);
    console.log(`  Permissions: ${perms?.length || 0}`);
    perms?.forEach(p => {
      console.log(`    - ${p.door_group?.type || 'NULL'} (${p.access_type})`);
    });
  }

  // 3. Check junction table
  console.log('\n\n=== JUNCTION TABLE ===\n');
  
  const { data: junctions } = await supabase
    .from('door_door_group')
    .select(`
      *,
      door(*),
      door_group(*)
    `);

  console.log(`Total door-to-group mappings: ${junctions?.length || 0}\n`);
  junctions?.forEach(j => {
    console.log(`${j.door?.name || 'NULL'} → ${j.door_group?.type || 'NULL'}`);
  });

  // 4. Test a specific verification scenario
  console.log('\n\n=== VERIFICATION TEST ===\n');
  
  const { data: card } = await supabase
    .from('access_card')
    .select(`
      *,
      employee(
        *,
        access_role(*)
      )
    `)
    .eq('card_uid', 'CARD-DEMO-0001')
    .single();

  console.log(`Card: ${card.card_uid}`);
  console.log(`Employee: ${card.employee.name}`);
  console.log(`Role: ${card.employee.access_role.name}`);
  console.log(`Role ID: ${card.employee.access_role.id}`);

  const mainEntrance = doors.find(d => d.name === 'Main Entrance');
  console.log(`\nDoor: ${mainEntrance.name}`);
  console.log(`Door Groups: ${JSON.stringify(mainEntrance.door_groups, null, 2)}`);

  const doorGroupIds = mainEntrance.door_groups?.map(dg => dg.door_group?.id).filter(Boolean) || [];
  console.log(`\nDoor Group IDs: ${doorGroupIds.join(', ')}`);

  const { data: checkPerms } = await supabase
    .from('role_door_group_permission')
    .select('*')
    .eq('role_id', card.employee.access_role.id)
    .in('door_group_id', doorGroupIds);

  console.log(`\nPermissions found: ${checkPerms?.length || 0}`);
  console.log(JSON.stringify(checkPerms, null, 2));

  process.exit(0);
}

debug().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
