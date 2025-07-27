import React from 'react';

const FileTransfer: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <iframe
        src="https://drop.lol"
        style={{ flex: 1, border: 'none' }}
        title="File Transfer"
      />
    </div>
  );
};

export default FileTransfer;
