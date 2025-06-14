"use client";

import { useState, useEffect } from "react";
import Head from "next/head";

interface Schedule {
  schedule_id: number;
  train_name: string;
  station_name: string;
  arrival_time: string;    // e.g., "08:30:00"
  departure_time: string;  // e.g., "08:35:00"
  city: string;
}

export default function ViewTrainSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch schedule data from the API endpoint
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/train_schedules/view");
        if (!res.ok) throw new Error("Failed to fetch schedules");
        const data = await res.json();
        setSchedules(data.schedules);
      } catch (err: any) {
        setError(err.message || "Error fetching schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Group schedules by station name
  const groupByStation = (arr: Schedule[]) =>
    arr.reduce((acc, schedule) => {
      const station = schedule.station_name;
      if (!acc[station]) {
        acc[station] = [];
      }
      acc[station].push(schedule);
      return acc;
    }, {} as Record<string, Schedule[]>);

  const groupedSchedules = groupByStation(schedules);

  return (
    <>
      <Head>
        <title>Train Schedules</title>
      </Head>
      <div className="min-h-screen bg-white p-6 flex flex-col items-center text-black">
        <div className="max-w-5xl w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-8">Train Schedules</h1>

          {loading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center">{error}</p>}
          {Object.keys(groupedSchedules).length === 0 && !loading && (
            <p className="text-center">No schedules available.</p>
          )}

          {Object.entries(groupedSchedules).map(([station, schedules]) => {
            // Assume that all schedules in this group belong to the same city.
            const city = schedules[0]?.city || "";
            return (
              <div key={station} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Station-Name: {station} – City: {city}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Schedule-ID</th>
                        <th className="border p-2">Train Name</th>
                        <th className="border p-2">Arrival</th>
                        <th className="border p-2">Departure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((sch) => (
                        <tr key={sch.schedule_id} className="border-b hover:bg-gray-50">
                          <td className="border p-2">{sch.schedule_id}</td>
                          <td className="border p-2">{sch.train_name}</td>
                          <td className="border p-2">{sch.arrival_time}</td>
                          <td className="border p-2">{sch.departure_time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

