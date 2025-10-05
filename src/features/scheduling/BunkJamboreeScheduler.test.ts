import { BunkJamboreeScheduler } from './BunkJamboreeScheduler';
import { 
  AdminAttendeeID, 
  StaffAttendeeID, 
  CamperAttendeeID, 
  SectionSchedule, 
  SectionPreferences, 
  BunkID,
  JamboreeActivity,
  BlockPreferences
} from '@/types/sessionTypes';

// Helper function to create test data
function createTestData() {
  // Create test admins
  const admins: AdminAttendeeID[] = [
    {
      id: 1,
      sessionId: 'session1',
      role: 'ADMIN',
      name: { firstName: 'Admin', lastName: 'One' },
      gender: 'Male',
      nonoList: [101, 102], // Campers they can't work with
      yesyesList: [2, 3], // Staff/admins they want to work with
      daysOff: []
    },
    {
      id: 2,
      sessionId: 'session1',
      role: 'ADMIN',
      name: { firstName: 'Admin', lastName: 'Two' },
      gender: 'Female',
      nonoList: [103],
      yesyesList: [1, 4],
      daysOff: []
    },
    {
      id: 5,
      sessionId: 'session1',
      role: 'ADMIN',
      name: { firstName: 'Admin', lastName: 'Three' },
      gender: 'Male',
      nonoList: [],
      yesyesList: [],
      daysOff: []
    }
  ];

  // Create test staff
  const staff: StaffAttendeeID[] = [
    {
      id: 3,
      sessionId: 'session1',
      role: 'STAFF',
      name: { firstName: 'Staff', lastName: 'One' },
      gender: 'Male',
      nonoList: [],
      yesyesList: [1],
      bunk: 1,
      leadBunkCounselor: true,
      daysOff: []
    },
    {
      id: 4,
      sessionId: 'session1',
      role: 'STAFF',
      name: { firstName: 'Staff', lastName: 'Two' },
      gender: 'Female',
      nonoList: [],
      yesyesList: [2],
      bunk: 2,
      leadBunkCounselor: false,
      daysOff: []
    },
    {
      id: 6,
      sessionId: 'session1',
      role: 'STAFF',
      name: { firstName: 'Staff', lastName: 'Three' },
      gender: 'Male',
      nonoList: [],
      yesyesList: [],
      bunk: 3,
      leadBunkCounselor: false,
      daysOff: []
    }
  ];

  // Create test campers
  const campers: CamperAttendeeID[] = [
    {
      id: 101,
      sessionId: 'session1',
      role: 'CAMPER',
      name: { firstName: 'Camper', lastName: 'One' },
      gender: 'Male',
      dateOfBirth: '2010-01-01',
      ageGroup: 'NAV',
      level: 1,
      bunk: 1,
      swimOptOut: false,
      nonoList: []
    },
    {
      id: 102,
      sessionId: 'session1',
      role: 'CAMPER',
      name: { firstName: 'Camper', lastName: 'Two' },
      gender: 'Female',
      dateOfBirth: '2010-02-01',
      ageGroup: 'OCP',
      level: 2,
      bunk: 1,
      swimOptOut: false,
      nonoList: []
    },
    {
      id: 103,
      sessionId: 'session1',
      role: 'CAMPER',
      name: { firstName: 'Camper', lastName: 'Three' },
      gender: 'Male',
      dateOfBirth: '2009-05-01',
      ageGroup: 'NAV',
      level: 3,
      bunk: 2,
      swimOptOut: false,
      nonoList: []
    },
    {
      id: 104,
      sessionId: 'session1',
      role: 'CAMPER',
      name: { firstName: 'Camper', lastName: 'Four' },
      gender: 'Female',
      dateOfBirth: '2011-03-01',
      ageGroup: 'OCP',
      level: 1,
      bunk: 3,
      swimOptOut: true,
      nonoList: []
    }
  ];

  // Create test bunks
  const bunks: BunkID[] = [
    {
      id: 1,
      sessionId: 'session1',
      leadCounselor: 3,
      staffIds: [3],
      camperIds: [101, 102]
    },
    {
      id: 2,
      sessionId: 'session1',
      leadCounselor: 4,
      staffIds: [4],
      camperIds: [103]
    },
    {
      id: 3,
      sessionId: 'session1',
      leadCounselor: 6,
      staffIds: [6],
      camperIds: [104]
    }
  ];

  // Create test activities
  const activities: JamboreeActivity[] = [
    { name: 'Swimming', description: 'Pool activities' },
    { name: 'Arts & Crafts', description: 'Creative activities' },
    { name: 'Sports', description: 'Physical activities' },
    { name: 'Nature Walk', description: 'Outdoor exploration' }
  ];

  // Create test schedule with activities
  const schedule: SectionSchedule<'BUNK-JAMBO'> = {
    blocks: {
      'block1': {
        activities: activities.map(activity => ({
          ...activity,
          assignments: { bunk: [], adminIds: [] }
        })),
        periodsOff: []
      },
      'block2': {
        activities: activities.map(activity => ({
          ...activity,
          assignments: { bunk: [], adminIds: [] }
        })),
        periodsOff: []
      }
    },
    alternatePeriodsOff: {}
  };

  // Create test preferences
  const preferences: SectionPreferences = {
    'block1': {
      1: { 'Swimming': 5, 'Arts & Crafts': 3, 'Sports': 1, 'Nature Walk': 2 },
      2: { 'Swimming': 1, 'Arts & Crafts': 5, 'Sports': 3, 'Nature Walk': 4 },
      3: { 'Swimming': 2, 'Arts & Crafts': 1, 'Sports': 5, 'Nature Walk': 3 }
    },
    'block2': {
      1: { 'Swimming': 3, 'Arts & Crafts': 4, 'Sports': 2, 'Nature Walk': 5 },
      2: { 'Swimming': 4, 'Arts & Crafts': 2, 'Sports': 4, 'Nature Walk': 1 },
      3: { 'Swimming': 1, 'Arts & Crafts': 3, 'Sports': 3, 'Nature Walk': 4 }
    }
  };

  return {
    admins,
    staff,
    campers,
    bunks,
    schedule,
    preferences,
    blocksToAssign: ['block1', 'block2']
  };
}

