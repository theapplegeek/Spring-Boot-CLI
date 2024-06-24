import {Command} from "commander";
import inquirer from "inquirer";
import {isValidMavenArtifactId, isValidMavenGroupId, isValidProjectName} from "../utils/validator.utils.mjs";
import chalk from "chalk";
import path from "node:path";
import {createFolder} from "../utils/file-manager.utils.mjs";
import ora, {Ora} from "ora";

const createCommand: Command = new Command("create")
    .command("create")
    .description("Create a new spring boot project with starter pack")
    .argument("<name>", "Name of the project")
    .action(async (name: string): Promise<void> => {
        if (!validateName(name)) {
            console.error(chalk.red("Please enter a valid project name"));
            process.exit(1);
        }
        const groupId: string = await getGroupId();
        const artifactId: string = await getArtifactId();
        const packageName: string = `${groupId.replaceAll("-", "_")}.${artifactId.replaceAll("-", "_")}`;
        console.log(`Project Name: ${name}`);
        console.log(`Group Id: ${groupId}`);
        console.log(`Artifact Id: ${artifactId}`);
        console.log(`Package Name: ${packageName}`);

        const spinner: Ora = ora(`Creating project folder...\n`).start(); // Start the spinner
        const projectPath: string = path.join(process.cwd(), name);
        createFolder(projectPath);
        spinner.info(`Project folder created at ${projectPath}`);
        spinner.start(`Cloning starter pack...`)
        setTimeout(() => {
            spinner.succeed(chalk.green(`Project created at ${projectPath}`));
        }, 10000);
    });

const validateName = (input: string): boolean => {
    if (input === "") return false;
    else if (!isValidProjectName(input)) return false;
    return true;
}

const getGroupId = async (): Promise<string> => {
    return inquirer.prompt({
        type: "input",
        name: "groupId",
        message: "Enter the group ID: ",
        validate: (input: string): boolean | string => {
            if (input === "") {
                return "Please enter a group ID";
            } else if (!isValidMavenGroupId(input)) {
                return "Please enter a valid group ID";
            }
            return true;
        }
    }).then((answers: { groupId: string }) => {
        return answers.groupId as string
    });
};

const getArtifactId = async (): Promise<string> => {
    return inquirer.prompt({
        type: "input",
        name: "artifactId",
        message: "Enter the artifact ID: ",
        validate: (input: string): boolean | string => {
            if (input === "") {
                return "Please enter an artifact ID";
            } else if (!isValidMavenArtifactId(input)) {
                return "Please enter a valid artifact ID";
            }
            return true;
        }
    }).then((answers: { artifactId: string }) => {
        return answers.artifactId as string
    });
}

export {
    createCommand
}