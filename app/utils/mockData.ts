import type { TrainData, TrainInfo, RouteStation } from "@/modules/trains/train.schema";

// High-fidelity Mock Data matching standard Indian Rail JSON outputs
export const MOCK_TRAINS: TrainData[] = [
  {
    trainNo: "12952",
    trainName: "MUMBAI RAJDHANI",
    sourceStationName: "NEW DELHI",
    sourceStationCode: "NDLS",
    destinationStationName: "MUMBAI CENTRAL",
    destinationStationCode: "MMCT",
    fromStationName: "NEW DELHI",
    fromStationCode: "NDLS",
    toStationName: "MUMBAI CENTRAL",
    toStationCode: "MMCT",
    fromTime: "16:55",
    toTime: "08:35",
    travelTime: "15:40",
    runningDays: "1111111",
  },
  {
    trainNo: "12002",
    trainName: "NDLS SHATABDI EXP",
    sourceStationName: "NEW DELHI",
    sourceStationCode: "NDLS",
    destinationStationName: "HABIBGANJ",
    destinationStationCode: "HBJ",
    fromStationName: "NEW DELHI",
    fromStationCode: "NDLS",
    toStationName: "HABIBGANJ",
    toStationCode: "HBJ",
    fromTime: "06:00",
    toTime: "14:40",
    travelTime: "08:40",
    runningDays: "1111111",
  },
  {
    trainNo: "12010",
    trainName: "ADI MMCT SHATABDI",
    sourceStationName: "AHMEDABAD JN",
    sourceStationCode: "ADI",
    destinationStationName: "MUMBAI CENTRAL",
    destinationStationCode: "MMCT",
    fromStationName: "AHMEDABAD JN",
    fromStationCode: "ADI",
    toStationName: "MUMBAI CENTRAL",
    toStationCode: "MMCT",
    fromTime: "15:10",
    toTime: "21:45",
    travelTime: "06:35",
    runningDays: "1111110",
  },
  {
    trainNo: "12926",
    trainName: "PASCHIM EXPRESS",
    sourceStationName: "AMRITSAR JN",
    sourceStationCode: "ASR",
    destinationStationName: "BANDRA TERMINUS",
    destinationStationCode: "BDTS",
    fromStationName: "NEW DELHI",
    fromStationCode: "NDLS",
    toStationName: "MUMBAI CENTRAL",
    toStationCode: "MMCT",
    fromTime: "16:35",
    toTime: "14:45",
    travelTime: "22:10",
    runningDays: "1111111",
  },
  {
    trainNo: "12260",
    trainName: "HWH NDLS DURONTO",
    sourceStationName: "HOWRAH JN",
    sourceStationCode: "HWH",
    destinationStationName: "NEW DELHI",
    destinationStationCode: "NDLS",
    fromStationName: "HOWRAH JN",
    fromStationCode: "HWH",
    toStationName: "NEW DELHI",
    toStationCode: "NDLS",
    fromTime: "16:15",
    toTime: "10:30",
    travelTime: "18:15",
    runningDays: "0110100",
  },
];

