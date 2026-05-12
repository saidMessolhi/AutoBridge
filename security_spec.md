# Security Specification for AutoBridge SaaS

## 1. Data Invariants
- A `User` can only access data belonging to their `tenantId`.
- An `ImportOrder` must have a valid `clientId` that exists as a user in the same tenant.
- Only users with `ADMIN` or `ACCOUNTANT` roles can create/update `Payment` records.
- `OrderDocuments` can be uploaded by any staff member, but only read by the assigned `CLIENT` or staff.
- Once an `ImportOrder` reaches the `DELIVERED` status, it becomes immutable for non-admin users.
- `createdAt` fields are immutable.
- `updatedAt` always matches `request.time`.

## 2. The "Dirty Dozen" Payloads (Attacker Payloads)

### T1: Identity Spoofing (Creating user for different tenant)
```json
{
  "email": "victim@example.com",
  "name": "Attacker",
  "role": "CLIENT",
  "tenantId": "target-tenant-id",
  "createdAt": "2024-05-11T08:00:00Z"
}
```
*Expected: PERMISSION_DENIED (User cannot create docs for other tenants)*

### T2: Privilege Escalation (Self-assigning ADMIN role)
```json
{
  "email": "attacker@example.com",
  "name": "Attacker",
  "role": "ADMIN",
  "tenantId": "my-tenant",
  "createdAt": "2024-05-11T08:00:00Z"
}
```
*Expected: PERMISSION_DENIED (Only existing admins can assign admin role)*

### T3: Resource Poisoning (Massive VIN string)
```json
{
  "vehicleDetails": {
    "vin": "A".repeat(2000)
  }
}
```
*Expected: PERMISSION_DENIED (String size limit exceeded)*

### T4: Shadow Update (Injecting unknown fields)
```json
{
  "isVerified": true,
  "currentStage": "SHIPPED"
}
```
*Expected: PERMISSION_DENIED (Map keys must strictly match schema via hasOnly)*

### T5: Cross-Tenant Order Access (Reading order from another tenant)
*Request: get(/tenants/other-tenant/import_orders/order-123)*
*Expected: PERMISSION_DENIED*

### T6: Unauthorized Payment Creation (Client trying to mark as PAID)
```json
{
  "amount": 1500000,
  "type": "DEPOSIT",
  "status": "PAID"
}
```
*Expected: PERMISSION_DENIED (Role check failed)*

### T7: Terminal State Bypass (Updating delivered order)
```json
{
  "vehicleDetails": { "color": "RED" }
}
```
*Expected: PERMISSION_DENIED (Status is DELIVERED)*

### T8: Timestamp Spoofing (Old createdAt)
```json
{
  "createdAt": "2020-01-01T00:00:00Z"
}
```
*Expected: PERMISSION_DENIED (Must match request.time)*

### T9: ID Poisoning (Junk characters in ID)
*Path: /tenants/my-tenant/import_orders/!!!invalid-id!!!*
*Expected: PERMISSION_DENIED (isValidId regex check)*

### T10: Orphaned Order Creation (Order for non-existent client)
```json
{
  "clientId": "ghost-user-id"
}
```
*Expected: PERMISSION_DENIED (exists() check for clientId)*

### T11: PII Leak (Unauthorized read of User profile)
*Request: get(/tenants/my-tenant/users/other-user)*
*Expected: PERMISSION_DENIED (Only self or admin can read)*

### T12: Missing Relational Sync (Adding tracking without order)
*Request: create(/tenants/my-tenant/import_orders/non-existent/tracking/1)*
*Expected: PERMISSION_DENIED (get() parent check)*
