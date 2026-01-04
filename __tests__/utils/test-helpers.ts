import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import type { PluginConfig, PluginManifest } from '../../src/types';

/**
 * Creates a temporary directory for testing
 */
export function createTempDir(prefix = 'plugin-test-'): string {
  const tempDir = path.join(tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(36).substring(7)}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Removes a directory and all its contents
 */
export function removeDir(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * Creates a test plugin directory structure
 */
export function createTestPluginDir(baseDir: string, structure: TestPluginStructure): string {
  const pluginDir = path.join(baseDir, 'test-plugin');
  fs.mkdirSync(pluginDir, { recursive: true });

  // Create config file
  if (structure.config) {
    fs.writeFileSync(
      path.join(pluginDir, 'bshplugin.json'),
      JSON.stringify(structure.config, null, 2)
    );
  }

  // Create content directories
  for (const [target, content] of Object.entries(structure.content || {})) {
    const targetDir = path.join(pluginDir, target);
    fs.mkdirSync(targetDir, { recursive: true });

    // Create manifest
    if (content.manifest) {
      fs.writeFileSync(
        path.join(targetDir, '__manifest__.json'),
        JSON.stringify(content.manifest, null, 2)
      );
    }

    // Create content files
    for (const [fileName, fileContent] of Object.entries(content.files || {})) {
      fs.writeFileSync(
        path.join(targetDir, fileName),
        JSON.stringify(fileContent, null, 2)
      );
    }
  }

  return pluginDir;
}

export interface TestPluginStructure {
  config?: PluginConfig;
  content?: Record<string, {
    manifest?: PluginManifest;
    files?: Record<string, unknown>;
  }>;
}

/**
 * Creates a sample plugin config
 */
export function createSampleConfig(overrides?: Partial<PluginConfig>): PluginConfig {
  return {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    ...overrides,
  };
}

/**
 * Creates a sample manifest
 */
export function createSampleManifest(overrides?: Partial<PluginManifest>): PluginManifest {
  return {
    target: 'BshTest',
    ...overrides,
  };
}

