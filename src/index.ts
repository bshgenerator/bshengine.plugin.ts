/**
 * BSH Plugin Tools
 * 
 * A package for managing BSH Engine plugins
 */

export { installPlugin } from './api/index';
export {
  PluginManager,
  PluginDiscovery,
  PluginParser,
  PluginDependency,
  BasePluginInstaller,
  PluginInstaller,
} from './core/index';
export { JsonResolver, createPluginContent, createPluginPath, MANIFEST_FILE, CONFIG_FILE } from './utils/index';
export { PluginException } from './errors/index';
export type {
  BshEngineConfig,
  PluginRequest,
  PluginConfig,
  PluginManifest,
  PluginPath,
  PluginContent,
  PluginWrapper,
  InstallOptions,
  CleanOptions,
} from './types/index';
