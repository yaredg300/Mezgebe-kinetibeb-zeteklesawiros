import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  SundaySchoolDepartment,
  SundaySchoolDivision,
  WorkCategory,
  WorkItem,
  Writer,
  ChurchMember,
  CulturalEvent,
  UserProfile,
  UserRole,
  SubmissionStatus,
  ProgramRecurrence,
  MemberDuty,
  ProgramAssignment,
  LiturgicalAudioTrack,
  AppThemeMode,
  SundayProgramPlanEntry,
  SundayDailyPlanSheet,
  SundayPlanPdfPackage,
  DepartmentInfo,
  ALL_SUNDAY_SCHOOL_DEPARTMENTS,
  DepartmentMembership,
  MembershipApprovalStatus,
  ScheduleTaskStatus,
  ScheduleTaskAssignment,
  DepartmentNotification,
  EhudDepartmentPosition,
  EHUD_DEPARTMENT_POSITIONS,
  DepartmentInvite,
  EhudProgramPlan,
  EhudPlanScope,
  EhudPlanStatus,
  EhudFollowUpRecord,
  EhudPunctualityStatus,
  EhudFollowUpStatus,
  EhudProgramRating,
} from '../types';
import {
  SUNDAY_PLAN_PDF_PACKAGES,
  CHILDREN_ANNUAL_PLAN_2019,
  MAEKELAWIYAN_ANNUAL_PLAN_2019,
  CHILDREN_DAILY_PLANS_2019,
  MAEKELAWIYAN_DAILY_PLANS_2019,
} from '../data/sundayProgramPlans2019';
import {
  YOUTH_ANNUAL_PLAN_2019,
  YOUTH_DAILY_PLANS_2019,
} from '../data/youthCombinedPlanData';
import {
  ADDITIONAL_DEPARTMENT_WORKS,
  ADDITIONAL_DEPARTMENT_MEMBERS,
  ADDITIONAL_DEPARTMENT_EVENTS,
} from '../data/departmentData';
import { getAllDepartmentCategories } from '../data/departmentCategories';
import {
  INITIAL_DEPARTMENT_MEMBERSHIPS,
  INITIAL_SCHEDULE_ASSIGNMENTS,
  INITIAL_DEPARTMENT_NOTIFICATIONS,
} from '../data/departmentMembershipData';
import {
  db,
  auth,
  storage,
  googleProvider,
  masterOperatorGoogleProvider,
  googleDriveProvider,
  getCachedGoogleToken,
  setCachedGoogleToken,
  isMasterOperatorEmail,
} from '../firebase/config';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
} from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  getCanonicalMembershipId,
  sanitizeFirestorePayload,
  migrateDepartmentMemberships,
} from '../utils/migration';

export const INITIAL_CATEGORIES: WorkCategory[] = [
  {
    id: 'poetry',
    nameAmharic: 'ግጥም',
    nameEnglish: 'Poetry',
    descriptionAmharic: 'መንፈሳዊ እና ባህላዊ የግጥም ውቅር፣ ስነ ስንኝ እና የዜማ ድርሰቶች',
    iconName: 'BookOpen',
    workCount: 28,
  },
  {
    id: 'literature',
    nameAmharic: 'ስነ ጽሁፍ',
    nameEnglish: 'Literature',
    descriptionAmharic: 'ረቂቅ ልቦለዶች፣ ድርሳናት፣ አስተማሪ አጫጭር ጽሁፎች እና የኪነጥበብ መጣጥፎች',
    iconName: 'FileText',
    workCount: 19,
  },
  {
    id: 'theater',
    nameAmharic: 'ቲያትር',
    nameEnglish: 'Theater',
    descriptionAmharic: 'በሰንበት ትምህርት ቤቱ መድረክ የቀረቡ ታላላቅ መንፈሳዊ ድራማዎችና ዝግጅቶች',
    iconName: 'Clapperboard',
    workCount: 14,
  },
  {
    id: 'monologue',
    nameAmharic: 'መነባንብ',
    nameEnglish: 'Monologue / Recitation',
    descriptionAmharic: 'አንደበተ ርቱዕ ስነ ቃል፣ ስሜት ቀስቃሽ መነባንቦችና የግጥም ሙዚቃዊ ቅንብሮች',
    iconName: 'Mic',
    workCount: 16,
  },
  {
    id: 'script',
    nameAmharic: 'ስክሪፕት',
    nameEnglish: 'Scripts',
    descriptionAmharic: 'የመድረክ ዝግጅት መመሪያዎች፣ የድራማ ስክሪፕቶች እና የትዕይንት ሰነዶች',
    iconName: 'Scroll',
    workCount: 11,
  },
  {
    id: 'art',
    nameAmharic: 'ሥዕል',
    nameEnglish: 'Art',
    descriptionAmharic: 'ባህላዊ የብራና ሥዕሎች፣ የቤተክርስቲያን ጥበባዊ ስራዎች እና ስዕላዊ ምስሎች',
    iconName: 'Palette',
    workCount: 22,
  },
  {
    id: 'photography',
    nameAmharic: 'ፎቶግራፍ',
    nameEnglish: 'Photography',
    descriptionAmharic: 'የበዓላት፣ የዝግጅቶች እና የሰንበት ትምህርት ቤት ጉዞዎች ቋሚ የታሪክ ምስሎች',
    iconName: 'Camera',
    workCount: 45,
  },
  {
    id: 'video',
    nameAmharic: 'ቪዲዮ',
    nameEnglish: 'Video',
    descriptionAmharic: 'የመድረክ ትዕይንቶች፣ ዘጋቢ ፊልሞች እና የተመረጡ የኪነጥበብ ቪዲዮዎች',
    iconName: 'Video',
    workCount: 12,
  },
  {
    id: 'history',
    nameAmharic: 'ታሪክ',
    nameEnglish: 'Historical Archive',
    descriptionAmharic: 'የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል መመስረትና የታሪክ ሰነዶች',
    iconName: 'History',
    workCount: 8,
  },
  {
    id: 'event_docs',
    nameAmharic: 'የዝግጅት ሰነዶች',
    nameEnglish: 'Event Documentation',
    descriptionAmharic: 'ዓመታዊ የኪነጥበብ ፌስቲቫሎች፣ ሲምፖዚየሞች እና የዝግጅት ቃለ-ጉባኤዎች',
    iconName: 'FolderArchive',
    workCount: 15,
  },
];

export const INITIAL_WRITERS: Writer[] = [
  {
    id: 'wr1',
    name: 'ቃልኪዳን ሰይፉ',
    roleTitle: 'ዋና የቅኔና የግጥም ደራሲ',
    bio: 'በተክለ ሣዊሮስ ሰንበት ት/ቤት ከ፲ ዓመታት በላይ በግጥምና በመነባንብ ክፍል ያገለገለ ባለሙያ።',
    totalWorks: 14,
    isVerified: true,
  },
  {
    id: 'wr2',
    name: 'ሰላማዊት አበበ',
    roleTitle: 'የስነ ጽሁፍና የታሪክ አዘጋጅ',
    bio: 'የቤተክርስቲያን ድርሳናትን በማጥናት እና አጫጭር ትምህርታዊ ጽሁፎችን በማበርከት የምትታወቅ።',
    totalWorks: 9,
    isVerified: true,
  },
  {
    id: 'wr3',
    name: 'ዮሐንስ ግርማ',
    roleTitle: 'የቲያትርና ስክሪፕት ደራሲ',
    bio: 'በርካታ የመድረክ ድራማዎችን በመጻፍና በማዘጋጀት የሰንበት ት/ቤቱን የጥበብ ክፍል ያሳደገ።',
    totalWorks: 12,
    isVerified: true,
  },
  {
    id: 'wr4',
    name: 'ሔኖክ ዳንኤል',
    roleTitle: 'የስነ ስዕል ባለሙያ',
    bio: 'ጥንታዊ የብራና ስዕሎችን በዘመናዊ መንገድ የሚያዘጋጅና የሚያስተምር ሰዓሊ።',
    totalWorks: 7,
    isVerified: true,
  },
];

export const INITIAL_MEMBERS: ChurchMember[] = [
  {
    id: 'm_wr1',
    fullName: 'ቃልኪዳን ሰይፉ',
    duty: 'WRITER',
    phone: '0911-23-45-67',
    spiritualTitle: 'ዋና ፀሃፊ',
    department: 'የስነ ጽሁፍና የግጥም ክፍል',
    joinedYear: '፳፻፲፪ ዓ.ም',
    assignedWorksCount: 14,
    bio: 'መንፈሳዊ ግጥሞች፣ ድርሳናትና የብራና ስነ ስንኞች ደራሲ።',
  },
  {
    id: 'm_wr2',
    fullName: 'ዮሐንስ ግርማ',
    duty: 'WRITER',
    phone: '0922-34-56-78',
    spiritualTitle: 'የቴአትር ፀሃፊ',
    department: 'የቲያትርና ስክሪፕት ክፍል',
    joinedYear: '፳፻፲፬ ዓ.ም',
    assignedWorksCount: 12,
    bio: 'በርካታ የመድረክ ድራማዎችንና ተውኔቶችን የጻፈ የጥበብ አባል።',
  },
  {
    id: 'm_wr3',
    fullName: 'ዳዊት ሙሉጌታ',
    duty: 'WRITER',
    phone: '0933-45-67-89',
    spiritualTitle: 'የግጥም ፀሃፊ',
    department: 'የስነ ጽሁፍ ክፍል',
    joinedYear: '፳፻፲፭ ዓ.ም',
    assignedWorksCount: 8,
    bio: 'አጫጭር ትረካዎችና የመነባንብ ጽሁፎችን የሚያዘጋጅ።',
  },
  {
    id: 'm_wr4',
    fullName: 'ማርታ ዘውዱ',
    duty: 'WRITER',
    phone: '0944-56-78-90',
    spiritualTitle: 'የታሪክ ፀሃፊ',
    department: 'የታሪክና ሰነድ ክፍል',
    joinedYear: '፳፻፲፫ ዓ.ም',
    assignedWorksCount: 9,
    bio: 'የቤተክርስቲያን ድርሳናትንና የታሪክ ጥናቶችን የምታዘጋጅ።',
  },
  {
    id: 'm_org1',
    fullName: 'ሰላማዊት አበበ',
    duty: 'ORGANIZER',
    phone: '0955-67-89-01',
    spiritualTitle: 'ዋና አዘጋጅ',
    department: 'የመድረክ ዝግጅት ክፍል',
    joinedYear: '፳፻፲፫ ዓ.ም',
    assignedWorksCount: 16,
    bio: 'የመድረክ ዝግጅቶች እና የኪነጥበብ መርሐ-ግብራት አስተባባሪ።',
  },
  {
    id: 'm_org2',
    fullName: 'ዲ/ን ቴዎድሮስ አማረ',
    duty: 'ORGANIZER',
    phone: '0966-78-90-12',
    spiritualTitle: 'የኪነጥበብ መሪና አዘጋጅ',
    department: 'የኪነጥበብ ክፍል',
    joinedYear: '፳፻፲፩ ዓ.ም',
    assignedWorksCount: 20,
    bio: 'የኪነጥበብ ክፍል ኃላፊ እና የፕሮግራም አዘጋጅ።',
  },
  {
    id: 'm_org3',
    fullName: 'ኤልያስ ታደሰ',
    duty: 'ORGANIZER',
    phone: '0977-89-01-23',
    spiritualTitle: 'የቴክኒክና መድረክ አዘጋጅ',
    department: 'የቴክኒክ ክፍል',
    joinedYear: '፳፻፲፬ ዓ.ም',
    assignedWorksCount: 11,
    bio: 'የድምፅ፣ የመብራትና የመድረክ አቀማመጥ መሪ።',
  },
  {
    id: 'm_org4',
    fullName: 'ሔኖክ ዳንኤል',
    duty: 'ORGANIZER',
    phone: '0988-90-12-34',
    spiritualTitle: 'የኤግዚቢሽን አዘጋጅ',
    department: 'የስዕል ክፍል',
    joinedYear: '፳፻፲፭ ዓ.ም',
    assignedWorksCount: 7,
    bio: 'የስዕላትና የብራና ኤግዚቢሽን ዋና አስተባባሪ።',
  },
  {
    id: 'm_prs1',
    fullName: 'በረከት ሃብታሙ',
    duty: 'PRESENTER',
    phone: '0911-00-11-22',
    spiritualTitle: 'ዋና የመድረክ አቅራቢ',
    department: 'የመድረክ ክፍል',
    joinedYear: '፳፻፲፬ ዓ.ም',
    assignedWorksCount: 18,
    bio: 'አንደበተ ርቱዕ ተራኪና የፕሮግራም መሪ።',
  },
  {
    id: 'm_prs2',
    fullName: 'ሰሎሜ ጥላሁን',
    duty: 'PRESENTER',
    phone: '0922-11-22-33',
    spiritualTitle: 'የመነባንብ አቅራቢ',
    department: 'የስነ ቃል ክፍል',
    joinedYear: '፳፻፲፭ ዓ.ም',
    assignedWorksCount: 13,
    bio: 'ልብ የሚነኩ መንፈሳዊ መነባንቦችንና ግጥሞችን የምታቀርብ።',
  },
  {
    id: 'm_prs3',
    fullName: 'ዲ/ን ናትናኤል ታፈሰ',
    duty: 'PRESENTER',
    phone: '0933-22-33-44',
    spiritualTitle: 'ተዋናይና አቅራቢ',
    department: 'የቲያትር ክፍል',
    joinedYear: '፳፻፲፫ ዓ.ም',
    assignedWorksCount: 15,
    bio: 'በመንፈሳዊ ተውኔቶች ዋና ዋና ገጸ-ባህሪያትን የሚወክል አቅራቢ።',
  },
  {
    id: 'm_prs4',
    fullName: 'ሩት ተስፋዬ',
    duty: 'PRESENTER',
    phone: '0944-33-44-55',
    spiritualTitle: 'የስነ ጽሁፍ አቅራቢ',
    department: 'የስነ ጽሁፍ ክፍል',
    joinedYear: '፳፻፲፮ ዓ.ም',
    assignedWorksCount: 9,
    bio: 'ትምህርታዊ ጽሁፎችንና ታሪኮችን ለአድማጭ የምታቀርብ።',
  },
  ...ADDITIONAL_DEPARTMENT_MEMBERS,
];

