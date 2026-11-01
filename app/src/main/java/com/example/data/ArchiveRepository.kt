package com.example.data

import com.example.model.ChurchMember
import com.example.model.CulturalEvent
import com.example.model.MemberDuty
import com.example.model.ProgramAssignment
import com.example.model.ProgramRecurrence
import com.example.model.SubmissionStatus
import com.example.model.SundaySchoolDivision
import com.example.model.UserProfile
import com.example.model.UserRole
import com.example.model.WorkCategory
import com.example.model.WorkItem
import com.example.model.Writer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * Architecture-ready repository for Tekle Sawiros Sunday School Art & Cultural Archive.
 * Pre-configured with rich authentic archival items, ready to bind with Cloud Firestore.
 */
class ArchiveRepository {

  val categories: List<WorkCategory> = listOf(
    WorkCategory(
      id = "poetry",
      nameAmharic = "ግጥም",
      nameEnglish = "Poetry",
      descriptionAmharic = "መንፈሳዊ እና ባህላዊ የግጥም ውቅር፣ ስነ ስንኝ እና የዜማ ድርሰቶች",
      iconName = "auto_stories",
      workCount = 28
    ),
    WorkCategory(
      id = "literature",
      nameAmharic = "ስነ ጽሁፍ",
      nameEnglish = "Literature",
      descriptionAmharic = "ረቂቅ ልቦለዶች፣ ድርሳናት፣ አስተማሪ አጫጭር ጽሁፎች እና የኪነጥበብ መጣጥፎች",
      iconName = "menu_book",
      workCount = 19
    ),
    WorkCategory(
      id = "theater",
      nameAmharic = "ቲያትር",
      nameEnglish = "Theater",
      descriptionAmharic = "በሰንበት ትምህርት ቤቱ መድረክ የቀረቡ ታላላቅ መንፈሳዊ ድራማዎችና ዝግጅቶች",
      iconName = "theater_comedy",
      workCount = 14
    ),
    WorkCategory(
      id = "monologue",
      nameAmharic = "መነባንብ",
      nameEnglish = "Monologue / Recitation",
      descriptionAmharic = "አንደበተ ርቱዕ ስነ ቃል፣ ስሜት ቀስቃሽ መነባንቦችና የግጥም ሙዚቃዊ ቅንብሮች",
      iconName = "record_voice_over",
      workCount = 16
    ),
    WorkCategory(
      id = "script",
      nameAmharic = "ስክሪፕት",
      nameEnglish = "Scripts",
      descriptionAmharic = "የመድረክ ዝግጅት መመሪያዎች፣ የድራማ ስክሪፕቶች እና የትዕይንት ሰነዶች",
      iconName = "description",
      workCount = 11
    ),
    WorkCategory(
      id = "art",
      nameAmharic = "ሥዕል",
      nameEnglish = "Art",
      descriptionAmharic = "ባህላዊ የብራና ሥዕሎች፣ የቤተክርስቲያን ጥበባዊ ስራዎች እና ስዕላዊ ምስሎች",
      iconName = "palette",
      workCount = 22
    ),
    WorkCategory(
      id = "photography",
      nameAmharic = "ፎቶግራፍ",
      nameEnglish = "Photography",
      descriptionAmharic = "የበዓላት፣ የዝግጅቶች እና የሰንበት ትምህርት ቤት ጉዞዎች ቋሚ የታሪክ ምስሎች",
      iconName = "photo_camera",
      workCount = 45
    ),
    WorkCategory(
      id = "video",
      nameAmharic = "ቪዲዮ",
      nameEnglish = "Video",
      descriptionAmharic = "የመድረክ ትዕይንቶች፣ ዘጋቢ ፊልሞች እና የተመረጡ የኪነጥበብ ቪዲዮዎች",
      iconName = "videocam",
      workCount = 12
    ),
    WorkCategory(
      id = "history",
      nameAmharic = "ታሪክ",
      nameEnglish = "Historical Archive",
      descriptionAmharic = "የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል መመስረትና የታሪክ ሰነዶች",
      iconName = "history_edu",
      workCount = 8
    ),
    WorkCategory(
      id = "event_docs",
      nameAmharic = "የዝግጅት ሰነዶች",
      nameEnglish = "Event Documentation",
      descriptionAmharic = "ዓመታዊ የኪነጥበብ ፌስቲቫሎች፣ ሲምፖዚየሞች እና የዝግጅት ቃለ-ጉባኤዎች",
      iconName = "folder_special",
      workCount = 15
    )
  )

