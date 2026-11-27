import { jsPDF } from 'jspdf';
import { DIVISIONS, SundayDailyPlanSheet, WorkItem } from '../types';

const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const generateArchivalPdf = (work: WorkItem): { doc: jsPDF; filename: string } => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isEhud = work.departmentId === 'ehud_merha_gibir';
  const deptLabelAmharic = isEhud
    ? 'ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የእሁድ መርሃ ግብር መዝገብ'
    : 'ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ መዝገብ';
  const deptLabelEnglish = isEhud
    ? 'TEKLE SAWIROS SUNDAY SCHOOL - SUNDAY PROGRAM ARCHIVE'
    : 'TEKLE SAWIROS SUNDAY SCHOOL - ART & CULTURAL ARCHIVE';

  const filename = `${work.title.replace(/\s+/g, '_')}_ተክለ_ሣዊሮስ_መዝገብ.pdf`;

  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = margin;

  doc.setDrawColor(184, 133, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, cursorY, pageWidth - margin * 2, 28);

  doc.setFillColor(12, 74, 158);
  doc.rect(margin, cursorY, pageWidth - margin * 2, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(deptLabelEnglish, pageWidth / 2, cursorY + 5.5, { align: 'center' });

  cursorY += 14;
  doc.setTextColor(12, 74, 158);
  doc.setFontSize(12);
  doc.text(deptLabelAmharic, pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 6;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text('የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን (፲፱፻፶፯)', pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 16;

  doc.setDrawColor(184, 133, 0);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);

  cursorY += 8;
  doc.setTextColor(12, 74, 158);
  doc.setFontSize(16);
  doc.text(work.title, pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 7;
  doc.setTextColor(184, 133, 0);
  doc.setFontSize(10);
  doc.text(`ምድብ: ${work.categoryName}   |   አዘጋጅ/ደራሲ: ${work.writerName}   |   ቀን: ${work.dateAmharic}`, pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 6;
  doc.line(margin, cursorY, pageWidth - margin, cursorY);

  cursorY += 10;

  if (work.approvedBy) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(30, 126, 78);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 12, 2, 2, 'FD');

    doc.setTextColor(30, 126, 78);
    doc.setFontSize(9);
    doc.text(`[የጸደቀ ቋሚ መዝገብ]  ያረጋገጡት፦ ${work.approvedBy} (${work.approvedDate || '፳፻፲፮ ዓ.ም'}) - እትም: v${work.version}`, margin + 5, cursorY + 7.5);

    cursorY += 18;
  }

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);

  const maxTextWidth = pageWidth - margin * 2;
  const contentLines = doc.splitTextToSize(work.content, maxTextWidth);

  for (let i = 0; i < contentLines.length; i++) {
    if (cursorY > 270) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(contentLines[i], margin, cursorY);
    cursorY += 6;
  }

  cursorY += 10;
  if (cursorY > 265) {
    doc.addPage();
    cursorY = margin;
  }

  doc.setDrawColor(184, 133, 0);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text(
    isEhud
      ? 'ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የእሁድ መርሃ ግብር ክፍል ዲጂታል መዝገብ • ሁሉም መብቶች በቤተክርስቲያኑ መዝገብ የተጠበቁ ናቸው።'
      : 'ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል ዲጂታል መዝገብ • ሁሉም መብቶች በቤተክርስቲያኑ መዝገብ የተጠበቁ ናቸው።',
    pageWidth / 2,
    cursorY,
    { align: 'center' }
  );

  return { doc, filename };
};

export const downloadWorkPdf = (work: WorkItem): string => {
  const { doc, filename } = generateArchivalPdf(work);
  doc.save(filename);
  return filename;
};

