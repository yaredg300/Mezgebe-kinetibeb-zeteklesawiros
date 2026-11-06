export type UserRole =
  | 'MEMBER'
  | 'CONTRIBUTOR'
  | 'REVIEWER'
  | 'EDITOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface UserRoleInfo {
  role: UserRole;
  amharicTitle: string;
  description: string;
}

export const USER_ROLES: Record<UserRole, { amharicTitle: string; description: string }> = {
  MEMBER: { amharicTitle: 'ተጠቃሚ / አባል', description: 'የጸደቁ ሥራዎችን ማንበብና ማሰስ' },
  CONTRIBUTOR: { amharicTitle: 'ደራሲ / አቅራቢ', description: 'የፈጠራ ሥራዎችን ማዘጋጀትና ማቅረብ' },
  REVIEWER: { amharicTitle: 'ገምጋሚ / የቤ/ክ ኃላፊ', description: 'የቀረቡ ሥራዎችን መገምገምና ማጽደቅ' },
  EDITOR: { amharicTitle: 'አዘጋጅ', description: 'ለሕትመትና ለመዝገብ ማዘጋጀት' },
  ADMIN: { amharicTitle: 'አስተዳዳሪ', description: 'የስርዓቱን አስተዳደር መቆጣጠር' },
  SUPER_ADMIN: { amharicTitle: 'ዋና አስተዳዳሪ', description: 'ሙሉ ቁጥጥር' },
};

export type SubmissionStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export const SUBMISSION_STATUS_CONFIG: Record<
  SubmissionStatus,
  { amharicLabel: string; stageOrder: number; colorClass: string; bgClass: string; borderClass: string }
> = {
  DRAFT: {
    amharicLabel: 'ረቂቅ',
    stageOrder: 1,
    colorClass: 'text-slate-600 dark:text-slate-300',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    borderClass: 'border-slate-300 dark:border-slate-700',
  },
  UNDER_REVIEW: {
    amharicLabel: 'በግምገማ ላይ',
    stageOrder: 2,
    colorClass: 'text-amber-700 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-300 dark:border-amber-800',
  },
  REVISION_REQUESTED: {
    amharicLabel: 'ማሻሻያ የተጠየቀበት',
    stageOrder: 3,
    colorClass: 'text-rose-700 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-300 dark:border-rose-800',
  },
  APPROVED: {
    amharicLabel: 'የጸደቀ',
    stageOrder: 4,
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-300 dark:border-emerald-800',
  },
  PUBLISHED: {
    amharicLabel: 'የታተመ',
    stageOrder: 5,
    colorClass: 'text-blue-700 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    borderClass: 'border-blue-300 dark:border-blue-800',
  },
  ARCHIVED: {
    amharicLabel: 'የተመዘገበ',
    stageOrder: 6,
    colorClass: 'text-indigo-700 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderClass: 'border-indigo-300 dark:border-indigo-800',
  },
};

export type SundaySchoolDepartment =
  | 'kinetibeb'
  | 'ehud_merha_gibir'
  | 'education'
  | 'mezmur'
  | 'records'
  | 'media'
  | 'finance'
  | string;

export interface DepartmentInfo {
  id: string;
  titleAmharic: string;
  subtitleAmharic: string;
  shortTitleAmharic: string;
  iconName: string;
  badgeLabel: string;
  descriptionAmharic: string;
  accentColor: string;
  status: 'ACTIVE' | 'PREPARATION' | 'PLANNED';
  coordinatorName?: string;
  memberCount?: number;
  programsCount?: number;
  isCustom?: boolean;
}

