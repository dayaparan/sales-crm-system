import { useState } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
const DateFilter = ({ title, setDate, values }) => {
  const [value, setValue] = useState({
    startDate: values.startDate || '',
    endDate: values.endDate || '',
  });

  const handleValueChange = (newValue) => {
    setValue(newValue);
    setDate(newValue);
  };
  return (
    <div className="flex justify-between flex-wrap items-center ">
      {/* <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">{title}</h4> */}
      <div className="flex ">
        <div className="date-range-custom relative">
          <Datepicker value={value} inputClassName="input-class" containerClassName="container-class" onChange={handleValueChange} />
        </div>
      </div>
    </div>
  );
};

export default DateFilter;