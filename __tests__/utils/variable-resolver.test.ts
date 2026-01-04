import { describe, it, expect } from 'vitest';
import { JsonResolver } from '../../src/utils/variable-resolver';

describe('JsonResolver', () => {
  describe('resolve', () => {
    it('should resolve simple string variables', () => {
      const variables = { id: 'test-id', name: 'Test Name' };
      const result = JsonResolver.resolve('${id}', variables);
      
      expect(result).toBe('test-id');
    });

    it('should resolve nested object variables', () => {
      const variables = { config: { id: 'test-id', version: '1.0.0' } };
      const result = JsonResolver.resolve('${config.id}', variables);
      
      expect(result).toBe('test-id');
    });

    it('should resolve multiple variables in a string', () => {
      const variables = { id: 'test-id', version: '1.0.0' };
      const result = JsonResolver.resolve('Plugin ${id} v${version}', variables);
      
      expect(result).toBe('Plugin test-id v1.0.0');
    });

    it('should resolve variables in arrays', () => {
      const variables = { prefix: 'test' };
      const result = JsonResolver.resolve(['${prefix}-1', '${prefix}-2'], variables);
      
      expect(result).toEqual(['test-1', 'test-2']);
    });

    it('should resolve variables in objects', () => {
      const variables = { id: 'test-id', name: 'Test Name' };
      const result = JsonResolver.resolve({
        id: '${id}',
        name: '${name}',
        value: 123
      }, variables);
      
      expect(result).toEqual({
        id: 'test-id',
        name: 'Test Name',
        value: 123
      });
    });

    it('should resolve nested variables in objects', () => {
      const variables = { config: { id: 'test-id' } };
      const result = JsonResolver.resolve({
        pluginId: '${config.id}',
        nested: {
          value: '${config.id}'
        }
      }, variables);
      
      expect(result).toEqual({
        pluginId: 'test-id',
        nested: {
          value: 'test-id'
        }
      });
    });

    it('should leave unresolved variables when not found and strict is false', () => {
      const variables = { id: 'test-id' };
      const result = JsonResolver.resolve('${unknown}', variables);
      
      expect(result).toBe('${unknown}');
    });

    it('should throw error when variable not found and strict is true', () => {
      const variables = { id: 'test-id' };
      
      expect(() => {
        JsonResolver.resolve('${unknown}', variables, true);
      }).toThrow('Variable not found: ${unknown}');
    });

    it('should handle null and undefined values', () => {
      const variables = { id: 'test-id' };
      
      expect(JsonResolver.resolve(null, variables)).toBeNull();
      expect(JsonResolver.resolve(undefined, variables)).toBeUndefined();
    });

    it('should handle null variables', () => {
      const result = JsonResolver.resolve('${id}', null);
      
      expect(result).toBe('${id}');
    });

    it('should handle undefined variables', () => {
      const result = JsonResolver.resolve('${id}', undefined);
      
      expect(result).toBe('${id}');
    });

    it('should handle non-string values without modification', () => {
      const variables = { id: 'test-id' };
      
      expect(JsonResolver.resolve(123, variables)).toBe(123);
      expect(JsonResolver.resolve(true, variables)).toBe(true);
      expect(JsonResolver.resolve(false, variables)).toBe(false);
    });

    it('should handle complex nested structures', () => {
      const variables = {
        config: { id: 'test-id' },
        manifest: { target: 'BshTest' }
      };
      const result = JsonResolver.resolve({
        plugin: '${config.id}',
        target: '${manifest.target}',
        items: [
          { id: '${config.id}-1' },
          { id: '${config.id}-2' }
        ]
      }, variables);
      
      expect(result).toEqual({
        plugin: 'test-id',
        target: 'BshTest',
        items: [
          { id: 'test-id-1' },
          { id: 'test-id-2' }
        ]
      });
    });
  });
});

