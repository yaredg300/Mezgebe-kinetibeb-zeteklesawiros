import { jsPDF } from 'jspdf';
import { WorkItem } from '../types';

export const generateArchivalPdf = (work: WorkItem): { doc: jsPDF; filename: string } => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const filename = `${work.title.replace(/\s+/g, '_')}_ተክለ_ሣዊሮስ_መዝገብ.pdf`;

  // Margins
  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = margin;

  // Header Box Banner
  doc.setDrawColor(184, 133, 0); // Antique Gold
  doc.setLineWidth(0.8);
  doc.rect(margin, cursorY, pageWidth - margin * 2, 28);

  doc.setFillColor(12, 74, 158); // Royal Church Blue
  doc.rect(margin, cursorY, pageWidth - margin * 2, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('TEKLE SAWIROS SUNDAY SCHOOL - ART & CULTURAL ARCHIVE', pageWidth / 2, cursorY + 5.5, { align: 'center' });

  cursorY += 14;
  doc.setTextColor(12, 74, 158);
  doc.setFontSize(12);
  doc.text('ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ መዝገብ', pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 6;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text('የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን (፲፱፻፶፯)', pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 16;

  // Work Title Banner
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
  doc.text(`ምድብ: ${work.categoryName}   |   ደራሲ: ${work.writerName}   |   ቀን: ${work.dateAmharic}`, pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 6;
  doc.line(margin, cursorY, pageWidth - margin, cursorY);

  cursorY += 10;

  // Official Approval Seal text if approved
  if (work.approvedBy) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(30, 126, 78);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 12, 2, 2, 'FD');

    doc.setTextColor(30, 126, 78);
    doc.setFontSize(9);
    doc.text(`[የጸደቀ ቋሚ መዝገብ]  ያረጋገጡት፦ ${work.approvedBy} (${work.approvedDate || '፳፻፲፮ ዓ.ም'}) - እትም: v${work.version}`, margin + 5, cursorY + 7.5);

    cursorY += 18;
  }

  // Work Content
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);

  // Split text into lines within page width
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

  // Footer seal line
  doc.setDrawColor(184, 133, 0);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል ዲጂታል መዝገብ • ሁሉም መብቶች በቤተክርስቲያኑ መዝገብ የተጠበቁ ናቸው።', pageWidth / 2, cursorY, { align: 'center' });

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

  const html = `
    <!DOCTYPE html>
    <html lang="am">
    <head>
      <meta charset="UTF-8">
      <title>${work.title} - መዝገበ ኪነጥበብ</title>
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
        <div class="org-name">ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት • መዝገበ ኪነጥበብ (፲፱፻፶፯)</div>
      </div>
      <div class="doc-title">${work.title}</div>
      <div class="meta">
        ምድብ፦ ${work.categoryName} &nbsp;|&nbsp; ደራሲ፦ ${work.writerName} &nbsp;|&nbsp; ቀን፦ ${work.dateAmharic} &nbsp;|&nbsp; ንባብ፦ ${work.readTime}
      </div>
      ${work.approvedBy ? `<div class="seal">✓ በሰንበት ትምህርት ቤቱ የጸደቀ ቋሚ መዝገብ — ያረጋገጡት፦ ${work.approvedBy} (${work.approvedDate || '፳፻፲፮ ዓ.ም'}) - እትም v${work.version}</div>` : ''}
      <div class="content">${work.content}</div>
      <div class="footer">
        ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል ዲጂታል መዝገብ • ሁሉም መብቶች በቤተክርስቲያኑ መዝገብ የተጠበቁ ናቸው።
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