export const DEPARTMENTS: Record<string, DepartmentInfo> = {
  kinetibeb: {
    id: 'kinetibeb',
    titleAmharic: 'የኪነጥበብ ክፍል',
    subtitleAmharic: 'የኪነጥበብ፣ የባህልና የስነ ጽሁፍ መዝገብ',
    shortTitleAmharic: 'ኪነጥበብ ክፍል',
    iconName: 'Palette',
    badgeLabel: 'ኪነጥበብ',
    descriptionAmharic: 'የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የቴአትር፣ የግጥም፣ የመነባንብ፣ የስነ-ጽሁፍና የብራና ቅርስ ማዕከል',
    accentColor: '#B88500',
    status: 'ACTIVE',
    coordinatorName: 'ዲ/ን ቴዎድሮስ አማረ',
    memberCount: 24,
    programsCount: 16,
  },
  ehud_merha_gibir: {
    id: 'ehud_merha_gibir',
    titleAmharic: 'የእሁድ መርሃ ግብር ክፍል',
    subtitleAmharic: 'የ2019 ዓ.ም. ዓመታዊ፣ ወርሃዊና የዕለት ዕቅድ ጥቅል',
    shortTitleAmharic: 'እሁድ መርሃ ግብር',
    iconName: 'CalendarDays',
    badgeLabel: 'እሁድ መርሃ ግብር',
    descriptionAmharic: 'የወጣት፣ የማዕከላውያንና የሕፃናት የ2019 ዓ.ም. የተቀናጀ የእሁድ አገልግሎት የሰዓት ሰሌዳ፣ 18ቱ ዝርዝር ዕቅዶችና 10ሩ የአዘጋጆች ምድቦች',
    accentColor: '#0C4A9E',
    status: 'ACTIVE',
    coordinatorName: 'የመርሐ ግብር አስተባባሪ ኮሚቴ',
    memberCount: 38,
    programsCount: 51,
  },
};

export const ALL_SUNDAY_SCHOOL_DEPARTMENTS: DepartmentInfo[] = [
  DEPARTMENTS.kinetibeb,
  DEPARTMENTS.ehud_merha_gibir,
  {
    id: 'education',
    titleAmharic: 'የትምህርትና ስልጠና ክፍል',
    subtitleAmharic: 'የክፍል ደረጃዎች ስርዓተ-ትምህርትና ፈተናዎች',
    shortTitleAmharic: 'ትምህርት ክፍል',
    iconName: 'BookOpen',
    badgeLabel: 'ትምህርት',
    descriptionAmharic: 'የሕፃናት፣ ማዕከላውያን፣ ወጣቶችና አበው የሃይማኖት፣ የስርዓተ ቤተክርስቲያንና የመጽሐፍ ቅዱስ ጥናት ሞጁሎችና ፈተናዎች',
    accentColor: '#16A34A',
    status: 'PREPARATION',
    coordinatorName: 'መምህር ኤርምያስ በላይ',
    memberCount: 42,
    programsCount: 12,
  },
  {
    id: 'mezmur',
    titleAmharic: 'የመዝሙር ክፍል',
    subtitleAmharic: 'የዜማ ስልጠና፣ የመዘምራን ድልድልና የበዓላት ዝግጅት',
    shortTitleAmharic: 'መዝሙር ክፍል',
    iconName: 'Music',
    badgeLabel: 'መዝሙር',
    descriptionAmharic: 'የቅዱስ ያሬድ ዜማዎች ስልጠና፣ የሕፃናትና ወጣቶች መዘምራን ልምምድ፣ የበገናና የመሰንቆ ጥናት እንዲሁም የበዓላት መዝሙራት ማህደር',
    accentColor: '#9333EA',
    status: 'PREPARATION',
    coordinatorName: 'ሊቀ መዘምራን ገብረ ማርያም',
    memberCount: 56,
    programsCount: 20,
  },
  {
    id: 'records',
    titleAmharic: 'የአባላትና ቁጥጥር ክፍል',
    subtitleAmharic: 'የአባላት ምዝገባ፣ የደብተር ቁጥጥርና ስነ-ስርዓት',
    shortTitleAmharic: 'አባላትና ቁጥጥር',
    iconName: 'Users',
    badgeLabel: 'አባላትና ቁጥጥር',
    descriptionAmharic: 'የሰንበት ት/ቤት ተማሪዎች ቆጠራ፣ ሳምንታዊ የተማሪዎች የመገኘት ሰሌዳ፣ የደብተር ምርመራና የስነ-ስርዓት ክትትል',
    accentColor: '#D97706',
    status: 'PREPARATION',
    coordinatorName: 'አቶ ሃብታሙ ወርቁ',
    memberCount: 18,
    programsCount: 8,
  },
  {
    id: 'media',
    titleAmharic: 'የሕዝብ ግንኙነትና ሚዲያ ክፍል',
    subtitleAmharic: 'ሳምንታዊ ማስታወቂያዎች፣ ዜናዎችና የሚዲያ ስራዎች',
    shortTitleAmharic: 'ሚዲያና ግንኙነት',
    iconName: 'Megaphone',
    badgeLabel: 'ሚዲያና ህ/ግ',
    descriptionAmharic: 'የሰንበት ጉባኤ ማስታወቂያዎች፣ የበዓላት ፎቶና ቪዲዮ ዘገባዎች፣ የዲጂታል ገጾች አስተዳደርና የህትመት ስራዎች',
    accentColor: '#0284C7',
    status: 'PREPARATION',
    coordinatorName: 'ዲ/ን አማኑኤል ተስፋዬ',
    memberCount: 14,
    programsCount: 15,
  },
  {
    id: 'finance',
    titleAmharic: 'የልማትና ገቢ ማሰባሰቢያ ክፍል',
    subtitleAmharic: 'የሰንበት ት/ቤት ልማትና በጎ አድራጎት ፕሮጀክቶች',
    shortTitleAmharic: 'ልማትና ገቢ',
    iconName: 'HandCoins',
    badgeLabel: 'ልማትና ገቢ',
    descriptionAmharic: 'የሰንበት ት/ቤቱን አቅም የሚያጠናክሩ የልማት ፕሮጀክቶች፣ የበጎ አድራጎት ድጋፎችና የገቢ ማሰባሰቢያ መርሐ ግብራት',
    accentColor: '#059669',
    status: 'PLANNED',
    coordinatorName: 'የልማት ኮሚቴ ሰብሳቢ',
    memberCount: 12,
    programsCount: 6,
  },
];

