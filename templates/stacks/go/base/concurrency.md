---
description: Fundamental concurrency patterns in Go using goroutines and channels.
globs: <root>/**/*.go
alwaysApply: true
---

# Go Concurrency Patterns

Go was designed with concurrency in mind, providing powerful yet simple primitives like goroutines and channels to build concurrent applications. Understanding these patterns is key to writing efficient and scalable Go code in {projectPath}.

## Goroutines

A goroutine is a lightweight thread of execution managed by the Go runtime.

-   **Starting a Goroutine**: Use the `go` keyword followed by a function call. The function will execute concurrently with the calling goroutine.

    ```go
    package main

    import (
    	"fmt"
    	"time"
    )

    func say(s string) {
    	for i := 0; i < 3; i++ {
    		fmt.Println(s)
    		time.Sleep(100 * time.Millisecond)
    	}
    }

    func main() {
    	go say("world") // Start a new goroutine
    	say("hello")    // Current goroutine continues
    }
    // Output (order may vary):
    // hello
    // world
    // hello
    // world
    // hello
    // world
    ```

-   **Anonymous Goroutines**: You can start goroutines with anonymous functions (closures).
    ```go
    go func(msg string) {
        fmt.Println(msg)
    }("going")
    ```
    Be mindful of variable capture in closures, especially with loop variables. It's often safer to pass loop variables as arguments to the anonymous function.

## Channels

Channels are typed conduits through which you can send and receive values with the `<-` operator. They provide a way for goroutines to communicate and synchronize.

-   **Creating Channels**: `ch := make(chan int)` (unbuffered), `bufCh := make(chan int, 10)` (buffered with capacity 10).
-   **Sending and Receiving**:

    -   `ch <- value` // Send `value` to channel `ch`.
    -   `result := <-ch` // Receive from `ch` and assign to `result`.
    -   Sending blocks until a receiver is ready (for unbuffered channels) or until there's space in the buffer (for buffered channels).
    -   Receiving blocks until a sender sends a value or the channel is closed.

-   **Buffered vs. Unbuffered Channels**:

    -   **Unbuffered**: Require sender and receiver to be ready at the same time (synchronous communication). `make(chan T)`
    -   **Buffered**: Have a capacity. Senders block only when the buffer is full. Receivers block only when the buffer is empty. `make(chan T, capacity)`

-   **Closing Channels**:

    -   `close(ch)`: Indicates that no more values will be sent on `ch`.
    -   It's the sender's responsibility to close a channel, not the receiver's. Sending on a closed channel will cause a panic.
    -   Receivers can check if a channel is closed using a second boolean return value: `val, ok := <-ch`. If `ok` is `false`, the channel is closed and `val` is the zero value for the channel's type.

-   **`for...range` over Channels**: This loop receives values from a channel until it is closed.
    ```go
    func processChannel(ch <-chan int) {
        for val := range ch { // Loop continues until ch is closed
            fmt.Println("Received:", val)
        }
    }
    ```

## `select` Statement

The `select` statement lets a goroutine wait on multiple channel operations. It blocks until one of its cases can run, then it executes that case. If multiple are ready, it chooses one at random.

```go
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)

    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "one"
    }()
    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "two"
    }()

    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Println("received", msg1)
        case msg2 := <-ch2:
            fmt.Println("received", msg2)
        case <-time.After(3 * time.Second): // Timeout case
            fmt.Println("timeout waiting for messages")
            return
        // default: // A default case runs if no other case is ready (non-blocking select)
            // fmt.Println("no activity")
            // time.Sleep(50 * time.Millisecond)
        }
    }
}
```

-   **Timeouts**: A common use of `select` is to implement timeouts using `time.After(duration)`.
-   **Non-blocking Operations**: A `default` case in a `select` makes the operation non-blocking.

## Common Concurrency Patterns

### Worker Pools

A fixed number of goroutines (workers) process tasks from a shared channel.

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("worker %d started job %d\n", id, j)
        time.Sleep(time.Second) // Simulate work
        fmt.Printf("worker %d finished job %d\n", id, j)
        results <- j * 2
    }
}

