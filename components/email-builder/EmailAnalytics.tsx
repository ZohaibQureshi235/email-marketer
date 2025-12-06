// components/EmailAnalytics.jsx
"use client";

import { useState, useEffect } from "react";
import { emailApi } from "@/api/emailApi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DailyStat {
  date: string;
  total: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

interface TopContact {
  contactId: string;
  _count: number;
  _avg: {
    openCount: number;
    clickCount: number;
  };
  contact: {
    id: string;
    email: string;
    nickname: string;
  } | null;
}

export default function EmailAnalytics() {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topContacts, setTopContacts] = useState<TopContact[]>([]);
  const [overallStats, setOverallStats] = useState<any>({});
  const [timeframe, setTimeframe] = useState(30);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async (days = 30) => {
    try {
      setLoading(true);
      const response = await emailApi.getAnalytics({ days });

      if (response.success) {
        setDailyStats(response.data.dailyStats);
        setTopContacts(response.data.topContacts);
        setOverallStats(response.data.overallStats);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(timeframe);
  }, [timeframe]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Prepare data for charts
  const lineChartData = dailyStats.map((stat) => ({
    date: formatDate(stat.date),
    sent: stat.total,
    delivered: stat.delivered,
    opened: stat.opened,
    clicked: stat.clicked,
  }));

  const pieChartData = [
    {
      name: "Delivered",
      value: overallStats._count
        ? (dailyStats.reduce((acc, curr) => acc + curr.delivered, 0) /
            dailyStats.reduce((acc, curr) => acc + curr.total, 0)) *
            100 || 0
        : 0,
    },
    {
      name: "Opened",
      value: overallStats._count
        ? (dailyStats.reduce((acc, curr) => acc + curr.opened, 0) /
            dailyStats.reduce((acc, curr) => acc + curr.total, 0)) *
            100 || 0
        : 0,
    },
    {
      name: "Clicked",
      value: overallStats._count
        ? (dailyStats.reduce((acc, curr) => acc + curr.clicked, 0) /
            dailyStats.reduce((acc, curr) => acc + curr.total, 0)) *
            100 || 0
        : 0,
    },
    {
      name: "Bounced",
      value: overallStats._count
        ? (dailyStats.reduce((acc, curr) => acc + curr.bounced, 0) /
            dailyStats.reduce((acc, curr) => acc + curr.total, 0)) *
            100 || 0
        : 0,
    },
  ];

  const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#EF4444"];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Email Analytics</h2>
          <div className="flex space-x-2">
            {[7, 30, 90, 365].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === days
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {dailyStats.reduce((acc, curr) => acc + curr.total, 0)}
            </div>
            <div className="text-sm text-blue-600">Total Emails Sent</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {overallStats._avg?.openCount?.toFixed(1) || "0.0"}%
            </div>
            <div className="text-sm text-green-600">Avg Open Rate</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {overallStats._avg?.clickCount?.toFixed(1) || "0.0"}%
            </div>
            <div className="text-sm text-purple-600">Avg Click Rate</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-700">
              {(
                (dailyStats.reduce((acc, curr) => acc + curr.bounced, 0) /
                  dailyStats.reduce((acc, curr) => acc + curr.total, 0)) *
                  100 || 0
              ).toFixed(1)}
              %
            </div>
            <div className="text-sm text-red-600">Bounce Rate</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Daily Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#3B82F6"
                  name="Sent"
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="#10B981"
                  name="Delivered"
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  stroke="#8B5CF6"
                  name="Opened"
                />
                <Line
                  type="monotone"
                  dataKey="clicked"
                  stroke="#F59E0B"
                  name="Clicked"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Engagement Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Engagement Rate
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Top Contacts */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Contacts
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topContacts.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="contact.nickname"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="_count" name="Emails Sent" fill="#3B82F6" />
                <Bar dataKey="_avg.openCount" name="Avg Opens" fill="#10B981" />
                <Bar
                  dataKey="_avg.clickCount"
                  name="Avg Clicks"
                  fill="#8B5CF6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Contacts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Top Performing Contacts
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emails Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Opens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topContacts.map((item) => (
                <tr key={item.contactId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.contact?.nickname || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.contact?.email || "No email"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item._count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item._avg.openCount?.toFixed(1) || "0.0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item._avg.clickCount?.toFixed(1) || "0.0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item._avg.openCount || 0) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-700">
                        {((item._avg.openCount || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item._avg.clickCount || 0) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-700">
                        {((item._avg.clickCount || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
