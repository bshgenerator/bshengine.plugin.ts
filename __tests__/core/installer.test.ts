import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginInstaller } from '../../src/core/installer';
import { PluginException } from '../../src/errors';
import { createPluginContent, createPluginPath } from '../../src/utils';
import { createSampleConfig, createSampleManifest } from '../utils/test-helpers';
import type { PluginWrapper, PluginContent } from '../../src/types';
import fs from 'fs';

// Mock the BshEngine SDK
vi.mock('@bshsolutions/sdk', () => {
  const mockEntity = {
    create: vi.fn(({ onSuccess, onError }) => {
      // Simulate successful creation
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

describe('PluginInstaller', () => {
  let installer: PluginInstaller;
  let config: { host: string; apiKey: string };

  beforeEach(() => {
    config = {
      host: 'https://test.engine.com',
      apiKey: 'test-api-key'
    };
    installer = new PluginInstaller(config);
    vi.clearAllMocks();
  });

  it('should create installer with config', () => {
    expect(installer).toBeInstanceOf(PluginInstaller);
  });

  it('should install plugin with file reading and variable resolution', async () => {
    const { BshEngine } = await import('@bshsolutions/sdk');
    const mockEngine = new BshEngine(config);
    const mockEntity = mockEngine.entity('BshTest');

    const tempDir = fs.mkdtempSync('/tmp/test-');
    const testFile = `${tempDir}/test.json`;
    fs.writeFileSync(testFile, JSON.stringify({ id: 'test-record' }));

    const configObj = createSampleConfig({ id: 'test-plugin' });
    const manifest = createSampleManifest({ target: 'BshTest' });
    const filePath = createPluginPath(testFile, true, false);
    const content: PluginContent = createPluginContent(manifest, [filePath]);
    
    const wrapper: PluginWrapper = {
      config: configObj,
      contentMap: { 'BshTest': content },
      contentList() {
        return Object.values(this.contentMap);
      }
    };

    await installer.install(wrapper);

    expect(mockEntity.create).toHaveBeenCalled();
    
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should install plugin wrapper', async () => {
    const { BshEngine } = await import('@bshsolutions/sdk');
    const mockEngine = new BshEngine(config);
    const mockEntity = mockEngine.entity('BshTest');

    const configObj = createSampleConfig({ id: 'test-plugin' });
    const manifest = createSampleManifest({ target: 'BshTest' });
    const content: PluginContent = createPluginContent(manifest, []);
    
    const wrapper: PluginWrapper = {
      config: configObj,
      contentMap: { 'BshTest': content },
      contentList() {
        return Object.values(this.contentMap);
      }
    };

    // Mock file reading
    vi.spyOn(installer as any, 'readJson').mockResolvedValue({ id: 'test' });

    await installer.install(wrapper);

    expect(mockEntity.create).toHaveBeenCalled();
  });

  it('should handle uninstall (not implemented)', async () => {
    const wrapper: PluginWrapper = {
      config: createSampleConfig(),
      contentMap: {},
      contentList() {
        return [];
      }
    };

    await expect(
      installer.uninstall(wrapper)
    ).rejects.toThrow('Uninstall not yet implemented');
  });
});

