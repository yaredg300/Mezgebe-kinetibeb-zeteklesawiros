import { WorkCategory, SundaySchoolDepartment } from '../types';

export const DEPARTMENT_CATEGORIES: Record<string, WorkCategory[]> = {
  kinetibeb: [
    {
      id: 'poetry',
      nameAmharic: 'ግጥምና ቅኔ',
      nameEnglish: 'Poetry & Qene',
      descriptionAmharic: 'መንፈሳዊ እና ባህላዊ የግጥም ውቅር፣ ስነ ስንኝ እና የዜማ ድርሰቶች',
      iconName: 'BookOpen',
      workCount: 28,
    },
    {
      id: 'literature',
      nameAmharic: 'ስነ ጽሁፍና ድርሳናት',
      nameEnglish: 'Literature & Treatises',
      descriptionAmharic: 'ረቂቅ ልቦለዶች፣ ድርሳናት፣ አስተማሪ አጫጭር ጽሁፎች እና የኪነጥበብ መጣጥፎች',
      iconName: 'FileText',
      workCount: 19,
    },
    {
      id: 'theater',
      nameAmharic: 'ቲያትርና ድራማ',
      nameEnglish: 'Theater & Drama',
      descriptionAmharic: 'በሰንበት ትምህርት ቤቱ መድረክ የቀረቡ ታላላቅ መንፈሳዊ ድራማዎችና ተውኔቶች',
      iconName: 'Clapperboard',
      workCount: 14,
    },
    {
      id: 'monologue',
      nameAmharic: 'መነባንብ',
      nameEnglish: 'Monologue',
      descriptionAmharic: 'አንደበተ ርቱዕ ስነ ቃል፣ ስሜት ቀስቃሽ መነባንቦችና የግጥም ሙዚቃዊ ቅንብሮች',
      iconName: 'Mic',
      workCount: 16,
    },
    {
      id: 'script',
      nameAmharic: 'ስክሪፕትና መመሪያ',
      nameEnglish: 'Scripts',
      descriptionAmharic: 'የመድረክ ዝግጅት መመሪያዎች፣ የድራማ ስክሪፕቶች እና የትዕይንት ሰነዶች',
      iconName: 'Scroll',
      workCount: 11,
    },
    {
      id: 'art',
      nameAmharic: 'ሥዕልና ብራና',
      nameEnglish: 'Sacred Art',
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
      id: 'history',
      nameAmharic: 'ታሪክና ቅርስ',
      nameEnglish: 'History & Heritage',
      descriptionAmharic: 'የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል መመስረትና የታሪክ ሰነዶች',
      iconName: 'History',
      workCount: 8,
    },
  ],

  ehud_merha_gibir: [
    {
      id: 'annual_plans',
      nameAmharic: 'የ2019 ዓመታዊ ዕቅዶች',
      nameEnglish: 'Annual Plans 2019',
      descriptionAmharic: 'የወጣት፣ የማዕከላውያንና የሕፃናት የ2019 ዓ.ም. የተቀናጀ ዓመታዊ ዕቅድ ሰነዶች',
      iconName: 'CalendarCheck',
      workCount: 18,
    },
    {
      id: 'weekly_timetables',
      nameAmharic: 'ሳምንታዊ የሰዓት ሰሌዳዎች',
      nameEnglish: 'Weekly Timetables',
      descriptionAmharic: 'የየሳምንቱ እሁድ የቅዳሴ ፍጻሜ፣ የትምህርትና የመድረክ የሰዓት ድልድል',
      iconName: 'Clock',
      workCount: 14,
    },
    {
      id: 'daily_plan_sheets',
      nameAmharic: 'የዕለት ዕቅድ ሉሆች (Daily Plans)',
      nameEnglish: 'Daily Plan Sheets',
      descriptionAmharic: 'ለእያንዳንዱ እሁድ የተዘጋጁ የዕለት ዝርዝር ፕሮግራሞችና የተረኞች ማስታወሻ',
      iconName: 'FileSpreadsheet',
      workCount: 36,
    },
    {
      id: 'organizer_rosters',
      nameAmharic: 'የአዘጋጆች ምድቦች (10 Groups)',
      nameEnglish: 'Organizer Rosters',
      descriptionAmharic: 'ከምድብ 01 እስከ 10 የተመደቡ የአዘጋጆች፣ የፀሐፊዎችና የአቅራቢዎች የስራ ዝርዝር',
      iconName: 'Users',
      workCount: 10,
    },
    {
      id: 'orders_of_service',
      nameAmharic: 'የስርዓተ-አገልግሎት መመሪያ',
      nameEnglish: 'Orders of Service',
      descriptionAmharic: 'የእሁድ ጉባኤያት አቀራረብ፣ የዝማሬና የስነ-ስርዓት መተዳደሪያ ሰነዶች',
      iconName: 'Scroll',
      workCount: 8,
    },
    {
      id: 'program_minutes',
      nameAmharic: 'የመርሐ ግብር ቃለ-ጉባኤ',
      nameEnglish: 'Program Minutes',
      descriptionAmharic: 'የመርሐ ግብር አስተባባሪ ኮሚቴ ሳምንታዊና ወርሃዊ የግምገማ ቃለ-ጉባኤዎች',
      iconName: 'FileText',
      workCount: 12,
    },
  ],

  education: [
    {
      id: 'syllabus_modules',
      nameAmharic: 'የክፍል ደረጃ ሞጁሎች',
      nameEnglish: 'Syllabus Modules',
      descriptionAmharic: 'የሕፃናት፣ የማዕከላውያንና የወጣቶች የክፍል ደረጃ ስርዓተ-ትምህርት ሞጁሎች',
      iconName: 'GraduationCap',
      workCount: 24,
    },
    {
      id: 'bible_study',
      nameAmharic: 'የመጽሐፍ ቅዱስ ጥናት',
      nameEnglish: 'Bible Study Guides',
      descriptionAmharic: 'የብሉይና የሐዲስ ኪዳን ጥልቅ የጥናት መመሪያዎች፣ የጥያቄዎችና መልሶች ሰነዶች',
      iconName: 'BookOpen',
      workCount: 20,
    },
    {
      id: 'church_history_creed',
      nameAmharic: 'ነገረ መለኮትና የቤ/ክ ታሪክ',
      nameEnglish: 'Theology & History',
      descriptionAmharic: 'አምስቱ አዕማደ ምስጢር፣ የነገረ ድኅነት ጥናትና የኢትዮጵያ ቤተክርስቲያን ታሪክ',
      iconName: 'BookMarked',
      workCount: 16,
    },
    {
      id: 'exams_and_evaluations',
      nameAmharic: 'ፈተናዎችና ምዘናዎች',
      nameEnglish: 'Exams & Evaluations',
      descriptionAmharic: 'የሩብ ዓመት፣ የመንፈቅና የዓመቱ መጨረሻ የጽሑፍና የቃል ፈተናዎች ማህደር',
      iconName: 'FileCheck2',
      workCount: 18,
    },
    {
      id: 'teachers_handbook',
      nameAmharic: 'የመምህራን ማስተማሪያ መመሪያ',
      nameEnglish: 'Teachers Handbook',
      descriptionAmharic: 'የሰንበት ት/ቤት መምህራን የስነ-ዘዴና የትምህርት አሰጣጥ መመሪያ ሰነድ',
      iconName: 'Award',
      workCount: 9,
    },
    {
      id: 'spiritual_textbooks',
      nameAmharic: 'መንፈሳዊ መጻሕፍት ማህደር',
      nameEnglish: 'Spiritual Textbooks',
      descriptionAmharic: 'ለተማሪዎችና ለአስተማሪዎች የተዘጋጁ የማጣቀሻ መጻሕፍትና ዲጂታል ሰነዶች',
      iconName: 'Library',
      workCount: 15,
    },
  ],

  mezmur: [
    {
      id: 'yared_chants',
      nameAmharic: 'ያሬዳዊ ዜማዎችና ድጓ',
      nameEnglish: 'Yared Chants & Digua',
      descriptionAmharic: 'የግዕዝ፣ የዕዝልና የአራራይ ዜማዎች ስልት፣ የጾመ ድጓና የመዕራፍ ጥናት',
      iconName: 'Music',
      workCount: 25,
    },
    {
      id: 'holiday_hymns',
      nameAmharic: 'የበዓላት መዝሙራት',
      nameEnglish: 'Feast-Day Hymns',
      descriptionAmharic: 'ለልደት፣ ለጥምቀት፣ ለሆሳዕና፣ ለፋሲካና ለንግሥ በዓላት የተዘጋጁ መዝሙራት',
      iconName: 'Sparkles',
      workCount: 38,
    },
    {
      id: 'begena_masenqo',
      nameAmharic: 'የበገናና መሰንቆ ትምህርት',
      nameEnglish: 'Begena & Sacred Strings',
      descriptionAmharic: 'የአስሩ የበገና አውታሮች መንፈሳዊ ትርጓሜና የዜማ ቅኝቶች ማስተማሪያ ሰነድ',
      iconName: 'Guitar',
      workCount: 14,
    },
    {
      id: 'choir_repertoire',
      nameAmharic: 'የመዘምራን ድልድልና መዝገብ',
      nameEnglish: 'Choir Rosters & Repertoire',
      descriptionAmharic: 'የሕፃናት፣ የማዕከላውያንና የወጣት መዘምራን ድልድልና ሳምንታዊ ዝማሬዎች',
      iconName: 'Users',
      workCount: 12,
    },
    {
      id: 'audio_records',
      nameAmharic: 'የዜማ ድምፅ ቅጂዎች',
      nameEnglish: 'Liturgical Audio Recordings',
      descriptionAmharic: 'በደብሩ ሊቃውንትና መዘምራን የተቀረጹ የዜማና የመዝሙር የድምፅ ማህደሮች',
      iconName: 'Headphones',
      workCount: 22,
    },
    {
      id: 'hymnbooks',
      nameAmharic: 'የመዝሙር ደብተሮችና ግጥሞች',
      nameEnglish: 'Hymnbooks & Lyrics',
      descriptionAmharic: 'የሰንበት ትምህርት ቤቱ የታተሙና የተሰበሰቡ ይፋዊ የመዝሙር ደብተሮች',
      iconName: 'Book',
      workCount: 17,
    },
  ],

  records: [
    {
      id: 'student_census',
      nameAmharic: 'የተማሪዎች ቆጠራና ምዝገባ',
      nameEnglish: 'Student Census & Registry',
      descriptionAmharic: 'የሕፃናት፣ ማዕከላውያንና ወጣቶች ዓመታዊ ቆጠራና የአባላት ምዝገባ ሰነዶች',
      iconName: 'UserCheck',
      workCount: 16,
    },
    {
      id: 'attendance_ledgers',
      nameAmharic: 'ሳምንታዊ የመገኘት መዛግብት',
      nameEnglish: 'Weekly Attendance Ledgers',
      descriptionAmharic: 'የየሳምንቱ እሁድ የተማሪዎችና የአገልጋዮች የጥሪና የመገኘት መዝገብ',
      iconName: 'ClipboardCheck',
      workCount: 30,
    },
    {
      id: 'discipline_rules',
      nameAmharic: 'የደንብና ስነ-ስርዓት ሰነዶች',
      nameEnglish: 'Discipline & Conduct Rules',
      descriptionAmharic: 'የሰንበት ት/ቤት መተዳደሪያ ደንብ፣ የደንብ ልብስ አጠቃቀምና የስነ-ስርዓት መመሪያ',
      iconName: 'ShieldAlert',
      workCount: 8,
    },
    {
      id: 'counseling_minutes',
      nameAmharic: 'የምክርና ክትትል ቃለ-ጉባኤ',
      nameEnglish: 'Counseling & Guidance Minutes',
      descriptionAmharic: 'የተማሪዎች መንፈሳዊ ምክር፣ የቤተሰብ ግንኙነትና የክትትል ሰነዶች',
      iconName: 'HeartHandshake',
      workCount: 11,
    },
    {
      id: 'uniform_id_registry',
      nameAmharic: 'የደንብ ልብስና መታወቂያ መዝገብ',
      nameEnglish: 'Uniform & ID Card Registry',
      descriptionAmharic: 'የተማሪዎች ባጅ፣ መታወቂያ ካርድና የነጭ ነጠላ ድልድል መረጃዎች',
      iconName: 'BadgeCheck',
      workCount: 7,
    },
  ],

  media: [
    {
      id: 'weekly_bulletins',
      nameAmharic: 'ሳምንታዊ ማስታወቂያዎች',
      nameEnglish: 'Weekly Bulletins',
      descriptionAmharic: 'በየሳምንቱ በመቅደሱ አደባባይ የሚነበቡ ማስታወቂያዎችና የበዓላት ጥሪዎች',
      iconName: 'Megaphone',
      workCount: 26,
    },
    {
      id: 'press_releases',
      nameAmharic: 'ዜናዎችና መግለጫዎች',
      nameEnglish: 'News & Press Releases',
      descriptionAmharic: 'የሰንበት ትምህርት ቤቱን ወቅታዊ እንቅስቃሴዎች የሚያስረዱ ይፋዊ መግለጫዎች',
      iconName: 'Newspaper',
      workCount: 15,
    },
    {
      id: 'photo_video_archive',
      nameAmharic: 'የበዓላት ፎቶና ቪዲዮ ማህደር',
      nameEnglish: 'Feast Photo & Video Archives',
      descriptionAmharic: 'የደብረ ታቦር፣ የጥምቀት፣ የልደትና የንግሥ በዓላት ዲጂታል የፎቶና ቪዲዮ ማህደር',
      iconName: 'Image',
      workCount: 52,
    },
    {
      id: 'annual_magazine',
      nameAmharic: 'ዓመታዊ መጽሔትና ጋዜጣ',
      nameEnglish: 'Annual Magazines & Gazettes',
      descriptionAmharic: 'በየዓመቱ በሰንበት ት/ቤቱ የሚታተሙ መንፈሳዊ መጽሔቶችና ጋዜጦች',
      iconName: 'BookOpenCheck',
      workCount: 12,
    },
    {
      id: 'digital_graphics',
      nameAmharic: 'ዲጂታል ፖስተሮችና ባነሮች',
      nameEnglish: 'Posters & Digital Graphics',
      descriptionAmharic: 'ለማህበራዊ ሚዲያና ለደብሩ ማስታወቂያ ሰሌዳ የተዘጋጁ ግራፊክሶች',
      iconName: 'Tv',
      workCount: 34,
    },
  ],

  finance: [
    {
      id: 'project_proposals',
      nameAmharic: 'የልማት ፕሮጀክት ፕሮፖዛሎች',
      nameEnglish: 'Development Proposals',
      descriptionAmharic: 'የሁለገብ አዳራሽ፣ የቤተ መጻሕፍትና የዲጂታል ስቱዲዮ ግንባታ ፕሮፖዛሎች',
      iconName: 'Briefcase',
      workCount: 10,
    },
    {
      id: 'financial_reports',
      nameAmharic: 'የወርሃዊ ገቢና ወጪ ሪፖርት',
      nameEnglish: 'Financial Balance Sheets',
      descriptionAmharic: 'የሰንበት ትምህርት ቤቱ የተረጋገጡ የሒሳብ መዛግብትና የኦዲት ሪፖርቶች',
      iconName: 'Calculator',
      workCount: 24,
    },
    {
      id: 'charity_records',
      nameAmharic: 'የበጎ አድራጎት መዛግብት',
      nameEnglish: 'Charity & Welfare Records',
      descriptionAmharic: 'አቅመ ደካማ ለሆኑ ሕፃናት የተደረጉ የትምህርት ቁሳቁስና የበጎ አድራጎት ድጋፎች',
      iconName: 'Heart',
      workCount: 14,
    },
    {
      id: 'bazaar_documents',
      nameAmharic: 'የባዛርና ገቢ ሰነዶች',
      nameEnglish: 'Fundraising & Bazaar Records',
      descriptionAmharic: 'ዓመታዊ የኪነጥበብ ባዛሮች፣ የቲኬት ሽያጭና የገቢ ማሰባሰቢያ ሰነዶች',
      iconName: 'HandCoins',
      workCount: 8,
    },
    {
      id: 'asset_inventory',
      nameAmharic: 'የንብረትና ቁሳቁስ ቆጠራ',
      nameEnglish: 'Asset Inventory Ledgers',
      descriptionAmharic: 'የሙዚቃ መሣሪያዎች፣ የመድረክ አልባሳትና የቢሮ ቁሳቁሶች ቋሚ መዝገብ',
      iconName: 'Layers',
      workCount: 9,
    },
  ],
};

/**
 * Get categories for a specific department
 */
export function getDepartmentCategories(departmentId: SundaySchoolDepartment | string): WorkCategory[] {
  if (DEPARTMENT_CATEGORIES[departmentId]) {
    return DEPARTMENT_CATEGORIES[departmentId];
  }
  return DEPARTMENT_CATEGORIES.kinetibeb;
}

/**
 * Get all categories across all departments
 */
export function getAllDepartmentCategories(): WorkCategory[] {
  const seen = new Set<string>();
  const all: WorkCategory[] = [];

  Object.values(DEPARTMENT_CATEGORIES).forEach((catList) => {
    catList.forEach((cat) => {
      if (!seen.has(cat.id)) {
        seen.add(cat.id);
        all.push(cat);
      }
    });
  });

  return all;
}
