import { Octokit } from "@octokit/core";
import { readFileSync } from "fs";

import { HOUR_IN_MS } from "./constants.js";
import { Project } from "./types.js";

const octokit = new Octokit();
const sortProjectsInterval = HOUR_IN_MS;
let lastSortTime = Date.now() - sortProjectsInterval;

export function initProjects() {
  return JSON.parse(
    readFileSync("public/projects.json").toString()
  ) as Project[];
}

export async function trySortProjects(projects: Project[]): Promise<Project[]> {
  const currTime = Date.now();
  if (lastSortTime + sortProjectsInterval > currTime) return projects;
  lastSortTime = currTime;

  const repos: string[] = [];
  let page = 1;
  const perPage = 100;
  let resp;
  do {
    resp = (await octokit.request("GET /users/eniallator/repos", {
      username: "eniallator",
      per_page: perPage,
      page: page++,
      sort: "pushed",
      direction: "desc",
    })) as { data: { name: string }[] | undefined };

    if (resp.data) {
      repos.push(...resp.data.map(({ name }) => name.toLowerCase()));
    }
  } while (resp.data && resp.data.length === perPage);

  return projects.toSorted(
    (p1, p2) =>
      repos.indexOf(p1.github.toLowerCase()) -
      repos.indexOf(p2.github.toLowerCase())
  );
}
