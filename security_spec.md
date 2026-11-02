# Security Specification: Mezgebe Kinetibeb (ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት)

## 1. Data Invariants
1. **User Identity Isolation**: A user cannot modify another user's profile or inject another user's UID as `writerId` on `works`.
2. **Reviewer & Admin Tiering**: Only authorized Reviewers or Admins (and specifically the bootstrapped admin `yaredcotm@gmail.com`) can transition a work's status to `APPROVED` or `REVISION_REQUESTED` or edit official church roster members.
3. **Public Read of Approved Archives**: Approved works, active calendar events, and member roster are publicly readable to preserve Sunday school culture and literature for all faithful.
4. **Creator Integrity**: Authors can create works under review and edit draft works they own. Once submitted, critical fields cannot be tampered with by third parties.
5. **Path ID & Payload Hardening**: All collection IDs must conform to `^[a-zA-Z0-9_\-]+$` with bounded size limits (<= 128 chars).

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Spoofed Author ID**: Submitting a work where `writerId != request.auth.uid`.
2. **Ghost Field Poisoning**: Inserting unexpected fields like `isAdmin: true` into a work document.
3. **Self-Approval Bypass**: Author directly setting `status: "APPROVED"` during submission.
4. **Terminal State Mutation**: Overwriting an already approved work's text without admin/reviewer permission.
5. **Junk ID Attack**: Attempting to write to `/works/{1000-char-string}`.
6. **Denial of Wallet Payload**: Submitting a work with 5MB text exceeding character limits.
7. **PII Profile Hijack**: Non-owner attempting to overwrite someone else's user profile document in `/users/{userId}`.
8. **Admin Collection Injection**: Regular user attempting to create or delete an admin record in `/admins/{adminId}`.
9. **Unauthenticated Write**: Creating works without authentication.
10. **Unbounded Array Abuse**: Injecting a 10,000-item array into `tags`.
11. **Email Spoofing**: Claiming admin email without `request.auth.token.email_verified == true`.
12. **Member Roster Tampering**: Arbitrary guest updating member phone numbers or duty designations in `/members/{memberId}`.
