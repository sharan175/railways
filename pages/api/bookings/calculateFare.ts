// pages/api/bookings/calculateFare.ts
import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../lib/db";

type PassengerPayload = {
  passenger_name: string;
  age: number | string;
  gender: string;
};

type FarePreviewPayload = {
  train_id: number;
  from_station_id: string;
  to_station_id: string;
  coach_id: string;
  passengers: PassengerPayload[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean; fare?: number; error?: string }>
) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }
  
  const {
    train_id,
    from_station_id,
    to_station_id,
    coach_id,
    passengers,
  } = req.body as FarePreviewPayload;
  
  if (!train_id || !from_station_id || !to_station_id || !coach_id || !passengers) {
    res.status(400).json({ success: false, error: "Missing required fields" });
    return;
  }
  
  const connection = await pool.getConnection();
  try {
    // Get train type (e.g., Express, Local, etc.)
    const [trainRows] = await connection.execute(
      "SELECT type FROM trains WHERE train_id = ?",
      [train_id]
    );
    if ((trainRows as any).length === 0) {
      throw new Error("Invalid train_id.");
    }
    const trainType = (trainRows as any)[0].type as string;
    
    // Get coach type (e.g., Sleeper, AC, etc.)
    const [coachRows] = await connection.execute(
      "SELECT coach_type FROM coaches WHERE coach_id = ?",
      [coach_id]
    );
    if ((coachRows as any).length === 0) {
      throw new Error("Invalid coach_id.");
    }
    const coachType = (coachRows as any)[0].coach_type as string;
    
    // Get stop_sequence (or distance value) for departure station
    const [fromScheduleRows] = await connection.execute(
      "SELECT stop_sequence FROM train_schedules WHERE train_id = ? AND station_id = ?",
      [train_id, from_station_id]
    );
    if ((fromScheduleRows as any).length === 0) {
      throw new Error("Departure station not found in train schedules");
    }
    const fromStopSequence = (fromScheduleRows as any)[0].stop_sequence as number;
    
    // Get stop_sequence for arrival station.
    const [toScheduleRows] = await connection.execute(
      "SELECT stop_sequence FROM train_schedules WHERE train_id = ? AND station_id = ?",
      [train_id, to_station_id]
    );
    if ((toScheduleRows as any).length === 0) {
      throw new Error("Arrival station not found in train schedules");
    }
    const toStopSequence = (toScheduleRows as any)[0].stop_sequence as number;
    
    // Calculate the distance (in terms of stops)
    const stopDiff = Math.abs(toStopSequence - fromStopSequence);
    
    // Base rate per stop (for example, Rs.50 per stop)
    const baseRatePerStop = 50;
    
    // Multipliers for coach type
    const coachFareMultiplier: Record<string, number> = {
      Sleeper: 1.0,
      "AC First": 2.0,
      General: 0.75,
      "AC Second": 1.5,
    };
    // Multipliers for train type
    const trainFareMultiplier: Record<string, number> = {
      EXP: 1.2,
      LOC: 1.0,
      PAS: 1.1,
      SUP: 1.3,
    };
    
    const coachMultiplier = coachFareMultiplier[coachType] || 1.0;
    const trainMultiplier = trainFareMultiplier[trainType] || 1.0;
    
    // Calculate fare per passenger
    const farePerPassenger = stopDiff * baseRatePerStop * coachMultiplier * trainMultiplier;
    
    // Total fare multiplies the number of passengers.
    const totalFare = farePerPassenger * passengers.length;
    
    res.status(200).json({ success: true, fare: totalFare });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
}

