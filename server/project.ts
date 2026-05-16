import { Octokit } from "@octokit/core";

import { GITHUB_PAGE_SIZE, HOUR_IN_MS, initialProjects } from "./constants.js";

import { asyncThrottled } from "./throttled.js";
import type { Project } from "./types.js";

const octokit = new Octokit();

export const trySortProjects = asyncThrottled(
  async (projects: Project[]): Promise<Project[] | null> => {
    const order: string[] = [];
    let page = 1;
    do {
      try {
        const { data } = await octokit.request("GET /users/{username}/repos", {
          username: "eniallator",
          type: "all",
          sort: "pushed",
          direction: "desc",
          per_page: GITHUB_PAGE_SIZE,
          page: page++,
        });
        order.push(...data.map(({ name }) => name.toLowerCase()));
      } catch (err) {
        console.error(err);
        return null;
      }
    } while (order.length === page * GITHUB_PAGE_SIZE);

    return projects.toSorted(
      (p1, p2) =>
        order.indexOf(p1.github.toLowerCase()) -
        order.indexOf(p2.github.toLowerCase()),
    );
  },
  HOUR_IN_MS,
  initialProjects,
);
