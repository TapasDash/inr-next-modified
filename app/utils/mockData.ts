import type { TrainData, TrainInfo, RouteStation } from "@/modules/trains/train.schema";

// Query Next.js API search endpoint directly (no mock data fallback)
export const apiSearchTrains = async (from: string, to: string, date: string): Promise<TrainData[]> => {
  const cleanFrom = from.trim().toUpperCase();
  const cleanTo = to.trim().toUpperCase();
  
  const res = await fetch(`/api/search?from=${cleanFrom}&to=${cleanTo}&date=${date}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${res.status}: Failed to search trains`);
  }
  
  const payload = await res.json();
  if (!payload.success) {
    throw new Error(payload.message || "No trains found for this route");
  }
  
  return payload.data || [];
};

// Query Next.js API train details endpoint directly (no mock data fallback)
export const apiGetTrainDetails = async (trainNo: string): Promise<{ info: TrainInfo; route: RouteStation[] }> => {
  const cleanNo = trainNo.trim();
  
  const res = await fetch(`/api/trains/${cleanNo}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${res.status}: Failed to load train schedule`);
  }
  
  const payload = await res.json();
  if (!payload.success) {
    throw new Error(payload.message || "Train schedule not found");
  }
  
  return payload.data;
};

// Query Next.js API PNR status endpoint directly
export const apiGetPnrStatus = async (pnr: string): Promise<any> => {
  const cleanPnr = pnr.trim();
  
  const res = await fetch(`/api/pnr/${cleanPnr}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${res.status}: Failed to load PNR status`);
  }
  
  const payload = await res.json();
  if (!payload.success) {
    throw new Error(payload.message || "PNR status check failed");
  }
  
  return payload.data;
};
