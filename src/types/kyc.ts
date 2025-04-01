
export interface KYCVerification {
  id: string;
  userId: string;
  idDocumentUrl?: string;
  addressProofUrl?: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
