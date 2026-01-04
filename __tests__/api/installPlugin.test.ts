import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { installPlugin } from '../../src/api';
import { PluginException } from '../../src/errors';
import { createTempDir, removeDir, createTestPluginDir, createSampleConfig, createSampleManifest } from '../utils/test-helpers';

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

// Mock console methods
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock PluginManager
vi.mock('../../src/core/manager', () => {
  return {
    PluginManager: vi.fn().mockImplementation(() => ({
      manage: vi.fn().mockResolvedValue(undefined)
    }))
  };
});

describe('installPlugin', () => {
  let tempDir: string;
  let config: { host: string; apiKey: string };

  beforeEach(() => {
    tempDir = createTempDir();
    config = {
      host: 'https://test.engine.com',
      apiKey: 'test-api-key'
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    removeDir(tempDir);
    vi.clearAllMocks();
  });

  it('should install plugin with valid options', async () => {
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
      installPlugin(config, { pluginDir })
    ).resolves.not.toThrow();
  });

  it('should handle error when pluginDir is missing', async () => {
    await installPlugin(config, {});

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: 500 - Error installing plugin: pluginDir is required in options')
    );
  });

  it('should log messages when verbose is true', async () => {
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

    await installPlugin(config, { pluginDir, verbose: true });

    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('should not log messages when verbose is false', async () => {
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

    await installPlugin(config, { pluginDir, verbose: false });

    // Should not log installation messages
    expect(consoleLogSpy).not.toHaveBeenCalledWith('Installing plugins...');
  });

  it('should handle PluginException errors', async () => {
    const { PluginManager } = await import('../../src/core/manager');
    vi.mocked(PluginManager).mockImplementation(() => ({
      manage: vi.fn().mockRejectedValue(new PluginException('Test error', 404))
    } as any));

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

    await installPlugin(config, { pluginDir });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: 404 - Test error')
    );
  });

  it('should handle generic errors', async () => {
    const { PluginManager } = await import('../../src/core/manager');
    vi.mocked(PluginManager).mockImplementation(() => ({
      manage: vi.fn().mockRejectedValue(new Error('Generic error'))
    } as any));

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

    await installPlugin(config, { pluginDir });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: 500 - Error installing plugin: Generic error')
    );
  });

  it('should default verbose to true', async () => {
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

    await installPlugin(config, { pluginDir });

    expect(consoleLogSpy).toHaveBeenCalled();
  });
});

