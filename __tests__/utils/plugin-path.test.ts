import { describe, it, expect } from 'vitest';
import { createPluginPath, MANIFEST_FILE, CONFIG_FILE } from '../../src/utils/plugin-path';

describe('createPluginPath', () => {
  it('should create a path for a regular file', () => {
    const filePath = '/path/to/file.json';
    const path = createPluginPath(filePath, true, false);
    
    expect(path.path).toBe(filePath);
    expect(path.fileName).toBe('file.json');
    expect(path.isFile).toBe(true);
    expect(path.isDirectory).toBe(false);
    expect(path.isManifest).toBe(false);
    expect(path.isConfig).toBe(false);
    expect(path.isContent()).toBe(true);
  });

  it('should identify manifest files', () => {
    const filePath = `/path/to/${MANIFEST_FILE}`;
    const path = createPluginPath(filePath, true, false);
    
    expect(path.isManifest).toBe(true);
    expect(path.isConfig).toBe(false);
    expect(path.isContent()).toBe(false);
  });

  it('should identify config files', () => {
    const filePath = `/path/to/${CONFIG_FILE}`;
    const path = createPluginPath(filePath, true, false);
    
    expect(path.isManifest).toBe(false);
    expect(path.isConfig).toBe(true);
    expect(path.isContent()).toBe(false);
  });

  it('should create a path for a directory', () => {
    const dirPath = '/path/to/directory';
    const subpaths = [
      createPluginPath('/path/to/directory/file1.json', true, false),
      createPluginPath('/path/to/directory/file2.json', true, false)
    ];
    const path = createPluginPath(dirPath, false, true, subpaths);
    
    expect(path.path).toBe(dirPath);
    expect(path.fileName).toBe('directory');
    expect(path.isFile).toBe(false);
    expect(path.isDirectory).toBe(true);
    expect(path.subpaths).toEqual(subpaths);
    expect(path.isContent()).toBe(false);
  });

  it('should handle paths with subpaths', () => {
    const dirPath = '/path/to/directory';
    const subpaths = [
      createPluginPath('/path/to/directory/subdir', false, true)
    ];
    const path = createPluginPath(dirPath, false, true, subpaths);
    
    expect(path.subpaths).toEqual(subpaths);
  });
});

describe('Constants', () => {
  it('should export MANIFEST_FILE constant', () => {
    expect(MANIFEST_FILE).toBe('__manifest__.json');
  });

  it('should export CONFIG_FILE constant', () => {
    expect(CONFIG_FILE).toBe('bshplugin.json');
  });
});

