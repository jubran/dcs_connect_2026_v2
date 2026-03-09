export const handlePrint = () => {
  const printContent = document.getElementById("print-section");
  if (!printContent) return;

  // حفظ حالة العناصر المخفية
  const noPrintEls = document.querySelectorAll(".no-print");
  const originalDisplay = new Map();
  noPrintEls.forEach((el) => {
    originalDisplay.set(el, el.style.display);
    el.style.display = "none";
  });

  // إنشاء الأنماط الخاصة بالطباعة
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 8mm;
    marks: crop;
  }


  html, body {
    direction: ltr !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body * {
    visibility: hidden !important;
  }

  #print-section,
  #print-section * {
    visibility: visible !important;
  }

  #print-section {
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0  auto !important;
    padding: 0 !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
  }

  /* تحسينات الجدول الرئيسية */
  .MuiTableContainer-root {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    overflow: visible !important;
    box-shadow: none !important;
    border: 1px solid #ddd !important;
  }

  table {
    width: 100% !important;
    max-width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    page-break-inside: auto !important;
  }

  thead {
    display: table-header-group !important;
  }

  tfoot {
    display: table-footer-group !important;
  }

  tr {
    page-break-inside: avoid !important;
    page-break-after: auto !important;
  }

  th {
    background: #f8f9fa !important;
    color: #212529 !important;
    font-weight: 700 !important;
    font-size: 10px !important;
    padding: 8px 6px !important;
    border: 1px solid #dee2e6 !important;
    text-align: center !important;
    vertical-align: middle !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  td {
    border: 1px solid #dee2e6 !important;
    font-size: 10px !important;
    padding: 6px 5px !important;
    line-height: 1.3 !important;
    vertical-align: top !important;
    text-align: center !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    hyphens: auto !important;
  }

  /* تجنب تقطيع الصفوف بين صفحات */
  tr {
    break-inside: avoid !important;
    break-after: auto !important;
  }

  /* تحديد عرض الأعمدة بشكل متناسب */
  th:nth-child(1), td:nth-child(1) { width: 5% !important; }  /* للرقم التسلسلي */
  th:nth-child(2), td:nth-child(2) { width: 10% !important; } /* التاريخ */
  th:nth-child(3), td:nth-child(3) { width: 10% !important; } /* الوقت */
  th:nth-child(4), td:nth-child(4) { width: 10% !important; } /* الموقع */
  th:nth-child(5), td:nth-child(5) { width: 50% !important; } /* الحدث */
  th:nth-child(6), td:nth-child(6) { width: 15% !important; } /* الحالة */

  /* تحسين عرض الحالات */
  .status-cell {
    font-weight: 600 !important;
    text-align: center !important;
    border-radius: 3px !important;
    padding: 4px 8px !important;
  }

  /* تجنب تقطيع الكلمات الطويلة */
  .no-break {
    white-space: nowrap !important;
  }

  .break-word {
    word-break: break-word !important;
  }

  /* تحسينات للعناوين */
  .print-header {
    margin-bottom: 15px !important;
    padding-bottom: 10px !important;
    border-bottom: 2px solid #333 !important;
  }

  .print-title {
    font-size: 18px !important;
    font-weight: 700 !important;
    margin-bottom: 5px !important;
  }

  .print-subtitle {
    font-size: 12px !important;
    color: #666 !important;
  }

  /* فوتر للصفحات */
  .page-footer {
    position: fixed !important;
    bottom: 0 !important;
    width: 100% !important;
    text-align: center !important;
    font-size: 9px !important;
    color: #666 !important;
    border-top: 1px solid #ddd !important;
    padding: 5px 0 !important;
  }

  /* إخفاء العناصر غير المرغوب بها في الطباعة */
  .no-print, .no-print * {
    display: none !important;
  }

  button, .MuiButton-root, .action-buttons {
    display: none !important;
  }
    
}
`;

  // إضافة رأس وتذييل للطباعة
  const headerFooterHTML = `
    <div class="print-header">
<div class="print-title">البوابة الإلكترونية لقسم التشغيل</div>
         <div class="print-subtitle">${formatPrintDate()}</div>
    </div>
  `;

  const originalHTML = printContent.innerHTML;
  printContent.innerHTML = headerFooterHTML + originalHTML;

  // إضافة فوتر ديناميكي
  const footer = document.createElement("div");
  footer.className = "page-footer";
  footer.innerHTML = `
    <div>الصفحة <span class="page-number"></span> من <span class="page-total"></span></div>
    <div>هذا المستند مُنشأ إلكترونيًا</div>

    `;
  printContent.appendChild(footer);

  document.head.appendChild(styleSheet);

  // إضافة سكريبت لحساب أرقام الصفحات
  const pageScript = document.createElement("script");
  pageScript.innerHTML = `
    window.onbeforeprint = function() {
      var totalPages = Math.ceil(document.body.scrollHeight / 1123); // A4 height in points
      document.querySelectorAll('.page-total').forEach(el => el.textContent = totalPages);
    }
    window.onafterprint = function() {
      var pageNumbers = document.querySelectorAll('.page-number');
      pageNumbers.forEach((el, index) => el.textContent = index + 1);
    }
  `;
  document.head.appendChild(pageScript);

  // تأخير لضمان تحميل الأنماط
  setTimeout(() => {
    window.print();

    // تنظيف بعد الطباعة
    setTimeout(() => {
      document.head.removeChild(styleSheet);
      document.head.removeChild(pageScript);
      printContent.innerHTML = originalHTML;
      noPrintEls.forEach((el) => {
        el.style.display = originalDisplay.get(el);
      });
    }, 100);
  }, 300);
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "shutdown":
      return "#c62828"; // أحمر داكن
    case "stand by":
      return "#1565c0"; // أزرق طباعة
    case "in service":
      return "#2e7d32"; // أخضر داكن
    default:
      return "#000";
  }
};

export const formatPrintDate = () => {
  const now = new Date();
  const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const gregorianDate = new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const time = new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(now);

  return `${gregorianDate} الموافق  ${hijriDate} ـ وقت الطباعة ${time}`;
};

// دالة مساعدة لتنسيق خلايا الجدول
export const formatTableCell = (content, isHeader = false) => {
  if (isHeader) {
    return `<th class="no-break">${content}</th>`;
  }

  // تحديد إذا كان المحتوى طويلاً ويحتاج لكسر الكلمات
  const shouldBreakWord = content && content.length > 30;
  const cellClass = shouldBreakWord ? "break-word" : "no-break";

  return `<td class="${cellClass}">${content || "-"}</td>`;
};

// دالة لتوليد ترويسة الجدول بشكل ديناميكي
export const generateTableHeader = (headers) => {
  return `
    <thead>
      <tr>
        ${headers
          .map(
            (header, index) => `
          <th style="width: ${header.width || "auto"}">
            ${header.title}
          </th>
        `,
          )
          .join("")}
      </tr>
    </thead>
  `;
};