export const MOCK_SCHEDULES: Record<string, { info: TrainInfo; route: RouteStation[] }> = {
  "12952": {
    info: {
      trainNo: "12952",
      trainName: "MUMBAI RAJDHANI",
      fromStationName: "NEW DELHI",
      fromStationCode: "NDLS",
      toStationName: "MUMBAI CENTRAL",
      toStationCode: "MMCT",
      fromTime: "16:55",
      toTime: "08:35",
      travelTime: "15:40",
      runningDays: "1111111",
      type: "Rajdhani",
      trainId: "12952",
      distanceFromTo: "1386",
      averageSpeed: "88 km/h",
    },
    route: [
      { sourceStationName: "NEW DELHI", sourceStationCode: "NDLS", arrival: "Source", departure: "16:55", distance: "0", day: "1", zone: "NR" },
      { sourceStationName: "KOTA JN", sourceStationCode: "KOTA", arrival: "21:30", departure: "21:40", distance: "465", day: "1", zone: "WCR" },
      { sourceStationName: "RATLAM JN", sourceStationCode: "RTM", arrival: "00:42", departure: "00:45", distance: "731", day: "2", zone: "WR" },
      { sourceStationName: "VADODARA JN", sourceStationCode: "BRC", arrival: "03:40", departure: "03:50", distance: "992", day: "2", zone: "WR" },
      { sourceStationName: "SURAT", sourceStationCode: "ST", arrival: "05:13", departure: "05:18", distance: "1122", day: "2", zone: "WR" },
      { sourceStationName: "BORIVALI", sourceStationCode: "BVI", arrival: "07:57", departure: "07:59", distance: "1356", day: "2", zone: "WR" },
      { sourceStationName: "MUMBAI CENTRAL", sourceStationCode: "MMCT", arrival: "08:35", departure: "Destination", distance: "1386", day: "2", zone: "WR" },
    ],
  },
  "12002": {
    info: {
      trainNo: "12002",
      trainName: "NDLS SHATABDI EXP",
      fromStationName: "NEW DELHI",
      fromStationCode: "NDLS",
      toStationName: "HABIBGANJ",
      toStationCode: "HBJ",
      fromTime: "06:00",
      toTime: "14:40",
      travelTime: "08:40",
      runningDays: "1111111",
      type: "Shatabdi",
      trainId: "12002",
      distanceFromTo: "709",
      averageSpeed: "82 km/h",
    },
    route: [
      { sourceStationName: "NEW DELHI", sourceStationCode: "NDLS", arrival: "Source", departure: "06:00", distance: "0", day: "1", zone: "NR" },
      { sourceStationName: "MATHURA JN", sourceStationCode: "MTJ", arrival: "07:19", departure: "07:20", distance: "141", day: "1", zone: "NCR" },
      { sourceStationName: "AGRA CANTT", sourceStationCode: "AGC", arrival: "07:50", departure: "07:55", distance: "195", day: "1", zone: "NCR" },
      { sourceStationName: "GWALIOR JN", sourceStationCode: "GWL", arrival: "09:23", departure: "09:28", distance: "313", day: "1", zone: "NCR" },
      { sourceStationName: "VGL JHANSI JN", sourceStationCode: "VGLJ", arrival: "10:45", departure: "10:53", distance: "411", day: "1", zone: "NCR" },
      { sourceStationName: "LALITPUR JN", sourceStationCode: "LAR", arrival: "11:42", departure: "11:43", distance: "501", day: "1", zone: "NCR" },
      { sourceStationName: "BHOPAL JN", sourceStationCode: "BPL", arrival: "14:07", departure: "14:10", distance: "703", day: "1", zone: "WCR" },
      { sourceStationName: "HABIBGANJ", sourceStationCode: "HBJ", arrival: "14:40", departure: "Destination", distance: "709", day: "1", zone: "WCR" },
    ],
  },
  "12010": {
    info: {
      trainNo: "12010",
      trainName: "ADI MMCT SHATABDI",
      fromStationName: "AHMEDABAD JN",
      fromStationCode: "ADI",
      toStationName: "MUMBAI CENTRAL",
      toStationCode: "MMCT",
      fromTime: "15:10",
      toTime: "21:45",
      travelTime: "06:35",
      runningDays: "1111110",
      type: "Shatabdi",
      trainId: "12010",
      distanceFromTo: "493",
      averageSpeed: "75 km/h",
    },
    route: [
      { sourceStationName: "AHMEDABAD JN", sourceStationCode: "ADI", arrival: "Source", departure: "15:10", distance: "0", day: "1", zone: "WR" },
      { sourceStationName: "NADIAD JN", sourceStationCode: "ND", arrival: "15:46", departure: "15:48", distance: "46", day: "1", zone: "WR" },
      { sourceStationName: "ANAND JN", sourceStationCode: "ANND", arrival: "16:03", departure: "16:05", distance: "65", day: "1", zone: "WR" },
      { sourceStationName: "VADODARA JN", sourceStationCode: "BRC", arrival: "16:43", departure: "16:48", distance: "100", day: "1", zone: "WR" },
      { sourceStationName: "BHARUCH JN", sourceStationCode: "BH", arrival: "17:34", departure: "17:36", distance: "171", day: "1", zone: "WR" },
      { sourceStationName: "SURAT", sourceStationCode: "ST", arrival: "18:23", departure: "18:28", distance: "230", day: "1", zone: "WR" },
      { sourceStationName: "VAPI", sourceStationCode: "VAPI", arrival: "19:32", departure: "19:34", distance: "325", day: "1", zone: "WR" },
      { sourceStationName: "BORIVALI", sourceStationCode: "BVI", arrival: "21:07", departure: "21:10", distance: "463", day: "1", zone: "WR" },
      { sourceStationName: "MUMBAI CENTRAL", sourceStationCode: "MMCT", arrival: "21:45", departure: "Destination", distance: "493", day: "1", zone: "WR" },
    ],
  },
};

// Client API helpers with mock fallback
export const apiSearchTrains = async (from: string, to: string, date: string): Promise<TrainData[]> => {
  const cleanFrom = from.trim().toUpperCase();
  const cleanTo = to.trim().toUpperCase();
  
  try {
    const res = await fetch(`/api/search?from=${cleanFrom}&to=${cleanTo}&date=${date}`);
    if (res.ok) {
      const payload = await res.json();
      if (payload.success && payload.data) {
        return payload.data;
      }
    }
  } catch (e) {
    console.warn("API route search error, falling back to mock data:", e);
  }
  
  // High contrast fallback mock response
  return MOCK_TRAINS.filter(
    (t) =>
      (t.sourceStationCode === cleanFrom || t.fromStationCode === cleanFrom || cleanFrom === "") &&
      (t.destinationStationCode === cleanTo || t.toStationCode === cleanTo || cleanTo === "")
  );
};

export const apiGetTrainDetails = async (trainNo: string): Promise<{ info: TrainInfo; route: RouteStation[] } | null> => {
  const cleanNo = trainNo.trim();
  try {
    const res = await fetch(`/api/trains/${cleanNo}`);
    if (res.ok) {
      const payload = await res.json();
      if (payload.success && payload.data) {
        return payload.data;
      }
    }
  } catch (e) {
    console.warn("API route train details error, falling back to mock data:", e);
  }
  
  return MOCK_SCHEDULES[cleanNo] || null;
};