export const printWorkArchivalDocument = (work: WorkItem) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const isEhud = work.departmentId === 'ehud_merha_gibir';

  const html = `
    <!DOCTYPE html>
    <html lang="am">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(work.title)} - ${isEhud ? 'የእሁድ መርሃ ግብር' : 'መዝገበ ኪነጥበብ'}</title>
      <style>
        body {
          font-family: 'Noto Serif Ethiopic', 'Times New Roman', serif;
          margin: 40px;
          color: #15202E;
          background: #FFF;
        }
        .header {
          border: 2px solid #B88500;
          padding: 16px;
          text-align: center;
          margin-bottom: 24px;
        }
        .church-title {
          font-size: 14px;
          color: #475569;
          margin-bottom: 4px;
        }
        .org-name {
          font-size: 20px;
          font-weight: bold;
          color: #0C4A9E;
          margin-bottom: 4px;
        }
        .doc-title {
          font-size: 24px;
          font-weight: bold;
          color: #0C4A9E;
          margin-top: 18px;
          text-align: center;
        }
        .meta {
          text-align: center;
          color: #B88500;
          font-size: 13px;
          margin: 8px 0 20px 0;
          border-bottom: 1px solid #B88500;
          padding-bottom: 10px;
        }
        .content {
          font-size: 15px;
          line-height: 1.8;
          white-space: pre-wrap;
          margin: 20px 0;
        }
        .seal {
          background: #F0FDF4;
          border: 1px solid #1E7E4E;
          color: #1E7E4E;
          padding: 10px;
          font-size: 12px;
          margin-bottom: 18px;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #B88500;
          padding-top: 10px;
          font-size: 11px;
          text-align: center;
          color: #64748B;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="church-title">የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን</div>
        <div class="org-name">ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት • ${isEhud ? 'የእሁድ መርሃ ግብር ክፍል' : 'መዝገበ ኪነጥበብ'} (፲፱፻፶፯)</div>
      </div>
      <div class="doc-title">${escapeHtml(work.title)}</div>
      <div class="meta">
        ምድብ፦ ${escapeHtml(work.categoryName)} &nbsp;|&nbsp; ${isEhud ? 'አዘጋጅ' : 'ደራሲ'}፦ ${escapeHtml(work.writerName)} &nbsp;|&nbsp; ቀን፦ ${escapeHtml(work.dateAmharic)} &nbsp;|&nbsp; ንባብ፦ ${escapeHtml(work.readTime)}
      </div>
      ${work.approvedBy ? `<div class="seal">✓ በሰንበት ትምህርት ቤቱ የጸደቀ ቋሚ መዝገብ — ያረጋገጡት፦ ${escapeHtml(work.approvedBy)} (${escapeHtml(work.approvedDate || '፳፻፲፮ ዓ.ም')}) - እትም v${work.version}</div>` : ''}
      <div class="content">${escapeHtml(work.content)}</div>
      <div class="footer">
        ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት ${isEhud ? 'የእሁድ መርሃ ግብር ክፍል' : 'የኪነጥበብ ክፍል'} ዲጂታል መዝገብ • ሁሉም መብቶች በቤተክርስቲያኑ መዝገብ የተጠበቁ ናቸው።
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // safe fallback
    }
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {
        // ignore
      }
    }, 2000);
  }, 300);
};

// =========================================================================
// EHUD MERHA GIBIR: SINGLE-SUNDAY ORDER OF SERVICE SHEET PDF & PRINT EXPORT
// =========================================================================
export const downloadDailyPlanPdf = (sheet: SundayDailyPlanSheet): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const divisionTitle = DIVISIONS[sheet.division]?.titleAmharic || sheet.division;
  const safeName = `${sheet.monthAmharic}_${sheet.dayNumber}_${sheet.division}`.replace(/\s+/g, '_');
  const filename = `Ehud_Merha_Gibir_${safeName}.pdf`;

  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin;

  doc.setDrawColor(12, 74, 158);
  doc.setLineWidth(0.8);
  doc.rect(margin, y, pageWidth - margin * 2, 26);

  doc.setFillColor(12, 74, 158);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.text('TEKLE SAWIROS SUNDAY SCHOOL - EHUD MERHA GIBIR ORDER OF SERVICE', pageWidth / 2, y + 5.5, { align: 'center' });

  y += 14;
  doc.setTextColor(12, 74, 158);
  doc.setFontSize(12);
  doc.text(`${sheet.dateAmharic} — ${divisionTitle}`, pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text(`Topic: ${sheet.mainTopic} | Time: ${sheet.timeAmharic}`, pageWidth / 2, y, { align: 'center' });

  y += 12;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Leader: ${sheet.leader}`, margin, y);
  y += 5.5;
  doc.text(
    `Teacher / Presenter: ${sheet.presenterOrTeacher}${sheet.presenterContact ? ` (${sheet.presenterContact})` : ''}`,
    margin,
    y
  );
  y += 5.5;
  const purposeLines = doc.splitTextToSize(`Purpose: ${sheet.purpose}`, pageWidth - margin * 2);
  doc.text(purposeLines, margin, y);
  y += purposeLines.length * 5 + 4;

  doc.setDrawColor(184, 133, 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(11);
  doc.setTextColor(12, 74, 158);
  doc.text('Order of Service / Timetable Slots', margin, y);
  y += 6;

  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  for (const slot of sheet.slots) {
    if (y > 268) {
      doc.addPage();
      y = margin;
    }
    const contactSuffix = slot.inChargeContact ? ` - ${slot.inChargeContact}` : '';
    const line = `${slot.timeRange}  |  ${slot.slotTitle}${slot.inCharge ? `  (${slot.inCharge}${contactSuffix})` : ''}`;
    const wrapped = doc.splitTextToSize(line, pageWidth - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5 + 2;
  }

  if (sheet.preProgramNeeds.length > 0) {
    y += 4;
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(184, 133, 0);
    doc.setFontSize(10.5);
    doc.text('Pre-Program Readiness Checklist', margin, y);
    y += 5.5;
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9.5);
    for (const need of sheet.preProgramNeeds) {
      if (y > 272) {
        doc.addPage();
        y = margin;
      }
      const checked = Boolean(sheet.preProgramChecklistState?.[need]);
      doc.text(`[${checked ? 'x' : ' '}] ${need}`, margin + 2, y);
      y += 5;
    }
  }

  if (sheet.postProgramStats?.participantsCount || sheet.postProgramStats?.evaluationNotes) {
    y += 5;
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(30, 126, 78);
    doc.setFontSize(10);
    doc.text(
      `Attendance: ${sheet.postProgramStats?.participantsCount ?? '-'} | Actual: ${sheet.postProgramStats?.actualStartTime || sheet.timeAmharic}`,
      margin,
      y
    );
    if (sheet.postProgramStats?.evaluationNotes) {
      y += 5;
      doc.setTextColor(51, 65, 85);
      const evalLines = doc.splitTextToSize(`Notes: ${sheet.postProgramStats.evaluationNotes}`, pageWidth - margin * 2);
      doc.text(evalLines, margin, y);
    }
  }

  doc.save(filename);
  return filename;
};

