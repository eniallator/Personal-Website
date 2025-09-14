import type { Express } from "express";

export class RenderMemo<C extends NonNullable<unknown>> {
  private memo: Record<string | number, string> = {};
  private readonly app: Express;
  private readonly contextKey: (ctx: C) => string | number;

  constructor(app: Express, contextKey: (ctx: C) => string | number) {
    this.app = app;
    this.contextKey = contextKey;
  }

  clear() {
    this.memo = {};
  }

  async render(name: string, ctx: C, force: boolean = false): Promise<string> {
    const key = this.contextKey(ctx);
    if (!force && this.memo[key] != null) {
      return this.memo[key];
    }

    console.log(`Rendering to memo "${key}"`);

    return new Promise((resolve, reject) => {
      this.app.render(name, ctx, (err: Error | null, html: string | null) => {
        if (html != null) resolve((this.memo[key] = html));
        else reject(err ?? new Error("Unknown rendering error"));
      });
    });
  }
}
