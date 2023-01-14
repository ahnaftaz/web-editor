import { ResizableBox, ResizableBoxProps } from 'react-resizable';
import '../styles/box.css';

interface BoxProps {
  direction: 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne';
  children: React.ReactNode;
}

const Box = ({ direction, children }: BoxProps) => {
  let resiseableProps: ResizableBoxProps;

  if (direction === 's') {
    resiseableProps = {
      maxConstraints: [Infinity, window.innerHeight * 0.8],
      height: window.innerHeight * 0.5,
      width: Infinity,
      resizeHandles: [direction],
      minConstraints: [Infinity, window.innerHeight * 0.2],
    };
  } else {
    resiseableProps = {
      maxConstraints: [window.innerWidth * 0.8, Infinity],
      width: window.innerWidth * 0.5,
      height: window.innerHeight * 0.5,
      resizeHandles: [direction],
      minConstraints: [window.innerWidth * 0.3, Infinity],
    };
  }

  return <ResizableBox {...resiseableProps}>{children}</ResizableBox>;
};

export default Box;
