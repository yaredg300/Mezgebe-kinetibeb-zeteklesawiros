import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { db, auth, storage, googleProvider, getCachedGoogleToken, setCachedGoogleToken } from '../firebase/config';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  signInWithPopup,
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
  updateDailyPlanSheet: (sheetId: string, updates: Partial<SundayDailyPlanSheet>) => void;
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
  registerWithEmail: (email: string, password: string, fullName: string, role?: UserRole) => Promise<void>;
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
  playTrack: (track: LiturgicalAudioTrack) => void;
  playWorkAudio: (work: WorkItem) => void;
  toggleAudioPlayPause: () => void;
  stopAudio: () => void;
  setAudioProgress: (progress: number) => void;
}

export const ArchiveContext = createContext<ArchiveContextType | null>(null);

export const ArchiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories] = useState<WorkCategory[]>(INITIAL_CATEGORIES);
  const [works, setWorks] = useState<WorkItem[]>(INITIAL_WORKS);
  const [writers] = useState<Writer[]>(INITIAL_WRITERS);
  const [members, setMembers] = useState<ChurchMember[]>(INITIAL_MEMBERS);
  const [events, setEvents] = useState<CulturalEvent[]>(INITIAL_EVENTS);
  const [activeDepartment, setActiveDepartmentState] = useState<SundaySchoolDepartment>(() => {
    try {
      const saved = localStorage.getItem('mezgebe_active_dept');
      if (saved) return saved as SundaySchoolDepartment;
    } catch {
      // ignore
    }
    return 'kinetibeb';
  });

  const setActiveDepartment = (dept: SundaySchoolDepartment) => {
    setActiveDepartmentState(dept);
    try {
      localStorage.setItem('mezgebe_active_dept', dept);
    } catch {
      // ignore
    }
  };

  const [dailyPlanSheets, setDailyPlanSheets] = useState<SundayDailyPlanSheet[]>([
    ...CHILDREN_DAILY_PLANS_2019,
    ...MAEKELAWIYAN_DAILY_PLANS_2019,
    ...YOUTH_DAILY_PLANS_2019,
  ]);

  const updateDailyPlanSheet = (sheetId: string, updates: Partial<SundayDailyPlanSheet>) => {
    setDailyPlanSheets((prev) =>
      prev.map((sheet) => (sheet.id === sheetId ? { ...sheet, ...updates } : sheet))
    );
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'u_default',
    fullName: 'ተጠቃሚ (Guest)',
    email: '',
    role: 'ADMIN',
    department: 'የሰንበት ት/ቤት አስተዳደር እና ኪነጥበብ ክፍል',
    joinedDate: '፳፻፲፮ ዓ.ም',
    myWorksCount: 0,
    mySubmissionsCount: 0,
    myBookmarksCount: 0,
  });

  const [audioTracks] = useState<LiturgicalAudioTrack[]>(INITIAL_AUDIO_TRACKS);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<LiturgicalAudioTrack | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0.28);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => getCachedGoogleToken());
  const isGoogleDriveConnected = Boolean(googleAccessToken);

  const connectGoogleDrive = async (): Promise<string | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
      if (user) {
        const isMasterAdmin =
          user.email === 'yaredcotm@gmail.com' || user.email === 'admin@teklesawiros.org';

        let loadedRole: UserRole = isMasterAdmin ? 'ADMIN' : 'CONTRIBUTOR';
        let loadedFullName = user.displayName || user.email?.split('@')[0] || 'የኪነጥበብ አባል';
        let loadedDept = 'የተክለ ሣዊሮስ ሰንበት ት/ቤት ኪነጥበብ ክፍል';
        let loadedJoinedDate = '፳፻፲፮ ዓ.ም';

        try {
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.fullName) loadedFullName = data.fullName;
            if (data.role && !isMasterAdmin) loadedRole = data.role as UserRole;
            if (data.department) loadedDept = data.department;
            if (data.joinedDate) loadedJoinedDate = data.joinedDate;
          }
        } catch {
          // Non-blocking read error
        }

        const updatedProfile: UserProfile = {
          id: user.uid,
          fullName: loadedFullName,
          email: user.email || '',
          role: loadedRole,
          department: loadedDept,
          joinedDate: loadedJoinedDate,
          myWorksCount: 0,
          mySubmissionsCount: 0,
          myBookmarksCount: 0,
        };
        setCurrentUser(updatedProfile);

        // Sync user doc to Firestore
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              id: user.uid,
              fullName: updatedProfile.fullName,
              email: updatedProfile.email,
              role: updatedProfile.role,
              department: updatedProfile.department,
              joinedDate: updatedProfile.joinedDate,
              bookmarks: [],
            },
            { merge: true }
          );

          if (isMasterAdmin) {
            await setDoc(
              doc(db, 'admins', user.uid),
              {
                email: user.email,
                role: 'SUPER_ADMIN',
              },
              { merge: true }
            );
          }
        } catch {
          // Non-blocking user sync
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore synchronization for Works
  useEffect(() => {
    const worksCollectionRef = collection(db, 'works');
    const unsubscribe = onSnapshot(
      worksCollectionRef,
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
            if (savedBookmarks.includes(w.id)) {
              w.isBookmarked = true;
            }
            fetchedWorks.push(w);
          });
          setWorks(fetchedWorks);
        } else {
          // If Firestore collection is empty, seed initial works
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
  }, []);

  // 3. Real-time Firestore synchronization for Members
  useEffect(() => {
    const membersCollectionRef = collection(db, 'members');
    const unsubscribe = onSnapshot(
      membersCollectionRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedMembers: ChurchMember[] = [];
          snapshot.forEach((docSnap) => {
            fetchedMembers.push(docSnap.data() as ChurchMember);
          });
          setMembers(fetchedMembers);
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
  }, []);

  // 4. Real-time Firestore synchronization for Events
  useEffect(() => {
    const eventsCollectionRef = collection(db, 'events');
    const unsubscribe = onSnapshot(
      eventsCollectionRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedEvents: CulturalEvent[] = [];
          snapshot.forEach((docSnap) => {
            fetchedEvents.push(docSnap.data() as CulturalEvent);
          });
          setEvents(fetchedEvents);
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
  }, []);

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
    } catch {
      // Non-blocking initial seeding
    }
  };

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedGoogleToken(credential.accessToken);
        setGoogleAccessToken(credential.accessToken);
      }
      return result.user;
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        // User closed or dismissed the popup window voluntarily
        return null;
      }
      console.warn('Google Sign-In notice:', error?.message || error);
      throw error;
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'CONTRIBUTOR'
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;
    if (fullName.trim()) {
      try {
        await updateProfile(user, { displayName: fullName.trim() });
      } catch {
        // non-blocking
      }
    }
    const isMasterAdmin =
      user.email === 'yaredcotm@gmail.com' || user.email === 'admin@teklesawiros.org';
    const profileRole: UserRole = isMasterAdmin ? 'ADMIN' : role;

    const newProfile: UserProfile = {
      id: user.uid,
      fullName: fullName.trim() || user.email?.split('@')[0] || 'አባል',
      email: user.email || '',
      role: profileRole,
      department: 'የተክለ ሣዊሮስ ሰንበት ት/ቤት ኪነጥበብ ክፍል',
      joinedDate: '፳፻፲፮ ዓ.ም',
      myWorksCount: 0,
      mySubmissionsCount: 0,
      myBookmarksCount: 0,
    };
    setCurrentUser(newProfile);

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          id: user.uid,
          fullName: newProfile.fullName,
          email: newProfile.email,
          role: newProfile.role,
          department: newProfile.department,
          joinedDate: newProfile.joinedDate,
          bookmarks: [],
        },
        { merge: true }
      );

      if (isMasterAdmin) {
        await setDoc(
          doc(db, 'admins', user.uid),
          {
            email: user.email,
            role: 'SUPER_ADMIN',
          },
          { merge: true }
        );
      }
    } catch {
      // non-blocking
    }
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
      setCurrentUser({
        id: 'u_default',
        fullName: 'ተጠቃሚ (Guest)',
        email: '',
        role: 'MEMBER',
        department: 'የተክለ ሣዊሮስ ሰንበት ት/ቤት ኪነጥበብ ክፍል',
        joinedDate: '፳፻፲፮ ዓ.ም',
        myWorksCount: 0,
        mySubmissionsCount: 0,
        myBookmarksCount: 0,
      });
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
    const category = categories.find((c) => c.id === data.categoryId);
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

    const category = categories.find((c) => c.id === (data.categoryId || existingWork.categoryId));

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
