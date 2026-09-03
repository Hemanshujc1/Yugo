/**
 * Domain types for the Delivery Partner onboarding & auth flow.
 *
 * These are intentionally kept local to `apps/delivery-app` rather than added
 * to `@yugo/shared-types`, since the backend contract for partner auth /
 * verification (`POST /partner/status`, `GET /partner/verification-status`,
 * etc. — Master PRD §10.4, §10.7) does not exist yet. Once the real API
 * lands, promote the wire-format subset of these types into the shared
 * package so Admin Portal / Shopkeeper Portal can consume the same shapes.
 */

export type PartnerType = 'general' | 'merchant';

export type VerificationStatus = 'not_started' | 'under_review' | 'approved' | 'rejected';

export type DocumentKey =
  | 'aadhaarFront'
  | 'aadhaarBack'
  | 'drivingLicence'
  | 'vehicleRc'
  | 'selfie';

export type DocumentStatus = 'pending' | 'uploading' | 'uploaded';

export interface PartnerProfile {
  phone: string | null;
  fullName: string | null;
  partnerType: PartnerType | null;
  workingHours: { start: string; end: string } | null;
  documents: Partial<Record<DocumentKey, DocumentStatus>>;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
}

export const REQUIRED_DOCUMENTS: Record<PartnerType, DocumentKey[]> = {
  // General Partner: full KYC (Master PRD §10.2 / §10.3.1).
  general: ['aadhaarFront', 'aadhaarBack', 'drivingLicence', 'vehicleRc', 'selfie'],
  // Merchant Partner: lighter check — the hiring shop already vouches for them.
  merchant: [],
};
