# መዝገበ ኪነጥበብ (Mezgebe Kinetibeb)
### የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ እና ባህላዊ መዝገብ
**Tekle Sawiros Sunday School Art & Cultural Archive (Est. 1957 / ፲፱፻፶፯ ዓ.ም.)**

A modern, responsive React + TypeScript web application rewritten from the original Android application, preserving all archival features, age division branching, liturgical programs, and Ge'ez manuscript aesthetics.

---

## ቁልፍ ገጽታዎችና ክፍላት (Key Features)

1. **ዕድሜ ተኮር የክፍላት ክፍፍል (Age Division Branching):**
   - **ሕፃናት (Children: 4–12)**: Simple spiritual stories, songs, children's plays, poems.
   - **ማዕከላውያን (Intermediates: 13–18)**: Bible dramas, monologues, adolescent literary studies.
   - **ወጣት (Youth: 19+)**: Deep theological plays, manuscript heritage studies, symposia.

2. **10 የኪነጥበብ ዘርፎች (10 Art Categories):**
   - ግጥም (Poetry), ስነ ጽሁፍ (Literature), ቲያትር (Theater), መነባንብ (Monologue), ስክሪፕት (Script), ሥዕል (Art), ፎቶግራፍ (Photography), ቪዲዮ (Video), ታሪክ (Historical Archive), የዝግጅት ሰነዶች (Event Documentation).

3. **የብራና ንባብና ገጽ እይታ (Parchment Reader Experience):**
   - 4 የቀለም ቅንብሮች (የጥንት ብራና፣ የገዳም ሻማ፣ ንጉሣዊ ቬልቬት፣ ፓፒረስ)
   - Dynamic reading progress hairline & Ge'ez numeral counters
   - Adjustable font scale (ትንሽ፣ መካከለኛ፣ ትልቅ)
   - Archival PDF document generation & printing (`jspdf`)

4. **የድምፅ ንባብ መቆጣጠሪያ (Liturgical Audio Player):**
   - Animated liturgical waveform visualizer
   - Detached floating island player with progress tracking
   - Full modal seeker dialog

5. **የቤተክርስቲያን መርሐ ግብርና የቀን መቁጠሪያ (Church Program Calendar):**
   - Ethiopian months navigation (መስከረም – ጳጉሜን)
   - Recurrence filters: ሳምንታዊ (Weekly), ወርሃዊ (Monthly), ዓመታዊ (Yearly)
   - Three assigned roles: ✍️ ፀሃፊ (Writer), 🎬 አዘጋጅ (Organizer), 🎙️ አቅራቢ (Presenter) with readiness toggle

6. **የአባላት ማውጫና አስተዳደር (Member Directory & RBAC):**
   - Full directory of writers, organizers, and presenters with spiritual titles
   - Multi-role permission system: MEMBER, CONTRIBUTOR, REVIEWER, EDITOR, ADMIN, SUPER_ADMIN
   - Reviewer queue for work approval, feedback notes, and status transitions

---

## ቴክኖሎጂዎች (Tech Stack)

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom Ethiopic fonts (Noto Serif Ethiopic & Noto Sans Ethiopic)
- **PDF Export**: jsPDF
- **Icons**: Lucide React
