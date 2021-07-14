import { GITHUB_KEY } from "config";
import { Octokit } from "@octokit/core";

export async function openDataPullRequest() {
  const octokit = new Octokit({ auth: GITHUB_KEY });

  const response = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner: "indexed-finance",
    repo: "indexed-interface",
    head: "main",
    base: "main",
  });

  console.log({ response });
}
