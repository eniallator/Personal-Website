import { Octokit } from "@octokit/core";
import { isArrayOf, isObjectOf, isString } from "deep-guards";

import { GITHUB_PAGE_SIZE, HOUR_IN_MS } from "./constants.js";
import { Project } from "./types.js";

const octokit = new Octokit();
const sortProjectsInterval = HOUR_IN_MS;
let lastSortTime = Date.now() - sortProjectsInterval;

const responseGuard = isObjectOf({
  data: isArrayOf(isObjectOf({ name: isString })),
});

async function getRepoOrder(page: number = 1): Promise<string[]> {
  const res: unknown = await octokit.request("GET /users/eniallator/repos", {
    per_page: GITHUB_PAGE_SIZE,
    page,
    sort: "pushed",
    direction: "desc",
  });

  const repos = responseGuard(res)
    ? res.data.map(({ name }) => name.toLowerCase())
    : [];

  return repos.length === GITHUB_PAGE_SIZE
    ? repos.concat(await getRepoOrder(page + 1))
    : repos;
}

export async function trySortProjects(projects: Project[]): Promise<Project[]> {
  const currTime = Date.now();
  if (lastSortTime + sortProjectsInterval > currTime) return projects;
  lastSortTime = currTime;

  const repoOrder = await getRepoOrder();

  return projects.toSorted(
    (p1, p2) =>
      repoOrder.indexOf(p1.github.toLowerCase()) -
      repoOrder.indexOf(p2.github.toLowerCase())
  );
}
