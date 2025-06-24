import React, { useState } from "react";

const Dashboard = () => {
  const [showBanner, setShowBanner] = useState(true);

  const stats = [
    {
      title: "New Leads",
      value: "124",
      description: "↑ 12% this week",
    },
    {
      title: "Active Users",
      value: "1,276",
      description: "↗︎ 4% this month",
    },
    {
      title: "Sales Revenue",
      value: "$52,340",
      description: "↑ 8% this quarter",
    },
    {
      title: "Placement Rate",
      value: "78%",
      description: "↑ 3% from last period",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🟨 Info Banner */}
      {showBanner && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 flex items-center justify-between">
          <span>
            🚧 This is dummy data and the dashboard is under construction.
          </span>
          <button
            className="text-yellow-800 hover:text-yellow-600 font-bold text-xl leading-none"
            onClick={() => setShowBanner(false)}
            aria-label="Close banner"
          >
            &times;
          </button>
        </div>
      )}

      <header className="mb-10 mt-6 ">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to your Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Manage leads, view analytics, and monitor team performance.
        </p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
          >
            <h2 className="text-sm text-gray-500 font-medium">{item.title}</h2>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{item.value}</p>
            <p className="text-sm text-green-600 mt-1">{item.description}</p>
          </div>
        ))}
      </section>

      {/* Placeholder for more widgets */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mx-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Features</h2>
        <p className="text-gray-700">
          Soon you’ll be able to view team activity, timeline insights, and customizable reports.
        </p>
      </section>
    </div>
  );
};

export default Dashboard;