  private val initialWorks = listOf(
    WorkItem(
      id = "w1",
      title = "የብርሃን ማዕበል እና የጽናት ቃል",
      writerId = "wr1",
      writerName = "ቃልኪዳን ሰይፉ",
      categoryId = "poetry",
      categoryName = "ግጥም",
      dateAmharic = "ጥር ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      excerpt = "በጥንታዊው ብራና ቀለም ሲነጥብ፣ የነፍስ ዜማ በዕጣን ጢስ ሲታጀብ...",
      content = """
በጥንታዊው ብራና ቀለም ሲነጥብ፣
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
የነገው ትውልድም የሚማርበት።
      """.trimIndent(),
      readTime = "፫ ደቂቃ",
      isBookmarked = true,
      isFeatured = true,
      approvedBy = "ቀሲስ ሰሎሞን (የሰንበት ት/ቤት ኃላፊ)",
      approvedDate = "ጥር ፳፪ ፳፻፲፮ ዓ.ም",
      version = 2,
      tags = listOf("ግጥም", "ቅኔ", "መንፈሳዊ ጽናት", "የተመረጠ"),
      hasPdfAttachment = true,
      pdfFileName = "የብርሃን_ማዕበል_እና_የጽናት_ቃል.pdf",
      pdfFileSize = "98 KB"
    ),
    WorkItem(
      id = "w2",
      title = "የተሰበረው ብዕር እና የቀለሙ ዋጋ",
      writerId = "wr2",
      writerName = "ሰላማዊት አበበ",
      categoryId = "literature",
      categoryName = "ስነ ጽሁፍ",
      dateAmharic = "ታኅሣሥ ፳፭ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      excerpt = "በአሮጌው የመጻሕፍት መደርደሪያ መካከል የተገኘው የድሮ ማስታወሻ የነገረን ታሪክ...",
      content = """
በአሮጌው የመጻሕፍት መደርደሪያ መካከል የተገኘው የድሮ ማስታወሻ እንዲህ ይላል፦ 

«ጥበብ ለነፍስ ምግብ ናት፤ የኪነጥበብ ክፍል አባላት በመድረክ ላይ ቆመው ቃለ እግዚአብሔርን በድራማና በግጥም ሲያስተላልፉ የተመለከተ ሰው፣ የጥበብን ታላቅነት ይገነዘባል። በዚያን ወቅት እያንዳንዷ ስክሪፕት በብራና ቀለም በእጅ ትጻፍ ነበር። ዛሬ በዲጂታል መዝገብ የምናስቀምጠው ያንን የቀደመውን ድካምና የትላንቱን መንፈሳዊ ታሪክ ነው።»

ይህ ጽሁፍ የኪነጥበብ አባላትን የነበረውን ጥልቅ ቁርጠኝነትና የጋራ አገልግሎት መንፈስ በማስታወስ ለዛሬው ወጣት አዲስ ኃይል ይሰጣል።
      """.trimIndent(),
      readTime = "፭ ደቂቃ",
      isBookmarked = false,
      isFeatured = true,
      approvedBy = "የግምገማ ኮሚቴ ሰብሳቢ",
      approvedDate = "ጥር ፭ ፳፻፲፮ ዓ.ም",
      version = 1,
      tags = listOf("ስነ ጽሁፍ", "ታሪክ", "ተክለ ሣዊሮስ"),
      hasPdfAttachment = true,
      pdfFileName = "የተሰበረው_ብዕር_ማስታወሻ.pdf",
      pdfFileSize = "142 KB"
    ),
    WorkItem(
      id = "w3",
      title = "ሰማዕቱ ሣዊሮስ — ባለ ሁለት ትዕይንት የመድረክ ቲያትር",
      writerId = "wr3",
      writerName = "ዮሐንስ ግርማ",
      categoryId = "theater",
      categoryName = "ቲያትር",
      dateAmharic = "ሕዳር ፲፪ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      excerpt = "ትዕይንት ፩፦ የቤተክርስቲያን መድረክ በደብዛዛ መብራት፤ የመዘምራን ድምፅ ከጀርባ ይሰማል...",
      content = """
ትዕይንት ፩፦ በጨለማና በብርሃን መካከል

ቦታ፦ የደብሩ ታላቅ አዳራሽ መድረክ
ገጸ-ባሕሪያት፦ አባ ተክለ ሣዊሮስ፣ ዲያቆን ሚካኤል፣ ህዝቡ

(መጋረጃው ሲከፈት ጥንታዊ የዋሽንት ዜማ ከጀርባ ይሰማል። አባ ተክለ ሣዊሮስ ብራናውን በእጃቸው ይዘው ወደ መድረኩ መሃል ይመጣሉ)

አባ ተክለ ሣዊሮስ፦
«ይህ ህዝብ የተጠማው የእውነትን ቃል ነው። እኛም በኪነጥበብ፣ በመንፈሳዊ መዝሙርና በቅኔ የጽድቅን መንገድ ልናሳየው ይገባል። ብዕራችሁ አይዝለል፤ ድምፃችሁም አይታጎል!»

ዲያቆን ሚካኤል፦
«አባታችን ሆይ፣ ዘመኑ ፈታኝ ቢሆንም፣ የሰንበት ትምህርት ቤቱ ወጣቶች በሙሉ ልብ ተነስተዋል!»
      """.trimIndent(),
      readTime = "፲ ደቂቃ",
      isBookmarked = true,
      isFeatured = true,
      approvedBy = "ሊቀ ጠበብት ዮሴፍ",
      approvedDate = "ሕዳር ፳ ፳፻፲፮ ዓ.ም",
      version = 3,
      tags = listOf("ቲያትር", "ድራማ", "የመድረክ ዝግጅት")
    ),
    WorkItem(
      id = "w4",
      title = "የመቅደሱ ድምፅ — ስሜት ቀስቃሽ መነባንብ",
      writerId = "wr1",
      writerName = "ቃልኪዳን ሰይፉ",
      categoryId = "monologue",
      categoryName = "መነባንብ",
      dateAmharic = "ጥቅምት ፳፱ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      excerpt = "ድምፅህ ከየት እንደመጣ ስትጠየቅ... ከመንበረ ክብሩ ነው በል!",
      content = """
(በዝግታና በጥልቅ ስሜት የሚነበብ)

እኔ የመቅደሱ ድምፅ ነኝ፤
የመቶ ዓመታት ጸሎት ያፈራኝ፣
በሰንበት ልጆች ዜማ ያደግሁ።
ሲነጋ በማለዳ ከደወሉ ጋር እነሳለሁ፣
ሲመሽ ከዕጣኑ ጢስ ጋር ወደ ሰማይ እወጣለሁ።

አንተ ወጣት ሆይ!
ብዕርህ ከኪስህ ሲወጣ ምን ጻፈ?
ድምፅህ በመድረክ ሲሰማ ምን ሰበከ?
ጥበብን ለመታሰቢያ ሳይሆን ለመዳን ተጠቀምባት!
      """.trimIndent(),
      readTime = "፬ ደቂቃ",
      isBookmarked = false,
      isFeatured = false,
      approvedBy = "ገምጋሚ ቦርድ",
      approvedDate = "ኅዳር ፩ ፳፻፲፮ ዓ.ም",
      version = 1,
      tags = listOf("መነባንብ", "ስነ ቃል")
    ),
    WorkItem(
      id = "w5",
      title = "የብራናው ቀለም ቅንብር — የጥንታዊ ስዕል ሰነድ",
      writerId = "wr4",
      writerName = "ሔኖክ ዳንኤል",
      categoryId = "art",
      categoryName = "ሥዕል",
      dateAmharic = "መስከረም ፲፭ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      excerpt = "ባህላዊ የኢትዮጵያ ቀለማት አመራረት እና የመጽሐፍ ቅዱስ ምስሎች ጥበባዊ ትርጓሜ...",
      content = """
የኢትዮጵያ ጥንታዊ የብራና ሥዕሎች በሶስት መሠረታዊ ቀለማት ይመራሉ፦ ቀይ (የፍቅርና የደም መታሰቢያ)፣ ቢጫ/ወርቅ (የመለኮታዊ ብርሃን ምልክት) እና ጥቁር (የምድርና የጽናት ቀለም)።

በተክለ ሣዊሮስ ሰንበት ት/ቤት የስዕል ክፍል ውስጥ የተዘጋጁት እነዚህ ሥራዎች ያንን ጥንታዊ የኦርቶዶክሳዊ ስነ-ስዕል መርህ ጠብቀው የተከናወኑ ናቸው።
      """.trimIndent(),
      readTime = "፮ ደቂቃ",
      isBookmarked = false,
      isFeatured = false,
      approvedBy = "ስነ ጥበብ አማካሪ",
      approvedDate = "መስከረም ፳ ፳፻፲፮ ዓ.ም",
      version = 1,
      tags = listOf("ሥዕል", "ብራና", "ቀለማት")
    ),
    WorkItem(
      id = "w6",
      title = "የ፳፻፲፭ ዓ.ም የኪነጥበብ ምሽት — የታሪክ ሰነድ",
      writerId = "wr2",
      writerName = "ሰላማዊት አበበ",
      categoryId = "history",
      categoryName = "ታሪክ",
      dateAmharic = "ነሐሴ ፲፮ ፳፻፲፭ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      excerpt = "በሰንበት ትምህርት ቤታችን ታሪክ ለመጀመሪያ ጊዜ የተዘጋጀው ታላቁ የኪነጥበብ ሲምፖዚየም...",
      content = """
በ፳፻፲፭ ዓ.ም የተካሄደው የኪነጥበብ ምሽት ከ፭፻ በላይ ተሳታፊዎችን ያስተናገደ ነበር። 

በዚህ ታሪካዊ ምሽት፦
፩. ከ፲፭ በላይ አዳዲስ ግጥሞች ቀርበዋል
፪. «የብርሃኑ መንገድ» የተሰኘው ድራማ ለመጀመሪያ ጊዜ ታይቷል
፫. የጥንታዊ ዜማዎችና የቅኔ ጥናት ሰነድ ለጉባኤው ቀርቧል

ይህ ሰነድ ወደፊት ለሚመጣው ትውልድ በዲጂታል መዝገብ ተጠብቆ እንዲቆይ ተወስኗል።
      """.trimIndent(),
      readTime = "፯ ደቂቃ",
      isBookmarked = false,
      isFeatured = false,
      approvedBy = "የሰንበት ት/ቤት አስተዳደር",
      approvedDate = "ነሐሴ ፳ ፳፻፲፭ ዓ.ም",
      version = 1,
      tags = listOf("ታሪክ", "ሰነድ", "ሲምፖዚየም")
    ),
    WorkItem(
      id = "w7",
      title = "የነጋሪት ድምፅ — አዲስ የታጨ ግጥም",
      writerId = "wr5",
      writerName = "ዳዊት ሙሉጌታ",
      categoryId = "poetry",
      categoryName = "ግጥም",
      dateAmharic = "የካቲት ፩ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.UNDER_REVIEW,
      excerpt = "በአዲሱ ዓመት ለግምገማ የቀረበ መንፈሳዊ ግጥም፤ በገምጋሚ ቦርድ እየታየ ያለ...",
      content = """
የነጋሪት ድምፅ ሲሰማ በሩቁ፣
የጥበብ ወዳጆች ከመንደር ሲዘልቁ፤
የእውነት ሻማ ይዘው ጨለማውን ጥሰው፣
በተክለ ሣዊሮስ በረከት ደርሰው።
      """.trimIndent(),
      readTime = "፫ ደቂቃ",
      isBookmarked = false,
      isFeatured = false,
      version = 1,
      tags = listOf("ረቂቅ", "ግጥም")
    ),
    WorkItem(
      id = "w8",
      title = "የመድረክ ዝግጅት መመሪያ ሰነድ ፪",
      writerId = "wr3",
      writerName = "ዮሐንስ ግርማ",
      categoryId = "script",
      categoryName = "ስክሪፕት",
      dateAmharic = "ጥር ፳፰ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.REVISION_REQUESTED,
      excerpt = "በቲያትር ኮሚቴው ጥቃቅን ማሻሻያ የተጠየቀበት የስክሪፕት ሰነድ...",
      content = "ትዕይንት ፫ ላይ ያለው ውይይት በመጠኑ እንዲሳጠርና የገጸ-ባሕሪያቱ አልባሳት ከዘመኑ ታሪክ ጋር እንዲስማማ ተጠይቋል።",
      readTime = "፭ ደቂቃ",
      isBookmarked = false,
      isFeatured = false,
      version = 2,
      reviewerFeedback = "እባክዎ ትዕይንት ፫ን ከመድረክ አቅም ጋር እንዲስማማ አሳጥረው በድጋሚ ያቅርቡ።",
      tags = listOf("ስክሪፕት", "ማሻሻያ")
    ),

    // --- የሕፃናት ክፍል ሥራዎች (Children Division Works) ---
    WorkItem(
      id = "w_c1",
      title = "የሕፃናት የዳዊትና ጎልያድ ተውኔት",
      writerId = "wr3",
      writerName = "ዮሐንስ ግርማ",
      categoryId = "theater",
      categoryName = "ቲያትር",
      dateAmharic = "ጥር ፲፭ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      division = SundaySchoolDivision.CHILDREN,
      excerpt = "ትንሹ እረኛ ዳዊት በእምነት ጽናት ግዙፉን ጎልያድ በጠጠር ድል ያደረገበት አስተማሪ የሕፃናት ድራማ...",
      content = """
ትዕይንት ፩፦ በኤላ ሸለቆ

ገጸ-ባሕሪያት፦ ታናሹ ዳዊት፣ ጎልያድ፣ የሳኦል ወታደሮች
(ዳዊት የወንጭፍ ጠጠሩን በእጁ ይዞ በፈገግታ መድረክ ላይ ይቆማል)

ዳዊት፦
«አንተ በሰይፍና በጦር በጭላዳም ወደ እኔ ትመጣለህ፤ እኔ ግን ዛሬ በተገዳደርኸው በእስራኤል ጭፍሮች አምላክ በሠራዊት ጌታ በእግዚአብሔር ስም እመጣብሃለሁ!»

(ሕፃናት ተዋንያን በደስታ እልልታ ያሰማሉ)
      """.trimIndent(),
      readTime = "፭ ደቂቃ",
      isBookmarked = true,
      isFeatured = true,
      approvedBy = "የሕፃናት ክፍል ኃላፊ",
      approvedDate = "ጥር ፳ ፳፻፲፮ ዓ.ም",
      version = 1,
      tags = listOf("ሕፃናት", "ተውኔት", "መጽሐፍ ቅዱስ"),
      hasPdfAttachment = true,
      pdfFileName = "የዳዊትና_ጎልያድ_የሕፃናት_ተውኔት.pdf",
      pdfFileSize = "115 KB"
    ),
    WorkItem(
      id = "w_c2",
      title = "የጠዋት ፀሐይ እና የኖኅ መርከብ — የሕፃናት ግጥም",
      writerId = "wr1",
      writerName = "ቃልኪዳን ሰይፉ",
      categoryId = "poetry",
      categoryName = "ግጥም",
      dateAmharic = "የካቲት ፪ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      division = SundaySchoolDivision.CHILDREN,
      excerpt = "በሰማይ የቀስተ ደመና ቃል ኪዳን፤ ርግቧ በወይራ ቅጠል ደስታን ይዛ ስትመጣ...",
      content = """
ጠዋት በማለዳ ፀሐይ ስትወጣ፣
የኖኅ መርከብ ላይ ርግቧ መጣ፤
የወይራ ቅጠል ይዛ በአፏ፣
ሰላምን አበሰረች በክንፏ።

ሕፃናት በሙሉ ሆነን በአንድነት፣
እንዘምር ለእግዚአብሔር በፍቅር በእውነት!
      """.trimIndent(),
      readTime = "፪ ደቂቃ",
      isBookmarked = false,
      isFeatured = true,
      approvedBy = "የሕፃናት መምህር",
      version = 1,
      tags = listOf("ሕፃናት", "ግጥም", "የኖኅ መርከብ")
    ),
    WorkItem(
      id = "w_c3",
      title = "የዮሴፍ ባለቀለም ካባ — የሕፃናት ተረትና ትምህርት",
      writerId = "wr2",
      writerName = "ሰላማዊት አበበ",
      categoryId = "literature",
      categoryName = "ስነ ጽሁፍ",
      dateAmharic = "ታኅሣሥ ፲ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      division = SundaySchoolDivision.CHILDREN,
      excerpt = "አባቱ ያዕቆብ የሰጠው ያ ውብ ባለቀለም ልብስና የሕልሙ ፍጻሜ በግብፅ ምድር...",
      content = "ዮሴፍ ወንድሞቹ ቢቀኑበትም እግዚአብሔርን ስለወደደ ሁልጊዜ መልካም ያደርግ ነበር። በግብፅ ምድርም ታላቅ ሰው ሆነ። እኛም ታማኞች እንሁን!",
      readTime = "፫ ደቂቃ",
      isBookmarked = false,
      isFeatured = false,
      tags = listOf("ሕፃናት", "ስነ ጽሁፍ", "ታሪክ")
    ),

    // --- የማዕከላውያን ክፍል ሥራዎች (Intermediates Division Works) ---
    WorkItem(
      id = "w_m1",
      title = "የነገው ፋና — የታዳጊዎች መነባንብ",
      writerId = "wr1",
      writerName = "ቃልኪዳን ሰይፉ",
      categoryId = "monologue",
      categoryName = "መነባንብ",
      dateAmharic = "ጥር ፳፭ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      division = SundaySchoolDivision.INTERMEDIATES,
      excerpt = "በታዳጊነት ዕድሜ የጥበብን መንገድ መምረጥ፤ በፈተናዎች ማዕበል ሳይናወጡ መቆም...",
      content = """
እኔ ማዕከላይ ነኝ፤
በሕፃንነትና በወጣትነት ድልድይ ላይ የቆምኩ።
ጥበብን ለመፈለግ ልቤ ይናፍቃል፣
የተክለ ሣዊሮስ ቃል በነፍሴ ይበራል።

በጉብዝናዬ ወራት ፈጣሪዬን አሰብኩ፣
የጥበብን ጽዋ በመቅደሱ ቀዳሁ!
      """.trimIndent(),
      readTime = "፬ ደቂቃ",
      isBookmarked = true,
      isFeatured = true,
      approvedBy = "የማዕከላውያን አስተባባሪ",
      version = 1,
      tags = listOf("ማዕከላውያን", "መነባንብ", "መንፈሳዊ ጉብዝና"),
      hasPdfAttachment = true,
      pdfFileName = "የነገው_ፋና_መነባንብ.pdf",
      pdfFileSize = "108 KB"
    ),
    WorkItem(
      id = "w_m2",
      title = "የጠቢቡ ሰሎሞን ምክር — የመድረክ ድራማ",
      writerId = "wr3",
      writerName = "ዮሐንስ ግርማ",
      categoryId = "theater",
      categoryName = "ቲያትር",
      dateAmharic = "ታኅሣሥ ፳ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      division = SundaySchoolDivision.INTERMEDIATES,
      excerpt = "ጥበብ ከመካሪዎች ጋር ናት፤ ታዳጊዎች የትምህርትና የመልካም ስነ-ምግባር ሚስጥር የሚማሩበት ተውኔት...",
      content = """
ትዕይንት ፩፦ የጥበብ አዳራሽ
ሰሎሞን፦ «ልጄ ሆይ የአባትህን ተግሣጽ ስማ፥ የእናትህንም ሕግ አትተዉ፤ ለራስህ የሞገስ አክሊል፥ ለአንገትህም ማዕርግ ይሆንልሃልና።»
      """.trimIndent(),
      readTime = "፯ ደቂቃ",
      isBookmarked = false,
      isFeatured = true,
      tags = listOf("ማዕከላውያን", "ቲያትር", "ጥበብ")
    ),
    WorkItem(
      id = "w_m3",
      title = "የዳንኤል ጽናት በአንበሶች ጉድጓድ — የታዳጊዎች ስክሪፕት",
      writerId = "wr3",
      writerName = "ዮሐንስ ግርማ",
      categoryId = "script",
      categoryName = "ስክሪፕት",
      dateAmharic = "ጥር ፭ ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.APPROVED,
      division = SundaySchoolDivision.INTERMEDIATES,
      excerpt = "በባቢሎን ቤተ-መንግሥት ውስጥ በእምነቱ ያልተደራደረው የወጣቱ ዳንኤል ታሪክ...",
      content = "ዳንኤል በቀን ሶስት ጊዜ መስኮቱን ወደ ኢየሩሳሌም ከፍቶ ይጸልይ ነበር። ንጉሡም በአንበሶች ጉድጓድ እንዲጣል ቢያደርግም እግዚአብሔር መልአኩን ልኮ የአንበሶቹን አፍ ዘጋ።",
      readTime = "፮ ደቂቃ",
      isBookmarked = false,
      isFeatured = false,
      tags = listOf("ማዕከላውያን", "ስክሪፕት", "ዳንኤል")
    )
  )

