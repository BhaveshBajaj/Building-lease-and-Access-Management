#!/usr/bin/env node

require('dotenv').config();
const supabase = require('./src/config/database');

async function fix() {
  console.log('\n=== FIXING ROLE ASSIGNMENTS ===\n');

  // Get all system roles
  const { data: allRoles } = await supabase
    .from('access_role')
    .select('*')
    .eq('is_system_role', true)
    .order('created_at', { ascending: false });

  console.log(`Found ${allRoles.length} system roles\n`);

  // Group by name
  const rolesByName = {};
  allRoles.forEach(role => {
    if (!rolesByName[role.name]) {
      rolesByName[role.name] = [];
    }
    rolesByName[role.name].push(role);
  });

  // Find the latest role with permissions
  for (const [name, roles] of Object.entries(rolesByName)) {
    console.log(`\n${name}: ${roles.length} duplicates`);
    
    for (const role of roles) {
      const { data: perms } = await supabase
        .from('role_door_group_permission')
        .select('*')
        .eq('role_id', role.id);

      console.log(`  ${role.id.substring(0, 8)}: ${perms.length} permissions (created: ${role.created_at})`);
      
      if (perms.length > 0) {
        rolesByName[name].correctRole = role;
      }
    }
  }

  // Update employees to use correct roles
  console.log('\n\n=== UPDATING EMPLOYEES ===\n');

  const { data: employees } = await supabase
    .from('employee')
    .select('*, access_role(*)');

  for (const emp of employees) {
    const roleName = emp.access_role.name;
    const correctRole = rolesByName[roleName]?.correctRole;

    if (correctRole && correctRole.id !== emp.role_id) {
      console.log(`Updating ${emp.name}: ${emp.role_id.substring(0, 8)} → ${correctRole.id.substring(0, 8)}`);
      
      await supabase
        .from('employee')
        .update({ role_id: correctRole.id })
        .eq('id', emp.id);
    } else if (correctRole) {
      console.log(`${emp.name}: Already has correct role`);
    } else {
      console.log(`${emp.name}: No correct role found for ${roleName}`);
    }
  }

  // Delete duplicate roles without permissions
  console.log('\n\n=== CLEANING UP DUPLICATE ROLES ===\n');

  for (const [name, roles] of Object.entries(rolesByName)) {
    const correctRole = roles.correctRole;
    const duplicates = roles.filter(r => r.id !== correctRole?.id);

    for (const dup of duplicates) {
      const { data: perms } = await supabase
        .from('role_door_group_permission')
        .select('*')
        .eq('role_id', dup.id);

      const { data: emps } = await supabase
        .from('employee')
        .select('id')
        .eq('role_id', dup.id);

      if (perms.length === 0 && emps.length === 0) {
        console.log(`Deleting duplicate ${name} role: ${dup.id.substring(0, 8)}`);
        await supabase
          .from('access_role')
          .delete()
          .eq('id', dup.id);
      }
    }
  }

  console.log('\n✓ Done!\n');
  process.exit(0);
}

fix().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
