// Components
export { default as ReportCard } from "./components/ReportCard";
export { default as EmptyReportsState } from "./components/EmptyReportsState";
export { default as ReportHeader } from "./components/ReportHeader";
export { default as GenerateReportModal } from "./components/GenerateReportModal";
export { default as ReactA4Report } from "./components/ReactA4Report";

// Hooks
export { useReportsData } from "./hooks/useReportsData";
export { useReportGeneration } from "./hooks/useReportGeneration";

// Utils
export { buildReportData } from "./utils/reportDataBuilder";
export { generateHtmlReport } from "./utils/reportHtmlGenerator";
export { getEmissionFactor, getScope3ModuleByActivityType, getEmissionDataByScope, extractEmissionFactor } from "./utils/emissionFactorUtils";

// Services
export { downloadReportAsHtml, downloadReportAsPdf } from "./services/reportDownloadService";