  private val _works = MutableStateFlow<List<WorkItem>>(initialWorks)
  val works: StateFlow<List<WorkItem>> = _works.asStateFlow()

  // Selected Sunday School Age Division Branch (ሕፃናት ፣ ማዕከላውያን ፣ ወጣት)
  private val _selectedDivision = MutableStateFlow(SundaySchoolDivision.YOUTH)
  val selectedDivision: StateFlow<SundaySchoolDivision> = _selectedDivision.asStateFlow()

  fun selectDivision(division: SundaySchoolDivision) {
    _selectedDivision.value = division
  }

  val writers: List<Writer> = listOf(
    Writer(
      id = "wr1",
      name = "ቃልኪዳን ሰይፉ",
      roleTitle = "ዋና የቅኔና የግጥም ደራሲ",
      bio = "በተክለ ሣዊሮስ ሰንበት ት/ቤት ከ፲ ዓመታት በላይ በግጥምና በመነባንብ ክፍል ያገለገለ ባለሙያ።",
      totalWorks = 14
    ),
    Writer(
      id = "wr2",
      name = "ሰላማዊት አበበ",
      roleTitle = "የስነ ጽሁፍና የታሪክ አዘጋጅ",
      bio = "የቤተክርስቲያን ድርሳናትን በማጥናት እና አጫጭር ትምህርታዊ ጽሁፎችን በማበርከት የምትታወቅ።",
      totalWorks = 9
    ),
    Writer(
      id = "wr3",
      name = "ዮሐንስ ግርማ",
      roleTitle = "የቲያትርና ስክሪፕት ደራሲ",
      bio = "በርካታ የመድረክ ድራማዎችን በመጻፍና በማዘጋጀት የሰንበት ት/ቤቱን የጥበብ ክፍል ያሳደገ።",
      totalWorks = 12
    ),
    Writer(
      id = "wr4",
      name = "ሔኖክ ዳንኤል",
      roleTitle = "የስነ ስዕል ባለሙያ",
      bio = "ጥንታዊ የብራና ስዕሎችን በዘመናዊ መንገድ የሚያዘጋጅና የሚያስተምር ሰዓሊ።",
      totalWorks = 7
    )
  )

