"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Landmark, Clock, Route, Bookmark, Play, AlertCircle } from "lucide-react";
import type { TrainInfo, RouteStation } from "@/modules/trains/train.schema";
import { apiGetTrainDetails } from "../utils/mockData";

interface TrainScheduleProps {
  initialTrainNo?: string;
  isSunlightMode: boolean;
  savedTrains: string[];
  onToggleSave: (trainNo: string) => void;
}

export default function TrainSchedule({
  initialTrainNo = "",
  isSunlightMode,
  savedTrains,
  onToggleSave,
}: TrainScheduleProps) {
  const [trainNo, setTrainNo] = useState(initialTrainNo);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<{ info: TrainInfo; route: RouteStation[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Live simulation: Index of current station
  const [simulatedCurrentIndex, setSimulatedCurrentIndex] = useState<number>(1);

  useEffect(() => {
    if (initialTrainNo) {
      setTrainNo(initialTrainNo);
      fetchSchedule(initialTrainNo);
    }
  }, [initialTrainNo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNo.trim()) return;
    fetchSchedule(trainNo.trim());
  };

  const fetchSchedule = async (num: string) => {
    setLoading(true);
    setErrorMsg("");
    setSchedule(null);

    try {
      const data = await apiGetTrainDetails(num);
      if (data) {
        setSchedule(data);
        // Default current station simulation to the 2nd station
        setSimulatedCurrentIndex(1);
      } else {
        setErrorMsg("Train schedule not found. Try searching 12952, 12002, or 12010.");
      }
    } catch (err) {
      setErrorMsg("Failed to retrieve schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPinned = schedule ? savedTrains.includes(schedule.info.trainNo) : false;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search Input Card */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Train No. (e.g. 12952)"
            value={trainNo}
            onChange={(e) => setTrainNo(e.target.value)}
            className={`w-full px-4 py-3.5 pr-10 rounded-xl border-2 font-extrabold text-base tracking-wide transition-all outline-none focus:border-blue-600 ${
              isSunlightMode ? "bg-white border-slate-300" : "bg-slate-900 border-slate-700"
            }`}
            required
          />
          <Search className="w-5 h-5 absolute right-4 top-4 text-slate-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-5 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center transition-all active:scale-[0.95] ${
            isSunlightMode
              ? "bg-slate-900 hover:bg-slate-800 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Load"
          )}
        </button>
      </form>

      {/* Train Info Header */}
      {schedule && (
        <div
          className={`p-4 rounded-2xl border-2 shadow-sm transition-all ${
            isSunlightMode ? "bg-white border-slate-200" : "bg-slate-800/80 border-slate-700"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  {schedule.info.trainNo}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {schedule.info.type}
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                {schedule.info.trainName}
              </h2>
            </div>

            {/* Pin Toggle */}
            <button
              onClick={() => onToggleSave(schedule.info.trainNo)}
              className={`p-2.5 rounded-full border transition-all active:scale-90 ${
                isPinned
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-transparent border-slate-300 text-slate-400"
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200">
            <div className="flex flex-col text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Distance
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                {schedule.info.distanceFromTo} km
              </span>
            </div>
            <div className="flex flex-col text-center border-x border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Speed
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                {schedule.info.averageSpeed}
              </span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Duration
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                {schedule.info.travelTime}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Simulator instructions bar */}
      {schedule && (
        <div
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold ${
            isSunlightMode
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-blue-950/40 border-blue-900 text-blue-300"
          }`}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Tap any halt dot in the timeline below to simulate live location.</span>
        </div>
      )}

      {/* Timeline Section */}
      <div className="flex-1 pb-10">
        {loading ? (
          <div className="flex flex-col gap-4 py-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-20 rounded-xl border-2 animate-pulse ${
                  isSunlightMode ? "bg-white border-slate-200" : "bg-slate-800/40 border-slate-700"
                }`}
              />
            ))}
          </div>
        ) : errorMsg ? (
          <div className="text-center py-16 px-6 border-2 border-dashed border-slate-300 rounded-2xl">
            <p className="font-extrabold text-slate-700">{errorMsg}</p>
            <p className="text-xs text-slate-400 mt-2">
              Please search using standard train numbers like:
            </p>
            <div className="flex gap-2 justify-center mt-3">
              {["12952", "12002", "12010"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setTrainNo(num);
                    fetchSchedule(num);
                  }}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 font-extrabold text-xs rounded hover:bg-blue-200"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        ) : schedule ? (
          <div className="relative pl-6 mt-4">
            {/* Vertical timeline trunk line */}
            <div
              className={`absolute left-9 top-4 bottom-4 w-1 transition-colors duration-300 ${
                isSunlightMode ? "bg-slate-200" : "bg-slate-800"
              }`}
            />

            {/* Active route path line */}
            <div
              className="absolute left-9 top-4 w-1 bg-emerald-500 transition-all duration-500"
              style={{
                height: `${
                  (simulatedCurrentIndex / (schedule.route.length - 1)) * 96
                }%`,
                maxHeight: "100%",
              }}
            />

            {/* Stations list */}
            <div className="flex flex-col gap-5">
              {schedule.route.map((station, idx) => {
                const isPassed = idx <= simulatedCurrentIndex;
                const isCurrent = idx === simulatedCurrentIndex;
                const isSource = idx === 0;
                const isDestination = idx === schedule.route.length - 1;

                // Mocking platform numbers matching standard layouts
                const mockPlatform = String((idx % 4) + 1);

                return (
                  <div
                    key={station.sourceStationCode}
                    onClick={() => setSimulatedCurrentIndex(idx)}
                    className="relative flex items-start gap-4 cursor-pointer group"
                  >
                    {/* Halt node bullet indicator */}
                    <div className="absolute -left-0.5 mt-1.5 flex items-center justify-center z-10">
                      {isCurrent ? (
                        <div className="relative flex items-center justify-center">
                          <span className="absolute inline-flex h-7 w-7 rounded-full bg-emerald-400 opacity-75 live-pulse"></span>
                          <span className="relative rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                        </div>
                      ) : (
                        <span
                          className={`rounded-full h-3 w-3 border-2 transition-all duration-300 ${
                            isPassed
                              ? "bg-emerald-500 border-emerald-500 scale-110"
                              : isSunlightMode
                              ? "bg-white border-slate-300"
                              : "bg-slate-900 border-slate-600"
                          }`}
                        />
                      )}
                    </div>

                    {/* Timeline card details */}
                    <div
                      className={`flex-1 p-3.5 rounded-xl border-2 transition-all ${
                        isCurrent
                          ? "border-emerald-500 bg-emerald-500/5 shadow-sm"
                          : isSunlightMode
                          ? "bg-white border-slate-200 hover:border-slate-300"
                          : "bg-slate-800/60 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {/* Station header */}
                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400">
                            {isSource ? "SOURCE" : isDestination ? "DESTINATION" : `STOP ${idx}`}
                          </span>
                          <h4 className="text-sm font-black tracking-tight text-slate-800 dark:text-white uppercase">
                            {station.sourceStationName}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {station.sourceStationCode}
                          </span>
                        </div>

                        {/* Platform Badge (High visibility Slate-900/slate-50) */}
                        <div className="flex flex-col items-end">
                          <span
                            className={`px-2.5 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${
                              isSunlightMode
                                ? "bg-slate-900 text-white"
                                : "bg-white text-slate-900"
                            }`}
                          >
                            PF {mockPlatform}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 mt-1">
                            {station.distance} km
                          </span>
                        </div>
                      </div>

                      {/* Timings row */}
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              Arrival
                            </span>
                            <span className="font-extrabold text-slate-700 dark:text-slate-300">
                              {station.arrival}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              Departure
                            </span>
                            <span className="font-extrabold text-slate-700 dark:text-slate-300">
                              {station.departure}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 px-6 border-2 border-dashed border-slate-300 rounded-2xl">
            <Route className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-extrabold text-slate-700">No Train Selected</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
              Search by train number to view the vertical platform timeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
