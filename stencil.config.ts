import { Config } from '@stencil/core';

const ExternalId = 'external';
const dynamiclPluginsToExclude = ['fs', 'zlib', 'https', 'canvas', 'http', 'url'];

export default function replaceNoopModules() {
  return {
    name: 'replace-nooop-modules',
    resolveId(source: string) {
      if (dynamiclPluginsToExclude.includes(source.replace('\x00', '').replace('?commonjs-proxy', ''))) {
        console.log('resolveId:' + source + '. Return as External.');
        return { id: ExternalId, external: false };
      }

      return null;
    },
    load(id: string) {
      if (id === ExternalId) {
        // Replace with actual polyfill
        return `const Empty = {};
                export default Empty;`;
      }

      return null;
    },
  };
}

export const config: Config = {
  namespace: 'pdf-viewer',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  rollupPlugins: {
    before: [replaceNoopModules()],
  },
};
