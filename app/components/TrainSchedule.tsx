"use client";

import React, { useState, useEffect } from "react";
import { Search, Clock, Route, Bookmark, AlertCircle, RefreshCw, Radio, Calendar } from "lucide-react";
import type { TrainInfo, RouteStation, LiveTrainStatus, LiveTrainHalt } from "@/modules/trains/train.schema";
import { apiGetTrainDetails, apiGetLiveTrainStatus } from "../utils/mockData";

// Helper to parse time in HH:MM format to minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr === "Source" || timeStr === "Destination" || timeStr.includes("--")) {
    return 0;
  }
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

// Helper to get current Indian Standard Time (IST) hours and minutes
function getCurrentISTTime(): { hours: number; minutes: number } {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const formatted = formatter.format(now);
    const [h, m] = formatted.split(":").map(Number);
    return { hours: h, minutes: m };
  } catch (e) {
    return { hours: now.getHours(), minutes: now.getMinutes() };
  }
}

// Calculate the active station index based on current time (fallback)
function calculateCurrentStationIndex(route: RouteStation[]): number {
  if (!route || route.length === 0) return 0;

  const stationTimes = route.map((station) => {
    const day = parseInt(station.day, 10) || 1;
    const dayOffset = (day - 1) * 24 * 60;
    
    const arrMin = parseTimeToMinutes(station.arrival);
    const depMin = parseTimeToMinutes(station.departure);
    
    return {
      arrival: dayOffset + (station.arrival === "Source" ? depMin : arrMin),
      departure: dayOffset + (station.departure === "Destination" ? arrMin : depMin),
    };
  });

  const firstStationDep = stationTimes[0].departure;
  const lastStationArr = stationTimes[stationTimes.length - 1].arrival;

  const { hours, minutes } = getCurrentISTTime();
  const currentDayMins = hours * 60 + minutes;
  
  let bestOffset = 0;
  let minDistance = Infinity;

  // We check if the train started yesterday (-2 or -1), today (0), or tomorrow (+1)
  for (const dayDiff of [-2, -1, 0, 1]) {
    const offset = -dayDiff * 24 * 60 + currentDayMins;
    
    if (offset >= firstStationDep && offset <= lastStationArr) {
      bestOffset = offset;
      break;
    }
    
    let dist = 0;
    if (offset < firstStationDep) {
      dist = firstStationDep - offset;
    } else {
      dist = offset - lastStationArr;
    }
    
    if (dist < minDistance) {
      minDistance = dist;
      bestOffset = offset;
    }
  }

  for (let i = 0; i < stationTimes.length; i++) {
    const { arrival, departure } = stationTimes[i];
    
    if (i === 0 && bestOffset <= departure) {
      return 0;
    }
    
    if (i === stationTimes.length - 1 && bestOffset >= arrival) {
      return stationTimes.length - 1;
    }
    
    if (bestOffset >= arrival && bestOffset <= departure) {
      return i;
    }
    
    if (i < stationTimes.length - 1) {
      const nextArrival = stationTimes[i + 1].arrival;
      if (bestOffset > departure && bestOffset < nextArrival) {
        return i + 1;
      }
    }
  }

  return 0;
}

