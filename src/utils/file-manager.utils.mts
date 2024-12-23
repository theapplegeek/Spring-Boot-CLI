import fs from "fs-extra";
import chalk from "chalk";
import {globSync} from "glob";

const existsFile = (filePath: string): boolean => {
    return fs.existsSync(filePath);
}

const readFile = (filePath: string): string => {
    if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`The file ${filePath} does not exist!`));
        process.exit(1);
    }
    return fs.readFileSync(filePath, "utf-8");
}

const writeFile = (filePath: string, content: string): void => {
    fs.writeFileSync(filePath, content);
}

const createFolder = (folderPath: string, failIfExist: boolean = true): void => {
    if (failIfExist && fs.existsSync(folderPath)) {
        console.error(chalk.red(`The directory ${folderPath} already exists!`));
        process.exit(1);
    }
    fs.mkdirSync(folderPath, {recursive: true});
}

const getJavaFiles = (pattern: string) => {
    return globSync(pattern);
}

const copyFiles = (source: string, destination: string): void => {
    fs.copySync(source, destination, {preserveTimestamps: false});
}

const deleteFolder = (folderPath: string): void => {
    fs.removeSync(folderPath);
}

const renameFile = (oldPath: string, newPath: string): void => {
    fs.renameSync(oldPath, newPath);
}

export {
    existsFile,
    readFile,
    writeFile,
    createFolder,
    getJavaFiles,
    copyFiles,
    deleteFolder,
    renameFile
}