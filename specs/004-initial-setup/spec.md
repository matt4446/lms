# Feature Specification: First Setup

**Feature Branch**: `004-initial-setup`
**Created**: 2025-12-10
**Status**: Draft
**Input**: User description: "First Setup"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Admin Account Creation (Priority: P1)

As the first user of the system (System Owner), I need to create a super-administrator account so that I can log in and manage the DrillSkill LMS.

**Why this priority**: Without an admin account, the system is unusable. This is the entry point for all future management.

**Independent Test**: Can be tested by starting with a fresh database and verifying that the setup wizard appears and allows creating a user who can then log in.

**Acceptance Scenarios**:

1. **Given** a fresh installation with no users, **When** I access the application, **Then** I am redirected to the First Setup Wizard.
2. **Given** I am on the Setup Wizard, **When** I enter valid admin details (Email, Password, Name) and submit, **Then** a new admin user is created in the database.
3. **Given** I have completed the setup, **When** I try to access the Setup Wizard again, **Then** I am redirected to the login page or dashboard.

---

### User Story 2 - Basic Site Configuration (Priority: P1)

As the System Owner, I want to define the basic identity of my LMS (Site Name) during setup so that it reflects my organization.

**Why this priority**: Essential for branding and identifying the instance.

**Independent Test**: Can be tested by completing the setup and verifying the Site Name appears in the UI header/title.

**Acceptance Scenarios**:

1. **Given** I am on the Setup Wizard, **When** I enter a Site Name, **Then** the system saves this configuration.
2. **Given** setup is complete, **When** I view the dashboard, **Then** the configured Site Name is displayed.

### Edge Cases

- **Concurrent Setup**: What happens if two users try to run setup at the same time? (Should handle race condition or just first-one-wins).
- **Database Failure**: If database write fails during setup, show clear error and allow retry.
- **Weak Password**: Enforce password strength for the root admin.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect if the application has been configured (e.g., check for existence of admin user or config flag).
- **FR-002**: System MUST redirect all unauthenticated traffic to the Setup Wizard if not configured.
- **FR-003**: The Setup Wizard MUST collect Admin User details: Email, Password, Full Name.
- **FR-004**: The Setup Wizard MUST collect Site Configuration: Site Name.
- **FR-005**: System MUST validate email format and password strength (min 8 chars).
- **FR-006**: Upon successful submission, the system MUST create a user with "Super Admin" (or equivalent high-level) role.
- **FR-007**: Upon successful submission, the system MUST save the Site Name to the system configuration.
- **FR-008**: After setup completion, the user MUST be automatically logged in and redirected to the Dashboard.
- **FR-009**: If setup is already complete, the `/setup` route MUST be inaccessible (redirect to home/login).

### Key Entities *(include if feature involves data)*

- **User**: Needs a role/permission field to distinguish Super Admin.
- **SystemConfig**: A new entity or storage mechanism to hold global settings like "Site Name".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete the entire setup process in under 2 minutes.
- **SC-002**: 100% of fresh installations redirect to setup on first visit.
- **SC-003**: It is impossible to trigger the setup process once an admin account exists.
