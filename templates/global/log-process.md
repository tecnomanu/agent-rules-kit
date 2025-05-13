---
description: Guidelines for process logging
globs: **/*
alwaysApply: true
---

# Task Process Logging

For long or complex tasks, maintain a detailed log in `docs/logs-process/YYYY-MM-DD_<task-name>.md`. This practice improves task tracking, knowledge sharing, and project documentation.

## Log Structure

Each process log should include:

1. **Title**: Clear description of the task with date
2. **Objectives**: What you are trying to accomplish
3. **Prerequisites**: Requirements and dependencies
4. **Task Breakdown**: Checklist of subtasks
5. **Process Notes**: Observations made during implementation
6. **Problems & Solutions**: Issues encountered and how they were resolved
7. **Decisions**: Important decisions and their rationale
8. **Result**: Final outcome and verification steps
9. **Future Considerations**: Notes for future improvements

## Log Template

```markdown
# Task: [Task Name] - YYYY-MM-DD

## Objectives

-   Primary objective
-   Secondary objectives

## Prerequisites

-   Required tools
-   Required permissions/access
-   Related documentation

## Task Breakdown

-   [ ] Step 1: [Description]
-   [ ] Step 2: [Description]
-   [ ] Step 3: [Description]

## Process Notes

-   [Timestamp] Observation or implementation detail
-   [Timestamp] Another observation

## Problems & Solutions

### Problem 1: [Problem description]

-   Attempted solution 1: [Result]
-   Attempted solution 2: [Result]
-   Final solution: [Implementation details]

### Problem 2: [Problem description]

-   Solution: [Implementation details]

## Decisions

-   Decision 1: [What was decided]
    Rationale: [Why this choice was made]
    Alternatives considered: [What else was considered]

## Result

-   Success/Partial success/Failure
-   Verification steps performed
-   Evidence of completion

## Future Considerations

-   Potential improvements
-   Related tasks that should be considered later
```

## Best Practices

1. **Real-time Updates**: Update the log while working on the task, not after completion
2. **Detailed Problems**: Document all encountered problems, even if solved quickly
3. **Command Logging**: Record exact commands used for future reference
4. **Versioning**: Include version numbers of tools/libraries used
5. **Screenshots**: Include screenshots of important states or errors
6. **Time Tracking**: Note timestamps for major steps to help estimate similar tasks

## When to Create Process Logs

Create logs for:

-   System architecture changes
-   Complex bug fixes
-   Major feature implementations
-   Configuration changes
-   Data migrations
-   Performance optimizations
-   Security-related changes
-   Anything that might need to be referred to later

## Integration with Workflow

1. Create log file at task initiation
2. Update throughout implementation
3. Review and finalize before marking task complete
4. Reference in commit messages and pull requests
5. Share with team members for knowledge transfer
