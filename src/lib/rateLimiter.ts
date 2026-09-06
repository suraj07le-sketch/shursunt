
/**
 * Simple client-side rate limiter queue.
 * Ensures we don't hammer the API with concurrent requests.
 */
class RateLimiter {
    private queue: Array<() => Promise<any>> = [];
    private processing = false;
    private delayMs: number;

    constructor(delayMs = 800) {
        this.delayMs = delayMs;
    }

    /**
     * Add a request to the queue.
     * @param info - string to identify the request type (e.g. "quote", "history")
     * @param fn - Async function to execute
     */
    add<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await fn();
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
            this.process();
        });
    }

    private async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                try {
                    const result = await task();
                    
                    // Specific check for fetch Response objects which don't "throw" on 429
                    if (result instanceof Response && result.status === 429) {
                        console.warn(`[RateLimiter] 429 Response detected. Sleeping for 60s...`);
                        await new Promise(res => setTimeout(res, 60000));
                    } else {
                        // Normal delay after success
                        await new Promise(res => setTimeout(res, this.delayMs));
                    }
                } catch (err: any) {
                    // Handle thrown errors (network errors, or intentional throws from fetch wrappers)
                    const is429 = err?.status === 429 || err?.message?.includes('429');
                    if (is429) {
                        console.warn(`[RateLimiter] 429 Error caught. Sleeping for 60s...`);
                        await new Promise(res => setTimeout(res, 60000));
                    } else {
                        // Regular delay on other failures
                        await new Promise(res => setTimeout(res, this.delayMs));
                    }
                }
            }
        }

        this.processing = false;
    }
}

// Singleton instance tailored for the Indian Stock API which is extremely sensitive
export const indianApiLimiter = new RateLimiter(4000); // Increased to 4s delay + 60s backoff for 429s
