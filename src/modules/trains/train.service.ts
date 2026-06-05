import { fetchData, RAILROVER_API_BASE } from "@/utils/fetcher";
import type {
  ApiResponse,
  TrainData,
  TrainInfo,
  RouteStation,
  LiveTrainStatus,
  LiveStationStatus,
} from "./train.schema";

// Main service: Search trains between stations
export const searchTrains = async (
  from: string,
  to: string,
  date: string,
): Promise<ApiResponse<TrainData[]>> => {
  try {
    const url = `${RAILROVER_API_BASE}/api/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
    const result = await fetchData<ApiResponse<TrainData[]>>(url);
    return result;
  } catch (error: any) {
    console.error("searchTrains error:", error);
    return {
      success: false,
      message: error?.message || "Failed to search trains between stations",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};

// Main service: Get train static details
export const getTrainDetails = async (
  trainNo: string,
): Promise<ApiResponse<{ info: TrainInfo; route: RouteStation[] }>> => {
  try {
    const url = `${RAILROVER_API_BASE}/api/trains/${encodeURIComponent(trainNo)}`;
    const result = await fetchData<ApiResponse<{ info: TrainInfo; route: RouteStation[] }>>(url);
    return result;
  } catch (error: any) {
    console.error("getTrainDetails error:", error);
    return {
      success: false,
      message: error?.message || "Failed to load train schedule details",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};

// Main service: Get live train running status
export const getLiveTrainStatus = async (
  trainNo: string,
  date: string,
): Promise<ApiResponse<LiveTrainStatus>> => {
  try {
    const url = `${RAILROVER_API_BASE}/v1/train/${encodeURIComponent(trainNo)}/live?date=${encodeURIComponent(date)}`;
    const result = await fetchData<ApiResponse<LiveTrainStatus>>(url);
    return result;
  } catch (error: any) {
    console.error("getLiveTrainStatus error:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch live train running status",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};

// Main service: Get live station board status
export const getLiveStationStatus = async (
  stationCode: string,
  hours: number,
  to?: string,
): Promise<ApiResponse<LiveStationStatus>> => {
  try {
    const toParam = to ? `&to=${encodeURIComponent(to)}` : "";
    const url = `${RAILROVER_API_BASE}/v1/station/${encodeURIComponent(stationCode)}/live?hours=${hours}${toParam}`;
    const result = await fetchData<ApiResponse<LiveStationStatus>>(url);
    return result;
  } catch (error: any) {
    console.error("getLiveStationStatus error:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch live station status",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};
