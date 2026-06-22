import { execSync, spawn } from "child_process";
import fs from "fs";

execSync("cp ./.env.development ./functions/.env");
console.log("✓ Copied .env.development to functions/.env"); 

spawn(
  "firebase",
  ["emulators:start", "--import", "./test/emulatorData"],
  { stdio: "inherit", shell: true }
);

const cleanup = () => {
  fs.unlinkSync("./functions/.env");
  console.log("✓ Cleaned up functions/.env");
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);