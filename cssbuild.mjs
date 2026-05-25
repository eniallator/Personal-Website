import { browserslistToTargets, transform } from "lightningcss";
import fs from "node:fs";

const isDevelopment =
  process.env.NODE_ENV == null || process.env.NODE_ENV === "development";

const replaceBlockRegex =
  /\/\*\s*var-replace-start\s*\*\/.*?\/\*\s*var-replace-end\s*\*\//gis;
const replaceItemRegex = /(?<match>--[^:]+)\s*:\s*(?<replace>[^;]+)/g;

const selfProcessLookups = (regex, lookups) => {
  let matched = true;
  while (matched) {
    matched = false;
    for (const key in lookups) {
      matched = matched || regex.test(lookups[key]);
      lookups[key] = lookups[key].replaceAll(regex, (match) => lookups[match]);
    }
  }

  return [regex, lookups];
};

const findLookups = (block) => {
  const lookups = {};
  let regex = "";
  let match;
  while ((match = replaceItemRegex.exec(block))) {
    lookups[`var(${match.groups.match})`] = match.groups.replace;
    regex +=
      (regex.length > 0 ? "|" : "") + String.raw`var\(${match.groups.match}\)`;
  }
  return selfProcessLookups(new RegExp(regex, "g"), lookups);
};

const preprocessReplacements = (contents) => {
  let match;
  while ((match = replaceBlockRegex.exec(contents))) {
    const [regex, lookups] = findLookups(match[0]);
    contents = (
      contents.slice(0, match.index) +
      contents.slice(match.index + match[0].length)
    ).replaceAll(regex, (match) => lookups[match]);
    replaceBlockRegex.lastIndex = 0;
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
    sourceMap: false,
    targets: browserslistToTargets(["chrome 100"]),
  });
  fs.writeFileSync(outFile, code);
  console.debug(`Built ${outFile}`);
});
