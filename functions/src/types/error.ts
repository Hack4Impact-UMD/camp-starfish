import { GrpcStatus } from "firebase-admin/firestore";

export interface GrpcError {
  code: GrpcStatus;
  details: string;
  metadata: unknown;
  name: string;
}

export function isFirebaseError(error: any): error is GrpcError {
  return (typeof error === 'object' && error != null)
    && ('code' in error && typeof error.code === 'number')
    && ('details' in error && typeof error.details === 'string')
    && ('metadata' in error && typeof error.metadata === 'object')
    && ('name' in error && typeof error.name === 'string');
}