export const INITIAL_WORKS: WorkItem[] = [
  {
    id: 'w1',
    title: 'የብርሃን ማዕበል እና የጽናት ቃል',
    writerId: 'wr1',
    writerName: 'ቃልኪዳን ሰይፉ',
    categoryId: 'poetry',
    categoryName: 'ግጥም',
    dateAmharic: 'ጥር ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    excerpt: 'በጥንታዊው ብራና ቀለም ሲነጥብ፣ የነፍስ ዜማ በዕጣን ጢስ ሲታጀብ...',
    content: `በጥንታዊው ብራና ቀለም ሲነጥብ፣
የነፍስ ዜማ በዕጣን ጢስ ሲታጀብ።
የጨለማው ማዕበል ከፊታችን ቆሞ፣
የልብ ጽናት ሻማ በንፋስ ተቃውሞ።

እነሆ ብዕራችን ለትውልድ ይዘምራል፣
የተክለ ሣዊሮስ መንፈስ በቅኔ ያበራል፤
ባህላችን ክብሩ፣ ስነ ጥበብ ውበቱ፣
በእምነት የተመላ የትውልድ ጥንካሬቱ።

ከመቅደሱ ደጃፍ ዜማ ሲያስተጋባ፣
የኪነጥበብ ፍሬ በልባችን ገባ፤
የቀደሙት አበው ታሪክ ያወሱበት፣
የነገው ትውልድም የሚማርበት።`,
    readTime: '፫ ደቂቃ',
    division: 'youth',
    isBookmarked: true,
    isFeatured: true,
    approvedBy: 'ቀሲስ ሰሎሞን (የሰንበት ት/ቤት ኃላፊ)',
    approvedDate: 'ጥር ፳፪ ፳፻፲፮ ዓ.ም',
    version: 2,
    tags: ['ግጥም', 'ቅኔ', 'መንፈሳዊ ጽናት', 'የተመረጠ'],
    hasPdfAttachment: true,
    pdfFileName: 'የብርሃን_ማዕበል_እና_የጽናት_ቃል.pdf',
    pdfFileSize: '98 KB',
  },
  {
    id: 'w2',
    title: 'የተሰበረው ብዕር እና የቀለሙ ዋጋ',
    writerId: 'wr2',
    writerName: 'ሰላማዊት አበበ',
    categoryId: 'literature',
    categoryName: 'ስነ ጽሁፍ',
    dateAmharic: 'ታኅሣሥ ፳፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    excerpt: 'በአሮጌው የመጻሕፍት መደርደሪያ መካከል የተገኘው የድሮ ማስታወሻ የነገረን ታሪክ...',
    content: `በአሮጌው የመጻሕፍት መደርደሪያ መካከል የተገኘው የድሮ ማስታወሻ እንዲህ ይላል፦ 

«ጥበብ ለነፍስ ምግብ ናት፤ የኪነጥበብ ክፍል አባላት በመድረክ ላይ ቆመው ቃለ እግዚአብሔርን በድራማና በግጥም ሲያስተላልፉ የተመለከተ ሰው፣ የጥበብን ታላቅነት ይገነዘባል። በዚያን ወቅት እያንዳንዷ ስክሪፕት በብራና ቀለም በእጅ ትጻፍ ነበር። ዛሬ በዲጂታል መዝገብ የምናስቀምጠው ያንን የቀደመውን ድካምና የትላንቱን መንፈሳዊ ታሪክ ነው።»

ይህ ጽሁፍ የኪነጥበብ አባላትን የነበረውን ጥልቅ ቁርጠኝነትና የጋራ አገልግሎት መንፈስ በማስታወስ ለዛሬው ወጣት አዲስ ኃይል ይሰጣል።`,
    readTime: '፭ ደቂቃ',
    division: 'youth',
    isBookmarked: false,
    isFeatured: true,
    approvedBy: 'የግምገማ ኮሚቴ ሰብሳቢ',
    approvedDate: 'ጥር ፭ ፳፻፲፮ ዓ.ም',
    version: 1,
    tags: ['ስነ ጽሁፍ', 'ታሪክ', 'ተክለ ሣዊሮስ'],
    hasPdfAttachment: true,
    pdfFileName: 'የተሰበረው_ብዕር_ማስታወሻ.pdf',
    pdfFileSize: '142 KB',
  },
  {
    id: 'w3',
    title: 'ሰማዕቱ ሣዊሮስ — ባለ ሁለት ትዕይንት የመድረክ ቲያትር',
    writerId: 'wr3',
    writerName: 'ዮሐንስ ግርማ',
    categoryId: 'theater',
    categoryName: 'ቲያትር',
    dateAmharic: 'ሕዳር ፲፪ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    excerpt: 'ትዕይንት ፩፦ የቤተክርስቲያን መድረክ በደብዛዛ መብራት፤ የመዘምራን ድምፅ ከጀርባ ይሰማል...',
    content: `ትዕይንት ፩፦ በጨለማና በብርሃን መካከል

ቦታ፦ የደብሩ ታላቅ አዳራሽ መድረክ
ገጸ-ባሕሪያት፦ አባ ተክለ ሣዊሮስ፣ ዲያቆን ሚካኤል፣ ህዝቡ

(መጋረጃው ሲከፈት ጥንታዊ የዋሽንት ዜማ ከጀርባ ይሰማል። አባ ተክለ ሣዊሮስ ብራናውን በእጃቸው ይዘው ወደ መድረኩ መሃል ይመጣሉ)

አባ ተክለ ሣዊሮስ፦
«ይህ ህዝብ የተጠማው የእውነትን ቃል ነው። እኛም በኪነጥበብ፣ በመንፈሳዊ መዝሙርና በቅኔ የጽድቅን መንገድ ልናሳየው ይገባል። ብዕራችሁ አይዝለል፤ ድምፃችሁም አይታጎል!»

ዲያቆን ሚካኤል፦
«አባታችን ሆይ፣ ዘመኑ ፈታኝ ቢሆንም፣ የሰንበት ትምህርት ቤቱ ወጣቶች በሙሉ ልብ ተነስተዋል!»`,
    readTime: '፲ ደቂቃ',
    division: 'youth',
    isBookmarked: true,
    isFeatured: true,
    approvedBy: 'ሊቀ ጠበብት ዮሴፍ',
    approvedDate: 'ሕዳር ፳ ፳፻፲፮ ዓ.ም',
    version: 3,
    tags: ['ቲያትር', 'ድራማ', 'የመድረክ ዝግጅት'],
  },
  {
    id: 'w4',
    title: 'የመቅደሱ ድምፅ — ስሜት ቀስቃሽ መነባንብ',
    writerId: 'wr1',
    writerName: 'ቃልኪዳን ሰይፉ',
    categoryId: 'monologue',
    categoryName: 'መነባንብ',
    dateAmharic: 'ጥቅምት ፳፱ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    excerpt: 'ድምፅህ ከየት እንደመጣ ስትጠየቅ... ከመንበረ ክብሩ ነው በል!',
    content: `(በዝግታና በጥልቅ ስሜት የሚነበብ)

እኔ የመቅደሱ ድምፅ ነኝ፤
የመቶ ዓመታት ጸሎት ያፈራኝ፣
በሰንበት ልጆች ዜማ ያደግሁ።
ሲነጋ በማለዳ ከደወሉ ጋር እነሳለሁ፣
ሲመሽ ከዕጣኑ ጢስ ጋር ወደ ሰማይ እወጣለሁ።

አንተ ወጣት ሆይ!
ብዕርህ ከኪስህ ሲወጣ ምን ጻፈ?
ድምፅህ በመድረክ ሲሰማ ምን ሰበከ?
ጥበብን ለመታሰቢያ ሳይሆን ለመዳን ተጠቀምባት!`,
    readTime: '፬ ደቂቃ',
    division: 'youth',
    isBookmarked: false,
    isFeatured: false,
    approvedBy: 'ገምጋሚ ቦርድ',
    approvedDate: 'ኅዳር ፩ ፳፻፲፮ ዓ.ም',
    version: 1,
    tags: ['መነባንብ', 'ስነ ቃል'],
  },
  {
    id: 'w5',
    title: 'የብራናው ቀለም ቅንብር — የጥንታዊ ስዕል ሰነድ',
    writerId: 'wr4',
    writerName: 'ሔኖክ ዳንኤል',
    categoryId: 'art',
    categoryName: 'ሥዕል',
    dateAmharic: 'መስከረም ፲፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    excerpt: 'ባህላዊ የኢትዮጵያ ቀለማት አመራረት እና የመጽሐፍ ቅዱስ ምስሎች ጥበባዊ ትርጓሜ...',
    content: `የኢትዮጵያ ጥንታዊ የብራና ሥዕሎች በሶስት መሠረታዊ ቀለማት ይመራሉ፦ ቀይ (የፍቅርና የደም መታሰቢያ)፣ ቢጫ/ወርቅ (የመለኮታዊ ብርሃን ምልክት) እና ጥቁር (የምድርና የጽናት ቀለም)።

በተክለ ሣዊሮስ ሰንበት ት/ቤት የስዕል ክፍል ውስጥ የተዘጋጁት እነዚህ ሥራዎች ያንን ጥንታዊ የኦርቶዶክሳዊ ስነ-ስዕል መርህ ጠብቀው የተከናወኑ ናቸው።`,
    readTime: '፮ ደቂቃ',
    division: 'youth',
    isBookmarked: false,
    isFeatured: false,
    approvedBy: 'ስነ ጥበብ አማካሪ',
    approvedDate: 'መስከረም ፳ ፳፻፲፮ ዓ.ም',
    version: 1,
    tags: ['ሥዕል', 'ብራና', 'ቀለማት'],
  },
  {
    id: 'w6',
    title: 'የ፳፻፲፭ ዓ.ም የኪነጥበብ ምሽት — የታሪክ ሰነድ',
    writerId: 'wr2',
    writerName: 'ሰላማዊት አበበ',
    categoryId: 'history',
    categoryName: 'ታሪክ',
    dateAmharic: 'ነሐሴ ፲፮ ፳፻፲፭ ዓ.ም',
    status: 'APPROVED',
    excerpt: 'በሰንበት ትምህርት ቤታችን ታሪክ ለመጀመሪያ ጊዜ የተዘጋጀው ታላቁ የኪነጥበብ ሲምፖዚየም...',
    content: `በ፳፻፲፭ ዓ.ም የተካሄደው የኪነጥበብ ምሽት ከ፭፻ በላይ ተሳታፊዎችን ያስተናገደ ነበር። 

በዚህ ታሪካዊ ምሽት፦
፩. ከ፲፭ በላይ አዳዲስ ግጥሞች ቀርበዋል
፪. «የብርሃኑ መንገድ» የተሰኘው ድራማ ለመጀመሪያ ጊዜ ታይቷል
፫. የጥንታዊ ዜማዎችና የቅኔ ጥናት ሰነድ ለጉባኤው ቀርቧል

ይህ ሰነድ ወደፊት ለሚመጣው ትውልድ በዲጂታል መዝገብ ተጠብቆ እንዲቆይ ተወስኗል።`,
    readTime: '፯ ደቂቃ',
    division: 'youth',
    isBookmarked: false,
    isFeatured: false,
    approvedBy: 'የሰንበት ት/ቤት አስተዳደር',
    approvedDate: 'ነሐሴ ፳ ፳፻፲፭ ዓ.ም',
    version: 1,
    tags: ['ታሪክ', 'ሰነድ', 'ሲምፖዚየም'],
  },
  {
    id: 'w7',
    title: 'የነጋሪት ድምፅ — አዲስ የታጨ ግጥም',
    writerId: 'wr5',
    writerName: 'ዳዊት ሙሉጌታ',
    categoryId: 'poetry',
    categoryName: 'ግጥም',
    dateAmharic: 'የካቲት ፩ ፳፻፲፮ ዓ.ም',
    status: 'UNDER_REVIEW',
    excerpt: 'በአዲሱ ዓመት ለግምገማ የቀረበ መንፈሳዊ ግጥም፤ በገምጋሚ ቦርድ እየታየ ያለ...',
    content: `የነጋሪት ድምፅ ሲሰማ በሩቁ፣
የጥበብ ወዳጆች ከመንደር ሲዘልቁ፤
የእውነት ሻማ ይዘው ጨለማውን ጥሰው፣
በተክለ ሣዊሮስ በረከት ደርሰው።`,
    readTime: '፫ ደቂቃ',
    division: 'youth',
    isBookmarked: false,
    isFeatured: false,
    version: 1,
    tags: ['ረቂቅ', 'ግጥም'],
  },
  {
    id: 'w8',
    title: 'የመድረክ ዝግጅት መመሪያ ሰነድ ፪',
    writerId: 'wr3',
    writerName: 'ዮሐንስ ግርማ',
    categoryId: 'script',
    categoryName: 'ስክሪፕት',
    dateAmharic: 'ጥር ፳፰ ፳፻፲፮ ዓ.ም',
    status: 'REVISION_REQUESTED',
    excerpt: 'በቲያትር ኮሚቴው ጥቃቅን ማሻሻያ የተጠየቀበት የስክሪፕት ሰነድ...',
    content: 'ትዕይንት ፫ ላይ ያለው ውይይት በመጠኑ እንዲሳጠርና የገጸ-ባሕሪያቱ አልባሳት ከዘመኑ ታሪክ ጋር እንዲስማማ ተጠይቋል።',
    readTime: '፭ ደቂቃ',
    division: 'youth',
    isBookmarked: false,
    isFeatured: false,
    version: 2,
    reviewerFeedback: 'እባክዎ ትዕይንት ፫ን ከመድረክ አቅም ጋር እንዲስማማ አሳጥረው በድጋሚ ያቅርቡ።',
    tags: ['ስክሪፕት', 'ማሻሻያ'],
  },

  // --- CHILDREN DIVISION WORKS ---
  {
    id: 'w_c1',
    title: 'የሕፃናት የዳዊትና ጎልያድ ተውኔት',
    writerId: 'wr3',
    writerName: 'ዮሐንስ ግርማ',
    categoryId: 'theater',
    categoryName: 'ቲያትር',
    dateAmharic: 'ጥር ፲፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    division: 'children',
    excerpt: 'ትንሹ እረኛ ዳዊት በእምነት ጽናት ግዙፉን ጎልያድ በጠጠር ድል ያደረገበት አስተማሪ የሕፃናት ድራማ...',
    content: `ትዕይንት ፩፦ በኤላ ሸለቆ

ገጸ-ባሕሪያት፦ ታናሹ ዳዊት፣ ጎልያድ፣ የሳኦል ወታደሮች
(ዳዊት የወንጭፍ ጠጠሩን በእጁ ይዞ በፈገግታ መድረክ ላይ ይቆማል)

ዳዊት፦
«አንተ በሰይፍና በጦር በጭላዳም ወደ እኔ ትመጣለህ፤ እኔ ግን ዛሬ በተገዳደርኸው በእስራኤል ጭፍሮች አምላክ በሠራዊት ጌታ በእግዚአብሔር ስም እመጣብሃለሁ!»

(ሕፃናት ተዋንያን በደስታ እልልታ ያሰማሉ)`,
    readTime: '፭ ደቂቃ',
    isBookmarked: true,
    isFeatured: true,
    approvedBy: 'የሕፃናት ክፍል ኃላፊ',
    approvedDate: 'ጥር ፳ ፳፻፲፮ ዓ.ም',
    version: 1,
    tags: ['ሕፃናት', 'ተውኔት', 'መጽሐፍ ቅዱስ'],
    hasPdfAttachment: true,
    pdfFileName: 'የዳዊትና_ጎልያድ_የሕፃናት_ተውኔት.pdf',
    pdfFileSize: '115 KB',
  },
  {
    id: 'w_c2',
    title: 'የጠዋት ፀሐይ እና የኖኅ መርከብ — የሕፃናት ግጥም',
    writerId: 'wr1',
    writerName: 'ቃልኪዳን ሰይፉ',
    categoryId: 'poetry',
    categoryName: 'ግጥም',
    dateAmharic: 'የካቲት ፪ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    division: 'children',
    excerpt: 'በሰማይ የቀስተ ደመና ቃል ኪዳን፤ ርግቧ በወይራ ቅጠል ደስታን ይዛ ስትመጣ...',
    content: `ጠዋት በማለዳ ፀሐይ ስትወጣ፣
የኖኅ መርከብ ላይ ርግቧ መጣ፤
የወይራ ቅጠል ይዛ በአፏ፣
ሰላምን አበሰረች በክንፏ።

ሕፃናት በሙሉ ሆነን በአንድነት፣
እንዘምር ለእግዚአብሔር በፍቅር በእውነት!`,
    readTime: '፪ ደቂቃ',
    isBookmarked: false,
    isFeatured: true,
    approvedBy: 'የሕፃናት መምህር',
    version: 1,
    tags: ['ሕፃናት', 'ግጥም', 'የኖኅ መርከብ'],
  },
  {
    id: 'w_c3',
    title: 'የዮሴፍ ባለቀለም ካባ — የሕፃናት ተረትና ትምህርት',
    writerId: 'wr2',
    writerName: 'ሰላማዊት አበበ',
    categoryId: 'literature',
    categoryName: 'ስነ ጽሁፍ',
    dateAmharic: 'ታኅሣሥ ፲ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    division: 'children',
    excerpt: 'አባቱ ያዕቆብ የሰጠው ያ ውብ ባለቀለም ልብስና የሕልሙ ፍጻሜ በግብፅ ምድር...',
    content: 'ዮሴፍ ወንድሞቹ ቢቀኑበትም እግዚአብሔርን ስለወደደ ሁልጊዜ መልካም ያደርግ ነበር። በግብፅ ምድርም ታላቅ ሰው ሆነ። እኛም ታማኞች እንሁን!',
    readTime: '፫ ደቂቃ',
    isBookmarked: false,
    isFeatured: false,
    version: 1,
    tags: ['ሕፃናት', 'ስነ ጽሁፍ', 'ታሪክ'],
  },

  // --- INTERMEDIATES DIVISION WORKS ---
  {
    id: 'w_m1',
    title: 'የነገው ፋና — የታዳጊዎች መነባንብ',
    writerId: 'wr1',
    writerName: 'ቃልኪዳን ሰይፉ',
    categoryId: 'monologue',
    categoryName: 'መነባንብ',
    dateAmharic: 'ጥር ፳፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    division: 'intermediates',
    excerpt: 'በታዳጊነት ዕድሜ የጥበብን መንገድ መምረጥ፤ በፈተናዎች ማዕበል ሳይናወጡ መቆም...',
    content: `እኔ ማዕከላይ ነኝ፤
በሕፃንነትና በወጣትነት ድልድይ ላይ የቆምኩ።
ጥበብን ለመፈለግ ልቤ ይናፍቃል፣
የተክለ ሣዊሮስ ቃል በነፍሴ ይበራል።

በጉብዝናዬ ወራት ፈጣሪዬን አሰብኩ፣
የጥበብን ጽዋ በመቅደሱ ቀዳሁ!`,
    readTime: '፬ ደቂቃ',
    isBookmarked: true,
    isFeatured: true,
    approvedBy: 'የማዕከላውያን አስተባባሪ',
    version: 1,
    tags: ['ማዕከላውያን', 'መነባንብ', 'መንፈሳዊ ጉብዝና'],
    hasPdfAttachment: true,
    pdfFileName: 'የነገው_ፋና_መነባንብ.pdf',
    pdfFileSize: '108 KB',
  },
  {
    id: 'w_m2',
    title: 'የጠቢቡ ሰሎሞን ምክር — የመድረክ ድራማ',
    writerId: 'wr3',
    writerName: 'ዮሐንስ ግርማ',
    categoryId: 'theater',
    categoryName: 'ቲያትር',
    dateAmharic: 'ታኅሣሥ ፳ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    division: 'intermediates',
    excerpt: 'ጥበብ ከመካሪዎች ጋር ናት፤ ታዳጊዎች የትምህርትና የመልካም ስነ-ምግባር ሚስጥር የሚማሩበት ተውኔት...',
    content: `ትዕይንት ፩፦ የጥበብ አዳራሽ
ሰሎሞን፦ «ልጄ ሆይ የአባትህን ተግሣጽ ስማ፥ የእናትህንም ሕግ አትተዉ፤ ለራስህ የሞገስ አክሊል፥ ለአንገትህም ማዕርግ ይሆንልሃልና።»`,
    readTime: '፯ ደቂቃ',
    isBookmarked: false,
    isFeatured: true,
    version: 1,
    tags: ['ማዕከላውያን', 'ቲያትር', 'ጥበብ'],
  },
  {
    id: 'w_m3',
    title: 'የዳንኤል ጽናት በአንበሶች ጉድጓድ — የታዳጊዎች ስክሪፕት',
    writerId: 'wr3',
    writerName: 'ዮሐንስ ግርማ',
    categoryId: 'script',
    categoryName: 'ስክሪፕት',
    dateAmharic: 'ጥር ፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    division: 'intermediates',
    excerpt: 'በባቢሎን ቤተ-መንግሥት ውስጥ በእምነቱ ያልተደራደረው የወጣቱ ዳንኤል ታሪክ...',
    content: 'ዳንኤል በቀን ሶስት ጊዜ መስኮቱን ወደ ኢየሩሳሌም ከፍቶ ይጸልይ ነበር። ንጉሡም በአንበሶች ጉድጓድ እንዲጣል ቢያደርግም እግዚአብሔር መልአኩን ልኮ የአንበሶቹን አፍ ዘጋ።',
    readTime: '፮ ደቂቃ',
    isBookmarked: false,
    isFeatured: false,
    version: 1,
    tags: ['ማዕከላውያን', 'ስክሪፕት', 'ዳንኤል'],
  },
  ...ADDITIONAL_DEPARTMENT_WORKS,
];

