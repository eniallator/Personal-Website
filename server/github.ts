import { Octokit } from "@octokit/core";

import { GITHUB_PAGE_SIZE, HOUR_IN_MS } from "./constants.js";
import { Project } from "./types.js";

const octokit = new Octokit();
const sortProjectsInterval = HOUR_IN_MS;
let lastSortTime = Date.now() - sortProjectsInterval;

export async function trySortProjects(projects: Project[]) {
  const currTime = Date.now();
  if (lastSortTime + sortProjectsInterval > currTime) return null;
  lastSortTime = currTime;

  const order: string[] = [];
  let page = 1;
  do {
    try {
      const res = await octokit.request("GET /users/{username}/repos", {
        username: "eniallator",
        per_page: GITHUB_PAGE_SIZE,
        page: page++,
        sort: "pushed",
        direction: "desc",
      });
      order.push(...res.data.map(({ name }) => name.toLowerCase()));
    } catch (err) {
      console.error(err);
      return null;
    }
  } while (order.length === page * GITHUB_PAGE_SIZE);

  return projects.every((project, i) => project.github === order[i])
    ? null
    : projects.toSorted(
        (p1, p2) =>
          order.indexOf(p1.github.toLowerCase()) -
          order.indexOf(p2.github.toLowerCase())
      );
}
