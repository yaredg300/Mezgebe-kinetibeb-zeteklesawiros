import { WorkItem, ChurchMember, CulturalEvent } from '../types';

export const ADDITIONAL_DEPARTMENT_WORKS: WorkItem[] = [
  // --- 1. የእሁድ መርሃ ግብር ክፍል (ehud_merha_gibir) ---
  {
    id: 'w_ehud1',
    title: 'የ፳፻፲፱ ዓ.ም. ዓመታዊ የእሁድ መርሃ ግብር መመሪያና የተማሪዎች መርሐ-ግብር ጥቅል',
    writerId: 'm_org_ehud',
    writerName: 'የመርሐ ግብር አስተባባሪ ኮሚቴ',
    categoryId: 'event_docs',
    categoryName: 'የዝግጅት ሰነዶች',
    dateAmharic: 'መስከረም ፩ ፳፻፲፱ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'ehud_merha_gibir',
    departmentTitle: 'የእሁድ መርሃ ግብር ክፍል',
    division: 'youth',
    excerpt: 'የሕፃናትና የማዕከላውያን ዓመታዊ የእሁድ አገልግሎት የሰዓት ሰሌዳ፣ የወር ዕቅዶችና የዕለት አገልጋዮች ምደባ ሰነድ...',
    content: `የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የእሁድ መርሃ ግብር ክፍል የ፳፻፲፱ ዓ.ም. ዓመታዊ የአገልግሎት መመሪያ ሰነድ።

፩. የመርሐ ግብሩ ዓላማ፦
በየሳምንቱ እሁድ ከቅዳሴ ፍፃሜ በኋላ የሚሰጡ ትምህርቶች፣ ዝማሬዎችና የኪነጥበብ መርሐ ግብራት በስርዓት እንዲመሩ ማስቻል፤

፪. የሰዓት ድልድል፦
• ከ፯:00 - ፯:፴ — የተማሪዎች አቀባበልና ጸሎት
• ከ፯:፴ - ፰:፲፭ — ክፍልፋይ ትምህርት (በየዕድሜ እርከኑ)
• ከ፰:፲፭ - ፱:00 — የጋራ መዝሙርና የኪነጥበብ መድረክ
• ከ፱:00 - ፱:፴ — ማጠቃለያ ጸሎትና ቡራኬ

፫. የአገልጋዮች ኃላፊነት፦
እያንዳንዱ አገልጋይ ከተመደበበት ሰዓት ቢያንስ ከ፲፭ ደቂቃ አስቀድሞ በመገኘት ዝግጁ መሆን ይጠበቅበታል።`,
    readTime: '፭ ደቂቃ',
    isBookmarked: true,
    isFeatured: true,
    approvedBy: 'የሰንበት ት/ቤት የበላይ አስተዳደር',
    approvedDate: 'መስከረም ፭ ፳፻፲፱ ዓ.ም',
    version: 1,
    tags: ['መርሐ ግብር', 'የ፳፻፲፱ ዕቅድ', 'የእሁድ ሰሌዳ'],
    hasPdfAttachment: true,
    pdfFileName: 'የ2019_የእሁድ_መርሃ_ግብር_ጥቅል.pdf',
    pdfFileSize: '240 KB',
  },
  {
    id: 'w_ehud2',
    title: 'የማዕከላውያንና የሕፃናት የዕለት አገልግሎት ድልድል መዝገብ',
    writerId: 'm_org_ehud2',
    writerName: 'ዲ/ን ቴዎድሮስ አማረ',
    categoryId: 'script',
    categoryName: 'ስክሪፕትና መመሪያ',
    dateAmharic: 'ጥቅምት ፲፪ ፳፻፲፱ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'ehud_merha_gibir',
    departmentTitle: 'የእሁድ መርሃ ግብር ክፍል',
    division: 'intermediates',
    excerpt: 'ሳምንታዊ የተረኛ አገልጋዮች፣ ተራኪዎች፣ መዘምራንና መምህራን የተሟላ የሥራ ድልድል ማህደር...',
    content: `የእሁድ ዕለት መርሐ ግብር የተረኞች ዝርዝር መመሪያ ሰነድ፦
- አዳራሽ አስተካካይና ደወል ደዋይ
- ተረኛ መዝሙር መሪዎች
- ተራኪና የመነባንብ አቅራቢ
- የስነ-ስርዓት ተቆጣጣሪዎች
እያንዳንዱ ተረኛ በሰዓቱ ተገኝቶ የዕለቱን ፕሮግራም በንቃት እንዲመራ ያሳስባል።`,
    readTime: '፫ ደቂቃ',
    isBookmarked: false,
    isFeatured: false,
    approvedBy: 'የእሁድ መርሃ ግብር ኃላፊ',
    version: 1,
    tags: ['ተረኝነት', 'ድልድል', 'አገልግሎት'],
  },

  // --- 2. የትምህርትና ስልጠና ክፍል (education) ---
  {
    id: 'w_edu1',
    title: 'የነገረ መለኮት እና የስርዓተ ቤተክርስቲያን መሰረታዊ ትምህርት ሞጁል ፩',
    writerId: 'm_edu1',
    writerName: 'መምህር ኤርምያስ በላይ',
    categoryId: 'literature',
    categoryName: 'ስነ ጽሁፍ',
    dateAmharic: 'መስከረም ፳ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'education',
    departmentTitle: 'የትምህርትና ስልጠና ክፍል',
    division: 'youth',
    excerpt: 'የኦርቶዶክሳዊት ተዋሕዶ ቤተክርስቲያን አምስቱ አዕማደ ምስጢር እና የነገረ ድኅነት ጥናት ሞጁል...',
    content: `የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የትምህርትና ስልጠና ክፍል — የነገረ መለኮት ትምህርት ማጠቃለያ።

ምዕራፍ ፩፦ አምስቱ አዕማደ ምስጢር
፩. ምስጢረ ሥላሴ፦ አንድነቱና ሦስትነቱ፤
፪. ምስጢረ ሥጋዌ፦ አምላክ ሰው የመሆኑ ምስጢር፤
፫. ምስጢረ ጥምቀት፦ ከውኃና ከመንፈስ ዳግም ስለመወለድ፤
፬. ምስጢረ ቁርባን፦ የክርስቶስ ክቡር ሥጋና ደም፤
፭. ምስጢረ ትንሣኤ ሙታን፦ የፍጻሜው ተስፋና ዘላለማዊ ሕይወት።

እነዚህ አምስቱ ምስጢራት የክርስቲያናዊ እምነት መሠረት ናቸው። እያንዳንዱ የሰንበት ትምህርት ቤት ተማሪ እነዚህን ምስጢራት ጠንቅቆ ሊያውቅና ሊመሰክር ይገባዋል።`,
    readTime: '፰ ደቂቃ',
    isBookmarked: true,
    isFeatured: true,
    approvedBy: 'ሊቀ ጠበብት ዮሴፍ',
    approvedDate: 'ጥቅምት ፩ ፳፻፲፮ ዓ.ም',
    version: 2,
    tags: ['ትምህርት', 'አዕማደ ምስጢር', 'ነገረ መለኮት'],
    hasPdfAttachment: true,
    pdfFileName: 'የነገረ_መለኮት_ሞጁል_፩.pdf',
    pdfFileSize: '185 KB',
  },
  {
    id: 'w_edu2',
    title: 'የመጽሐፍ ቅዱስ ጥናት መመሪያ — ኦሪት ዘፍጥረትና የዘጸአት ጉዞ',
    writerId: 'm_edu2',
    writerName: 'መምህርት አስቴር ከበደ',
    categoryId: 'literature',
    categoryName: 'ስነ ጽሁፍ',
    dateAmharic: 'ጥቅምት ፲፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'education',
    departmentTitle: 'የትምህርትና ስልጠና ክፍል',
    division: 'intermediates',
    excerpt: 'የዓለም አፈጣጠር፣ የአበው ታሪክ እና የእስራኤል ከግብፅ ባርነት የመውጣት መንፈሳዊ ትርጓሜ...',
    content: `ኦሪት ዘፍጥረት የመጽሐፍት ሁሉ መክፈቻና የእግዚአብሔርን ታላቅ ፍቅር የምንረዳበት መጽሐፍ ነው።
በዚህ ጥናት ውስጥ፦
- የመጀመሪያው የፍጥረት ሳምንት
- የኖኅ መርከብና የአብርሃም የእምነት ጉዞ
- የዮሴፍ በግብፅ ምድር መከራና ክብር
ተማሪዎች በቡድን ሆነው በየሳምንቱ የሚያጠኗቸው ጥያቄዎች ተካተዋል።`,
    readTime: '፮ ደቂቃ',
    isBookmarked: false,
    isFeatured: true,
    approvedBy: 'የትምህርት ክፍል ኮሚቴ',
    version: 1,
    tags: ['መጽሐፍ ቅዱስ ጥናት', 'ኦሪት ዘፍጥረት'],
  },
  {
    id: 'w_edu3',
    title: 'የ፳፻፲፮ ዓ.ም. የክፍል ፈተናዎችና የውጤት መመዘኛ ሰነድ',
    writerId: 'm_edu1',
    writerName: 'መምህር ኤርምያስ በላይ',
    categoryId: 'script',
    categoryName: 'ስክሪፕትና ሰነድ',
    dateAmharic: 'ታኅሣሥ ፳ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'education',
    departmentTitle: 'የትምህርትና ስልጠና ክፍል',
    division: 'children',
    excerpt: 'ለሕፃናትና ማዕከላውያን የተዘጋጀ የሩብ ዓመት የቃልና የጽሁፍ ፈተናዎች ጥያቄዎች ስብስብ...',
    content: 'የሩብ ዓመት ፈተናዎች ማጠቃለያና የተማሪዎች መገምገሚያ ነጥቦች በዝርዝር ቀርበዋል።',
    readTime: '፬ ደቂቃ',
    isBookmarked: false,
    isFeatured: false,
    version: 1,
    tags: ['ፈተና', 'ምዘና', 'ትምህርት'],
  },

  // --- 3. የመዝሙር ክፍል (mezmur) ---
  {
    id: 'w_mez1',
    title: 'የቅዱስ ያሬድ ዜማ ማስታወሻ — የጾመ ድጓና የመዕራፍ ጥናት ሰነድ',
    writerId: 'm_mez1',
    writerName: 'ሊቀ መዘምራን ገብረ ማርያም',
    categoryId: 'poetry',
    categoryName: 'ግጥምና ዜማ',
    dateAmharic: 'ጥቅምት ፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'mezmur',
    departmentTitle: 'የመዝሙር ክፍል',
    division: 'youth',
    excerpt: 'የጥንታዊው የኢትዮጵያ ዜማ ሶስቱ ስልቶች (ግዕዝ፣ ዕዝል፣ አራራይ) እና የያሬዳዊ ምልክቶች ማብራሪያ...',
    content: `ቅዱስ ያሬድ በስድስተኛው መቶ ክፍለ ዘመን መንፈሳዊውን ዜማ ከመላእክት ተቀብሎ ለኢትዮጵያ ቤተክርስቲያን አበርክቷል።

የዜማው ሶስቱ ዋና ስልቶች፦
፩. ግዕዝ — ጽኑዕ፣ ኃይለኛና ቀጥተኛ ድምፅ፤
፪. ዕዝል — ረቂቅ፣ ኀዘንና ልመና የተቀላቀለበት ረጋ ያለ ዜማ፤
፫. አራራይ — የደስታ፣ የምስጋናና የብርሃን ዜማ።

የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የመዝሙር ክፍል አባላት እነዚህን የያሬድ ምልክቶች በማጥናት ጥንታዊውን ዜማ ሳይበረዝ ለትውልድ ያስተላልፋሉ።`,
    readTime: '፯ ደቂቃ',
    isBookmarked: true,
    isFeatured: true,
    approvedBy: 'ሊቀ መዘምራን ገብረ ማርያም',
    approvedDate: 'ጥቅምት ፲ ፳፻፲፮ ዓ.ም',
    version: 2,
    tags: ['ቅዱስ ያሬድ', 'ዜማ', 'ድጓ', 'መዝሙር'],
    hasPdfAttachment: true,
    pdfFileName: 'የቅዱስ_ያሬድ_ዜማ_ማስታወሻ.pdf',
    pdfFileSize: '210 KB',
  },
  {
    id: 'w_mez2',
    title: 'የበዓላት መዝሙራት ስብስብ እና የበገና ዜማ ቅንብር',
    writerId: 'm_mez2',
    writerName: 'ይስሐቅ ወንድሙ',
    categoryId: 'monologue',
    categoryName: 'መነባንብና ዜማ',
    dateAmharic: 'ሕዳር ፳ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'mezmur',
    departmentTitle: 'የመዝሙር ክፍል',
    division: 'intermediates',
    excerpt: 'የበገና አስር አውታሮች መንፈሳዊ ትርጓሜና በዓመታዊ በዓላት የሚዘመሩ ጥንታዊ መዝሙራት...',
    content: `በገና የመንፈሳዊ ዕረፍትና የጸሎት መሣሪያ ነው።
የዳዊት በገና አስር አውታሮች አስሩን ትእዛዛት ይወክላሉ።
በዚህ ማህደር ውስጥ ለልደት፣ ለጥምቀትና ለፋሲካ የተዘጋጁ የመዘምራን ግጥሞች ከበገና አወቃቀር ጋር ተካተዋል።`,
    readTime: '፭ ደቂቃ',
    isBookmarked: false,
    isFeatured: true,
    approvedBy: 'የመዝሙር ክፍል ኃላፊ',
    version: 1,
    tags: ['በገና', 'መዝሙር', 'በዓላት'],
  },

  // --- 4. የአባላትና ቁጥጥር ክፍል (records) ---
  {
    id: 'w_rec1',
    title: 'የሰንበት ትምህርት ቤት አባላት የስነ-ስርዓትና የደብተር ቁጥጥር መመሪያ',
    writerId: 'm_rec1',
    writerName: 'አቶ ሃብታሙ ወርቁ',
    categoryId: 'history',
    categoryName: 'ታሪክና ደንብ',
    dateAmharic: 'መስከረም ፲፪ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'records',
    departmentTitle: 'የአባላትና ቁጥጥር ክፍል',
    division: 'youth',
    excerpt: 'የተማሪዎች ሳምንታዊ መገኘት፣ የደንብ ልብስ አጠቃቀምና የቤተክርስቲያን ስርዓት መጠበቂያ መመሪያ ደንብ...',
    content: `የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የአባላትና ቁጥጥር ክፍል መተዳደሪያ ደንብ።

፩. መገኘት፦ ተማሪዎች በየሳምንቱ እሁድ በሰዓቱ መገኘት አለባቸው። ያለፈቃድ ከሁለት ሳምንት በላይ መቅረት ክልከል ነው።
፪. የደንብ ልብስ፦ በነጭ ነጠላና በሰንበት ት/ቤት ባጅ መቅረብ ግዴታ ነው።
፫. የደብተር ምርመራ፦ በየወሩ መጨረሻ የክፍል ደብተሮች በመምህራን ይፈተሻሉ።`,
    readTime: '፬ ደቂቃ',
    isBookmarked: false,
    isFeatured: true,
    approvedBy: 'የአስተዳደር ኮሚቴ',
    approvedDate: 'መስከረም ፲፭ ፳፻፲፮ ዓ.ም',
    version: 1,
    tags: ['ስነ-ስርዓት', 'አባላት', 'መመሪያ'],
    hasPdfAttachment: true,
    pdfFileName: 'የስነ_ስርዓት_መመሪያ_ደንብ.pdf',
    pdfFileSize: '118 KB',
  },
  {
    id: 'w_rec2',
    title: 'የ፳፻፲፮ ዓ.ም. የተማሪዎች ምዝገባ እና የቆጠራ ሪፖርት',
    writerId: 'm_rec2',
    writerName: 'ዲ/ን ብርሃኑ ግርማ',
    categoryId: 'event_docs',
    categoryName: 'የዝግጅት ሰነዶች',
    dateAmharic: 'ጥቅምት ፴ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'records',
    departmentTitle: 'የአባላትና ቁጥጥር ክፍል',
    division: 'youth',
    excerpt: 'በደብሩ ስር የተመዘገቡ የሕፃናት፣ ማዕከላውያንና ወጣቶች የተሟላ የስነ-ህዝብና የተማሪዎች ቆጠራ ሰነድ...',
    content: 'በ፳፻፲፮ ዓ.ም. በጠቅላላው ፬፻፳ የተማሪዎች ቁጥር የተመዘገበ ሲሆን፤ የክፍላት ምደባው በስኬት ተከናውኗል።',
    readTime: '፫ ደቂቃ',
    isBookmarked: false,
    isFeatured: false,
    version: 1,
    tags: ['ቆጠራ', 'ሪፖርት', 'ምዝገባ'],
  },

  // --- 5. የሕዝብ ግንኙነትና ሚዲያ ክፍል (media) ---
  {
    id: 'w_med1',
    title: 'ሳምንታዊ የሰንበት ጉባኤ ማስታወቂያዎችና የዜና ማህደር',
    writerId: 'm_med1',
    writerName: 'ዲ/ን አማኑኤል ተስፋዬ',
    categoryId: 'literature',
    categoryName: 'ስነ ጽሁፍ',
    dateAmharic: 'ጥር ፲፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'media',
    departmentTitle: 'የሕዝብ ግንኙነትና ሚዲያ ክፍል',
    division: 'youth',
    excerpt: 'በየሳምንቱ በመቅደሱ አደባባይ የሚነበቡ ማስታወቂያዎች፣ የበዓላት ጥሪዎችና የሰንበት ት/ቤት ዜናዎች...',
    content: `የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የሕዝብ ግንኙነትና ሚዲያ ክፍል ሳምንታዊ ዜና መጽሔት።
- የጥምቀት በዓል አከባበር ዝግጅት ኮሚቴ ማሳሰቢያ
- የአዲሱ ሕንፃ እድሳት ድጋፍ ጥሪ
- የኪነጥበብ ክፍል አዳዲስ አባላት ምልመላ`,
    readTime: '፫ ደቂቃ',
    isBookmarked: false,
    isFeatured: true,
    approvedBy: 'የሚዲያ ክፍል ኃላፊ',
    version: 1,
    tags: ['ዜና', 'ማስታወቂያ', 'ሚዲያ'],
  },
  {
    id: 'w_med2',
    title: 'የ፳፻፲፭ ዓ.ም. የበዓለ ጥምቀትና የደብረ ታቦር ፎቶና ቪዲዮ ዘገባ',
    writerId: 'm_med2',
    writerName: 'ቤቴልሔም ንጉሤ',
    categoryId: 'photography',
    categoryName: 'ፎቶግራፍና ቪዲዮ',
    dateAmharic: 'ጥር ፳፪ ፳፻፲፭ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'media',
    departmentTitle: 'የሕዝብ ግንኙነትና ሚዲያ ክፍል',
    division: 'youth',
    excerpt: 'የሰንበት ት/ቤቱ ተማሪዎች በባህላዊ አልባሳት አጅበው ያሳለፉት የታሪክ ምስሎች ማህደር...',
    content: 'በዓለ ጥምቀት በደማቅ ሁኔታ የተከበረ ሲሆን፤ ከ፩፻፳ በላይ ፎቶዎችና ቪዲዮዎች ተሰንደዋል።',
    readTime: '፪ ደቂቃ',
    isBookmarked: false,
    isFeatured: false,
    version: 1,
    tags: ['ፎቶግራፍ', 'ጥምቀት', 'ቪዲዮ'],
  },

  // --- 6. የልማትና ገቢ ማሰባሰቢያ ክፍል (finance) ---
  {
    id: 'w_fin1',
    title: 'የሰንበት ት/ቤት ሁለገብ አዳራሽ ግንባታ ፕሮጀክት ፕሮፖዛል',
    writerId: 'm_fin1',
    writerName: 'አቶ ዘውዱ ታከለ',
    categoryId: 'event_docs',
    categoryName: 'የዝግጅት ሰነዶች',
    dateAmharic: 'ኅዳር ፲፪ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'finance',
    departmentTitle: 'የልማትና ገቢ ማሰባሰቢያ ክፍል',
    division: 'youth',
    excerpt: 'ለሰንበት ት/ቤት ቤተ መጻሕፍትና ለኪነጥበብ መድረክ የሚያገለግል ባለ ሁለት ፎቅ ሁለገብ ህንጻ ግንባታ ዕቅድ...',
    content: `የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የልማትና ገቢ ማሰባሰቢያ ክፍል የልማት ፕሮጀክት።

የፕሮጀክቱ ዓላማ፦
፩. ከ፰፻ በላይ ተማሪዎችን የሚያስተናግድ ዘመናዊ የመሰብሰቢያ አዳራሽ መገንባት፤
፪. ለብራና ቅርሶችና መጻሕፍት ጥበቃ የሚሆን ዲጂታል ቤተ መጻሕፍት ማደራጀት፤
፫. ለኪነጥበብ ልምምድ የሚሆኑ የድምፅና የመድረክ ክፍሎችን ማሟላት።`,
    readTime: '፮ ደቂቃ',
    isBookmarked: true,
    isFeatured: true,
    approvedBy: 'የደብሩ አስተዳዳሪና ሰበካ ጉባኤ',
    approvedDate: 'ኅዳር ፳ ፳፻፲፮ ዓ.ም',
    version: 1,
    tags: ['ልማት', 'ግንባታ', 'ፕሮጀክት'],
    hasPdfAttachment: true,
    pdfFileName: 'የሁለገብ_አዳራሽ_ፕሮጀክት_ፕሮፖዛል.pdf',
    pdfFileSize: '280 KB',
  },
  {
    id: 'w_fin2',
    title: 'የ፳፻፲፮ በጎ አድራጎትና የተማሪዎች የደንብ ልብስ ድጋፍ ዕቅድ',
    writerId: 'm_fin2',
    writerName: 'ወ/ሮ መሰረት አለሙ',
    categoryId: 'history',
    categoryName: 'ታሪክና ሪፖርት',
    dateAmharic: 'ታኅሣሥ ፭ ፳፻፲፮ ዓ.ም',
    status: 'APPROVED',
    departmentId: 'finance',
    departmentTitle: 'የልማትና ገቢ ማሰባሰቢያ ክፍል',
    division: 'children',
    excerpt: 'አቅመ ደካማ ለሆኑ ሕፃናት የተማሪዎች መማሪያ ደብተር፣ እርሳስና ነጭ ነጠላ የማሟላት የበጎ አድራጎት ሰነድ...',
    content: 'በዚህ ዓመት ከ፶ በላይ ለሚሆኑ ሕፃናት የትምህርት ቁሳቁስና አልባሳት ተበርክቷል።',
    readTime: '፫ ደቂቃ',
    isBookmarked: false,
    isFeatured: false,
    version: 1,
    tags: ['በጎ አድራጎት', 'ድጋፍ', 'ልማት'],
  },
];

