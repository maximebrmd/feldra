import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

interface WorkflowStep {
  run?: string;
}

interface WorkflowJob {
  name?: string;
  needs?: string[] | string;
  "runs-on"?: string;
  steps?: WorkflowStep[];
  strategy?: { matrix?: { command?: string[] } };
}

interface WorkflowFile {
  jobs?: Record<string, WorkflowJob>;
}

interface NormalizedJob {
  id: string;
  matrixCommands: string[];
  name: string;
  needs: string[];
  runCommands: string[];
  runsOn: string | undefined;
}

function jobNeeds(needs: WorkflowJob["needs"]): string[] {
  if (Array.isArray(needs)) {
    return needs;
  }
  if (typeof needs === "string") {
    return [needs];
  }
  return [];
}

function loadWorkflowJobs(relativePath: string): NormalizedJob[] {
  const workflow = parse(
    readFileSync(path.join(repoRoot, relativePath), "utf8")
  ) as WorkflowFile;
  return Object.entries(workflow.jobs ?? {}).map(([id, job]) => ({
    id,
    matrixCommands: job.strategy?.matrix?.command ?? [],
    name: job.name ?? id,
    needs: jobNeeds(job.needs),
    runCommands: (job.steps ?? []).flatMap((step) =>
      typeof step.run === "string" ? [step.run] : []
    ),
    runsOn: job["runs-on"],
  }));
}

function githubCheckNames(jobs: NormalizedJob[]): string[] {
  return jobs.flatMap((job) =>
    // biome-ignore lint/suspicious/noTemplateCurlyInString: GitHub Actions matrix jobs use this expression as their check name
    job.name === "${{ matrix.command }}" ? job.matrixCommands : [job.name]
  );
}

const requiredChecks = [
  "lint",
  "typecheck",
  "test",
  "coverage",
  "build-docs",
  "translations",
] as const;

test("GitHub check names match the Blume-style required set without a Windows docs build", () => {
  const ciJobs = loadWorkflowJobs(".github/workflows/ci.yml");
  const translationJobs = loadWorkflowJobs(
    ".github/workflows/translations.yml"
  );
  const checkNames = new Set([
    ...githubCheckNames(ciJobs),
    ...githubCheckNames(translationJobs),
  ]);

  for (const name of requiredChecks) {
    assert.equal(
      checkNames.has(name),
      true,
      `missing GitHub check name ${name}`
    );
  }

  assert.equal(checkNames.has("build-docs-windows"), false);
  assert.equal(checkNames.has("Build and test docs"), false);

  const coverage = ciJobs.find((job) => job.id === "coverage");
  assert.ok(coverage);
  assert.equal(coverage.name, "coverage");
  assert.equal(coverage.runsOn, "ubuntu-latest");
  assert.equal(
    coverage.runCommands.some((command) => command === "npm run test:coverage"),
    true
  );

  const docs = ciJobs.find((job) => job.id === "docs");
  assert.ok(docs);
  assert.equal(docs.name, "build-docs");
  assert.equal(docs.runsOn, "ubuntu-latest");

  const translations = translationJobs.find((job) => job.id === "translations");
  assert.ok(translations);
  assert.equal(translations.name, "translations");
  assert.equal(translations.runsOn, "ubuntu-latest");

  for (const job of [...ciJobs, ...translationJobs]) {
    assert.notEqual(job.runsOn, "windows-latest");
  }

  for (const jobId of ["release", "deploy"] as const) {
    const job = ciJobs.find((candidate) => candidate.id === jobId);
    assert.ok(job);
    assert.equal(job.needs.includes("coverage"), true);
  }

  const packageJson = JSON.parse(
    readFileSync(path.join(repoRoot, "package.json"), "utf8")
  ) as { scripts?: Record<string, string> };
  const coverageScript = packageJson.scripts?.["test:coverage"];
  assert.ok(typeof coverageScript === "string");
  assert.equal(coverageScript.includes("--experimental-test-coverage"), true);
  assert.equal(coverageScript.includes("tests/*.test.ts"), true);
});

test("release job is quiet when the changeset queue is empty and npm publish is off", () => {
  const workflow = parse(
    readFileSync(path.join(repoRoot, ".github/workflows/release.yml"), "utf8")
  ) as {
    jobs?: {
      release?: {
        steps?: Array<{
          if?: string;
          run?: string;
          uses?: string;
          with?: { publish?: string; "version-script"?: string };
        }>;
      };
    };
  };
  const steps = workflow.jobs?.release?.steps ?? [];
  const changesets = steps.find((step) =>
    (step.uses ?? "").startsWith("changesets/action")
  );
  assert.ok(changesets);
  assert.equal(changesets.with?.["version-script"], "npm run release:version");
  assert.equal(changesets.with?.publish, undefined);

  const publishGuard =
    "steps.changesets.outputs.has-changesets == 'false' && vars.NPM_PUBLISH_ENABLED == 'true'";
  const gated = steps.filter(
    (step) =>
      (step.uses ?? "").includes("download-artifact") ||
      (step.run ?? "").includes("docs:translations:check") ||
      (step.run ?? "").includes("npm publish")
  );
  assert.equal(gated.length, 3);
  for (const step of gated) {
    assert.equal(step.if, publishGuard);
  }
});
