import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

const SHA256Hasher: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleHash = () => {
    try {
      const hashed = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
      setOutput(hashed);
    } catch (error) {
      setOutput('Error generating SHA-256 hash.');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4 text-white">SHA-256 Hash Generator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <textarea
            className="w-full h-64 p-2 border rounded bg-columnBackgroundColor text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text here"
          />
        </div>
        <div>
          <textarea
            className="w-full h-64 p-2 border rounded bg-columnBackgroundColor text-white"
            value={output}
            readOnly
            placeholder="SHA-256 Hash"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleHash}
        >
          Generate SHA-256 Hash
        </button>
      </div>
    </div>
  );
};

export default SHA256Hasher;
