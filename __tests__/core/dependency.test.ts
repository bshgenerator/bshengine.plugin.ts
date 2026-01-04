import { describe, it, expect, beforeEach } from 'vitest';
import { PluginDependency } from '../../src/core/dependency';
import { PluginException } from '../../src/errors';
import { createPluginContent } from '../../src/utils/plugin-content';
import { createSampleManifest } from '../utils/test-helpers';

describe('PluginDependency', () => {
  let dependency: PluginDependency;

  beforeEach(() => {
    dependency = new PluginDependency();
  });

  beforeEach(() => {
    dependency = new PluginDependency();
  });

  it('should resolve dependencies correctly', () => {
    const content1 = createPluginContent(
      createSampleManifest({ target: 'BshTest1' })
    );
    const content2 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest2',
        dependencies: ['BshTest1']
      })
    );

    const contentMap = {
      'BshTest1': content1,
      'BshTest2': content2
    };

    dependency.check(contentMap);

    expect(content2.dependencies).toContain(content1);
    expect(content2.dependencies.length).toBe(1);
  });

  it('should handle multiple dependencies', () => {
    const content1 = createPluginContent(
      createSampleManifest({ target: 'BshTest1' })
    );
    const content2 = createPluginContent(
      createSampleManifest({ target: 'BshTest2' })
    );
    const content3 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest3',
        dependencies: ['BshTest1', 'BshTest2']
      })
    );

    const contentMap = {
      'BshTest1': content1,
      'BshTest2': content2,
      'BshTest3': content3
    };

    dependency.check(contentMap);

    expect(content3.dependencies.length).toBe(2);
    expect(content3.dependencies).toContain(content1);
    expect(content3.dependencies).toContain(content2);
  });

  it('should handle content without dependencies', () => {
    const content1 = createPluginContent(
      createSampleManifest({ target: 'BshTest1' })
    );

    const contentMap = {
      'BshTest1': content1
    };

    expect(() => {
      dependency.check(contentMap);
    }).not.toThrow();
    expect(content1.dependencies.length).toBe(0);
  });

  it('should throw PluginException for self-dependency', () => {
    const content1 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest1',
        dependencies: ['BshTest1']
      })
    );

    const contentMap = {
      'BshTest1': content1
    };

    expect(() => {
      dependency.check(contentMap);
    }).toThrow(PluginException);
  });

  it('should throw PluginException for circular dependencies', () => {
    const content1 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest1',
        dependencies: ['BshTest2']
      })
    );
    const content2 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest2',
        dependencies: ['BshTest1']
      })
    );

    const contentMap = {
      'BshTest1': content1,
      'BshTest2': content2
    };

    expect(() => {
      dependency.check(contentMap);
    }).toThrow(PluginException);
  });

  it('should throw PluginException for longer circular dependencies', () => {
    const content1 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest1',
        dependencies: ['BshTest2']
      })
    );
    const content2 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest2',
        dependencies: ['BshTest3']
      })
    );
    const content3 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest3',
        dependencies: ['BshTest1']
      })
    );

    const contentMap = {
      'BshTest1': content1,
      'BshTest2': content2,
      'BshTest3': content3
    };

    expect(() => {
      dependency.check(contentMap);
    }).toThrow(PluginException);
  });

  it('should handle missing dependencies gracefully', () => {
    const content1 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest1',
        dependencies: ['MissingDependency']
      })
    );

    const contentMap = {
      'BshTest1': content1
    };

    expect(() => {
      dependency.check(contentMap);
    }).not.toThrow();
    expect(content1.dependencies.length).toBe(0);
  });

  it('should handle nested dependencies correctly', () => {
    const content1 = createPluginContent(
      createSampleManifest({ target: 'BshTest1' })
    );
    const content2 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest2',
        dependencies: ['BshTest1']
      })
    );
    const content3 = createPluginContent(
      createSampleManifest({ 
        target: 'BshTest3',
        dependencies: ['BshTest2']
      })
    );

    const contentMap = {
      'BshTest1': content1,
      'BshTest2': content2,
      'BshTest3': content3
    };

    dependency.check(contentMap);

    expect(content2.dependencies).toContain(content1);
    expect(content3.dependencies).toContain(content2);
  });
});

