import { Firestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { DepartmentMembership } from '../types';

export interface MigrationReport {
  scanned: number;
  migrated: number;
  conflicts: number;
  errors: string[];
}

/**
 * Returns canonical membership document ID: {userId}_{departmentId}
 */
export function getCanonicalMembershipId(userId: string, departmentId: string): string {
  return `${userId}_${departmentId}`;
}

/**
 * Recursively removes all `undefined` values from an object,
 * ensuring Firestore writes never fail due to unsupported undefined values.
 */
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeFirestorePayload(value);
    } else {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

/**
 * Idempotent migration for existing department_memberships records:
 * - Scans legacy documents with 'mem_' prefix or non-canonical IDs
 * - Preserves existing membership status and roles (never auto-approves pending)
 * - Reports conflicting duplicate records instead of silently granting access
 * - Cleans up legacy records after canonical write succeeds
 */
export async function migrateDepartmentMemberships(db: Firestore): Promise<MigrationReport> {
  const report: MigrationReport = {
    scanned: 0,
    migrated: 0,
    conflicts: 0,
    errors: [],
  };

  try {
    const colRef = collection(db, 'department_memberships');
    const snapshot = await getDocs(colRef);
    report.scanned = snapshot.size;

    for (const docSnap of snapshot.docs) {
      const legacyId = docSnap.id;
      const data = docSnap.data() as DepartmentMembership;

      if (!data.userId || !data.departmentId) {
        continue;
      }

      const canonicalId = getCanonicalMembershipId(data.userId, data.departmentId);

      // If document is already canonical, skip
      if (legacyId === canonicalId) {
        continue;
      }

      // Check if canonical doc already exists
      const canonicalDocRef = doc(db, 'department_memberships', canonicalId);
      const canonicalSnap = await getDoc(canonicalDocRef);

      if (canonicalSnap.exists()) {
        const canonicalData = canonicalSnap.data() as DepartmentMembership;
        // Check for conflicts
        if (
          canonicalData.status !== data.status ||
          canonicalData.role !== data.role
        ) {
          report.conflicts++;
          console.warn(
            `[Membership Migration Conflict] Found conflicting records for user ${data.userId} in ${data.departmentId}:`,
            {
              legacyDoc: { id: legacyId, status: data.status, role: data.role },
              canonicalDoc: { id: canonicalId, status: canonicalData.status, role: canonicalData.role },
            }
          );
          // Do not silently overwrite or escalate privileges
          continue;
        }

        // If identical, we can safely delete the legacy duplicate
        try {
          await deleteDoc(doc(db, 'department_memberships', legacyId));
          report.migrated++;
        } catch (err: any) {
          report.errors.push(`Failed to delete redundant legacy doc ${legacyId}: ${err?.message}`);
        }
      } else {
        // Canonical doc does not exist: copy faithfully with sanitized payload and remove legacy
        try {
          const canonicalRecord: DepartmentMembership = {
            ...data,
            id: canonicalId,
          };
          const sanitized = sanitizeFirestorePayload(canonicalRecord);
          await setDoc(canonicalDocRef, sanitized);
          await deleteDoc(doc(db, 'department_memberships', legacyId));
          report.migrated++;
        } catch (err: any) {
          report.errors.push(`Failed to migrate ${legacyId} to ${canonicalId}: ${err?.message}`);
        }
      }
    }
  } catch (err: any) {
    report.errors.push(`Migration query failed: ${err?.message}`);
  }

  return report;
}
