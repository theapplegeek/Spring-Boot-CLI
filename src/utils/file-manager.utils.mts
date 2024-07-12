import * as fs from "node:fs";
import chalk from "chalk";

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

const createFolder = (folderPath: string): void => {
    if (fs.existsSync(folderPath)) {
        console.error(chalk.red(`The directory ${folderPath} already exists!`));
        process.exit(1);
    }
    fs.mkdirSync(folderPath);
}

export {
    readFile,
    writeFile,
    createFolder
}