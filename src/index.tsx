import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { pathResolvePlugin } from './plugins/path-resolution-plugin';
import { moduleRequestPlugin } from './plugins/module-request-plugin';
import MonacoEditor, { OnChange } from '@monaco-editor/react';
import baseHTML from './components/base-output';

const App = () => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [mainBuildService, setBuildService] = useState<esbuild.Service>();
  const [input, setInput] = useState('');

  // Prepares app for processing transpile requests
  useEffect(() => {
    startService();
  }, []);

  // async start of webapp and assign to ref to avoid restarts
  const startService = async () => {
    // esbuild binary (web assembly) located in public folder
    // of app to run directly on browser
    const service = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm',
    });
    setBuildService(service);
  };

  const handleEditorChange: OnChange = (value) => {
    if (!value) {
      return;
    }
    setInput(value);
  };

  // Assigned to button to send a service req to esbuild
  const initiateTranspiling = async () => {
    if (!mainBuildService || !iframe.current || !iframe.current.contentWindow) {
      return;
    }

    // reset the iframe window before each code run to remove any changes to page
    iframe.current.srcdoc = baseHTML;

    // begin building file to pull in any imported libraries
    // using the unpkg path plugin instead of the default
    const result = await mainBuildService.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      // plugin to handle path resolution and api request
      plugins: [pathResolvePlugin(), moduleRequestPlugin(input)],
      define: { 'process.env.NODE_ENV': '"production"' },
    });

    // communicating all code through messages to maintain no relation between parent child
    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
  };

  return (
    <div style={{display: "flex"}}>
      <MonacoEditor
        height='300px'
        defaultLanguage='javascript'
        defaultValue='/* Use "print()" to show items in the result widow */'
        onChange={handleEditorChange}
      />
      <div>
        <button onClick={initiateTranspiling}>Transpile!</button>
      </div>
      <iframe
        ref={iframe}
        title='code-result'
        sandbox='allow-scripts'
        srcDoc={baseHTML}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
