#!/usr/bin/env node
import { readFileSync } from "node:fs";
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { createCommand } from "./commands/create.command.mjs";
import { initCommand } from "./commands/init.command.mjs";

const program: Command = new Command();
const packageJson: any = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const version: string = packageJson.version;
const description: string =
  "A CLI tool to create and manage Spring Boot projects.";

program
  .version(version)
  .description(description)
  .action((): void => {
    console.log(
      chalk.green(
        figlet.textSync("Spring Boot CLI", { horizontalLayout: "full" }),
      ),
    );
    console.log("\nWelcome to Spring Boot CLI!");
    console.log(description);
    console.log("\nType 'spring-boot-cli --help' to see the list of commands.");
  });

program.addCommand(createCommand);
program.addCommand(initCommand);

program.parse(process.argv);
