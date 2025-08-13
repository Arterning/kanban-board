import React, { useState } from 'react';
import { JSEncrypt } from 'jsencrypt';

const RSAConverter: React.FC = () => {
  const [privateKey, setPrivateKey] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [textToEncrypt, setTextToEncrypt] = useState<string>('');
  const [encryptedText, setEncryptedText] = useState<string>('');
  const [textToDecrypt, setTextToDecrypt] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateKeys = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const crypt = new JSEncrypt({ default_key_size: 2048 });
      setPrivateKey(crypt.getPrivateKey());
      setPublicKey(crypt.getPublicKey());
      setIsGenerating(false);
    }, 6);
  };

  const handleEncrypt = () => {
    if (!publicKey || !textToEncrypt) {
      alert('Please generate keys and enter text to encrypt.');
      return;
    }
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encrypted = encrypt.encrypt(textToEncrypt);
    if (encrypted) {
      setEncryptedText(encrypted);
    } else {
      alert('Encryption failed.');
    }
  };

  const handleDecrypt = () => {
    if (!privateKey || !textToDecrypt) {
      alert('Please generate keys and enter text to decrypt.');
      return;
    }
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    const decrypted = decrypt.decrypt(textToDecrypt);
    if (decrypted) {
      setDecryptedText(decrypted);
    } else {
      alert('Decryption failed.');
    }
  };

  return (
    <div className="container mx-auto p-8 text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">RSA Encryption/Decryption</h2>
      
      <div className="text-center mb-6">
        <button
          onClick={handleGenerateKeys}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-400"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate 2048-bit RSA Key Pair'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">Public Key</h3>
          <textarea
            value={publicKey}
            readOnly
            className="w-full h-40 p-2 border rounded bg-gray-800 text-gray-300"
            placeholder="Your public key will appear here..."
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Private Key</h3>
          <textarea
            value={privateKey}
            readOnly
            className="w-full h-40 p-2 border rounded bg-gray-800 text-gray-300"
            placeholder="Your private key will appear here..."
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Encryption Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Encryption</h3>
          <textarea
            onChange={(e) => setTextToEncrypt(e.target.value)}
            className="w-full h-32 p-2 border rounded bg-gray-800 text-gray-300"
            placeholder="Enter text to encrypt"
          />
          <button
            onClick={handleEncrypt}
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Encrypt
          </button>
          <textarea
            value={encryptedText}
            readOnly
            className="w-full h-32 p-2 mt-4 border rounded bg-gray-800 text-gray-300"
            placeholder="Encrypted text"
          />
        </div>

        {/* Decryption Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Decryption</h3>
          <textarea
            onChange={(e) => setTextToDecrypt(e.target.value)}
            className="w-full h-32 p-2 border rounded bg-gray-800 text-gray-300"
            placeholder="Enter text to decrypt"
          />
          <button
            onClick={handleDecrypt}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Decrypt
          </button>
          <textarea
            value={decryptedText}
            readOnly
            className="w-full h-32 p-2 mt-4 border rounded bg-gray-800 text-gray-300"
            placeholder="Decrypted text"
          />
        </div>
      </div>
    </div>
  );
};

export default RSAConverter;
