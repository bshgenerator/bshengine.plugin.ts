# @bshsolutions/engine-plugin

Tools for managing BSH Engine plugins

## Usage

```ts
import { installPlugin } from '@bshsolutions/engine-plugin';

await installPlugin({
  host: '<host>',
  apiKey: '<api-key>'
}, {
  pluginDir: '<path-to-plugin-dir>'
});
```
