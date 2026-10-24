// Generates a per-package API reference from the installed type declarations,
// so Claude can read the exact surface of the libraries this project uses.
//
// Packages come from the `claudeLibDocs` allowlist in package.json. Output goes
// to `.claude/lib-docs/<package>.md` (gitignored, regenerated on `bun install`).
//
// Never fails the install: problems are reported as warnings.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import {
  guardOrThrow,
  isAnyRecord,
  isInstance,
  isObjectOf,
  isOptional,
  isRecordOf,
  isString,
  isUnionOf,
  type TypeFromGuard,
} from "deep-guards";
import { mapFilter } from "niall-utils/functional";

import { claudeLibDocs } from "../package.json" with { type: "json" };

const root = resolve(import.meta.dirname, "..");
const outDir = join(root, ".claude", "lib-docs");

const isPackage = isObjectOf({
  version: isString,
  exports: isRecordOf(isString, isUnionOf(isString, isAnyRecord)),
  types: isOptional(isString),
  typings: isOptional(isString),
});
type Package = TypeFromGuard<typeof isPackage>;

// `isObjectOf` needs every key present, so default the missing ones first.
const readPackage = (path: string) =>
  guardOrThrow(
    {
      exports: {},
      types: undefined,
      typings: undefined,
      ...(JSON.parse(readFileSync(path, "utf8")) as object),
    },
    isPackage
  );
const posix = (path: string) => path.replaceAll("\\", "/");
const isError = isInstance(Error);
const errorMessage = (error: unknown) =>
  isError(error) ? error.message : String(error);

/** Declaration file for an import specifier, e.g. "./x.js" -> "<dir>/x.d.ts" */
const resolveDeclaration = (fromDir: string, specifier: string) => {
  const base = resolve(fromDir, specifier.replace(/\.(?:[cm]?[jt]s)$/, ""));
  return [`${base}.d.ts`, join(base, "index.d.ts")].find(existsSync) ?? null;
};

/** Every `types` target in package.json, keyed by public import path. */
const typeEntries = (name: string, pkg: Package): [string, string][] => {
  const fromExports = mapFilter(
    Object.entries(pkg.exports),
    ([subpath, target]): [string, string] | null =>
      isString(target) || !isString(target.types)
        ? null
        : [subpath === "." ? name : `${name}/${subpath.slice(2)}`, target.types]
  );
  const rootTypes = pkg.types ?? pkg.typings;
  return fromExports.length > 0 || rootTypes == null
    ? fromExports
    : [[name, rootTypes]];
};

const relativeSpecifiers = (source: string) =>
  mapFilter(
    [...source.matchAll(/\bfrom\s+["'](\.[^"']*)["']/g)],
    match => match[1]
  );

/** Depth-first crawl, so files appear next to the barrel that exports them. */
const crawl = (entryFiles: string[]) => {
  const seen = new Set<string>();
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const dir = dirname(file);
    for (const specifier of relativeSpecifiers(readFileSync(file, "utf8"))) {
      const next = resolveDeclaration(dir, specifier);
      if (next != null) visit(next);
    }
  };
  entryFiles.forEach(visit);
  return [...seen];
};

const tidy = (source: string) =>
  source
    .replace(/^\/\/# sourceMappingURL=.*$/gm, "")
    .replace(/^export \{\};?$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const render = (name: string) => {
  const pkgDir = join(root, "node_modules", name);
  const pkg = readPackage(join(pkgDir, "package.json"));
  const entries = typeEntries(name, pkg);
  const entryFiles = entries.map(([, types]) => resolve(pkgDir, types));
  const missing = entryFiles.filter(file => !existsSync(file));
  if (entries.length === 0 || missing.length > 0) {
    throw new Error("no usable type declarations");
  }

  const readme = ["README.md", "readme.md"].find(file =>
    existsSync(join(pkgDir, file))
  );
  const files = crawl(entryFiles).map(file => {
    const path = posix(relative(pkgDir, file));
    return `## ${path}\n\n\`\`\`ts\n${tidy(readFileSync(file, "utf8"))}\n\`\`\``;
  });

  return [
    `# ${name}@${pkg.version}`,
    "",
    "Generated from the installed type declarations by `scripts/lib-docs.ts`. Do not edit.",
    "",
    `Import paths: ${entries.map(([path]) => `\`${path}\``).join(", ")}`,
    readme != null ? `\nUsage prose: \`node_modules/${name}/${readme}\`` : "",
    "",
    ...files.flatMap(file => [file, ""]),
  ].join("\n");
};

const main = () => {
  if (
    process.env.npm_lifecycle_event === "postinstall" &&
    process.env.NODE_ENV === "production"
  ) {
    return;
  }

  rmSync(outDir, { recursive: true, force: true });
  if (claudeLibDocs.length === 0) return;

  mkdirSync(outDir, { recursive: true });
  for (const name of claudeLibDocs) {
    try {
      writeFileSync(
        join(outDir, `${name.replaceAll("/", "__")}.md`),
        render(name)
      );
    } catch (error) {
      console.warn(`lib-docs: skipped ${name}: ${errorMessage(error)}`);
    }
  }
};

try {
  main();
} catch (error) {
  console.warn(`lib-docs: failed: ${errorMessage(error)}`);
}
