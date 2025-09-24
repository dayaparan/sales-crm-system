import { useState } from "react";

export default function FilterSlider({ min, max, value, onChange }) {
  const [range, setRange] = useState(value);

  const handleChange = (e) => {
    const val = Number(e.target.value);
    setRange(val);
    onChange(val);
  };

  return (
    <div className="relative w-full">
      <input
        type="range"
        min={min}
        max={max}
        value={range}
        onChange={handleChange}
        className="w-full appearance-none h-1 bg-gray-300 rounded-lg outline-none slider-thumb"
      />
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 15px;
          height: 15px;
          background: red;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
