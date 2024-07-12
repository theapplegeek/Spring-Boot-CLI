import {Command} from "commander";
import inquirer from "inquirer";
import {isValidMavenArtifactId, isValidMavenGroupId, isValidProjectName} from "../utils/validator.utils.mjs";
import chalk from "chalk";
import path from "node:path";
import {createFolder, readFile, writeFile} from "../utils/file-manager.utils.mjs";
import {cloneStarterPack} from "../utils/git.utils.mjs";
import ora, {Ora} from "ora";
import {parseObjectToXmlString, parseStringToXml} from "../utils/xml.utils.mjs";
import {Pom} from "../models/pom.model.mjs";

const createCommand: Command = new Command("create")
    .command("create")
    .description("Create a new spring boot project with starter pack")
    .argument("<name>", "Name of the project")
    .action(async (name: string): Promise<void> => {
        // =========================================
        // Validate parameters
        // =========================================
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

        // =========================================
        // Loading spinner
        // =========================================
        const spinner: Ora = ora(`Creating project folder...\n`).start(); // Start the spinner

        // =========================================
        // Create project folder
        // =========================================
        spinner.start(`Creating project folder...`);
        const projectPath: string = path.join(process.cwd(), name);
        createFolder(projectPath);
        spinner.info(`Project folder created at ${projectPath}`);

        // =========================================
        // Clone starter pack from git
        // =========================================
        spinner.start(`Cloning starter pack...`);
        await cloneStarterPack(projectPath);
        spinner.info(`Starter pack cloned at ${projectPath}`);

        // =========================================
        // Edit pom.xml
        // =========================================
        spinner.start(`Generating project...`);
        const pomPath = path.join(projectPath, "pom.xml");
        const pom: string = readFile(pomPath);
        let pomXml: Pom = await parseStringToXml(pom);
        pomXml = editPom(pomXml, groupId, artifactId, name);
        const pomString: string = await parseObjectToXmlString(pomXml);
        writeFile(pomPath, pomString);

        spinner.succeed(chalk.green(`Project created at ${projectPath}`));
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

const editPom = (pom: Pom, groupId: string, artifactId: string, name: string): Pom => {
    pom.project.groupId[0] = groupId;
    pom.project.artifactId[0] = artifactId;
    pom.project.name[0] = name;
    pom.project.description[0] = 'Insert project description here';
    delete pom.project.licenses[0];
    delete pom.project.developers[0];
    return pom;
}

export {
    createCommand
}