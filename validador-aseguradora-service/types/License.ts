// types/License.ts
export interface License {
  folio: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  startDate: Date;
  days: number;
  status: 'issued' | 'expired' | 'cancelled';
  createdAt?: Date;
}

export interface VerificationResult {
  valid: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
}