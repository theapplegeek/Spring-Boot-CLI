import chalk from "chalk";
import { type SimpleGit, simpleGit } from "simple-git";
import config from "../config.mjs";

const cloneStarterPack = async (projectPath: string) => {
  const git: SimpleGit = simpleGit();
  return git.clone(config.starterPackGitUrl, projectPath).catch((error) => {
    console.error(chalk.red(`\nError cloning starter pack: ${error.message}`));
    process.exit(1);
  });
};

const commitInitialProject = async (projectPath: string) => {
  const git: SimpleGit = simpleGit(projectPath);
  try {
    await git.init({ "--initial-branch": "main" });
    await git.add(".");
    await git.commit("Initial commit");
  } catch (error) {
    console.error(chalk.red("\nError when creating git repository"));
    process.exit(1);
  }
};

export { cloneStarterPack, commitInitialProject };
