"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Map, Bookmark, Sun, Smartphone, Wifi, Clock } from "lucide-react";
import TrainSearch from "./TrainSearch";
import TrainSchedule from "./TrainSchedule";

type TabType = "search" | "schedule" | "saved";

export default function RailRoverShell() {
  const [activeTab, setActiveTab] = useState<TabType>("search");
  const [selectedTrainNo, setSelectedTrainNo] = useState<string>("");
  const [savedTrains, setSavedTrains] = useState<string[]>([]);
  const [isSunlightMode, setIsSunlightMode] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  // Clock effect for top bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online status check
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle switching to schedule view from a search item
  const handleViewSchedule = (trainNo: string) => {
    setSelectedTrainNo(trainNo);
    setActiveTab("schedule");
  };

  // Saved trains helper
  const toggleSaveTrain = (trainNo: string) => {
    if (savedTrains.includes(trainNo)) {
      setSavedTrains(savedTrains.filter((t) => t !== trainNo));
    } else {
      setSavedTrains([...savedTrains, trainNo]);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-0 md:p-6 transition-colors duration-300 ${
        isSunlightMode ? "bg-slate-100" : "bg-slate-950"
      }`}
    >
      {/* Smartphone frame container */}
      <div
        className={`w-full max-w-md h-[100vh] md:h-[840px] flex flex-col relative overflow-hidden md:rounded-[40px] md:shadow-2xl md:border-[10px] md:border-slate-800 transition-colors duration-300 ${
          isSunlightMode ? "bg-slate-50 text-slate-900 border-slate-300" : "bg-slate-900 text-slate-100 border-slate-800"
        }`}
      >
        {/* Status bar */}
        <div
          className={`px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold tracking-wider transition-colors duration-300 ${
            isSunlightMode ? "bg-slate-200 text-slate-700" : "bg-slate-950 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime || "00:00:00"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOnline ? "bg-emerald-600/10 text-emerald-600" : "bg-red-600/10 text-red-600"
              }`}
            >
              <Wifi className="w-3 h-3" />
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
            <span className="text-[10px]">PLATFORM COMS</span>
          </div>
        </div>

        {/* Brand Header */}
        <header
          className={`px-5 py-4 border-b flex justify-between items-center transition-colors duration-300 ${
            isSunlightMode ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"
          }`}
        >
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1">
              <span>Rail</span>
              <span className={isSunlightMode ? "text-blue-600" : "text-blue-400"}>Rover</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Sunlight Assist Active
            </p>
          </div>

          <div className="flex gap-2">
            {/* Sunlight toggle switch */}
            <button
              onClick={() => setIsSunlightMode(!isSunlightMode)}
              className={`p-2.5 rounded-full border transition-all duration-300 active:scale-95 ${
                isSunlightMode
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-slate-800 text-amber-400 border-slate-700"
              }`}
              title="Toggle Sunlight Contrast Mode"
            >
              <Sun className="w-5 h-5 animate-spin-slow" />
            </button>
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto px-4 py-4 relative scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              {activeTab === "search" && (
                <TrainSearch
                  onViewSchedule={handleViewSchedule}
                  isSunlightMode={isSunlightMode}
                  savedTrains={savedTrains}
                  onToggleSave={toggleSaveTrain}
                />
              )}
              {activeTab === "schedule" && (
                <TrainSchedule
                  initialTrainNo={selectedTrainNo}
                  isSunlightMode={isSunlightMode}
                  onToggleSave={toggleSaveTrain}
                  savedTrains={savedTrains}
                />
              )}
              {activeTab === "saved" && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-black uppercase tracking-wider text-slate-500 mb-2">
                    Pinned Trains
                  </h2>
                  {savedTrains.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-300 rounded-2xl p-6">
                      <Bookmark className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="font-bold text-slate-700">No Pinned Trains</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                        Pin trains from search results or schedules for quick platform lookup.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {savedTrains.map((trainNo) => (
                        <div
                          key={trainNo}
                          className={`p-4 rounded-xl border-2 flex justify-between items-center shadow-sm ${
                            isSunlightMode ? "bg-white border-slate-200" : "bg-slate-800/80 border-slate-700"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded mr-2">
                              {trainNo}
                            </span>
                            <span className="font-extrabold text-sm tracking-tight text-slate-800">
                              {trainNo === "12952"
                                ? "MUMBAI RAJDHANI"
                                : trainNo === "12002"
                                ? "NDLS SHATABDI EXP"
                                : trainNo === "12010"
                                ? "ADI MMCT SHATABDI"
                                : "EXPRESS TRAIN"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewSchedule(trainNo)}
                              className="text-xs font-black uppercase bg-slate-900 text-slate-100 px-3 py-2 rounded-lg hover:bg-slate-800 active:scale-95 transition-transform"
                            >
                              Route
                            </button>
                            <button
                              onClick={() => toggleSaveTrain(trainNo)}
                              className="text-xs text-red-500 font-bold px-2 py-2 rounded hover:bg-red-50"
                            >
                              Unpin
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom thumb-friendly navigation bar */}
        <nav
          className={`h-[76px] pb-4 px-6 border-t flex justify-around items-center transition-colors duration-300 ${
            isSunlightMode ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"
          }`}
        >
          <button
            onClick={() => setActiveTab("search")}
            className={`flex flex-col items-center justify-center gap-1.5 w-20 h-14 rounded-xl active:scale-90 transition-all ${
              activeTab === "search"
                ? "text-blue-600 scale-105"
                : isSunlightMode
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            <Search className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-wider">Search</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex flex-col items-center justify-center gap-1.5 w-20 h-14 rounded-xl active:scale-90 transition-all ${
              activeTab === "schedule"
                ? "text-blue-600 scale-105"
                : isSunlightMode
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            <Map className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-wider">Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex flex-col items-center justify-center gap-1.5 w-20 h-14 rounded-xl active:scale-90 transition-all ${
              activeTab === "saved"
                ? "text-blue-600 scale-105"
                : isSunlightMode
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            <div className="relative">
              <Bookmark className="w-6 h-6 stroke-[2.5]" />
              {savedTrains.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
                  {savedTrains.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Pinned</span>
          </button>
        </nav>

        {/* Visual Home Indicator for PWA simulation */}
        <div
          className={`h-2 flex justify-center items-center pb-1 transition-colors duration-300 ${
            isSunlightMode ? "bg-white" : "bg-slate-950"
          }`}
        >
          <div className="w-28 h-1 rounded-full bg-slate-400 opacity-60"></div>
        </div>
      </div>
    </div>
  );
}
