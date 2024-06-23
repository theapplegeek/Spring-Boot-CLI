#!/usr/bin/env node
import {Command} from "commander";
import figlet from "figlet";
import chalk from "chalk";

export const program: Command = new Command();
const version: string = "1.0.0";
const description: string = "A CLI tool to create and manage Spring Boot projects.";

program
    .version(version)
    .description(description)
    .action((): void => {
        console.log(
            chalk.green(figlet.textSync("Spring CLI", {horizontalLayout: "full"}))
        );
        console.log("\nWelcome to Spring CLI!");
        console.log(description);
        console.log("\nType 'spring --help' to see the list of commands.");
    });

program.parse(process.argv);