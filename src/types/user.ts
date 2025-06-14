
import { UserRole } from "@/types/supabase";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  loyaltyPoints: number;
  createdAt: string;
}
