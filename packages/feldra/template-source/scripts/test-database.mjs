import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const name = `feldra-tests-${randomBytes(4).toString("hex")}`;
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    throw new Error(
      `${command} failed (${result.status}): ${result.error?.message ?? "see output"}`
    );
  }
}
try {
  run("docker", [
    "run",
    "--detach",
    "--rm",
    "--name",
    name,
    "-e",
    "POSTGRES_PASSWORD=feldra-local-test",
    "-e",
    "POSTGRES_DB=feldra_test",
    "-p",
    "127.0.0.1::5432",
    "postgres:17-alpine",
  ]);
  const portResult = spawnSync("docker", ["port", name, "5432"], {
    encoding: "utf8",
  });
  if (portResult.status !== 0) {
    throw new Error("Could not determine test database port");
  }
  const port = portResult.stdout.trim().split(":").at(-1);
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (
      spawnSync(
        "docker",
        ["exec", name, "pg_isready", "-h", "127.0.0.1", "-U", "postgres"],
        {
          stdio: "ignore",
        }
      ).status === 0
    ) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) {
    throw new Error("Postgres did not start");
  }
  const url = `postgresql://postgres:feldra-local-test@127.0.0.1:${port}/feldra_test`;
  const env = {
    ...process.env,
    DATABASE_URL_UNPOOLED: url,
    TEST_DATABASE_URL: url,
  };
  run("bun", ["run", "db:migrate"], env);
  run(
    process.execPath,
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      "--test",
      "tests/integration/flows.test.ts",
      "tests/integration/database-access.test.ts",
    ],
    env
  );
} finally {
  spawnSync("docker", ["stop", name], { stdio: "ignore" });
}
