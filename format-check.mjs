import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const scanRoots = ["src", "tests", "docs", "scripts"];
const explicitFiles = [
  "README.md",
  "check.ts",
  "format-check.mjs",
  "lint-boundaries.mjs",
  "package.json",
  "package-lock.json",
  "run-all-tests.mjs",
  "tsconfig.json"
];
const allowedExtensions = new Set([".ts", ".js", ".mjs", ".json", ".md"]);
const issues = [];

for (const root of scanRoots) {
  const absoluteRoot = path.join(repoRoot, root);

  if (!await pathExists(absoluteRoot)) {
    continue;
  }

  const files = await collectFiles(absoluteRoot);

  for (const filePath of files) {
    await inspectFile(filePath, issues);
  }
}

for (const fileName of explicitFiles) {
  const absoluteFile = path.join(repoRoot, fileName);

  if (!await pathExists(absoluteFile)) {
    continue;
  }

  await inspectFile(absoluteFile, issues);
}

if (issues.length > 0) {
  console.error("Format check failed:");

  for (const issue of issues) {
    console.error(`- ${issue}`);
  }

  process.exit(1);
}

console.log("Format check passed.");

async function inspectFile(filePath, issuesList) {
  const source = await readFile(filePath, "utf8");
  const relativeFile = toRepoPath(filePath);
  const lines = source.split(/\r?\n/u);

  if (!source.endsWith("\n")) {
    issuesList.push(`${relativeFile}: missing trailing newline.`);
  }

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];

    if (/[ \t]+$/u.test(line)) {
      issuesList.push(`${relativeFile}:${lineNumber} has trailing whitespace.`);
    }

    if (line.includes("\t")) {
      issuesList.push(`${relativeFile}:${lineNumber} contains a tab character.`);
    }
  }
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && allowedExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
