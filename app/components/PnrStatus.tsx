"use client";

import React, { useState } from "react";
import { Search, Ticket, Users, ShieldAlert, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { apiGetPnrStatus } from "../utils/mockData";

interface PnrStatusProps {
  isSunlightMode: boolean;
}

export default function PnrStatus({ isSunlightMode }: PnrStatusProps) {
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [pnrResult, setPnrResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePnrSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPnr = pnr.trim();
    if (!/^\d{10}$/.test(cleanPnr)) {
      setErrorMsg("PNR number must be exactly 10 digits");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setPnrResult(null);

    try {
      const data = await apiGetPnrStatus(cleanPnr);
      setPnrResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch PNR status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format booking status badge
  const renderStatusBadge = (status: string) => {
    const isCNF = status?.toUpperCase().includes("CNF") || status?.toUpperCase().includes("CONFIRMED");
    const isWL = status?.toUpperCase().includes("WL") || status?.toUpperCase().includes("WAITLIST");
    const isRAC = status?.toUpperCase().includes("RAC");

    let badgeStyle = isSunlightMode
      ? "bg-slate-50 text-slate-700 border-slate-200"
      : "bg-slate-900/30 text-slate-400 border-slate-800";

    if (isCNF) {
      badgeStyle = isSunlightMode
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-emerald-950/20 text-emerald-450 border-emerald-900/30";
    } else if (isWL) {
      badgeStyle = isSunlightMode
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-rose-950/20 text-rose-450 border-rose-900/30";
    } else if (isRAC) {
      badgeStyle = isSunlightMode
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-amber-950/20 text-amber-450 border-amber-900/30";
    }

    return (
      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border transition-colors duration-300 ${badgeStyle}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search Input Card */}
      <form onSubmit={handlePnrSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter 10-Digit PNR Number"
            value={pnr}
            onChange={(e) => setPnr(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className={`w-full px-4 py-3.5 pr-10 rounded-xl border-2 font-extrabold text-base tracking-wide transition-all outline-none focus:border-primary ${
              isSunlightMode
                ? "bg-white border-sky-100 text-sky-950"
                : "bg-slate-950 border-sky-950 text-sky-100"
            }`}
            maxLength={10}
            required
          />
          <Ticket className="w-5 h-5 absolute right-4 top-4 text-slate-400" />
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
            "Track"
          )}
        </button>
      </form>

      {/* Results Section */}
      <div className="flex-1 pb-10">
        {loading ? (
          <div className="flex flex-col gap-4 py-8">
            <div
              className={`h-48 rounded-2xl border-2 animate-pulse ${
                isSunlightMode ? "bg-white border-sky-100" : "bg-slate-900/30 border-sky-950/40"
              }`}
            />
          </div>
        ) : errorMsg ? (
          <div className={`text-center py-16 px-6 border-2 border-dashed rounded-2xl ${
            isSunlightMode ? "border-sky-100 bg-sky-50/10" : "border-sky-950/40 bg-slate-950/20"
          }`}>
            <p className="font-extrabold text-slate-700">{errorMsg}</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
              Please check the PNR number and try again.
            </p>
          </div>
        ) : pnrResult ? (
          <div className="flex flex-col gap-4">
            {/* PNR Header details */}
            <div
              className={`p-4 rounded-2xl border-2 shadow-xs transition-colors duration-300 ${
                isSunlightMode ? "bg-white border-sky-100" : "bg-slate-900/40 border-sky-950/40"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded ${
                    isSunlightMode ? "text-primary bg-sky-50" : "text-sky-350 bg-sky-950/40"
                  }`}>
                    PNR: {pnr}
                  </span>
                  <h3 className={`text-base font-black uppercase mt-2 ${
                    isSunlightMode ? "text-sky-950" : "text-sky-100"
                  }`}>
                    {pnrResult.train_name || pnrResult.trainName || "EXPRESS TRAIN"}
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    No. {pnrResult.train_number || pnrResult.trainNo || "N/A"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">
                    JOURNEY DATE
                  </span>
                  <span className={`text-sm font-black ${
                    isSunlightMode ? "text-sky-900" : "text-sky-200"
                  }`}>
                    {pnrResult.date_of_journey || pnrResult.dateOfJourney || "N/A"}
                  </span>
                </div>
              </div>

              {/* Station routing */}
              <div
                className={`flex justify-between items-center mt-4 p-3 rounded-xl border text-xs font-black ${
                  isSunlightMode ? "bg-sky-50/25 border-sky-100/60" : "bg-slate-950/45 border-sky-950/30"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">FROM</span>
                  <span className={isSunlightMode ? "text-sky-950" : "text-sky-100"}>
                    {pnrResult.boarding_station || pnrResult.from || "N/A"}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-405" />
                <div className="flex flex-col text-right">
                  <span className="text-slate-500 text-[10px]">TO</span>
                  <span className={isSunlightMode ? "text-sky-950" : "text-sky-100"}>
                    {pnrResult.reservation_upto || pnrResult.to || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Passenger List */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">
                Passenger Booking Status
              </h4>

              {pnrResult.passenger_info?.map((pax: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border-2 shadow-xs flex justify-between items-center transition-all duration-350 ${
                    isSunlightMode
                      ? "bg-white border-sky-100 hover:border-sky-200 hover:shadow-xs"
                      : "bg-slate-900/30 border-sky-950/40 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      isSunlightMode ? "bg-sky-50 text-primary" : "bg-sky-950/30 text-sky-300"
                    }`}>
                      P{idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-black ${
                        isSunlightMode ? "text-sky-955" : "text-sky-100"
                      }`}>
                        Passenger {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Coach: {pax.coach || "N/A"} | Berth: {pax.berth_no || pax.berthNo || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Booking:</span>
                      {renderStatusBadge(pax.booking_status || pax.bookingStatus || "N/A")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Current:</span>
                      {renderStatusBadge(pax.current_status || pax.currentStatus || "N/A")}
                    </div>
                  </div>
                </div>
              )) || (
                <div className={`text-center py-6 border-2 border-dashed rounded-2xl ${
                  isSunlightMode ? "border-sky-100" : "border-sky-950/40"
                }`}>
                  <p className="text-xs font-bold text-slate-500">No passenger list available.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`text-center py-16 px-6 border-2 border-dashed rounded-2xl ${
            isSunlightMode ? "border-sky-100 bg-sky-50/10" : "border-sky-950/40 bg-slate-950/20"
          }`}>
            <Ticket className="w-10 h-10 text-slate-350 mx-auto mb-3" />
            <p className="font-extrabold text-slate-700">Track PNR Status</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
              Get real-time booking status, coach details, and platform predictions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
