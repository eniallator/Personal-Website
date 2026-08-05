import { Octokit } from "@octokit/core";
import { attemptAsync } from "niall-utils/core";
import { collectPaginated } from "niall-utils/data";
import { throttledAsync } from "niall-utils/timing";

import { GITHUB_PAGE_SIZE, HOUR_IN_MS } from "./constants.js";
import type { Project } from "./types.js";

const octokit = new Octokit();

export const trySortProjects = throttledAsync(
  async (projects: Project[]): Promise<Project[]> =>
    collectPaginated(GITHUB_PAGE_SIZE, async (page, per_page) =>
      attemptAsync(
        async () =>
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
        () => []
      )
    ).then(order =>
      projects.toSorted(
        (a, b) =>
          order.indexOf(a.github.toLowerCase()) -
          order.indexOf(b.github.toLowerCase())
      )
    ),
  HOUR_IN_MS
);
