import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

const AESConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');

  const handleEncrypt = () => {
    try {
      const encrypted = CryptoJS.AES.encrypt(input, password).toString();
      setOutput(encrypted);
    } catch (error) {
      setOutput('Error encrypting with AES.');
    }
  };

  const handleDecrypt = () => {
    try {
      const decrypted = CryptoJS.AES.decrypt(input, password).toString(CryptoJS.enc.Utf8);
      if (decrypted) {
        setOutput(decrypted);
      } else {
        setOutput('Error decrypting from AES. Make sure the input and password are correct.');
      }
    } catch (error) {
      setOutput('Error decrypting from AES. Make sure the input and password are correct.');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4 text-white">AES Encryptor/Decryptor</h2>
      <div className="mb-4">
        <input
          type="password"
          className="w-full p-2 border rounded bg-columnBackgroundColor text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password here"
        />
      </div>
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
            placeholder="Result"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleEncrypt}
        >
          AES Encrypt
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleDecrypt}
        >
          AES Decrypt
        </button>
      </div>
    </div>
  );
};

export default AESConverter;
