import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const testsRoot = fileURLToPath(new URL("./tests", import.meta.url));
const testFiles = (await collectTestFiles(testsRoot)).sort((left, right) => left.localeCompare(right));

if (testFiles.length === 0) {
  throw new Error("No test files were found under tests/.");
}

for (const testFile of testFiles) {
  await import(pathToFileURL(testFile).href);
}

async function collectTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const resolvedPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectTestFiles(resolvedPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      files.push(resolvedPath);
    }
  }

  return files;
}
