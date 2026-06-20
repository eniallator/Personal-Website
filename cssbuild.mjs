import { browserslistToTargets, transform } from "lightningcss";
import fs from "bun:fs";
import rawTargets from "./targets.json" with { type: "json" };

const env = process.env.NODE_ENV ?? "development";
const isDevelopment = env === "development";

const targets = rawTargets.map(
  ({ browser, version }) => `${browser} ${version}`,
);

const replaceBlockRegex =
  /\/\*\s*var-replace-start\s*\*\/.*?\/\*\s*var-replace-end\s*\*\//gis;
const replaceItemRegex = /(?<match>--[^\s:]+)\s*:\s*(?<replace>[^;]+)/g;
const varNameRegex = /var\(\s*([^\s)]+)\s*\)/;
const commentsRegex = /\/\*.*?\*\//g;

const findLookups = (block) => {
  const lookups = {};
  const regexes = [];
  let match;
  while ((match = replaceItemRegex.exec(block))) {
    lookups[match.groups.match] = match.groups.replace;
    regexes.push(String.raw`var\(\s*${match.groups.match}\s*\)`);
  }
  return [new RegExp(regexes.join("|"), "g"), lookups];
};

const selfProcessLookups = (regex, lookups) => {
  const cache = {};

  const resolve = (key) =>
    cache[key]
      ? cache[key]
      : (cache[key] = lookups[key].replaceAll(regex, (match) =>
          resolve(varNameRegex.exec(match)[1]),
        ));

  return Object.fromEntries(
    Object.keys(lookups).map((key) => [key, resolve(key)]),
  );
};

const preprocessReplacements = (contents) => {
  let match;
  while ((match = replaceBlockRegex.exec(contents))) {
    const strippedBlock = match[0].replaceAll(commentsRegex, "");
    const [regex, rawLookups] = findLookups(strippedBlock);
    const lookups = selfProcessLookups(regex, rawLookups);

    replaceBlockRegex.lastIndex = 0;

    contents = (
      contents.slice(0, match.index) +
      contents.slice(match.index + match[0].length)
    ).replaceAll(regex, (match) => lookups[varNameRegex.exec(match)[1]]);
  }
  return contents;
};

[
  {
    file: "client/css/styles.css",
    outFile: "public/static/css/styles.min.css",
  },
  ...fs.readdirSync("client/css/themes").map((name) => ({
    file: `client/css/themes/${name}`,
    outFile: `public/static/css/themes/${name.slice(0, -3)}min.css`,
  })),
].forEach(({ file, outFile }) => {
  const contents = fs.readFileSync(file);
  const { code } = transform({
    code: Buffer.from(preprocessReplacements(contents.toString())),
    minify: true,
    sourceMap: isDevelopment,
    filename: file,
    targets: browserslistToTargets(targets),
  });
  fs.writeFileSync(outFile, code);
  console.debug(`Built ${outFile} in ${env}`);
});
