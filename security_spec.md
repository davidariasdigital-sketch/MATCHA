# Security Specification - Matcha Tasks

## Data Invariants
- Each task must belong to a valid user.
- A user can only read and write their own tasks.
- A user profile can only be managed by that specific user.
- Tasks must have a title, date, and status.

## The Dirty Dozen Payloads
Below are 12 payloads that should be rejected by the security rules:

1. **Identity Spoofing (Create)**: Creating a task for another user.
   ```json
   { "userId": "victim_uid", "title": "Evil Task", "date": "2024-05-18T10:00:00Z", "status": "pending" }
   ```
2. **Identity Spoofing (Update)**: Changing the `userId` of an existing task.
   ```json
   { "userId": "attacker_uid" }
   ```
3. **Privilege Escalation**: Attempting to set an `isAdmin` field on a user profile.
   ```json
   { "isAdmin": true }
   ```
4. **Invalid Date Format**: Sending a non-ISO string as a date.
   ```json
   { "date": "yesterday" }
   ```
5. **Title Poisoning**: Sending a 1MB string as a title.
   ```json
   { "title": "A".repeat(1000000) }
   ```
6. **Status Injection**: Setting an invalid status.
   ```json
   { "status": "unknown" }
   ```
7. **Orphaned Writes**: Creating a task without a title.
   ```json
   { "date": "2024-05-18T10:00:00Z", "status": "pending" }
   ```
8. **PII Leakage**: Authenticated user trying to `get` another user's private profile.
9. **Bulk Scrape**: Trying to `list` tasks without a `userId` filter.
10. **Timestamp Spoofing**: Sending a `createdAt` from the future.
11. **Shadow Update**: Adding an extra field `isVerified` to a task.
12. **ID Poisoning**: Using a 2KB string as a document ID.

## Security Rules Implementation Strategy
- Use `rules_version = '2';`
- Implement `isValidTask()` and `isValidUser()` helpers.
- Enforce `userId` matches `request.auth.uid`.
- Strict key matching for creation.
- Action-based update pattern using `affectedKeys().hasOnly()`.
