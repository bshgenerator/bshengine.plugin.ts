import { PluginException } from '../errors';
import type { PluginRequest, PluginWrapper, BshEngineConfig } from '../types';
import { PluginDiscovery } from './discovery';
import { PluginParser } from './parser';
import { PluginDependency } from './dependency';
import { PluginInstaller } from './installer';

/**
 * Plugin manager that orchestrates the plugin installation pipeline
 */
export class PluginManager {
  private discovery: PluginDiscovery;
  private parser: PluginParser;
  private dependencyCheck: PluginDependency;
  private installer: PluginInstaller;

  constructor(config: BshEngineConfig) {
    this.discovery = new PluginDiscovery();
    this.parser = new PluginParser();
    this.dependencyCheck = new PluginDependency();
    this.installer = new PluginInstaller(config);
  }

  async manage(request: PluginRequest): Promise<void> {
    try {
      // 1. Discovery: Find plugin files
      // Write the discovered plugin paths to a file for review
      const paths = await this.discovery.discover(request);
      const fs = await import('fs/promises');

      // 2. Parsing: Parse plugin structure
      const wrapper = this.parser.parse(paths);

      // 3. Dependency Check: Validate dependencies
      this.dependencyCheck.check(wrapper.contentMap);

      // 4. Installation: Install plugin content
      await this.installer.install(wrapper);
    } catch (error) {
      if (error instanceof PluginException || error instanceof Error) {
        throw error;
      }
      throw new PluginException(
        error instanceof Error ? error : new Error(String(error)),
        500
      );
    }
  }
}