  private val initialMembers = listOf(
    // ፀሃፊዎች (Writers / Scriptwriters)
    ChurchMember(
      id = "m_wr1",
      fullName = "ቃልኪዳን ሰይፉ",
      duty = MemberDuty.WRITER,
      phone = "0911-23-45-67",
      spiritualTitle = "ዋና ፀሃፊ",
      department = "የስነ ጽሁፍና የግጥም ክፍል",
      joinedYear = "፳፻፲፪ ዓ.ም",
      assignedWorksCount = 14,
      bio = "መንፈሳዊ ግጥሞች፣ ድርሳናትና የብራና ስነ ስንኞች ደራሲ።"
    ),
    ChurchMember(
      id = "m_wr2",
      fullName = "ዮሐንስ ግርማ",
      duty = MemberDuty.WRITER,
      phone = "0922-34-56-78",
      spiritualTitle = "የቴአትር ፀሃፊ",
      department = "የቲያትርና ስክሪፕት ክፍል",
      joinedYear = "፳፻፲፬ ዓ.ም",
      assignedWorksCount = 12,
      bio = "በርካታ የመድረክ ድራማዎችንና ተውኔቶችን የጻፈ የጥበብ አባል።"
    ),
    ChurchMember(
      id = "m_wr3",
      fullName = "ዳዊት ሙሉጌታ",
      duty = MemberDuty.WRITER,
      phone = "0933-45-67-89",
      spiritualTitle = "የግጥም ፀሃፊ",
      department = "የስነ ጽሁፍ ክፍል",
      joinedYear = "፳፻፲፭ ዓ.ም",
      assignedWorksCount = 8,
      bio = "አጫጭር ትረካዎችና የመነባንብ ጽሁፎችን የሚያዘጋጅ።"
    ),
    ChurchMember(
      id = "m_wr4",
      fullName = "ማርታ ዘውዱ",
      duty = MemberDuty.WRITER,
      phone = "0944-56-78-90",
      spiritualTitle = "የታሪክ ፀሃፊ",
      department = "የታሪክና ሰነድ ክፍል",
      joinedYear = "፳፻፲፫ ዓ.ም",
      assignedWorksCount = 9,
      bio = "የቤተክርስቲያን ድርሳናትንና የታሪክ ጥናቶችን የምታዘጋጅ።"
    ),

    // አዘጋጆች (Organizers / Directors / Producers)
    ChurchMember(
      id = "m_org1",
      fullName = "ሰላማዊት አበበ",
      duty = MemberDuty.ORGANIZER,
      phone = "0955-67-89-01",
      spiritualTitle = "ዋና አዘጋጅ",
      department = "የመድረክ ዝግጅት ክፍል",
      joinedYear = "፳፻፲፫ ዓ.ም",
      assignedWorksCount = 16,
      bio = "የመድረክ ዝግጅቶች እና የኪነጥበብ መርሐ-ግብራት አስተባባሪ።"
    ),
    ChurchMember(
      id = "m_org2",
      fullName = "ዲ/ን ቴዎድሮስ አማረ",
      duty = MemberDuty.ORGANIZER,
      phone = "0966-78-90-12",
      spiritualTitle = "የኪነጥበብ መሪና አዘጋጅ",
      department = "የኪነጥበብ ክፍል",
      joinedYear = "፳፻፲፩ ዓ.ም",
      assignedWorksCount = 20,
      bio = "የኪነጥበብ ክፍል ኃላፊ እና የፕሮግራም አዘጋጅ።"
    ),
    ChurchMember(
      id = "m_org3",
      fullName = "ኤልያስ ታደሰ",
      duty = MemberDuty.ORGANIZER,
      phone = "0977-89-01-23",
      spiritualTitle = "የቴክኒክና መድረክ አዘጋጅ",
      department = "የቴክኒክ ክፍል",
      joinedYear = "፳፻፲፬ ዓ.ም",
      assignedWorksCount = 11,
      bio = "የድምፅ፣ የመብራትና የመድረክ አቀማመጥ መሪ።"
    ),
    ChurchMember(
      id = "m_org4",
      fullName = "ሔኖክ ዳንኤል",
      duty = MemberDuty.ORGANIZER,
      phone = "0988-90-12-34",
      spiritualTitle = "የኤግዚቢሽን አዘጋጅ",
      department = "የስዕል ክፍል",
      joinedYear = "፳፻፲፭ ዓ.ም",
      assignedWorksCount = 7,
      bio = "የስዕላትና የብራና ኤግዚቢሽን ዋና አስተባባሪ።"
    ),

    // አቅራቢዎች (Presenters / Performers / Speakers)
    ChurchMember(
      id = "m_prs1",
      fullName = "በረከት ሃብታሙ",
      duty = MemberDuty.PRESENTER,
      phone = "0911-00-11-22",
      spiritualTitle = "ዋና የመድረክ አቅራቢ",
      department = "የመድረክ ክፍል",
      joinedYear = "፳፻፲፬ ዓ.ም",
      assignedWorksCount = 18,
      bio = "አንደበተ ርቱዕ ተራኪና የፕሮግራም መሪ።"
    ),
    ChurchMember(
      id = "m_prs2",
      fullName = "ሰሎሜ ጥላሁን",
      duty = MemberDuty.PRESENTER,
      phone = "0922-11-22-33",
      spiritualTitle = "የመነባንብ አቅራቢ",
      department = "የስነ ቃል ክፍል",
      joinedYear = "፳፻፲፭ ዓ.ም",
      assignedWorksCount = 13,
      bio = "ልብ የሚነኩ መንፈሳዊ መነባንቦችንና ግጥሞችን የምታቀርብ።"
    ),
    ChurchMember(
      id = "m_prs3",
      fullName = "ዲ/ን ናትናኤል ታፈሰ",
      duty = MemberDuty.PRESENTER,
      phone = "0933-22-33-44",
      spiritualTitle = "ተዋናይና አቅራቢ",
      department = "የቲያትር ክፍል",
      joinedYear = "፳፻፲፫ ዓ.ም",
      assignedWorksCount = 15,
      bio = "በመንፈሳዊ ተውኔቶች ዋና ዋና ገጸ-ባህሪያትን የሚወክል አቅራቢ።"
    ),
    ChurchMember(
      id = "m_prs4",
      fullName = "ሩት ተስፋዬ",
      duty = MemberDuty.PRESENTER,
      phone = "0944-33-44-55",
      spiritualTitle = "የስነ ጽሁፍ አቅራቢ",
      department = "የስነ ጽሁፍ ክፍል",
      joinedYear = "፳፻፲፮ ዓ.ም",
      assignedWorksCount = 9,
      bio = "ትምህርታዊ ጽሁፎችንና ታሪኮችን ለአድማጭ የምታቀርብ።"
    )
  )

