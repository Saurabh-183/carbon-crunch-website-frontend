import { generateHtmlReport } from "../utils/reportHtmlGenerator";

/**
 * Decodes HTML entities in a string
 * @param {string} value - String potentially containing HTML entities
 * @returns {string} - Decoded string
 */
const decodeHtml = (value) => {
  if (!value) return value;
  if (!value.includes("&lt;") && !value.includes("&gt;") && !value.includes("&amp;")) {
    return value;
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

/**
 * Downloads a report as HTML file
 * @param {Object} report - The report object
 * @param {Function} buildReportData - Function to build report data
 * @param {string} reportName - Name for the downloaded file
 * @param {Array} facilities - Array of facility objects
 * @param {Object} user - User object with organization info
 */
export const downloadReportAsHtml = (report, buildReportData, reportName, facilities, user) => {
  if (!report) return;

  let html = report?.reportData?.html ? decodeHtml(report.reportData.html) : "";

  if (!html) {
    const period = {
      startDate: report.startDate || report.reportData?.period?.startDate,
      endDate: report.endDate || report.reportData?.period?.endDate,
    };
    const reportDataForPeriod = buildReportData(period);
    html = generateHtmlReport(reportDataForPeriod, {
      organizationInfo: user?.organizationId,
      period,
      reportName: report.reportName || reportName,
      facilities,
    });
  }

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.reportName || "report"}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Opens a report in a new window and triggers print dialog for PDF generation
 * @param {Object} report - The report object
 * @param {Function} buildReportData - Function to build report data
 * @param {string} reportName - Name for the report
 * @param {Array} facilities - Array of facility objects
 * @param {Object} user - User object with organization info
 */
export const downloadReportAsPdf = (report, buildReportData, reportName, facilities, user) => {
  if (!report) return;

  let html = report?.reportData?.html ? decodeHtml(report.reportData.html) : "";

  if (!html) {
    const period = {
      startDate: report.startDate || report.reportData?.period?.startDate,
      endDate: report.endDate || report.reportData?.period?.endDate,
    };
    const reportDataForPeriod = buildReportData(period);
    html = generateHtmlReport(reportDataForPeriod, {
      organizationInfo: user?.organizationId,
      period,
      reportName: report.reportName || reportName,
      facilities,
    });
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(`${html}<script>window.addEventListener('load', () => { window.print(); });</script>`);
  printWindow.document.close();
};
