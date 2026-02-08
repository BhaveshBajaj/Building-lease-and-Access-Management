require('dotenv').config();
const supabase = require('../src/config/database');
const logger = require('../src/config/logger');

/**
 * Seed script to populate database with predefined roles and demo data
 */

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // 1. Create predefined door groups
    logger.info('Creating door groups...');
    const doorGroups = [
      { name: 'Public Areas', type: 'PUBLIC', description: 'Lobbies, stairways, cafeteria, common areas' },
      { name: 'Private Offices', type: 'PRIVATE', description: 'Organization-specific office spaces' },
      { name: 'Restricted Areas', type: 'RESTRICTED', description: 'Server rooms, data centers, security rooms' }
    ];

    const createdDoorGroups = [];
    for (const group of doorGroups) {
      // Check if door group already exists
      let { data: existing } = await supabase
        .from('door_group')
        .select()
        .eq('type', group.type)
        .single();
      
      if (!existing) {
        // Create new door group
        const { data, error } = await supabase
          .from('door_group')
          .insert(group)
          .select()
          .single();
        
        if (!error && data) {
          createdDoorGroups.push(data);
        }
      } else {
        createdDoorGroups.push(existing);
      }
    }

    // 2. Create predefined system roles
    logger.info('Creating system roles...');
    const systemRoles = [
      {
        name: 'Employee',
        is_system_role: true,
        description: 'Basic employee with access to public doors only'
      },
      {
        name: 'Manager',
        is_system_role: true,
        description: 'Manager with access to public and organization office doors'
      },
      {
        name: 'IT Admin',
        is_system_role: true,
        description: 'IT administrator with access to all doors including restricted areas'
      }
    ];

    const createdRoles = [];
    for (const role of systemRoles) {
      // Check if system role already exists
      let { data: existing } = await supabase
        .from('access_role')
        .select()
        .eq('name', role.name)
        .eq('is_system_role', true)
        .is('organization_id', null)
        .single();
      
      if (!existing) {
        // Create new system role
        const { data, error } = await supabase
          .from('access_role')
          .insert(role)
          .select()
          .single();
        
        if (!error && data) {
          createdRoles.push(data);
          logger.info(`Created system role: ${data.name}`);
        }
      } else {
        createdRoles.push(existing);
        logger.info(`Found existing system role: ${existing.name}`);
      }
    }

    // 3. Assign default permissions to system roles
    logger.info('Assigning permissions to system roles...');
    
    const publicGroup = createdDoorGroups.find(g => g.type === 'PUBLIC');
    const privateGroup = createdDoorGroups.find(g => g.type === 'PRIVATE');
    const restrictedGroup = createdDoorGroups.find(g => g.type === 'RESTRICTED');

    const employeeRole = createdRoles.find(r => r.name === 'Employee');
    const managerRole = createdRoles.find(r => r.name === 'Manager');
    const itAdminRole = createdRoles.find(r => r.name === 'IT Admin');

    const permissions = [
      // Employee: Public doors only, always
      { role_id: employeeRole?.id, door_group_id: publicGroup?.id, access_type: 'ALWAYS' },
      
      // Manager: Public + Private doors, always
      { role_id: managerRole?.id, door_group_id: publicGroup?.id, access_type: 'ALWAYS' },
      { role_id: managerRole?.id, door_group_id: privateGroup?.id, access_type: 'ALWAYS' },
      
      // IT Admin: All doors, always
      { role_id: itAdminRole?.id, door_group_id: publicGroup?.id, access_type: 'ALWAYS' },
      { role_id: itAdminRole?.id, door_group_id: privateGroup?.id, access_type: 'ALWAYS' },
      { role_id: itAdminRole?.id, door_group_id: restrictedGroup?.id, access_type: 'ALWAYS' }
    ].filter(p => p.role_id && p.door_group_id);

    for (const permission of permissions) {
      const { error } = await supabase
        .from('role_door_group_permission')
        .upsert(permission, { onConflict: 'role_id,door_group_id', ignoreDuplicates: true });
      
      if (!error) {
        logger.info(`Assigned permission: Role ${permission.role_id} to Door Group ${permission.door_group_id}`);
      }
    }

    // 4. Create demo building
    logger.info('Creating demo building...');
    const { data: building } = await supabase
      .from('building')
      .insert({
        name: 'TechHub Tower',
        address: '123 Innovation Street, Tech City, TC 12345',
        timezone: 'America/New_York'
      })
      .select()
      .single();

    const floors = [];
    const officeSpaces = [];

    if (building) {
      logger.info(`Created building: ${building.name}`);

      // 5. Create floors
      logger.info('Creating floors...');
      for (let i = 1; i <= 3; i++) {
        const { data: floor } = await supabase
          .from('floor')
          .insert({
            building_id: building.id,
            floor_number: i
          })
          .select()
          .single();
        
        if (floor) {
          floors.push(floor);
          logger.info(`Created floor: ${i}`);
        }
      }

      // 6. Create office spaces
      logger.info('Creating office spaces...');
      for (const floor of floors) {
        for (let i = 1; i <= 2; i++) {
          const { data: space } = await supabase
            .from('office_space')
            .insert({
              floor_id: floor.id,
              name: `Suite ${floor.floor_number}0${i}`,
              seat_capacity: 20
            })
            .select()
            .single();
          
          if (space) {
            officeSpaces.push(space);
            logger.info(`Created office space: ${space.name}`);
          }
        }
      }

      // 7. Create demo organizations
      logger.info('Creating demo organizations...');
      const orgs = [
        { name: 'Acme Corp' },
        { name: 'TechStart Inc' }
      ];

      const createdOrgs = [];
      for (const org of orgs) {
        const { data } = await supabase
          .from('organization')
          .insert(org)
          .select()
          .single();
        
        if (data) {
          createdOrgs.push(data);
          logger.info(`Created organization: ${data.name}`);
        }
      }

      // 8. Create leases
      logger.info('Creating leases...');
      if (createdOrgs.length >= 2 && officeSpaces.length >= 2) {
        await supabase.from('lease').insert([
          {
            organization_id: createdOrgs[0].id,
            office_space_id: officeSpaces[0].id,
            start_date: '2026-01-01',
            end_date: '2026-12-31'
          },
          {
            organization_id: createdOrgs[1].id,
            office_space_id: officeSpaces[1].id,
            start_date: '2026-02-01',
            end_date: '2026-11-30'
          }
        ]);
        logger.info('Created leases');
      }

      // 9. Create demo employees
      logger.info('Creating demo employees...');
      if (createdOrgs.length > 0 && createdRoles.length > 0) {
        const employees = [
          {
            organization_id: createdOrgs[0].id,
            role_id: employeeRole.id,
            name: 'John Doe',
            email: 'john.doe@acmecorp.com',
            status: 'ACTIVE'
          },
          {
            organization_id: createdOrgs[0].id,
            role_id: managerRole.id,
            name: 'Jane Smith',
            email: 'jane.smith@acmecorp.com',
            status: 'ACTIVE'
          },
          {
            organization_id: createdOrgs[0].id,
            role_id: itAdminRole.id,
            name: 'Bob Johnson',
            email: 'bob.johnson@acmecorp.com',
            status: 'ACTIVE'
          },
          {
            organization_id: createdOrgs[1].id,
            role_id: employeeRole.id,
            name: 'Alice Williams',
            email: 'alice.williams@techstart.com',
            status: 'ACTIVE'
          }
        ];

        const { data: createdEmployees } = await supabase
          .from('employee')
          .insert(employees)
          .select();

        if (createdEmployees) {
          logger.info(`Created ${createdEmployees.length} employees`);

          // 10. Issue access cards
          logger.info('Issuing access cards...');
          const cards = createdEmployees.map((emp, index) => ({
            card_uid: `CARD-DEMO-${String(index + 1).padStart(4, '0')}`,
            employee_id: emp.id,
            status: 'ACTIVE'
          }));

          await supabase.from('access_card').insert(cards);
          logger.info(`Issued ${cards.length} access cards`);
        }
      }

      // 11. Create demo doors
      logger.info('Creating demo doors...');
      const doors = [
        { name: 'Main Entrance', location: 'Ground Floor Lobby', floor_id: floors[0].id, groups: [publicGroup.id] },
        { name: 'Cafeteria Door', location: 'Floor 1', floor_id: floors[0].id, groups: [publicGroup.id] },
        { name: 'Stairwell A', location: 'Floor 1', floor_id: floors[0].id, groups: [publicGroup.id] },
        { name: 'Suite 101 Door', location: 'Floor 1', office_space_id: officeSpaces[0].id, groups: [privateGroup.id] },
        { name: 'Suite 102 Door', location: 'Floor 1', office_space_id: officeSpaces[1].id, groups: [privateGroup.id] },
        { name: 'Server Room', location: 'Floor 3', floor_id: floors[2].id, groups: [restrictedGroup.id] }
      ];

      for (const doorInfo of doors) {
        const { groups, ...doorData } = doorInfo;
        const { data: door } = await supabase
          .from('door')
          .insert(doorData)
          .select()
          .single();

        if (door && groups) {
          // Assign door to groups
          const assignments = groups.map(groupId => ({
            door_id: door.id,
            door_group_id: groupId
          }));
          
          await supabase.from('door_door_group').insert(assignments);
          logger.info(`Created door: ${door.name}`);
        }
      }
    }

    logger.info('✅ Database seeding completed successfully!');
    logger.info('\n=== Demo Credentials ===');
    logger.info('Access Cards:');
    logger.info('  - CARD-DEMO-0001 (John Doe - Employee)');
    logger.info('  - CARD-DEMO-0002 (Jane Smith - Manager)');
    logger.info('  - CARD-DEMO-0003 (Bob Johnson - IT Admin)');
    logger.info('  - CARD-DEMO-0004 (Alice Williams - Employee)');
    logger.info('\nTest these cards at the /api/v1/access/verify endpoint!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
