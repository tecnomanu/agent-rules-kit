---
globs: <root>/**/*
alwaysApply: false
---

# Memory MCP Usage Rules

You have access to Memory MCP for persistent knowledge storage and retrieval across sessions.

## Basic Instructions

1. **ALWAYS at session start:**

    - Run `memory_list` to see existing memories
    - Use `memory_search` to find relevant context from previous sessions
    - Review related memories before starting new tasks

2. **DURING work:**

    - Store important decisions with `memory_create`
    - Update existing knowledge with `memory_update`
    - Link related concepts using entity relationships

3. **BEFORE ending session:**
    - Save key insights and learnings with `memory_create`
    - Update any changed understanding with `memory_update`
    - Ensure important context is preserved for next session

## Available Tools

-   `memory_create(content, entities)` - Store new knowledge/memory
-   `memory_search(query, limit)` - Search existing memories
-   `memory_list(limit)` - List recent memories
-   `memory_update(memory_id, content, entities)` - Update existing memory
-   `memory_delete(memory_id)` - Remove outdated memory

## Strategy

Use Memory as your persistent brain. Store decisions, patterns, and insights. Search before starting new work to build on previous knowledge.

## What to Store

### Important Decisions:

```
"Decided to use JWT for authentication because..."
"Changed database from MySQL to PostgreSQL due to..."
"Selected React over Vue for better team familiarity"
```

### Patterns & Insights:

```
"User authentication pattern works well with middleware approach"
"Error handling strategy: catch at route level, log, return consistent format"
"Performance optimization: pagination improved load times by 60%"
```

### Project Context:

```
"This is a e-commerce project using Next.js and Stripe"
"Team prefers TypeScript for better type safety"
"Database schema optimized for read-heavy workloads"
```

### Code Insights:

```
"The payment processing logic in /lib/payments.js handles edge cases well"
"User validation function needs refactoring - too complex"
"API rate limiting implemented in middleware/rateLimit.js"
```

## Entity Examples

When creating memories, tag with relevant entities:

-   `project:ecommerce-app`
-   `technology:nextjs`
-   `pattern:authentication`
-   `decision:database-choice`
-   `performance:optimization`

This helps with targeted searching and relationship building.
