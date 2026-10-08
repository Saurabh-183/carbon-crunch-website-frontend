const LOCAL_BASE_URL = "http://localhost:3000";
const REMOTE_BASE_URL = "/";
const LOCAL_SERVICE_PORTS = {
  excel: 8001,
  ocr: 8002,
  report: 8003,
  rcoexcel: 8004,
};

const isLocalHost = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }
  return false;
};

const isPrivateOrLocalHostname = (hostname = "") => {
  const host = hostname.toLowerCase();
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
  if (host.endsWith(".local")) return true;

  // Private IPv4 ranges (RFC1918) and loopback.
  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^127\./.test(host)) {
    return true;
  }

  const match172 = host.match(/^172\.(\d{1,3})\./);
  if (match172) {
    const secondOctet = Number(match172[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
};

const shouldForceLocalhostFallback = (rawUrl) => {
  if (!isLocalHost()) return false;
  const normalized = normalizeBaseUrl(rawUrl);
  if (!normalized || normalized.startsWith("/")) return false;

  try {
    const parsed = new URL(normalized);
    return !isPrivateOrLocalHostname(parsed.hostname);
  } catch {
    return false;
  }
};

const normalizeBaseUrl = (url) => {
  if (!url) return "";
  const trimmed = url
    .toString()
    .trim()
    .replace(/^['"]|['"]$/g, "");
  if (trimmed === "/") {
    return "";
  }
  // Allow relative paths (e.g., "/api")
  if (trimmed.startsWith("/")) {
    return trimmed.endsWith("/") && trimmed.length > 1 ? trimmed.slice(0, -1) : trimmed;
  }

  if (trimmed.startsWith(":")) {
    return `http://localhost${trimmed}`;
  }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  return withScheme.endsWith("/") ? withScheme.slice(0, -1) : withScheme;
};

const resolveEnvValue = (key) => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key];
  }
  return undefined;
};

export const resolveBaseUrl = () => {
  const envBase = resolveEnvValue("VITE_API_URL");
  if (envBase) {
    if (shouldForceLocalhostFallback(envBase)) {
      return normalizeBaseUrl(LOCAL_BASE_URL);
    }
    return normalizeBaseUrl(envBase);
  }
  return normalizeBaseUrl(isLocalHost() ? LOCAL_BASE_URL : REMOTE_BASE_URL);
};

export const resolveServiceBaseUrl = (serviceName) => {
  const envMap = {
    excel: "VITE_IMPORT_SERVICE_URL",
    ocr: "VITE_OCR_SERVICE_URL",
    report: "VITE_REPORT_SERVICE_URL",
    rcoexcel: "VITE_RCO_EXCEL_SERVICE_URL",
  };
  const envKey = envMap[serviceName];
  const envValue = envKey ? resolveEnvValue(envKey) : undefined;
  if (envValue) {
    if (shouldForceLocalhostFallback(envValue)) {
      if (LOCAL_SERVICE_PORTS[serviceName]) {
        return `http://localhost:${LOCAL_SERVICE_PORTS[serviceName]}`;
      }
    }
    return normalizeBaseUrl(envValue);
  }
  if (isLocalHost() && LOCAL_SERVICE_PORTS[serviceName]) {
    return `http://localhost:${LOCAL_SERVICE_PORTS[serviceName]}`;
  }
  const remoteBase = normalizeBaseUrl(REMOTE_BASE_URL);
  return `${remoteBase}/api/services/${serviceName}`;
};
