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
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const savedBirthDate = localStorage.getItem("birthDate");
    if (savedBirthDate) {
      setBirthDate(savedBirthDate);
    }
  }, []);

  const { age, daysPassed, totalDays, currentStage, birthYear } = useMemo(() => {
    if (!birthDate) {
      return { age: 0, daysPassed: 0, totalDays: 0, currentStage: null, birthYear: 0 };
    }
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInYears = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const daysPassed = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalDaysInLife = LIFE_EXPECTANCY * 365;
    const stage = STAGES.find(s => ageInYears >= s.start && ageInYears <= s.end) || null;

    return { age: ageInYears, daysPassed, totalDays: totalDaysInLife, currentStage: stage, birthYear: birth.getFullYear() };
  }, [birthDate]);

  useEffect(() => {
    // On birthdate change, reset the calendar to the current actual year
    setDisplayYear(new Date().getFullYear());
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
          onClick={() => {
            if (inputValue) {
              localStorage.setItem("birthDate", inputValue);
              setBirthDate(inputValue);
            }
          }}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
        >
          Save
        </button>
      </div>
    );
  }

  const renderProgressBar = () => {
    const totalProgress = (age / LIFE_EXPECTANCY) * 100;
    const progressColor = currentStage ? currentStage.color : 'bg-gray-500';

    return (
        <div className="w-full p-4">
            <div className="text-center mb-4">
                <p>Your life is {totalProgress.toFixed(2)}% complete.</p>
                {currentStage && <p>You are in the <span className={`font-bold ${currentStage.color.replace('bg-', 'text-')}`}>{currentStage.name}</span> stage.</p>}
            </div>
            <div className="w-full h-8 bg-gray-700 rounded overflow-hidden relative">
                <div
                    style={{ width: `${totalProgress}%` }}
                    className={`h-full ${progressColor} transition-width duration-500 ease-in-out progress-bar-animated`}
                ></div>
                <span 
                    className="absolute top-0 bottom-0 flex items-center justify-center text-xl animate-ping"
                    style={{ left: `${totalProgress}%`, transform: 'translateX(-50%)' }}
                 >
                    ❤️
                 </span>
            </div>
            <div className="flex w-full mt-4 text-xs rounded overflow-hidden">
                {STAGES.map((stage) => {
                    const stageWidth = ((stage.end - stage.start) / LIFE_EXPECTANCY) * 100;
                    return (
                        <div key={stage.name} style={{ width: `${stageWidth}%` }} className="text-center">
                            <div className={`h-2 ${stage.color} opacity-75`}></div>
                            <p className="mt-1">{stage.name}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  }

  const renderGrid = () => {
    const birthD = new Date(birthDate!);
    const months = Array.from({ length: 12 }, (_, i) => i);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const getDayColor = (dayIndex: number) => {
        const year = Math.floor(dayIndex / 365.25);
        const stage = STAGES.find(s => year >= s.start && year <= s.end);
        return stage ? stage.color : 'bg-gray-700';
    }

    return (
        <div className="p-4">
            <div className="flex justify-center items-center gap-4 mb-4">
                <button onClick={() => setDisplayYear(y => y - 1)} disabled={displayYear <= birthYear} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded disabled:bg-gray-600">
                    Prev Year
                </button>
                <div className="text-center">
                    <p className="text-xl font-bold">Year {displayYear - birthYear + 1} ({displayYear})</p>
                    <p>Each box is one day. {totalDays - daysPassed > 0 ? totalDays - daysPassed : 0} days left.</p>
                </div>
                <button onClick={() => setDisplayYear(y => y + 1)} disabled={displayYear >= birthYear + LIFE_EXPECTANCY -1} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded disabled:bg-gray-600">
                    Next Year
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {months.map((monthIndex) => {
                    const daysInMonth = new Date(displayYear, monthIndex + 1, 0).getDate();
                    const firstDayOfMonth = new Date(displayYear, monthIndex, 1);
                    const startingDayOfWeek = firstDayOfMonth.getDay(); // Sunday = 0, Monday = 1, etc.

                    const monthGrid = [];
                    // Add blank days for the first week
                    for (let i = 0; i < startingDayOfWeek; i++) {
                        monthGrid.push(<div key={`blank-${i}`} className="w-3 h-3"></div>);
                    }

                    for (let dayIndexInMonth = 1; dayIndexInMonth <= daysInMonth; dayIndexInMonth++) {
                        const currentDate = new Date(displayYear, monthIndex, dayIndexInMonth);
                        const absoluteDayIndex = Math.floor((currentDate.getTime() - birthD.getTime()) / (1000 * 60 * 60 * 24));
                        
                        monthGrid.push(
                            <div
                                key={dayIndexInMonth}
                                className={`w-3 h-3 rounded-sm ${
                                    absoluteDayIndex >= 0 && absoluteDayIndex < daysPassed ? getDayColor(absoluteDayIndex) : "bg-gray-600"
                                }`}
                                title={`Date: ${monthIndex + 1}/${dayIndexInMonth}/${displayYear}`}
                            ></div>
                        );
                    }

                    return (
                        <div key={monthIndex} className="p-2 bg-gray-800 rounded-lg">
                            <h3 className="text-lg font-semibold text-center mb-2">{monthNames[monthIndex]}</h3>
                            <div className="grid grid-cols-7 gap-1">
                                {monthGrid}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">逝者如斯夫，不舍昼夜</h1>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setViewMode("progressbar")}
          className={`px-4 py-2 rounded-l ${
            viewMode === "progressbar" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          人生进度条
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`px-4 py-2 rounded-r ${
            viewMode === "grid" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          人生日历
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