func main() {
    numJobs := 5
    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)

    numWorkers := 3
    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs, results)
    }

    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs) // Close jobs channel to signal workers no more work

    for a := 1; a <= numJobs; a++ {
        <-results // Wait for all results
    }
    fmt.Println("All jobs done.")
}
```

### Fan-out, Fan-in

Distribute work among multiple goroutines (fan-out) and then collect their results (fan-in).

```go
func producer(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func squareWorker(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

// FanIn merges multiple channels into one
func fanIn(channels ...<-chan int) <-chan int {
    var wg sync.WaitGroup
    out := make(chan int)

    output := func(c <-chan int) {
        for n := range c {
            out <- n
        }
        wg.Done()
    }

    wg.Add(len(channels))
    for _, c := range channels {
        go output(c)
    }

    go func() {
        wg.Wait()
        close(out)
    }()
    return out
}

// Example Usage:
// inputChannel := producer(1, 2, 3, 4, 5)
// c1 := squareWorker(inputChannel) // Can create multiple squareWorkers for fan-out
// c2 := squareWorker(inputChannel)
// for res := range fanIn(c1, c2) { fmt.Println(res) }
```

### Rate Limiting

Control the frequency of operations, e.g., API calls.

```go
func main() {
    requests := make(chan int, 5)
    for i := 1; i <= 5; i++ {
        requests <- i
    }
    close(requests)

    limiter := time.NewTicker(200 * time.Millisecond) // Allow 1 request every 200ms

    for req := range requests {
        <-limiter.C // Block until ticker fires
        fmt.Println("processing request", req, time.Now())
    }
    limiter.Stop()
}
```

### Mutexes (`sync.Mutex`, `sync.RWMutex`) for Shared Memory

Use mutexes to protect access to shared data structures that are modified by multiple goroutines.

-   `sync.Mutex`: A mutual exclusion lock. Only one goroutine can hold the lock at a time.
    ```go
    var counter struct {
        sync.Mutex
        val int
    }
    counter.Lock()
    counter.val++
    counter.Unlock()
    ```
-   `sync.RWMutex`: A reader/writer mutual exclusion lock. Allows multiple readers to hold the lock simultaneously or a single writer. Prefer this when there are many reads and few writes.

    ```go
    var config struct {
        sync.RWMutex
        data map[string]string
    }
    // Reading:
    // config.RLock()
    // value := config.data["key"]
    // config.RUnlock()

    // Writing:
    // config.Lock()
    // config.data["key"] = "new_value"
    // config.Unlock()
    ```

### WaitGroups (`sync.WaitGroup`) for Synchronizing Goroutines

Use `sync.WaitGroup` to wait for a collection of goroutines to finish.

-   `Add(delta int)`: Increment the counter.
-   `Done()`: Decrement the counter (usually called in a `defer` statement in the goroutine).
-   `Wait()`: Block until the counter becomes zero.

```go
var wg sync.WaitGroup
for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        fmt.Printf("Goroutine %d working...\n", id)
        time.Sleep(time.Duration(id) * time.Second)
        fmt.Printf("Goroutine %d done.\n", id)
    }(i)
}
wg.Wait() // Wait for all 5 goroutines to complete
fmt.Println("All goroutines finished.")
```

### Context for Cancellation and Deadlines

The `context` package provides a way to signal cancellation, timeouts, and deadlines across API boundaries and between goroutines.

```go
func operation(ctx context.Context) {
    select {
    case <-time.After(2 * time.Second):
        fmt.Println("Operation completed")
    case <-ctx.Done(): // Context was cancelled or timed out
        fmt.Println("Operation cancelled:", ctx.Err())
    }
}

func main() {
    // Example with timeout
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel() // Important to call cancel to release resources
    operation(ctx) // Will print "Operation cancelled: context deadline exceeded"

    // Example with manual cancellation
    ctx2, cancel2 := context.WithCancel(context.Background())
    go operation(ctx2)
    time.Sleep(500 * time.Millisecond)
    cancel2() // Manually cancel the operation
    time.Sleep(500 * time.Millisecond) // Give time for cancellation message
}
```

## Best Practices

-   **Avoid Deadlocks**: Ensure goroutines don't wait for each other in a circular manner. Be careful with channel send/receive order and mutex locking order.
-   **Manage Goroutine Lifecycles**: Ensure every goroutine you start eventually exits. Uncontrolled goroutine spawning can lead to leaks. Use `sync.WaitGroup` or channels to manage lifecycles.
-   **Data Races and Prevention**:
    -   A data race occurs when two or more goroutines access the same memory location concurrently, and at least one of the accesses is a write.
    -   Prevent data races by ensuring that concurrent access to shared memory is synchronized using channels or mutexes.
    -   Use the Go race detector: `go test -race ./...` or `go run -race main.go`.
-   **Keep Critical Sections Small**: When using mutexes, minimize the amount of code executed while the lock is held.
-   **Prefer Channels for Communication**: "Do not communicate by sharing memory; instead, share memory by communicating." While mutexes are necessary sometimes, channels often lead to clearer concurrent code.
-   **Close Channels Appropriately**: Only the sender should close a channel. Closing a nil or already closed channel will panic. Communicate to receivers that a channel is closed.

By mastering these concurrency primitives and patterns, you can build highly performant and responsive applications in {projectPath}.

```

```
