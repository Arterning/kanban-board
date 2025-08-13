import React, { useState } from 'react';

const UrlConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
    } catch (error) {
      setOutput('Error encoding URL.');
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (error) {
      setOutput('Error decoding URL. Make sure the input is a valid URL encoded string.');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4 text-white">URL Encoder/Decoder</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <textarea
            className="w-full h-64 p-2 border rounded bg-columnBackgroundColor text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter URL or text here"
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
          onClick={handleEncode}
        >
          URL Encode
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleDecode}
        >
          URL Decode
        </button>
      </div>
    </div>
  );
};

export default UrlConverter;
