import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

function SvgEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const svg = useLiveQuery(() => id ? db.svgs.get(id) : undefined, [id]);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (svg) {
      setName(svg.name);
      setType(svg.type);
      setCode(svg.code);
    }
  }, [svg]);

  const handleSave = () => {
    if (id) {
      db.svgs.update(id, { name, type, code });
      navigate('/svg');
    }
  };

  if (!svg) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-4">
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code</label>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 bg-columnBackgroundColor block w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
          />
        </div>
        <button onClick={handleSave} className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">
          Save
        </button>
      </div>
      <div className="w-1/2 p-4">
        <h2 className="text-lg font-semibold mb-2">Preview</h2>
        <div className="w-full h-full flex items-center justify-center bg-columnBackgroundColor" dangerouslySetInnerHTML={{ __html: code }}></div>
      </div>
    </div>
  );
}

export default SvgEditor;
