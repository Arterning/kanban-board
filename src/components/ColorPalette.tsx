import { useState } from 'react';

interface ColorScheme {
  name: string;
  colors: string[];
}

const colorSchemes: ColorScheme[] = [
  {
    name: '现代简约',
    colors: ['#2D3250', '#424769', '#7077A1', '#F6B17A'],
  },
  {
    name: '自然清新',
    colors: ['#7D7C7C', '#DEE2E6', '#91C8E4', '#749BC2'],
  },
  {
    name: '活力橙粉',
    colors: ['#F6E1C3', '#E9A178', '#A84448', '#7A3E65'],
  },
  {
    name: '深邃蓝调',
    colors: ['#1B262C', '#0F4C75', '#3282B8', '#BBE1FA'],
  },
  {
    name: '森林绿意',
    colors: ['#CEDEBD', '#9EB384', '#435334', '#183D3D'],
  },
];

function ColorPalette() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');

  const handleColorClick = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-6">调色板</h1>
      <div className="mb-8">
        <label className="text-white mr-4">选择颜色:</label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="cursor-pointer"
        />
        <span className="text-white ml-4">当前选择: {selectedColor}</span>
      </div>
      <div className="space-y-8">
        {colorSchemes.map((scheme) => (
          <div key={scheme.name} className="bg-columnBackgroundColor rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{scheme.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {scheme.colors.map((color) => (
                <div
                  key={color}
                  className="relative group"
                  onClick={() => handleColorClick(color)}
                >
                  <div
                    className="h-24 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                      {copiedColor === color ? '已复制！' : color}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColorPalette;