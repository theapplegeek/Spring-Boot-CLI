import {Command} from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "node:path";
import {existsFile, writeFile} from "../utils/file-manager.utils.mjs";
import {ConfigFile} from "../models/config-file.model.mjs";
import {parseObjectToYamlString} from "../utils/yaml.utils.mjs";

const initCommand: Command = new Command("init")
    .command("init")
    .description("Initialize a configuration file for the Spring CLI on the current spring project")
    .action(async (): Promise<void> => {
        const basePackagePath: string = await getBasePackagePath();
        const normalizedBasePackagePath: string = path.normalize(basePackagePath);
        if (!checkIsDirectory(normalizedBasePackagePath)) {
            console.error(chalk.red("The base package path is not a directory"));
            process.exit(1);
        }
        if (!checkIsMavenRoot()) {
            console.error(chalk.red("The current directory is not a Maven project"));
            process.exit(1);
        }
        createInitFile(normalizedBasePackagePath, path.join(process.cwd()), true);
        console.log(chalk.green(`Initialization completed, the configuration file is created at ${process.cwd()}/spring-cli.yml`));
    });

const getBasePackagePath: () => Promise<string> = async (): Promise<string> => {
    return inquirer.prompt({
        type: "input",
        name: "basePackagePath",
        message: "Enter the base package path after src/main/java: ",
        validate: (input: string): boolean | string => {
            if (input === "") {
                return "Please enter a base package path";
            }
            return true;
        }
    }).then((answers: { basePackagePath: string }) => {
        return answers.basePackagePath as string
    });
};

const checkIsDirectory: (directory: string) => boolean = (directory: string): boolean => {
    try {
        return /^[a-zA-Z0-9_\/\\:.]+$/.test(directory);
    } catch (err) {
        return false;
    }
}

const checkIsMavenRoot: () => boolean = () => {
    const fileName = 'pom.xml';
    const filePath: string = path.join(process.cwd(), fileName);

    return existsFile(filePath);
}

const createInitFile: (basePackagePath: string, directory: string, failIfExist: boolean) => void = (basePackagePath: string, directory: string, failIfExist: boolean = true): void => {
    const fileName: string = 'spring-cli.yml';
    const filePath: string = path.join(directory, fileName);
    if (failIfExist && existsFile(filePath)) {
        console.error(chalk.red(`The file ${fileName} already exists in the current directory`));
        process.exit(1);
    }
    const config: ConfigFile = {
        basePackagePath: basePackagePath
    };
    writeFile(filePath, parseObjectToYamlString(config));
}

export {
    initCommand,
    createInitFile,
}