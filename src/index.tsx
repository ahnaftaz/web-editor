import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { unpkgPathPlugin } from './plugins/unpkg-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

const App = () => {
  const iframe = useRef<any>();
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
      wasmURL: '/esbuild.wasm'
    });
    setBuildService(service);
  };

  // Assigned to button to send a service req to esbuild
  const initiateTranspiling = async () => {
    if (!mainBuildService) {
      return;
    }

    // reset the iframe window before each code run to remove any changes to page
    iframe.current.srcdoc = html;

    // begin building file to pull in any imported libraries
    // using the unpkg path plugin instead of the default
    const result = await mainBuildService.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      // plugin to handle path resolution and api request
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: { 'process.env.NODE_ENV': '"production"' },
    });

    // 
    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, "*");
  };

  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (e) => {
            try{
              eval(e.data);
            } catch (err) {
              const root = document.querySelector('#root');
              root.innerHTML = '<h2 style="color:orange">Runtime Error!</h2><div>' + err + '</div>';
            }
          }, false);
        </script>
      </body>
    </html>
  `;

  return (
    <div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)}></textarea>
      <div>
        <button onClick={initiateTranspiling}>Transpile!</button>
      </div>
      <iframe ref={iframe} title='code-result' sandbox='allow-scripts' srcDoc={html} />
    </div>
  )
};


ReactDOM.render(<App />, document.querySelector("#root"));
