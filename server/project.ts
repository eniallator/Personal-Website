import { Octokit } from "@octokit/core";
import { asyncThrottled } from "niall-utils";

import { GITHUB_PAGE_SIZE, HOUR_IN_MS, initialProjects } from "./constants.js";
import { getAllPages } from "./getAllPages.js";

import type { Project } from "./types.js";

const octokit = new Octokit();

export const trySortProjects = asyncThrottled(
  async (projects: Project[]): Promise<Project[]> => {
    const order: string[] = await getAllPages((page, per_page) =>
      octokit
        .request("GET /users/{username}/repos", {
          username: "eniallator",
          type: "all",
          sort: "pushed",
          direction: "desc",
          per_page,
          page,
        })
        .then(({ data }) => data.map(({ name }) => name.toLowerCase()))
        .catch(() => []),
    )(GITHUB_PAGE_SIZE);

    return projects.toSorted(
      (a, b) =>
        order.indexOf(a.github.toLowerCase()) -
        order.indexOf(b.github.toLowerCase()),
    );
  },
  HOUR_IN_MS,
  initialProjects,
);
