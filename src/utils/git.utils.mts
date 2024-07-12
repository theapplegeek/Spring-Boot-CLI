import {SimpleGit, simpleGit} from "simple-git";
import config from "../config.mjs";
import chalk from "chalk";

const cloneStarterPack = async (projectPath: string) => {
    const git: SimpleGit = simpleGit();
    return git.clone(config.starterPackGitUrl, projectPath)
        .catch(error => {
            console.error(chalk.red(`Error cloning starter pack: ${error.message}`));
            process.exit(1);
        });
}

export {
    cloneStarterPack
}