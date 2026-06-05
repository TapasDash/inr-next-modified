"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Map, Bookmark, Sun, Smartphone, Wifi, Clock, Ticket } from "lucide-react";
import TrainSearch from "@/app/components/TrainSearch";
import TrainSchedule from "@/app/components/TrainSchedule";
import PnrStatus from "@/app/components/PnrStatus";

type TabType = "search" | "schedule" | "pnr" | "saved";

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
      className={`min-h-screen w-full flex items-center justify-center p-0 md:p-6 transition-colors duration-500 ${
        isSunlightMode
          ? "bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200"
          : "bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950"
      }`}
    >
      {/* Smartphone frame container */}
      <div
        className={`w-full max-w-md h-[100vh] md:h-[840px] flex flex-col relative overflow-hidden md:rounded-[40px] md:shadow-2xl border-x-0 md:border-[10px] transition-all duration-500 ${
          isSunlightMode
            ? "bg-white text-slate-850 border-slate-200 shadow-sky-900/10"
            : "bg-bg-dark text-text-dark border-slate-900 shadow-black/40"
        }`}
      >
        {/* Status bar */}
        <div
          className={`px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold tracking-wider transition-colors duration-500 ${
            isSunlightMode ? "bg-sky-50 text-sky-800" : "bg-slate-950/80 text-sky-300"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime || "00:00:00"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOnline ? "bg-emerald-650/10 text-emerald-600" : "bg-red-650/10 text-red-600"
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
          className={`px-5 py-4 border-b flex justify-between items-center transition-colors duration-500 ${
            isSunlightMode ? "bg-white border-sky-100" : "bg-bg-dark border-sky-950/40"
          }`}
        >
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1">
              <span>Rail</span>
              <span className={isSunlightMode ? "text-primary" : "text-secondary"}>Rover</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              {isSunlightMode ? "Sunlight Assist Active" : "Night Deck Active"}
            </p>
          </div>

          <div className="flex gap-2">
            {/* Sunlight toggle switch */}
            <button
              onClick={() => setIsSunlightMode(!isSunlightMode)}
              className={`p-2.5 rounded-full border transition-all duration-300 active:scale-95 cursor-pointer ${
                isSunlightMode
                  ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                  : "bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700"
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
              {activeTab === "pnr" && (
                <PnrStatus isSunlightMode={isSunlightMode} />
              )}
              {activeTab === "saved" && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-black uppercase tracking-wider text-slate-500 mb-2">
                    Pinned Trains
                  </h2>
                  {savedTrains.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl p-6 ${
                      isSunlightMode ? "border-sky-100" : "border-sky-950/40"
                    }`}>
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
                          className={`p-4 rounded-xl border-2 flex justify-between items-center shadow-sm transition-all duration-300 ${
                            isSunlightMode
                              ? "bg-white border-sky-100 hover:shadow-md hover:shadow-sky-100/40"
                              : "bg-slate-900/40 border-sky-950/40 hover:bg-slate-900/60 hover:border-sky-900/40"
                          }`}
                        >
                          <div>
                            <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded mr-2 ${
                              isSunlightMode ? "text-primary bg-sky-50" : "text-sky-300 bg-sky-950/40"
                            }`}>
                              {trainNo}
                            </span>
                            <span className={`font-extrabold text-sm tracking-tight ${
                              isSunlightMode ? "text-sky-900" : "text-sky-100"
                            }`}>
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
                              className="text-xs font-black uppercase bg-primary hover:bg-sky-500 text-white px-3 py-2 rounded-lg active:scale-95 transition-all cursor-pointer"
                            >
                              Route
                            </button>
                            <button
                              onClick={() => toggleSaveTrain(trainNo)}
                              className="text-xs text-red-500 hover:text-red-650 hover:bg-red-500/10 font-bold px-2.5 py-2 rounded transition-colors cursor-pointer"
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

        {/* Bottom navigation bar */}
        <nav
          className={`h-[76px] pb-4 px-6 border-t flex justify-around items-center transition-colors duration-500 ${
            isSunlightMode ? "bg-white border-sky-100" : "bg-slate-950 border-sky-950/40"
          }`}
        >
          <button
            onClick={() => setActiveTab("search")}
            className={`flex flex-col items-center justify-center gap-1.5 w-16 h-14 rounded-xl transition-all duration-200 cursor-pointer active:scale-90 ${
              activeTab === "search"
                ? isSunlightMode
                  ? "text-primary bg-sky-50 font-black scale-105 shadow-xs"
                  : "text-secondary bg-sky-950/30 font-black scale-105"
                : isSunlightMode
                ? "text-slate-500 hover:text-sky-650 hover:bg-sky-50/30"
                : "text-slate-400 hover:text-sky-300 hover:bg-slate-900/50"
            }`}
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-wider">Search</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex flex-col items-center justify-center gap-1.5 w-16 h-14 rounded-xl transition-all duration-200 cursor-pointer active:scale-90 ${
              activeTab === "schedule"
                ? isSunlightMode
                  ? "text-primary bg-sky-50 font-black scale-105 shadow-xs"
                  : "text-secondary bg-sky-950/30 font-black scale-105"
                : isSunlightMode
                ? "text-slate-500 hover:text-sky-650 hover:bg-sky-50/30"
                : "text-slate-400 hover:text-sky-300 hover:bg-slate-900/50"
            }`}
          >
            <Map className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-wider">Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("pnr")}
            className={`flex flex-col items-center justify-center gap-1.5 w-16 h-14 rounded-xl transition-all duration-200 cursor-pointer active:scale-90 ${
              activeTab === "pnr"
                ? isSunlightMode
                  ? "text-primary bg-sky-50 font-black scale-105 shadow-xs"
                  : "text-secondary bg-sky-950/30 font-black scale-105"
                : isSunlightMode
                ? "text-slate-500 hover:text-sky-650 hover:bg-sky-50/30"
                : "text-slate-400 hover:text-sky-300 hover:bg-slate-900/50"
            }`}
          >
            <Ticket className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-wider">PNR</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex flex-col items-center justify-center gap-1.5 w-16 h-14 rounded-xl transition-all duration-200 cursor-pointer active:scale-90 ${
              activeTab === "saved"
                ? isSunlightMode
                  ? "text-primary bg-sky-50 font-black scale-105 shadow-xs"
                  : "text-secondary bg-sky-950/30 font-black scale-105"
                : isSunlightMode
                ? "text-slate-500 hover:text-sky-650 hover:bg-sky-50/30"
                : "text-slate-400 hover:text-sky-300 hover:bg-slate-900/50"
            }`}
          >
            <div className="relative">
              <Bookmark className="w-5 h-5 stroke-[2.5]" />
              {savedTrains.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-cta text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
                  {savedTrains.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Pinned</span>
          </button>
        </nav>

        {/* Visual Home Indicator for PWA simulation */}
        <div
          className={`h-2 flex justify-center items-center pb-1 transition-colors duration-500 ${
            isSunlightMode ? "bg-white" : "bg-slate-950"
          }`}
        >
          <div className="w-28 h-1 rounded-full bg-slate-400 opacity-60"></div>
        </div>
      </div>
    </div>
  );
}
