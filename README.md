# Personal Website

The source code for my personal website, live at [cdrn.cc](https://cdrn.cc/). It showcases my projects, CV and past companies, and has a contact form that emails me.

## How it works

**Server-rendered, minimal client.** A small [Bun](https://bun.sh/) + [Hono](https://hono.dev/) server renders an EJS template per request and the browser gets plain HTML, CSS and a little vanilla TypeScript. There's no frontend framework because the page is mostly static content, and the server stays simple.

**Content is data.** Projects and companies live in JSON files under `public/` and are validated against type guards when the server starts. Adding content is a data change, and a malformed entry fails at startup instead of at render time. Types are derived from the guards, so the runtime check and the compile-time type can't drift apart.

**Project order reflects activity.** Projects are sorted by how recently I pushed to each GitHub repo. The GitHub lookup is throttled and runs in the background, so a page request never waits on it. If the order changes, the render cache is cleared.

**Rendering is cached.** The output only depends on the theme, the seasonal theme and the template, so rendered pages are memoised on those and reused.

**Theming.** There's a dark/light theme stored in a cookie, plus seasonal themes (Halloween, Christmas) that switch on automatically in the days around their date. Each seasonal theme is a stylesheet and an optional script, and query parameters can override both the theme and the seasonal theme for testing.

**Contact form.** Submissions are validated strictly. Hidden honeypot fields must stay empty, so bots fail validation and are logged instead of emailed. Valid messages are sent over SMTP, and an in-memory per-IP rate limiter protects the endpoint.

**Build pipeline.** esbuild bundles the client TypeScript and compiles the server. Lightning CSS minifies the stylesheets, and a small preprocessor resolves build-time CSS variables so they don't ship as runtime custom properties. Both target the browsers listed in `browserslist`.

**CSS constants are inlined at build time.** Custom properties are useful for values that change at runtime, like the dark/light theme colours, but wasteful for constants that never change, like the palette or the nav height. A block of declarations wrapped in `/* VAR-REPLACE-START */` and `/* VAR-REPLACE-END */` comments (the markers are case-insensitive) is treated as a set of build-time constants rather than real custom properties. Before Lightning CSS sees the file, [scripts/cssbuild.ts](scripts/cssbuild.ts):

1. Reads the `--name: value;` declarations out of the block, then deletes the block from the output.
2. Resolves constants that reference other constants (memoised), so a constant can be built from earlier ones.
3. Replaces every `var(--name)` that refers to one of those constants with its resolved value, and fails the build if a name can't be resolved.
4. Repeats until the file has no more such blocks.

Anything outside the block, such as the theme colours switched by the `#dark-theme` checkbox, stays a normal runtime custom property. Those can still use the constants, because they're substituted before the CSS is parsed. The output has plain values instead of `var()` chains, which gives Lightning CSS fully static values to minify and to lower for the target browsers, and the shipped stylesheet doesn't carry constants that only the build needed.

**Deployment.** nginx sits in front of the Bun server. It terminates TLS (including HTTP/3), sets security headers, serves static assets directly from disk with long-lived caching, and proxies everything else. The config is in [nginx/nginx.conf](nginx/nginx.conf), and paths and hostname need adjusting for another server. 0-RTT early data is rejected on `POST`, since it's replayable.

## Getting started

Requires [Bun](https://bun.sh/) and the Node version in `engines`.

```sh
bun install
cp .env.example .env   # then fill in the values
bun run build
bun run start
```

[.env.example](.env.example) lists the required environment variables, and the server refuses to start if any are missing. The available scripts are in [package.json](package.json), including `findissues`, which runs the typecheck, lint and format checks together.

## Adding content

- **Project or company:** add an entry to [public/projects.json](public/projects.json) or [public/companies.json](public/companies.json). The existing entries show the expected shape.
- **Seasonal theme:** register its date in [server/constants.ts](server/constants.ts) and add a matching stylesheet (and optional script) named after it.

## License

[MIT](LICENSE)
