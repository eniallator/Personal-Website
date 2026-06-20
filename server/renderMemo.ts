import ejs from "ejs";

export class RenderMemo<C extends NonNullable<unknown>> {
  private memo: Record<string | number, string> = {};
  private readonly contextKey: (name: string, ctx: C) => string | number;

  constructor(contextKey: (name: string, ctx: C) => string | number) {
    this.contextKey = contextKey;
  }

  clear() {
    this.memo = {};
  }

  async render(name: string, ctx: C, force: boolean = false): Promise<string> {
    const key = this.contextKey(name, ctx);
    if (!force && this.memo[key] != null) {
      return this.memo[key];
    }

    console.log(`Rendering to memo "${key}"`);

    return (this.memo[key] = await ejs.renderFile(name, ctx, {
      rmWhitespace: true,
    }));
  }
}