  private val _members = MutableStateFlow<List<ChurchMember>>(initialMembers)
  val members: StateFlow<List<ChurchMember>> = _members.asStateFlow()

  fun addMember(
    fullName: String,
    duty: MemberDuty,
    phone: String,
    spiritualTitle: String,
    department: String,
    bio: String
  ): ChurchMember {
    val newMember = ChurchMember(
      id = "m_${System.currentTimeMillis()}",
      fullName = fullName,
      duty = duty,
      phone = phone,
      spiritualTitle = spiritualTitle,
      department = department,
      bio = bio
    )
    _members.update { listOf(newMember) + it }
    return newMember
  }

  fun deleteMember(memberId: String) {
    _members.update { list -> list.filter { it.id != memberId } }
  }

  private val initialEvents = listOf(
    // ፩. ሳምንታዊ መርሃ-ግብራት (Weekly Programs)
    CulturalEvent(
      id = "prog_w1",
      title = "እሁድ የሰንበት ጉባኤ እና የኪነጥበብ ሰዓት",
      recurrence = ProgramRecurrence.WEEKLY,
      dateAmharic = "በየሳምንቱ እሁድ",
      timeAmharic = "ከቀኑ ፯:፴ እስከ ፱:፴",
      location = "ተክለ ሣዊሮስ ታላቁ አዳራሽ",
      category = "ሳምንታዊ ጉባኤ",
      description = "በየሳምንቱ እሁድ ከቅዳሴና ትምህርተ ወንጌል በኋላ የሚቀርብ መንፈሳዊ የኪነጥበብ መድረክ።",
      organizer = "የኪነጥበብ ክፍል",
      assignments = listOf(
        ProgramAssignment(
          id = "asgn_w1",
          workId = "w1",
          workTitle = "የብርሃን ማዕበል እና የጽናት ቃል",
          workCategory = "ግጥም",
          writerMemberId = "m_wr1",
          writerMemberName = "ቃልኪዳን ሰይፉ",
          organizerMemberId = "m_org1",
          organizerMemberName = "ሰላማዊት አበበ",
          presenterMemberId = "m_prs2",
          presenterMemberName = "ሰሎሜ ጥላሁን",
          performanceNotes = "ከስብከተ ወንጌል በኋላ በመነባንብ ዜማ ከበገና አጃቢ ጋር ይቀርባል።"
        )
      )
    ),
    CulturalEvent(
      id = "prog_w2",
      title = "ሐሙስ የኪነጥበብ ስልጠናና የተሰጥዖ ልምምድ",
      recurrence = ProgramRecurrence.WEEKLY,
      dateAmharic = "በየሳምንቱ ሐሙስ",
      timeAmharic = "ከምሽቱ ፲፩:፴ እስከ ፩:00",
      location = "ክፍል ፫ - የጥበብ ማዕከል",
      category = "ሳምንታዊ ልምምድ",
      description = "ለአዳዲስና ነባር አባላት የሚሰጥ የስክሪፕት ዝግጅት፣ የመድረክ ድምፅና ትወና ተግባራዊ ልምምድ።",
      organizer = "የስልጠና እና ዝግጅት ክፍል",
      assignments = listOf(
        ProgramAssignment(
          id = "asgn_w2",
          workId = "w8",
          workTitle = "የመድረክ ዝግጅት መመሪያ ሰነድ ፪",
          workCategory = "ስክሪፕት",
          writerMemberId = "m_wr2",
          writerMemberName = "ዮሐንስ ግርማ",
          organizerMemberId = "m_org2",
          organizerMemberName = "ዲ/ን ቴዎድሮስ አማረ",
          presenterMemberId = "m_prs3",
          presenterMemberName = "ዲ/ን ናትናኤል ታፈሰ",
          performanceNotes = "የትዕይንት ፫ አቀራረብና የመድረክ አልባሳት ማስተካከያ ይደረግበታል።"
        )
      )
    ),

    // ፪. ወርሃዊ መርሃ-ግብራት (Monthly Programs)
    CulturalEvent(
      id = "prog_m1",
      title = "የቅዱስ ተክለ ሣዊሮስ ወርሃዊ በዓል የኪነጥበብ ምሽት",
      recurrence = ProgramRecurrence.MONTHLY,
      dateAmharic = "በየወሩ በ፲፭ኛው ቀን",
      timeAmharic = "ከቀኑ ፰:00 ጀምሮ",
      location = "ደብረ ሣዊሮስ ታላቁ አዳራሽ",
      category = "ወርሃዊ በዓል",
      description = "በታቦተ በዓሉ ቀን የሚዘጋጅ የድርሳናት ንባብ፣ መንፈሳዊ ግጥሞችና የዜማ ምሽት።",
      organizer = "የሰንበት ት/ቤት አስተዳደር",
      assignments = listOf(
        ProgramAssignment(
          id = "asgn_m1",
          workId = "w6",
          workTitle = "የ፳፻፲፭ ዓ.ም የኪነጥበብ ምሽት — የታሪክ ሰነድ",
          workCategory = "ታሪክ",
          writerMemberId = "m_wr4",
          writerMemberName = "ማርታ ዘውዱ",
          organizerMemberId = "m_org3",
          organizerMemberName = "ኤልያስ ታደሰ",
          presenterMemberId = "m_prs1",
          presenterMemberName = "በረከት ሃብታሙ",
          performanceNotes = "የቅዱስ ተክለ ሣዊሮስ ገድልና የሰንበት ትምህርት ቤቱ ጥንታዊ ታሪክ ለምዕመናን ይተረካል።"
        )
      )
    ),
    CulturalEvent(
      id = "prog_m2",
      title = "ወርሃዊ የስነ ጽሁፍ እና የቅኔ ጉባኤ",
      recurrence = ProgramRecurrence.MONTHLY,
      dateAmharic = "በየወሩ መጨረሻ ቅዳሜ",
      timeAmharic = "ከቀኑ ፱:00 ጀምሮ",
      location = "የሰንበት ት/ቤት ቤተ መጻሕፍት አዳራሽ",
      category = "ወርሃዊ ጉባኤ",
      description = "የአባላት አዳዲስ የፈጠራ ስራዎች ግምገማ፣ የቅኔ አፈታት እና የስነ ጽሁፍ ውይይት መድረክ።",
      organizer = "የስነ ጽሁፍ ክፍል",
      assignments = listOf(
        ProgramAssignment(
          id = "asgn_m2",
          workId = "w7",
          workTitle = "የነጋሪት ድምፅ — አዲስ የታጨ ግጥም",
          workCategory = "ግጥም",
          writerMemberId = "m_wr3",
          writerMemberName = "ዳዊት ሙሉጌታ",
          organizerMemberId = "m_org1",
          organizerMemberName = "ሰላማዊት አበበ",
          presenterMemberId = "m_prs4",
          presenterMemberName = "ሩት ተስፋዬ",
          performanceNotes = "የአዲሱ ግጥም ትንታኔ እና የቋንቋ ውበት ግምገማ በጉባኤው ይቀርባል።"
        )
      )
    ),

    // ፫. ዓመታዊ መርሃ-ግብራት (Yearly Programs)
    CulturalEvent(
      id = "prog_y1",
      title = "ታላቁ ዓመታዊ የኪነጥበብ እና የስነ ጽሁፍ ፌስቲቫል",
      recurrence = ProgramRecurrence.YEARLY,
      dateAmharic = "መጋቢት ፲፭ ፳፻፲፮ ዓ.ም (ዓመታዊ)",
      timeAmharic = "ከቀኑ ፰:00 ጀምሮ",
      location = "ደብረ ሣዊሮስ ታላቁ የመሰብሰቢያ አዳራሽ",
      category = "ዓመታዊ ፌስቲቫል",
      description = "አዳዲስ የተዘጋጁ ድራማዎች፣ የቅኔና የግጥም ምሽት እንዲሁም የስዕል ኤግዚቢሽን የሚቀርብበት ልዩ ዝግጅት።",
      organizer = "የኪነጥበብ ክፍል አስተባባሪ",
      assignments = listOf(
        ProgramAssignment(
          id = "asgn_y1",
          workId = "w2",
          workTitle = "የብርሃኑ መንገድ — መንፈሳዊ ተውኔት",
          workCategory = "ቲያትር",
          writerMemberId = "m_wr2",
          writerMemberName = "ዮሐንስ ግርማ",
          organizerMemberId = "m_org2",
          organizerMemberName = "ዲ/ን ቴዎድሮስ አማረ",
          presenterMemberId = "m_prs3",
          presenterMemberName = "ዲ/ን ናትናኤል ታፈሰ",
          performanceNotes = "ከ፲፪ በላይ ተዋንያንን ያካተተ ዋናው ዓመታዊ የመድረክ ትዕይንት በደማቅ አልባሳት ይቀርባል።"
        )
      )
    ),
    CulturalEvent(
      id = "prog_y2",
      title = "ዓመታዊ የብራና ቅርስ እና የስዕል ኤግዚቢሽን",
      recurrence = ProgramRecurrence.YEARLY,
      dateAmharic = "ጳጉሜን ፫ ፳፻፲፮ ዓ.ም (ዓመታዊ)",
      timeAmharic = "ከቀኑ ፱:00 ጀምሮ",
      location = "የኪነጥበብ አውደ ርዕይ ማዕከል",
      category = "ዓመታዊ ኤግዚቢሽን",
      description = "የዓመቱ ምርጥ የኪነጥበብ ስራዎች፣ ጥንታዊ የብራና ጽሁፎች እና የስዕል ውጤቶች ለዕይታ የሚቀርቡበት መድረክ።",
      organizer = "የሰነድና የታሪክ ክፍል",
      assignments = listOf(
        ProgramAssignment(
          id = "asgn_y2",
          workId = "w5",
          workTitle = "የጥንታዊ ብራና ቀለማት እና የቅዱሳን ስዕላት",
          workCategory = "ሥዕል",
          writerMemberId = "m_wr1",
          writerMemberName = "ቃልኪዳን ሰይፉ",
          organizerMemberId = "m_org4",
          organizerMemberName = "ሔኖክ ዳንኤል",
          presenterMemberId = "m_prs1",
          presenterMemberName = "በረከት ሃብታሙ",
          performanceNotes = "የቀለማቱ አመራረትና የብራናው ታሪካዊ ፋይዳ ለጎብኚዎች ይብራራል።"
        )
      )
    )
  )

