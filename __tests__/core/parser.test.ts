import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PluginParser } from '../../src/core/parser';
import { PluginException } from '../../src/errors';
import { createPluginPath } from '../../src/utils/plugin-path';
import { createTempDir, removeDir, createTestPluginDir, createSampleConfig, createSampleManifest } from '../utils/test-helpers';

describe('PluginParser', () => {
  let tempDir: string;
  let parser: PluginParser;

  beforeEach(() => {
    tempDir = createTempDir();
    parser = new PluginParser();
  });

  afterEach(() => {
    removeDir(tempDir);
  });

  it('should parse plugin structure from paths', () => {
    const pluginDir = createTestPluginDir(tempDir, {
      config: createSampleConfig({ id: 'test-plugin' }),
      content: {
        BshTest: {
          manifest: createSampleManifest({ target: 'BshTest' }),
          files: {
            'test.json': { id: 'test' }
          }
        }
      }
    });

    const fs = require('fs');
    const paths: any[] = [];
    
    function collectPaths(dir: string) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = require('path').join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          collectPaths(filePath);
        } else {
          paths.push(createPluginPath(filePath, true, false));
        }
      }
    }
    collectPaths(pluginDir);

    const wrapper = parser.parse(paths);

    expect(wrapper.config).toBeDefined();
    expect(wrapper.config.id).toBe('test-plugin');
    expect(wrapper.contentMap).toBeDefined();
    expect(wrapper.contentList().length).toBeGreaterThan(0);
  });

  it('should throw PluginException for empty paths', () => {
    expect(() => {
      parser.parse([]);
    }).toThrow(PluginException);
  });

  it('should throw PluginException when config file is missing', () => {
    const paths = [
      createPluginPath('/path/to/manifest.json', true, false)
    ];

    expect(() => {
      parser.parse(paths);
    }).toThrow(PluginException);
  });

  it('should throw PluginException when config is not an object', () => {
    const tempFile = `${tempDir}/bshplugin.json`;
    const fs = require('fs');
    fs.writeFileSync(tempFile, '["array", "not", "object"]');

    const paths = [
      createPluginPath(tempFile, true, false)
    ];

    expect(() => {
      parser.parse(paths);
    }).toThrow(PluginException);
  });

  it('should throw PluginException when config lacks id field', () => {
    const tempFile = `${tempDir}/bshplugin.json`;
    const fs = require('fs');
    fs.writeFileSync(tempFile, JSON.stringify({ name: 'test' }));

    const paths = [
      createPluginPath(tempFile, true, false)
    ];

    expect(() => {
      parser.parse(paths);
    }).toThrow(PluginException);
  });

  it('should parse multiple content targets', async () => {
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

    // Use PluginDiscovery to get proper path structure
    const { PluginDiscovery } = await import('../../src/core/discovery');
    const discovery = new PluginDiscovery();
    const paths = await discovery.discover({ path: pluginDir });

    const wrapper = parser.parse(paths);

    expect(wrapper.contentMap['BshTest1']).toBeDefined();
    expect(wrapper.contentMap['BshTest2']).toBeDefined();
    expect(wrapper.contentList().length).toBe(2);
  });

  it('should throw PluginException when manifest lacks target field', () => {
    const tempManifest = `${tempDir}/__manifest__.json`;
    const fs = require('fs');
    fs.writeFileSync(tempManifest, JSON.stringify({ name: 'test' }));

    const tempConfig = `${tempDir}/bshplugin.json`;
    fs.writeFileSync(tempConfig, JSON.stringify({ id: 'test' }));

    const paths = [
      createPluginPath(tempConfig, true, false),
      createPluginPath(tempManifest, true, false)
    ];

    expect(() => {
      parser.parse(paths);
    }).toThrow(PluginException);
  });

  it('should handle manifest with variables', () => {
    const pluginDir = createTestPluginDir(tempDir, {
      config: createSampleConfig(),
      content: {
        BshTest: {
          manifest: createSampleManifest({
            target: 'BshTest',
            variables: { testVar: 'testValue' }
          }),
          files: {
            'test.json': { id: 'test' }
          }
        }
      }
    });

    const fs = require('fs');
    const paths: any[] = [];
    
    function collectPaths(dir: string) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = require('path').join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          collectPaths(filePath);
        } else {
          paths.push(createPluginPath(filePath, true, false));
        }
      }
    }
    collectPaths(pluginDir);

    const wrapper = parser.parse(paths);

    expect(wrapper.contentMap['BshTest']).toBeDefined();
    expect(wrapper.contentMap['BshTest']!.manifest.variables).toEqual({ testVar: 'testValue' });
  });
});

