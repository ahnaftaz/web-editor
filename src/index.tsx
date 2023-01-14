import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { OnChange, OnMount } from '@monaco-editor/react';
import baseHTML from './components/base-output';
import 'bulmaswatch/darkly/bulmaswatch.min.css';
import transpile from './transpiler';
import Box from './components/Box';
import Editor from './components/Editor';

const App = () => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [input, setInput] = useState('');

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
  const handleTranspileClick = async () => {
    if (!iframe.current || !iframe.current.contentWindow) {
      return;
    }

    // reset the iframe window before each code run to remove any changes to page
    iframe.current.srcdoc = baseHTML;

    const transpiledCode = await transpile(input);
    // communicating all code through messages to maintain no relation between parent child
    iframe.current.contentWindow.postMessage(transpiledCode, '*');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', }}>
      <div className='main-header'>
        <h1 className='title is-3' style={{ margin: '10px' }}>
          Online JS Editor
        </h1>
      </div>
      <Box direction='s'>
        <div className='main-content-area' style={{ height: '100%', display: 'flex' }}>
          <div className='editor-area' style={{ height: "100%", width: 'calc(100% - 13px)', display: 'flex', flexDirection: 'column'}}>
            {/* <Box direction='e'> */}
              <div className='main-content-area' style={{ height: '100%', display: 'flex' }}>
                <Editor onChange={handleEditorChange} onMount={handleMount} />
              </div>
            {/* </Box> */}
          </div>
          <div className='iframe-zone' style={{  width: '100%', height: '100%', }}>
            {/* <Box direction='w'> */}
              <iframe
                style={{ backgroundColor: "white"}}
                height='100%'
                width='100%'
                ref={iframe}
                title='code-result' 
                sandbox='allow-scripts'
                srcDoc={baseHTML}
              />
            {/* </Box> */}
          </div>
        </div>
      </Box>
      <div style={{ display: 'relative' }}>
        <button className='button is-primary' onClick={handleTranspileClick}>Run!</button>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
