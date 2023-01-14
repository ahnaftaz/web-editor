import * as esbuild from 'esbuild-wasm';
import { pathResolvePlugin } from './plugins/path-resolution-plugin';
import { moduleRequestPlugin } from './plugins/module-request-plugin';

let mainService: esbuild.Service;
const transpile = async (input: string) => {
  if (!mainService) {
    mainService = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  }


  // begin building file with all modules using custom plugins
  const result = await mainService.build({
    entryPoints: ['index.js'],
    bundle: true,
    write: false,
    // plugin to handle path resolution and api request
    plugins: [pathResolvePlugin(), moduleRequestPlugin(input)],
    define: { 'process.env.NODE_ENV': '"production"' },
  });

  return result.outputFiles[0].text;
}

export default transpile;
