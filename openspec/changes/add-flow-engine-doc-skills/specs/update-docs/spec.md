## ADDED Requirements

### Requirement: Update docs with change context
When invoked with a change name, the system SHALL read the archived change's artifacts (proposal, design, specs, tasks) and use them as primary context for determining what documentation updates are needed.

#### Scenario: Focused review after archive
- **WHEN** user runs `/flow-engine:update-docs add-auth`
- **THEN** the system reads `openspec/changes/archive/*-add-auth/` artifacts and focuses the doc review on changes introduced by that change

#### Scenario: Change not found in archive
- **WHEN** user runs `/flow-engine:update-docs nonexistent`
- **THEN** the system checks both active changes and archived changes, and reports an error if not found in either location

### Requirement: Update docs without change context
When invoked without arguments, the system SHALL perform a full review comparing all project documentation against the current project state (main specs, source code, package.json).

#### Scenario: Full project doc review
- **WHEN** user runs `/flow-engine:update-docs`
- **THEN** the system reads all existing docs, all main specs at `openspec/specs/`, and project metadata, then identifies stale or missing sections

### Requirement: Read existing documentation files
The system SHALL read whichever documentation files exist among README.md, CLAUDE.md, and AGENTS.md. Missing files SHALL be silently skipped, not created.

#### Scenario: Only README exists
- **WHEN** only `README.md` exists in the project root
- **THEN** the system reviews only `README.md` and does not create CLAUDE.md or AGENTS.md

#### Scenario: Multiple docs exist
- **WHEN** `README.md` and `CLAUDE.md` both exist
- **THEN** the system reviews both files

### Requirement: User confirmation before writing
The system SHALL present proposed changes for each file and wait for user confirmation before writing any modifications.

#### Scenario: User approves changes
- **WHEN** the system identifies updates needed for `README.md`
- **THEN** the system shows the proposed changes and waits for user approval before writing

#### Scenario: User rejects changes
- **WHEN** the user declines proposed changes for a file
- **THEN** the system skips that file and moves to the next, or finishes if no more files

#### Scenario: No changes needed
- **WHEN** all documentation is already up to date
- **THEN** the system reports that no updates are needed and exits

### Requirement: AI free judgment for update decisions
The system SHALL use AI judgment to determine which sections need updating. There SHALL be no hardcoded mapping between specs and doc sections.

#### Scenario: AI identifies stale feature list
- **WHEN** a new capability was added via archived change but README's feature list doesn't mention it
- **THEN** the system proposes adding the feature to the appropriate section

#### Scenario: AI identifies no relevant doc impact
- **WHEN** an archived change is an internal refactor with no user-facing impact
- **THEN** the system reports no documentation changes needed
