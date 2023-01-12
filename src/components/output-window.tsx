import baseHTML from './base-output';
import { useRef, useEffect } from 'react';

interface OutputProps {
  transpiledCode: string;
}

const OutputWindow = ({ transpiledCode }: OutputProps) => {
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframe.current || !iframe.current.contentWindow) {
      return;
    }
    // reset the iframe window before each code run to remove any changes to page
    iframe.current.srcdoc = baseHTML;
    
    // communicating all code through messages to maintain no relation between parent child
    iframe.current.contentWindow.postMessage(transpiledCode, '*');
  }, [transpiledCode]);

  return (
    <iframe
      width={'500px'}
      ref={iframe}
      title='code-result'
      sandbox='allow-scripts'
      srcDoc={baseHTML}
    />
  );
};

export default OutputWindow;