export const ADDITIONAL_DEPARTMENT_MEMBERS: ChurchMember[] = [
  // ትምህርትና ስልጠና ክፍል
  {
    id: 'm_edu1',
    fullName: 'መምህር ኤርምያስ በላይ',
    duty: 'WRITER',
    phone: '0911-88-77-66',
    spiritualTitle: 'የስርዓተ ትምህርት አስተባባሪ',
    department: 'የትምህርትና ስልጠና ክፍል',
    departmentId: 'education',
    joinedYear: '፳፻፲ ዓ.ም',
    assignedWorksCount: 16,
    bio: 'የሃይማኖትና የመጽሐፍ ቅዱስ ጥናት ሞጁሎች አዘጋጅና መምህር።',
  },
  {
    id: 'm_edu2',
    fullName: 'መምህርት አስቴር ከበደ',
    duty: 'PRESENTER',
    phone: '0922-99-88-77',
    spiritualTitle: 'የመጽሐፍ ቅዱስ አስተማሪ',
    department: 'የትምህርትና ስልጠና ክፍል',
    departmentId: 'education',
    joinedYear: '፳፻፲፪ ዓ.ም',
    assignedWorksCount: 12,
    bio: 'ለሕፃናትና ማዕከላውያን የመጽሐፍ ቅዱስ ታሪኮችን የምታስተምር።',
  },

  // የመዝሙር ክፍል
  {
    id: 'm_mez1',
    fullName: 'ሊቀ መዘምራን ገብረ ማርያም',
    duty: 'ORGANIZER',
    phone: '0933-11-22-33',
    spiritualTitle: 'ዋና የዜማ መሪ',
    department: 'የመዝሙር ክፍል',
    departmentId: 'mezmur',
    joinedYear: '፳፻፰ ዓ.ም',
    assignedWorksCount: 22,
    bio: 'የቅዱስ ያሬድ ዜማ አሰልጣኝ እና የመዘምራን ዋና አስተባባሪ።',
  },
  {
    id: 'm_mez2',
    fullName: 'ይስሐቅ ወንድሙ',
    duty: 'PRESENTER',
    phone: '0944-22-33-44',
    spiritualTitle: 'የበገናና መሰንቆ መምህር',
    department: 'የመዝሙር ክፍል',
    departmentId: 'mezmur',
    joinedYear: '፳፻፲፩ ዓ.ም',
    assignedWorksCount: 14,
    bio: 'የበገና ዜማዎችን የሚያስተምርና በመድረክ ላይ የሚያቀርብ።',
  },

  // የአባላትና ቁጥጥር ክፍል
  {
    id: 'm_rec1',
    fullName: 'አቶ ሃብታሙ ወርቁ',
    duty: 'ORGANIZER',
    phone: '0955-33-44-55',
    spiritualTitle: 'ዋና ተቆጣጣሪ',
    department: 'የአባላትና ቁጥጥር ክፍል',
    departmentId: 'records',
    joinedYear: '፳፻፱ ዓ.ም',
    assignedWorksCount: 8,
    bio: 'የተማሪዎች ስነ-ስርዓት፣ መገኘትና የደብተር ምርመራ ኃላፊ።',
  },
  {
    id: 'm_rec2',
    fullName: 'ዲ/ን ብርሃኑ ግርማ',
    duty: 'WRITER',
    phone: '0966-44-55-66',
    spiritualTitle: 'የአባላት ምዝገባ ኃላፊ',
    department: 'የአባላትና ቁጥጥር ክፍል',
    departmentId: 'records',
    joinedYear: '፳፻፲፫ ዓ.ም',
    assignedWorksCount: 9,
    bio: 'የአዳዲስ ተማሪዎች ምዝገባና የስነ-ህዝብ መረጃዎች መዝጋቢ።',
  },

  // የሕዝብ ግንኙነትና ሚዲያ ክፍል
  {
    id: 'm_med1',
    fullName: 'ዲ/ን አማኑኤል ተስፋዬ',
    duty: 'ORGANIZER',
    phone: '0977-55-66-77',
    spiritualTitle: 'የሚዲያና ህ/ግ ኃላፊ',
    department: 'የሕዝብ ግንኙነትና ሚዲያ ክፍል',
    departmentId: 'media',
    joinedYear: '፳፻፲፪ ዓ.ም',
    assignedWorksCount: 15,
    bio: 'ሳምንታዊ ማስታወቂያዎች፣ ዜናዎችና የዲጂታል ገጾች አስተባባሪ።',
  },
  {
    id: 'm_med2',
    fullName: 'ቤቴልሔም ንጉሤ',
    duty: 'PRESENTER',
    phone: '0988-66-77-88',
    spiritualTitle: 'የፎቶና ቪዲዮ አዘጋጅ',
    department: 'የሕዝብ ግንኙነትና ሚዲያ ክፍል',
    departmentId: 'media',
    joinedYear: '፳፻፲፬ ዓ.ም',
    assignedWorksCount: 11,
    bio: 'የበዓላትና ዝግጅቶች ቋሚ ፎቶግራፈርና ቪዲዮ አዘጋጅ።',
  },

  // የልማትና ገቢ ማሰባሰቢያ ክፍል
  {
    id: 'm_fin1',
    fullName: 'አቶ ዘውዱ ታከለ',
    duty: 'ORGANIZER',
    phone: '0911-77-88-99',
    spiritualTitle: 'የልማት ኮሚቴ ሰብሳቢ',
    department: 'የልማትና ገቢ ማሰባሰቢያ ክፍል',
    departmentId: 'finance',
    joinedYear: '፳፻፯ ዓ.ም',
    assignedWorksCount: 7,
    bio: 'የህንጻ ግንባታና የልማት ፕሮጀክቶች ዋና አስተባባሪ።',
  },
  {
    id: 'm_fin2',
    fullName: 'ወ/ሮ መሰረት አለሙ',
    duty: 'PRESENTER',
    phone: '0922-88-99-00',
    spiritualTitle: 'የበጎ አድራጎት አስተባባሪ',
    department: 'የልማትና ገቢ ማሰባሰቢያ ክፍል',
    departmentId: 'finance',
    joinedYear: '፳፻፲ ዓ.ም',
    assignedWorksCount: 10,
    bio: 'የተማሪዎች ድጋፍና የበጎ አድራጎት ገንዘብ ማሰባሰቢያ መሪ።',
  },
];

