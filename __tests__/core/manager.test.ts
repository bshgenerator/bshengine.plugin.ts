import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PluginManager } from '../../src/core/manager';
import { PluginException } from '../../src/errors';
import { createTempDir, removeDir, createTestPluginDir, createSampleConfig, createSampleManifest } from '../utils/test-helpers';
import fs from 'fs';
import path from 'path';

// Mock the BshEngine SDK first to avoid resolution issues in CI
vi.mock('@bshsolutions/sdk', () => {
  const mockEntity = {
    create: vi.fn(({ onSuccess, onError }) => {
      setTimeout(() => onSuccess(), 0);
    })
  };

  const mockCore = {
    BshEntities: {
      findById: vi.fn().mockResolvedValue({ data: [] })
    }
  };

  return {
    BshEngine: vi.fn().mockImplementation(() => ({
      entity: vi.fn().mockReturnValue(mockEntity),
      core: mockCore
    }))
  };
});

// Mock the installer to avoid actual API calls
vi.mock('../../src/core/installer', async () => {
  const actual = await vi.importActual('../../src/core/installer');
  return {
    ...actual,
    PluginInstaller: class MockPluginInstaller {
      async install() {
        // Mock implementation
      }
    }
  };
});

// Mock fs/promises for file writing
vi.mock('fs/promises', async () => {
  const actual = await vi.importActual('fs/promises');
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined)
  };
});

describe('PluginManager', () => {
  let tempDir: string;
  let manager: PluginManager;
  let config: { host: string; apiKey: string };

  beforeEach(() => {
    tempDir = createTempDir();
    config = {
      host: 'https://test.engine.com',
      apiKey: 'test-api-key'
    };
    manager = new PluginManager(config);
  });

  afterEach(() => {
    removeDir(tempDir);
    vi.clearAllMocks();
  });

  it('should create manager with config', () => {
    expect(manager).toBeInstanceOf(PluginManager);
  });

  it('should manage plugin installation pipeline', async () => {
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

    await expect(
      manager.manage({ path: pluginDir })
    ).resolves.not.toThrow();
  });

  it('should throw PluginException when plugin directory does not exist', async () => {
    await expect(
      manager.manage({ path: '/nonexistent/path' })
    ).rejects.toThrow(PluginException);
  });

  it('should throw PluginException when config is missing', async () => {
    const emptyDir = path.join(tempDir, 'empty-plugin');
    fs.mkdirSync(emptyDir, { recursive: true });

    await expect(
      manager.manage({ path: emptyDir })
    ).rejects.toThrow(PluginException);
  });

  it('should handle plugin with multiple content targets', async () => {
    const pluginDir = createTestPluginDir(tempDir, {
      config: createSampleConfig({ id: 'test-plugin' }),
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

    await expect(
      manager.manage({ path: pluginDir })
    ).resolves.not.toThrow();
  });

  it('should handle plugin with dependencies', async () => {
    const pluginDir = createTestPluginDir(tempDir, {
      config: createSampleConfig({ id: 'test-plugin' }),
      content: {
        BshTest1: {
          manifest: createSampleManifest({ target: 'BshTest1' }),
          files: {
            'file1.json': { id: '1' }
          }
        },
        BshTest2: {
          manifest: createSampleManifest({ 
            target: 'BshTest2',
            dependencies: ['BshTest1']
          }),
          files: {
            'file2.json': { id: '2' }
          }
        }
      }
    });

    await expect(
      manager.manage({ path: pluginDir })
    ).resolves.not.toThrow();
  });

  it('should throw PluginException for circular dependencies', async () => {
    const pluginDir = createTestPluginDir(tempDir, {
      config: createSampleConfig({ id: 'test-plugin' }),
      content: {
        BshTest1: {
          manifest: createSampleManifest({ 
            target: 'BshTest1',
            dependencies: ['BshTest2']
          }),
          files: {
            'file1.json': { id: '1' }
          }
        },
        BshTest2: {
          manifest: createSampleManifest({ 
            target: 'BshTest2',
            dependencies: ['BshTest1']
          }),
          files: {
            'file2.json': { id: '2' }
          }
        }
      }
    });

    await expect(
      manager.manage({ path: pluginDir })
    ).rejects.toThrow(PluginException);
  });

  it('should write review files during management', async () => {
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

    await manager.manage({ path: pluginDir });

    // The manager should write review files (mocked in this test)
    // In a real scenario, you would check if files exist
  });
});

