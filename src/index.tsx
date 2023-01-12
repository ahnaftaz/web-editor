import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { pathResolvePlugin } from './plugins/path-resolution-plugin';
import { moduleRequestPlugin } from './plugins/module-request-plugin';
import MonacoEditor, { OnChange, OnMount } from '@monaco-editor/react';
import baseHTML from './components/base-output';
import 'bulmaswatch/cyborg/bulmaswatch.min.css';

const App = () => {
  const iframe = useRef<HTMLIFrameElement>(null);
  // const highlighter = useRef<any>(null);
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
  const handleMount: OnMount = (monaco) => {
    monaco.getModel()?.updateOptions({ tabSize: 2 });
  };

  // Assigned to button to send a service req to esbuild
  const initiateTranspiling = async () => {
    if (!mainBuildService || !iframe.current || !iframe.current.contentWindow) {
      return;
    }

    // reset the iframe window before each code run to remove any changes to page
    iframe.current.srcdoc = baseHTML;

    // begin building file with all modules using custom plugins
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
    <div className='columns'>
      <div className='column'>
        <h1 className='title is-3'>Online Js editor</h1>
        <MonacoEditor
          theme='vs-dark'
          height='300px'
          defaultLanguage='javascript'
          defaultValue='/* Use "print()" to show items in the result widow */'
          options={{
            wordWrap: 'on',
            minimap: { enabled: false },
            lineNumbersMinChars: 3,
            folding: false,
            fontSize: 16,
            automaticLayout: true,
          }}
          onChange={handleEditorChange}
          onMount={handleMount}
        />
        <button className='button is-primary' onClick={initiateTranspiling}>
          Transpile!
        </button>
      </div>
      <div className='column box'>
        <iframe
          width={'500px'}
          ref={iframe}
          title='code-result'
          sandbox='allow-scripts'
          srcDoc={baseHTML}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
