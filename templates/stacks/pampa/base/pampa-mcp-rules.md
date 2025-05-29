---
globs: ['<root>/**/*']
alwaysApply: false
---

# Pampa MCP Rules for AI Agents

## Core Usage Principles

When using Pampa as an AI agent, follow these essential rules to maximize effectiveness and maintain performance.

### Rule 1: Always Check for Pampa Index First

Before performing any search operations, verify the project has been indexed:

```javascript
// Check if .pampa directory exists
const stats = await client.callTool('pampa_get_project_stats', {
	path: '.',
});

if (!stats.indexed) {
	// Index the project first
	await client.callTool('pampa_index_project', {
		path: '.',
		provider: 'auto',
	});
}
```

### Rule 2: Use Semantic Queries, Not Literal Searches

Pampa understands intent and context. Use descriptive, goal-oriented queries:

```javascript
// ✅ Good - describes intent and context
await client.callTool('pampa_search_code', {
	query: 'user authentication middleware that validates JWT tokens',
	limit: 5,
});

// ❌ Bad - too literal or vague
await client.callTool('pampa_search_code', {
	query: 'auth',
	limit: 5,
});
```

### Rule 3: Limit Results Appropriately

Always set reasonable limits to avoid overwhelming responses:

```javascript
// ✅ Good - appropriate limits
const results = await client.callTool('pampa_search_code', {
	query: 'database connection pool implementation',
	limit: 10, // Usually 5-15 is optimal
});
```

### Rule 4: Use Progressive Query Refinement

Start broad, then narrow down based on results:

```javascript
// Step 1: Broad search
let results = await client.callTool('pampa_search_code', {
	query: 'API endpoints',
	limit: 10,
});

// Step 2: Refine based on findings
results = await client.callTool('pampa_search_code', {
	query: 'REST API authentication endpoints with middleware',
	limit: 5,
});
```

### Rule 5: Retrieve Full Code Context When Needed

Use the SHA to get complete code chunks for implementation details:

```javascript
const searchResults = await client.callTool('pampa_search_code', {
	query: 'user registration validation',
	limit: 3,
});

// Get full context for the most relevant result
const fullCode = await client.callTool('pampa_get_code_chunk', {
	sha: searchResults[0].sha,
});
```

## Query Formulation Best Practices

### Effective Query Patterns

1. **Functional Queries**: Describe what the code does

    ```
    "function that validates email addresses using regex"
    "middleware that handles CORS configuration"
    "class that manages database connections"
    ```

2. **Pattern-Based Queries**: Look for specific patterns

    ```
    "singleton pattern implementation"
    "factory method for creating user objects"
    "observer pattern with event listeners"
    ```

3. **Technology-Specific Queries**: Include framework/library context
    ```
    "React component that handles form validation"
    "Express.js route handler for user authentication"
    "Django model with custom validation methods"
    ```

### Query Refinement Strategies

```javascript
// Strategy 1: Technology + Function + Context
const query1 = 'React hooks for managing user authentication state';

// Strategy 2: Problem + Solution + Implementation
const query2 = 'error handling for async database operations with try-catch';

// Strategy 3: Component + Interaction + Purpose
const query3 = 'API service class that handles HTTP requests with retry logic';
```

## Performance Guidelines

### Optimal Search Patterns

1. **Batch Related Searches**: Group conceptually related queries
2. **Cache Results**: Store frequently accessed code chunks
3. **Use Appropriate Limits**: Balance completeness with performance

```javascript
// ✅ Efficient pattern
const concepts = [
	'user authentication flow',
	'password validation rules',
	'session management',
];

const results = await Promise.all(
	concepts.map((query) =>
		client.callTool('pampa_search_code', {
			query,
			limit: 5,
		})
	)
);
```

### Avoid Anti-Patterns

```javascript
// ❌ Avoid: Too many individual searches
// ❌ Avoid: Extremely broad queries without limits
// ❌ Avoid: Searching for the same thing repeatedly
```

## Integration Workflows

### Code Understanding Workflow

1. **Overview Phase**: Get project structure

    ```javascript
    await client.callTool('pampa_search_code', {
    	query: 'main application entry point',
    	limit: 3,
    });
    ```

2. **Feature Analysis**: Understand specific features

    ```javascript
    await client.callTool('pampa_search_code', {
    	query: 'user registration complete workflow',
    	limit: 8,
    });
    ```

3. **Implementation Details**: Get specific code chunks
    ```javascript
    const fullImplementation = await client.callTool('pampa_get_code_chunk', {
    	sha: relevantSha,
    });
    ```

### Code Modification Workflow

1. **Find Existing Patterns**: Look for similar implementations
2. **Understand Context**: Get surrounding code
3. **Identify Dependencies**: Find related functions/classes
4. **Plan Changes**: Based on existing patterns

```javascript
// Find similar implementations
const similar = await client.callTool('pampa_search_code', {
	query: 'similar user input validation patterns',
	limit: 5,
});

// Get full context
const context = await client.callTool('pampa_get_code_chunk', {
	sha: similar[0].sha,
});
```

## Error Handling

### Handle Missing Index

```javascript
try {
	const results = await client.callTool('pampa_search_code', {
		query: 'authentication function',
		limit: 5,
	});
} catch (error) {
	if (error.message.includes('not indexed')) {
		// Auto-index and retry
		await client.callTool('pampa_index_project', { path: '.' });
		// Retry search
	}
}
```

### Handle Empty Results

```javascript
const results = await client.callTool('pampa_search_code', {
	query: 'specific function name',
	limit: 10,
});

if (results.length === 0) {
	// Try broader query
	const broaderResults = await client.callTool('pampa_search_code', {
		query: 'authentication functions',
		limit: 10,
	});
}
```

## Update and Maintenance

### Keep Index Current

```javascript
// Update index when codebase changes
await client.callTool('pampa_update_project', {
	path: '.',
	provider: 'auto',
});
```

### Monitor Index Health

```javascript
const stats = await client.callTool('pampa_get_project_stats', {
	path: '.',
});

console.log(`Indexed files: ${stats.fileCount}`);
console.log(`Index size: ${stats.indexSize}`);
console.log(`Last updated: ${stats.lastUpdated}`);
```

These rules ensure efficient, effective use of Pampa for semantic code search while maintaining optimal performance and providing valuable results for AI agent workflows.