  private val _events = MutableStateFlow<List<CulturalEvent>>(initialEvents)
  val events: StateFlow<List<CulturalEvent>> = _events.asStateFlow()

  fun addEvent(
    title: String,
    dateAmharic: String,
    timeAmharic: String,
    location: String,
    category: String,
    description: String,
    organizer: String,
    recurrence: ProgramRecurrence = ProgramRecurrence.WEEKLY,
    assignments: List<ProgramAssignment> = emptyList()
  ): CulturalEvent {
    val newEvent = CulturalEvent(
      id = "prog_${System.currentTimeMillis()}",
      title = title,
      recurrence = recurrence,
      dateAmharic = dateAmharic,
      timeAmharic = timeAmharic,
      location = location,
      category = category,
      description = description,
      organizer = organizer,
      assignments = assignments
    )
    _events.update { listOf(newEvent) + it }
    return newEvent
  }

  fun addAssignmentToProgram(eventId: String, assignment: ProgramAssignment) {
    _events.update { list ->
      list.map { ev ->
        if (ev.id == eventId) {
          ev.copy(assignments = ev.assignments + assignment)
        } else {
          ev
        }
      }
    }
  }

  fun toggleAssignmentCompletion(eventId: String, assignmentId: String) {
    _events.update { list ->
      list.map { ev ->
        if (ev.id == eventId) {
          ev.copy(
            assignments = ev.assignments.map { asgn ->
              if (asgn.id == assignmentId) asgn.copy(isCompleted = !asgn.isCompleted) else asgn
            }
          )
        } else {
          ev
        }
      }
    }
  }

