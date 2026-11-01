package com.example.model

enum class UserRole(val amharicTitle: String, val description: String) {
  MEMBER("ተጠቃሚ / አባል", "የጸደቁ ሥራዎችን ማንበብና ማሰስ"),
  CONTRIBUTOR("ደራሲ / አቅራቢ", "የፈጠራ ሥራዎችን ማዘጋጀትና ማቅረብ"),
  REVIEWER("ገምጋሚ / የቤ/ክ ኃላፊ", "የቀረቡ ሥራዎችን መገምገምና ማጽደቅ"),
  EDITOR("አዘጋጅ", "ለሕትመትና ለመዝገብ ማዘጋጀት"),
  ADMIN("አስተዳዳሪ", "የስርዓቱን አስተዳደር መቆጣጠር"),
  SUPER_ADMIN("ዋና አስተዳዳሪ", "ሙሉ ቁጥጥር")
}

enum class SubmissionStatus(val amharicLabel: String, val stageOrder: Int) {
  DRAFT("ረቂቅ", 1),
  UNDER_REVIEW("በግምገማ ላይ", 2),
  REVISION_REQUESTED("ማሻሻያ የተጠየቀበት", 3),
  APPROVED("የጸደቀ", 4),
  PUBLISHED("የታተመ", 5),
  ARCHIVED("የተመዘገበ", 6)
}

/**
 * Sunday School Age Division Branch (ሕፃናት ፣ ማዕከላውያን ፣ ወጣት)
 * Used to branch and separate the entire art & cultural content
 */
enum class SundaySchoolDivision(
  val id: String,
  val titleAmharic: String,
  val subtitleAmharic: String,
  val ageRangeAmharic: String,
  val descriptionAmharic: String,
  val badgeLabel: String,
  val mottoAmharic: String
) {
  CHILDREN(
    id = "children",
    titleAmharic = "ሕፃናት",
    subtitleAmharic = "የሕፃናት የኪነጥበብና የመዝሙር ክፍል",
    ageRangeAmharic = "ከ፬ - ፲፪ ዓመት",
    descriptionAmharic = "ለሕፃናት የተዘጋጁ መንፈሳዊ ታሪኮች፣ ቀላል ግጥሞች፣ አስተማሪ አጫጭር ተውኔቶች፣ ስዕሎችና የሕፃናት ዜማዎች።",
    badgeLabel = "ሕፃናት ክፍል",
    mottoAmharic = "«ሕፃናትን ተዉአቸው ወደ እኔም ይመጡ ዘንድ አትከልክሏቸው»"
  ),
  INTERMEDIATES(
    id = "intermediates",
    titleAmharic = "ማዕከላውያን",
    subtitleAmharic = "የማዕከላውያን የኪነጥበብ መድረክ",
    ageRangeAmharic = "ከ፲፫ - ፲፰ ዓመት",
    descriptionAmharic = "የታዳጊዎች የፈጠራ ስራዎች፣ የመጽሐፍ ቅዱስ ድራማዎች፣ መነባንቦች፣ የስነ-ጽሁፍ ጥናትና የጋራ ዝግጅቶች።",
    badgeLabel = "ማዕከላውያን ክፍል",
    mottoAmharic = "«በጉብዝናህ ወራት ፈጣሪህን አስብ»"
  ),
  YOUTH(
    id = "youth",
    titleAmharic = "ወጣት",
    subtitleAmharic = "የወጣቶች የኪነጥበብና የምርምር ማዕከል",
    ageRangeAmharic = "ከ፲፱ ዓመት በላይ",
    descriptionAmharic = "ጥልቅ መንፈሳዊ ቲያትሮች፣ የብራና ቅርስ ጥናት፣ ረቂቅ ስነ-ጽሁፍ፣ ሲምፖዚየሞችና ዓመታዊ ታላላቅ ፌስቲቫሎች።",
    badgeLabel = "ወጣት ክፍል",
    mottoAmharic = "«ወጣቶች ሆይ ብርቱዎች ስለ ሆናችሁ እጽፍላችኋለሁ»"
  );

  companion object {
    fun fromId(id: String?): SundaySchoolDivision {
      return entries.find { it.id == id } ?: YOUTH
    }
  }
}

data class WorkCategory(
  val id: String,
  val nameAmharic: String,
  val nameEnglish: String,
  val descriptionAmharic: String,
  val iconName: String,
  val workCount: Int = 0
)

data class WorkItem(
  val id: String,
  val title: String,
  val writerId: String,
  val writerName: String,
  val categoryId: String,
  val categoryName: String,
  val dateAmharic: String,
  val status: SubmissionStatus,
  val excerpt: String,
  val content: String,
  val readTime: String,
  val division: SundaySchoolDivision = SundaySchoolDivision.YOUTH,
  val isBookmarked: Boolean = false,
  val isFeatured: Boolean = false,
  val approvedBy: String? = null,
  val approvedDate: String? = null,
  val version: Int = 1,
  val reviewerFeedback: String? = null,
  val tags: List<String> = emptyList(),
  val hasPdfAttachment: Boolean = false,
  val pdfFileName: String? = null,
  val pdfFileSize: String? = null,
  val pdfLocalPath: String? = null
)

data class Writer(
  val id: String,
  val name: String,
  val roleTitle: String,
  val bio: String,
  val totalWorks: Int,
  val isVerified: Boolean = true
)

enum class ProgramRecurrence(val amharicLabel: String, val englishLabel: String) {
  WEEKLY("ሳምንታዊ", "Weekly"),
  MONTHLY("ወርሃዊ", "Monthly"),
  YEARLY("ዓመታዊ", "Yearly")
}

enum class MemberDuty(val amharicTitle: String) {
  WRITER("ፀሃፊ"),     // ፀሃፊ
  ORGANIZER("አዘጋጅ"), // አዘጋጅ
  PRESENTER("አቅራቢ")  // አቅራቢ
}

data class ChurchMember(
  val id: String,
  val fullName: String,
  val duty: MemberDuty, // ፀሃፊ, አዘጋጅ, አቅራቢ
  val phone: String = "",
  val spiritualTitle: String = "አባል",
  val department: String = "የኪነጥበብ ክፍል",
  val joinedYear: String = "፳፻፲፭ ዓ.ም",
  val assignedWorksCount: Int = 0,
  val bio: String = ""
)

data class ProgramAssignment(
  val id: String,
  val workId: String? = null,
  val workTitle: String,
  val workCategory: String,
  val writerMemberId: String? = null,
  val writerMemberName: String,     // ፀሃፊ
  val organizerMemberId: String? = null,
  val organizerMemberName: String,  // አዘጋጅ
  val presenterMemberId: String? = null,
  val presenterMemberName: String,  // አቅራቢ
  val performanceNotes: String = "",
  val isCompleted: Boolean = false
)

data class CulturalEvent(
  val id: String,
  val title: String,
  val recurrence: ProgramRecurrence = ProgramRecurrence.WEEKLY,
  val dateAmharic: String,
  val timeAmharic: String,
  val location: String,
  val category: String,
  val description: String,
  val organizer: String,
  val division: SundaySchoolDivision? = null,
  val assignments: List<ProgramAssignment> = emptyList()
)

data class UserProfile(
  val id: String,
  val fullName: String,
  val email: String,
  val role: UserRole,
  val department: String,
  val joinedDate: String,
  val myWorksCount: Int,
  val mySubmissionsCount: Int,
  val myBookmarksCount: Int
)