// Test function 1: assignPeriodsOff()
function testAssignPeriodsOff() {
  console.log('=== Testing assignPeriodsOff() ===');
  
  const testData = createTestData();
  const scheduler = new BunkJamboreeScheduler()
    .withSchedule(testData.schedule)
    .withAdmins(testData.admins)
    .withStaff(testData.staff)
    .forBlocks(testData.blocksToAssign);

  // Test before assignment
  console.log('Before assignment:');
  testData.blocksToAssign.forEach(blockId => {
    console.log(`Block ${blockId} periods off:`, scheduler.schedule.blocks[blockId].periodsOff);
  });
  
  // Run the function
  scheduler.assignPeriodsOff();
  
  // Test after assignment
  console.log('After assignment:');
  let allTestsPassed = true;
  
  testData.blocksToAssign.forEach(blockId => {
    const periodsOff = scheduler.schedule.blocks[blockId].periodsOff;
    console.log(`Block ${blockId} periods off:`, periodsOff);
    console.log(`Block ${blockId} total periods off:`, periodsOff.length);
  });
  
  // Verify all staff and admins have exactly one period off across all blocks
  const totalPeople = testData.admins.length + testData.staff.length;
  const allPeriodsOff = testData.blocksToAssign.flatMap(blockId => 
    scheduler.schedule.blocks[blockId].periodsOff
  );
  const uniquePeriodsOff = new Set(allPeriodsOff);
  
  console.log(`Total unique people with periods off: ${uniquePeriodsOff.size}`);
  console.log(`Expected: ${totalPeople} (${testData.admins.length} admins + ${testData.staff.length} staff)`);
  
  // Check if all people have periods off
  if (uniquePeriodsOff.size !== totalPeople) {
    console.log('❌ FAIL: Not all people have periods off');
    allTestsPassed = false;
  }
  
  // Check yesyes relationships
  const relationships = scheduler.getYesYesRelationships();
  let relationshipTestsPassed = true;
  
  relationships.forEach((relatedPeople, attendeeId) => {
    const attendeeBlock = testData.blocksToAssign.find(blockId => 
      scheduler.schedule.blocks[blockId].periodsOff.includes(attendeeId)
    );
    
    relatedPeople.forEach(relatedPerson => {
      const relatedPersonBlock = testData.blocksToAssign.find(blockId => 
        scheduler.schedule.blocks[blockId].periodsOff.includes(relatedPerson.id)
      );
      
      if (attendeeBlock !== relatedPersonBlock) {
        console.log(`❌ FAIL: Attendee ${attendeeId} and related person ${relatedPerson.id} have different periods off`);
        relationshipTestsPassed = false;
      }
    });
  });
  
  console.log(`✅ Period assignment test: ${allTestsPassed ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Relationship test: ${relationshipTestsPassed ? 'PASS' : 'FAIL'}`);
  console.log('');
  
  return allTestsPassed && relationshipTestsPassed;
}

