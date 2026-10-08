/**
 * Facade Layer Index
 * Central export point for all facades
 *
 * Architecture:
 * Components → Facades → API Services
 *
 * Facades encapsulate:
 * - Business logic
 * - Data validation
 * - Error handling
 * - Toast notifications
 * - Data transformation
 */

export { default as authFacade } from "./auth.facade";
export { default as facilityFacade } from "./facility.facade";
export { default as reportFacade } from "./report.facade";
export { default as userFacade } from "./user.facade";
export { default as organizationFacade } from "./organization.facade";
