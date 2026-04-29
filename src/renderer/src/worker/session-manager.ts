// Simple, global session manager to serialize background tasks
// and avoid overlapping task executions in the OpenCode Boulder flow.
export class SessionManager {
  private queue: Array<() => Promise<any>> = []
  private running = false

  async enqueue(taskFn: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const wrapper = async () => {
        try {
          const res = await taskFn()
          resolve(res)
        } catch (e) {
          reject(e)
        } finally {
          this.dequeue()
        }
      }
      this.queue.push(wrapper)
      this.maybeRunNext()
    })
  }

  private maybeRunNext() {
    if (this.running) return
    const next = this.queue.shift()
    if (!next) return
    this.running = true
    next()
  }

  private dequeue() {
    this.running = false
    this.maybeRunNext()
  }
}

// Expose a singleton for convenience
export const sessionManager = new SessionManager()
