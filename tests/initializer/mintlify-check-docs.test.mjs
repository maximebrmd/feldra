import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../..");
const mintlifyDocs = join(
  root,
  "packages/feldra/variants/docs/mintlify/apps/docs"
);
const checkDocs = join(mintlifyDocs, "check-docs.mjs");

function runNode(script, cwd) {
  return spawnSync(process.execPath, [script], {
    cwd,
    encoding: "utf8",
  });
}

async function copyMintlifyDocs(destination) {
  await cp(mintlifyDocs, destination, { recursive: true });
}

test("Mintlify check-docs accepts the bundled docs.json pages and internal links", () => {
  const result = runNode(checkDocs, mintlifyDocs);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("Mintlify check-docs fails when docs.json is missing required fields", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra-mintlify-docs-json-"));
  try {
    await copyMintlifyDocs(temp);
    const configPath = join(temp, "docs.json");
    const config = JSON.parse(await readFile(configPath, "utf8"));
    delete config.theme;
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    const result = runNode(join(temp, "check-docs.mjs"), temp);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /docs\.json is missing required Mintlify fields/u
    );
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});

test("Mintlify check-docs fails on a broken internal link", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra-mintlify-broken-link-"));
  try {
    await copyMintlifyDocs(temp);
    await writeFile(
      join(temp, "introduction.mdx"),
      `${await readFile(join(temp, "introduction.mdx"), "utf8")}\nSee [missing](/not-a-page).\n`
    );
    const result = runNode(join(temp, "check-docs.mjs"), temp);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /Broken internal link \/not-a-page in introduction\.mdx/u
    );
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});

test("Mintlify check-docs.mjs passes default generated-project Ultracite", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra-mintlify-ultracite-"));
  try {
    await mkdir(join(temp, "apps/docs"), { recursive: true });
    await copyFile(join(root, "biome.jsonc"), join(temp, "biome.jsonc"));
    await copyFile(join(root, ".gitignore"), join(temp, ".gitignore"));
    await copyMintlifyDocs(join(temp, "apps/docs"));
    await writeFile(
      join(temp, "package.json"),
      `${JSON.stringify(
        {
          name: "packed-mintlify-docs",
          private: true,
          scripts: { lint: "ultracite check" },
        },
        null,
        2
      )}\n`
    );
    await symlink(join(root, "node_modules"), join(temp, "node_modules"));
    const lint = spawnSync("npm", ["run", "lint"], {
      cwd: temp,
      encoding: "utf8",
    });
    assert.equal(lint.status, 0, `${lint.stdout}\n${lint.stderr}`);
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});
