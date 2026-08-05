const { spawnSync } = require("node:child_process");

const containerName = process.env.STUDYBUDDY_DB_CONTAINER || "studybuddy-postgres";
const hostPort = process.env.STUDYBUDDY_DB_PORT || "5432";
const postgresUser = process.env.STUDYBUDDY_POSTGRES_USER || "postgres";
const postgresPassword = process.env.STUDYBUDDY_POSTGRES_PASSWORD || "postgres";
const postgresDb = process.env.STUDYBUDDY_POSTGRES_DB || "postgres";

const appDbUser = process.env.DB_USERNAME || "studybuddy";
const appDbPassword = process.env.DB_PASSWORD || "studybuddy";
const appDbName = process.env.DB_DATABASE || "studybuddy";

function runDocker(args, options = {}) {
  const result = spawnSync("docker", args, {
    encoding: "utf8",
    stdio: options.captureOutput ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    const details = stderr || stdout || "Docker command failed.";
    throw new Error(details);
  }

  return options.captureOutput ? (result.stdout || "").trim() : "";
}

function hasDocker() {
  const result = spawnSync("docker", ["--version"], {
    encoding: "utf8",
    stdio: "pipe",
  });
  return result.status === 0;
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function quoteLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlQuery(sql) {
  return runDocker(
    [
      "exec",
      "-e",
      `PGPASSWORD=${postgresPassword}`,
      containerName,
      "psql",
      "-U",
      postgresUser,
      "-d",
      postgresDb,
      "-tAc",
      sql,
    ],
    { captureOutput: true }
  );
}

function sqlExec(sql) {
  runDocker([
    "exec",
    "-e",
    `PGPASSWORD=${postgresPassword}`,
    containerName,
    "psql",
    "-v",
    "ON_ERROR_STOP=1",
    "-U",
    postgresUser,
    "-d",
    postgresDb,
    "-c",
    sql,
  ]);
}

function sleepMs(ms) {
  const sharedBuffer = new SharedArrayBuffer(4);
  const int32 = new Int32Array(sharedBuffer);
  Atomics.wait(int32, 0, 0, ms);
}

function ensureContainer() {
  const existing = runDocker(
    [
      "ps",
      "-a",
      "--filter",
      `name=^/${containerName}$`,
      "--format",
      "{{.Names}}",
    ],
    { captureOutput: true }
  );

  if (!existing) {
    console.log(`Creating postgres container ${containerName} on port ${hostPort}...`);
    runDocker([
      "run",
      "-d",
      "--name",
      containerName,
      "-e",
      `POSTGRES_USER=${postgresUser}`,
      "-e",
      `POSTGRES_PASSWORD=${postgresPassword}`,
      "-e",
      `POSTGRES_DB=${postgresDb}`,
      "-p",
      `${hostPort}:5432`,
      "postgres:16-alpine",
    ]);
    return;
  }

  const running = runDocker(["inspect", "-f", "{{.State.Running}}", containerName], {
    captureOutput: true,
  });

  if (running !== "true") {
    console.log(`Starting existing container ${containerName}...`);
    runDocker(["start", containerName]);
  } else {
    console.log(`Container ${containerName} is already running.`);
  }
}

function waitForPostgres(maxAttempts = 40) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const ready = spawnSync(
      "docker",
      [
        "exec",
        "-e",
        `PGPASSWORD=${postgresPassword}`,
        containerName,
        "pg_isready",
        "-U",
        postgresUser,
        "-d",
        postgresDb,
      ],
      { encoding: "utf8", stdio: "pipe" }
    );

    if (ready.status === 0) {
      return;
    }

    sleepMs(1500);
  }

  throw new Error("Postgres did not become ready in time.");
}

function ensureRoleAndDatabase() {
  const roleExists = sqlQuery(
    `SELECT 1 FROM pg_roles WHERE rolname = ${quoteLiteral(appDbUser)};`
  );

  if (roleExists === "1") {
    console.log(`Updating password for role ${appDbUser}...`);
    sqlExec(
      `ALTER ROLE ${quoteIdentifier(appDbUser)} WITH LOGIN PASSWORD ${quoteLiteral(appDbPassword)};`
    );
  } else {
    console.log(`Creating role ${appDbUser}...`);
    sqlExec(
      `CREATE ROLE ${quoteIdentifier(appDbUser)} WITH LOGIN PASSWORD ${quoteLiteral(appDbPassword)};`
    );
  }

  const dbExists = sqlQuery(
    `SELECT 1 FROM pg_database WHERE datname = ${quoteLiteral(appDbName)};`
  );

  if (dbExists === "1") {
    console.log(`Database ${appDbName} already exists.`);
  } else {
    console.log(`Creating database ${appDbName}...`);
    sqlExec(
      `CREATE DATABASE ${quoteIdentifier(appDbName)} OWNER ${quoteIdentifier(appDbUser)};`
    );
  }

  console.log(`Ensuring ownership and privileges for ${appDbName}...`);
  sqlExec(
    `ALTER DATABASE ${quoteIdentifier(appDbName)} OWNER TO ${quoteIdentifier(appDbUser)};`
  );
  sqlExec(
    `GRANT ALL PRIVILEGES ON DATABASE ${quoteIdentifier(appDbName)} TO ${quoteIdentifier(appDbUser)};`
  );
}

function main() {
  if (!hasDocker()) {
    console.error("Docker is not available. Install Docker Desktop and make sure it is running.");
    process.exit(1);
  }

  try {
    ensureContainer();
    console.log("Waiting for postgres to become ready...");
    waitForPostgres();
    ensureRoleAndDatabase();

    console.log("\nLocal database is ready.");
    console.log(`Container: ${containerName}`);
    console.log(`Host: localhost:${hostPort}`);
    console.log(`Database: ${appDbName}`);
    console.log(`User: ${appDbUser}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Database setup failed: ${message}`);
    process.exit(1);
  }
}

main();