// Test function 2: assignAdminsToActivities()
function testAssignAdminsToActivities() {
  console.log('=== Testing assignAdminsToActivities() ===');
  
  const testData = createTestData();
  const scheduler = new BunkJamboreeScheduler()
    .withSchedule(testData.schedule)
    .withAdmins(testData.admins)
    .withStaff(testData.staff)
    .withBunks(testData.bunks)
    .forBlocks(testData.blocksToAssign);

  // First assign periods off
  scheduler.assignPeriodsOff();
  
  // Test before admin assignment
  console.log('Before admin assignment:');
  testData.blocksToAssign.forEach(blockId => {
    console.log(`\nBlock ${blockId}:`);
    scheduler.schedule.blocks[blockId].activities.forEach(activity => {
      console.log(`  ${activity.name}: ${activity.assignments.adminIds.length} admins`);
    });
  });
  
  // Run the function
  scheduler.assignAdminsToActivities();
  
  // Test after assignment
  console.log('\nAfter admin assignment:');
  let allTestsPassed = true;
  
  testData.blocksToAssign.forEach(blockId => {
    console.log(`\nBlock ${blockId}:`);
    const block = scheduler.schedule.blocks[blockId];
    let totalAdminsAssigned = 0;
    
    block.activities.forEach(activity => {
      console.log(`  ${activity.name}: ${activity.assignments.adminIds.length} admins (${activity.assignments.adminIds})`);
      totalAdminsAssigned += activity.assignments.adminIds.length;
    });
    
    // Verify admins are assigned to activities (excluding those on period off)
    const adminsOnPeriodOff = block.periodsOff.filter(id => 
      testData.admins.some(admin => admin.id === id)
    ).length;
    const availableAdmins = testData.admins.length - adminsOnPeriodOff;
    
    console.log(`  Total admins assigned: ${totalAdminsAssigned}`);
    console.log(`  Available admins (not on period off): ${availableAdmins}`);
    console.log(`  Admins on period off: ${block.periodsOff.filter(id => testData.admins.some(admin => admin.id === id))}`);
    
    if (totalAdminsAssigned > availableAdmins) {
      console.log(`  ❌ FAIL: More admins assigned than available`);
      allTestsPassed = false;
    }
    
    // Check for nono conflicts
    block.activities.forEach(activity => {
      const camperIdsInActivity = activity.assignments.bunk.flatMap(bunkId => {
        const bunk = testData.bunks.find(b => b.id === bunkId);
        return bunk ? bunk.camperIds : [];
      });
      
      activity.assignments.adminIds.forEach(adminId => {
        const admin = testData.admins.find(a => a.id === adminId);
        if (admin) {
          const hasConflict = admin.nonoList.some(nonoId => 
            camperIdsInActivity.includes(nonoId)
          );
          
          if (hasConflict) {
            console.log(`  ❌ FAIL: Admin ${adminId} assigned to ${activity.name} but has nono conflict with campers ${admin.nonoList}`);
            allTestsPassed = false;
          }
        }
      });
    });
  });
  
  console.log(`\n✅ Admin assignment test: ${allTestsPassed ? 'PASS' : 'FAIL'}`);
  console.log('');
  
  return allTestsPassed;
}

