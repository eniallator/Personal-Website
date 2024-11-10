import { Octokit } from "@octokit/core";
import { readFileSync } from "fs";

import { GITHUB_PAGE_SIZE, HOUR_IN_MS } from "./constants.js";
import { isArrayOf, isObjectOf, isString } from "./guard.js";
import { Project } from "./types.js";

const octokit = new Octokit();
const sortProjectsInterval = HOUR_IN_MS;
let lastSortTime = Date.now() - sortProjectsInterval;

export function initProjects() {
  return JSON.parse(
    readFileSync("public/projects.json").toString()
  ) as Project[];
}

const responseGuard = isObjectOf({
  data: isArrayOf(
    isObjectOf({
      name: isString,
    })
  ),
});

async function getRepoOrder(
  page: number = 1,
  acc: string[] = []
): Promise<string[]> {
  const res: unknown = await octokit.request("GET /users/eniallator/repos", {
    username: "eniallator",
    per_page: GITHUB_PAGE_SIZE,
    page,
    sort: "pushed",
    direction: "desc",
  });

  if (responseGuard(res)) {
    const repos = acc.concat(res.data.map(({ name }) => name.toLowerCase()));
    return res.data.length === GITHUB_PAGE_SIZE
      ? getRepoOrder(page + 1, repos)
      : repos;
  }
  return acc;
}

export async function trySortProjects(projects: Project[]): Promise<Project[]> {
  const currTime = Date.now();
  if (lastSortTime + sortProjectsInterval > currTime) return projects;
  lastSortTime = currTime;

  const repos = await getRepoOrder();

  return projects.toSorted(
    (p1, p2) =>
      repos.indexOf(p1.github.toLowerCase()) -
      repos.indexOf(p2.github.toLowerCase())
  );
}
