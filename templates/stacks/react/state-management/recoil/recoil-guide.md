# Recoil State Management in React

Recoil is a state management library for React applications that provides a flexible and efficient way to share state across components. Created by Facebook, it uses a graph-based approach with atoms and selectors.

## Core Concepts

1. **Atoms**: Basic units of state that components can subscribe to
2. **Selectors**: Pure functions that derive state from atoms or other selectors
3. **Atom Families & Selector Families**: Collections of atoms or selectors created from a template
4. **Hooks**: React hooks to read and write state (useRecoilState, useRecoilValue, etc.)
5. **Concurrency Model**: Works with React's concurrent mode

## Directory Structure

```
src/
├── recoil/
│   ├── index.js                # Exports all atoms and selectors
│   ├── atoms/
│   │   ├── authAtoms.js        # Authentication-related atoms
│   │   ├── uiAtoms.js          # UI-related atoms
│   │   └── todoAtoms.js        # Todo-related atoms
│   ├── selectors/
│   │   ├── authSelectors.js    # Authentication-related selectors
│   │   ├── uiSelectors.js      # UI-related selectors
│   │   └── todoSelectors.js    # Todo-related selectors
│   └── effects/
│       ├── persistence.js      # Effects for persistence
│       └── validation.js       # Effects for validation
└── components/
    ├── TodoList.jsx            # Component using todo atoms/selectors
    ├── UserProfile.jsx         # Component using auth atoms/selectors
    └── ThemeToggle.jsx         # Component using ui atoms/selectors
```

## Setup and Installation

First, install Recoil:

```bash
npm install recoil
# or with yarn
yarn add recoil
```

Then, wrap your app with `RecoilRoot`:

```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<RecoilRoot>
			<App />
		</RecoilRoot>
	</React.StrictMode>
);
```

## Implementation

### Basic Atoms and Selectors

```javascript
// recoil/atoms/todoAtoms.js
import { atom, atomFamily } from 'recoil';

// An atom representing the list of todo IDs
export const todoListState = atom({
	key: 'todoListState',
	default: [],
});

// An atom family representing individual todo items
export const todoItemState = atomFamily({
	key: 'todoItemState',
	default: (id) => ({
		id,
		text: '',
		completed: false,
		createdAt: new Date().toISOString(),
	}),
});

// An atom for the filter criteria
export const todoListFilterState = atom({
	key: 'todoListFilterState',
	default: 'all', // 'all' | 'completed' | 'uncompleted'
});
```

```javascript
// recoil/selectors/todoSelectors.js
import { selector, selectorFamily } from 'recoil';
import {
	todoListState,
	todoItemState,
	todoListFilterState,
} from '../atoms/todoAtoms';

// A selector that returns the filtered todo list
export const filteredTodoListState = selector({
	key: 'filteredTodoListState',
	get: ({ get }) => {
		const filter = get(todoListFilterState);
		const todoList = get(todoListState);

		return todoList
			.map((id) => get(todoItemState(id)))
			.filter((item) => {
				switch (filter) {
					case 'completed':
						return item.completed;
					case 'uncompleted':
						return !item.completed;
					default:
						return true;
				}
			});
	},
});

// A selector that returns todo statistics
export const todoStatsState = selector({
	key: 'todoStatsState',
	get: ({ get }) => {
		const todoList = get(todoListState).map((id) => get(todoItemState(id)));
		const totalNum = todoList.length;
		const completedNum = todoList.filter((item) => item.completed).length;
		const uncompletedNum = totalNum - completedNum;
		const percentCompleted =
			totalNum === 0 ? 0 : Math.round((completedNum / totalNum) * 100);

		return {
			totalNum,
			completedNum,
			uncompletedNum,
			percentCompleted,
		};
	},
});

// A selector family that returns a specific todo by ID with additional info
export const enhancedTodoItemState = selectorFamily({
	key: 'enhancedTodoItemState',
	get:
		(id) =>
		({ get }) => {
			const item = get(todoItemState(id));
			// Add additional derived information
			return {
				...item,
				isOverdue: item.dueDate
					? new Date(item.dueDate) < new Date()
					: false,
			};
		},
});
```