// Test function 3: assignBunksToActivities()
function testAssignBunksToActivities() {
  console.log('=== Testing assignBunksToActivities() ===');
  
  const testData = createTestData();
  const scheduler = new BunkJamboreeScheduler()
    .withSchedule(testData.schedule)
    .withBunks(testData.bunks)
    .withPreferences(testData.preferences)
    .forBlocks(testData.blocksToAssign);

  // Test before bunk assignment
  console.log('Before bunk assignment:');
  testData.blocksToAssign.forEach(blockId => {
    console.log(`\nBlock ${blockId}:`);
    scheduler.schedule.blocks[blockId].activities.forEach(activity => {
      console.log(`  ${activity.name}: ${activity.assignments.bunk.length} bunks`);
    });
  });
  
  // Run the function
  scheduler.assignBunksToActivities();
  
  // Test after assignment
  console.log('\nAfter bunk assignment:');
  let allTestsPassed = true;
  
  testData.blocksToAssign.forEach(blockId => {
    console.log(`\nBlock ${blockId}:`);
    const block = scheduler.schedule.blocks[blockId];
    let totalBunksAssigned = 0;
    
    block.activities.forEach(activity => {
      console.log(`  ${activity.name}: ${activity.assignments.bunk.length} bunks (${activity.assignments.bunk})`);
      totalBunksAssigned += activity.assignments.bunk.length;
    });
    
    // Verify all bunks are assigned to exactly one activity
    console.log(`  Total bunks assigned: ${totalBunksAssigned}`);
    console.log(`  Total bunks available: ${testData.bunks.length}`);
    
    if (totalBunksAssigned !== testData.bunks.length) {
      console.log(`  ❌ FAIL: Not all bunks assigned (expected ${testData.bunks.length}, got ${totalBunksAssigned})`);
      allTestsPassed = false;
    }
    
    // Check that each bunk is assigned to exactly one activity
    const allAssignedBunks = block.activities.flatMap(activity => activity.assignments.bunk);
    const uniqueAssignedBunks = new Set(allAssignedBunks);
    
    if (uniqueAssignedBunks.size !== allAssignedBunks.length) {
      console.log(`  ❌ FAIL: Some bunks assigned to multiple activities`);
      allTestsPassed = false;
    }
    
    // Check that all bunks are assigned
    const unassignedBunks = testData.bunks.filter(bunk => !allAssignedBunks.includes(bunk.id));
    if (unassignedBunks.length > 0) {
      console.log(`  ❌ FAIL: Unassigned bunks: ${unassignedBunks.map(b => b.id)}`);
      allTestsPassed = false;
    }
  });
  
  console.log(`\n✅ Bunk assignment test: ${allTestsPassed ? 'PASS' : 'FAIL'}`);
  console.log('');
  
  return allTestsPassed;
}

