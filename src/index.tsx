import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { OnChange, OnMount } from '@monaco-editor/react';
import baseHTML from './components/base-output';
import 'bulmaswatch/darkly/bulmaswatch.min.css';
import './styles/main-style.css';
import makeExecutionCode from './components/execution-code';
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
    handleTranspileClick();
  };

  // Assigned to button to send a service req to esbuild
  const handleTranspileClick = async () => {
    if (!iframe.current || !iframe.current.contentWindow) {
      return;
    }

    // reset the iframe window before each code run to remove any changes to page
    iframe.current.srcdoc = baseHTML;

    const transpiledCode = await makeExecutionCode(input);

    // communicate only through messages so no relation between parent/ child window
    iframe.current.contentWindow.postMessage(transpiledCode, '*');
  };

  return (
    <div className='main-container'>
      <div className='main-header'>
        {/* <div>    this will be a div for making the language selector*/}
          <h1 className='title is-2 main-title'>
            Online JS Editor
          </h1>
        {/* </div> */}
        <div className='intro-header'>
          Welcome to a simple online code editor! You can test all sorts of code in this
          isolated environment and test how individual components of your code may function!
          This is totally useful! Totally not a pet project!!
        </div>
        <div className='intro-header'>
          You can use the 'print()' function to display items in the preview window
        </div>
      </div>
      <Box direction='s'>
        <div className='main-content-area'>
          <div className='editor-area'>
            <Editor onChange={handleEditorChange} onMount={handleMount} />
          </div>
          <div className='iframe-zone'>
            <iframe
              style={{ backgroundColor: "white" }}
              height='100%'
              width='100%'
              ref={iframe}
              title='code-result' 
              sandbox='allow-scripts'
              srcDoc={baseHTML}
            />
          </div>
        </div>
      </Box>
      <div className='compile-button'>
        <button className='button is-primary' onClick={handleTranspileClick}>Run!</button>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
