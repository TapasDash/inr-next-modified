import { fetchData, RAILROVER_API_BASE } from "@/utils/fetcher";

export type PnrPassenger = {
  passenger_number: number;
  booking_status: string;
  current_status: string;
  coach: string;
  berth_no: string;
};

export type NormalizedPnrData = {
  pnr: string;
  trainNo: string;
  trainName: string;
  dateOfJourney: string;
  from: string;
  to: string;
  class: string;
  chartStatus: string;
  passenger_info: PnrPassenger[];
};

export type PnrResponse = {
  success: boolean;
  timestamp: number;
  data?: NormalizedPnrData;
  message?: string;
  statusCode?: number;
};

// Helper to extract coach and berth number from CNF/RAC status string (e.g. "CNF/B3/12/UB" -> { coach: "B3", berth: "12" })
const extractCoachAndBerth = (bookingStatus: string, currentStatus: string) => {
  const statusStr = currentStatus || bookingStatus || "";
  const parts = statusStr.split("/");
  if (parts.length >= 3) {
    return {
      coach: parts[1].trim(),
      berthNo: parts[2].trim(),
    };
  }
  return { coach: "N/A", berthNo: "N/A" };
};

// Fetch and normalize PNR status from the Railrover API
export const fetchPnrStatus = async (pnr: string): Promise<PnrResponse> => {
  try {
    const url = `${RAILROVER_API_BASE}/api/pnr/${encodeURIComponent(pnr)}`;
    
    // Fetch direct response from Railrover API
    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: 300 }, // 5-minute cache
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Upstream API returned HTTP ${response.status}`,
        statusCode: 502,
        timestamp: Date.now(),
      };
    }

    const json = await response.json();
    if (!json.success || !json.data) {
      return {
        success: false,
        message: json.message || "PNR status lookup failed",
        statusCode: json.statusCode || 400,
        timestamp: Date.now(),
      };
    }

    const rawData = json.data;

    // Map passengers list to match the UI passenger_info expectation
    const passengers: PnrPassenger[] = (rawData.passengers || []).map((pax: any, idx: number) => {
      const { coach, berthNo } = extractCoachAndBerth(pax.bookingStatus, pax.currentStatus);
      return {
        passenger_number: pax.number || (idx + 1),
        booking_status: pax.bookingStatus || "N/A",
        current_status: pax.currentStatus || "N/A",
        coach,
        berth_no: berthNo,
      };
    });

    // Construct normalized PNR data
    const normalizedData: NormalizedPnrData = {
      pnr: rawData.pnr || pnr,
      trainNo: rawData.trainNo || "N/A",
      trainName: rawData.trainName || "N/A",
      dateOfJourney: rawData.dateOfJourney || "N/A",
      from: rawData.fromStationCode || "N/A",
      to: rawData.toStationCode || "N/A",
      class: rawData.class || "N/A",
      chartStatus: rawData.chartStatus || "N/A",
      passenger_info: passengers,
    };

    return {
      success: true,
      timestamp: Date.now(),
      data: normalizedData,
    };
  } catch (error: any) {
    console.error("fetchPnrStatus error:", error);
    return {
      success: false,
      message: error?.message || "Failed to retrieve PNR status",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};
