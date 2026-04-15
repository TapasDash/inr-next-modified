import { fetchText } from "@/utils/fetcher";
import { getDayIndexFromDate } from "@/utils/date";
import type {
  ApiResponse,
  TrainData,
  TrainInfo,
  RouteStation,
} from "./train.schema";

// Parser: Train search between stations
export const parseTrainSearch = (rawData: string): ApiResponse<TrainData[]> => {
  try {
    const data = rawData.split("~~~~~~~~").filter(Boolean);

    // Check for error responses
    const noResponse = data[0]?.split("~")[5]?.split("<")[0];
    if (noResponse === "No direct trains found") {
      return { success: false, message: noResponse, timestamp: Date.now() };
    }

    const errorMessages = [
      "Please try again after some time.",
      "From station not found",
      "To station not found",
    ];

    if (errorMessages.some((msg) => data[0]?.includes(msg))) {
      return {
        success: false,
        message: data[0].replaceAll("~", ""),
        timestamp: Date.now(),
      };
    }

    // Parse train data
    const trains: TrainData[] = [];

    for (const item of data) {
      const filteredData = item.split("~^");
      if (filteredData.length === 2) {
        const parts = filteredData[1].split("~").filter(Boolean);

        if (parts.length >= 14) {
          trains.push({
            trainNo: parts[0],
            trainName: parts[1],
            sourceStationName: parts[2],
            sourceStationCode: parts[3],
            destinationStationName: parts[4],
            destinationStationCode: parts[5],
            fromStationName: parts[6],
            fromStationCode: parts[7],
            toStationName: parts[8],
            toStationCode: parts[9],
            fromTime: parts[10],
            toTime: parts[11],
            travelTime: parts[12],
            runningDays: parts[13],
          });
        }
      }
    }

    return { success: true, data: trains, timestamp: Date.now() };
  } catch (error) {
    console.error("Parse error (train search):", error);
    console.error("Raw payload:", rawData);
    return {
      success: false,
      message: "Failed to parse upstream response",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};

// Parser: Train info
export const parseTrainInfo = (rawData: string): ApiResponse<TrainInfo> => {
  try {
    const data = rawData.split("~~~~~~~~");

    const errorMessages = [
      "Please try again after some time.",
      "Train not found",
    ];

    if (errorMessages.some((msg) => data[0]?.includes(msg))) {
      return {
        success: false,
        message: data[0].replaceAll("~", ""),
        timestamp: Date.now(),
      };
    }

    let filteredData = data[0].split("~").filter(Boolean);
    if (filteredData[1]?.length > 6) filteredData.shift();

    const secondPart = data[1]?.split("~").filter(Boolean) || [];

    const trainInfo: TrainInfo = {
      trainNo: filteredData[1]?.replace("^", ""),
      trainName: filteredData[2],
      fromStationName: filteredData[3],
      fromStationCode: filteredData[4],
      toStationName: filteredData[5],
      toStationCode: filteredData[6],
      fromTime: filteredData[11],
      toTime: filteredData[12],
      travelTime: filteredData[13],
      runningDays: filteredData[14],
      type: secondPart[11],
      trainId: secondPart[12],
      distanceFromTo: secondPart[18],
      averageSpeed: secondPart[19],
    };

    return { success: true, data: trainInfo, timestamp: Date.now() };
  } catch (error) {
    console.error("Parse error (train info):", error);
    console.error("Raw payload:", rawData);
    return {
      success: false,
      message: "Failed to parse train info",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};

// Parser: Train route
export const parseTrainRoute = (
  rawData: string,
): ApiResponse<RouteStation[]> => {
  try {
    const data = rawData.split("~^");
    const stations: RouteStation[] = [];

    for (const item of data) {
      const parts = item.split("~").filter(Boolean);

      if (parts.length >= 9) {
        stations.push({
          sourceStationName: parts[2],
          sourceStationCode: parts[1],
          arrival: parts[3],
          departure: parts[4],
          distance: parts[6],
          day: parts[7],
          zone: parts[9],
        });
      }
    }

    return { success: true, data: stations, timestamp: Date.now() };
  } catch (error) {
    console.error("Parse error (train route):", error);
    console.error("Raw payload:", rawData);
    return {
      success: false,
      message: "Failed to parse train route",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};

// Main service: Search trains between stations
export const searchTrains = async (
  from: string,
  to: string,
  date: string,
): Promise<ApiResponse<TrainData[]>> => {
  try {
    const url = `https://erail.in/rail/getTrains.aspx?Station_From=${from}&Station_To=${to}&DataSource=0&Language=0&Cache=true`;

    const rawData = await fetchText(url);
    const parsed = parseTrainSearch(rawData);

    if (!parsed.success || !parsed.data) return parsed;

    // Filter by running days
    const dayIndex = getDayIndexFromDate(date);
    const filteredTrains = parsed.data.filter(
      (train) => train.runningDays[dayIndex] === "1",
    );

    return { success: true, data: filteredTrains, timestamp: Date.now() };
  } catch (error) {
    console.error("Search trains error:", error);
    return {
      success: false,
      message: "Upstream API timeout",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};

// Main service: Get train details
export const getTrainDetails = async (
  trainNo: string,
): Promise<ApiResponse<{ info: TrainInfo; route: RouteStation[] }>> => {
  try {
    // Fetch train info from eRail
    const urlInfo = `https://erail.in/rail/getTrains.aspx?TrainNo=${trainNo}&DataSource=0&Language=0&Cache=true`;
    const rawDataInfo = await fetchText(urlInfo);
    const infoResult = parseTrainInfo(rawDataInfo);

    if (!infoResult.success || !infoResult.data) {
      return {
        success: false,
        message: infoResult.message || "Failed to fetch train info",
        statusCode: infoResult.statusCode || 500,
        timestamp: Date.now(),
      };
    }

    // Fetch train route
    const trainId = infoResult.data.trainId;
    const urlRoute = `https://erail.in/data.aspx?Action=TRAINROUTE&Password=2012&Data1=${trainId}&Data2=0&Cache=true`;
    const rawDataRoute = await fetchText(urlRoute);
    const routeResult = parseTrainRoute(rawDataRoute);

    if (!routeResult.success || !routeResult.data) {
      return {
        success: true,
        data: { info: infoResult.data, route: [] },
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      data: { info: infoResult.data, route: routeResult.data },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Get train details error:", error);
    return {
      success: false,
      message: "Upstream API timeout",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};
