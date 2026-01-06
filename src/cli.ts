import { Command } from 'commander';
import { installPlugin } from './api/index.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('bsh-plugin')
  .description('BSH Engine Plugin Manager - Install and manage plugins')
  .version(packageJson.version);

program
  .command('install')
  .description('Install a plugin from a directory')
  .argument('<plugin-dir>', 'Path to the plugin directory')
  .option('-h, --host <host>', 'BSH Engine host URL', process.env.BSH_ENGINE_HOST)
  .option('-k, --api-key <key>', 'BSH Engine API key', process.env.BSH_ENGINE_API_KEY)
  .option('--no-verbose', 'Disable verbose output')
  .action(async (pluginDir: string, options: { host?: string; apiKey?: string; verbose?: boolean }) => {
    const { host, apiKey, verbose = true } = options;

    if (!host) {
      console.error('Error: Host is required. Use --host flag or set BSH_ENGINE_HOST environment variable.');
      process.exit(1);
    }

    if (!apiKey) {
      console.error('Error: API key is required. Use --api-key flag or set BSH_ENGINE_API_KEY environment variable.');
      process.exit(1);
    }

    try {
      await installPlugin(
        { host, apiKey },
        { pluginDir, verbose }
      );
      process.exit(0);
    } catch (error) {
      console.error('Installation failed:', error);
      process.exit(1);
    }
  });

program.parse();

