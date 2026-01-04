import { describe, it, expect } from 'vitest';
import { createPluginContent } from '../../src/utils/plugin-content';
import { createPluginPath } from '../../src/utils/plugin-path';
import { createSampleManifest } from './test-helpers';

describe('createPluginContent', () => {
  it('should create plugin content with manifest and files', () => {
    const manifest = createSampleManifest({ target: 'BshTest' });
    const files = [
      createPluginPath('/path/to/file1.json', true, false),
      createPluginPath('/path/to/file2.json', true, false)
    ];
    
    const content = createPluginContent(manifest, files);
    
    expect(content.manifest).toEqual(manifest);
    expect(content.files).toEqual(files);
    expect(content.dependencies).toEqual([]);
    expect(content.installed).toBe(false);
  });

  it('should create plugin content with empty files array', () => {
    const manifest = createSampleManifest();
    const content = createPluginContent(manifest);
    
    expect(content.files).toEqual([]);
    expect(content.isEmpty()).toBe(true);
  });

  it('should return false for isEmpty when files are present', () => {
    const manifest = createSampleManifest();
    const files = [createPluginPath('/path/to/file.json', true, false)];
    const content = createPluginContent(manifest, files);
    
    expect(content.isEmpty()).toBe(false);
  });

  it('should initialize dependencies as empty array', () => {
    const manifest = createSampleManifest();
    const content = createPluginContent(manifest);
    
    expect(content.dependencies).toEqual([]);
    expect(Array.isArray(content.dependencies)).toBe(true);
  });

  it('should initialize installed as false', () => {
    const manifest = createSampleManifest();
    const content = createPluginContent(manifest);
    
    expect(content.installed).toBe(false);
  });
});