export const printDailyPlanSheet = (sheet: SundayDailyPlanSheet) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const divisionTitle = DIVISIONS[sheet.division]?.titleAmharic || sheet.division;
  const slotsRows = sheet.slots
    .map(
      (slot) => `
      <tr>
        <td style="font-family: monospace; font-weight: bold; white-space: nowrap;">${escapeHtml(slot.timeRange)}</td>
        <td><strong>${escapeHtml(slot.slotTitle)}</strong>${slot.notes ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;">${escapeHtml(slot.notes)}</div>` : ''}</td>
        <td>${escapeHtml(slot.inCharge || '—')}${slot.inChargeContact ? `<div style="font-size: 11px; color: #0C4A9E; margin-top: 2px; font-family: monospace;">${escapeHtml(slot.inChargeContact)}</div>` : ''}</td>
      </tr>`
    )
    .join('');

  const needsHtml = sheet.preProgramNeeds
    .map((need) => {
      const checked = Boolean(sheet.preProgramChecklistState?.[need]);
      return `<li style="margin-bottom: 4px;">${checked ? '☑' : '☐'} ${escapeHtml(need)}</li>`;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="am">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(sheet.dateAmharic)} — የእሁድ መርሃ ግብር ሉህ</title>
      <style>
        body { font-family: 'Noto Serif Ethiopic', 'Noto Sans Ethiopic', serif; margin: 32px; color: #15202E; }
        .banner { border: 2px solid #0C4A9E; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 18px; }
        .org { font-size: 18px; font-weight: bold; color: #0C4A9E; }
        .sub { font-size: 12px; color: #B88500; font-weight: bold; margin-top: 4px; }
        h1 { font-size: 20px; color: #8B0000; margin: 10px 0 4px 0; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px; }
        th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; vertical-align: top; }
        th { background: #0C4A9E; color: #FFF; font-size: 12px; }
        .box { border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin-bottom: 14px; font-size: 12.5px; }
        .footer { border-top: 1px solid #B88500; padding-top: 8px; font-size: 11px; text-align: center; color: #64748B; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="banner">
        <div class="org">ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት • የእሁድ መርሃ ግብር ክፍል (2019 ዓ.ም.)</div>
        <div class="sub">${escapeHtml(divisionTitle)} • ${escapeHtml(sheet.dateAmharic)} (${escapeHtml(sheet.timeAmharic)})</div>
        <h1>ርዕሰ ጉዳይ፦ «${escapeHtml(sheet.mainTopic)}»</h1>
      </div>
      <div class="meta">
        <div><strong>የዕለቱ መሪ / ተረኛ ምድብ፦</strong> ${escapeHtml(sheet.leader)}</div>
        <div><strong>ዋና መምህር / አቅራቢ፦</strong> ${escapeHtml(sheet.presenterOrTeacher)}${sheet.presenterContact ? ` <span style="font-family: monospace; color: #0C4A9E;">(${escapeHtml(sheet.presenterContact)})</span>` : ''}</div>
        <div style="grid-column: 1 / -1;"><strong>መንፈሳዊ ዓላማ፦</strong> ${escapeHtml(sheet.purpose)}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 110px;">ሰዓት</th>
            <th>የመርሃ ግብሩ ዝርዝር ክፍለ-ጊዜ</th>
            <th style="width: 170px;">ተረኛ አገልጋይ / ኃላፊ</th>
          </tr>
        </thead>
        <tbody>${slotsRows}</tbody>
      </table>
      ${needsHtml ? `<div class="box"><strong>ከመርሃ ግብር በፊት የሚያስፈልጉ ዝግጅቶች፦</strong><ul style="list-style: none; padding-left: 0; margin: 8px 0 0 0;">${needsHtml}</ul></div>` : ''}
      ${sheet.postProgramStats ? `<div class="box"><strong>የድኅረ መርሃ ግብር ሪፖርት፦</strong> ተሳታፊዎች፦ ${sheet.postProgramStats.participantsCount ?? '—'} | ትክክለኛ ሰዓት፦ ${escapeHtml(sheet.postProgramStats.actualStartTime || sheet.timeAmharic)}<div style="margin-top: 4px;">${escapeHtml(sheet.postProgramStats.evaluationNotes || '')}</div></div>` : ''}
      <div class="footer">ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የእሁድ መርሃ ግብር ክፍል ኦፊሴላዊ የዕለት መርሃ ግብር ሉህ</div>
    </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // safe fallback
    }
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {
        // ignore
      }
    }, 2000);
  }, 300);
};

