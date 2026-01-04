import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PluginDiscovery } from '../../src/core/discovery';
import { PluginException } from '../../src/errors';
import { createTempDir, removeDir, createTestPluginDir, createSampleConfig, createSampleManifest } from '../utils/test-helpers';

describe('PluginDiscovery', () => {
  let tempDir: string;
  let discovery: PluginDiscovery;

  beforeEach(() => {
    tempDir = createTempDir();
    discovery = new PluginDiscovery();
  });

  afterEach(() => {
    removeDir(tempDir);
  });

  it('should discover plugin files in a directory', async () => {
    const pluginDir = createTestPluginDir(tempDir, {
      config: createSampleConfig(),
      content: {
        BshTest: {
          manifest: createSampleManifest({ target: 'BshTest' }),
          files: {
            'test.json': { id: 'test' }
          }
        }
      }
    });

    const paths = await discovery.discover({ path: pluginDir });

    expect(paths).toBeDefined();
    expect(paths.length).toBeGreaterThan(0);
    
    // Check for config file (should be at root level)
    const configFiles = paths.filter(p => p.isConfig);
    expect(configFiles.length).toBeGreaterThan(0);
    
    // Check for manifest and content files (may be in subdirectories)
    const allPaths: any[] = [];
    function collectPaths(pathList: any[]) {
      for (const p of pathList) {
        allPaths.push(p);
        if (p.subpaths) {
          collectPaths(p.subpaths);
        }
      }
    }
    collectPaths(paths);
    
    expect(allPaths.some((p: any) => p.isManifest)).toBe(true);
    expect(allPaths.some((p: any) => p.isContent())).toBe(true);
  });

  it('should throw PluginException when directory does not exist', async () => {
    await expect(
      discovery.discover({ path: '/nonexistent/path' })
    ).rejects.toThrow(PluginException);
  });

  it('should throw PluginException when path is not a directory', async () => {
    const filePath = `${tempDir}/file.txt`;
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, 'test');

    await expect(
      discovery.discover({ path: filePath })
    ).rejects.toThrow(PluginException);
  });

  it('should discover nested directory structures', async () => {
    const pluginDir = createTestPluginDir(tempDir, {
      config: createSampleConfig(),
      content: {
        BshTest1: {
          manifest: createSampleManifest({ target: 'BshTest1' }),
          files: {
            'file1.json': { id: '1' }
          }
        },
        BshTest2: {
          manifest: createSampleManifest({ target: 'BshTest2' }),
          files: {
            'file2.json': { id: '2' }
          }
        }
      }
    });

    const paths = await discovery.discover({ path: pluginDir });

    // Collect all paths recursively
    const allPaths: any[] = [];
    function collectPaths(pathList: any[]) {
      for (const p of pathList) {
        allPaths.push(p);
        if (p.subpaths) {
          collectPaths(p.subpaths);
        }
      }
    }
    collectPaths(paths);

    const contentFiles = allPaths.filter((p: any) => p.isContent());
    expect(contentFiles.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty directories', async () => {
    const emptyDir = `${tempDir}/empty`;
    const fs = await import('fs/promises');
    await fs.mkdir(emptyDir, { recursive: true });

    const paths = await discovery.discover({ path: emptyDir });

    expect(paths).toEqual([]);
  });

  it('should discover all file types correctly', async () => {
    const pluginDir = createTestPluginDir(tempDir, {
      config: createSampleConfig(),
      content: {
        BshTest: {
          manifest: createSampleManifest({ target: 'BshTest' }),
          files: {
            'test.json': { id: 'test' }
          }
        }
      }
    });

    const paths = await discovery.discover({ path: pluginDir });

    // Collect all paths recursively
    const allPaths: any[] = [];
    function collectPaths(pathList: any[]) {
      for (const p of pathList) {
        allPaths.push(p);
        if (p.subpaths) {
          collectPaths(p.subpaths);
        }
      }
    }
    collectPaths(paths);

    const configFile = allPaths.find((p: any) => p.isConfig);
    const manifestFile = allPaths.find((p: any) => p.isManifest);
    const contentFile = allPaths.find((p: any) => p.isContent());

    expect(configFile).toBeDefined();
    expect(manifestFile).toBeDefined();
    expect(contentFile).toBeDefined();
  });
});

