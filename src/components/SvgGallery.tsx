import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Link } from 'react-router-dom';

function SvgGallery() {
  const svgs = useLiveQuery(() => db.svgs.toArray(), []);

  const addSampleSvg = () => {
    const id = crypto.randomUUID();
    db.svgs.add({
      id,
      name: 'New SVG',
      type: 'Icon',
      code: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="pink" /></svg>'
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">SVG Gallery</h1>
        <button onClick={addSampleSvg} className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded">
          Add New SVG
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {svgs?.map((svg) => (
          <div key={svg.id} className="border rounded-lg p-4 shadow-lg">
            <div className="w-32 h-32 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svg.code }}></div>
            <div className="mt-2">
              <h2 className="text-lg font-semibold">{svg.name}</h2>
              <p className="text-sm text-gray-500">{svg.type}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link to={`/svg/${svg.id}`} className="text-blue-500 hover:text-blue-700 mr-2">Edit</Link>
              <button onClick={() => db.svgs.delete(svg.id)} className="text-red-500 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SvgGallery;
