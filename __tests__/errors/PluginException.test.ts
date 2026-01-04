import { describe, it, expect } from 'vitest';
import { PluginException } from '../../src/errors';

describe('PluginException', () => {
  it('should create an exception with a message and status', () => {
    const error = new PluginException('Test error', 404);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PluginException);
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.name).toBe('PluginException');
  });

  it('should default status to 500', () => {
    const error = new PluginException('Test error');
    
    expect(error.status).toBe(500);
  });

  it('should accept an Error instance as message', () => {
    const originalError = new Error('Original error');
    const error = new PluginException(originalError, 400);
    
    expect(error.message).toBe('Original error');
    expect(error.status).toBe(400);
    expect(error.stack).toBeDefined();
  });

  it('should preserve stack trace from Error instance', () => {
    const originalError = new Error('Original error');
    originalError.stack = 'Error: Original error\n    at test.js:1:1';
    const error = new PluginException(originalError, 400);
    
    expect(error.stack).toBe(originalError.stack);
  });
});

