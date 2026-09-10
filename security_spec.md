# Security Specification & Threat Model

## 1. Data Invariants
1. **User Identity & Isolation**: A user cannot modify or forge another user's profile, role, or approval status. Normal students are initialized with `role: 'student'` and `status: 'pending'`. Only verified admins can change roles or approve/reject users.
2. **Admin Privilege Guard**: Admin operations (`announcements` creation, modifying user approval status, course management) require an authenticated user whose UID exists in the admin list or whose email matches the verified platform admin (`muxtorovaslonbek@gmail.com`).
3. **Feedback Ownership**: Feedback messages can only be submitted with `userId == request.auth.uid`. Students can only read or list their own feedback; admins can read and update all feedback (to add replies).
4. **Test Result Integrity**: Test results can only be recorded by the test taker (`userId == request.auth.uid`). Users can only list their own test results.
5. **Payload Size & Key Constraints**: All string fields are constrained in size to prevent denial-of-wallet exhaustion.

## 2. The "Dirty Dozen" Payloads
1. **Self-Escalation Attack**: Student sends payload `{ role: 'admin', status: 'approved' }` during registration. (Expected: REJECTED).
2. **Ghost Field Poisoning**: Writing `{ role: 'student', ghostProperty: 'malicious' }` to user profile. (Expected: REJECTED).
3. **ID Impersonation**: Attacker attempts to write to `/users/victimUid` with their own auth token. (Expected: REJECTED).
4. **Feedback Spoofing**: Attacker submits feedback claiming to be `userId: victimUid`. (Expected: REJECTED).
5. **Course Defacement**: Non-admin student attempts to delete or update `/courses/c1`. (Expected: REJECTED).
6. **Unverified Admin Email Attack**: Token claiming admin email with `email_verified: false`. (Expected: REJECTED).
7. **Oversized String Injection**: Payload with a 2MB string in `bio` or `feedback.message`. (Expected: REJECTED).
8. **Test Score Forgery**: Attacker writes a test result with `userId` of another user to fake certificates. (Expected: REJECTED).
9. **Announcement Modification**: Non-admin attempts to pin or modify an announcement. (Expected: REJECTED).
10. **Approval Bypass**: Pending student attempts to change their own status to `approved`. (Expected: REJECTED).
11. **Feedback Listing Snoop**: Attacker runs `feedbacks` collection query without filtering by their own `userId`. (Expected: REJECTED).
12. **Malicious Path Traversal / Junk ID**: Attacker targets doc ID with 1KB non-alphanumeric characters. (Expected: REJECTED).
