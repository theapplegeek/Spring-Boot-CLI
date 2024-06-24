import * as fs from "node:fs";
import chalk from "chalk";

const createFolder = (folderPath: string): void => {
    if (fs.existsSync(folderPath)) {
        console.error(chalk.red(`The directory ${folderPath} already exists!`));
        process.exit(1);
    }
    fs.mkdirSync(folderPath);
}

export {
    createFolder
}