export type SundaySchoolDivision = 'children' | 'intermediates' | 'youth';

export interface DivisionInfo {
  id: SundaySchoolDivision;
  titleAmharic: string;
  subtitleAmharic: string;
  ageRangeAmharic: string;
  descriptionAmharic: string;
  badgeLabel: string;
  mottoAmharic: string;
  color: string;
  accentColor: string;
}

export const DIVISIONS: Record<SundaySchoolDivision, DivisionInfo> = {
  children: {
    id: 'children',
    titleAmharic: 'ሕፃናት',
    subtitleAmharic: 'የሕፃናት የኪነጥበብና የመዝሙር ክፍል',
    ageRangeAmharic: 'ከ፬ - ፲፪ ዓመት',
    descriptionAmharic: 'ለሕፃናት የተዘጋጁ መንፈሳዊ ታሪኮች፣ ቀላል ግጥሞች፣ አስተማሪ አጫጭር ተውኔቶች፣ ስዕሎችና የሕፃናት ዜማዎች።',
    badgeLabel: 'ሕፃናት ክፍል',
    mottoAmharic: '«ሕፃናትን ተዉአቸው ወደ እኔም ይመጡ ዘንድ አትከልክሏቸው»',
    color: '#F5B800',
    accentColor: '#B88500',
  },
  intermediates: {
    id: 'intermediates',
    titleAmharic: 'ማዕከላውያን',
    subtitleAmharic: 'የማዕከላውያን የኪነጥበብ መድረክ',
    ageRangeAmharic: 'ከ፲፫ - ፲፰ ዓመት',
    descriptionAmharic: 'የታዳጊዎች የፈጠራ ስራዎች፣ የመጽሐፍ ቅዱስ ድራማዎች፣ መነባንቦች፣ የስነ-ጽሁፍ ጥናትና የጋራ ዝግጅቶች።',
    badgeLabel: 'ማዕከላውያን ክፍል',
    mottoAmharic: '«በጉብዝናህ ወራት ፈጣሪህን አስብ»',
    color: '#0C4A9E',
    accentColor: '#1E6BD6',
  },
  youth: {
    id: 'youth',
    titleAmharic: 'ወጣት',
    subtitleAmharic: 'የወጣቶች የኪነጥበብና የምርምር ማዕከል',
    ageRangeAmharic: 'ከ፲፱ ዓመት በላይ',
    descriptionAmharic: 'ጥልቅ መንፈሳዊ ቲያትሮች፣ የብራና ቅርስ ጥናት፣ ረቂቅ ስነ-ጽሁፍ፣ ሲምፖዚየሞችና ዓመታዊ ታላላቅ ፌስቲቫሎች።',
    badgeLabel: 'ወጣት ክፍል',
    mottoAmharic: '«ወጣቶች ሆይ ብርቱዎች ስለ ሆናችሁ እጽፍላችኋለሁ»',
    color: '#8B0000',
    accentColor: '#B88500',
  },
};

