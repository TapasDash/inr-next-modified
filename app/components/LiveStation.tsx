"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Clock, Landmark, Radio, ChevronRight, AlertCircle } from "lucide-react";
import { getStationByCode, searchStations } from "indian-railway-station-codes";
import type { LiveStationStatus, LiveStationTrain } from "@/modules/trains/train.schema";
import { apiGetLiveStationStatus } from "../utils/mockData";

interface Station {
  name: string;
  code: string;
}

interface LiveStationProps {
  isSunlightMode: boolean;
  onViewSchedule: (trainNo: string) => void;
}

export default function LiveStation({ isSunlightMode, onViewSchedule }: LiveStationProps) {
  // Station search state
  const initialStation = getStationByCode("NDLS");
  const [stationQuery, setStationQuery] = useState(
    initialStation ? `${initialStation.name} (${initialStation.code})` : "NDLS"
  );
  const [stationCode, setStationCode] = useState("NDLS");
  const [suggestions, setSuggestions] = useState<readonly Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const stationRef = useRef<HTMLDivElement>(null);

  // Optional Destination filter state
  const [destQuery, setDestQuery] = useState("");
  const [destCode, setDestCode] = useState("");
  const [destSuggestions, setDestSuggestions] = useState<readonly Station[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [activeDestIndex, setActiveDestIndex] = useState(-1);
  const destRef = useRef<HTMLDivElement>(null);

  // Filter params
  const [hours, setHours] = useState<2 | 4 | 8>(2);

  // Status and results state
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [stationData, setStationData] = useState<LiveStationStatus | null>(null);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stationRef.current && !stationRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const resolveStationCode = (query: string): string => {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return "";
    
    const match = trimmed.match(/\(([^)]+)\)$/);
    if (match && match[1]) {
      return match[1].trim();
    }
    
    const station = getStationByCode(trimmed);
    if (station) return station.code;

    const searchResults = searchStations(trimmed);
    if (searchResults.length > 0) {
      return searchResults[0].code;
    }

    return trimmed;
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const resolvedStation = resolveStationCode(stationQuery);
    const resolvedDest = resolveStationCode(destQuery);

    if (!resolvedStation) {
      setErrorMsg("Please enter a valid station.");
      return;
    }

    // Clean text fields
    const mainStationObj = getStationByCode(resolvedStation);
    if (mainStationObj) {
      setStationQuery(`${mainStationObj.name} (${mainStationObj.code})`);
      setStationCode(resolvedStation);
    }

    if (resolvedDest) {
      const destStationObj = getStationByCode(resolvedDest);
      if (destStationObj) {
        setDestQuery(`${destStationObj.name} (${destStationObj.code})`);
        setDestCode(resolvedDest);
      }
    } else {
      setDestQuery("");
      setDestCode("");
    }

    setLoading(true);
    setSearched(true);
    setErrorMsg("");
    setStationData(null);

    try {
      const data = await apiGetLiveStationStatus(resolvedStation, hours, resolvedDest || undefined);
      setStationData(data);
      if (!data.trains || data.trains.length === 0) {
        setErrorMsg(`No trains found arriving/departing in the next ${hours} hours.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch live station status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = (val: string) => {
    setStationQuery(val);
    if (val.trim()) {
      const results = searchStations(val);
      setSuggestions(results.slice(0, 10));
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setStationCode("");
    }
  };

  const handleDestChange = (val: string) => {
    setDestQuery(val);
    if (val.trim()) {
      const results = searchStations(val);
      setDestSuggestions(results.slice(0, 10));
      setShowDestSuggestions(true);
      setActiveDestIndex(-1);
    } else {
      setDestSuggestions([]);
      setShowDestSuggestions(false);
      setDestCode("");
    }
  };

  const selectStation = (selected: Station) => {
    setStationQuery(`${selected.name} (${selected.code})`);
    setStationCode(selected.code);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const selectDestStation = (selected: Station) => {
    setDestQuery(`${selected.name} (${selected.code})`);
    setDestCode(selected.code);
    setShowDestSuggestions(false);
    setActiveDestIndex(-1);
  };

  // Keyboard navigation for main station suggestions
  const handleStationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        selectStation(suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Keyboard navigation for destination filter suggestions
  const handleDestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDestSuggestions || destSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveDestIndex((prev) => (prev + 1) % destSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveDestIndex((prev) => (prev - 1 + destSuggestions.length) % destSuggestions.length);
    } else if (e.key === "Enter") {
      if (activeDestIndex >= 0 && activeDestIndex < destSuggestions.length) {
        e.preventDefault();
        selectDestStation(destSuggestions[activeDestIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDestSuggestions(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search station form */}
      <form
        onSubmit={handleSearch}
        className={`p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-4 transition-colors duration-500 ${
          isSunlightMode
            ? "bg-white border-sky-100 shadow-sky-100/50"
            : "bg-slate-900/40 border-sky-950/40"
        }`}
      >
        <div className="flex flex-col gap-3">
          {/* Main Station Code Input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              LIVE AT STATION
            </label>
            <div className="relative" ref={stationRef}>
              <input
                type="text"
                value={stationQuery}
                onChange={(e) => handleStationChange(e.target.value)}
                onFocus={() => {
                  if (stationQuery.trim()) {
                    const results = searchStations(stationQuery);
                    setSuggestions(results.slice(0, 10));
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleStationKeyDown}
                placeholder="Station name or code (e.g. NDLS)"
                className={`w-full px-4 py-3 pr-12 rounded-xl border-2 font-extrabold text-base tracking-wide transition-all outline-none ${
                  isSunlightMode
                    ? "bg-sky-50/25 border-sky-100/80 focus:border-primary text-sky-955"
                    : "bg-slate-950 border-sky-950 focus:border-secondary text-sky-100"
                }`}
                required
                autoComplete="off"
              />
              <Landmark className="w-5 h-5 absolute right-4 top-3.5 text-slate-400" />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className={`absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border-2 shadow-lg transition-all ${
                    isSunlightMode
                      ? "bg-white border-sky-100/90 text-sky-950 divide-y divide-sky-50"
                      : "bg-slate-950 border-sky-950 text-sky-100 divide-y divide-sky-950/50"
                  }`}
                >
                  {suggestions.map((station, idx) => (
                    <button
                      key={station.code}
                      type="button"
                      onClick={() => selectStation(station)}
                      onMouseEnter={() => setActiveSuggestionIndex(idx)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                        idx === activeSuggestionIndex
                          ? isSunlightMode
                            ? "bg-sky-50 text-primary font-black"
                            : "bg-slate-900 text-secondary font-black"
                          : isSunlightMode
                          ? "hover:bg-sky-50/50"
                          : "hover:bg-slate-900/50"
                      }`}
                    >
                      <span className="truncate pr-2">{station.name}</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded tracking-wide ${
                        isSunlightMode ? "bg-sky-50 text-sky-600" : "bg-sky-950/50 text-sky-350"
                      }`}>
                        {station.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional Destination Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              FILTER BY DESTINATION (OPTIONAL)
            </label>
            <div className="relative" ref={destRef}>
              <input
                type="text"
                value={destQuery}
                onChange={(e) => handleDestChange(e.target.value)}
                onFocus={() => {
                  if (destQuery.trim()) {
                    const results = searchStations(destQuery);
                    setDestSuggestions(results.slice(0, 10));
                    setShowDestSuggestions(true);
                  }
                }}
                onKeyDown={handleDestKeyDown}
                placeholder="Only show trains bound for... (e.g. MMCT)"
                className={`w-full px-4 py-3 pr-12 rounded-xl border-2 font-extrabold text-sm tracking-wide transition-all outline-none ${
                  isSunlightMode
                    ? "bg-sky-50/25 border-sky-100/80 focus:border-primary text-sky-955"
                    : "bg-slate-950 border-sky-950 focus:border-secondary text-sky-100"
                }`}
                autoComplete="off"
              />
              <MapPin className="w-4 h-4 absolute right-4 top-4 text-slate-400" />

              {/* Destination Suggestions */}
              {showDestSuggestions && destSuggestions.length > 0 && (
                <div
                  className={`absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border-2 shadow-lg transition-all ${
                    isSunlightMode
                      ? "bg-white border-sky-100/90 text-sky-955 divide-y divide-sky-50"
                      : "bg-slate-950 border-sky-950 text-sky-100 divide-y divide-sky-950/50"
                  }`}
                >
                  {destSuggestions.map((station, idx) => (
                    <button
                      key={station.code}
                      type="button"
                      onClick={() => selectDestStation(station)}
                      onMouseEnter={() => setActiveDestIndex(idx)}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                        idx === activeDestIndex
                          ? isSunlightMode
                            ? "bg-sky-50 text-primary font-black"
                            : "bg-slate-900 text-secondary font-black"
                          : isSunlightMode
                          ? "hover:bg-sky-50/50"
                          : "hover:bg-slate-900/50"
                      }`}
                    >
                      <span className="truncate pr-2">{station.name}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide ${
                        isSunlightMode ? "bg-sky-50 text-sky-600" : "bg-sky-950/50 text-sky-350"
                      }`}>
                        {station.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hours Segmented Control */}
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              TIME WINDOW
            </span>
            <div className={`flex gap-1 p-1 rounded-xl border-2 ${
              isSunlightMode ? "bg-sky-50/30 border-sky-100/80" : "bg-slate-950 border-sky-950"
            }`}>
              {([2, 4, 8] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all cursor-pointer ${
                    hours === h
                      ? isSunlightMode
                        ? "bg-primary text-white shadow-xs"
                        : "bg-secondary text-slate-950 shadow-md shadow-black/20"
                      : isSunlightMode
                      ? "text-slate-500 hover:bg-sky-50"
                      : "text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  {h} Hrs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Search Board */}
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
              <Radio className="w-5 h-5 animate-pulse" />
              <span>Fetch Live Station Board</span>
            </>
          )}
        </button>
      </form>

      {/* Results Header */}
      {searched && stationData && (
        <div className="flex justify-between items-center px-1 mt-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            Station Trains ({stationData.trains?.length || 0})
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {stationData.stationName} ({stationData.stationCode})
          </span>
        </div>
      )}

      {/* Train List */}
      <div className="flex flex-col gap-3.5 pb-10">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-32 rounded-2xl border-2 animate-pulse ${
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
              Verify the station details and time window criteria.
            </p>
          </div>
        ) : stationData && stationData.trains && stationData.trains.length > 0 ? (
          stationData.trains.map((train: LiveStationTrain) => {
            const isDelayed = train.delayArrival > 0 || train.delayDeparture > 0;
            const maxDelay = Math.max(train.delayArrival, train.delayDeparture);
            return (
              <div
                key={train.trainNo}
                className={`rounded-2xl border-2 p-4 flex flex-col gap-3 shadow-xs transition-all duration-300 ${
                  isSunlightMode
                    ? "bg-white border-sky-100 hover:border-primary"
                    : "bg-slate-900/30 border-sky-950/40 hover:border-secondary"
                }`}
              >
                {/* Train Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded ${
                        isSunlightMode ? "text-primary bg-sky-50" : "text-sky-350 bg-sky-950/40"
                      }`}>
                        {train.trainNo}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                        {train.trainType}
                      </span>
                    </div>
                    <h4 className={`text-sm font-black tracking-tight uppercase mt-0.5 truncate max-w-[200px] ${
                      isSunlightMode ? "text-sky-955" : "text-sky-100"
                    }`}>
                      {train.trainName}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500">
                      Route: {train.route}
                    </span>
                  </div>

                  {/* Platform Indicator */}
                  <div className="flex flex-col items-end">
                    <span className={`px-2.5 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${
                      isSunlightMode ? "bg-primary text-white" : "bg-secondary text-slate-950"
                    }`}>
                      PF {train.platform || "--"}
                    </span>
                    <span className={`text-[9px] font-black mt-1 uppercase ${
                      isDelayed ? "text-rose-500" : "text-emerald-600"
                    }`}>
                      {isDelayed ? `+${maxDelay} Min Delay` : "On Time"}
                    </span>
                  </div>
                </div>

                {/* Timings row */}
                <div className={`grid grid-cols-2 gap-4 pt-2.5 border-t text-xs ${
                  isSunlightMode ? "border-sky-50" : "border-sky-950/20"
                }`}>
                  {/* Arrival timing */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Arrival</span>
                      <span className={`font-extrabold ${isSunlightMode ? "text-sky-900" : "text-sky-100"}`}>
                        {train.actualArrival || "--:--"}
                      </span>
                      <span className="text-[8px] text-slate-400">Sch: {train.scheduledArrival}</span>
                    </div>
                  </div>

                  {/* Departure timing */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Departure</span>
                      <span className={`font-extrabold ${isSunlightMode ? "text-sky-900" : "text-sky-100"}`}>
                        {train.actualDeparture || "--:--"}
                      </span>
                      <span className="text-[8px] text-slate-400">Sch: {train.scheduledDeparture}</span>
                    </div>
                  </div>
                </div>

                {/* Class Tags */}
                {train.classes && train.classes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-dashed border-sky-100/50">
                    {train.classes.map((cls) => (
                      <span
                        key={cls}
                        className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${
                          isSunlightMode
                            ? "bg-slate-50 text-slate-500 border-slate-200"
                            : "bg-slate-900/50 text-slate-400 border-slate-950"
                        }`}
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                )}

                {/* Navigation Button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onViewSchedule(train.trainNo)}
                    className={`flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border active:scale-95 transition-all duration-200 cursor-pointer ${
                      isSunlightMode
                        ? "text-primary bg-sky-50 border-sky-100 hover:bg-primary hover:text-white"
                        : "text-secondary bg-sky-950/30 border-sky-950/40 hover:bg-secondary hover:text-slate-950"
                    }`}
                  >
                    <span>Full timeline</span>
                    <ChevronRight className="w-3 h-3 stroke-[2.5]" />
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
              <Radio className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-pulse" />
              <p className="font-extrabold text-slate-700">Station live status board</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                Search station NDLS or MMCT to view real-time platform allocations & delay boards.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
