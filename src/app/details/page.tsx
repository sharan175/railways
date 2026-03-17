"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../layout/header";
import Footer from "../layout/footer";

interface UserDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  aadhaar: string;
  created_at: string;
}

interface Passenger {
  passenger_id: number;
  passenger_name: string;
  age: number | null;
  gender: string | null;
  seat_number: string;
}

interface Booking {
  booking_id: number;
  journey_date: string;
  total_fare:number | null;
  arrival_time: string | null;
  passengers: Passenger[];
}

export default function DetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  const handleCancel = async (booking_id: number, passenger_id: number) => {
    if (!confirm("Are you sure you want to cancel this ticket?")) return;
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id, passenger_id }),
      });
      if (!res.ok) {
        throw new Error("Failed to cancel the booking.");
      }
      setBookings((prevBookings) =>
        prevBookings.map((booking) => {
          if (booking.booking_id === booking_id) {
            return {
              ...booking,
              passengers: booking.passengers.filter(
                (p) => p.passenger_id !== passenger_id
              ),
            };
          }
          return booking;
        })
      );
    } catch (err: any) {
      alert(err.message || "Error canceling the booking");
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const resUser = await fetch("/api/users/details");
        if (!resUser.ok) throw new Error("Failed to fetch user details");
        const userData = await resUser.json();
        setUserDetails(userData.user);

        const user_id = userData.user.id || session.user?.id;
        if (!user_id) {
          throw new Error("User ID not found.");
        }

        const resBookings = await fetch(`/api/bookings/mine?user_id=${user_id}`);
        if (!resBookings.ok)
          throw new Error("Failed to fetch booking details");
        const bookingData = await resBookings.json();
        setBookings(bookingData.bookings);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      }
    };

    fetchData();
  }, [session, status, router]);

  return (
    <>
      <Head>
        <title>User &amp; Booking Details</title>
      </Head>
      <Header />
      <main className="min-h-screen bg-[#ECF0F1] py-10 px-4 text-[#2C3E50]">
        <div className="container mx-auto">
          {error && (
            <p className="text-center text-red-500 mb-4">{error}</p>
          )}
         
         

<div className="flex flex-col md:flex-row">
  {/* User Details Column – remains fixed */}
  <aside className="md:w-1/3 sticky top-4 h-screen overflow-y-auto pr-4">
    {/* This is your user details component/section */}
    <section className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg">
      {/* Header with Avatar and Name/Email */}
      <div className="flex items-center border border-gray-300 p-4 rounded-md mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-4xl font-bold text-blue-900">
          {userDetails ? userDetails.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="ml-4">
          <h2 className="text-3xl font-extrabold text-gray-800">
            {userDetails ? userDetails.name : "Loading..."}
          </h2>
          <p className="text-gray-600">
            {userDetails ? userDetails.email : ""}
          </p>
        </div>
      </div>

      {/* User Information – each detail in its own bordered container */}
      <div className="space-y-4">
        <div className="border border-gray-300 p-4 rounded-md">
          <span className="font-semibold inline-block w-32">Phone:</span>
          <span>{userDetails?.phone}</span>
        </div>
        <div className="border border-gray-300 p-4 rounded-md">
          <span className="font-semibold inline-block w-32">Gender:</span>
          <span>{userDetails?.gender}</span>
        </div>
        <div className="border border-gray-300 p-4 rounded-md">
          <span className="font-semibold inline-block w-32">DOB:</span>
          <span>
            {userDetails &&
              new Date(userDetails.dob).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </span>
        </div>
        <div className="border border-gray-300 p-4 rounded-md">
          <span className="font-semibold inline-block w-32">Aadhaar:</span>
          <span>{userDetails?.aadhaar}</span>
        </div>
        <div className="border border-gray-300 p-4 rounded-md">
          <span className="font-semibold inline-block w-32">Address:</span>
          <span>{userDetails?.address}</span>
        </div>
        <div className="border border-gray-300 p-4 rounded-md">
          <span className="font-semibold inline-block w-32">Registered On:</span>
          <span>
            {userDetails &&
              new Date(userDetails.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </span>
        </div>
      </div>
    </section>
  </aside>

  {/* Booking Details Column – scrollable */}
  <main className="md:w-2/3 h-screen overflow-y-auto pl-4">
<section className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg">
  <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
    Booking Details
  </h1>
  {bookings.length > 0 ? (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <div
          key={booking.booking_id}
          className="bg-white p-6 border border-gray-200 rounded-xl shadow-md transition-transform hover:scale-105"
        >
          {/* Booking Header */}
          <div className="border-b border-gray-300 pb-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-lg font-bold text-gray-800">
                  Booking ID:
                </p>
                <p className="text-gray-700">{booking.booking_id}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  Train Name:
                </p>
                <p className="text-gray-700">{booking.train_name || "-"}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  Total Fare:
                </p>
                <p className="text-gray-700">₹{booking.total_fare || "-"}</p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border border-gray-200 p-4 rounded-md">
              <p className="text-gray-700">
                <span className="font-bold">From Station: </span>
                {booking.from_station_name || "-"}
              </p>
            </div>
            <div className="border border-gray-200 p-4 rounded-md">
              <p className="text-gray-700">
                <span className="font-bold">To Station: </span>
                {booking.to_station_name || "-"}
              </p>
            </div>
            <div className="border border-gray-200 p-4 rounded-md">
              <p className="text-gray-700">
                <span className="font-bold">Journey Date: </span>
                {new Date(booking.journey_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="border border-gray-200 p-4 rounded-md mb-4">
            <p className="text-gray-700">
              <span className="font-bold">Arrival Time: </span>
              {booking.arrival_time
                ? new Date("1970-01-01T" + booking.arrival_time).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
                            {booking.status === "cancelled" && (
      <span className="ml-2 text-red-500 font-bold">Cancelled</span>
    )}
            </p>
          </div>

          {/* Passenger Details */}
          {booking.passengers.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Passenger Details
              </h2>
              <div className="space-y-4">
                {booking.passengers.map((p) => (
                  <div
                    key={p.passenger_id}
                    className="border border-gray-200 p-4 rounded-md bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <p className="text-gray-700">
                          <span className="font-bold">Paasseger-ID: </span>
                          {p.passenger_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <span className="font-bold">Name: </span>
                          {p.passenger_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <span className="font-bold">Age: </span>
                          {p.age ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <span className="font-bold">Gender: </span>
                          {p.gender ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <span className="font-bold">Seat: </span>
                          {p.seat_number || "-"}
                        </p>
                      </div>
                    </div>
                    {/* Cancel Button aligned to bottom-right */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() =>
                          handleCancel(booking.booking_id, p.passenger_id)
                        }
                        className="px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition-colors"
                      >
                        Cancel Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center text-gray-700">No bookings have been made.</p>
  )}
</section>

  </main>
</div>

         
        </div>
      </main>
      <Footer />
    </>
  );
}

