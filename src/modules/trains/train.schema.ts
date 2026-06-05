import { z } from "zod";

// Input validation schemas
export const SearchParamsSchema = z.object({
  from: z.string().min(2).max(10).toUpperCase(),
  to: z.string().min(2).max(10).toUpperCase(),
  date: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, "Date must be in DD-MM-YYYY format"),
});

export const TrainNoParamsSchema = z.object({
  trainNo: z.string().regex(/^\d+$/, "Train number must be numeric"),
});

// Train data types
export const TrainDataSchema = z.object({
  trainNo: z.string(),
  trainName: z.string(),
  sourceStationName: z.string(),
  sourceStationCode: z.string(),
  destinationStationName: z.string(),
  destinationStationCode: z.string(),
  fromStationName: z.string(),
  fromStationCode: z.string(),
  toStationName: z.string(),
  toStationCode: z.string(),
  fromTime: z.string(),
  toTime: z.string(),
  travelTime: z.string(),
  runningDays: z.string(), // Binary string like "1111111"
});

export const TrainInfoSchema = z.object({
  trainNo: z.string(),
  trainName: z.string(),
  fromStationName: z.string(),
  fromStationCode: z.string(),
  toStationName: z.string(),
  toStationCode: z.string(),
  fromTime: z.string(),
  toTime: z.string(),
  travelTime: z.string(),
  runningDays: z.string(),
  type: z.string(),
  trainId: z.string(),
  distanceFromTo: z.string(),
  averageSpeed: z.string(),
});

export const RouteStationSchema = z.object({
  sourceStationName: z.string(),
  sourceStationCode: z.string(),
  arrival: z.string(),
  departure: z.string(),
  distance: z.string(),
  day: z.string(),
  zone: z.string(),
});

// Live Train Status schema
export const LiveTrainHaltSchema = z.object({
  stationCode: z.string(),
  stationName: z.string(),
  scheduledArrival: z.string(),
  scheduledDeparture: z.string(),
  actualArrival: z.string(),
  actualDeparture: z.string(),
  delayArrival: z.number(),
  delayDeparture: z.number(),
  status: z.enum(["yet_to_arrive", "arrived", "departed", "cancelled"]),
  platform: z.string(),
});

export const LiveTrainStatusSchema = z.object({
  trainNo: z.string(),
  trainName: z.string(),
  lastUpdated: z.string(),
  currentStationCode: z.string(),
  currentStationName: z.string(),
  currentStatus: z.string(),
  delayMinutes: z.number(),
  route: z.array(LiveTrainHaltSchema),
});

// Live Station Status schema
export const LiveStationTrainSchema = z.object({
  trainNo: z.string(),
  trainName: z.string(),
  route: z.string(),
  trainType: z.string(),
  classes: z.array(z.string()),
  scheduledArrival: z.string(),
  actualArrival: z.string(),
  delayArrival: z.number(),
  scheduledDeparture: z.string(),
  actualDeparture: z.string(),
  delayDeparture: z.number(),
  platform: z.string(),
});

export const LiveStationStatusSchema = z.object({
  stationCode: z.string(),
  stationName: z.string(),
  hours: z.number(),
  toStationCode: z.string().optional(),
  trains: z.array(LiveStationTrainSchema),
});

// Inferred TypeScript types
export type TrainData = z.infer<typeof TrainDataSchema>;
export type TrainInfo = z.infer<typeof TrainInfoSchema>;
export type RouteStation = z.infer<typeof RouteStationSchema>;
export type LiveTrainHalt = z.infer<typeof LiveTrainHaltSchema>;
export type LiveTrainStatus = z.infer<typeof LiveTrainStatusSchema>;
export type LiveStationTrain = z.infer<typeof LiveStationTrainSchema>;
export type LiveStationStatus = z.infer<typeof LiveStationStatusSchema>;

// Standard API response type
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  timestamp: number;
};

