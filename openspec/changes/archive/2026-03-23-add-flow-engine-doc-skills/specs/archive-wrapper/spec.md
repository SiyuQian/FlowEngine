## ADDED Requirements

### Requirement: Archive wrapper delegates to OpenSpec archive
The `/flow-engine:archive` command SHALL invoke the `openspec-archive-change` skill to perform the full standard archive workflow (validation, spec sync, move to archive).

#### Scenario: Standard archive delegation
- **WHEN** user runs `/flow-engine:archive my-change`
- **THEN** the system performs the complete OpenSpec archive workflow for `my-change` identically to `/opsx:archive my-change`

#### Scenario: Archive without change name
- **WHEN** user runs `/flow-engine:archive` without a change name
- **THEN** the system prompts for change selection, same as `/opsx:archive`

### Requirement: Post-archive documentation update prompt
After a successful archive, the system SHALL display a prompt suggesting the user run `/flow-engine:update-docs <change-name>` to update project documentation.

#### Scenario: Prompt after successful archive
- **WHEN** the archive completes successfully for change `add-auth`
- **THEN** the system displays: "To update project documentation, run: `/flow-engine:update-docs add-auth`"

#### Scenario: No prompt on archive failure
- **WHEN** the archive fails (e.g., target directory already exists)
- **THEN** the system does NOT display the update-docs prompt
