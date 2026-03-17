"use client";

import { useState } from "react";
import Head from "next/head";

const railwayStaff = [
  {
    name: "Ajay Singh",
    phone: "9876543210",
    email: "ajay.singh@railways.gov.in",
    designation: "Station Master",
  },
  {
    name: "Neha Sharma",
    phone: "9876543211",
    email: "neha.sharma@railways.gov.in",
    designation: "Ticket Inspector",
  },
  {
    name: "Ravi Kumar",
    phone: "9876543212",
    email: "ravi.kumar@railways.gov.in",
    designation: "Train Controller",
  },
  {
    name: "Sunita Patel",
    phone: "9876543213",
    email: "sunita.patel@railways.gov.in",
    designation: "Customer Support",
  },
  {
    name: "Anil Verma",
    phone: "9876543214",
    email: "anil.verma@railways.gov.in",
    designation: "Operations Manager",
  },
  {
    name: "Priya Gupta",
    phone: "9876543215",
    email: "priya.gupta@railways.gov.in",
    designation: "Safety Officer",
  },
  {
    name: "Vikram Joshi",
    phone: "9876543216",
    email: "vikram.joshi@railways.gov.in",
    designation: "Maintenance Head",
  },
  {
    name: "Kavita Rao",
    phone: "9876543217",
    email: "kavita.rao@railways.gov.in",
    designation: "Reservation Officer",
  },
  {
    name: "Suresh Iyer",
    phone: "9876543218",
    email: "suresh.iyer@railways.gov.in",
    designation: "Public Relations",
  },
  {
    name: "Deepa Nair",
    phone: "9876543219",
    email: "deepa.nair@railways.gov.in",
    designation: "Complaint Handler",
  },
];

export default function ContactPage() {
  const [complainName, setComplainName] = useState("");
  const [complainPhone, setComplainPhone] = useState("");
  const [complainEmail, setComplainEmail] = useState("");
  const [referTo, setReferTo] = useState("");
  const [complainMessage, setComplainMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: complainName,
          phone: complainPhone,
          email: complainEmail,
          referTo,
          message: complainMessage,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess("Complaint submitted successfully!");
      setComplainName("");
      setComplainPhone("");
      setComplainEmail("");
      setReferTo("");
      setComplainMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contacts</title>
      </Head>
      <div className="min-h-screen bg-[#ECF0F1] py-10 px-4 sm:px-6 lg:px-8 text-[#2C3E50]">
        <div className="max-w-5xl mx-auto space-y-12">
          <h1 className="text-4xl font-extrabold text-center">
            Railway Help &amp; Contacts
          </h1>

          {/* --- Display detailed railway personnel info --- */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Railway Personnel
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {railwayStaff.map(({ name, phone, email, designation }) => (
                <div
                  key={name}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
                >
                  <div className="text-xl font-bold text-red-600">
                    {name}
                  </div>
                  <div className="text-gray-700">{designation}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    📞 {phone}
                  </div>
                  <div className="text-sm text-gray-600">
                    ✉️ {email}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- Complaint Form Section 
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Lodge a Complaint
            </h2>
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-xl shadow-md space-y-4"
            >
              <input
                type="text"
                placeholder="Your Name"
                value={complainName}
                onChange={(e) => setComplainName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="tel"
                placeholder="Your Phone"
                value={complainPhone}
                onChange={(e) => setComplainPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={complainEmail}
                onChange={(e) => setComplainEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />

              <div>
                <label className="block font-medium mb-1">
                  Refer Complaint To
                </label>
                <input
                  type="text"
                  value={referTo}
                  onChange={(e) => setReferTo(e.target.value)}
                  list="staffList"
                  required
                  placeholder="Choose staff member"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <datalist id="staffList">
                  {railwayStaff.map(({ name }) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Complaint Message
                </label>
                <textarea
                  value={complainMessage}
                  onChange={(e) => setComplainMessage(e.target.value)}
                  rows={4}
                  required
                  placeholder="Describe your issue here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none"
                />
              </div>

              {error && (
                <p className="text-red-600 font-semibold">{error}</p>
              )}
              {success && (
                <p className="text-green-600 font-semibold">{success}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition"
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </section>
          ---*/}

        </div>
      </div>
    </>
  );
}

