import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const requiredDirectories = [
  "src/domain",
  "src/workflow",
  "src/modules",
  "src/app",
  "docs/architecture",
  "docs/specs",
  "docs/decisions",
  "tests"
];

const boundaryRules = [
  {
    sourcePrefix: "src/domain/",
    disallowedPrefixes: ["src/workflow/", "src/modules/", "src/app/", "src/ui/"],
    reason: "Domain must stay independent from workflow, modules, and app/UI layers."
  },
  {
    sourcePrefix: "src/workflow/",
    disallowedPrefixes: ["src/app/", "src/ui/"],
    reason: "Workflow must not depend on app/UI layers."
  },
  {
    sourcePrefix: "src/modules/",
    disallowedPrefixes: ["src/app/", "src/ui/"],
    reason: "Modules must stay presentation-free and must not depend on app/UI layers."
  }
];

const issues = [];

for (const requiredDirectory of requiredDirectories) {
  const absoluteDirectory = path.join(repoRoot, requiredDirectory);

  if (!await pathExists(absoluteDirectory)) {
    issues.push(`Missing required directory: ${requiredDirectory}`);
  }
}

const sourceRoot = path.join(repoRoot, "src");
const sourceFiles = await collectFiles(sourceRoot, (filePath) => (
  filePath.endsWith(".ts") || filePath.endsWith(".js")
));

for (const sourceFile of sourceFiles) {
  const relativeFile = toRepoPath(sourceFile);
  const sourceText = await readFile(sourceFile, "utf8");

  await enforceJsBridge(relativeFile, issues);
  enforceImportBoundaries(sourceFile, relativeFile, sourceText, issues);
}

if (issues.length > 0) {
  console.error("Repo lint failed:");

  for (const issue of issues) {
    console.error(`- ${issue}`);
  }

  process.exit(1);
}

console.log(`Repo lint passed for ${sourceFiles.length} source files.`);

async function enforceJsBridge(relativeFile, issuesList) {
  if (!relativeFile.endsWith(".ts")) {
    return;
  }

  const expectedBridgePath = relativeFile.replace(/\.ts$/u, ".js");
  const absoluteBridgePath = path.join(repoRoot, fromRepoPath(expectedBridgePath));

  if (!await pathExists(absoluteBridgePath)) {
    issuesList.push(`Missing runtime bridge for ${relativeFile}. Expected ${expectedBridgePath}.`);
    return;
  }

  const bridgeSource = (await readFile(absoluteBridgePath, "utf8")).trim();
  const expectedTarget = `./${path.posix.basename(relativeFile)}`;

  if (!bridgeSource.includes(expectedTarget)) {
    issuesList.push(`Runtime bridge ${expectedBridgePath} should point at ${expectedTarget}.`);
  }
}

function enforceImportBoundaries(sourceFile, relativeFile, sourceText, issuesList) {
  const importSpecifiers = extractImportSpecifiers(sourceText);
  const sourceRule = boundaryRules.find((rule) => relativeFile.startsWith(rule.sourcePrefix));

  if (!sourceRule) {
    return;
  }

  for (const specifier of importSpecifiers) {
    if (!specifier.startsWith(".")) {
      continue;
    }

    const resolvedPath = path.resolve(path.dirname(sourceFile), specifier);
    const relativeResolvedPath = toRepoPath(resolvedPath);

    if (relativeResolvedPath.startsWith("../")) {
      continue;
    }

    const violationPrefix = sourceRule.disallowedPrefixes.find((disallowedPrefix) => (
      relativeResolvedPath.startsWith(disallowedPrefix)
    ));

    if (violationPrefix) {
      issuesList.push(
        `${relativeFile} imports ${relativeResolvedPath}, which crosses the ${sourceRule.sourcePrefix} boundary. ${sourceRule.reason}`
      );
    }
  }
}

function extractImportSpecifiers(sourceText) {
  const specifiers = new Set();
  const patterns = [
    /(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["']([^"']+)["']/gu,
    /import\(\s*["']([^"']+)["']\s*\)/gu
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(sourceText)) !== null) {
      specifiers.add(match[1]);
    }
  }

  return [...specifiers];
}

async function collectFiles(directory, includeFile) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(absolutePath, includeFile));
      continue;
    }

    if (entry.isFile() && includeFile(absolutePath)) {
      files.push(absolutePath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
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

function fromRepoPath(repoPath) {
  return repoPath.split("/").join(path.sep);
}
