import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { browserslistToTargets, transform } from "lightningcss";
import { raise } from "niall-utils/core";
import { memoize } from "niall-utils/data";
import { mapFilter, Option } from "niall-utils/functional";

import { browserslist } from "../package.json" with { type: "json" };

const env = process.env.NODE_ENV ?? "development";
const isDevelopment = env === "development";
const targets = browserslistToTargets(browserslist);

const replaceBlockRegex =
  /\/\*\s*var-replace-start\s*\*\/.*?\/\*\s*var-replace-end\s*\*\//is;
const replaceItemRegex =
  /(?<match>--[^\s:]+)\s*:\s*(?<replace>[^\s;][^;]*?)\s*;/g;
const commentsRegex = /\/\*.*?\*\//g;

const findLookups = (block: string) => {
  const lookups = new Map(
    mapFilter([...block.matchAll(replaceItemRegex)], ({ groups }) =>
      groups?.match != null && groups.replace != null
        ? ([groups.match, groups.replace] as const)
        : null
    )
  );
  const names = [...lookups.keys()].join("|");
  return {
    regex: new RegExp(String.raw`var\(\s*(${names})\s*\)`, "g"),
    lookups,
  };
};

const preprocessReplacements = (contents: string): string =>
  Option.from(replaceBlockRegex.exec(contents)).fold(
    () => contents,
    ({ 0: block, index }) => {
      const { regex, lookups } = findLookups(
        block.replaceAll(commentsRegex, "")
      );

      const resolve = memoize((name: string): string =>
        (
          lookups.get(name) ??
          raise(new Error(`Unknown css variable "${name}"`))
        ).replaceAll(regex, (_match, nested: string) => resolve(nested))
      );
      lookups.forEach((_value, name) => resolve(name));

      return preprocessReplacements(
        (
          contents.slice(0, index) + contents.slice(index + block.length)
        ).replaceAll(regex, (_match, name: string) => resolve(name))
      );
    }
  );

[
  {
    file: "client/css/styles.css",
    outFile: "public/static/css/styles.min.css",
  },
  ...readdirSync("client/css/themes").map(name => ({
    file: `client/css/themes/${name}`,
    outFile: `public/static/css/themes/${basename(name, ".css")}.min.css`,
  })),
].forEach(({ file, outFile }) => {
  mkdirSync(dirname(outFile), { recursive: true });
  const { code } = transform({
    code: Buffer.from(preprocessReplacements(readFileSync(file, "utf8"))),
    minify: true,
    sourceMap: isDevelopment,
    filename: file,
    targets,
  });
  writeFileSync(outFile, code);
  console.debug(`Built ${outFile} in ${env}`);
});
