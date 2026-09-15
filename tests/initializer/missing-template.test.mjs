import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../..");
const release = join(root, "packages/feldra");

async function copyCliWithoutTemplate(temp) {
  const pkg = join(temp, "packages/feldra");
  await mkdir(join(pkg, "bin"), { recursive: true });
  await cp(join(release, "bin"), join(pkg, "bin"), { recursive: true });
  await copyFile(
    join(release, "template-manifest.json"),
    join(pkg, "template-manifest.json")
  );
  await copyFile(join(release, "package.json"), join(pkg, "package.json"));
  await symlink(join(root, "node_modules"), join(pkg, "node_modules"));
  return pkg;
}

function createWithMissingTemplate(pkg, dest) {
  return spawnSync(
    process.execPath,
    [join(pkg, "bin/feldra.mjs"), "create", dest, "--yes"],
    {
      encoding: "utf8",
      env: { ...process.env, NODE_PATH: join(root, "node_modules") },
    }
  );
}

function assertMissingTemplateError(result) {
  assert.notEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stderr, /missing or stale/iu);
  assert.match(result.stderr, /bun run initializer:pack/u);
  assert.doesNotMatch(result.stderr, /^feldra: ENOENT:/mu);
}

test("create with a missing packed template prints pack instructions and does not create the destination", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra-missing-template-"));
  try {
    const pkg = await copyCliWithoutTemplate(temp);
    const dest = join(temp, "my-new-saas");
    const result = createWithMissingTemplate(pkg, dest);
    assertMissingTemplateError(result);
    await assert.rejects(stat(dest), { code: "ENOENT" });
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});

test("create with a stale packed template missing docs config prints pack instructions", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra-stale-template-"));
  try {
    const pkg = await copyCliWithoutTemplate(temp);
    await mkdir(join(pkg, "template/apps/docs"), { recursive: true });
    await writeFile(join(pkg, "template/README.md"), "stale\n");
    const dest = join(temp, "my-new-saas");
    const result = createWithMissingTemplate(pkg, dest);
    assertMissingTemplateError(result);
    await assert.rejects(stat(dest), { code: "ENOENT" });
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});

test("create auto-packs from a monorepo checkout when the template is missing", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra-auto-pack-"));
  try {
    const pkg = await copyCliWithoutTemplate(temp);
    await mkdir(join(temp, "scripts"), { recursive: true });
    await writeFile(
      join(temp, "scripts/pack-initializer.mjs"),
      `import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(fileURLToPath(import.meta.url));
await writeFile(
  join(root, "auto-pack-ran"),
  \`\${process.argv.slice(2).join(" ")}\\n\`
);
`
    );
    const dest = join(temp, "my-new-saas");
    const result = createWithMissingTemplate(pkg, dest);
    assert.equal(
      await readFile(join(temp, "scripts/auto-pack-ran"), "utf8"),
      "--template-only\n"
    );
    assertMissingTemplateError(result);
    await assert.rejects(stat(dest), { code: "ENOENT" });
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});

test("create --help still works when the packed template is missing", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra-missing-template-help-"));
  try {
    const pkg = await copyCliWithoutTemplate(temp);
    const result = spawnSync(
      process.execPath,
      [join(pkg, "bin/feldra.mjs"), "create", "--help"],
      {
        encoding: "utf8",
        env: { ...process.env, NODE_PATH: join(root, "node_modules") },
      }
    );
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /npx feldra@latest create \[directory\]/u);
    assert.doesNotMatch(result.stderr, /initializer:pack/u);
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});