// Generate offset date string in DD-MM-YYYY format
function getOffsetDateString(offset: string): string {
  const target = new Date();
  if (offset === "yesterday") {
    target.setDate(target.getDate() - 1);
  } else if (offset === "tomorrow") {
    target.setDate(target.getDate() + 1);
  }
  const day = String(target.getDate()).padStart(2, "0");
  const month = String(target.getMonth() + 1).padStart(2, "0");
  const year = target.getFullYear();
  return `${day}-${month}-${year}`;
}

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

  // Live Tracking state variables
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveStatus, setLiveStatus] = useState<LiveTrainStatus | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveErrorMsg, setLiveErrorMsg] = useState("");
  const [liveDate, setLiveDate] = useState("");

  // User simulated/selected manual active station override
  const [userSimulatedIndex, setUserSimulatedIndex] = useState<number | null>(null);

  // Set default live date to today in DD-MM-YYYY format
  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    setLiveDate(`${day}-${month}-${year}`);
  }, []);

  useEffect(() => {
    if (initialTrainNo) {
      setTrainNo(initialTrainNo);
      setIsLiveTracking(false);
      setLiveStatus(null);
      setUserSimulatedIndex(null);
      fetchSchedule(initialTrainNo);
    }
  }, [initialTrainNo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNo.trim()) return;
    setIsLiveTracking(false);
    setLiveStatus(null);
    setUserSimulatedIndex(null);
    fetchSchedule(trainNo.trim());
  };

  const fetchSchedule = async (num: string) => {
    setLoading(true);
    setErrorMsg("");
    setSchedule(null);
    setLiveStatus(null);
    setLiveErrorMsg("");
    setUserSimulatedIndex(null);

    try {
      const data = await apiGetTrainDetails(num);
      if (data) {
        setSchedule(data);
        
        // Use liveDate if populated, otherwise generate today's date
        let targetDate = liveDate;
        if (!targetDate) {
          const today = new Date();
          const day = String(today.getDate()).padStart(2, "0");
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const year = today.getFullYear();
          targetDate = `${day}-${month}-${year}`;
        }
        
        fetchLiveRunningStatus(num, targetDate);
      } else {
        setErrorMsg("Train schedule not found. Try searching 12952, 12002, or 12010.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to retrieve schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveRunningStatus = async (num: string, date: string) => {
    setLiveLoading(true);
    setLiveErrorMsg("");

    try {
      const liveData = await apiGetLiveTrainStatus(num, date);
      if (liveData) {
        setLiveStatus(liveData);
        setIsLiveTracking(true); // Automatically enable live tracking
      } else {
        setLiveErrorMsg("Failed to retrieve live running status for this date.");
      }
    } catch (err: any) {
      setLiveErrorMsg(err.message || "Failed to load live tracking. Upstream service might be busy.");
    } finally {
      setLiveLoading(false);
    }
  };

  const handleToggleLive = async () => {
    if (!schedule) return;
    
    const nextLiveState = !isLiveTracking;
    setIsLiveTracking(nextLiveState);
    
    if (nextLiveState) {
      await fetchLiveRunningStatus(schedule.info.trainNo, liveDate);
    } else {
      setLiveStatus(null);
      setLiveErrorMsg("");
    }
  };

  const handleRefreshLive = async () => {
    if (!schedule) return;
    await fetchLiveRunningStatus(schedule.info.trainNo, liveDate);
  };

  const isPinned = schedule ? savedTrains.includes(schedule.info.trainNo) : false;

  // Determine current active station index for timeline highlight
  let currentActiveIndex = 0;
  if (userSimulatedIndex !== null) {
    currentActiveIndex = userSimulatedIndex;
  } else if (schedule) {
    if (liveStatus && liveStatus.currentStationCode && liveStatus.currentStationCode !== "YET") {
      const idx = schedule.route.findIndex(
        (station) => station.sourceStationCode.trim().toUpperCase() === liveStatus.currentStationCode.trim().toUpperCase()
      );
      currentActiveIndex = idx !== -1 ? idx : calculateCurrentStationIndex(schedule.route);
    } else {
      currentActiveIndex = calculateCurrentStationIndex(schedule.route);
    }
  }

  // Length helper for timeline routing path height
  const routeLength = schedule?.route.length || 1;

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
            className={`w-full px-4 py-3.5 pr-10 rounded-xl border-2 font-extrabold text-base tracking-wide transition-all outline-none focus:border-primary ${
              isSunlightMode
                ? "bg-white border-sky-100 text-sky-955"
                : "bg-slate-950 border-sky-950 text-sky-100"
            }`}
            required
          />
          <Search className="w-5 h-5 absolute right-4 top-4 text-slate-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-5 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center transition-all duration-200 active:scale-[0.95] cursor-pointer ${
            isSunlightMode
              ? "bg-primary hover:bg-sky-500 text-white"
              : "bg-secondary hover:bg-sky-300 text-slate-950"
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
          className={`p-4 rounded-2xl border-2 shadow-xs transition-all duration-350 ${
            isSunlightMode
              ? "bg-white border-sky-100 shadow-sky-100/50"
              : "bg-slate-900/40 border-sky-950/40"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded ${
                  isSunlightMode ? "text-primary bg-sky-50" : "text-sky-350 bg-sky-950/40"
                }`}>
                  {schedule.info.trainNo}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {schedule.info.type}
                </span>
              </div>
              <h2 className={`text-lg font-black tracking-tight uppercase mt-1 ${
                isSunlightMode ? "text-sky-955" : "text-sky-100"
              }`}>
                {schedule.info.trainName}
              </h2>
            </div>

            {/* Pin Toggle */}
            <button
              onClick={() => onToggleSave(schedule.info.trainNo)}
              className={`p-2.5 rounded-full border transition-all duration-200 cursor-pointer active:scale-90 ${
                isPinned
                  ? "bg-cta border-cta text-white"
                  : isSunlightMode
                  ? "bg-transparent border-sky-200 text-sky-455 hover:bg-sky-50/50"
                  : "bg-transparent border-sky-950/50 text-sky-700 hover:bg-sky-950/30"
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className={`grid grid-cols-3 gap-2 mt-4 pt-3 border-t ${
            isSunlightMode ? "border-sky-100" : "border-sky-950/50"
          }`}>
            <div className="flex flex-col text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Distance
              </span>
              <span className={`text-sm font-black ${isSunlightMode ? "text-sky-900" : "text-sky-200"}`}>
                {schedule.info.distanceFromTo} km
              </span>
            </div>
            <div className={`flex flex-col text-center border-x ${
              isSunlightMode ? "border-sky-100" : "border-sky-950/50"
            }`}>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Speed
              </span>
              <span className={`text-sm font-black ${isSunlightMode ? "text-sky-900" : "text-sky-200"}`}>
                {schedule.info.averageSpeed} km/h
              </span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Duration
              </span>
              <span className={`text-sm font-black ${isSunlightMode ? "text-sky-900" : "text-sky-200"}`}>
                {schedule.info.travelTime}
              </span>
            </div>
          </div>

          {/* Live NTES Toggle Panel */}
          <div className={`mt-4 pt-3 border-t flex flex-col gap-3.5 ${
            isSunlightMode ? "border-sky-100" : "border-sky-950/50"
          }`}>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5">
                <Radio className={`w-4 h-4 ${isLiveTracking ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Live NTES Status
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isLiveTracking && (
                  <button
                    type="button"
                    onClick={handleRefreshLive}
                    disabled={liveLoading}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSunlightMode
                        ? "border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100"
                        : "border-sky-950/60 bg-slate-955 text-sky-300 hover:bg-slate-900"
                    }`}
                    title="Refresh Running Status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${liveLoading ? "animate-spin" : ""}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleToggleLive}
                  disabled={liveLoading}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${
                    isLiveTracking
                      ? "bg-emerald-500 text-white shadow-xs"
                      : isSunlightMode
                      ? "bg-sky-50 text-slate-600 border border-sky-100 hover:bg-sky-100"
                      : "bg-slate-955 text-slate-400 border border-sky-950/60 hover:bg-slate-900"
                  }`}
                >
                  {isLiveTracking ? "Live ON" : "Live OFF"}
                </button>
              </div>
            </div>

            {/* Expandable Date selection panel */}
            {isLiveTracking && (
              <div className={`mt-1 pt-3 border-t border-dashed flex flex-col gap-2.5 ${
                isSunlightMode ? "border-sky-100" : "border-sky-950/40"
              }`}>
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                    Track Journey Date
                  </label>
                  {liveStatus && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      isSunlightMode ? "bg-emerald-100 text-emerald-800" : "bg-emerald-950/50 text-emerald-300"
                    }`}>
                      Current Date: {liveDate}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="DD-MM-YYYY"
                      value={liveDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setLiveDate(newDate);
                        if (/^\d{2}-\d{2}-\d{4}$/.test(newDate)) {
                          fetchLiveRunningStatus(schedule.info.trainNo, newDate);
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border-2 font-extrabold text-sm tracking-wide transition-all outline-none focus:border-primary ${
                        isSunlightMode
                          ? "bg-sky-50/25 border-sky-100 text-sky-955"
                          : "bg-slate-955 border-sky-950 text-sky-100"
                      }`}
                    />
                    <Calendar className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleRefreshLive}
                    disabled={liveLoading}
                    className={`px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      isSunlightMode
                        ? "bg-primary hover:bg-sky-500 text-white"
                        : "bg-secondary hover:bg-sky-300 text-slate-950"
                    }`}
                  >
                    {liveLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Track"
                    )}
                  </button>
                </div>

                {/* Quick selectors: Yesterday, Today, Tomorrow */}
                <div className="flex gap-2">
                  {["yesterday", "today", "tomorrow"].map((dayOffset) => {
                    const label = dayOffset.toUpperCase();
                    const targetDateStr = getOffsetDateString(dayOffset);
                    const isSelected = liveDate === targetDateStr;

                    return (
                      <button
                        key={dayOffset}
                        type="button"
                        onClick={() => {
                          setLiveDate(targetDateStr);
                          fetchLiveRunningStatus(schedule.info.trainNo, targetDateStr);
                        }}
                        className={`flex-1 py-2 px-2.5 rounded-xl text-[10px] font-black tracking-wider transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-cta border-cta text-white"
                            : isSunlightMode
                            ? "bg-sky-50/55 border-sky-100 text-sky-700 hover:bg-sky-100"
                            : "bg-slate-950 border-sky-950/60 text-slate-400 hover:bg-slate-900"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulator instructions bar or Live Status Alert Bar */}
      {schedule && (
        <>
          {!isLiveTracking ? (
            <div
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold transition-colors duration-300 ${
                isSunlightMode
                  ? "bg-sky-50 border-sky-100 text-sky-850"
                  : "bg-sky-950/25 border-sky-950/40 text-sky-350"
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Tap any halt dot in the timeline below to simulate live location.</span>
            </div>
          ) : liveLoading ? (
            <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold animate-pulse ${
              isSunlightMode ? "bg-sky-50/50 border-sky-100 text-sky-700" : "bg-slate-900/30 border-sky-950/40 text-sky-350"
            }`}>
              <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              <span>Querying NTES live running status...</span>
            </div>
          ) : liveErrorMsg ? (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-[11px] font-bold ${
              isSunlightMode ? "bg-red-50 border-red-100 text-red-800" : "bg-red-950/20 border-red-950/40 text-red-400"
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{liveErrorMsg}</span>
            </div>
          ) : liveStatus ? (
            <div
              className={`p-3.5 rounded-2xl border flex flex-col gap-1.5 transition-colors duration-300 ${
                isSunlightMode
                  ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                  : "bg-emerald-950/10 border-emerald-950/30 text-emerald-350"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-75">
                  CURRENT RUNNING STATUS
                </span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  isSunlightMode ? "bg-emerald-100 text-emerald-800" : "bg-emerald-950/50 text-emerald-300"
                }`}>
                  UPDATED: {liveStatus.lastUpdated}
                </span>
              </div>
              <p className="text-sm font-extrabold tracking-tight">
                {liveStatus.currentStatus}
              </p>
              {liveStatus.delayMinutes > 0 ? (
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wide">
                  Active Delay: {liveStatus.delayMinutes} Minutes
                </span>
              ) : (
                <span className="text-[10px] font-black text-emerald-555 uppercase tracking-wide">
                  Running on schedule (On Time)
                </span>
              )}
            </div>
          ) : null}
        </>
      )}

      {/* Timeline Section */}
      <div className="flex-1 pb-10">
        {loading ? (
          <div className="flex flex-col gap-4 py-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-20 rounded-xl border-2 animate-pulse ${
                  isSunlightMode ? "bg-white border-sky-100" : "bg-slate-900/30 border-sky-950/40"
                }`}
              />
            ))}
          </div>
        ) : errorMsg ? (
          <div className={`text-center py-16 px-6 border-2 border-dashed rounded-2xl ${
            isSunlightMode ? "border-sky-100 bg-sky-50/10" : "border-sky-950/40 bg-slate-950/20"
          }`}>
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
                  className="px-3 py-1.5 bg-sky-50 text-primary border border-sky-100 font-extrabold text-xs rounded hover:bg-sky-100 transition-colors cursor-pointer"
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
                isSunlightMode ? "bg-sky-100" : "bg-sky-950/50"
              }`}
            />

            {/* Active route path line */}
            <div
              className="absolute left-9 top-4 w-1 bg-emerald-500 transition-all duration-500"
              style={{
                height: `${
                  (currentActiveIndex / (routeLength - 1)) * 96
                }%`,
                maxHeight: "100%",
              }}
            />

            {/* Timeline cards */}
            <div className="flex flex-col gap-5">
              {schedule.route.map((station, idx) => {
                const isPassed = idx < currentActiveIndex;
                const isCurrent = idx === currentActiveIndex;
                const isSource = idx === 0;
                const isDestination = idx === schedule.route.length - 1;
                const mockPlatform = String((idx % 4) + 1);

                // Find matching live halt if liveStatus is available
                const liveHalt = liveStatus?.route.find(
                  (h) => h.stationCode.trim().toUpperCase() === station.sourceStationCode.trim().toUpperCase()
                );

                const activePlatform = liveHalt?.platform && liveHalt.platform !== "--" ? liveHalt.platform : mockPlatform;
                const activeDelay = liveHalt ? Math.max(liveHalt.delayArrival, liveHalt.delayDeparture) : 0;
                const isDelayed = activeDelay > 0;
                const isCancelled = liveHalt?.status === "cancelled";

                // Map state status
                const haltStatus = liveHalt 
                  ? liveHalt.status 
                  : (isPassed ? "departed" : (isCurrent ? "arrived" : "yet_to_arrive"));

                return (
                  <div
                    key={station.sourceStationCode}
                    onClick={() => setUserSimulatedIndex(idx)}
                    className="relative flex items-start gap-4 cursor-pointer group"
                  >
                    {/* Node bullet */}
                    <div className="absolute -left-0.5 mt-1.5 flex items-center justify-center z-10">
                      {isCurrent ? (
                        <div className="relative flex items-center justify-center">
                          <span className="absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-35 animate-ping"></span>
                          <span className={`rounded-full h-4.5 w-4.5 border-4 border-emerald-500 transition-all duration-300 ${
                            isSunlightMode ? "bg-white" : "bg-slate-955"
                          }`} />
                        </div>
                      ) : (
                        <span
                          className={`rounded-full h-3.5 w-3.5 border-2 transition-all duration-300 ${
                            isPassed
                              ? "bg-emerald-500 border-emerald-500 scale-110"
                              : isSunlightMode
                              ? "bg-white border-sky-200"
                              : "bg-slate-955 border-sky-950"
                          }`}
                        />
                      )}
                    </div>

                    {/* Timeline card details */}
                    <div
                      className={`flex-1 p-3.5 rounded-xl border-2 transition-all duration-300 ${
                        isCurrent
                          ? "border-emerald-500 bg-emerald-500/5 shadow-xs"
                          : isSunlightMode
                          ? "bg-white border-sky-100 hover:border-sky-200"
                          : "bg-slate-900/30 border-sky-950/40 hover:border-sky-900/50"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-black uppercase text-slate-400">
                            {isSource ? "SOURCE" : isDestination ? "DESTINATION" : `STOP ${idx}`}
                          </span>
                          <h4 className={`text-sm font-black tracking-tight uppercase truncate ${
                            isSunlightMode ? "text-sky-955" : "text-sky-100"
                          }`}>
                            {station.sourceStationName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isSunlightMode ? "text-primary bg-sky-50" : "text-sky-300 bg-sky-950/40"
                            }`}>
                              {station.sourceStationCode}
                            </span>
                            {/* Status badge */}
                            <span className={`text-[9px] font-black uppercase px-1 py-0.2 rounded border ${
                              isCancelled
                                ? "bg-red-50 text-red-655 border-red-100"
                                : isCurrent
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : isPassed
                                ? "bg-slate-100 text-slate-500 border-slate-200"
                                : isSunlightMode
                                ? "bg-transparent text-slate-400 border-slate-300"
                                : "bg-transparent text-slate-400 border-sky-950/40"
                            }`}>
                              {haltStatus.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        {/* Platform Badge */}
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span
                            className={`px-2.5 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${
                              isSunlightMode
                                ? "bg-primary text-white"
                                : "bg-secondary text-slate-950"
                            }`}
                          >
                            PF {activePlatform}
                          </span>
                          {liveHalt ? (
                            <span className={`text-[9px] font-black mt-1 ${
                              isCancelled
                                ? "text-red-500"
                                : isDelayed
                                ? "text-rose-500"
                                : "text-emerald-600"
                            }`}>
                              {isCancelled ? "CANCELLED" : isDelayed ? `+${activeDelay} min` : "ON TIME"}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 mt-1">
                              {station.distance} km
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timings row */}
                      <div className={`grid grid-cols-2 gap-4 mt-3 pt-2.5 border-t text-xs ${
                        isSunlightMode ? "border-sky-50" : "border-sky-950/20"
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              Arrival
                            </span>
                            <span className={`font-extrabold ${isSunlightMode ? "text-sky-900" : "text-sky-100"}`}>
                              {liveHalt 
                                ? (liveHalt.actualArrival === "--:--" ? liveHalt.scheduledArrival : liveHalt.actualArrival)
                                : station.arrival}
                            </span>
                            {liveHalt && (
                              <span className="text-[8px] text-slate-400">
                                Sch: {liveHalt.scheduledArrival}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              Departure
                            </span>
                            <span className={`font-extrabold ${isSunlightMode ? "text-sky-900" : "text-sky-100"}`}>
                              {liveHalt
                                ? (liveHalt.actualDeparture === "--:--" ? liveHalt.scheduledDeparture : liveHalt.actualDeparture)
                                : station.departure}
                            </span>
                            {liveHalt && (
                              <span className="text-[8px] text-slate-400">
                                Sch: {liveHalt.scheduledDeparture}
                              </span>
                            )}
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
          <div className={`text-center py-16 px-6 border-2 border-dashed rounded-2xl ${
            isSunlightMode ? "border-sky-100 bg-sky-50/10" : "border-sky-950/40 bg-slate-950/20"
          }`}>
            <Route className="w-10 h-10 text-slate-350 mx-auto mb-3" />
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