### Using Atoms with Effects for Persistence

```javascript
// recoil/effects/persistence.js
import { todoListState, todoItemState } from '../atoms/todoAtoms';

// Effect to persist todos in localStorage
export const localStorageEffect =
	(key) =>
	({ setSelf, onSet, trigger }) => {
		// If there's saved data, load it on initialization
		if (trigger === 'get') {
			const savedValue = localStorage.getItem(key);
			if (savedValue != null) {
				setSelf(JSON.parse(savedValue));
			}
		}

		// Save to localStorage on change
		onSet((newValue, _, isReset) => {
			isReset
				? localStorage.removeItem(key)
				: localStorage.setItem(key, JSON.stringify(newValue));
		});
	};

// Then use it in atom definition:
export const persistedTodoListState = atom({
	key: 'persistedTodoListState',
	default: [],
	effects: [localStorageEffect('todo_list')],
});
```

### Async Selectors

```javascript
// recoil/selectors/userSelectors.js
import { selector, selectorFamily } from 'recoil';
import { userState } from '../atoms/userAtoms';

// Async selector that fetches user data
export const userDataQuery = selectorFamily({
	key: 'userDataQuery',
	get: (userId) => async () => {
		if (!userId) return null;

		try {
			const response = await fetch(
				`https://api.example.com/users/${userId}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch user data');
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching user data:', error);
			throw error;
		}
	},
});

// Selector that combines local state with async data
export const combinedUserProfileState = selectorFamily({
	key: 'combinedUserProfileState',
	get:
		(userId) =>
		({ get }) => {
			const userData = get(userDataQuery(userId));
			const localUserState = get(userState);

			return {
				...userData,
				...localUserState,
				lastUpdated: new Date().toISOString(),
			};
		},
});
```

### Component Implementation Examples

```jsx
// components/TodoList.jsx
import React from 'react';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import {
	todoListState,
	todoItemState,
	todoListFilterState,
} from '../recoil/atoms/todoAtoms';
import {
	filteredTodoListState,
	todoStatsState,
} from '../recoil/selectors/todoSelectors';

const TodoList = () => {
	const todoList = useRecoilValue(filteredTodoListState);
	const todoStats = useRecoilValue(todoStatsState);
	const [filter, setFilter] = useRecoilState(todoListFilterState);
	const setTodoList = useSetRecoilState(todoListState);

	const addTodo = () => {
		const id = Date.now().toString();
		setTodoList((oldList) => [...oldList, id]);
	};

	return (
		<div className='todo-container'>
			<div className='stats'>
				<p>Total: {todoStats.totalNum}</p>
				<p>Completed: {todoStats.completedNum}</p>
				<p>Progress: {todoStats.percentCompleted}%</p>
			</div>

			<div className='filters'>
				<button
					onClick={() => setFilter('all')}
					className={filter === 'all' ? 'active' : ''}>
					All
				</button>
				<button
					onClick={() => setFilter('completed')}
					className={filter === 'completed' ? 'active' : ''}>
					Completed
				</button>
				<button
					onClick={() => setFilter('uncompleted')}
					className={filter === 'uncompleted' ? 'active' : ''}>
					Uncompleted
				</button>
			</div>

			<ul className='todo-list'>
				{todoList.map((todo) => (
					<TodoItem key={todo.id} id={todo.id} />
				))}
			</ul>

			<button onClick={addTodo}>Add Todo</button>
		</div>
	);
};

const TodoItem = ({ id }) => {
	const [todo, setTodo] = useRecoilState(todoItemState(id));
	const setTodoList = useSetRecoilState(todoListState);

	const updateText = (event) => {
		setTodo({
			...todo,
			text: event.target.value,
		});
	};

	const toggleCompleted = () => {
		setTodo({
			...todo,
			completed: !todo.completed,
		});
	};

	const deleteTodo = () => {
		setTodoList((oldList) => oldList.filter((itemId) => itemId !== id));
	};

	return (
		<li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
			<input
				type='checkbox'
				checked={todo.completed}
				onChange={toggleCompleted}
			/>
			<input
				type='text'
				value={todo.text}
				onChange={updateText}
				placeholder='Enter a task...'
			/>
			<button onClick={deleteTodo}>Delete</button>
		</li>
	);
};

