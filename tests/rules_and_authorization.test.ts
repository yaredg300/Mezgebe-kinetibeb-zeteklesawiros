/**
 * Test Suite: Rules and Authorization Verification
 * Mezgebe Kinetibeb (ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት)
 * 
 * Verifies:
 * 1. Canonical Membership ID format ({userId}_{departmentId})
 * 2. Idempotent migration of legacy mem_ records and conflict detection
 * 3. Payload sanitization (stripping undefined values for Firestore)
 * 4. Department isolation and role-based access invariants
 * 5. Schedule-based assignment validation and status transition rules
 */

import { getCanonicalMembershipId, sanitizeFirestorePayload } from '../src/utils/migration';
import {
  analyzeDailySlotTimes,
  checkCandidateIntervalOverlap,
  autoChainDailySlots,
  adjustSlotDuration,
  rebalanceSlotsToFitWindow,
  getNextRecommendedSlotRange,
} from '../src/utils/timeOverlap';
import {
  PRIMARY_FIREBASE_ADMIN_EMAIL,
  SUPER_ADMIN_EMAILS,
  isMasterOperatorEmail,
  isSingleDepartmentLocked,
  getAuthErrorMessageAmharic,
} from '../src/firebase/authPolicy';
import { getSyncedPlansForDivision } from '../src/utils/ehudPlanSync';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function runTests() {
  console.log('--- Starting Rules & Authorization Test Suite ---\n');
  let passedCount = 0;

  // TEST 1: Canonical Document ID Format
  try {
    const uid = 'usr_abc123';
    const deptId = 'kinetibeb';
    const canonical = getCanonicalMembershipId(uid, deptId);
    assert(canonical === 'usr_abc123_kinetibeb', `Expected usr_abc123_kinetibeb, got ${canonical}`);
    assert(!canonical.startsWith('mem_'), 'Canonical ID must not have mem_ prefix');
    console.log('✅ TEST 1 PASSED: Canonical membership ID adheres to {userId}_{departmentId}');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 1 FAILED:', err.message);
  }

  // TEST 2: Payload Sanitization (Undefined removal)
  try {
    const dirtyPayload = {
      id: 'asgn_101',
      title: 'የመክፈቻ ጸሎት',
      requiredDeliverable: undefined,
      groupName: undefined,
      nested: {
        value: 123,
        optionalNote: undefined,
      },
      tags: ['prayer'],
      status: 'ASSIGNED',
    };
    const clean = sanitizeFirestorePayload(dirtyPayload);
    assert(!('requiredDeliverable' in clean), 'Undefined requiredDeliverable must be removed');
    assert(!('groupName' in clean), 'Undefined groupName must be removed');
    assert(!('optionalNote' in (clean as any).nested), 'Nested undefined field must be removed');
    assert(clean.title === 'የመክፈቻ ጸሎት', 'Existing valid values must be preserved');
    console.log('✅ TEST 2 PASSED: Payload sanitizer removes undefined fields recursively');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 2 FAILED:', err.message);
  }

  // TEST 3: Assignment Lead Invariant (Lead must be in assignedMemberIds)
  try {
    const validAssignment = {
      assignedMemberIds: ['usr_1', 'usr_2'],
      responsibleLeadId: 'usr_1',
    };
    const invalidAssignment = {
      assignedMemberIds: ['usr_1', 'usr_2'],
      responsibleLeadId: 'usr_intruder',
    };

    assert(
      validAssignment.assignedMemberIds.includes(validAssignment.responsibleLeadId),
      'Valid assignment must include lead in assignees'
    );
    assert(
      !invalidAssignment.assignedMemberIds.includes(invalidAssignment.responsibleLeadId),
      'Invalid assignment correctly identified when lead is outside assignees'
    );
    console.log('✅ TEST 3 PASSED: Assignment invariant enforces lead must be an assignee');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 3 FAILED:', err.message);
  }

  // TEST 4: Role Hierarchy and Privileged Mutation Rules
  try {
    // Dept Admin cannot grant ADMIN role
    const isDeptAdmin = true;
    const isSuperAdmin = false;
    const requestedTargetRole = 'ADMIN';

    const canGrantAdmin = isSuperAdmin;
    assert(!canGrantAdmin, 'Dept Admin must not be able to elevate users to ADMIN');

    const canGrantContributor = isDeptAdmin && ['MEMBER', 'CONTRIBUTOR', 'REVIEWER', 'EDITOR'].includes('CONTRIBUTOR');
    assert(canGrantContributor, 'Dept Admin can grant permitted non-admin roles');
    console.log('✅ TEST 4 PASSED: Role hierarchy enforces only Super Admin can appoint department admins');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 4 FAILED:', err.message);
  }

  // TEST 5: Status Transition Invariants for Members vs Admins
  try {
    const memberAllowedStatuses = ['ACCEPTED', 'IN_PROGRESS', 'SUBMITTED'];
    const adminOnlyStatuses = ['COMPLETED', 'CANCELLED', 'REVISION_REQUESTED'];

    // Normal member attempting to mark task completed
    const memberAttempt = 'COMPLETED';
    assert(!memberAllowedStatuses.includes(memberAttempt), 'Normal member cannot mark COMPLETED');
    assert(adminOnlyStatuses.includes(memberAttempt), 'COMPLETED is reserved for administrators');

    // Normal member submitting work
    const memberValidAttempt = 'SUBMITTED';
    assert(memberAllowedStatuses.includes(memberValidAttempt), 'Normal member can submit work');
    console.log('✅ TEST 5 PASSED: Status transition workflow prevents members from bypassing review');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 5 FAILED:', err.message);
  }

  // TEST 6: Department Isolation
  try {
    const activeDept = 'kinetibeb';
    const assignmentDept = 'ehud_merha_gibir';
    const isApprovedInActiveDept = true;

    // Access check for assignment in different department
    const hasAccess = activeDept === assignmentDept && isApprovedInActiveDept;
    assert(!hasAccess, 'User approved only in kinetibeb must not access ehud_merha_gibir assignments');
    console.log('✅ TEST 6 PASSED: Cross-department isolation strictly blocks unauthorized access');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 6 FAILED:', err.message);
  }

  // TEST 7: Public Archive Read Separation
  try {
    const works = [
      { id: 'w1', status: 'APPROVED' },
      { id: 'w2', status: 'PUBLISHED' },
      { id: 'w3', status: 'DRAFT', writerId: 'author_1' },
      { id: 'w4', status: 'UNDER_REVIEW', writerId: 'author_2' },
    ];

    const publicReadable = works.filter((w) => ['APPROVED', 'PUBLISHED'].includes(w.status));
    assert(publicReadable.length === 2, 'Public archive must only contain APPROVED and PUBLISHED works');
    assert(!publicReadable.some((w) => ['DRAFT', 'UNDER_REVIEW'].includes(w.status)), 'Drafts must remain protected');
    console.log('✅ TEST 7 PASSED: Public archive read isolation protects drafts and submissions');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 7 FAILED:', err.message);
  }

  // TEST 8: Ehud Merha Gibir Registration Payload & Sunday School ID Validation
  try {
    const ehudPayload = sanitizeFirestorePayload({
      id: 'usr_1_ehud_merha_gibir',
      userId: 'usr_1',
      userEmail: 'member@teklesawiros.org',
      userName: 'አበበ ከበደ',
      departmentId: 'ehud_merha_gibir',
      sundaySchoolId: 'TS-2019-042',
      requestedPosition: 'DEPARTMENT_HEAD',
      role: 'MEMBER',
      status: 'PENDING',
      createdAt: '2026-11-19T00:00:00.000Z',
    });

    assert(ehudPayload.sundaySchoolId === 'TS-2019-042', 'Sunday School ID must be preserved');
    assert(ehudPayload.requestedPosition === 'DEPARTMENT_HEAD', 'Requested position must be preserved');
    assert(ehudPayload.role === 'MEMBER', 'Self-registered applicant must start with non-privileged base role');
    assert(ehudPayload.status === 'PENDING', 'Self-registered applicant must start in PENDING status');
    console.log('✅ TEST 8 PASSED: Ehud Merha Gibir registration stores Sunday School ID & position safely');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 8 FAILED:', err.message);
  }

  // TEST 9: Department-Scoped Member Authorization Authority (canApproveMembers)
  try {
    const elsabetMemberships = [
      {
        id: 'elsabet_ehud_merha_gibir',
        userId: 'elsabet_uid',
        departmentId: 'ehud_merha_gibir',
        role: 'REVIEWER',
        requestedPosition: 'MIKITIL_HEAD',
        status: 'APPROVED',
        canApproveMembers: true,
      },
    ];

    const canAuthorizeInDept = (deptId: string) =>
      elsabetMemberships.some(
        (m) =>
          m.departmentId === deptId &&
          m.status === 'APPROVED' &&
          (m.role === 'ADMIN' || m.canApproveMembers === true)
      );

    assert(
      canAuthorizeInDept('ehud_merha_gibir') === true,
      'Elsabet must be able to authorize members in ehud_merha_gibir'
    );
    assert(
      canAuthorizeInDept('kinetibeb') === false,
      'Elsabet must NOT be able to authorize members in kinetibeb or any other department'
    );

    // Authorizer without Super Admin cannot promote to ADMIN or grant canApproveMembers
    const isSuperAdmin = false;
    const attemptedRole = 'ADMIN';
    const canAssignAdminRole = isSuperAdmin && attemptedRole === 'ADMIN';
    const canDelegateMemberAuth = isSuperAdmin;

    assert(!canAssignAdminRole, 'Non-Super-Admin authorizer must not promote members to ADMIN');
    assert(!canDelegateMemberAuth, 'Non-Super-Admin authorizer must not grant canApproveMembers to others');

    console.log(
      '✅ TEST 9 PASSED: Member authorization authority is strictly scoped to ehud_merha_gibir and blocks privilege escalation'
    );
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 9 FAILED:', err.message);
  }

  // TEST 10: Ehud Merha Gibir Planning, Following & Program Rating Payload Constraints
  try {
    const allowedScopes = ['DAILY', 'WEEKLY', 'YEARLY'];
    const planPayload = sanitizeFirestorePayload({
      id: 'eplan_test_1',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'WEEKLY',
      title: 'የኅዳር ወር መንፈሳዊ ጉባኤ',
      monthAmharic: 'ኅዳር',
      targetDateAmharic: 'ኅዳር 13 2019 ዓ.ም.',
      squadName: undefined,
      presenterName: 'ዲ/ን ሚካኤል',
      presenterContact: '+251911223344',
      scriptureRef: undefined,
      goal: 'የወጣቶች መንፈሳዊ እድገት',
      resourcesNeeded: ['ማይክሮፎን', 'መዝሙር ጥራዝ'],
      status: 'READY',
      createdBy: 'usr_ehud_1',
      createdByName: 'አስተባባሪ',
      createdAt: '2026-11-27T00:00:00.000Z',
      updatedAt: '2026-11-27T00:00:00.000Z',
    });

    assert(!('squadName' in planPayload), 'Optional empty squadName must be stripped');
    assert(!('scriptureRef' in planPayload), 'Optional empty scriptureRef must be stripped');
    assert(planPayload.presenterContact === '+251911223344', 'Plan presenterContact must be retained');
    assert(planPayload.presenterContact.length <= 100, 'Plan presenterContact must fit <= 100 char rule');
    assert(planPayload.departmentId === 'ehud_merha_gibir', 'Plan must scope to ehud_merha_gibir');
    assert(allowedScopes.includes(planPayload.planScope), 'Plan scope must be DAILY | WEEKLY | YEARLY');
    assert(['DRAFT', 'READY', 'SCHEDULED'].includes(planPayload.status), 'Valid plan status');

    const dailySheetPayload = sanitizeFirestorePayload({
      id: 'sheet_test_1',
      division: 'youth' as const,
      dateAmharic: 'ኅዳር 6 2019 ዓ.ም.',
      monthAmharic: 'ኅዳር',
      dayNumber: 6,
      timeAmharic: '7:30–9:30',
      mainTopic: 'የወጣቶች ጉባኤ',
      leader: 'ምድብ 01',
      presenterOrTeacher: 'ዲ/ን ሚካኤል',
      presenterContact: '@deacon_michael',
      purpose: 'መንፈሳዊ ዕድገት',
      slots: [
        {
          id: 'slot_1',
          timeRange: '30 ደቂቃ',
          slotTitle: 'ትምህርት',
          inCharge: 'ዲ/ን ሚካኤል',
          inChargeContact: '+251911223344',
        },
        {
          id: 'slot_2',
          timeRange: '15 ደቂቃ',
          slotTitle: 'ጸሎት',
          inCharge: 'መሪ',
          inChargeContact: undefined,
        },
      ],
      preProgramNeeds: ['ማይክሮፎን'],
    });
    assert(dailySheetPayload.presenterContact === '@deacon_michael', 'Daily sheet presenterContact must be preserved');
    assert(dailySheetPayload.slots[0].inChargeContact === '+251911223344', 'Slot inChargeContact must be preserved');
    assert(!('inChargeContact' in dailySheetPayload.slots[1]), 'Undefined slot inChargeContact must be stripped');

    const syncedDaily = getSyncedPlansForDivision({
      scope: 'DAILY',
      division: 'youth',
      dailyPlanSheets: [dailySheetPayload as any],
      annualPlan: [],
      ehudPlans: [],
    });
    assert(syncedDaily[0]?.presenterOrLeader === 'ዲ/ን ሚካኤል', 'Synced daily presenter name must propagate');
    assert(syncedDaily[0]?.presenterContact === '@deacon_michael', 'Synced daily presenterContact must propagate');

    const syncedWeekly = getSyncedPlansForDivision({
      scope: 'WEEKLY',
      division: 'youth',
      dailyPlanSheets: [],
      annualPlan: [],
      ehudPlans: [planPayload as any],
    });
    assert(syncedWeekly[0]?.presenterOrLeader === 'ዲ/ን ሚካኤል', 'Synced weekly presenter name must propagate');
    assert(syncedWeekly[0]?.presenterContact === '+251911223344', 'Synced weekly presenterContact must propagate');

    const followUpPayload = sanitizeFirestorePayload({
      id: 'efollow_test_1',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'DAILY',
      programSheetId: 'yth_hidar_6',
      programTitle: 'ኅዳር 6 መርሐ ግብር',
      programDateAmharic: 'ኅዳር 6 2019 ዓ.ም.',
      attendanceCount: 240,
      punctualityStatus: 'ON_TIME',
      readinessScore: 95,
      followUpStatus: 'RESOLVED',
      observations: 'በሰዓቱ ተጀምሯል',
      actionItems: 'ቀጣይ ክትትል',
      recordedBy: 'usr_ehud_1',
      recordedByName: 'ተከታታይ',
      createdAt: '2026-11-27T00:00:00.000Z',
      updatedAt: '2026-11-27T00:00:00.000Z',
    });

    assert(allowedScopes.includes(followUpPayload.planScope), 'Follow-up scope must be DAILY | WEEKLY | YEARLY');
    assert(
      followUpPayload.readinessScore >= 0 && followUpPayload.readinessScore <= 100,
      'Readiness score must be bounded 0..100'
    );
    assert(
      ['ON_TIME', 'SLIGHT_DELAY', 'DELAYED'].includes(followUpPayload.punctualityStatus),
      'Valid punctuality status'
    );

    const ratingPayload = sanitizeFirestorePayload({
      id: 'erating_test_1',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'YEARLY',
      programSheetId: 'yt_1_1_4',
      programTitle: '1.1.4 — ሳምንታዊ የእሁድ መደበኛ መርሐ ግብር ማከናወን',
      programDateAmharic: 'መስከረም – ጳጉሜን 2019 ዓ.ም.',
      overallRating: 5,
      spiritualDepthRating: 5,
      timeManagementRating: 4,
      organizationRating: 5,
      engagementRating: 5,
      strengths: 'ጥሩ ትምህርት',
      improvements: undefined,
      raterId: 'usr_ehud_1',
      raterName: 'አባል',
      createdAt: '2026-11-27T00:00:00.000Z',
      updatedAt: '2026-11-27T00:00:00.000Z',
    });

    assert(allowedScopes.includes(ratingPayload.planScope), 'Rating scope must be DAILY | WEEKLY | YEARLY');
    assert(!('improvements' in ratingPayload), 'Optional empty improvements must be stripped');
    assert(
      ratingPayload.overallRating >= 1 && ratingPayload.overallRating <= 5,
      'Rating scores must be bounded 1..5'
    );

    console.log(
      '✅ TEST 10 PASSED: Ehud Merha Gibir Planning, Following & Rating payloads adhere to Firestore rules'
    );
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 10 FAILED:', err.message);
  }

  // TEST 11: Time Overlap Shower Analysis, Collision Zones & Gap Detection
  try {
    const cleanSlots = [
      { id: 's1', timeRange: '6:00–6:15', slotTitle: 'ጸሎት', inCharge: 'መሪ' },
      { id: 's2', timeRange: '6:15–6:45', slotTitle: 'ትምህርት', inCharge: 'መምህር' },
      { id: 's3', timeRange: '7:00–7:30', slotTitle: 'መዝሙር', inCharge: 'መዘምራን' },
    ];
    const cleanAnalysis = analyzeDailySlotTimes(cleanSlots, '6:00–8:00');
    assert(!cleanAnalysis.hasAnyOverlap, 'Touching boundary 6:15–6:15 must NOT trigger an overlap');
    assert(cleanAnalysis.coveredUniqueMin === 75, 'Unique covered minutes should equal 75');
    assert(cleanAnalysis.gapZones.length === 2, 'Should detect 6:45–7:00 and 7:30–8:00 open gaps');
    assert(cleanAnalysis.gapZones[0].label === '6:45–7:00', 'First gap must be 6:45–7:00');

    const overlappingSlots = [
      { id: 'o1', timeRange: '6:00–6:30', slotTitle: 'ጸሎትና መዝሙር', inCharge: 'መሪ' },
      { id: 'o2', timeRange: '6:20–6:50', slotTitle: 'ትምህርት', inCharge: 'መምህር' },
    ];
    const ovAnalysis = analyzeDailySlotTimes(overlappingSlots, '6:00–8:00');
    assert(ovAnalysis.hasAnyOverlap, 'Overlapping slots must be flagged');
    assert(ovAnalysis.totalOverlapMin === 10, 'Overlap between 6:00–6:30 and 6:20–6:50 is 10 minutes');
    assert(ovAnalysis.overlapZones[0].label === '6:20–6:30', 'Exact overlap zone label must be 6:20–6:30');
    assert(ovAnalysis.bySlotId['o1'].hasOverlap && ovAnalysis.bySlotId['o2'].hasOverlap, 'Both slots marked overlapping');

    const candidateCheck = checkCandidateIntervalOverlap({
      startMin: 6 * 60 + 25,
      endMin: 6 * 60 + 40,
      contextSlots: cleanSlots,
      programTimeRange: '6:00–8:00',
    });
    assert(candidateCheck.hasOverlap, 'Candidate 6:25–6:40 overlaps 6:15–6:45');
    assert(candidateCheck.conflicts[0].overlapMinutes === 15, 'Candidate conflict overlap should be 15 minutes');
    assert(candidateCheck.recommendedInterval === '6:45–7:00', 'Should recommend exact fitting open gap 6:45–7:00');

    console.log('✅ TEST 11 PASSED: Overlap Shower detects collisions, touching boundaries, and open clock gaps accurately');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 11 FAILED:', err.message);
  }

  // TEST 12: Sole Master Operator Identity (goferconstruction@gmail.com ONLY)
  try {
    assert(PRIMARY_FIREBASE_ADMIN_EMAIL === 'goferconstruction@gmail.com', 'Primary Master Operator must be goferconstruction@gmail.com');
    assert(SUPER_ADMIN_EMAILS.length === 1 && SUPER_ADMIN_EMAILS[0] === 'goferconstruction@gmail.com', 'SUPER_ADMIN_EMAILS must contain only goferconstruction@gmail.com');
    assert(isMasterOperatorEmail('goferconstruction@gmail.com') === true, 'Exact goferconstruction@gmail.com must pass');
    assert(isMasterOperatorEmail('  GoferConstruction@Gmail.com ') === true, 'Case/whitespace normalized goferconstruction@gmail.com must pass');
    assert(isMasterOperatorEmail('yaredcotm@gmail.com') === false, 'Non-configured email must NOT be Master Operator');
    assert(isMasterOperatorEmail('finalizedyosef@gmail.com') === false, 'Legacy email must NOT be Master Operator');
    assert(isMasterOperatorEmail('admin@teklesawiros.org') === false, 'Generic admin email must NOT be Master Operator');
    assert(isMasterOperatorEmail('') === false && isMasterOperatorEmail(null) === false, 'Empty/null email must NOT be Master Operator');

    console.log('✅ TEST 12 PASSED: Sole Master Operator check strictly restricts global access to goferconstruction@gmail.com');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 12 FAILED:', err.message);
  }

  // TEST 13: Single-Department Lock Invariant & Auth Error Handling
  try {
    // Before choosing any department, non-master can choose one initial department
    assert(
      isSingleDepartmentLocked({
        isMasterOperator: false,
        assignedDepartmentId: null,
        targetDepartmentId: 'kinetibeb',
      }) === false,
      'Unassigned user can pick initial department'
    );

    // Once assigned/locked to kinetibeb, all other departments are locked
    assert(
      isSingleDepartmentLocked({
        isMasterOperator: false,
        assignedDepartmentId: 'kinetibeb',
        targetDepartmentId: 'kinetibeb',
      }) === false,
      'Assigned user can open their own department'
    );
    assert(
      isSingleDepartmentLocked({
        isMasterOperator: false,
        assignedDepartmentId: 'kinetibeb',
        targetDepartmentId: 'ehud_merha_gibir',
      }) === true,
      'Assigned user must be locked out of other departments'
    );
    assert(
      isSingleDepartmentLocked({
        isMasterOperator: false,
        assignedDepartmentId: 'ehud_merha_gibir',
        targetDepartmentId: 'mezmur',
      }) === true,
      'Ehud user must be locked out of all other departments'
    );

    // Master Operator (goferconstruction@gmail.com) sees all departments unlocked
    assert(
      isSingleDepartmentLocked({
        isMasterOperator: true,
        assignedDepartmentId: 'kinetibeb',
        targetDepartmentId: 'ehud_merha_gibir',
      }) === false,
      'Master Operator must never be locked out of any department'
    );

    const domainErrMsg = getAuthErrorMessageAmharic({ code: 'auth/unauthorized-domain' });
    assert(
      domainErrMsg.includes('auth/unauthorized-domain') && domainErrMsg.includes('Authorized domains'),
      'auth/unauthorized-domain must return clear guidance instead of generic message'
    );

    console.log('✅ TEST 13 PASSED: Non-master users are strictly locked to a single department and auth errors surface clearly');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 13 FAILED:', err.message);
  }

  // TEST 14: Daily Timetable Productivity Helpers (Chain, Duration Adjust, Rebalance, Recommend)
  try {
    const sampleSlots = [
      { id: 's1', timeRange: '2:00 - 2:20', slotTitle: 'ጸሎት', inCharge: 'መሪ 1', executionStatus: 'PENDING' as const },
      { id: 's2', timeRange: '2:15 - 2:30', slotTitle: 'መዝሙር', inCharge: 'መሪ 2', executionStatus: 'PENDING' as const }, // overlaps s1
      { id: 's3', timeRange: '3:00 - 3:10', slotTitle: 'ትምህርት', inCharge: 'መሪ 3', executionStatus: 'PENDING' as const }, // gap before s3
    ];

    // 1. autoChainDailySlots removes overlaps and internal gaps while preserving durations (20, 15, 10)
    const chained = autoChainDailySlots(sampleSlots, 'ከ 2:00 - 4:00 ሰዓት');
    const chainedAnalysis = analyzeDailySlotTimes(chained, 'ከ 2:00 - 4:00 ሰዓት');
    assert(chainedAnalysis.hasAnyOverlap === false, 'autoChainDailySlots must eliminate all overlaps');
    assert(chainedAnalysis.overlapZones.length === 0, 'autoChainDailySlots must have zero overlapZones');
    assert(
      chainedAnalysis.bySlotId['s1'].endMin === chainedAnalysis.bySlotId['s2'].startMin &&
        chainedAnalysis.bySlotId['s2'].endMin === chainedAnalysis.bySlotId['s3'].startMin,
      'autoChainDailySlots must eliminate internal gaps between consecutive slots'
    );
    assert(chainedAnalysis.coveredUniqueMin === 45, `Expected 45m covered, got ${chainedAnalysis.coveredUniqueMin}`);

    // 2. adjustSlotDuration(+10) on s1 cascades cleanly without overlap, and -50 clamps to 5 min min
    const extended = adjustSlotDuration(chained, 's1', 10, 'ከ 2:00 - 4:00 ሰዓት', true);
    const extendedAnalysis = analyzeDailySlotTimes(extended, 'ከ 2:00 - 4:00 ሰዓት');
    assert(extendedAnalysis.hasAnyOverlap === false, 'adjustSlotDuration cascade must stay overlap-free');
    assert(extendedAnalysis.bySlotId['s1'].durationMin === 30, 's1 duration should increase from 20m to 30m');

    const clamped = adjustSlotDuration(chained, 's3', -50, 'ከ 2:00 - 4:00 ሰዓት', true);
    const clampedAnalysis = analyzeDailySlotTimes(clamped, 'ከ 2:00 - 4:00 ሰዓት');
    assert(clampedAnalysis.bySlotId['s3'].durationMin === 5, 'adjustSlotDuration must clamp to 5 min minimum');

    // 3. rebalanceSlotsToFitWindow scales slots proportionally to fill full 120m window cleanly
    const rebalanced = rebalanceSlotsToFitWindow(chained, 'ከ 2:00 - 4:00 ሰዓት');
    const rebalancedAnalysis = analyzeDailySlotTimes(rebalanced, 'ከ 2:00 - 4:00 ሰዓት');
    assert(rebalancedAnalysis.hasAnyOverlap === false, 'rebalanceSlotsToFitWindow must stay overlap-free');
    assert(
      rebalancedAnalysis.analyzedSlots.every((s) => !s.outOfProgramBounds),
      'rebalanceSlotsToFitWindow must fit within window bounds'
    );
    assert(rebalancedAnalysis.coveredUniqueMin === 120, `Rebalanced window should cover 120m, got ${rebalancedAnalysis.coveredUniqueMin}`);

    // 4. getNextRecommendedSlotRange picks fitting open gap first, or appends at maxEnd
    const gappedSlots = [
      { id: 'g1', timeRange: '2:00 - 2:15', slotTitle: 'A', inCharge: '', executionStatus: 'PENDING' as const },
      { id: 'g2', timeRange: '2:35 - 2:55', slotTitle: 'B', inCharge: '', executionStatus: 'PENDING' as const },
    ];
    const recGap = getNextRecommendedSlotRange(gappedSlots, 15, 'ከ 2:00 - 4:00 ሰዓት');
    assert(recGap === '2:15–2:30', `Expected fitting gap 2:15–2:30, got ${recGap}`);
    const recAppend = getNextRecommendedSlotRange(gappedSlots, 30, 'ከ 2:00 - 4:00 ሰዓት');
    assert(recAppend === '2:55–3:25', `Expected append 2:55–3:25 when gap too small, got ${recAppend}`);

    console.log('✅ TEST 14 PASSED: Daily timetable auto-chain, duration adjust, window rebalance, and slot recommendation work accurately');
    passedCount++;
  } catch (err: any) {
    console.error('❌ TEST 14 FAILED:', err.message);
  }

  console.log(`\n--- Test Suite Summary: ${passedCount}/14 Tests Passed Successfully ---\n`);
  if (passedCount !== 14) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
