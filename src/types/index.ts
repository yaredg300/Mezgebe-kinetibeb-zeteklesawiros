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
  assignments: ProgramAssignment[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
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
