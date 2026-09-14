#!/usr/bin/env node
const args = process.argv.slice(2);
const help = `Usage: npx feldra@latest <command>

Commands:
  create [directory]  Create a Feldra SaaS project

Primary usage: npx feldra create [directory] [flags]
Equivalent: npm exec feldra@latest -- create [directory] [flags]
Run npx feldra create --help for options. Node >=22.12, npm and Git required.
`;

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log(help);
  process.exit(0);
}
if (args[0] === "create") {
  process.argv = [process.argv[0], process.argv[1], ...args.slice(1)];
  await import("./create.mjs");
} else {
  console.error(`Unknown command: ${args[0]}\n`);
  console.error(help);
  process.exit(1);
}
