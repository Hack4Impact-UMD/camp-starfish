const { spawn } = require('child_process');

// 1. Start your main process (e.g., 'npm run dev')
// On Windows, use shell: true to support npm commands natively
const mainProcess = spawn('npm', ['run', 'emulators:start'], { stdio: 'inherit', shell: true });

function runCleanup() {
  console.log('\nUser interrupted! Executing final script...');
  
  // 2. Trigger the script you want to run after the kill
  // Using spawnSync blocks the exit until the cleanup finishes
  spawn('npm', ['run', 'emulators:cleanup'], { stdio: 'inherit', shell: true });
  
  process.exit(0);
}

// 3. Catch Ctrl+C (SIGINT) and kill events
process.on('SIGINT', runCleanup);
process.on('SIGTERM', runCleanup);

// Forward the exit code if the main process finishes on its own
mainProcess.on('exit', (code) => {
  process.exit(code || 0);
});
