import { readdirSync, statSync } from "node:fs";
import { buildSync, type BuildOptions } from "esbuild";
import { mapFilter, Option } from "niall-utils/functional";

import { browserslist } from "../package.json" with { type: "json" };

type Job = BuildOptions & { entry: string };

const env = process.env.NODE_ENV ?? "development";
const fileDenySet = new Set(["client/ts/helpers.ts"]);

const target = browserslist.map(browser => browser.replace(/\s+/, ""));
const sourcemap = env === "development";

const jobs: Job[] = [
  ...mapFilter(
    readdirSync("client/ts", { encoding: "utf8", recursive: true }),
    name =>
      Option.some(`client/ts/${name}`)
        .filter(entry => !fileDenySet.has(entry) && statSync(entry).isFile())
        .map(entry => ({
          entry,
          outfile: `public/static/js/${name.slice(0, -2)}bundle.js`,

          target,
          sourcemap,
          bundle: true,
          minify: true,
        }))
  ),
  { entry: "server/**/*.ts", outdir: "dist", platform: "node" },
];

jobs.forEach(({ entry, ...rest }) => {
  buildSync({ entryPoints: [entry], ...rest });
  console.debug(`Built ${entry} in ${env}`);
});
