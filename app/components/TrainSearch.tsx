"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpDown, Calendar, Train, Search, Bookmark, ChevronRight } from "lucide-react";
import type { TrainData } from "@/modules/trains/train.schema";
import { apiSearchTrains } from "../utils/mockData";

interface TrainSearchProps {
  onViewSchedule: (trainNo: string) => void;
  isSunlightMode: boolean;
  savedTrains: string[];
  onToggleSave: (trainNo: string) => void;
}

export default function TrainSearch({
  onViewSchedule,
  isSunlightMode,
  savedTrains,
  onToggleSave,
}: TrainSearchProps) {
  const [fromStation, setFromStation] = useState("NDLS");
  const [toStation, setToStation] = useState("MMCT");
  const [date, setDate] = useState("");
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Set default date to today's date in DD-MM-YYYY
  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    setDate(`${day}-${month}-${year}`);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    setErrorMsg("");

    try {
      const results = await apiSearchTrains(fromStation, toStation, date);
      setTrains(results);
      if (results.length === 0) {
        setErrorMsg("No trains found for this route.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to query train services. Please try again.");
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  // Swap stations handler
  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Helper to render running days list (M T W T F S S)
  const renderRunningDays = (runningDaysStr: string) => {
    const daysLetters = ["M", "T", "W", "T", "F", "S", "S"];
    // runningDays comes as 7-digit binary string e.g. "1111110"
    return (
      <div className="flex gap-1">
        {daysLetters.map((day, idx) => {
          const isRunning = runningDaysStr[idx] === "1";
          return (
            <span
              key={idx}
              className={`text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded font-bold border ${
                isRunning
                  ? isSunlightMode
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-100 text-slate-900 border-slate-100"
                  : "bg-transparent text-slate-400 border-slate-300"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Search Card Form */}
      <form
        onSubmit={handleSearch}
        className={`p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-4 relative transition-colors duration-500 ${
          isSunlightMode
            ? "bg-white border-sky-100 shadow-sky-100/50"
            : "bg-slate-900/40 border-sky-950/40"
        }`}
      >
        <div className="relative flex flex-col gap-2">
          {/* FROM Station input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              FROM STATION
            </label>
            <div className="relative">
              <input
                type="text"
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value.toUpperCase())}
                placeholder="Station Code (e.g. NDLS)"
                className={`w-full px-4 py-3 rounded-xl border-2 font-extrabold text-base tracking-wide uppercase transition-all outline-none ${
                  isSunlightMode
                    ? "bg-sky-50/25 border-sky-100/80 focus:border-primary text-sky-950"
                    : "bg-slate-950 border-sky-950 focus:border-secondary text-sky-100"
                }`}
                required
              />
              <Train className="w-5 h-5 absolute right-4 top-3.5 text-slate-400" />
            </div>
          </div>

          {/* Swap Stations Button */}
          <div className="absolute right-14 top-[50px] z-10">
            <button
              type="button"
              onClick={handleSwap}
              className={`p-2.5 rounded-full border-2 shadow-xs transition-all duration-200 cursor-pointer active:scale-90 ${
                isSunlightMode
                  ? "bg-white text-slate-800 border-sky-100 hover:bg-sky-50 hover:text-primary"
                  : "bg-slate-800 text-slate-100 border-sky-950/60 hover:bg-slate-750 hover:text-secondary"
              }`}
              title="Swap Stations"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* TO Station input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              TO STATION
            </label>
            <div className="relative">
              <input
                type="text"
                value={toStation}
                onChange={(e) => setToStation(e.target.value.toUpperCase())}
                placeholder="Station Code (e.g. MMCT)"
                className={`w-full px-4 py-3 rounded-xl border-2 font-extrabold text-base tracking-wide uppercase transition-all outline-none ${
                  isSunlightMode
                    ? "bg-sky-50/25 border-sky-100/80 focus:border-primary text-sky-950"
                    : "bg-slate-950 border-sky-950 focus:border-secondary text-sky-100"
                }`}
                required
              />
              <Train className="w-5 h-5 absolute right-4 top-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Date picker Input */}
        <div className="flex flex-col">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
            TRAVEL DATE
          </label>
          <div className="relative">
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className={`w-full px-4 py-3 rounded-xl border-2 font-extrabold text-base tracking-wide transition-all outline-none ${
                isSunlightMode
                  ? "bg-sky-50/25 border-sky-100/80 focus:border-primary text-sky-950"
                  : "bg-slate-950 border-sky-950 focus:border-secondary text-sky-100"
              }`}
              required
            />
            <Calendar className="w-5 h-5 absolute right-4 top-3.5 text-slate-400" />
          </div>
        </div>

        {/* Search Submit button (Large tap target for thumb) */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-extrabold tracking-wider uppercase text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer ${
            isSunlightMode
              ? "bg-cta hover:bg-orange-650 text-white shadow-xs shadow-orange-100"
              : "bg-cta hover:bg-orange-650 text-white shadow-md shadow-orange-950/10"
          }`}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Search className="w-5 h-5 stroke-[2.5]" />
              <span>Find Trains</span>
            </>
          )}
        </button>
      </form>

      {/* Results Header */}
      {searched && (
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            Available Services ({trains.length})
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {fromStation} → {toStation}
          </span>
        </div>
      )}

      {/* Train Results List */}
      <div className="flex flex-col gap-3.5 pb-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`h-40 rounded-2xl border-2 animate-pulse ${
                  isSunlightMode ? "bg-white border-sky-100" : "bg-slate-900/30 border-sky-950/40"
                }`}
              />
            ))}
          </div>
        ) : errorMsg ? (
          <div className={`text-center py-10 px-4 border-2 border-dashed rounded-2xl ${
            isSunlightMode ? "border-sky-100 bg-sky-50/10" : "border-sky-950/40 bg-slate-950/20"
          }`}>
            <p className="font-extrabold text-slate-700">{errorMsg}</p>
            <p className="text-xs text-slate-400 mt-1">
              Verify the station codes and try searching again.
            </p>
          </div>
        ) : trains.length > 0 ? (
          trains.map((train) => {
            const isPinned = savedTrains.includes(train.trainNo);
            return (
              <div
                key={train.trainNo}
                className={`rounded-2xl border-2 p-4 flex flex-col gap-3.5 shadow-xs transition-all duration-300 relative ${
                  isSunlightMode
                    ? "bg-white border-sky-100 hover:border-primary hover:shadow-md hover:shadow-sky-100/30"
                    : "bg-slate-900/30 border-sky-950/40 hover:border-secondary hover:bg-slate-900/60"
                }`}
              >
                {/* Top Train Details */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded ${
                        isSunlightMode ? "text-primary bg-sky-50" : "text-sky-350 bg-sky-950/40"
                      }`}>
                        {train.trainNo}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {train.sourceStationCode} → {train.destinationStationCode}
                      </span>
                    </div>
                    <h4 className={`text-base font-black tracking-tight mt-1 uppercase ${
                      isSunlightMode ? "text-sky-950" : "text-sky-100"
                    }`}>
                      {train.trainName}
                    </h4>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => onToggleSave(train.trainNo)}
                    className={`p-2 rounded-full border transition-all duration-200 cursor-pointer active:scale-90 ${
                      isPinned
                        ? "bg-cta border-cta text-white"
                        : isSunlightMode
                        ? "bg-transparent border-sky-200 text-sky-400 hover:bg-sky-50/50"
                        : "bg-transparent border-sky-950/50 text-sky-700 hover:bg-sky-950/30"
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current stroke-[2.5]" />
                  </button>
                </div>

                {/* Mid details (Times and travel times) */}
                <div
                  className={`grid grid-cols-3 items-center rounded-xl p-3 border transition-colors duration-300 ${
                    isSunlightMode ? "bg-sky-50/25 border-sky-100/60" : "bg-slate-950/45 border-sky-950/30"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-xl font-black ${
                      isSunlightMode ? "text-sky-950" : "text-sky-100"
                    }`}>
                      {train.fromTime}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                      {train.fromStationCode}
                    </span>
                  </div>

                  <div className={`flex flex-col items-center justify-center border-x ${
                    isSunlightMode ? "border-sky-100/60" : "border-sky-950/50"
                  }`}>
                    <span className={`text-xs font-black ${
                      isSunlightMode ? "text-sky-900" : "text-sky-200"
                    }`}>
                      {train.travelTime}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Duration
                    </span>
                  </div>

                  <div className="flex flex-col items-right text-right">
                    <span className={`text-xl font-black ${
                      isSunlightMode ? "text-sky-950" : "text-sky-100"
                    }`}>
                      {train.toTime}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                      {train.toStationCode}
                    </span>
                  </div>
                </div>

                {/* Bottom line: Running days and Actions */}
                <div className="flex justify-between items-center gap-2 pt-1">
                  {renderRunningDays(train.runningDays)}

                  {/* View Schedule button */}
                  <button
                    onClick={() => onViewSchedule(train.trainNo)}
                    className={`flex items-center gap-1 text-xs font-black uppercase px-3.5 py-2.5 rounded-xl border active:scale-95 transition-all duration-200 cursor-pointer ${
                      isSunlightMode
                        ? "text-primary bg-sky-50 border-sky-100 hover:bg-primary hover:text-white"
                        : "text-secondary bg-sky-950/30 border-sky-950/40 hover:bg-secondary hover:text-slate-950"
                    }`}
                  >
                    <span>Timeline</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          !searched && (
            <div className={`text-center py-16 px-6 border-2 border-dashed rounded-2xl ${
              isSunlightMode ? "border-sky-100 bg-sky-50/10" : "border-sky-950/40 bg-slate-950/20"
            }`}>
              <Train className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-extrabold text-slate-700">Find Train Schedule</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                Search NDLS to MMCT or load routes instantly.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