  fun deleteEvent(eventId: String) {
    _events.update { list -> list.filter { it.id != eventId } }
  }

  private val _currentUser = MutableStateFlow(
    UserProfile(
      id = "u_default",
      fullName = "ቃልኪዳን ሰይፉ",
      email = "kalkidan@teklesawiros.org",
      role = UserRole.ADMIN,
      department = "የሰንበት ት/ቤት አስተዳደር እና ኪነጥበብ ክፍል",
      joinedDate = "መስከረም ፳፻፲፭ ዓ.ም",
      myWorksCount = 4,
      mySubmissionsCount = 2,
      myBookmarksCount = 3
    )
  )
  val currentUser: StateFlow<UserProfile> = _currentUser.asStateFlow()

  fun setUserRole(role: UserRole) {
    _currentUser.update { it.copy(role = role) }
  }

  fun toggleBookmark(workId: String) {
    _works.update { list ->
      list.map { work ->
        if (work.id == workId) work.copy(isBookmarked = !work.isBookmarked) else work
      }
    }
  }

  fun submitNewWork(
    title: String,
    categoryId: String,
    content: String,
    excerpt: String,
    tags: List<String>,
    writerName: String = _currentUser.value.fullName,
    division: SundaySchoolDivision = _selectedDivision.value,
    hasPdfAttachment: Boolean = false,
    pdfFileName: String? = null,
    pdfFileSize: String? = null,
    pdfLocalPath: String? = null
  ): WorkItem {
    val category = categories.find { it.id == categoryId }
    val newWork = WorkItem(
      id = "w_${System.currentTimeMillis()}",
      title = title,
      writerId = _currentUser.value.id,
      writerName = writerName.ifBlank { _currentUser.value.fullName },
      categoryId = categoryId,
      categoryName = category?.nameAmharic ?: "ስነ ጽሁፍ",
      dateAmharic = "የካቲት ፳፻፲፮ ዓ.ም",
      status = SubmissionStatus.UNDER_REVIEW,
      excerpt = excerpt.ifBlank { content.take(90) + "..." },
      content = content,
      readTime = "፬ ደቂቃ",
      division = division,
      version = 1,
      tags = tags,
      hasPdfAttachment = hasPdfAttachment,
      pdfFileName = pdfFileName,
      pdfFileSize = pdfFileSize,
      pdfLocalPath = pdfLocalPath
    )
    _works.update { listOf(newWork) + it }
    _currentUser.update { it.copy(mySubmissionsCount = it.mySubmissionsCount + 1) }
    return newWork
  }

