const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(".env.local not found at", envPath);
  process.exit(1);
}

const original = fs.readFileSync(envPath, "utf8");
const backupPath = envPath + ".bak";
fs.writeFileSync(backupPath, original, "utf8");

const cleaned = original
  .split(/\r?\n/)
  .map((line) => {
    const trimmed = line.trimEnd();
    if (trimmed.startsWith("#") || trimmed === "") return trimmed; // preserve comments and blank lines
    // Remove inline comments: any whitespace then # and the rest
    // But keep # if it appears inside value without a leading whitespace (rare). We handle common case: space or tab before #
    const withoutInline = trimmed.replace(/[\t\s]+#.*$/, "");
    return withoutInline;
  })
  .join("\n") + "\n";

fs.writeFileSync(envPath, cleaned, "utf8");
console.log("Cleaned .env.local. Backup saved at", backupPath);


