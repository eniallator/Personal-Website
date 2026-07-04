import { Octokit } from "@octokit/core";
import { attemptAsync, collectPaginated, throttledAsync } from "niall-utils";

import { GITHUB_PAGE_SIZE, HOUR_IN_MS, INITIAL_PROJECTS } from "./constants.js";

import type { Project } from "./types.js";

const octokit = new Octokit();

export const trySortProjects = throttledAsync(
  async (projects: Project[]): Promise<Project[]> =>
    await collectPaginated(
      GITHUB_PAGE_SIZE,
      async (page, per_page) =>
        await attemptAsync(
          async () =>
            await octokit
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
          () => [],
        ),
    ).then((order) =>
      projects.toSorted(
        (a, b) =>
          order.indexOf(a.github.toLowerCase()) -
          order.indexOf(b.github.toLowerCase()),
      ),
    ),
  HOUR_IN_MS,
  INITIAL_PROJECTS,
);
