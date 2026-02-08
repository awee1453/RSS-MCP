// Simple test to verify MCP server starts correctly
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Testing RSS-News MCP Server...\n');

const tsxPath = path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const indexPath = path.join(__dirname, 'src', 'index.ts');

console.log('TSX Path:', tsxPath);
console.log('Index Path:', indexPath);
console.log('\n🚀 Starting MCP server...\n');

const child = spawn('node', [tsxPath, indexPath], {
    env: { ...process.env, MCP_TRANSPORT: 'stdio' },
    stdio: 'inherit'
});

child.on('error', (err) => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
});

child.on('exit', (code) => {
    console.log(`\n✅ MCP server exited with code: ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping MCP server...');
    child.kill();
    process.exit(0);
});
