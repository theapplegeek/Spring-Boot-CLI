import {Command} from "commander";
import inquirer from "inquirer";
import {isValidMavenArtifactId, isValidMavenGroupId, isValidProjectName} from "../utils/validator.utils.mjs";
import chalk from "chalk";
import path from "node:path";
import crypto from "crypto";
import {
    copyFiles,
    createFolder,
    deleteFolder,
    getJavaFiles,
    readFile,
    renameFile,
    writeFile
} from "../utils/file-manager.utils.mjs";
import {cloneStarterPack, commitInitialProject} from "../utils/git.utils.mjs";
import ora, {Ora} from "ora";
import {parseObjectToXmlString, parseStringToXml} from "../utils/xml.utils.mjs";
import {Pom} from "../models/pom.model.mjs";
import {parseObjectToYamlString, parseStringToYaml} from "../utils/yaml.utils.mjs";

const createCommand: Command = new Command("create")
    .command("create")
    .alias("c")
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
        deleteFolder(path.join(projectPath, ".git"));
        spinner.info(`Starter pack cloned at ${projectPath}`);

        // =========================================
        // Edit pom.xml
        // =========================================
        spinner.start(`Generating project...`);
        const pomPath: string = path.join(projectPath, "pom.xml");
        const pom: string = readFile(pomPath);
        let pomXml: Pom = await parseStringToXml(pom);
        pomXml = editPom(pomXml, groupId, artifactId, name);
        const pomString: string = await parseObjectToXmlString(pomXml);
        writeFile(pomPath, pomString);

        // =========================================
        // Replace imports in java files with groupId
        // =========================================
        const javaFilePattern: string = path.posix.join(projectPath, "src", "main", "java", "**", "*.java");
        const javaTestFilePattern: string = path.posix.join(projectPath, "src", "test", "java", "**", "*.java");
        let javaFiles: string[] = getJavaFiles(javaFilePattern);
        let javaTestFiles: string[] = getJavaFiles(javaTestFilePattern);
        javaFiles.push(...javaTestFiles);
        javaFiles.forEach((file: string) => {
            let fileContent: string = readFile(file);
            fileContent = fileContent.replaceAll("it.theapplegeek.spring_starter_pack", `${groupId.replaceAll("-", "_")}.${artifactId.replaceAll("-", "_")}`);
            writeFile(file, fileContent);
        });

        // =========================================
        // Rename main application class
        // =========================================
        const mainApplicationPath: string = path.join(projectPath, "src", "main", "java", "it", "theapplegeek", "spring_starter_pack", "Application.java");
        let mainApplicationContent: string = readFile(mainApplicationPath);
        const artifactIdCamelCase: string = artifactId.split(/[.-]/).map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
        mainApplicationContent = mainApplicationContent.replaceAll("class Application", `class ${artifactIdCamelCase}Application`);
        mainApplicationContent = mainApplicationContent.replaceAll("Application.class", `${artifactIdCamelCase}Application.class`);
        writeFile(mainApplicationPath, mainApplicationContent);
        const mainApplicationNewPath: string = path.join(projectPath, "src", "main", "java", "it", "theapplegeek", "spring_starter_pack", `${artifactIdCamelCase}Application.java`);
        renameFile(mainApplicationPath, mainApplicationNewPath);

        // =========================================
        // Edit application.yml
        // =========================================
        const applicationYmlPath: string = path.join(projectPath, "src", "main", "resources", "application.yml");
        const applicationYmlFile: string = readFile(applicationYmlPath);
        let applicationYmlContent: any = parseStringToYaml(applicationYmlFile);
        applicationYmlContent.spring.application.name = artifactId.split(/[.-]/).map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        const secretKeyHex: string = crypto.randomBytes(32).toString('hex');
        applicationYmlContent.application.security.jwt['secret-key'] = Buffer.from(secretKeyHex).toString('base64');
        applicationYmlContent = parseObjectToYamlString(applicationYmlContent);
        writeFile(applicationYmlPath, applicationYmlContent);

        // =========================================
        // Replace package path with groupId and artifactId
        // =========================================
        const groupIdSplit: string[] = groupId.replaceAll("-", "_").split(".");
        const artifactIdSplit: string[] = artifactId.replaceAll("-", "_").split(".");
        const defaultFolderPath: string = path.join(projectPath, "src", "main", "java", "it", "theapplegeek", "spring_starter_pack");
        const newFolderPath: string = path.join(projectPath, "src", "main", "java", ...groupIdSplit, ...artifactIdSplit);
        createFolder(newFolderPath, false);
        copyFiles(defaultFolderPath, newFolderPath);
        const defaultTestFolderPath: string = path.join(projectPath, "src", "test", "java", "it", "theapplegeek", "spring_starter_pack");
        const newTestFolderPath: string = path.join(projectPath, "src", "test", "java", ...groupIdSplit, ...artifactIdSplit);
        createFolder(newTestFolderPath, false);
        copyFiles(defaultTestFolderPath, newTestFolderPath);
        deleteDefaultFolder(groupId, artifactId, projectPath);
        spinner.info(`Project created at ${projectPath}`);

        // =========================================
        // Commit initial project
        // =========================================
        spinner.start(`Initializing git...`);
        await commitInitialProject(projectPath);
        spinner.info(`Git initialized`);

        spinner.succeed(chalk.green(`Project created successfully!`));
        console.log(`\nNext steps:`);
        console.log(`1. cd ${name}`);
        console.log(`2. open the project in your favorite IDE`);
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

const deleteDefaultFolder = (groupId: string, artifactId: string, projectPath: string): void => {
    if (groupId === "it.theapplegeek" && artifactId === "spring-starter-pack") return;
    if (groupId === "it.theapplegeek") {
        deleteFolder(path.join(projectPath, "src", "main", "java", "it", "theapplegeek", "spring_starter_pack"));
        deleteFolder(path.join(projectPath, "src", "test", "java", "it", "theapplegeek", "spring_starter_pack"));
    } else if (groupId.startsWith("it.")) {
        deleteFolder(path.join(projectPath, "src", "main", "java", "it", "theapplegeek"));
        deleteFolder(path.join(projectPath, "src", "test", "java", "it", "theapplegeek"));
    } else {
        deleteFolder(path.join(projectPath, "src", "main", "java", "it"));
        deleteFolder(path.join(projectPath, "src", "test", "java", "it"));
    }
}

export {
    createCommand
}