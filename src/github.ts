import { Octokit } from "@octokit/core";
import { readFileSync } from "fs";

import { HOUR_IN_MS } from "./constants.js";
import { Project } from "./types.js";

const projects = JSON.parse(
  readFileSync("public/projects.json").toString()
) as Project[];
const octokit = new Octokit();
const sortProjectsInterval = HOUR_IN_MS;
let lastSortTime = Date.now() - sortProjectsInterval;

export async function trySortProjects() {
  const currTime = Date.now();
  if (lastSortTime + sortProjectsInterval > currTime) return;
  lastSortTime = currTime;

  const repos: string[] = [];
  let page = 1;
  const perPage = 100;
  let resp;
  do {
    try {
      resp = (await octokit.request("GET /users/eniallator/repos", {
        username: "eniallator",
        per_page: perPage,
        page: page++,
        sort: "pushed",
        direction: "desc",
      })) as { data: { name: string }[] | undefined };
      if (resp.data) {
        repos.push(
          ...resp.data.map((repo: { name: string }) => repo.name.toLowerCase())
        );
      }
    } catch (err) {
      console.error(err);
    }
  } while (resp?.data && resp.data.length === perPage);

  projects.sort(
    (p1, p2) =>
      repos.indexOf(p1.github.toLowerCase()) -
      repos.indexOf(p2.github.toLowerCase())
  );
}

void trySortProjects();

export function getProjects(): Project[] {
  return projects;
}