export interface WorkCategory {
  id: string;
  nameAmharic: string;
  nameEnglish: string;
  descriptionAmharic: string;
  iconName: string;
  workCount: number;
}

export interface WorkItem {
  id: string;
  title: string;
  writerId: string;
  writerName: string;
  categoryId: string;
  categoryName: string;
  dateAmharic: string;
  status: SubmissionStatus;
  excerpt: string;
  content: string;
  readTime: string;
  division: SundaySchoolDivision;
  departmentId?: SundaySchoolDepartment;
  departmentTitle?: string;
  isBookmarked: boolean;
  isFeatured: boolean;
  approvedBy?: string | null;
  approvedDate?: string | null;
  version: number;
  reviewerFeedback?: string | null;
  tags: string[];
  hasPdfAttachment?: boolean;
  pdfFileName?: string | null;
  pdfFileSize?: string | null;
  pdfLocalPath?: string | null;
  pdfUrl?: string | null;
}

export interface Writer {
  id: string;
  name: string;
  roleTitle: string;
  bio: string;
  totalWorks: number;
  isVerified: boolean;
}

export type ProgramRecurrence = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export const PROGRAM_RECURRENCE_LABELS: Record<ProgramRecurrence, { amharic: string; english: string }> = {
  WEEKLY: { amharic: 'ሳምንታዊ', english: 'Weekly' },
  MONTHLY: { amharic: 'ወርሃዊ', english: 'Monthly' },
  YEARLY: { amharic: 'ዓመታዊ', english: 'Yearly' },
};

export type MemberDuty = 'WRITER' | 'ORGANIZER' | 'PRESENTER';

export const MEMBER_DUTY_LABELS: Record<MemberDuty, { amharic: string; icon: string }> = {
  WRITER: { amharic: 'ፀሃፊ', icon: '✍️' },
  ORGANIZER: { amharic: 'አዘጋጅ', icon: '🎬' },
  PRESENTER: { amharic: 'አቅራቢ', icon: '🎙️' },
};

export interface ChurchMember {
  id: string;
  fullName: string;
  duty: MemberDuty;
  phone: string;
  spiritualTitle: string;
  department: string;
  departmentId?: SundaySchoolDepartment;
  joinedYear: string;
  assignedWorksCount: number;
  bio: string;
}

export interface ProgramAssignment {
  id: string;
  workId?: string | null;
  workTitle: string;
  workCategory: string;
  writerMemberId?: string | null;
  writerMemberName: string;
  organizerMemberId?: string | null;
  organizerMemberName: string;
  presenterMemberId?: string | null;
  presenterMemberName: string;
  performanceNotes: string;
  isCompleted: boolean;
}