export const INITIAL_EVENTS: CulturalEvent[] = [
  {
    id: 'prog_w1',
    title: 'እሁድ የሰንበት ጉባኤ እና የኪነጥበብ ሰዓት',
    recurrence: 'WEEKLY',
    dateAmharic: 'በየሳምንቱ እሁድ',
    timeAmharic: 'ከቀኑ ፯:፴ እስከ ፱:፴',
    location: 'ተክለ ሣዊሮስ ታላቁ አዳራሽ',
    category: 'ሳምንታዊ ጉባኤ',
    description: 'በየሳምንቱ እሁድ ከቅዳሴና ትምህርተ ወንጌል በኋላ የሚቀርብ መንፈሳዊ የኪነጥበብ መድረክ።',
    organizer: 'የኪነጥበብ ክፍል',
    assignments: [
      {
        id: 'asgn_w1',
        workId: 'w1',
        workTitle: 'የብርሃን ማዕበል እና የጽናት ቃል',
        workCategory: 'ግጥም',
        writerMemberId: 'm_wr1',
        writerMemberName: 'ቃልኪዳን ሰይፉ',
        organizerMemberId: 'm_org1',
        organizerMemberName: 'ሰላማዊት አበበ',
        presenterMemberId: 'm_prs2',
        presenterMemberName: 'ሰሎሜ ጥላሁን',
        performanceNotes: 'ከስብከተ ወንጌል በኋላ በመነባንብ ዜማ ከበገና አጃቢ ጋር ይቀርባል።',
        isCompleted: true,
      },
    ],
  },
  {
    id: 'prog_w2',
    title: 'ሐሙስ የኪነጥበብ ስልጠናና የተሰጥዖ ልምምድ',
    recurrence: 'WEEKLY',
    dateAmharic: 'በየሳምንቱ ሐሙስ',
    timeAmharic: 'ከምሽቱ ፲፩:፴ እስከ ፩:00',
    location: 'ክፍል ፫ - የጥበብ ማዕከል',
    category: 'ሳምንታዊ ልምምድ',
    description: 'ለአዳዲስና ነባር አባላት የሚሰጥ የስክሪፕት ዝግጅት፣ የመድረክ ድምፅና ትወና ተግባራዊ ልምምድ።',
    organizer: 'የስልጠና እና ዝግጅት ክፍል',
    assignments: [
      {
        id: 'asgn_w2',
        workId: 'w8',
        workTitle: 'የመድረክ ዝግጅት መመሪያ ሰነድ ፪',
        workCategory: 'ስክሪፕት',
        writerMemberId: 'm_wr2',
        writerMemberName: 'ዮሐንስ ግርማ',
        organizerMemberId: 'm_org2',
        organizerMemberName: 'ዲ/ን ቴዎድሮስ አማረ',
        presenterMemberId: 'm_prs3',
        presenterMemberName: 'ዲ/ን ናትናኤል ታፈሰ',
        performanceNotes: 'የትዕይንት ፫ አቀራረብና የመድረክ አልባሳት ማስተካከያ ይደረግበታል።',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'prog_m1',
    title: 'የቅዱስ ተክለ ሣዊሮስ ወርሃዊ በዓል የኪነጥበብ ምሽት',
    recurrence: 'MONTHLY',
    dateAmharic: 'በየወሩ በ፲፭ኛው ቀን',
    timeAmharic: 'ከቀኑ ፰:00 ጀምሮ',
    location: 'ደብረ ሣዊሮስ ታላቁ አዳራሽ',
    category: 'ወርሃዊ በዓል',
    description: 'በታቦተ በዓሉ ቀን የሚዘጋጅ የድርሳናት ንባብ፣ መንፈሳዊ ግጥሞችና የዜማ ምሽት።',
    organizer: 'የሰንበት ት/ቤት አስተዳደር',
    assignments: [
      {
        id: 'asgn_m1',
        workId: 'w6',
        workTitle: 'የ፳፻፲፭ ዓ.ም የኪነጥበብ ምሽት — የታሪክ ሰነድ',
        workCategory: 'ታሪክ',
        writerMemberId: 'm_wr4',
        writerMemberName: 'ማርታ ዘውዱ',
        organizerMemberId: 'm_org3',
        organizerMemberName: 'ኤልያስ ታደሰ',
        presenterMemberId: 'm_prs1',
        presenterMemberName: 'በረከት ሃብታሙ',
        performanceNotes: 'የቅዱስ ተክለ ሣዊሮስ ገድልና የሰንበት ትምህርት ቤቱ ጥንታዊ ታሪክ ለምዕመናን ይተረካል።',
        isCompleted: true,
      },
    ],
  },
  {
    id: 'prog_m2',
    title: 'ወርሃዊ የስነ ጽሁፍ እና የቅኔ ጉባኤ',
    recurrence: 'MONTHLY',
    dateAmharic: 'በየወሩ መጨረሻ ቅዳሜ',
    timeAmharic: 'ከቀኑ ፱:00 ጀምሮ',
    location: 'የሰንበት ት/ቤት ቤተ መጻሕፍት አዳራሽ',
    category: 'ወርሃዊ ጉባኤ',
    description: 'የአባላት አዳዲስ የፈጠራ ስራዎች ግምገማ፣ የቅኔ አፈታት እና የስነ ጽሁፍ ውይይት መድረክ።',
    organizer: 'የስነ ጽሁፍ ክፍል',
    assignments: [
      {
        id: 'asgn_m2',
        workId: 'w7',
        workTitle: 'የነጋሪት ድምፅ — አዲስ የታጨ ግጥም',
        workCategory: 'ግጥም',
        writerMemberId: 'm_wr3',
        writerMemberName: 'ዳዊት ሙሉጌታ',
        organizerMemberId: 'm_org1',
        organizerMemberName: 'ሰላማዊት አበበ',
        presenterMemberId: 'm_prs4',
        presenterMemberName: 'ሩት ተስፋዬ',
        performanceNotes: 'የአዲሱ ግጥም ትንታኔ እና የቋንቋ ውበት ግምገማ በጉባኤው ይቀርባል።',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'prog_y1',
    title: 'ታላቁ ዓመታዊ የኪነጥበብ እና የስነ ጽሁፍ ፌስቲቫል',
    recurrence: 'YEARLY',
    dateAmharic: 'መጋቢት ፲፭ ፳፻፲፮ ዓ.ም (ዓመታዊ)',
    timeAmharic: 'ከቀኑ ፰:00 ጀምሮ',
    location: 'ደብረ ሣዊሮስ ታላቁ የመሰብሰቢያ አዳራሽ',
    category: 'ዓመታዊ ፌስቲቫል',
    description: 'አዳዲስ የተዘጋጁ ድራማዎች፣ የቅኔና የግጥም ምሽት እንዲሁም የስዕል ኤግዚቢሽን የሚቀርብበት ልዩ ዝግጅት።',
    organizer: 'የኪነጥበብ ክፍል አስተባባሪ',
    assignments: [
      {
        id: 'asgn_y1',
        workId: 'w2',
        workTitle: 'የብርሃኑ መንገድ — መንፈሳዊ ተውኔት',
        workCategory: 'ቲያትር',
        writerMemberId: 'm_wr2',
        writerMemberName: 'ዮሐንስ ግርማ',
        organizerMemberId: 'm_org2',
        organizerMemberName: 'ዲ/ን ቴዎድሮስ አማረ',
        presenterMemberId: 'm_prs3',
        presenterMemberName: 'ዲ/ን ናትናኤል ታፈሰ',
        performanceNotes: 'ከ፲፪ በላይ ተዋንያንን ያካተተ ዋናው ዓመታዊ የመድረክ ትዕይንት በደማቅ አልባሳት ይቀርባል።',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'prog_y2',
    title: 'ዓመታዊ የብራና ቅርስ እና የስዕል ኤግዚቢሽን',
    recurrence: 'YEARLY',
    dateAmharic: 'ጳጉሜን ፫ ፳፻፲፮ ዓ.ም (ዓመታዊ)',
    timeAmharic: 'ከቀኑ ፱:00 ጀምሮ',
    location: 'የኪነጥበብ አውደ ርዕይ ማዕከል',
    category: 'ዓመታዊ ኤግዚቢሽን',
    description: 'የዓመቱ ምርጥ የኪነጥበብ ስራዎች፣ ጥንታዊ የብራና ጽሁፎች እና የስዕል ውጤቶች ለዕይታ የሚቀርቡበት መድረክ።',
    organizer: 'የሰነድና የታሪክ ክፍል',
    assignments: [
      {
        id: 'asgn_y2',
        workId: 'w5',
        workTitle: 'የጥንታዊ ብራና ቀለማት እና የቅዱሳን ስዕላት',
        workCategory: 'ሥዕል',
        writerMemberId: 'm_wr1',
        writerMemberName: 'ቃልኪዳን ሰይፉ',
        organizerMemberId: 'm_org4',
        organizerMemberName: 'ሔኖክ ዳንኤል',
        presenterMemberId: 'm_prs1',
        presenterMemberName: 'በረከት ሃብታሙ',
        performanceNotes: 'የቀለማቱ አመራረትና የብራናው ታሪካዊ ፋይዳ ለጎብኚዎች ይብራራል።',
        isCompleted: true,
      },
    ],
  },
  ...ADDITIONAL_DEPARTMENT_EVENTS,
];

export const INITIAL_AUDIO_TRACKS: LiturgicalAudioTrack[] = [
  {
    id: 'trk_w1',
    title: 'የብርሃን ማዕበል እና የጽናት ቃል',
    narratorOrCantor: 'ቃልኪዳን ሰይፉ (የግጥም ፀሐፊ)',
    division: 'youth',
    categoryName: 'ግጥም / መነባንብ',
    durationAmharic: '፫:፵፭',
    durationSeconds: 225,
    description: 'በጥንታዊው ብራና ቀለም ሲነጥብ፣ የነፍስ ዜማ በዕጣን ጢስ ሲታጀብ...',
  },
  {
    id: 'trk_wc1',
    title: 'የሕፃናት የዳዊትና ጎልያድ ተውኔት ድምፅ',
    narratorOrCantor: 'ዮሐንስ ግርማ (ተራኪ)',
    division: 'children',
    categoryName: 'ተውኔት',
    durationAmharic: '፪:፶፭',
    durationSeconds: 175,
    description: 'ትንሹ እረኛ ዳዊት በእምነት ጽናት ጎልያድን ድል ያደረገበት አስተማሪ የሕፃናት ድራማ ድምፅ።',
  },
  {
    id: 'trk_w2',
    title: 'የብርሃኑ መንገድ — የመድረክ ትዕይንት',
    narratorOrCantor: 'ዲ/ን ቴዎድሮስ አማረ (አዘጋጅ)',
    division: 'intermediates',
    categoryName: 'ቲያትር',
    durationAmharic: '፭:፲፪',
    durationSeconds: 312,
    description: 'የቅዱሳን አበው ፈለግና የጽናት መንገድ ድምፃዊ ተውኔት።',
  },
];

interface ArchiveContextType {
  categories: WorkCategory[];
  works: WorkItem[];
  writers: Writer[];
  members: ChurchMember[];
  events: CulturalEvent[];
  activeDepartment: SundaySchoolDepartment;
  setActiveDepartment: (dept: SundaySchoolDepartment) => void;
  departmentsList: DepartmentInfo[];
  addDepartment: (dept: Omit<DepartmentInfo, 'id'>) => Promise<DepartmentInfo>;
  pdfPackages: SundayPlanPdfPackage[];
  childrenAnnualPlan: SundayProgramPlanEntry[];
  maekelawiyanAnnualPlan: SundayProgramPlanEntry[];
  youthAnnualPlan: SundayProgramPlanEntry[];
  dailyPlanSheets: SundayDailyPlanSheet[];
  updateDailyPlanSheet: (sheetId: string, updates: Partial<SundayDailyPlanSheet>) => Promise<void>;
  createDailyPlanSheet: (sheet: SundayDailyPlanSheet) => Promise<SundayDailyPlanSheet>;
  toggleDailyPreProgramItem: (sheetId: string, needItem: string) => Promise<void>;
  deleteDailyPlanSheet: (sheetId: string) => Promise<void>;
  ehudPlans: EhudProgramPlan[];
  createEhudPlan: (data: {
    division: SundaySchoolDivision;
    planScope?: EhudPlanScope;
    title: string;
    monthAmharic: string;
    targetDateAmharic: string;
    squadName?: string;
    presenterName?: string;
    presenterContact?: string;
    scriptureRef?: string;
    goal: string;
    resourcesNeeded: string[];
    status: EhudPlanStatus;
  }) => Promise<EhudProgramPlan>;
  updateEhudPlan: (planId: string, updates: Partial<EhudProgramPlan>) => Promise<void>;
  deleteEhudPlan: (planId: string) => Promise<void>;
  ehudFollowUps: EhudFollowUpRecord[];
  createEhudFollowUp: (data: {
    division: SundaySchoolDivision;
    planScope?: EhudPlanScope;
    programSheetId: string;
    programTitle: string;
    programDateAmharic: string;
    attendanceCount: number;
    punctualityStatus: EhudPunctualityStatus;
    readinessScore: number;
    followUpStatus: EhudFollowUpStatus;
    observations: string;
    actionItems: string;
  }) => Promise<EhudFollowUpRecord>;
  updateEhudFollowUp: (followupId: string, updates: Partial<EhudFollowUpRecord>) => Promise<void>;
  deleteEhudFollowUp: (followupId: string) => Promise<void>;
  ehudRatings: EhudProgramRating[];
  submitEhudProgramRating: (data: {
    division: SundaySchoolDivision;
    planScope?: EhudPlanScope;
    programSheetId: string;
    programTitle: string;
    programDateAmharic: string;
    overallRating: number;
    spiritualDepthRating: number;
    timeManagementRating: number;
    organizationRating: number;
    engagementRating: number;
    strengths?: string;
    improvements?: string;
  }) => Promise<EhudProgramRating>;
  deleteEhudProgramRating: (ratingId: string) => Promise<void>;
  selectedDivision: SundaySchoolDivision;
  currentUser: UserProfile;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  isSyncing: boolean;
  themeMode: AppThemeMode;
  audioTracks: LiturgicalAudioTrack[];
  currentAudioTrack: LiturgicalAudioTrack | null;
  isAudioPlaying: boolean;
  audioProgress: number;
  googleAccessToken: string | null;
  isGoogleDriveConnected: boolean;
  connectGoogleDrive: () => Promise<string | null>;
  disconnectGoogleDrive: () => void;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  registerWithEmail: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole,
    requestedDeptId?: string,
    division?: SundaySchoolDivision,
    serviceSkills?: string[],
    preferredResponsibilities?: string,
    sundaySchoolId?: string,
    requestedPosition?: EhudDepartmentPosition
  ) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPasswordEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  selectDivision: (div: SundaySchoolDivision) => void;
  toggleThemeMode: () => void;
  setUserRole: (role: UserRole) => void;
  toggleBookmark: (workId: string) => void;
  submitNewWork: (data: {
    title: string;
    categoryId: string;
    content: string;
    excerpt: string;
    tags: string[];
    writerName?: string;
    division?: SundaySchoolDivision;
    departmentId?: SundaySchoolDepartment;
    hasPdfAttachment?: boolean;
    pdfFileName?: string | null;
    pdfFileSize?: string | null;
    pdfUrl?: string | null;
    file?: File | null;
  }) => Promise<WorkItem>;
  updateWork: (
    workId: string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      tags?: string[];
      categoryId?: string;
      division?: SundaySchoolDivision;
      file?: File | null;
      hasPdfAttachment?: boolean;
      pdfFileName?: string | null;
      pdfFileSize?: string | null;
    }
  ) => Promise<WorkItem>;
  reviewWorkAction: (
    workId: string,
    newStatus: SubmissionStatus,
    feedback?: string | null,
    reviewerName?: string
  ) => Promise<void>;
  deleteWork: (workId: string) => Promise<void>;
  addMember: (data: {
    fullName: string;
    duty: MemberDuty;
    phone: string;
    spiritualTitle: string;
    department: string;
    departmentId?: SundaySchoolDepartment;
    bio: string;
  }) => Promise<ChurchMember>;
  deleteMember: (memberId: string) => Promise<void>;
  addEvent: (data: {
    title: string;
    dateAmharic: string;
    timeAmharic: string;
    location: string;
    category: string;
    description: string;
    organizer: string;
    recurrence?: ProgramRecurrence;
    division?: SundaySchoolDivision | null;
    departmentId?: SundaySchoolDepartment;
  }) => Promise<CulturalEvent>;
  deleteEvent: (eventId: string) => Promise<void>;
  addAssignmentToProgram: (eventId: string, assignment: ProgramAssignment) => Promise<void>;
  toggleAssignmentCompletion: (eventId: string, assignmentId: string) => Promise<void>;

  // Department Isolation, Memberships & Role Scoping
  departmentMemberships: DepartmentMembership[];
  departmentInvites: DepartmentInvite[];
  registeredUsers: UserProfile[];
  registeredUsersError: string | null;
  scheduleAssignments: ScheduleTaskAssignment[];
  departmentNotifications: DepartmentNotification[];
  isSuperAdmin: boolean;
  isMasterOperator: boolean;
  assignedDepartmentId: SundaySchoolDepartment | null;
  isDepartmentLocked: (deptId: SundaySchoolDepartment) => boolean;
  lockDepartmentChoice: (dept: SundaySchoolDepartment) => boolean;
  loginAsMasterOperator: () => Promise<FirebaseUser | null>;
  isDepartmentPortalLocked: boolean;
  userMemberships: DepartmentMembership[];
  approvedMemberships: DepartmentMembership[];
  approvedDepartmentsList: DepartmentInfo[];
  activeMembership: DepartmentMembership | null;
  isDeptAdmin: boolean;
  canApproveDeptMembers: boolean;
  canSwitchDepartments: boolean;
  hasPendingApproval: boolean;
  requestDepartmentMembership: (
    deptId: string,
    division?: SundaySchoolDivision,
    serviceSkills?: string[],
    preferredResponsibilities?: string,
    sundaySchoolId?: string,
    requestedPosition?: EhudDepartmentPosition
  ) => Promise<DepartmentMembership>;
  approveMembershipRequest: (
    membershipId: string,
    assignedRole: UserRole,
    ehudPosition?: EhudDepartmentPosition,
    canApproveMembers?: boolean
  ) => Promise<void>;
  appointUserToDepartment: (
    userProfile: UserProfile,
    deptId: string,
    assignedRole: UserRole,
    ehudPosition?: EhudDepartmentPosition,
    canApproveMembers?: boolean
  ) => Promise<void>;
  toggleMemberApprovalAuthority: (membershipId: string, allow: boolean) => Promise<void>;
  createDepartmentInvite: (data: {
    email: string;
    fullName: string;
    departmentId: string;
    role: UserRole;
    division?: SundaySchoolDivision;
    sundaySchoolId?: string;
    requestedPosition?: EhudDepartmentPosition;
    canApproveMembers?: boolean;
  }) => Promise<{ invite: DepartmentInvite; immediatelyApproved: boolean }>;
  cancelDepartmentInvite: (inviteId: string) => Promise<void>;
  refreshMembershipAndInvites: () => Promise<void>;
  rejectMembershipRequest: (membershipId: string, rejectionReason: string) => Promise<void>;
  suspendMembership: (membershipId: string, suspensionReason?: string) => Promise<void>;
  createScheduleAssignment: (
    data: Omit<ScheduleTaskAssignment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
      status?: ScheduleTaskStatus;
    }
  ) => Promise<ScheduleTaskAssignment>;
  updateScheduleAssignment: (
    assignmentId: string,
    updates: Partial<ScheduleTaskAssignment>
  ) => Promise<void>;
  acceptAssignment: (assignmentId: string) => Promise<void>;
  updateAssignmentProgress: (
    assignmentId: string,
    status: ScheduleTaskStatus,
    notes?: string
  ) => Promise<void>;
  submitAssignmentDeliverable: (
    assignmentId: string,
    submission: { content?: string; fileUrl?: string; fileName?: string }
  ) => Promise<void>;
  reviewAssignment: (
    assignmentId: string,
    newStatus: ScheduleTaskStatus,
    feedback?: string
  ) => Promise<void>;
  deleteScheduleAssignment: (assignmentId: string) => Promise<void>;
  checkMemberWorkload: (
    memberId: string,
    targetDate?: string
  ) => { activeTaskCount: number; hasOverlap: boolean; overlappingAssignments: ScheduleTaskAssignment[] };
  markNotificationRead: (notificationId: string) => Promise<void>;

  playTrack: (track: LiturgicalAudioTrack) => void;
  playWorkAudio: (work: WorkItem) => void;
  toggleAudioPlayPause: () => void;
  stopAudio: () => void;
  setAudioProgress: (progress: number) => void;
}

export const ArchiveContext = createContext<ArchiveContextType | null>(null);

export const ArchiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories] = useState<WorkCategory[]>(INITIAL_CATEGORIES);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isAdminDocVerified, setIsAdminDocVerified] = useState<boolean>(false);

  // Sole Master Operator & Super Admin: exclusively verified goferconstruction@gmail.com
  const isSuperAdmin = Boolean(
    firebaseUser &&
      firebaseUser.emailVerified &&
      isMasterOperatorEmail(firebaseUser.email)
  );
  const isMasterOperator = isSuperAdmin;
  const isDepartmentPortalLocked = !isSuperAdmin;

  const [lockedDepartmentId, setLockedDepartmentId] = useState<SundaySchoolDepartment | null>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_locked_dept');
      if (saved) return saved as SundaySchoolDepartment;
    } catch {
      // ignore
    }
    return null;
  });

  const getInitialActiveDept = (): SundaySchoolDepartment => {
    try {
      const locked = localStorage.getItem('mezgebe_locked_dept');
      if (locked) return locked as SundaySchoolDepartment;
      const saved = localStorage.getItem('mezgebe_active_dept');
      if (saved) return saved as SundaySchoolDepartment;
    } catch {
      // ignore
    }
    return 'kinetibeb';
  };
  const [activeDepartment, setActiveDepartmentState] = useState<SundaySchoolDepartment>(getInitialActiveDept);

  const [works, setWorks] = useState<WorkItem[]>(() => {
    const initialDept = getInitialActiveDept();
    return INITIAL_WORKS.filter((w) =>
      w.departmentId ? w.departmentId === initialDept : initialDept === 'kinetibeb'
    );
  });
  const [writers] = useState<Writer[]>(INITIAL_WRITERS);
  const [members, setMembers] = useState<ChurchMember[]>(() => {
    const initialDept = getInitialActiveDept();
    return INITIAL_MEMBERS.filter((m) =>
      m.departmentId ? m.departmentId === initialDept : initialDept === 'kinetibeb'
    );
  });
  const [events, setEvents] = useState<CulturalEvent[]>(() => {
    const initialDept = getInitialActiveDept();
    return INITIAL_EVENTS.filter((e) =>
      e.departmentId ? e.departmentId === initialDept : initialDept === 'kinetibeb'
    );
  });

  const persistActiveAndLockedDept = (dept: SundaySchoolDepartment, lockChoice: boolean) => {
    setActiveDepartmentState(dept);
    try {
      localStorage.setItem('mezgebe_active_dept', dept);
      if (lockChoice) {
        localStorage.setItem('mezgebe_locked_dept', dept);
      }
    } catch {
      // ignore
    }
    if (lockChoice) {
      setLockedDepartmentId(dept);
    }
  };

  const lockDepartmentChoice = (dept: SundaySchoolDepartment): boolean => {
    if (isSuperAdmin) {
      setActiveDepartmentState(dept);
      try {
        localStorage.setItem('mezgebe_active_dept', dept);
      } catch {
        // ignore
      }
      return true;
    }
    if (firebaseUser) {
      const existingMems = departmentMemberships.filter((m) => m.userId === firebaseUser.uid);
      if (existingMems.length > 0 && !existingMems.some((m) => m.departmentId === dept)) {
        return false;
      }
    }
    if (lockedDepartmentId && lockedDepartmentId !== dept) {
      return false;
    }
    persistActiveAndLockedDept(dept, true);
    return true;
  };

  const setActiveDepartment = (dept: SundaySchoolDepartment) => {
    if (!isSuperAdmin) {
      if (firebaseUser) {
        const userMems = departmentMemberships.filter((m) => m.userId === firebaseUser.uid);
        if (userMems.length > 0 && !userMems.some((m) => m.departmentId === dept)) {
          return;
        }
      }
      if (lockedDepartmentId && lockedDepartmentId !== dept) {
        return;
      }
      persistActiveAndLockedDept(dept, true);
      return;
    }
    persistActiveAndLockedDept(dept, false);
  };

  const INITIAL_DAILY_PLAN_SHEETS: SundayDailyPlanSheet[] = [
    ...CHILDREN_DAILY_PLANS_2019,
    ...MAEKELAWIYAN_DAILY_PLANS_2019,
    ...YOUTH_DAILY_PLANS_2019,
  ];

  const mergeDailySheets = (
    base: SundayDailyPlanSheet[],
    overrides: SundayDailyPlanSheet[]
  ): SundayDailyPlanSheet[] => {
    const map = new Map<string, SundayDailyPlanSheet>(base.map((s) => [s.id, s]));
    for (const ov of overrides) {
      map.set(ov.id, ov);
    }
    return Array.from(map.values());
  };

  const [dailyPlanSheets, setDailyPlanSheets] = useState<SundayDailyPlanSheet[]>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_daily_plan_sheets');
      if (saved) {
        const parsed = JSON.parse(saved) as SundayDailyPlanSheet[];
        if (Array.isArray(parsed)) {
          return mergeDailySheets(INITIAL_DAILY_PLAN_SHEETS, parsed);
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_DAILY_PLAN_SHEETS;
  });

  const persistLocalDailySheets = (sheets: SundayDailyPlanSheet[]) => {
    try {
      localStorage.setItem('mezgebe_daily_plan_sheets', JSON.stringify(sheets));
    } catch {
      // ignore
    }
  };

  const updateDailyPlanSheet = async (
    sheetId: string,
    updates: Partial<SundayDailyPlanSheet>
  ): Promise<void> => {
    const existing = dailyPlanSheets.find((s) => s.id === sheetId);
    if (!existing) return;

    const mergedSheet: SundayDailyPlanSheet = {
      ...existing,
      ...updates,
      presenterContact:
        updates.presenterContact !== undefined
          ? updates.presenterContact.trim().slice(0, 100) || undefined
          : existing.presenterContact,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.fullName,
    };

    setDailyPlanSheets((prev) => {
      const next = prev.map((sheet) => (sheet.id === sheetId ? mergedSheet : sheet));
      persistLocalDailySheets(next);
      return next;
    });

    if (!auth.currentUser) return;
    try {
      await setDoc(
        doc(db, 'sunday_daily_sheets', sheetId),
        sanitizeFirestorePayload(mergedSheet)
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sunday_daily_sheets/${sheetId}`);
    }
  };

  const createDailyPlanSheet = async (
    sheet: SundayDailyPlanSheet
  ): Promise<SundayDailyPlanSheet> => {
    const payload: SundayDailyPlanSheet = {
      ...sheet,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.fullName,
    };

    setDailyPlanSheets((prev) => {
      const next = mergeDailySheets(prev, [payload]);
      persistLocalDailySheets(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await setDoc(
          doc(db, 'sunday_daily_sheets', payload.id),
          sanitizeFirestorePayload(payload)
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `sunday_daily_sheets/${payload.id}`);
      }
    }
    return payload;
  };

  const toggleDailyPreProgramItem = async (
    sheetId: string,
    needItem: string
  ): Promise<void> => {
    const existing = dailyPlanSheets.find((s) => s.id === sheetId);
    if (!existing) return;

    const prevState = existing.preProgramChecklistState || {};
    const nextState: Record<string, boolean> = {
      ...prevState,
      [needItem]: !prevState[needItem],
    };

    await updateDailyPlanSheet(sheetId, {
      preProgramChecklistState: nextState,
    });
  };

  const deleteDailyPlanSheet = async (sheetId: string): Promise<void> => {
    setDailyPlanSheets((prev) => {
      const next = prev.filter((s) => s.id !== sheetId);
      persistLocalDailySheets(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'sunday_daily_sheets', sheetId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sunday_daily_sheets/${sheetId}`);
      }
    }
  };

  // =========================================================================
  // EHUD MERHA GIBIR: PLANNING, FOLLOWING & PROGRAM RATINGS
  // =========================================================================
  const INITIAL_EHUD_PLANS: EhudProgramPlan[] = [
    {
      id: 'eplan_hidar_youth_1',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'WEEKLY',
      title: 'የኅዳር ወር ወጣቶች መንፈሳዊ ጉባኤና የጽናት ትምህርት',
      monthAmharic: 'ኅዳር',
      targetDateAmharic: 'ኅዳር 13 2019 ዓ.ም.',
      squadName: 'ምድብ 02 (ደስታ)',
      presenterName: 'ዲ/ን ሚካኤል ተስፋዬ',
      scriptureRef: '1ኛ ቆሮ. 16:13',
      goal: 'ወጣቶች በጾመ ነቢያት ዋዜማ በጸሎትና በቤተክርስቲያን ሕይወት እንዲጸኑ ማነሳሳት',
      resourcesNeeded: ['ማይክሮፎንና ድምፅ ማጉያ', 'የመዝሙር ጥራዝ', 'የመገኘት መዝገብ'],
      status: 'SCHEDULED',
      createdBy: 'system_seed',
      createdByName: 'የእሁድ መርሐ ግብር ክፍል',
      createdAt: '2026-11-01T08:00:00.000Z',
      updatedAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 'eplan_hidar_children_1',
      departmentId: 'ehud_merha_gibir',
      division: 'children',
      planScope: 'WEEKLY',
      title: 'የቅዱሳን ታሪክና የሕፃናት መዝሙር ልምምድ መርሐ ግብር',
      monthAmharic: 'ኅዳር',
      targetDateAmharic: 'ኅዳር 20 2019 ዓ.ም.',
      squadName: 'ምድብ 1 መምህራን',
      presenterName: 'መ/ርት ትዕግሥት አበበ',
      scriptureRef: 'ማቴ. 19:14',
      goal: 'ሕፃናት የቅዱሳንን ታሪክ በቀላል ተውኔትና መዝሙር እንዲማሩ ማድረግ',
      resourcesNeeded: ['የሥዕል ካርዶች', 'የሕፃናት መዝሙር ደብተር'],
      status: 'READY',
      createdBy: 'system_seed',
      createdByName: 'የእሁድ መርሐ ግብር ክፍል',
      createdAt: '2026-11-02T08:00:00.000Z',
      updatedAt: '2026-11-02T08:00:00.000Z',
    },
    {
      id: 'eplan_hidar_int_1',
      departmentId: 'ehud_merha_gibir',
      division: 'intermediates',
      planScope: 'WEEKLY',
      title: 'የማዕከላውያን የመጽሐፍ ቅዱስ ጥናትና የጥያቄና መልስ ውድድር',
      monthAmharic: 'ኅዳር',
      targetDateAmharic: 'ኅዳር 27 2019 ዓ.ም.',
      squadName: 'የጥበብ ምድብ',
      presenterName: 'አቤል ዘውዱ',
      scriptureRef: 'መዝ. 119:105',
      goal: 'ማዕከላውያን የወንጌልን መሠረታዊ ትምህርት በውይይት እንዲያዳብሩ ማበረታታት',
      resourcesNeeded: ['የጥያቄና መልስ ካርዶች', 'የውጤት ሰሌዳ'],
      status: 'DRAFT',
      createdBy: 'system_seed',
      createdByName: 'የእሁድ መርሐ ግብር ክፍል',
      createdAt: '2026-11-03T08:00:00.000Z',
      updatedAt: '2026-11-03T08:00:00.000Z',
    },
  ];

  const INITIAL_EHUD_FOLLOWUPS: EhudFollowUpRecord[] = [
    {
      id: 'efollow_hidar_6',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'DAILY',
      programSheetId: 'yth_hidar_6',
      programTitle: 'ኅዳር 6 — ተመየጢ (የዕለት መርሐ ግብር)',
      programDateAmharic: 'ኅዳር 6 2019 ዓ.ም.',
      attendanceCount: 248,
      punctualityStatus: 'ON_TIME',
      readinessScore: 92,
      followUpStatus: 'RESOLVED',
      observations: 'ድምፅ ማጉያና መምህራን በሰዓቱ ተገኝተው መርሐ ግብሩ በተሳካ ሁኔታ ተካሂዷል።',
      actionItems: 'ለቀጣዩ እሁድ ተጨማሪ የመዝሙር ወረቀቶች እንዲታተሙ ተወስኗል።',
      recordedBy: 'system_seed',
      recordedByName: 'የክትትል ቡድን',
      createdAt: '2026-11-10T10:30:00.000Z',
      updatedAt: '2026-11-10T10:30:00.000Z',
    },
    {
      id: 'efollow_weekly_hidar_13',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'WEEKLY',
      programSheetId: 'yth_hid_13',
      programTitle: 'አእላፋት መላእክት (ሳምንታዊ ዕቅድ)',
      programDateAmharic: 'ኅዳር 13 2019 ዓ.ም.',
      attendanceCount: 235,
      punctualityStatus: 'ON_TIME',
      readinessScore: 88,
      followUpStatus: 'IN_PROGRESS',
      observations: 'የምድብ 02 አዘጋጆች የምንባብና የመዝሙር ዝግጅት አጠናቅቀዋል።',
      actionItems: 'የዕለት መርሐ ግብር ሉህ በመድረክ አስተባባሪ እንዲረጋገጥ ክትትል በመደረግ ላይ ነው።',
      recordedBy: 'system_seed',
      recordedByName: 'የክትትል ቡድን',
      createdAt: '2026-11-14T10:00:00.000Z',
      updatedAt: '2026-11-14T10:00:00.000Z',
    },
    {
      id: 'efollow_yearly_yt_1_1_4',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'YEARLY',
      programSheetId: 'yt_1_1_4',
      programTitle: '1.1.4 — ሳምንታዊ የእሁድ መደበኛ መርሐ ግብር ማከናወን',
      programDateAmharic: 'መስከረም – ጳጉሜን 2019 ዓ.ም.',
      attendanceCount: 250,
      punctualityStatus: 'ON_TIME',
      readinessScore: 90,
      followUpStatus: 'IN_PROGRESS',
      observations: 'የመጀመሪያው ሩብ ዓመት የእሁድ ጉባኤያት በዋና ገጽ ዓመታዊ ሰሌዳ መሠረት እየተከናወኑ ነው።',
      actionItems: 'የታኅሣሥና የጥር እሁዶች የዕለት ሉሆች ቀድመው እንዲጸድቁ ክትትል ይደረጋል።',
      recordedBy: 'system_seed',
      recordedByName: 'የእሁድ መርሐ ግብር አስተባባሪ',
      createdAt: '2026-11-15T10:00:00.000Z',
      updatedAt: '2026-11-15T10:00:00.000Z',
    },
  ];

  const INITIAL_EHUD_RATINGS: EhudProgramRating[] = [
    {
      id: 'erating_seed_1',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'DAILY',
      programSheetId: 'yth_hidar_6',
      programTitle: 'ኅዳር 6 — ተመየጢ',
      programDateAmharic: 'ኅዳር 6 2019 ዓ.ም.',
      overallRating: 5,
      spiritualDepthRating: 5,
      timeManagementRating: 4,
      organizationRating: 5,
      engagementRating: 5,
      strengths: 'ትምህርቱ ጥልቅና ከወቅቱ ጋር የተገናኘ ነበር፤ የመዝሙር ዝግጅቱም በጣም ጥሩ ነበር።',
      improvements: 'የውይይት ክፍለ ጊዜው ትንሽ ቢራዘም ይመረጣል።',
      raterId: 'system_seed',
      raterName: 'ዲ/ን ዮናስ ብርሃኑ',
      createdAt: '2026-11-10T12:00:00.000Z',
      updatedAt: '2026-11-10T12:00:00.000Z',
    },
    {
      id: 'erating_seed_weekly_1',
      departmentId: 'ehud_merha_gibir',
      division: 'youth',
      planScope: 'WEEKLY',
      programSheetId: 'yth_hid_13',
      programTitle: 'አእላፋት መላእክት (ሳምንታዊ ዕቅድ)',
      programDateAmharic: 'ኅዳር 13 2019 ዓ.ም.',
      overallRating: 5,
      spiritualDepthRating: 5,
      timeManagementRating: 5,
      organizationRating: 4,
      engagementRating: 5,
      strengths: 'የሳምንቱ ርዕስና የምድብ 02 ቅንጅት እጅግ አነቃቂ ነበር።',
      improvements: 'የጥያቄ መድረክ 5 ደቂቃ ቢጨመርለት ጥሩ ነው።',
      raterId: 'system_seed',
      raterName: 'እኅት ቤተልሔም አሰፋ',
      createdAt: '2026-11-14T12:00:00.000Z',
      updatedAt: '2026-11-14T12:00:00.000Z',
    },
  ];

  const [ehudPlans, setEhudPlans] = useState<EhudProgramPlan[]>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_ehud_plans');
      if (saved) {
        const parsed = JSON.parse(saved) as EhudProgramPlan[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_EHUD_PLANS;
  });

  const [ehudFollowUps, setEhudFollowUps] = useState<EhudFollowUpRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_ehud_followups');
      if (saved) {
        const parsed = JSON.parse(saved) as EhudFollowUpRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_EHUD_FOLLOWUPS;
  });

  const [ehudRatings, setEhudRatings] = useState<EhudProgramRating[]>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_ehud_ratings');
      if (saved) {
        const parsed = JSON.parse(saved) as EhudProgramRating[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_EHUD_RATINGS;
  });

  const persistLocalEhudPlans = (plans: EhudProgramPlan[]) => {
    try {
      localStorage.setItem('mezgebe_ehud_plans', JSON.stringify(plans));
    } catch {
      // ignore
    }
  };

  const persistLocalEhudFollowUps = (items: EhudFollowUpRecord[]) => {
    try {
      localStorage.setItem('mezgebe_ehud_followups', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const persistLocalEhudRatings = (items: EhudProgramRating[]) => {
    try {
      localStorage.setItem('mezgebe_ehud_ratings', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const createEhudPlan = async (data: {
    division: SundaySchoolDivision;
    planScope?: EhudPlanScope;
    title: string;
    monthAmharic: string;
    targetDateAmharic: string;
    squadName?: string;
    presenterName?: string;
    presenterContact?: string;
    scriptureRef?: string;
    goal: string;
    resourcesNeeded: string[];
    status: EhudPlanStatus;
  }): Promise<EhudProgramPlan> => {
    const nowIso = new Date().toISOString();
    const uid = auth.currentUser?.uid || currentUser.id || 'u_default';
    const newPlan = sanitizeFirestorePayload({
      id: `eplan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      departmentId: 'ehud_merha_gibir',
      division: data.division,
      planScope: data.planScope || 'WEEKLY',
      title: data.title.trim().slice(0, 250),
      monthAmharic: data.monthAmharic.trim().slice(0, 50) || 'ኅዳር',
      targetDateAmharic: data.targetDateAmharic.trim().slice(0, 100),
      squadName: data.squadName?.trim() ? data.squadName.trim().slice(0, 150) : undefined,
      presenterName: data.presenterName?.trim() ? data.presenterName.trim().slice(0, 150) : undefined,
      presenterContact: data.presenterContact?.trim()
        ? data.presenterContact.trim().slice(0, 100)
        : undefined,
      scriptureRef: data.scriptureRef?.trim() ? data.scriptureRef.trim().slice(0, 150) : undefined,
      goal: data.goal.trim().slice(0, 1500),
      resourcesNeeded: data.resourcesNeeded.map((r) => r.trim()).filter(Boolean).slice(0, 30),
      status: data.status,
      createdBy: uid,
      createdByName: (currentUser.fullName || 'አስተባባሪ').slice(0, 150),
      createdAt: nowIso,
      updatedAt: nowIso,
    }) as EhudProgramPlan;

    setEhudPlans((prev) => {
      const next = [newPlan, ...prev];
      persistLocalEhudPlans(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'ehud_program_plans', newPlan.id), newPlan);
      } catch (error: any) {
        if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
          console.warn('Ehud plan saved locally; cloud sync requires deployed firestore.rules and department approval.');
          throw error;
        }
        handleFirestoreError(error, OperationType.CREATE, `ehud_program_plans/${newPlan.id}`);
      }
    }
    return newPlan;
  };

  const updateEhudPlan = async (
    planId: string,
    updates: Partial<EhudProgramPlan>
  ): Promise<void> => {
    const existing = ehudPlans.find((p) => p.id === planId);
    if (!existing) return;

    const merged = sanitizeFirestorePayload({
      ...existing,
      ...updates,
      id: existing.id,
      departmentId: 'ehud_merha_gibir',
      createdBy: existing.createdBy,
      createdAt: existing.createdAt,
      squadName:
        updates.squadName !== undefined
          ? updates.squadName.trim() || undefined
          : existing.squadName,
      presenterName:
        updates.presenterName !== undefined
          ? updates.presenterName.trim().slice(0, 150) || undefined
          : existing.presenterName,
      presenterContact:
        updates.presenterContact !== undefined
          ? updates.presenterContact.trim().slice(0, 100) || undefined
          : existing.presenterContact,
      scriptureRef:
        updates.scriptureRef !== undefined
          ? updates.scriptureRef.trim() || undefined
          : existing.scriptureRef,
      updatedAt: new Date().toISOString(),
    }) as EhudProgramPlan;

    setEhudPlans((prev) => {
      const next = prev.map((p) => (p.id === planId ? merged : p));
      persistLocalEhudPlans(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'ehud_program_plans', planId), merged);
      } catch (error: any) {
        if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
          console.warn('Ehud plan update saved locally; cloud sync requires deployed firestore.rules and department approval.');
          throw error;
        }
        handleFirestoreError(error, OperationType.UPDATE, `ehud_program_plans/${planId}`);
      }
    }
  };

  const deleteEhudPlan = async (planId: string): Promise<void> => {
    setEhudPlans((prev) => {
      const next = prev.filter((p) => p.id !== planId);
      persistLocalEhudPlans(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'ehud_program_plans', planId));
      } catch (error: any) {
        if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
          console.warn('Ehud plan deleted locally; cloud sync requires deployed firestore.rules and department approval.');
          throw error;
        }
        handleFirestoreError(error, OperationType.DELETE, `ehud_program_plans/${planId}`);
      }
    }
  };

  const createEhudFollowUp = async (data: {
    division: SundaySchoolDivision;
    planScope?: EhudPlanScope;
    programSheetId: string;
    programTitle: string;
    programDateAmharic: string;
    attendanceCount: number;
    punctualityStatus: EhudPunctualityStatus;
    readinessScore: number;
    followUpStatus: EhudFollowUpStatus;
    observations: string;
    actionItems: string;
  }): Promise<EhudFollowUpRecord> => {
    const nowIso = new Date().toISOString();
    const uid = auth.currentUser?.uid || currentUser.id || 'u_default';
    const record = sanitizeFirestorePayload({
      id: `efollow_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      departmentId: 'ehud_merha_gibir',
      division: data.division,
      planScope: data.planScope || 'DAILY',
      programSheetId: data.programSheetId.trim().slice(0, 128),
      programTitle: data.programTitle.trim().slice(0, 250),
      programDateAmharic: data.programDateAmharic.trim().slice(0, 100),
      attendanceCount: Math.max(0, Math.min(10000, Number(data.attendanceCount) || 0)),
      punctualityStatus: data.punctualityStatus,
      readinessScore: Math.max(0, Math.min(100, Number(data.readinessScore) || 0)),
      followUpStatus: data.followUpStatus,
      observations: data.observations.trim().slice(0, 2000),
      actionItems: data.actionItems.trim().slice(0, 1500),
      recordedBy: uid,
      recordedByName: (currentUser.fullName || 'ተከታታይ').slice(0, 150),
      createdAt: nowIso,
      updatedAt: nowIso,
    }) as EhudFollowUpRecord;

    setEhudFollowUps((prev) => {
      const next = [record, ...prev];
      persistLocalEhudFollowUps(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'ehud_followups', record.id), record);
      } catch (error: any) {
        if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
          console.warn('Ehud follow-up saved locally; cloud sync requires deployed firestore.rules and department approval.');
          throw error;
        }
        handleFirestoreError(error, OperationType.CREATE, `ehud_followups/${record.id}`);
      }
    }
    return record;
  };

  const updateEhudFollowUp = async (
    followupId: string,
    updates: Partial<EhudFollowUpRecord>
  ): Promise<void> => {
    const existing = ehudFollowUps.find((f) => f.id === followupId);
    if (!existing) return;

    const merged = sanitizeFirestorePayload({
      ...existing,
      ...updates,
      id: existing.id,
      departmentId: 'ehud_merha_gibir',
      recordedBy: existing.recordedBy,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    }) as EhudFollowUpRecord;

    setEhudFollowUps((prev) => {
      const next = prev.map((f) => (f.id === followupId ? merged : f));
      persistLocalEhudFollowUps(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'ehud_followups', followupId), merged);
      } catch (error: any) {
        if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
          console.warn('Ehud follow-up update saved locally; cloud sync requires deployed firestore.rules and department approval.');
          throw error;
        }
        handleFirestoreError(error, OperationType.UPDATE, `ehud_followups/${followupId}`);
      }
    }
  };

  const deleteEhudFollowUp = async (followupId: string): Promise<void> => {
    setEhudFollowUps((prev) => {
      const next = prev.filter((f) => f.id !== followupId);
      persistLocalEhudFollowUps(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'ehud_followups', followupId));
      } catch (error: any) {
        if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
          console.warn('Ehud follow-up deleted locally; cloud sync requires deployed firestore.rules and department approval.');
          throw error;
        }
        handleFirestoreError(error, OperationType.DELETE, `ehud_followups/${followupId}`);
      }
    }
  };

  const submitEhudProgramRating = async (data: {
    division: SundaySchoolDivision;
    planScope?: EhudPlanScope;
    programSheetId: string;
    programTitle: string;
    programDateAmharic: string;
    overallRating: number;
    spiritualDepthRating: number;
    timeManagementRating: number;
    organizationRating: number;
    engagementRating: number;
    strengths?: string;
    improvements?: string;
  }): Promise<EhudProgramRating> => {
    const uid = auth.currentUser?.uid || currentUser.id || 'u_default';
    const scope = data.planScope || 'DAILY';
    const existingByUser = ehudRatings.find(
      (r) =>
        r.programSheetId === data.programSheetId &&
        r.raterId === uid &&
        (r.planScope || 'DAILY') === scope
    );
    const nowIso = new Date().toISOString();
    const clampScore = (v: number) => Math.max(1, Math.min(5, Math.round(Number(v) || 5)));

    const payload = sanitizeFirestorePayload({
      id: existingByUser?.id || `erating_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      departmentId: 'ehud_merha_gibir',
      division: data.division,
      planScope: scope,
      programSheetId: data.programSheetId.trim().slice(0, 128),
      programTitle: data.programTitle.trim().slice(0, 250),
      programDateAmharic: data.programDateAmharic.trim().slice(0, 100),
      overallRating: clampScore(data.overallRating),
      spiritualDepthRating: clampScore(data.spiritualDepthRating),
      timeManagementRating: clampScore(data.timeManagementRating),
      organizationRating: clampScore(data.organizationRating),
      engagementRating: clampScore(data.engagementRating),
      strengths: data.strengths?.trim() ? data.strengths.trim().slice(0, 1000) : undefined,
      improvements: data.improvements?.trim() ? data.improvements.trim().slice(0, 1000) : undefined,
      raterId: existingByUser?.raterId || uid,
      raterName: existingByUser?.raterName || (currentUser.fullName || 'አባል').slice(0, 150),
      createdAt: existingByUser?.createdAt || nowIso,
      updatedAt: nowIso,
    }) as EhudProgramRating;

    setEhudRatings((prev) => {
      const exists = prev.some((r) => r.id === payload.id);
      const next = exists ? prev.map((r) => (r.id === payload.id ? payload : r)) : [payload, ...prev];
      persistLocalEhudRatings(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'ehud_program_ratings', payload.id), payload);
      } catch (error: any) {
        if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
          console.warn('Ehud rating saved locally; cloud sync requires deployed firestore.rules.');
          throw error;
        }
        handleFirestoreError(error, existingByUser ? OperationType.UPDATE : OperationType.CREATE, `ehud_program_ratings/${payload.id}`);
      }
    }

    return payload;
  };

  const deleteEhudProgramRating = async (ratingId: string): Promise<void> => {
    setEhudRatings((prev) => {
      const next = prev.filter((r) => r.id !== ratingId);
      persistLocalEhudRatings(next);
      return next;
    });

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'ehud_program_ratings', ratingId));
      } catch (error: any) {
        if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
          console.warn('Ehud rating deleted locally; cloud sync requires deployed firestore.rules.');
          throw error;
        }
        handleFirestoreError(error, OperationType.DELETE, `ehud_program_ratings/${ratingId}`);
      }
    }
  };

  const [departmentsList, setDepartmentsList] = useState<DepartmentInfo[]>(() => {
    try {
      const savedCustom = localStorage.getItem('mezgebe_custom_departments');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        return [...ALL_SUNDAY_SCHOOL_DEPARTMENTS, ...parsed];
      }
    } catch {
      // ignore
    }
    return ALL_SUNDAY_SCHOOL_DEPARTMENTS;
  });

  const addDepartment = async (newDept: Omit<DepartmentInfo, 'id'>): Promise<DepartmentInfo> => {
    const id = `dept_${Date.now()}`;
    const department: DepartmentInfo = {
      ...newDept,
      id,
      isCustom: true,
      status: newDept.status || 'ACTIVE',
    };
    setDepartmentsList((prev) => {
      const updated = [...prev, department];
      try {
        const customDepts = updated.filter((d) => d.isCustom);
        localStorage.setItem('mezgebe_custom_departments', JSON.stringify(customDepts));
      } catch {
        // ignore
      }
      return updated;
    });

    try {
      await setDoc(doc(db, 'departments', id), department);
    } catch {
      // non-blocking
    }
    return department;
  };

  const [selectedDivision, setSelectedDivision] = useState<SundaySchoolDivision>('children');
  const [themeMode, setThemeMode] = useState<AppThemeMode>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_theme_mode');
      if (saved === 'DARK' || saved === 'LIGHT') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'LIGHT'; // STRICTLY DEFAULT TO LIGHT MODE
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isRegisteringRef = useRef<boolean>(false);

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'u_default',
    fullName: 'ተጠቃሚ (Guest)',
    email: '',
    role: 'MEMBER',
    department: 'የሰንበት ት/ቤት አስተዳደር እና ኪነጥበብ ክፍል',
    joinedDate: '፳፻፲፮ ዓ.ም',
    myWorksCount: 0,
    mySubmissionsCount: 0,
    myBookmarksCount: 0,
  });

  // Department Memberships state
  const [departmentMemberships, setDepartmentMemberships] = useState<DepartmentMembership[]>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_dept_memberships');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DEPARTMENT_MEMBERSHIPS;
  });
  const [departmentInvites, setDepartmentInvites] = useState<DepartmentInvite[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [registeredUsersError, setRegisteredUsersError] = useState<string | null>(null);

  // Schedule Task Assignments state
  const [scheduleAssignments, setScheduleAssignments] = useState<ScheduleTaskAssignment[]>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_schedule_assignments');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SCHEDULE_ASSIGNMENTS;
  });

  // Department Notifications state
  const [departmentNotifications, setDepartmentNotifications] = useState<DepartmentNotification[]>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_dept_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DEPARTMENT_NOTIFICATIONS;
  });

  const [audioTracks] = useState<LiturgicalAudioTrack[]>(INITIAL_AUDIO_TRACKS);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<LiturgicalAudioTrack | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0.28);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => getCachedGoogleToken());
  const isGoogleDriveConnected = Boolean(googleAccessToken);

  const connectGoogleDrive = async (): Promise<string | null> => {
    try {
      const result = await signInWithPopup(auth, googleDriveProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedGoogleToken(credential.accessToken);
        setGoogleAccessToken(credential.accessToken);
        return credential.accessToken;
      }
      return null;
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return null;
      }
      console.warn('Google Drive auth notice:', err);
      throw err;
    }
  };

  const disconnectGoogleDrive = () => {
    setCachedGoogleToken(null);
    setGoogleAccessToken(null);
  };

  // Sync theme mode to document element (STRICTLY DEFAULT TO LIGHT)
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'DARK') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('mezgebe_theme_mode', themeMode);
    } catch {
      // ignore
    }
  }, [themeMode]);

  // Audio simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAudioPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 1) {
            setIsAudioPlaying(false);
            return 0;
          }
          return prev + 0.01;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isAudioPlaying]);

  // 1. Firebase Auth listener
  useEffect(() => {
    // Complete any pending redirect sign-in result cleanly if triggered in top-level tab
    void getRedirectResult(auth).catch((err) => {
      console.warn('Redirect sign-in notice:', err?.code || err?.message);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isVerifiedMasterEmail = Boolean(
          user.emailVerified && isMasterOperatorEmail(user.email)
        );
        const isMasterAdmin = isVerifiedMasterEmail;

        let loadedRole: UserRole = isMasterAdmin ? 'ADMIN' : 'MEMBER';
        let loadedFullName = user.displayName || user.email?.split('@')[0] || 'የኪነጥበብ አባል';
        let loadedDept = 'የተክለ ሣዊሮስ ሰንበት ት/ቤት ኪነጥበብ ክፍል';
        let loadedDeptId: SundaySchoolDepartment | undefined;
        let loadedSundaySchoolId: string | undefined;
        let loadedRequestedPosition: EhudDepartmentPosition | undefined;
        let loadedJoinedDate = '፳፻፲፱ ዓ.ም';

        const initialProfile: UserProfile = {
          id: user.uid,
          fullName: loadedFullName,
          email: user.email || '',
          role: loadedRole,
          department: loadedDept,
          departmentId: loadedDeptId,
          sundaySchoolId: loadedSundaySchoolId,
          requestedPosition: loadedRequestedPosition,
          joinedDate: loadedJoinedDate,
          myWorksCount: 0,
          mySubmissionsCount: 0,
          myBookmarksCount: 0,
        };
        setCurrentUser(initialProfile);
        setFirebaseUser(user);
        setIsAuthReady(true);

        let hasAdminDoc = false;
        if (isVerifiedMasterEmail) {
          try {
            const adminDocSnap = await getDoc(doc(db, 'admins', user.uid));
            hasAdminDoc = adminDocSnap.exists();
          } catch {
            hasAdminDoc = false;
          }
        }
        setIsAdminDocVerified(isVerifiedMasterEmail && hasAdminDoc);

        let userDocExists = false;
        try {
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          if (userDocSnap.exists()) {
            userDocExists = true;
            const data = userDocSnap.data();
            if (data.fullName) loadedFullName = data.fullName;
            if (data.role && !isMasterAdmin) loadedRole = data.role as UserRole;
            if (data.department) loadedDept = data.department;
            if (data.departmentId) loadedDeptId = data.departmentId as SundaySchoolDepartment;
            if (data.sundaySchoolId) loadedSundaySchoolId = String(data.sundaySchoolId);
            if (data.requestedPosition) loadedRequestedPosition = data.requestedPosition as EhudDepartmentPosition;
            if (data.joinedDate) loadedJoinedDate = data.joinedDate;

            setCurrentUser({
              id: user.uid,
              fullName: loadedFullName,
              email: user.email || '',
              role: loadedRole,
              department: loadedDept,
              departmentId: loadedDeptId,
              sundaySchoolId: loadedSundaySchoolId,
              requestedPosition: loadedRequestedPosition,
              joinedDate: loadedJoinedDate,
              myWorksCount: 0,
              mySubmissionsCount: 0,
              myBookmarksCount: 0,
            });
          }
        } catch {
          // Non-blocking read error
        }

        // Only create initial user doc if it does not yet exist and registration is not creating it
        try {
          if (!userDocExists && !isRegisteringRef.current) {
            await setDoc(
              doc(db, 'users', user.uid),
              sanitizeFirestorePayload({
                id: user.uid,
                fullName: loadedFullName,
                email: user.email || '',
                role: isMasterAdmin ? 'ADMIN' : 'MEMBER',
                department: loadedDept,
                joinedDate: loadedJoinedDate,
                bookmarks: [],
              })
            );
          }

          if (isMasterAdmin && !hasAdminDoc) {
            await setDoc(
              doc(db, 'admins', user.uid),
              {
                email: user.email,
                role: 'SUPER_ADMIN',
              },
              { merge: true }
            );
            setIsAdminDocVerified(true);
          }
        } catch {
          // Non-blocking user sync
        }

        if (!isRegisteringRef.current && user.email) {
          await claimMatchingInvitesForUser(
            user,
            loadedFullName,
            loadedSundaySchoolId,
            loadedRequestedPosition
          );
        }
      } else {
        setFirebaseUser(null);
        setIsAdminDocVerified(false);
        setIsAuthReady(true);
        const guestDeptInfo = departmentsList.find((d) => d.id === activeDepartment);
        setCurrentUser({
          id: 'u_default',
          fullName: 'ተጠቃሚ (Guest)',
          email: '',
          role: 'MEMBER',
          department: guestDeptInfo?.titleAmharic || 'የተክለ ሣዊሮስ ሰንበት ት/ቤት',
          departmentId: activeDepartment,
          joinedDate: '፳፻፲፱ ዓ.ም',
          myWorksCount: 0,
          mySubmissionsCount: 0,
          myBookmarksCount: 0,
        });
        setDepartmentMemberships([]);
        setDepartmentInvites([]);
        setRegisteredUsers([]);
        setRegisteredUsersError(null);
        setScheduleAssignments([]);
        setDepartmentNotifications([]);
        try {
          localStorage.removeItem('mezgebe_dept_memberships');
          localStorage.removeItem('mezgebe_schedule_assignments');
          localStorage.removeItem('mezgebe_dept_notifications');
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  // Sole Master Operator verification is declared above (`isSuperAdmin` / `isMasterOperator`).

  // 2. Real-time Firestore synchronization for Works (Public archive vs dept-scoped manager scope)
  useEffect(() => {
    const currentMem = firebaseUser
      ? departmentMemberships.find(
          (m) => m.id === getCanonicalMembershipId(firebaseUser.uid, activeDepartment)
        )
      : null;
    const isApprovedMemberInDept = currentMem?.status === 'APPROVED';
    const hasDeptManagePrivilege = Boolean(
      isSuperAdmin ||
        (isApprovedMemberInDept &&
          (currentMem?.role === 'ADMIN' ||
            currentMem?.canApproveMembers === true ||
            currentMem?.role === 'REVIEWER' ||
            currentMem?.role === 'EDITOR'))
    );

    if (isDepartmentPortalLocked) {
      setWorks((prev) => {
        const scoped = prev.filter((w) => w.departmentId === activeDepartment);
        if (scoped.length > 0) return scoped;
        return INITIAL_WORKS.filter((w) => w.departmentId === activeDepartment);
      });
    }

    let worksQuery;
    if (isDepartmentPortalLocked) {
      worksQuery =
        firebaseUser && hasDeptManagePrivilege
          ? query(collection(db, 'works'), where('departmentId', '==', activeDepartment))
          : query(
              collection(db, 'works'),
              where('departmentId', '==', activeDepartment),
              where('status', 'in', ['APPROVED', 'PUBLISHED'])
            );
    } else if (firebaseUser && isSuperAdmin) {
      worksQuery = collection(db, 'works');
    } else if (firebaseUser && isApprovedMemberInDept) {
      worksQuery = hasDeptManagePrivilege
        ? query(collection(db, 'works'), where('departmentId', '==', activeDepartment))
        : query(
            collection(db, 'works'),
            where('departmentId', '==', activeDepartment),
            where('status', 'in', ['APPROVED', 'PUBLISHED'])
          );
    } else {
      worksQuery = query(
        collection(db, 'works'),
        where('status', 'in', ['APPROVED', 'PUBLISHED'])
      );
    }

    const unsubscribe = onSnapshot(
      worksQuery,
      (snapshot) => {
        let savedBookmarks: string[] = [];
        try {
          const raw = localStorage.getItem('mezgebe_bookmarks');
          if (raw) savedBookmarks = JSON.parse(raw);
        } catch {
          // ignore
        }

        if (!snapshot.empty) {
          const fetchedWorks: WorkItem[] = [];
          snapshot.forEach((docSnap) => {
            const w = docSnap.data() as WorkItem;
            if (isDepartmentPortalLocked && w.departmentId !== activeDepartment) {
              return;
            }
            if (savedBookmarks.includes(w.id)) {
              w.isBookmarked = true;
            }
            fetchedWorks.push(w);
          });
          setWorks(fetchedWorks);
        } else if (isDepartmentPortalLocked || (firebaseUser && !isSuperAdmin)) {
          // Strict department isolation when Firestore works collection for this dept is empty
          setWorks(
            INITIAL_WORKS.filter((w) =>
              w.departmentId ? w.departmentId === activeDepartment : activeDepartment === 'kinetibeb'
            ).map((w) => (savedBookmarks.includes(w.id) ? { ...w, isBookmarked: true } : w))
          );
        } else if (firebaseUser && isSuperAdmin) {
          // Only super admin seeds initial works if Firestore collection is empty
          seedInitialFirestoreData();
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'works');
        } catch (err) {
          console.warn('Operating in offline/cached mode for works:', err);
        }
      }
    );

    return () => unsubscribe();
  }, [firebaseUser, activeDepartment, departmentMemberships, isSuperAdmin, isDepartmentPortalLocked]);

  // User's department memberships strictly keyed by authenticated UID
  const userMemberships = firebaseUser
    ? departmentMemberships.filter((m) => m.userId === firebaseUser.uid)
    : [];

  const approvedMemberships = isSuperAdmin
    ? departmentMemberships.filter((m) => m.status === 'APPROVED')
    : userMemberships.filter((m) => m.status === 'APPROVED');

  const approvedDepartmentsList = isDepartmentPortalLocked
    ? departmentsList.filter((dept) => dept.id === activeDepartment)
    : isSuperAdmin
      ? departmentsList
      : departmentsList.filter((dept) =>
          approvedMemberships.some((m) => m.departmentId === dept.id)
        );

  const activeMembership =
    userMemberships.find((m) => m.departmentId === activeDepartment) || null;

  const isDeptAdmin = Boolean(
    isSuperAdmin ||
    (activeMembership?.status === 'APPROVED' && activeMembership?.role === 'ADMIN')
  );

  const canApproveDeptMembers = Boolean(
    isSuperAdmin ||
    (activeMembership?.status === 'APPROVED' &&
      (activeMembership?.role === 'ADMIN' || activeMembership?.canApproveMembers === true))
  );

  const hasDeptMemberAuthPrivilege = (deptId: string): boolean => {
    if (isSuperAdmin) return true;
    return userMemberships.some(
      (m) =>
        m.departmentId === deptId &&
        m.status === 'APPROVED' &&
        (m.role === 'ADMIN' || m.canApproveMembers === true)
    );
  };

  const canSwitchDepartments = isDepartmentPortalLocked
    ? false
    : Boolean(isSuperAdmin || approvedDepartmentsList.length > 1);

  const hasPendingApproval = Boolean(
    firebaseUser &&
      !isSuperAdmin &&
      (!activeMembership || activeMembership.status !== 'APPROVED')
  );

  const firstUserMembershipDept = userMemberships[0]?.departmentId as
    | SundaySchoolDepartment
    | undefined;

  const assignedDepartmentId: SundaySchoolDepartment | null = isSuperAdmin
    ? null
    : ((approvedMemberships[0]?.departmentId ||
        firstUserMembershipDept ||
        (firebaseUser ? currentUser.departmentId : undefined) ||
        lockedDepartmentId ||
        null) as SundaySchoolDepartment | null);

  const isDepartmentLocked = (deptId: SundaySchoolDepartment): boolean => {
    if (isSuperAdmin) return false;
    if (!assignedDepartmentId) return false;
    return assignedDepartmentId !== deptId;
  };

  const loginAsMasterOperator = async (): Promise<FirebaseUser | null> => {
    try {
      const result = await signInWithPopup(auth, masterOperatorGoogleProvider);
      return result.user;
    } catch (error: any) {
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
      if (
        !isInIframe &&
        (error?.code === 'auth/popup-blocked' ||
          error?.code === 'auth/operation-not-supported-in-this-environment')
      ) {
        await signInWithRedirect(auth, masterOperatorGoogleProvider);
        return null;
      }
      console.warn('Master Operator Sign-In notice:', error?.code || error?.message || error);
      throw error;
    }
  };

  // Automatically lock & route non-Master-Operator users into their sole assigned department
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || isSuperAdmin) return;
    const targetDept = (approvedMemberships[0]?.departmentId ||
      userMemberships[0]?.departmentId ||
      currentUser.departmentId) as SundaySchoolDepartment | undefined;
    if (!targetDept) return;
    if (lockedDepartmentId !== targetDept || activeDepartment !== targetDept) {
      persistActiveAndLockedDept(targetDept, true);
    }
  }, [isAuthReady, firebaseUser, isSuperAdmin, userMemberships, approvedMemberships, currentUser.departmentId, activeDepartment, lockedDepartmentId]);

  // 3. Real-time Firestore synchronization for Members (Department-scoped & authenticated)
  useEffect(() => {
    const scopeInitialMembers = () =>
      isDepartmentPortalLocked
        ? INITIAL_MEMBERS.filter((m) => m.departmentId === activeDepartment)
        : INITIAL_MEMBERS;

    if (!isAuthReady || !firebaseUser) {
      setMembers(scopeInitialMembers());
      return;
    }

    const isApprovedInDept = isSuperAdmin || activeMembership?.status === 'APPROVED';
    if (!isApprovedInDept) {
      if (isDepartmentPortalLocked) {
        setMembers(INITIAL_MEMBERS.filter((m) => m.departmentId === activeDepartment));
      }
      return;
    }

    const strictDeptOnly = isDepartmentPortalLocked || !isSuperAdmin;
    if (strictDeptOnly) {
      setMembers(
        INITIAL_MEMBERS.filter((m) =>
          m.departmentId ? m.departmentId === activeDepartment : activeDepartment === 'kinetibeb'
        )
      );
    }

    const membersQuery = strictDeptOnly
      ? query(collection(db, 'members'), where('departmentId', '==', activeDepartment))
      : collection(db, 'members');

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedMembers: ChurchMember[] = [];
          snapshot.forEach((docSnap) => {
            const m = docSnap.data() as ChurchMember;
            if (strictDeptOnly && m.departmentId !== activeDepartment) return;
            fetchedMembers.push(m);
          });
          setMembers((prev) => {
            const base = strictDeptOnly
              ? prev.filter((m) =>
                  m.departmentId
                    ? m.departmentId === activeDepartment
                    : activeDepartment === 'kinetibeb'
                )
              : prev;
            const map = new Map(base.map((m) => [m.id, m]));
            for (const m of fetchedMembers) {
              map.set(m.id, m);
            }
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'members');
        } catch (err) {
          console.warn('Operating in offline/cached mode for members:', err);
        }
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, firebaseUser, activeDepartment, activeMembership?.status, isSuperAdmin, isDepartmentPortalLocked]);

  // 4. Real-time Firestore synchronization for Events (Department-scoped & authenticated)
  useEffect(() => {
    const scopeInitialEvents = () =>
      isDepartmentPortalLocked
        ? INITIAL_EVENTS.filter((e) => e.departmentId === activeDepartment)
        : INITIAL_EVENTS;

    if (!isAuthReady || !firebaseUser) {
      setEvents(scopeInitialEvents());
      return;
    }

    const isApprovedInDept = isSuperAdmin || activeMembership?.status === 'APPROVED';
    if (!isApprovedInDept) {
      if (isDepartmentPortalLocked) {
        setEvents(INITIAL_EVENTS.filter((e) => e.departmentId === activeDepartment));
      }
      return;
    }

    const strictDeptOnly = isDepartmentPortalLocked || !isSuperAdmin;
    if (strictDeptOnly) {
      setEvents(
        INITIAL_EVENTS.filter((e) =>
          e.departmentId ? e.departmentId === activeDepartment : activeDepartment === 'kinetibeb'
        )
      );
    }

    const eventsQuery = strictDeptOnly
      ? query(collection(db, 'events'), where('departmentId', '==', activeDepartment))
      : collection(db, 'events');

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedEvents: CulturalEvent[] = [];
          snapshot.forEach((docSnap) => {
            const e = docSnap.data() as CulturalEvent;
            if (strictDeptOnly && e.departmentId !== activeDepartment) return;
            fetchedEvents.push(e);
          });
          setEvents((prev) => {
            const base = strictDeptOnly
              ? prev.filter((e) =>
                  e.departmentId
                    ? e.departmentId === activeDepartment
                    : activeDepartment === 'kinetibeb'
                )
              : prev;
            const map = new Map(base.map((e) => [e.id, e]));
            for (const e of fetchedEvents) {
              map.set(e.id, e);
            }
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'events');
        } catch (err) {
          console.warn('Operating in offline/cached mode for events:', err);
        }
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, firebaseUser, activeDepartment, activeMembership?.status, isSuperAdmin, isDepartmentPortalLocked]);

  // 4b. Real-time Firestore synchronization for Sunday Daily Plan Sheets (Ehud Merha Gibir)
  useEffect(() => {
    if (!isAuthReady) return;

    const unsubscribe = onSnapshot(
      collection(db, 'sunday_daily_sheets'),
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedSheets: SundayDailyPlanSheet[] = [];
          snapshot.forEach((docSnap) => {
            fetchedSheets.push(docSnap.data() as SundayDailyPlanSheet);
          });
          setDailyPlanSheets(() => {
            const merged = mergeDailySheets(INITIAL_DAILY_PLAN_SHEETS, fetchedSheets);
            persistLocalDailySheets(merged);
            return merged;
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'sunday_daily_sheets');
        } catch (err) {
          console.warn('Operating in offline/cached mode for sunday_daily_sheets:', err);
        }
      }
    );

    return () => unsubscribe();
  }, [isAuthReady]);

  // 4c. Real-time Firestore synchronization for Ehud Merha Gibir Planning, Following & Ratings
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) return;
    if (activeDepartment !== 'ehud_merha_gibir' && !isSuperAdmin) return;

    const plansQuery = query(
      collection(db, 'ehud_program_plans'),
      where('departmentId', '==', 'ehud_merha_gibir')
    );
    const unsubPlans = onSnapshot(
      plansQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: EhudProgramPlan[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push(docSnap.data() as EhudProgramPlan);
          });
          setEhudPlans((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            for (const item of fetched) {
              map.set(item.id, item);
            }
            const merged = Array.from(map.values()).sort((a, b) =>
              b.updatedAt.localeCompare(a.updatedAt)
            );
            persistLocalEhudPlans(merged);
            return merged;
          });
        }
      },
      (error) => {
        console.warn('Operating in local/cached mode for ehud_program_plans:', error?.message || error);
      }
    );

    const followUpsQuery = query(
      collection(db, 'ehud_followups'),
      where('departmentId', '==', 'ehud_merha_gibir')
    );
    const unsubFollowUps = onSnapshot(
      followUpsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: EhudFollowUpRecord[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push(docSnap.data() as EhudFollowUpRecord);
          });
          setEhudFollowUps((prev) => {
            const map = new Map(prev.map((f) => [f.id, f]));
            for (const item of fetched) {
              map.set(item.id, item);
            }
            const merged = Array.from(map.values()).sort((a, b) =>
              b.updatedAt.localeCompare(a.updatedAt)
            );
            persistLocalEhudFollowUps(merged);
            return merged;
          });
        }
      },
      (error) => {
        console.warn('Operating in local/cached mode for ehud_followups:', error?.message || error);
      }
    );

    const ratingsQuery = query(
      collection(db, 'ehud_program_ratings'),
      where('departmentId', '==', 'ehud_merha_gibir')
    );
    const unsubRatings = onSnapshot(
      ratingsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: EhudProgramRating[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push(docSnap.data() as EhudProgramRating);
          });
          setEhudRatings((prev) => {
            const map = new Map(prev.map((r) => [r.id, r]));
            for (const item of fetched) {
              map.set(item.id, item);
            }
            const merged = Array.from(map.values()).sort((a, b) =>
              b.updatedAt.localeCompare(a.updatedAt)
            );
            persistLocalEhudRatings(merged);
            return merged;
          });
        }
      },
      (error) => {
        console.warn('Operating in local/cached mode for ehud_program_ratings:', error?.message || error);
      }
    );

    return () => {
      unsubPlans();
      unsubFollowUps();
      unsubRatings();
    };
  }, [isAuthReady, firebaseUser, activeDepartment, isSuperAdmin]);

  // 5. Real-time Firestore synchronization for Department Memberships (Authenticated & Scoped)
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) {
      setDepartmentMemberships([]);
      return;
    }

    if (isSuperAdmin) {
      // Run idempotent migration for existing records only under super admin session
      migrateDepartmentMemberships(db).catch((err) => {
        console.warn('[Membership Migration Notice]', err);
      });
    }

    let unsubUser: (() => void) | null = null;
    let unsubDept: (() => void) | null = null;

    // A. Query current user's memberships
    const userQuery = query(
      collection(db, 'department_memberships'),
      where('userId', '==', firebaseUser.uid)
    );

    unsubUser = onSnapshot(
      userQuery,
      (snapshot) => {
        const userDocs: DepartmentMembership[] = [];
        snapshot.forEach((docSnap) => {
          userDocs.push(docSnap.data() as DepartmentMembership);
        });
        setDepartmentMemberships((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          for (const d of userDocs) {
            map.set(d.id, d);
          }
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'department_memberships');
        } catch (err) {
          console.warn('Offline mode for user memberships:', err);
        }
      }
    );

    // B. If user is super admin, department admin, or member-authorizer, subscribe to department roster
    const hasRosterPrivilege = isSuperAdmin || isDeptAdmin || canApproveDeptMembers;

    if (hasRosterPrivilege) {
      const deptQuery =
        isSuperAdmin && !isDepartmentPortalLocked
          ? collection(db, 'department_memberships')
          : query(collection(db, 'department_memberships'), where('departmentId', '==', activeDepartment));

      unsubDept = onSnapshot(
        deptQuery,
        (snapshot) => {
          const deptDocs: DepartmentMembership[] = [];
          snapshot.forEach((docSnap) => {
            deptDocs.push(docSnap.data() as DepartmentMembership);
          });
          setDepartmentMemberships((prev) => {
            const map = new Map(prev.map((m) => [m.id, m]));
            for (const d of deptDocs) {
              map.set(d.id, d);
            }
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.LIST, 'department_memberships');
          } catch (err) {
            console.warn('Offline mode for dept memberships:', err);
          }
        }
      );
    }

    return () => {
      if (unsubUser) unsubUser();
      if (unsubDept) unsubDept();
    };
  }, [isAuthReady, firebaseUser, activeDepartment, isSuperAdmin, isDeptAdmin, canApproveDeptMembers, isDepartmentPortalLocked]);

  // 5b. Real-time Firestore synchronization for Registered Users (Super Admin only)
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !isSuperAdmin) {
      setRegisteredUsers([]);
      setRegisteredUsersError(null);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const fetched: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<UserProfile>;
          fetched.push({
            id: data.id || docSnap.id,
            fullName: data.fullName || data.email || 'ተጠቃሚ',
            email: data.email || '',
            role: (data.role as UserRole) || 'MEMBER',
            department: data.department || '',
            departmentId: data.departmentId,
            sundaySchoolId: data.sundaySchoolId,
            requestedPosition: data.requestedPosition,
            joinedDate: data.joinedDate || '፳፻፲፱ ዓ.ም',
            myWorksCount: 0,
            mySubmissionsCount: 0,
            myBookmarksCount: 0,
          });
        });
        setRegisteredUsers(fetched);
        setRegisteredUsersError(null);
      },
      (error) => {
        console.warn('Registered users listener notice:', error);
        setRegisteredUsersError(error?.message || 'Unable to load registered users.');
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, firebaseUser, isSuperAdmin]);

  // 5c. Real-time Firestore synchronization for Department Invites / Email Pre-Approvals
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || (!isSuperAdmin && !isDeptAdmin && !canApproveDeptMembers)) {
      setDepartmentInvites([]);
      return;
    }

    const invitesQuery =
      isSuperAdmin && !isDepartmentPortalLocked
        ? collection(db, 'department_invites')
        : query(collection(db, 'department_invites'), where('departmentId', '==', activeDepartment));

    const unsubscribe = onSnapshot(
      invitesQuery,
      (snapshot) => {
        const fetched: DepartmentInvite[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push(docSnap.data() as DepartmentInvite);
        });
        setDepartmentInvites(fetched);
      },
      (error) => {
        console.warn('Department invites listener notice:', error);
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, firebaseUser, activeDepartment, isSuperAdmin, isDeptAdmin, canApproveDeptMembers, isDepartmentPortalLocked]);

  // 6. Real-time Firestore synchronization for Schedule Assignments (Department & Member Scoped)
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) {
      setScheduleAssignments([]);
      return;
    }

    const currentCanonicalId = getCanonicalMembershipId(firebaseUser.uid, activeDepartment);
    const currentMem = departmentMemberships.find((m) => m.id === currentCanonicalId);
    const isApproved = currentMem?.status === 'APPROVED';
    const isAdminOfDept =
      isSuperAdmin ||
      (isApproved && (currentMem?.role === 'ADMIN' || currentMem?.canApproveMembers === true));

    if (!isSuperAdmin && !isApproved) {
      // Pending, rejected, or non-members cannot read department schedule assignments
      setScheduleAssignments([]);
      return;
    }

    let assignmentsQuery;
    if (isAdminOfDept) {
      assignmentsQuery = query(
        collection(db, 'schedule_assignments'),
        where('departmentId', '==', activeDepartment)
      );
    } else {
      assignmentsQuery = query(
        collection(db, 'schedule_assignments'),
        where('departmentId', '==', activeDepartment),
        where('assignedMemberIds', 'array-contains', firebaseUser.uid)
      );
    }

    const unsubscribe = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const fetched: ScheduleTaskAssignment[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push(docSnap.data() as ScheduleTaskAssignment);
        });
        setScheduleAssignments(fetched);
        try {
          localStorage.setItem('mezgebe_schedule_assignments', JSON.stringify(fetched));
        } catch {}
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'schedule_assignments');
        } catch (err) {
          console.warn('Operating in offline/cached mode for schedule assignments:', err);
        }
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, firebaseUser, activeDepartment, departmentMemberships, isSuperAdmin]);

  // 7. Real-time Firestore synchronization for Department Notifications (Targeted to user)
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) {
      setDepartmentNotifications([]);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'department_notifications'),
      where('targetUserId', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const fetched: DepartmentNotification[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push(docSnap.data() as DepartmentNotification);
        });
        setDepartmentNotifications(fetched);
        try {
          localStorage.setItem('mezgebe_dept_notifications', JSON.stringify(fetched));
        } catch {}
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'department_notifications');
        } catch (err) {
          console.warn('Operating in offline/cached mode for notifications:', err);
        }
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, firebaseUser]);

  // Seed initial church data to Cloud Firestore if empty
  const seedInitialFirestoreData = async () => {
    try {
      for (const w of INITIAL_WORKS) {
        await setDoc(doc(db, 'works', w.id), w, { merge: true });
      }
      for (const m of INITIAL_MEMBERS) {
        await setDoc(doc(db, 'members', m.id), m, { merge: true });
      }
      for (const ev of INITIAL_EVENTS) {
        await setDoc(doc(db, 'events', ev.id), ev, { merge: true });
      }
      if (firebaseUser) {
        for (const mem of INITIAL_DEPARTMENT_MEMBERSHIPS) {
          await setDoc(doc(db, 'department_memberships', mem.id), mem, { merge: true });
        }
        for (const asgn of INITIAL_SCHEDULE_ASSIGNMENTS) {
          await setDoc(doc(db, 'schedule_assignments', asgn.id), asgn, { merge: true });
        }
        for (const notif of INITIAL_DEPARTMENT_NOTIFICATIONS) {
          await setDoc(doc(db, 'department_notifications', notif.id), notif, { merge: true });
        }
      }
    } catch {
      // Non-blocking initial seeding
    }
  };

  const claimMatchingInvitesForUser = async (
    user: FirebaseUser,
    fallbackFullName: string,
    fallbackSundaySchoolId?: string,
    fallbackRequestedPosition?: EhudDepartmentPosition
  ): Promise<DepartmentMembership[]> => {
    const claimedMemberships: DepartmentMembership[] = [];
    if (!user.email) return claimedMemberships;
    const emailLower = user.email.trim().toLowerCase();

    try {
      const inviteSnap = await getDocs(
        query(collection(db, 'department_invites'), where('emailLower', '==', emailLower))
      );

      for (const invDoc of inviteSnap.docs) {
        const inv = invDoc.data() as DepartmentInvite;
        if (inv.status !== 'ACTIVE') continue;

        const membershipId = getCanonicalMembershipId(user.uid, inv.departmentId);
        const existingRef = doc(db, 'department_memberships', membershipId);
        let existingData: Partial<DepartmentMembership> | undefined;
        try {
          const existingSnap = await getDoc(existingRef);
          if (existingSnap.exists()) {
            existingData = existingSnap.data() as Partial<DepartmentMembership>;
          }
        } catch {
          // proceed with new membership payload
        }

        const nowIso = new Date().toISOString();
        const nowEth = 'ጥቅምት 2019 ዓ.ም.';
        const deptInfo = departmentsList.find((d) => d.id === inv.departmentId);

        const membershipRecord: DepartmentMembership = {
          id: membershipId,
          userId: user.uid,
          userEmail: user.email || '',
          userName: fallbackFullName || existingData?.userName || inv.fullName,
          departmentId: inv.departmentId,
          departmentName: inv.departmentName || deptInfo?.titleAmharic || inv.departmentId,
          division: inv.division || existingData?.division || 'youth',
          sundaySchoolId: inv.sundaySchoolId || fallbackSundaySchoolId || existingData?.sundaySchoolId,
          requestedPosition:
            inv.requestedPosition || fallbackRequestedPosition || existingData?.requestedPosition,
          serviceSkills: existingData?.serviceSkills || [],
          preferredResponsibilities: existingData?.preferredResponsibilities || '',
          role: inv.role,
          ...(inv.canApproveMembers ? { canApproveMembers: true } : {}),
          status: 'APPROVED',
          inviteId: inv.id,
          approvedBy: inv.invitedBy,
          approvedByName: inv.invitedByName || 'አስተዳዳሪ',
          approvedAt: nowEth,
          statusUpdatedAt: nowIso,
          createdAt: existingData?.createdAt || nowIso,
        };

        await setDoc(existingRef, sanitizeFirestorePayload(membershipRecord));
        await updateDoc(doc(db, 'department_invites', inv.id), {
          status: 'CLAIMED',
          claimedBy: user.uid,
          claimedAt: nowIso,
        });

        claimedMemberships.push(membershipRecord);
      }

      if (claimedMemberships.length > 0) {
        setDepartmentMemberships((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          for (const cm of claimedMemberships) {
            map.set(cm.id, cm);
          }
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.warn('Invite claim check notice:', err);
    }

    return claimedMemberships;
  };

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
      if (
        !isInIframe &&
        (error?.code === 'auth/popup-blocked' ||
          error?.code === 'auth/operation-not-supported-in-this-environment')
      ) {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      console.warn('Google Sign-In notice:', error?.code || error?.message || error);
      throw error;
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'CONTRIBUTOR',
    requestedDeptId?: string,
    division?: SundaySchoolDivision,
    serviceSkills?: string[],
    preferredResponsibilities?: string,
    sundaySchoolId?: string,
    requestedPosition?: EhudDepartmentPosition
  ) => {
    isRegisteringRef.current = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      if (fullName.trim()) {
        try {
          await updateProfile(user, { displayName: fullName.trim() });
        } catch {
          // non-blocking
        }
      }
      const isMasterAdmin = Boolean(
        user.emailVerified && isMasterOperatorEmail(user.email)
      );

      const targetDeptId = (requestedDeptId || lockedDepartmentId || activeDepartment || 'kinetibeb') as SundaySchoolDepartment;
      if (!isMasterAdmin) {
        persistActiveAndLockedDept(targetDeptId, true);
      }
      const deptInfo = departmentsList.find((d) => d.id === targetDeptId);
      const cleanSundaySchoolId = sundaySchoolId?.trim() || undefined;

      // Self-registration must always start with a non-privileged base role ('MEMBER' or 'CONTRIBUTOR')
      // unless the account is a verified master admin.
      const safeSelfRole: UserRole = isMasterAdmin
        ? 'ADMIN'
        : targetDeptId === 'ehud_merha_gibir'
        ? 'MEMBER'
        : role === 'CONTRIBUTOR'
        ? 'CONTRIBUTOR'
        : 'MEMBER';

      const newProfile: UserProfile = {
        id: user.uid,
        fullName: fullName.trim() || user.email?.split('@')[0] || 'አባል',
        email: user.email || '',
        role: safeSelfRole,
        department: deptInfo?.titleAmharic || 'የተክለ ሣዊሮስ ሰንበት ት/ቤት',
        departmentId: targetDeptId,
        sundaySchoolId: cleanSundaySchoolId,
        requestedPosition,
        joinedDate: '፳፻፲፱ ዓ.ም',
        myWorksCount: 0,
        mySubmissionsCount: 0,
        myBookmarksCount: 0,
      };
      setCurrentUser(newProfile);

      // Create department membership request with canonical ID {userId}_{deptId}
      const membershipId = getCanonicalMembershipId(user.uid, targetDeptId);
      const nowIso = new Date().toISOString();
      const newMembership: DepartmentMembership = {
        id: membershipId,
        userId: user.uid,
        userEmail: user.email || '',
        userName: newProfile.fullName,
        departmentId: targetDeptId,
        departmentName: deptInfo?.titleAmharic || targetDeptId,
        division: division || selectedDivision || 'youth',
        sundaySchoolId: cleanSundaySchoolId,
        requestedPosition,
        serviceSkills: targetDeptId === 'ehud_merha_gibir' ? [] : serviceSkills || [],
        preferredResponsibilities:
          targetDeptId === 'ehud_merha_gibir' ? '' : preferredResponsibilities || '',
        role: safeSelfRole,
        status: isMasterAdmin ? 'APPROVED' : 'PENDING',
        createdAt: nowIso,
        ...(isMasterAdmin
          ? {
              approvedBy: user.uid,
              approvedByName: 'የበላይ አስተዳደር',
              approvedAt: nowIso,
            }
          : {}),
      };

      const sanitizedProfilePayload = sanitizeFirestorePayload({
        id: user.uid,
        fullName: newProfile.fullName,
        email: newProfile.email,
        role: safeSelfRole,
        department: newProfile.department,
        departmentId: targetDeptId,
        sundaySchoolId: cleanSundaySchoolId,
        requestedPosition,
        joinedDate: newProfile.joinedDate,
        bookmarks: [],
      });

      const sanitizedMembership = sanitizeFirestorePayload(newMembership);

      await setDoc(doc(db, 'users', user.uid), sanitizedProfilePayload);
      await setDoc(doc(db, 'department_memberships', membershipId), sanitizedMembership);

      if (isMasterAdmin) {
        await setDoc(
          doc(db, 'admins', user.uid),
          {
            email: user.email,
            role: 'SUPER_ADMIN',
          },
          { merge: true }
        );
        setIsAdminDocVerified(true);
      }

      setDepartmentMemberships((prev) => [newMembership, ...prev.filter((m) => m.id !== membershipId)]);

      await claimMatchingInvitesForUser(
        user,
        newProfile.fullName,
        cleanSundaySchoolId,
        requestedPosition
      );
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const requestDepartmentMembership = async (
    deptId: string,
    division?: SundaySchoolDivision,
    serviceSkills?: string[],
    preferredResponsibilities?: string,
    sundaySchoolId?: string,
    requestedPosition?: EhudDepartmentPosition
  ): Promise<DepartmentMembership> => {
    if (!auth.currentUser) {
      throw new Error('Authentication required to submit membership request.');
    }
    const user = auth.currentUser;
    if (!isSuperAdmin && userMemberships.length > 0 && !userMemberships.some((m) => m.departmentId === deptId)) {
      throw new Error('በሰንበት ት/ቤት ደንብ መሠረት በአንድ ክፍል ብቻ መመዝገብ ይችላሉ።');
    }
    const dept = departmentsList.find((d) => d.id === deptId);
    const membershipId = getCanonicalMembershipId(user.uid, deptId);
    const isSuper = isSuperAdmin;
    const nowIso = new Date().toISOString();
    const cleanSundaySchoolId = sundaySchoolId?.trim() || currentUser.sundaySchoolId || undefined;
    if (!isSuperAdmin) {
      persistActiveAndLockedDept(deptId as SundaySchoolDepartment, true);
    }

    const newMembership: DepartmentMembership = {
      id: membershipId,
      userId: user.uid,
      userEmail: user.email || '',
      userName: currentUser.fullName || user.displayName || 'አባል',
      departmentId: deptId,
      departmentName: dept?.titleAmharic || deptId,
      division: division || selectedDivision || 'youth',
      sundaySchoolId: cleanSundaySchoolId,
      requestedPosition,
      serviceSkills: deptId === 'ehud_merha_gibir' ? [] : serviceSkills || [],
      preferredResponsibilities:
        deptId === 'ehud_merha_gibir' ? '' : preferredResponsibilities || '',
      role: isSuper ? 'ADMIN' : 'MEMBER',
      status: isSuper ? 'APPROVED' : 'PENDING',
      createdAt: nowIso,
      ...(isSuper
        ? {
            approvedBy: user.uid,
            approvedByName: 'የበላይ አስተዳደር',
            approvedAt: nowIso,
          }
        : {}),
    };

    const sanitized = sanitizeFirestorePayload(newMembership);
    // Await database write first
    await setDoc(doc(db, 'department_memberships', membershipId), sanitized);

    setDepartmentMemberships((prev) => {
      const filtered = prev.filter((m) => m.id !== membershipId);
      const updated = [newMembership, ...filtered];
      try {
        localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Notify admins
    await addDepartmentNotification({
      departmentId: deptId,
      departmentTitle: dept?.titleAmharic || deptId,
      title: 'አዲስ የአባልነት ማመልከቻ ደርሷል',
      message: `${currentUser.fullName} ወደ «${dept?.titleAmharic || deptId}» ለመቀላቀል የአባልነት ማመልከቻ አስገብተዋል።`,
      type: 'MEMBERSHIP_STATUS',
      relatedId: membershipId,
    });

    return newMembership;
  };

  const approveMembershipRequest = async (
    membershipId: string,
    assignedRole: UserRole,
    ehudPosition?: EhudDepartmentPosition,
    canApproveMembers?: boolean
  ): Promise<void> => {
    const target = departmentMemberships.find((m) => m.id === membershipId);
    if (!target) throw new Error('Membership record not found');

    if (!hasDeptMemberAuthPrivilege(target.departmentId)) {
      throw new Error('You are only authorized to approve members in your assigned department.');
    }

    // Only Super Admin can appoint ADMIN role or change existing ADMIN
    if ((assignedRole === 'ADMIN' || target.role === 'ADMIN') && !isSuperAdmin) {
      throw new Error('Only super administrators can appoint or modify department administrators.');
    }

    const nowEth = 'ጥቅምት 2019 ዓ.ም.';
    const nowIso = new Date().toISOString();
    const finalRequestedPosition = ehudPosition || target.requestedPosition;
    const finalCanApprove = isSuperAdmin
      ? canApproveMembers !== undefined
        ? canApproveMembers
        : target.canApproveMembers
      : target.canApproveMembers;

    const updated: DepartmentMembership = {
      ...target,
      role: assignedRole,
      requestedPosition: finalRequestedPosition,
      ...(finalCanApprove !== undefined ? { canApproveMembers: finalCanApprove } : {}),
      status: 'APPROVED',
      approvedBy: auth.currentUser?.uid || currentUser.id,
      approvedByName: currentUser.fullName,
      approvedAt: nowEth,
      statusUpdatedAt: nowIso,
    };
    delete (updated as any).rejectionReason;

    const sanitized = sanitizeFirestorePayload(updated);
    // Await Firestore success before updating UI state
    await setDoc(doc(db, 'department_memberships', membershipId), sanitized);

    setDepartmentMemberships((prev) => {
      const next = prev.map((m) => (m.id === membershipId ? updated : m));
      try {
        localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(next));
      } catch {}
      return next;
    });

    const roleDisplay =
      target.departmentId === 'ehud_merha_gibir' && finalRequestedPosition
        ? `${EHUD_DEPARTMENT_POSITIONS[finalRequestedPosition].rank}ኛ. ${EHUD_DEPARTMENT_POSITIONS[finalRequestedPosition].amharicTitle} (${EHUD_DEPARTMENT_POSITIONS[finalRequestedPosition].englishTitle})`
        : assignedRole;

    await addDepartmentNotification({
      departmentId: target.departmentId,
      departmentTitle: target.departmentName,
      targetUserId: target.userId,
      title: 'የአባልነት ማመልከቻዎ ጸድቋል!',
      message: `እንኳን ደስ አሎት! ወደ «${target.departmentName}» ያቀረቡት የአባልነት ጥያቄ ተቀባይነት አግኝቷል። ሚናዎ፦ ${roleDisplay} ሆኖ ተመድቧል።`,
      type: 'MEMBERSHIP_STATUS',
      relatedId: membershipId,
    });
  };

  const appointUserToDepartment = async (
    userProfile: UserProfile,
    deptId: string,
    assignedRole: UserRole,
    ehudPosition?: EhudDepartmentPosition,
    canApproveMembers?: boolean
  ): Promise<void> => {
    if (!isSuperAdmin) {
      throw new Error('Only super administrators can appoint registered users directly.');
    }
    const dept = departmentsList.find((d) => d.id === deptId);
    const membershipId = getCanonicalMembershipId(userProfile.id, deptId);
    const nowEth = 'ጥቅምት 2019 ዓ.ም.';
    const nowIso = new Date().toISOString();
    const existing = departmentMemberships.find((m) => m.id === membershipId);
    const finalRequestedPosition =
      ehudPosition || userProfile.requestedPosition || existing?.requestedPosition;
    const finalCanApprove =
      canApproveMembers !== undefined ? canApproveMembers : existing?.canApproveMembers;

    const membershipRecord: DepartmentMembership = {
      id: membershipId,
      userId: userProfile.id,
      userEmail: userProfile.email || existing?.userEmail || '',
      userName: userProfile.fullName || existing?.userName || userProfile.email || 'አባል',
      departmentId: deptId,
      departmentName: dept?.titleAmharic || deptId,
      division: existing?.division || 'youth',
      sundaySchoolId: userProfile.sundaySchoolId || existing?.sundaySchoolId,
      requestedPosition: finalRequestedPosition,
      serviceSkills: existing?.serviceSkills || [],
      preferredResponsibilities: existing?.preferredResponsibilities || '',
      role: assignedRole,
      ...(finalCanApprove !== undefined ? { canApproveMembers: finalCanApprove } : {}),
      status: 'APPROVED',
      approvedBy: auth.currentUser?.uid || currentUser.id,
      approvedByName: currentUser.fullName,
      approvedAt: nowEth,
      statusUpdatedAt: nowIso,
      createdAt: existing?.createdAt || nowIso,
    };

    const sanitized = sanitizeFirestorePayload(membershipRecord);
    await setDoc(doc(db, 'department_memberships', membershipId), sanitized);

    setDepartmentMemberships((prev) => {
      const next = [membershipRecord, ...prev.filter((m) => m.id !== membershipId)];
      try {
        localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(next));
      } catch {}
      return next;
    });

    const roleDisplay =
      deptId === 'ehud_merha_gibir' && finalRequestedPosition
        ? `${EHUD_DEPARTMENT_POSITIONS[finalRequestedPosition].rank}ኛ. ${EHUD_DEPARTMENT_POSITIONS[finalRequestedPosition].amharicTitle} (${EHUD_DEPARTMENT_POSITIONS[finalRequestedPosition].englishTitle})`
        : assignedRole;

    await addDepartmentNotification({
      departmentId: deptId,
      departmentTitle: dept?.titleAmharic || deptId,
      targetUserId: userProfile.id,
      title: 'የአባልነት ፈቃድ ተሰጥቶዎታል!',
      message: `ወደ «${dept?.titleAmharic || deptId}» አባልነትዎ ጸድቋል። ሚናዎ፦ ${roleDisplay} ሆኖ ተመድቧል።`,
      type: 'MEMBERSHIP_STATUS',
      relatedId: membershipId,
    });
  };

  const toggleMemberApprovalAuthority = async (
    membershipId: string,
    allow: boolean
  ): Promise<void> => {
    if (!isSuperAdmin) {
      throw new Error('Only super administrators can grant or revoke member confirmation authority.');
    }
    const target = departmentMemberships.find((m) => m.id === membershipId);
    if (!target) throw new Error('Membership record not found');

    const nowIso = new Date().toISOString();
    const updated: DepartmentMembership = {
      ...target,
      canApproveMembers: allow,
      statusUpdatedAt: nowIso,
    };

    const sanitized = sanitizeFirestorePayload(updated);
    await setDoc(doc(db, 'department_memberships', membershipId), sanitized);

    setDepartmentMemberships((prev) => {
      const next = prev.map((m) => (m.id === membershipId ? updated : m));
      try {
        localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(next));
      } catch {}
      return next;
    });

    await addDepartmentNotification({
      departmentId: target.departmentId,
      departmentTitle: target.departmentName,
      targetUserId: target.userId,
      title: allow
        ? 'የአባላት ማረጋገጫ ፈቃድ ተሰጥቶዎታል'
        : 'የአባላት ማረጋገጫ ፈቃድ ተነስቷል',
      message: allow
        ? `በ«${target.departmentName}» ውስጥ ብቻ አዳዲስ አባላትን የማረጋገጥና የማጽደቅ ሥልጣን ተሰጥቶዎታል።`
        : `በ«${target.departmentName}» ውስጥ የነበረዎት የአባላት ማረጋገጫ ፈቃድ በበላይ አስተዳደር ተነስቷል።`,
      type: 'MEMBERSHIP_STATUS',
      relatedId: membershipId,
    });
  };

  const createDepartmentInvite = async (data: {
    email: string;
    fullName: string;
    departmentId: string;
    role: UserRole;
    division?: SundaySchoolDivision;
    sundaySchoolId?: string;
    requestedPosition?: EhudDepartmentPosition;
    canApproveMembers?: boolean;
  }): Promise<{ invite: DepartmentInvite; immediatelyApproved: boolean }> => {
    if (!auth.currentUser) {
      throw new Error('Authentication required.');
    }
    if (!hasDeptMemberAuthPrivilege(data.departmentId)) {
      throw new Error('You can only pre-approve members for your authorized department.');
    }
    if (data.role === 'ADMIN' && !isSuperAdmin) {
      throw new Error('Only super administrators can appoint department administrators.');
    }
    if (data.canApproveMembers && !isSuperAdmin) {
      throw new Error('Only super administrators can grant member-authorization authority.');
    }

    const emailLower = data.email.trim().toLowerCase();
    if (!emailLower || !emailLower.includes('@')) {
      throw new Error('እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ።');
    }
    const cleanFullName = data.fullName.trim();
    if (!cleanFullName) {
      throw new Error('እባክዎ የአባሉን ሙሉ ስም ያስገቡ።');
    }

    const dept = departmentsList.find((d) => d.id === data.departmentId);
    const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const cleanSundaySchoolId = data.sundaySchoolId?.trim() || undefined;
    const allowCanApprove = isSuperAdmin && Boolean(data.canApproveMembers);

    const invite: DepartmentInvite = {
      id,
      emailLower,
      fullName: cleanFullName,
      departmentId: data.departmentId,
      departmentName: dept?.titleAmharic || data.departmentId,
      division: data.division || 'youth',
      sundaySchoolId: cleanSundaySchoolId,
      requestedPosition: data.requestedPosition,
      role: data.role,
      ...(allowCanApprove ? { canApproveMembers: true } : {}),
      status: 'ACTIVE',
      invitedBy: auth.currentUser.uid,
      invitedByName: currentUser.fullName,
      createdAt: nowIso,
    };

    const sanitizedInvite = sanitizeFirestorePayload(invite);
    await setDoc(doc(db, 'department_invites', id), sanitizedInvite);

    let immediatelyApproved = false;
    // If Super Admin already sees this email in registeredUsers, approve them immediately too
    if (isSuperAdmin) {
      const existingUser = registeredUsers.find(
        (u) => u.email?.trim().toLowerCase() === emailLower
      );
      if (existingUser) {
        const enrichedUser: UserProfile = {
          ...existingUser,
          fullName: existingUser.fullName || cleanFullName,
          sundaySchoolId: cleanSundaySchoolId || existingUser.sundaySchoolId,
          requestedPosition: data.requestedPosition || existingUser.requestedPosition,
        };
        await appointUserToDepartment(
          enrichedUser,
          data.departmentId,
          data.role,
          data.requestedPosition,
          allowCanApprove
        );
        await updateDoc(doc(db, 'department_invites', id), {
          status: 'CLAIMED',
          claimedBy: existingUser.id,
          claimedAt: nowIso,
        });
        invite.status = 'CLAIMED';
        invite.claimedBy = existingUser.id;
        invite.claimedAt = nowIso;
        immediatelyApproved = true;
      }
    }

    setDepartmentInvites((prev) => [invite, ...prev.filter((i) => i.id !== id)]);
    return { invite, immediatelyApproved };
  };

  const cancelDepartmentInvite = async (inviteId: string): Promise<void> => {
    const targetInvite = departmentInvites.find((inv) => inv.id === inviteId);
    if (targetInvite && !hasDeptMemberAuthPrivilege(targetInvite.departmentId)) {
      throw new Error('You can only cancel invites in your authorized department.');
    }
    if (!isSuperAdmin && !isDeptAdmin && !canApproveDeptMembers) {
      throw new Error('Only authorized administrators can cancel pre-approvals.');
    }
    await updateDoc(doc(db, 'department_invites', inviteId), {
      status: 'CANCELLED',
    });
    setDepartmentInvites((prev) =>
      prev.map((inv) => (inv.id === inviteId ? { ...inv, status: 'CANCELLED' } : inv))
    );
  };

  const refreshMembershipAndInvites = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    await claimMatchingInvitesForUser(
      user,
      currentUser.fullName,
      currentUser.sundaySchoolId,
      currentUser.requestedPosition
    );
    try {
      const snap = await getDocs(
        query(collection(db, 'department_memberships'), where('userId', '==', user.uid))
      );
      const userDocs: DepartmentMembership[] = [];
      snap.forEach((d) => userDocs.push(d.data() as DepartmentMembership));
      if (userDocs.length > 0) {
        setDepartmentMemberships((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          for (const d of userDocs) {
            map.set(d.id, d);
          }
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch {
      // ignore offline refresh error
    }
  };

  const rejectMembershipRequest = async (membershipId: string, rejectionReason: string): Promise<void> => {
    const target = departmentMemberships.find((m) => m.id === membershipId);
    if (!target) throw new Error('Membership record not found');
    if (!hasDeptMemberAuthPrivilege(target.departmentId)) {
      throw new Error('You are only authorized to manage members in your assigned department.');
    }
    if (target.role === 'ADMIN' && !isSuperAdmin) {
      throw new Error('Only super administrators can reject department administrators.');
    }

    const nowIso = new Date().toISOString();
    const updated: DepartmentMembership = {
      ...target,
      status: 'REJECTED',
      rejectionReason: rejectionReason.trim(),
      approvedBy: auth.currentUser?.uid || currentUser.id,
      approvedByName: currentUser.fullName,
      statusUpdatedAt: nowIso,
    };

    const sanitized = sanitizeFirestorePayload(updated);
    await setDoc(doc(db, 'department_memberships', membershipId), sanitized);

    setDepartmentMemberships((prev) => {
      const next = prev.map((m) => (m.id === membershipId ? updated : m));
      try {
        localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(next));
      } catch {}
      return next;
    });

    await addDepartmentNotification({
      departmentId: target.departmentId,
      departmentTitle: target.departmentName,
      targetUserId: target.userId,
      title: 'የአባልነት ማመልከቻ ውሳኔ',
      message: `ወደ «${target.departmentName}» ያቀረቡት ማመልከቻ አልተቀበለም። ምክንያት፦ ${rejectionReason}`,
      type: 'MEMBERSHIP_STATUS',
      relatedId: membershipId,
    });
  };

  const suspendMembership = async (membershipId: string, suspensionReason?: string): Promise<void> => {
    const target = departmentMemberships.find((m) => m.id === membershipId);
    if (!target) throw new Error('Membership record not found');
    if (!hasDeptMemberAuthPrivilege(target.departmentId)) {
      throw new Error('You are only authorized to manage members in your assigned department.');
    }
    if (target.role === 'ADMIN' && !isSuperAdmin) {
      throw new Error('Only super administrators can suspend department administrators.');
    }

    const nowIso = new Date().toISOString();
    const updated: DepartmentMembership = {
      ...target,
      status: 'SUSPENDED',
      rejectionReason: suspensionReason?.trim() || 'የአባልነት ዕግድ',
      approvedBy: auth.currentUser?.uid || currentUser.id,
      approvedByName: currentUser.fullName,
      statusUpdatedAt: nowIso,
    };

    const sanitized = sanitizeFirestorePayload(updated);
    await setDoc(doc(db, 'department_memberships', membershipId), sanitized);

    setDepartmentMemberships((prev) => {
      const next = prev.map((m) => (m.id === membershipId ? updated : m));
      try {
        localStorage.setItem('mezgebe_dept_memberships', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const createScheduleAssignment = async (
    data: Omit<ScheduleTaskAssignment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
      status?: ScheduleTaskStatus;
    }
  ): Promise<ScheduleTaskAssignment> => {
    // Validations
    if (!data.assignedMemberIds || data.assignedMemberIds.length === 0) {
      throw new Error('At least one assignee is required.');
    }
    const leadId = data.responsibleLeadId || data.assignedMemberIds[0];
    if (!data.assignedMemberIds.includes(leadId)) {
      throw new Error('The responsible leader must be one of the assigned members.');
    }
    if (!data.scheduleProgramId || !data.agendaSlotId) {
      throw new Error('Assignment must reference a valid schedule and agenda slot.');
    }

    const id = `asgn_${Date.now()}`;
    const nowEth = 'ጥቅምት 2019 ዓ.ም.';
    const newAssignment: ScheduleTaskAssignment = {
      ...data,
      id,
      responsibleLeadId: leadId,
      status: data.status || 'ASSIGNED',
      createdAt: nowEth,
      updatedAt: nowEth,
    };

    const sanitized = sanitizeFirestorePayload(newAssignment);
    // Await database confirmation before updating state
    await setDoc(doc(db, 'schedule_assignments', id), sanitized);

    setScheduleAssignments((prev) => {
      const updated = [newAssignment, ...prev];
      try {
        localStorage.setItem('mezgebe_schedule_assignments', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    for (const memberId of data.assignedMemberIds) {
      await addDepartmentNotification({
        departmentId: data.departmentId,
        departmentTitle: data.departmentTitle,
        targetUserId: memberId,
        title: 'አዲስ የሥራ ምደባ ተሰጥቶዎታል',
        message: `በ«${data.agendaSlotTitle}» ክፍለ-ጊዜ ውስጥ «${data.title}» ተመድበውበታል። እባክዎ ተመልክተው ይቀበሉ።`,
        type: 'ASSIGNMENT_CREATED',
        relatedId: id,
      });
    }

    return newAssignment;
  };

  const updateScheduleAssignment = async (
    assignmentId: string,
    updates: Partial<ScheduleTaskAssignment>
  ): Promise<void> => {
    const nowEth = 'ጥቅምት 2019 ዓ.ም.';
    const sanitized = sanitizeFirestorePayload({
      ...updates,
      updatedAt: nowEth,
    });

    // Await Firestore update first
    await updateDoc(doc(db, 'schedule_assignments', assignmentId), sanitized);

    setScheduleAssignments((prev) => {
      const next = prev.map((asgn) => {
        if (asgn.id === assignmentId) {
          return { ...asgn, ...updates, updatedAt: nowEth };
        }
        return asgn;
      });
      try {
        localStorage.setItem('mezgebe_schedule_assignments', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const acceptAssignment = async (assignmentId: string): Promise<void> => {
    const target = scheduleAssignments.find((a) => a.id === assignmentId);
    if (!target) throw new Error('Assignment not found');

    const memberId = auth.currentUser?.uid || currentUser.id;
    const existingPart = target.individualParticipation || {};
    const updatedPart = {
      ...existingPart,
      [memberId]: { accepted: true, completed: false },
    };

    await updateScheduleAssignment(assignmentId, {
      status: 'ACCEPTED',
      individualParticipation: updatedPart,
    });
  };

  const updateAssignmentProgress = async (
    assignmentId: string,
    status: ScheduleTaskStatus,
    notes?: string
  ): Promise<void> => {
    const target = scheduleAssignments.find((a) => a.id === assignmentId);
    if (!target) throw new Error('Assignment not found');

    // Non-managers cannot mark COMPLETED, CANCELLED, or REVISION_REQUESTED
    if (
      ['COMPLETED', 'CANCELLED', 'REVISION_REQUESTED'].includes(status) &&
      !isDeptAdmin &&
      !canApproveDeptMembers
    ) {
      throw new Error('Only department managers can mark assignments completed, cancelled, or request revisions.');
    }

    const memberId = auth.currentUser?.uid || currentUser.id;
    const existingPart = target.individualParticipation || {};
    const currentMemberPart = existingPart[memberId] || { accepted: true, completed: false };
    const updatedPart = {
      ...existingPart,
      [memberId]: {
        ...currentMemberPart,
        notes: notes || currentMemberPart.notes,
      },
    };

    await updateScheduleAssignment(assignmentId, {
      status,
      individualParticipation: updatedPart,
    });
  };

  const submitAssignmentDeliverable = async (
    assignmentId: string,
    submission: { content?: string; fileUrl?: string; fileName?: string }
  ): Promise<void> => {
    const target = scheduleAssignments.find((a) => a.id === assignmentId);
    if (!target) throw new Error('Assignment not found');

    const nowEth = 'ጥቅምት 2019 ዓ.ም.';
    const deliverableSubmission = {
      ...submission,
      submittedAt: nowEth,
      submittedByName: currentUser.fullName,
    };

    await updateScheduleAssignment(assignmentId, {
      status: 'SUBMITTED',
      deliverableSubmission,
    });

    // Notify department admin
    await addDepartmentNotification({
      departmentId: target.departmentId,
      departmentTitle: target.departmentTitle,
      title: 'የሥራ ሪፖርት / ሰነድ ቀርቧል',
      message: `${currentUser.fullName} ለ«${target.title}» የተዘጋጀውን ሰነድ አስገብተዋል። እባክዎ ገምግመው ያጽድቁ።`,
      type: 'ASSIGNMENT_SUBMITTED',
      relatedId: assignmentId,
    });
  };

  const reviewAssignment = async (
    assignmentId: string,
    newStatus: ScheduleTaskStatus,
    feedback?: string
  ): Promise<void> => {
    if (!isDeptAdmin && !canApproveDeptMembers) {
      throw new Error('Only authorized department managers can review assignments.');
    }
    const target = scheduleAssignments.find((a) => a.id === assignmentId);
    if (!target) throw new Error('Assignment not found');

    const nowEth = 'ጥቅምት 2019 ዓ.ም.';
    await updateScheduleAssignment(assignmentId, {
      status: newStatus,
      adminFeedback: feedback || '',
      reviewedBy: auth.currentUser?.uid || currentUser.id,
      reviewedByName: currentUser.fullName,
      reviewedAt: nowEth,
    });

    // Notify assigned lead
    await addDepartmentNotification({
      departmentId: target.departmentId,
      departmentTitle: target.departmentTitle,
      targetUserId: target.responsibleLeadId,
      title:
        newStatus === 'COMPLETED'
           ? 'የቀረበው ሥራ ጸድቋል / ተጠናቋል'
           : 'በቀረበው ሥራ ላይ ማሻሻያ ተጠይቋል',
      message:
        newStatus === 'COMPLETED'
          ? `ለ«${target.title}» ያቀረቡት ሰነድ በክፍሉ ኃላፊ ጸድቋል። አስተያየት፦ ${feedback || 'ምንም'}`
          : `ለ«${target.title}» ማሻሻያ ተጠይቋል። አስተያየት፦ ${feedback || 'እባክዎ እንደገና ይገምግሙ'}`,
      type: newStatus === 'COMPLETED' ? 'ASSIGNMENT_COMPLETED' : 'REVISION_REQUESTED',
      relatedId: assignmentId,
    });
  };

  const deleteScheduleAssignment = async (assignmentId: string): Promise<void> => {
    if (!isDeptAdmin && !canApproveDeptMembers) {
      throw new Error('Only authorized department managers can delete assignments.');
    }
    await deleteDoc(doc(db, 'schedule_assignments', assignmentId));
    setScheduleAssignments((prev) => {
      const next = prev.filter((a) => a.id !== assignmentId);
      try {
        localStorage.setItem('mezgebe_schedule_assignments', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const checkMemberWorkload = (memberId: string, targetDate?: string) => {
    const activeTasks = scheduleAssignments.filter(
      (a) =>
        a.assignedMemberIds.includes(memberId) &&
        !['COMPLETED', 'CANCELLED'].includes(a.status)
    );

    const overlappingAssignments = targetDate
      ? activeTasks.filter(
          (a) =>
            a.programDate.includes(targetDate) || targetDate.includes(a.programDate)
        )
      : [];

    return {
      activeTaskCount: activeTasks.length,
      hasOverlap: overlappingAssignments.length > 0,
      overlappingAssignments,
    };
  };

  const markNotificationRead = async (notificationId: string): Promise<void> => {
    await updateDoc(doc(db, 'department_notifications', notificationId), {
      isRead: true,
    });

    setDepartmentNotifications((prev) => {
      const next = prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      try {
        localStorage.setItem('mezgebe_dept_notifications', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addDepartmentNotification = async (
    data: Omit<DepartmentNotification, 'id' | 'createdAt' | 'isRead'>
  ): Promise<void> => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowEth = 'ጥቅምት 2019 ዓ.ም.';
    const notification: DepartmentNotification = {
      ...data,
      id,
      createdAt: nowEth,
      isRead: false,
    };

    const sanitized = sanitizeFirestorePayload(notification);
    try {
      await setDoc(doc(db, 'department_notifications', id), sanitized);
    } catch (err) {
      console.warn('Notification write notice:', err);
    }

    setDepartmentNotifications((prev) => {
      const next = [notification, ...prev];
      try {
        localStorage.setItem('mezgebe_dept_notifications', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const resetPasswordEmail = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    try {
      disconnectGoogleDrive();
      await signOut(auth);
      setFirebaseUser(null);
      const guestDeptInfo = departmentsList.find((d) => d.id === activeDepartment);
      setCurrentUser({
        id: 'u_default',
        fullName: 'ተጠቃሚ (Guest)',
        email: '',
        role: 'MEMBER',
        department: guestDeptInfo?.titleAmharic || 'የተክለ ሣዊሮስ ሰንበት ት/ቤት',
        departmentId: activeDepartment,
        joinedDate: '፳፻፲፱ ዓ.ም',
        myWorksCount: 0,
        mySubmissionsCount: 0,
        myBookmarksCount: 0,
      });
      // Clear protected department state
      setDepartmentMemberships([]);
      setDepartmentInvites([]);
      setRegisteredUsers([]);
      setRegisteredUsersError(null);
      setScheduleAssignments([]);
      setDepartmentNotifications([]);
      setLockedDepartmentId(null);
      try {
        localStorage.removeItem('mezgebe_dept_memberships');
        localStorage.removeItem('mezgebe_schedule_assignments');
        localStorage.removeItem('mezgebe_dept_notifications');
        localStorage.removeItem('mezgebe_locked_dept');
      } catch {}
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const selectDivision = (div: SundaySchoolDivision) => {
    setSelectedDivision(div);
  };

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'LIGHT' ? 'DARK' : 'LIGHT'));
  };

  const setUserRole = (role: UserRole) => {
    if (!isSuperAdmin) return;
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const toggleBookmark = async (workId: string) => {
    let nextBookmarks: string[] = [];
    setWorks((prev) => {
      const updated = prev.map((work) =>
        work.id === workId ? { ...work, isBookmarked: !work.isBookmarked } : work
      );
      nextBookmarks = updated.filter((w) => w.isBookmarked).map((w) => w.id);
      try {
        localStorage.setItem('mezgebe_bookmarks', JSON.stringify(nextBookmarks));
      } catch {
        // ignore
      }
      return updated;
    });

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          bookmarks: nextBookmarks,
        });
      } catch {
        // non-blocking
      }
    }
  };

  const submitNewWork = async (data: {
    title: string;
    categoryId: string;
    content: string;
    excerpt: string;
    tags: string[];
    writerName?: string;
    division?: SundaySchoolDivision;
    departmentId?: SundaySchoolDepartment;
    hasPdfAttachment?: boolean;
    pdfFileName?: string | null;
    pdfFileSize?: string | null;
    pdfUrl?: string | null;
    file?: File | null;
  }): Promise<WorkItem> => {
    setIsSyncing(true);
    const allDeptCategories = [...categories, ...getAllDepartmentCategories()];
    const category = allDeptCategories.find((c) => c.id === data.categoryId);
    const newWorkId = `w_${Date.now()}`;
    const authorId = auth.currentUser?.uid || currentUser.id;
    const targetDeptId = data.departmentId || activeDepartment || 'kinetibeb';
    const deptInfo = departmentsList.find((d) => d.id === targetDeptId);

    let uploadedPdfUrl: string | null = data.pdfUrl || null;

    // Upload file directly to Google Cloud Storage (Firebase Storage bucket)
    if (data.file) {
      try {
        const fileRef = ref(storage, `works/${newWorkId}/${data.file.name}`);
        const uploadSnapshot = await uploadBytes(fileRef, data.file);
        uploadedPdfUrl = await getDownloadURL(uploadSnapshot.ref);
      } catch (uploadError) {
        console.warn('Storage upload warning:', uploadError);
      }
    }

    const newWork: WorkItem = {
      id: newWorkId,
      title: data.title,
      writerId: authorId,
      writerName: data.writerName?.trim() || currentUser.fullName,
      categoryId: data.categoryId,
      categoryName: category?.nameAmharic || 'ስነ ጽሁፍ',
      departmentId: targetDeptId,
      departmentTitle: deptInfo?.titleAmharic || 'የኪነጥበብ ክፍል',
      dateAmharic: 'የካቲት ፳፻፲፮ ዓ.ም',
      status: 'UNDER_REVIEW',
      excerpt: data.excerpt.trim() || data.content.slice(0, 90) + '...',
      content: data.content,
      readTime: '፬ ደቂቃ',
      division: data.division || selectedDivision,
      version: 1,
      tags: data.tags,
      isBookmarked: false,
      isFeatured: false,
      hasPdfAttachment: Boolean(data.hasPdfAttachment || data.file),
      pdfFileName: data.file?.name || data.pdfFileName || null,
      pdfFileSize: data.file ? `${(data.file.size / 1024).toFixed(0)} KB` : data.pdfFileSize || null,
      pdfUrl: uploadedPdfUrl,
    };

    // Optimistic UI update
    setWorks((prev) => [newWork, ...prev]);
    setCurrentUser((prev) => ({ ...prev, mySubmissionsCount: prev.mySubmissionsCount + 1 }));

    // Persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'works', newWork.id), newWork);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `works/${newWork.id}`);
    } finally {
      setIsSyncing(false);
    }

    return newWork;
  };

  const updateWork = async (
    workId: string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      tags?: string[];
      categoryId?: string;
      division?: SundaySchoolDivision;
      file?: File | null;
      hasPdfAttachment?: boolean;
      pdfFileName?: string | null;
      pdfFileSize?: string | null;
    }
  ): Promise<WorkItem> => {
    setIsSyncing(true);
    const existingWork = works.find((w) => w.id === workId);
    if (!existingWork) throw new Error('Work not found');

    let uploadedPdfUrl = existingWork.pdfUrl;

    if (data.file) {
      try {
        const fileRef = ref(storage, `works/${workId}/${data.file.name}`);
        const uploadSnapshot = await uploadBytes(fileRef, data.file);
        uploadedPdfUrl = await getDownloadURL(uploadSnapshot.ref);
      } catch (uploadError) {
        console.warn('Storage upload warning:', uploadError);
      }
    }

    const allDeptCategories = [...categories, ...getAllDepartmentCategories()];
    const category = allDeptCategories.find((c) => c.id === (data.categoryId || existingWork.categoryId));

    const updatedWork: WorkItem = {
      ...existingWork,
      title: data.title ?? existingWork.title,
      content: data.content ?? existingWork.content,
      excerpt: data.excerpt ?? existingWork.excerpt,
      tags: data.tags ?? existingWork.tags,
      categoryId: data.categoryId ?? existingWork.categoryId,
      categoryName: category?.nameAmharic || existingWork.categoryName,
      division: data.division ?? existingWork.division,
      status: 'UNDER_REVIEW', // Resubmit for review
      version: (existingWork.version || 1) + 1,
      hasPdfAttachment: data.file ? true : (data.hasPdfAttachment ?? existingWork.hasPdfAttachment),
      pdfFileName: data.file?.name || (data.pdfFileName ?? existingWork.pdfFileName),
      pdfFileSize: data.file ? `${(data.file.size / 1024).toFixed(0)} KB` : (data.pdfFileSize ?? existingWork.pdfFileSize),
      pdfUrl: uploadedPdfUrl,
    };

    setWorks((prev) => prev.map((w) => (w.id === workId ? updatedWork : w)));

    try {
      await updateDoc(doc(db, 'works', workId), {
        title: updatedWork.title,
        content: updatedWork.content,
        excerpt: updatedWork.excerpt,
        tags: updatedWork.tags,
        categoryId: updatedWork.categoryId,
        categoryName: updatedWork.categoryName,
        division: updatedWork.division,
        status: updatedWork.status,
        version: updatedWork.version,
        hasPdfAttachment: updatedWork.hasPdfAttachment,
        pdfFileName: updatedWork.pdfFileName,
        pdfFileSize: updatedWork.pdfFileSize,
        pdfUrl: updatedWork.pdfUrl,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}`);
    } finally {
      setIsSyncing(false);
    }

    return updatedWork;
  };

  const reviewWorkAction = async (
    workId: string,
    newStatus: SubmissionStatus,
    feedback?: string | null,
    reviewerName: string = 'ቀሲስ ሰሎሞን (ገምጋሚ ኃላፊ)'
  ): Promise<void> => {
    const updateData: Partial<WorkItem> = {
      status: newStatus,
      reviewerFeedback: feedback !== undefined ? feedback : null,
      approvedBy: newStatus === 'APPROVED' ? reviewerName : null,
      approvedDate: newStatus === 'APPROVED' ? 'የካቲት ፳፻፲፮ ዓ.ም' : null,
    };

    setWorks((prev) =>
      prev.map((work) => (work.id === workId ? { ...work, ...updateData } : work))
    );

    try {
      await updateDoc(doc(db, 'works', workId), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}`);
    }
  };

  const deleteWork = async (workId: string): Promise<void> => {
    setWorks((prev) => prev.filter((w) => w.id !== workId));
    try {
      await deleteDoc(doc(db, 'works', workId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `works/${workId}`);
    }
  };

  const addMember = async (data: {
    fullName: string;
    duty: MemberDuty;
    phone: string;
    spiritualTitle: string;
    department: string;
    departmentId?: SundaySchoolDepartment;
    bio: string;
  }): Promise<ChurchMember> => {
    const targetDeptId = data.departmentId || activeDepartment || 'kinetibeb';
    const deptInfo = departmentsList.find((d) => d.id === targetDeptId);

    const newMember: ChurchMember = {
      id: `m_${Date.now()}`,
      fullName: data.fullName,
      duty: data.duty,
      phone: data.phone,
      spiritualTitle: data.spiritualTitle || 'አባል',
      department: data.department || deptInfo?.titleAmharic || 'የኪነጥበብ ክፍል',
      departmentId: targetDeptId,
      joinedYear: '፳፻፲፮ ዓ.ም',
      assignedWorksCount: 0,
      bio: data.bio,
    };

    setMembers((prev) => [newMember, ...prev]);

    try {
      await setDoc(doc(db, 'members', newMember.id), newMember);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `members/${newMember.id}`);
    }

    return newMember;
  };

  const deleteMember = async (memberId: string): Promise<void> => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    try {
      await deleteDoc(doc(db, 'members', memberId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `members/${memberId}`);
    }
  };

  const addEvent = async (data: {
    title: string;
    dateAmharic: string;
    timeAmharic: string;
    location: string;
    category: string;
    description: string;
    organizer: string;
    recurrence?: ProgramRecurrence;
    division?: SundaySchoolDivision | null;
    departmentId?: SundaySchoolDepartment;
  }): Promise<CulturalEvent> => {
    const targetDeptId = data.departmentId || activeDepartment || 'kinetibeb';
    const deptInfo = departmentsList.find((d) => d.id === targetDeptId);

    const newEvent: CulturalEvent = {
      id: `prog_${Date.now()}`,
      title: data.title,
      dateAmharic: data.dateAmharic,
      timeAmharic: data.timeAmharic,
      location: data.location,
      category: data.category,
      description: data.description,
      organizer: data.organizer || deptInfo?.titleAmharic || 'የኪነጥበብ ክፍል',
      departmentId: targetDeptId,
      departmentTitle: deptInfo?.titleAmharic || 'የኪነጥበብ ክፍል',
      recurrence: data.recurrence || 'WEEKLY',
      division: data.division || null,
      assignments: [],
    };

    setEvents((prev) => [newEvent, ...prev]);

    try {
      await setDoc(doc(db, 'events', newEvent.id), newEvent);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `events/${newEvent.id}`);
    }

    return newEvent;
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${eventId}`);
    }
  };

  const addAssignmentToProgram = async (eventId: string, assignment: ProgramAssignment): Promise<void> => {
    const updatedEvents = events.map((ev) => {
      if (ev.id === eventId) {
        return {
          ...ev,
          assignments: [...ev.assignments, assignment],
        };
      }
      return ev;
    });

    setEvents(updatedEvents);

    const targetEvent = updatedEvents.find((e) => e.id === eventId);
    if (targetEvent) {
      try {
        await updateDoc(doc(db, 'events', eventId), {
          assignments: targetEvent.assignments,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `events/${eventId}`);
      }
    }
  };

  const toggleAssignmentCompletion = async (eventId: string, assignmentId: string): Promise<void> => {
    const updatedEvents = events.map((ev) => {
      if (ev.id === eventId) {
        return {
          ...ev,
          assignments: ev.assignments.map((asgn) =>
            asgn.id === assignmentId ? { ...asgn, isCompleted: !asgn.isCompleted } : asgn
          ),
        };
      }
      return ev;
    });

    setEvents(updatedEvents);

    const targetEvent = updatedEvents.find((e) => e.id === eventId);
    if (targetEvent) {
      try {
        await updateDoc(doc(db, 'events', eventId), {
          assignments: targetEvent.assignments,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `events/${eventId}`);
      }
    }
  };

  const playTrack = (track: LiturgicalAudioTrack) => {
    setCurrentAudioTrack(track);
    setIsAudioPlaying(true);
  };

  const playWorkAudio = (work: WorkItem) => {
    const track: LiturgicalAudioTrack = {
      id: `trk_${work.id}`,
      title: work.title,
      narratorOrCantor: `${work.writerName} (የኪነጥበብ አቅራቢ)`,
      division: work.division,
      categoryName: work.categoryName,
      durationAmharic: '፫:፳',
      durationSeconds: 200,
      description: work.excerpt,
    };
    setCurrentAudioTrack(track);
    setIsAudioPlaying(true);
    setAudioProgress(0.05);
  };

  const toggleAudioPlayPause = () => {
    if (!currentAudioTrack) {
      setCurrentAudioTrack(audioTracks[0]);
      setIsAudioPlaying(true);
    } else {
      setIsAudioPlaying((prev) => !prev);
    }
  };

  const stopAudio = () => {
    setIsAudioPlaying(false);
    setCurrentAudioTrack(null);
  };

  return (
    <ArchiveContext.Provider
      value={{
        categories,
        works,
        writers,
        members,
        events,
        activeDepartment,
        setActiveDepartment,
        departmentsList,
        addDepartment,
        pdfPackages: SUNDAY_PLAN_PDF_PACKAGES,
        childrenAnnualPlan: CHILDREN_ANNUAL_PLAN_2019,
        maekelawiyanAnnualPlan: MAEKELAWIYAN_ANNUAL_PLAN_2019,
        youthAnnualPlan: YOUTH_ANNUAL_PLAN_2019,
        dailyPlanSheets,
        updateDailyPlanSheet,
        createDailyPlanSheet,
        toggleDailyPreProgramItem,
        deleteDailyPlanSheet,
        ehudPlans,
        createEhudPlan,
        updateEhudPlan,
        deleteEhudPlan,
        ehudFollowUps,
        createEhudFollowUp,
        updateEhudFollowUp,
        deleteEhudFollowUp,
        ehudRatings,
        submitEhudProgramRating,
        deleteEhudProgramRating,
        selectedDivision,
        currentUser,
        firebaseUser,
        isAuthReady,
        isSyncing,
        themeMode,
        audioTracks,
        currentAudioTrack,
        isAudioPlaying,
        audioProgress,
        googleAccessToken,
        isGoogleDriveConnected,
        connectGoogleDrive,
        disconnectGoogleDrive,
        signInWithGoogle,
        registerWithEmail,
        loginWithEmail,
        resetPasswordEmail,
        logout,
        selectDivision,
        toggleThemeMode,
        setUserRole,
        toggleBookmark,
        submitNewWork,
        updateWork,
        reviewWorkAction,
        deleteWork,
        addMember,
        deleteMember,
        addEvent,
        deleteEvent,
        addAssignmentToProgram,
        toggleAssignmentCompletion,
        departmentMemberships,
        departmentInvites,
        registeredUsers,
        registeredUsersError,
        scheduleAssignments,
        departmentNotifications,
        isSuperAdmin,
        isMasterOperator,
        assignedDepartmentId,
        isDepartmentLocked,
        lockDepartmentChoice,
        loginAsMasterOperator,
        isDepartmentPortalLocked,
        userMemberships,
        approvedMemberships,
        approvedDepartmentsList,
        activeMembership,
        isDeptAdmin,
        canApproveDeptMembers,
        canSwitchDepartments,
        hasPendingApproval,
        requestDepartmentMembership,
        approveMembershipRequest,
        appointUserToDepartment,
        toggleMemberApprovalAuthority,
        createDepartmentInvite,
        cancelDepartmentInvite,
        refreshMembershipAndInvites,
        rejectMembershipRequest,
        suspendMembership,
        createScheduleAssignment,
        updateScheduleAssignment,
        acceptAssignment,
        updateAssignmentProgress,
        submitAssignmentDeliverable,
        reviewAssignment,
        deleteScheduleAssignment,
        checkMemberWorkload,
        markNotificationRead,
        playTrack,
        playWorkAudio,
        toggleAudioPlayPause,
        stopAudio,
        setAudioProgress,
      }}
    >
      {children}
    </ArchiveContext.Provider>
  );
};

export const useArchive = () => {
  const context = useContext(ArchiveContext);
  if (!context) {
    throw new Error('useArchive must be used within an ArchiveProvider');
  }
  return context;
};
