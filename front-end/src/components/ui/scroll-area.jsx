import React from 'react';
// import Sidebar from '../blocs/Sidebar';

const ScrollArea = ({children, className}) => {
  return (
    <div className={`${className} sm:overflow-x-auto sm:custom-scroll overflow-y-auto custom-scroll border rounded-lg`}>
        {children}
    </div>
  );
}

export default ScrollArea;