export const ADDITIONAL_DEPARTMENT_EVENTS: CulturalEvent[] = [
  // ትምህርትና ስልጠና ክፍል
  {
    id: 'prog_edu1',
    title: 'ሳምንታዊ የመጽሐፍ ቅዱስ ጥናት ጉባኤ',
    recurrence: 'WEEKLY',
    dateAmharic: 'በየሳምንቱ ረቡዕ',
    timeAmharic: 'ከምሽቱ ፲፩:00 እስከ ፩:00',
    location: 'ክፍል ፪ — የመጽሐፍ ቅዱስ አዳራሽ',
    category: 'ሳምንታዊ ጥናት',
    description: 'በኦሪትና በወንጌላት ላይ ያተኮረ ጥልቅ የቃለ እግዚአብሔር ውይይትና ትምህርት።',
    organizer: 'የትምህርትና ስልጠና ክፍል',
    departmentId: 'education',
    departmentTitle: 'የትምህርትና ስልጠና ክፍል',
    assignments: [],
  },
  {
    id: 'prog_edu2',
    title: 'የሩብ ዓመት የተማሪዎች ፈተና ሳምንት',
    recurrence: 'MONTHLY',
    dateAmharic: 'በየሦስት ወሩ መጨረሻ እሁድ',
    timeAmharic: 'ከቀኑ ፯:፴ ጀምሮ',
    location: 'ሁሉም ክፍሎች',
    category: 'ፈተናና ምዘና',
    description: 'የሕፃናት፣ ማዕከላውያንና ወጣቶች የሩብ ዓመት የትምህርት ምዘና ፈተና።',
    organizer: 'የትምህርትና ስልጠና ክፍል',
    departmentId: 'education',
    departmentTitle: 'የትምህርትና ስልጠና ክፍል',
    assignments: [],
  },

  // የመዝሙር ክፍል
  {
    id: 'prog_mez1',
    title: 'የቅዳሜ የወጣቶችና ሕፃናት የመዝሙር ልምምድ',
    recurrence: 'WEEKLY',
    dateAmharic: 'በየሳምንቱ ቅዳሜ',
    timeAmharic: 'ከቀኑ ፰:00 እስከ ፲:፴',
    location: 'ደብረ ሣዊሮስ ታላቁ አዳራሽ',
    category: 'የመዝሙር ልምምድ',
    description: 'ለእሁድ ቅዳሴና ለወርሃዊ በዓላት የሚዘጋጁ ያሬዳዊ መዝሙራት ልምምድ።',
    organizer: 'የመዝሙር ክፍል',
    departmentId: 'mezmur',
    departmentTitle: 'የመዝሙር ክፍል',
    assignments: [],
  },
  {
    id: 'prog_mez2',
    title: 'የደብሩ ዓመታዊ የበዓላት ማኅሌት ዝግጅት',
    recurrence: 'YEARLY',
    dateAmharic: 'ጥቅምት ፲፬ ፳፻፲፮ ዓ.ም (ዓመታዊ)',
    timeAmharic: 'ከሌሊቱ ፮:00 ጀምሮ',
    location: 'በመቅደሱ አደባባይ',
    category: 'ዓመታዊ ማኅሌት',
    description: 'በቅዱስ ተክለ ሣዊሮስ በዓለ ንግሥ ሌሊቱን ሙሉ የሚቆም ያሬዳዊ ማኅሌትና ዜማ።',
    organizer: 'የመዝሙር ክፍል',
    departmentId: 'mezmur',
    departmentTitle: 'የመዝሙር ክፍል',
    assignments: [],
  },

  // የአባላትና ቁጥጥር ክፍል
  {
    id: 'prog_rec1',
    title: 'ወርሃዊ የአባላት መገኘትና የደብተር ቁጥጥር ጉባኤ',
    recurrence: 'MONTHLY',
    dateAmharic: 'በየወሩ መጨረሻ እሁድ',
    timeAmharic: 'ከቀኑ ፲:00 ጀምሮ',
    location: 'አስተዳደር ቢሮ',
    category: 'ቁጥጥርና ምዘና',
    description: 'የክፍላት መገኘት መዝገብና የተማሪዎች ስነ-ስርዓት ክትትል የሚደረግበት መድረክ።',
    organizer: 'የአባላትና ቁጥጥር ክፍል',
    departmentId: 'records',
    departmentTitle: 'የአባላትና ቁጥጥር ክፍል',
    assignments: [],
  },

  // የሕዝብ ግንኙነትና ሚዲያ ክፍል
  {
    id: 'prog_med1',
    title: 'ሳምንታዊ የሰንበት ጉባኤ ማስታወቂያ ስርጭት',
    recurrence: 'WEEKLY',
    dateAmharic: 'በየሳምንቱ እሁድ',
    timeAmharic: 'ከቀኑ ፮:፴ ጀምሮ',
    location: 'በመቅደሱ መድረክ',
    category: 'ማስታወቂያና ዜና',
    description: 'የሰንበት ት/ቤቱን ሳምንታዊ እንቅስቃሴዎች ለምዕመናን የማብሰር መርሐ ግብር።',
    organizer: 'የሕዝብ ግንኙነትና ሚዲያ ክፍል',
    departmentId: 'media',
    departmentTitle: 'የሕዝብ ግንኙነትና ሚዲያ ክፍል',
    assignments: [],
  },

  // የልማትና ገቢ ማሰባሰቢያ ክፍል
  {
    id: 'prog_fin1',
    title: 'ዓመታዊ የኪነጥበብ ባዛርና የልማት ገቢ ማሰባሰቢያ',
    recurrence: 'YEARLY',
    dateAmharic: 'ጥር ፳፰ ፳፻፲፮ ዓ.ም (ዓመታዊ)',
    timeAmharic: 'ከጠዋቱ ፫:00 ጀምሮ',
    location: 'የቤተክርስቲያኑ ሰፊ አደባባይ',
    category: 'ባዛርና ገቢ ማሰባሰቢያ',
    description: 'የኪነጥበብ ስራዎች ኤግዚቢሽን፣ መጽሐፍት ሽያጭና የሕንጻ ግንባታ ድጋፍ ማሰባሰቢያ።',
    organizer: 'የልማትና ገቢ ማሰባሰቢያ ክፍል',
    departmentId: 'finance',
    departmentTitle: 'የልማትና ገቢ ማሰባሰቢያ ክፍል',
    assignments: [],
  },
];
