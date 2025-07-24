import { useState, useEffect, useMemo } from "react";

const LIFE_EXPECTANCY = 75;

const STAGES = [
  { name: "Infancy", start: 0, end: 3, color: "bg-green-200" },
  { name: "Childhood", start: 4, end: 10, color: "bg-green-300" },
  { name: "Adolescence", start: 11, end: 20, color: "bg-green-400" },
  { name: "Early Adulthood", start: 21, end: 40, color: "bg-yellow-400" },
  { name: "Midlife", start: 41, end: 50, color: "bg-orange-400" },
  { name: "Mature Adulthood", start: 51, end: LIFE_EXPECTANCY, color: "bg-red-500" },
];

const LifeProgress = () => {
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"progressbar" | "grid">(
    "progressbar"
  );
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const savedBirthDate = localStorage.getItem("birthDate");
    if (savedBirthDate) {
      setBirthDate(savedBirthDate);
    }
  }, []);

  const handleSaveBirthDate = () => {
    if (inputValue) {
      localStorage.setItem("birthDate", inputValue);
      setBirthDate(inputValue);
    }
  };

  const { age, daysPassed, totalDays, currentStage } = useMemo(() => {
    if (!birthDate) {
      return { age: 0, daysPassed: 0, totalDays: 0, currentStage: null };
    }
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInYears = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const daysPassed = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalDaysInLife = LIFE_EXPECTANCY * 365;
    const stage = STAGES.find(s => ageInYears >= s.start && ageInYears <= s.end) || null;

    return { age: ageInYears, daysPassed, totalDays: totalDaysInLife, currentStage: stage };
  }, [birthDate]);

  if (!birthDate) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-800 text-white">
        <h2 className="text-2xl mb-4">Enter Your Birth Date</h2>
        <input
          type="date"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
        <button
          onClick={handleSaveBirthDate}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
        >
          Save
        </button>
      </div>
    );
  }

  const renderProgressBar = () => (
    <div className="w-full p-4">
        <div className="text-center mb-4">
            <p>Your life is {((age / LIFE_EXPECTANCY) * 100).toFixed(2)}% complete.</p>
            {currentStage && <p>You are in the <span className={`font-bold ${currentStage.color.replace('bg-', 'text-')}`}>{currentStage.name}</span> stage.</p>}
        </div>
      <div className="flex w-full h-8 bg-gray-700 rounded overflow-hidden">
        {STAGES.map((stage) => {
          const stageDuration = stage.end - stage.start;
          const width = `${(stageDuration / LIFE_EXPECTANCY) * 100}%`;
          const progressWithinStage = Math.max(0, Math.min(1, (age - stage.start) / stageDuration));
          
          return (
            <div key={stage.name} style={{ width }} className="h-full relative">
              <div className={`h-full ${stage.color} opacity-50`}></div>
              {progressWithinStage > 0 && (
                <div
                  style={{ width: `${progressWithinStage * 100}%` }}
                  className={`h-full ${stage.color} absolute top-0 left-0`}
                ></div>
              )}
               <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-black">
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGrid = () => {
    const getDayColor = (dayIndex: number) => {
        const year = Math.floor(dayIndex / 365);
        const stage = STAGES.find(s => year >= s.start && year <= s.end);
        return stage ? stage.color : 'bg-gray-700';
    }

    return (
        <div className="p-4">
             <div className="text-center mb-4">
                <p>Each box represents one day of your life. There are {totalDays - daysPassed} days left.</p>
            </div>
            <div className="grid grid-cols-30 gap-1" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
                {Array.from({ length: totalDays }, (_, i) => (
                <div
                    key={i}
                    className={`w-2 h-2 rounded-sm ${
                    i < daysPassed ? getDayColor(i) : "bg-gray-700"
                    }`}
                    title={`Year ${Math.floor(i / 365) + 1}, Day ${i % 365 + 1}`}
                ></div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Life Progress</h1>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setViewMode("progressbar")}
          className={`px-4 py-2 rounded-l ${
            viewMode === "progressbar" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Progress Bar
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`px-4 py-2 rounded-r ${
            viewMode === "grid" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Grid
        </button>
      </div>
      {viewMode === "progressbar" ? renderProgressBar() : renderGrid()}
       <div className="mt-6 text-center">
        <button
            onClick={() => {
                localStorage.removeItem("birthDate");
                setBirthDate(null);
                setInputValue('');
            }}
            className="text-sm text-gray-400 hover:text-white"
        >
            Reset Birth Date
        </button>
      </div>
    </div>
  );
};

export default LifeProgress;
