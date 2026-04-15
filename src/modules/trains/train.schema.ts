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

// Inferred TypeScript types
export type TrainData = z.infer<typeof TrainDataSchema>;
export type TrainInfo = z.infer<typeof TrainInfoSchema>;
export type RouteStation = z.infer<typeof RouteStationSchema>;

// Standard API response type
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  timestamp: number;
};
