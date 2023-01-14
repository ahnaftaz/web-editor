import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localforage from 'localforage';

const localCache = localforage.createInstance({
  name: 'filecache',
});

export const moduleRequestPlugin = (input: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: input,
        };
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // Return item without request if already present in cache
        const cachedResult = await localCache.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (cachedResult) {
          return cachedResult;
        }
      });

      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        // Return new object containing path to follow for onload process
        const { data, request } = await axios.get(args.path);

        const cleanedData = data
          .replace(/\n/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");
        const contents = `
          const style = document.createElement('style');
          style.innerText = '${cleanedData}';
          document.head.appendChild(style);
        `;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await localCache.setItem(args.path, result);

        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // Return new object containing path to follow for onload process
        const { data, request } = await axios.get(args.path);
    
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await localCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
