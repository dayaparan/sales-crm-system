"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Sample events data
const sampleEvents = [
  {
    id: "1",
    title: "Meeting • 3PM",
    date: new Date(2025, 9, 13),
    color: "yellow",
  },
  {
    id: "2",
    title: "Project Review",
    date: new Date(2025, 7, 22),
    color: "blue",
  },
  {
    id: "3",
    title: "Team Lunch",
    date: new Date(2025, 8, 28),
    color: "green",
  },
];

function Calender() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState(sampleEvents);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const dayNames = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const getEventsForDay = (day) =>
    events.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
    );

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    console.log("Selected date:", selectedDate);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth });

  const eventColorClasses = {
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  return (
        <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] rounded-lg shadow-2xl p-6 text-white mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-[#D4AF37] capitalize">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth("prev")}
                className="hover:bg-white/10 text-white border-white/20 p-2 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigateMonth("next")}
                className="hover:bg-white/10 text-white border-white/20 p-2 rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={goToToday}
                className="ml-2 bg-transparent border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400 px-4 py-2 rounded"
              >
                TODAY
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="text-center py-3 text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square p-2" />
            ))}

            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const today = isToday(day);

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 relative ${
                    today ? "bg-blue-600/30 ring-2 ring-blue-400" : ""
                  }`}
                >
                  <div className={`text-center text-sm font-medium mb-1 ${today ? "text-white" : "text-gray-300"}`}>
                    {day}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-2 py-1 rounded-md text-black font-medium truncate ${eventColorClasses[event.color]}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-400 px-2">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/5 to-white/10" />
                </div>
              );
            })}
          </div>
        </div>
  );
}

export default Calender