import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { unpkgPathPlugin } from './plugins/unpkg-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

const App = () => {
  const refToService = useRef<any>();
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');

  // Prepares app for processing transpile requests
  useEffect(() => {
    startService();
  }, []);

  // async start of webapp and assign to ref to avoid restarts
  const startService = async () => {
    // esbuild binary (web assembly) located in public folder
    // of app to run directly on browser
    refToService.current = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm'
    });
  };

  // Assigned to button to send a service req to esbuild
  const initiateTranspiling = async () => {
    if (!refToService.current) {
      return;
    }
  
    // begin building file to pull in any imported libraries
    // using the unpkg path plugin instead of the default
    const result = await refToService.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      // free easy plugins!
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: { 'process.env.NODE_ENV': '"production"' },
    });

    setCode(result.outputFiles[0].text);
  };

  return (
    <div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)}></textarea>
      <div>
        <button onClick={initiateTranspiling}>Transpile!</button>
      </div>
      <pre>{code}</pre>
    </div>
  )
};

ReactDOM.render(<App />, document.querySelector("#root"));