export default TodoList;
```

```jsx
// components/UserProfile.jsx
import React, { Suspense } from 'react';
import { useRecoilValue } from 'recoil';
import { combinedUserProfileState } from '../recoil/selectors/userSelectors';

const UserProfile = ({ userId }) => {
	return (
		<div className='user-profile'>
			<h2>User Profile</h2>

			<Suspense fallback={<div>Loading user data...</div>}>
				<UserData userId={userId} />
			</Suspense>
		</div>
	);
};

// This component will suspend while loading async data
const UserData = ({ userId }) => {
	// This will automatically handle loading states (suspense)
	const userData = useRecoilValue(combinedUserProfileState(userId));

	if (!userData) {
		return <div>No user data available</div>;
	}

	return (
		<div className='user-data'>
			<h3>{userData.name}</h3>
			<p>Email: {userData.email}</p>
			<p>Location: {userData.location}</p>
			<p>
				Last Updated: {new Date(userData.lastUpdated).toLocaleString()}
			</p>
		</div>
	);
};

export default UserProfile;
```

## Advanced Features and Patterns

### Atom Effects

Atom effects allow you to add side effects to atoms, such as synchronization with external storage, logging, or validation.

```javascript
// recoil/effects/validation.js
export const validationEffect =
	(validator) =>
	({ setSelf, onSet }) => {
		onSet((newValue, oldValue) => {
			if (!validator(newValue)) {
				// You can either:
				// 1. Throw an error
				throw new Error('Invalid state!');

				// 2. Or revert to the old value
				// setSelf(oldValue);
			}
		});
	};

// Then use the effect in an atom
export const emailState = atom({
	key: 'emailState',
	default: '',
	effects: [
		validationEffect((email) => {
			// Simple validation rule
			return /\S+@\S+\.\S+/.test(email) || email === '';
		}),
	],
});
```

### Transaction Observer

You can create a global observer for state changes:

```javascript
// recoil/observers.js
import { useTransactionObservation_UNSTABLE } from 'recoil';

export function StateChangeLogger() {
	useTransactionObservation_UNSTABLE(
		({ atomValues, atomInfo, modifiedAtoms }) => {
			for (const modifiedAtom of modifiedAtoms) {
				console.log(`Atom ${modifiedAtom} was modified`);
				console.log('New value:', atomValues.get(modifiedAtom));
			}
		}
	);

	return null;
}

// Then add it to your app
function App() {
	return (
		<RecoilRoot>
			<StateChangeLogger />
			{/* Rest of your app */}
		</RecoilRoot>
	);
}
```

### Snapshot Hooks for Time-Travel Debugging

```javascript
// components/TimeTravel.jsx
import React, { useState, useCallback } from 'react';
import {
	useGotoRecoilSnapshot,
	useRecoilSnapshot,
	useRecoilCallback,
} from 'recoil';

