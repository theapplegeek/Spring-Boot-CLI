#!/usr/bin/env node
import {Command} from "commander";
import figlet from "figlet";
import chalk from "chalk";
import {createCommand} from "./commands/create.command.mjs";

const program: Command = new Command();
const version: string = "1.0.0";
const description: string = "A CLI tool to create and manage Spring Boot projects.";

program
    .version(version)
    .description(description)
    .action((): void => {
        console.log(
            chalk.green(figlet.textSync("Spring Boot CLI", {horizontalLayout: "full"}))
        );
        console.log("\nWelcome to Spring Boot CLI!");
        console.log(description);
        console.log("\nType 'spring-boot-cli --help' to see the list of commands.");
    });

program.addCommand(createCommand);

program.parse(process.argv);