export interface CulturalEvent {
  id: string;
  title: string;
  recurrence: ProgramRecurrence;
  dateAmharic: string;
  timeAmharic: string;
  location: string;
  category: string;
  description: string;
  organizer: string;
  division?: SundaySchoolDivision | null;
  departmentId?: SundaySchoolDepartment;
  departmentTitle?: string;
  assignments: ProgramAssignment[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  departmentId?: SundaySchoolDepartment;
  joinedDate: string;
  myWorksCount: number;
  mySubmissionsCount: number;
  myBookmarksCount: number;
}

export interface LiturgicalAudioTrack {
  id: string;
  title: string;
  narratorOrCantor: string;
  division: SundaySchoolDivision;
  categoryName: string;
  durationAmharic: string;
  durationSeconds: number;
  description: string;
}

export type AppThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';

export type ParchmentPaletteId = 'classic' | 'monastery' | 'royal' | 'papyrus';

export interface ParchmentPalette {
  id: ParchmentPaletteId;
  nameAmharic: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accentClass: string;
}

export const PARCHMENT_PALETTES: ParchmentPalette[] = [
  {
    id: 'classic',
    nameAmharic: 'የጥንት ብራና',
    bgClass: 'bg-[#F9F5EC]',
    textClass: 'text-[#2C241B]',
    borderClass: 'border-[#B88500]/40',
    accentClass: 'text-[#8B0000]',
  },
  {
    id: 'monastery',
    nameAmharic: 'የገዳም ሻማ',
    bgClass: 'bg-[#1B1815]',
    textClass: 'text-[#EADBCE]',
    borderClass: 'border-[#FFD54F]/30',
    accentClass: 'text-[#FFD54F]',
  },
  {
    id: 'royal',
    nameAmharic: 'ንጉሣዊ ቬልቬት',
    bgClass: 'bg-[#141926]',
    textClass: 'text-[#E6EAF5]',
    borderClass: 'border-[#F5B800]/30',
    accentClass: 'text-[#F5B800]',
  },
  {
    id: 'papyrus',
    nameAmharic: 'ፓፒረስ',
    bgClass: 'bg-[#F2F4ED]',
    textClass: 'text-[#242C23]',
    borderClass: 'border-[#4A6B48]/30',
    accentClass: 'text-[#2E6930]',
  },
];

export type BottomNavTab = 'HOME' | 'ARCHIVE' | 'SEARCH' | 'EVENTS' | 'PROFILE';

export interface SundayProgramPlanEntry {
  id: string;
  monthAmharic: string;
  dayNumber: number;
  dateFullAmharic: string;
  division: SundaySchoolDivision;
  mainTopic: string;
  subTheme?: string;
  leader?: string;
  presenterOrTeacher?: string;
  hasProgram: boolean;
  timeAmharic: string;
  goalAmharic?: string;
  category: string;
  isSpecialEvent?: boolean;
}

export interface SundayTimetableSlot {
  id: string;
  timeRange: string;
  slotTitle: string;
  inCharge?: string;
  notes?: string;
}

export interface SundayDailyPlanSheet {
  id: string;
  division: SundaySchoolDivision;
  monthAmharic: string;
  dayNumber: number;
  dateAmharic: string;
  mainTopic: string;
  leader: string;
  presenterOrTeacher: string;
  timeAmharic: string;
  purpose: string;
  slots: SundayTimetableSlot[];
  preProgramNeeds: string[];
  postProgramStats?: {
    participantsCount?: number;
    actualStartTime?: string;
    actualEndTime?: string;
    evaluationNotes?: string;
  };
}

export interface SundayPlanPdfPackage {
  id: string;
  division: SundaySchoolDivision;
  title: string;
  subtitle: string;
  yearAmharic: string;
  filePath: string;
  fileName: string;
  totalPages: number;
  description: string;
  scopeSummary: string;
  sections: { title: string; pageNumber: number }[];
}

export type AppDestination =
  | { type: 'Splash' }
  | { type: 'Onboarding' }
  | { type: 'DivisionSelection' }
  | { type: 'Login' }
  | { type: 'MainApp' }
  | { type: 'CategoryDetail'; categoryId: string }
  | { type: 'WorkDetail'; workId: string }
  | { type: 'CreateWork' }
  | { type: 'ReviewerQueue' };

// =========================================================================
// DEPARTMENT MEMBERSHIP & APPROVAL MODELS
// =========================================================================
export type MembershipApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export const MEMBERSHIP_STATUS_CONFIG: Record<
  MembershipApprovalStatus,
  { amharicLabel: string; colorClass: string; bgClass: string; borderClass: string }
> = {
  PENDING: {
    amharicLabel: 'ማረጋገጫ በመጠባበቅ ላይ',
    colorClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-300 dark:border-amber-800',
  },
  APPROVED: {
    amharicLabel: 'የጸደቀ አባል',
    colorClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-300 dark:border-emerald-800',
  },
  REJECTED: {
    amharicLabel: 'ውድቅ የተደረገ',
    colorClass: 'text-rose-700 dark:text-rose-300',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-300 dark:border-rose-800',
  },
  SUSPENDED: {
    amharicLabel: 'የታገደ',
    colorClass: 'text-slate-700 dark:text-slate-300',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    borderClass: 'border-slate-300 dark:border-slate-700',
  },
};

export interface DepartmentMembership {
  id: string; // `${userId}_${departmentId}`
  userId: string;
  userEmail: string;
  userName: string;
  departmentId: string;
  departmentName: string;
  division?: SundaySchoolDivision;
  serviceSkills?: string[];
  preferredResponsibilities?: string;
  role: UserRole; // 'MEMBER' | 'CONTRIBUTOR' | 'REVIEWER' | 'EDITOR' | 'ADMIN'
  status: MembershipApprovalStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  statusUpdatedAt?: string;
  createdAt: string;
}

// =========================================================================
// SCHEDULE-BASED ASSIGNMENT MODELS
// =========================================================================
export type ScheduleTaskStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'REVISION_REQUESTED'
  | 'CANCELLED';

export const SCHEDULE_TASK_STATUS_CONFIG: Record<
  ScheduleTaskStatus,
  { amharicLabel: string; colorClass: string; bgClass: string; borderClass: string }
> = {
  ASSIGNED: {
    amharicLabel: 'የተመደበ (አዲስ)',
    colorClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    borderClass: 'border-blue-300 dark:border-blue-800',
  },
  ACCEPTED: {
    amharicLabel: 'የተቀበለ',
    colorClass: 'text-cyan-700 dark:text-cyan-300',
    bgClass: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderClass: 'border-cyan-300 dark:border-cyan-800',
  },
  IN_PROGRESS: {
    amharicLabel: 'በዝግጅት ላይ',
    colorClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-300 dark:border-amber-800',
  },
  SUBMITTED: {
    amharicLabel: 'የቀረበ (ግምገማ በመጠባበቅ ላይ)',
    colorClass: 'text-indigo-700 dark:text-indigo-300',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderClass: 'border-indigo-300 dark:border-indigo-800',
  },
  COMPLETED: {
    amharicLabel: 'የተጠናቀቀ / የጸደቀ',
    colorClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-300 dark:border-emerald-800',
  },
  REVISION_REQUESTED: {
    amharicLabel: 'ማሻሻያ የተጠየቀበት',
    colorClass: 'text-rose-700 dark:text-rose-300',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-300 dark:border-rose-800',
  },
  CANCELLED: {
    amharicLabel: 'የተሰረዘ',
    colorClass: 'text-slate-600 dark:text-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    borderClass: 'border-slate-300 dark:border-slate-700',
  },
};

export interface ScheduleTaskAssignment {
  id: string;
  departmentId: string;
  departmentTitle: string;
  scheduleProgramId: string; // e.g. 'yth_hidar_6' or 'prog_w1'
  agendaSlotId?: string; // e.g. 'h6_1' or specific agenda slot
  agendaSlotTitle: string; // e.g. 'ቃለ እግዚአብሔር፦ ተመየጢ'
  division?: SundaySchoolDivision;
  title: string;
  instructions: string;
  assignedMemberIds: string[];
  assignedMemberNames: string[];
  groupName?: string; // e.g. 'ምድብ 01 (ፍቅር)'
  responsibleLeadId: string;
  responsibleLeadName: string;
  programDate: string; // e.g. 'ኅዳር 6 2019'
  programTime: string; // e.g. '7:30–9:30'
  deadlineDate: string;
  requiredDeliverable?: string; // e.g. 'ስክሪፕት', 'የጽሑፍ ረቂቅ', 'የዝማሬ ዝርዝር'
  deliverableSubmission?: {
    content?: string;
    fileUrl?: string;
    fileName?: string;
    submittedAt?: string;
    submittedByName?: string;
  };
  status: ScheduleTaskStatus;
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  individualParticipation?: Record<string, { accepted: boolean; completed: boolean; notes?: string }>;
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// DEPARTMENT NOTIFICATION MODEL
// =========================================================================
export interface DepartmentNotification {
  id: string;
  departmentId: string;
  departmentTitle?: string;
  targetUserId?: string; // if targeted to specific user or undefined for department broadcast
  title: string;
  message: string;
  type:
    | 'MEMBERSHIP_STATUS'
    | 'ASSIGNMENT_CREATED'
    | 'ASSIGNMENT_SUBMITTED'
    | 'REVISION_REQUESTED'
    | 'ASSIGNMENT_COMPLETED'
    | 'ANNOUNCEMENT';
  relatedId?: string;
  createdAt: string;
  isRead: boolean;
}