const TimeTravel = () => {
	const [snapshots, setSnapshots] = useState([]);
	const gotoSnapshot = useGotoRecoilSnapshot();

	// Get the current snapshot
	const currentSnapshot = useRecoilSnapshot();

	// Add current snapshot to history
	const takeSnapshot = useCallback(() => {
		setSnapshots((snaps) => [...snaps, currentSnapshot]);
	}, [currentSnapshot]);

	// Go to a specific snapshot
	const goToSnapshot = useCallback(
		(index) => {
			const snapshot = snapshots[index];
			gotoSnapshot(snapshot);
		},
		[gotoSnapshot, snapshots]
	);

	return (
		<div className='time-travel-debugger'>
			<h3>Time Travel Debugging</h3>
			<button onClick={takeSnapshot}>Take Snapshot</button>

			<div className='snapshots'>
				<h4>Snapshots ({snapshots.length})</h4>
				<ul>
					{snapshots.map((_, index) => (
						<li key={index}>
							<button onClick={() => goToSnapshot(index)}>
								Go to Snapshot {index + 1}
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default TimeTravel;
```

## Best Practices

### 1. Atom Organization

-   Group related atoms in files based on domain/feature
-   Use consistent naming patterns (e.g., `entityNameState`)
-   Consider splitting large domains into multiple files
-   Export atoms via a barrel file (index.js)

### 2. Selector Patterns

-   Use selectors to derive state rather than duplicating logic
-   Create smaller, composable selectors
-   Use memoization for expensive calculations
-   Consider performance implications of complex selectors

### 3. Error Handling

-   Handle promise rejections in async selectors
-   Set up error boundaries around suspense components
-   Use `errorSelector` to transform errors

```jsx
const errorSelector = selector({
	key: 'errorSelector',
	get: async ({ get }) => {
		try {
			return get(myDataQuery);
		} catch (error) {
			// transform or log error
			throw new Error(`Friendly error message: ${error.message}`);
		}
	},
});
```

### 4. Data Fetching Patterns

-   Use suspense for async data loading
-   Consider implementing request deduplication
-   Cache responses appropriately
-   Handle loading and error states gracefully

### 5. Performance Considerations

-   Use atomFamily and selectorFamily for collections
-   Split large components into smaller ones that subscribe to specific atoms
-   Use `useRecoilCallback` for complex state updates
-   Profile using the React DevTools and Recoil Debug Observer

### 6. TypeScript Integration

```typescript
// recoil/atoms/todoAtoms.ts
import { atom, atomFamily, AtomEffect } from 'recoil';

// Define types
export interface Todo {
	id: string;
	text: string;
	completed: boolean;
	createdAt: string;
	dueDate?: string;
}

export type TodoFilter = 'all' | 'completed' | 'uncompleted';

// Type the atoms
export const todoListState = atom<string[]>({
	key: 'todoListState',
	default: [],
});

export const todoItemState = atomFamily<Todo, string>({
	key: 'todoItemState',
	default: (id) => ({
		id,
		text: '',
		completed: false,
		createdAt: new Date().toISOString(),
	}),
});

export const todoListFilterState = atom<TodoFilter>({
	key: 'todoListFilterState',
	default: 'all',
});
```

## When to Choose Recoil

Recoil is particularly well-suited for:

-   React-only applications (it's tightly integrated with React)
-   Applications that need to share state between distant components
-   Projects that need fine-grained reactivity
-   Applications that can benefit from asynchronous selectors
-   Teams that prefer a simpler API than Redux
-   Apps that need to work well with React Concurrent Mode and Suspense

Recoil may not be the best choice when:

-   You need a non-React state solution
-   You require a more mature ecosystem (Recoil is newer than Redux)
-   You need time-tested patterns and extensive documentation
-   Your application is very small and simple

## Comparison with Other State Management Libraries

### Recoil vs. Redux

-   **API Complexity**: Recoil has a simpler API with fewer concepts to learn
-   **Boilerplate**: Recoil requires less boilerplate code
-   **React Integration**: Recoil is more tightly integrated with React
-   **Async Handling**: Recoil has built-in support for async operations via selectors
-   **Maturity**: Redux has a more mature ecosystem and community

### Recoil vs. MobX

-   **Paradigm**: Recoil uses atoms/selectors, MobX uses observable objects
-   **Reactivity Model**: Recoil is more explicit, MobX can be more "magical"
-   **Learning Curve**: Recoil may be easier to learn for React developers
-   **Performance**: Both offer good performance with different optimization strategies
-   **Debugging**: Recoil has built-in time-travel debugging capabilities

### Recoil vs. Context API

-   **Performance**: Recoil has better performance for frequent updates
-   **Granularity**: Recoil allows for more granular subscriptions
-   **Features**: Recoil offers more features (async, derived state, etc.)
-   **Complexity**: Context API is simpler but less powerful
-   **Bundle Size**: Context API doesn't add any bundle size