  fun attachPdfToWork(
    workId: String,
    fileName: String,
    fileSize: String,
    localPath: String
  ) {
    _works.update { list ->
      list.map { work ->
        if (work.id == workId) {
          work.copy(
            hasPdfAttachment = true,
            pdfFileName = fileName,
            pdfFileSize = fileSize,
            pdfLocalPath = localPath
          )
        } else work
      }
    }
  }

  fun reviewWorkAction(
    workId: String,
    newStatus: SubmissionStatus,
    feedback: String?,
    reviewerName: String = "ቀሲስ ሰሎሞን (ገምጋሚ ኃላፊ)"
  ) {
    _works.update { list ->
      list.map { work ->
        if (work.id == workId) {
          work.copy(
            status = newStatus,
            reviewerFeedback = feedback,
            approvedBy = if (newStatus == SubmissionStatus.APPROVED) reviewerName else work.approvedBy,
            approvedDate = if (newStatus == SubmissionStatus.APPROVED) "የካቲት ፳፻፲፮ ዓ.ም" else work.approvedDate
          )
        } else work
      }
    }
  }

  private val _themeMode = MutableStateFlow(AppThemeMode.LIGHT)
  val themeMode: StateFlow<AppThemeMode> = _themeMode.asStateFlow()

  fun setThemeMode(mode: AppThemeMode) {
    _themeMode.value = mode
  }

  fun toggleThemeMode() {
    _themeMode.update { current ->
      if (current == AppThemeMode.LIGHT) AppThemeMode.DARK else AppThemeMode.LIGHT
    }
  }

  fun updateSubmissionStatus(
    workId: String,
    newStatus: SubmissionStatus,
    approvedBy: String? = null,
    feedback: String? = null
  ) {
    reviewWorkAction(
      workId = workId,
      newStatus = newStatus,
      feedback = feedback,
      reviewerName = approvedBy ?: "ቀሲስ ሰሎሞን (ገምጋሚ ኃላፊ)"
    )
  }

  // --- Liturgical Audio / Recitation Player State (Modern Island Audio) ---
  private val defaultAudioTracks = listOf(
    LiturgicalAudioTrack(
      id = "trk_w1",
      title = "የብርሃን ማዕበል እና የጽናት ቃል",
      narratorOrCantor = "ቃልኪዳን ሰይፉ (የግጥም ፀሐፊ)",
      division = SundaySchoolDivision.YOUTH,
      categoryName = "ግጥም / መነባንብ",
      durationAmharic = "፫:፵፭",
      durationSeconds = 225,
      description = "በጥንታዊው ብራና ቀለም ሲነጥብ፣ የነፍስ ዜማ በዕጣን ጢስ ሲታጀብ..."
    ),
    LiturgicalAudioTrack(
      id = "trk_wc1",
      title = "የሕፃናት የዳዊትና ጎልያድ ተውኔት ድምፅ",
      narratorOrCantor = "ዮሐንስ ግርማ (ተራኪ)",
      division = SundaySchoolDivision.CHILDREN,
      categoryName = "ተውኔት",
      durationAmharic = "፪:፶፭",
      durationSeconds = 175,
      description = "ትንሹ እረኛ ዳዊት በእምነት ጽናት ጎልያድን ድል ያደረገበት አስተማሪ የሕፃናት ድራማ ድምፅ።"
    ),
    LiturgicalAudioTrack(
      id = "trk_w2",
      title = "የብርሃኑ መንገድ — የመድረክ ትዕይንት",
      narratorOrCantor = "ዲ/ን ቴዎድሮስ አማረ (አዘጋጅ)",
      division = SundaySchoolDivision.INTERMEDIATES,
      categoryName = "ቲያትር",
      durationAmharic = "፭:፲፪",
      durationSeconds = 312,
      description = "የቅዱሳን አበው ፈለግና የጽናት መንገድ ድምፃዊ ተውኔት።"
    )
  )

  private val _audioTracks = MutableStateFlow(defaultAudioTracks)
  val audioTracks: StateFlow<List<LiturgicalAudioTrack>> = _audioTracks.asStateFlow()

  private val _currentAudioTrack = MutableStateFlow<LiturgicalAudioTrack?>(null)
  val currentAudioTrack: StateFlow<LiturgicalAudioTrack?> = _currentAudioTrack.asStateFlow()

  private val _isAudioPlaying = MutableStateFlow(false)
  val isAudioPlaying: StateFlow<Boolean> = _isAudioPlaying.asStateFlow()

  private val _audioProgress = MutableStateFlow(0.28f)
  val audioProgress: StateFlow<Float> = _audioProgress.asStateFlow()

  fun playTrack(track: LiturgicalAudioTrack) {
    _currentAudioTrack.value = track
    _isAudioPlaying.value = true
  }

  fun playWorkAudio(work: WorkItem) {
    val track = LiturgicalAudioTrack(
      id = "trk_${work.id}",
      title = work.title,
      narratorOrCantor = "${work.writerName} (የኪነጥበብ አቅራቢ)",
      division = work.division,
      categoryName = work.categoryName,
      durationAmharic = "፫:፳",
      durationSeconds = 200,
      description = work.excerpt
    )
    _currentAudioTrack.value = track
    _isAudioPlaying.value = true
    _audioProgress.value = 0.05f
  }

  fun toggleAudioPlayPause() {
    if (_currentAudioTrack.value == null) {
      _currentAudioTrack.value = defaultAudioTracks.first()
      _isAudioPlaying.value = true
    } else {
      _isAudioPlaying.update { !it }
    }
  }

  fun stopAudio() {
    _isAudioPlaying.value = false
    _currentAudioTrack.value = null
  }

  fun updateAudioProgress(progress: Float) {
    _audioProgress.value = progress.coerceIn(0f, 1f)
  }

  fun deleteWork(workId: String) {
    _works.update { list -> list.filter { it.id != workId } }
  }

  companion object {
    val instance = ArchiveRepository()
  }
}

/**
 * Liturgical audio recitation track model (መነባንብ፣ ዝማሬ፣ የተውኔት ድምፅ)
 */
data class LiturgicalAudioTrack(
  val id: String,
  val title: String,
  val narratorOrCantor: String,
  val division: SundaySchoolDivision,
  val categoryName: String,
  val durationAmharic: String = "፫:፵፭",
  val durationSeconds: Int = 225,
  val description: String = ""
)

/**
 * Visual Theme Mode options for the manuscript archive
 */
enum class AppThemeMode(val titleAmharic: String, val subtitleAmharic: String) {
  LIGHT("ብሩህ ገጽ (Bright Mode)", "የቀን የብራና ወረቀት ገጽታ"),
  DARK("የጨለማ ገጽ (Dark Mode)", "የሌሊት የብራና ቤተ መጻሕፍት ገጽታ"),
  SYSTEM("የስርዓቱ ምርጫ (System)", "ከስልክዎ የቀን/የሌሊት ምርጫ ጋር የሚስማማ")
}
