type Handler = (...args: unknown[]) => void;

class MockGzip {
  private handlers: Record<string, Handler[]> = {};

  on(event: string, handler: Handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
    return this;
  }

  end(data?: string | Buffer) {
    if (data && this.handlers.data) {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      this.handlers.data.forEach((handler) => handler(buffer));
    }
    if (this.handlers.end) {
      this.handlers.end.forEach((handler) => handler());
    }
  }
}

export const createGzip = () => new MockGzip();