// Test all functions together
function testAllFunctions() {
  console.log('=== Testing All Functions Together ===');
  
  const testData = createTestData();
  const scheduler = new BunkJamboreeScheduler()
    .withSchedule(testData.schedule)
    .withAdmins(testData.admins)
    .withStaff(testData.staff)
    .withBunks(testData.bunks)
    .withPreferences(testData.preferences)
    .forBlocks(testData.blocksToAssign);

  // Run all three functions in sequence
  scheduler
    .assignPeriodsOff()
    .assignAdminsToActivities()
    .assignBunksToActivities();

  // Print final state
  console.log('Final schedule state:');
  testData.blocksToAssign.forEach(blockId => {
    console.log(`\n--- Block ${blockId} ---`);
    const block = scheduler.schedule.blocks[blockId];
    console.log('Periods off:', block.periodsOff);
    
    block.activities.forEach(activity => {
      console.log(`\n${activity.name}:`);
      console.log(`  Bunks: ${activity.assignments.bunk}`);
      console.log(`  Admins: ${activity.assignments.adminIds}`);
      
      // Show which campers are in this activity
      const camperIds = activity.assignments.bunk.flatMap(bunkId => {
        const bunk = testData.bunks.find(b => b.id === bunkId);
        return bunk ? bunk.camperIds : [];
      });
      console.log(`  Campers: ${camperIds}`);
    });
  });
  
  console.log('\n✅ All functions completed successfully!');
  return true;
}

// Edge case tests
function testEdgeCases() {
  console.log('=== Testing Edge Cases ===');
  
  // Test with minimal data
  console.log('\n--- Minimal Data Test ---');
  const minimalSchedule: SectionSchedule<'BUNK-JAMBO'> = {
    blocks: {
      'block1': {
        activities: [
          { name: 'Test Activity', description: 'Test', assignments: { bunk: [], adminIds: [] } }
        ],
        periodsOff: []
      }
    },
    alternatePeriodsOff: {}
  };
  
  const minimalScheduler = new BunkJamboreeScheduler()
    .withSchedule(minimalSchedule)
    .withAdmins([{
      id: 1,
      sessionId: 'session1',
      role: 'ADMIN',
      name: { firstName: 'Single', lastName: 'Admin' },
      gender: 'Male',
      nonoList: [],
      yesyesList: [],
      daysOff: []
    }])
    .withStaff([])
    .withBunks([])
    .forBlocks(['block1']);
  
  try {
    minimalScheduler.assignPeriodsOff();
    console.log('✅ Minimal data test passed');
  } catch (error) {
    console.log('❌ Minimal data test failed:', error);
  }
  
  // Test with empty activities
  console.log('\n--- Empty Activities Test ---');
  const emptySchedule: SectionSchedule<'BUNK-JAMBO'> = {
    blocks: {
      'block1': {
        activities: [],
        periodsOff: []
      }
    },
    alternatePeriodsOff: {}
  };
  
  const emptyScheduler = new BunkJamboreeScheduler()
    .withSchedule(emptySchedule)
    .withAdmins([])
    .withStaff([])
    .withBunks([])
    .forBlocks(['block1']);
  
  try {
    emptyScheduler.assignPeriodsOff().assignAdminsToActivities().assignBunksToActivities();
    console.log('✅ Empty activities test passed');
  } catch (error) {
    console.log('❌ Empty activities test failed:', error);
  }
  
  console.log('');
}

// Main test runner
export function runTests() {
  console.log('🧪 Starting BunkJamboreeScheduler Tests\n');
  
  const results = {
    assignPeriodsOff: testAssignPeriodsOff(),
    assignAdminsToActivities: testAssignAdminsToActivities(),
    assignBunksToActivities: testAssignBunksToActivities(),
    integration: testAllFunctions()
  };
  
  testEdgeCases();
  
  // Summary
  console.log('=== Test Summary ===');
  console.log(`assignPeriodsOff(): ${results.assignPeriodsOff ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`assignAdminsToActivities(): ${results.assignAdminsToActivities ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`assignBunksToActivities(): ${results.assignBunksToActivities ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Integration test: ${results.integration ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\nOverall result: ${allPassed ? '🎉 ALL TESTS PASSED' : '💥 SOME TESTS FAILED'}`);
  
  return results;
}

// For Node.js execution
if (typeof window === 'undefined') {
  runTests();
}
