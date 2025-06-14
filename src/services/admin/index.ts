
// Re-export all admin services from a central location
export { getKYCVerificationsForAdmin, updateKYCVerification } from "./kycService";
export { getAdminDashboardStats } from "./dashboardService";
export type { AdminStats } from "./dashboardTypes";
