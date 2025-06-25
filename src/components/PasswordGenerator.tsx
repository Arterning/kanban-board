import { useState } from 'react';

function PasswordGenerator() {
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);
  const [password, setPassword] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generatePassword = () => {
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let chars = letters;
    if (includeNumbers) chars += numbers;
    if (includeSpecialChars) chars += specialChars;

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      generatedPassword += chars[randomIndex];
    }

    setPassword(generatedPassword);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">密码生成器</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-white">
            密码长度: {length}
          </label>
          <input
            type="range"
            min="6"
            max="32"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="form-checkbox h-5 w-5 text-rose-500"
            />
            包含数字
          </label>

          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={includeSpecialChars}
              onChange={(e) => setIncludeSpecialChars(e.target.checked)}
              className="form-checkbox h-5 w-5 text-rose-500"
            />
            包含特殊字符
          </label>
        </div>

        <button
          onClick={generatePassword}
          className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors w-fit"
        >
          生成密码
        </button>

        {password && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-white">生成的密码：</label>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  copySuccess 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {copySuccess ? '已复制！' : '复制'}
              </button>
            </div>
            <div className="w-full p-4 rounded-lg bg-columnBackgroundColor text-white border border-columnBackgroundColor">
              {password}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PasswordGenerator;