"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import UserSessionCard from "@/components/partials/SessionCard";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";

ChartJS.register(
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Legend
);

// Mock Data
const mockData = {
  kpi: {
    revenueTotal: { value: 1250000, change: 8.2 },
    conversionRate: { value: 12.5, change: -1.3 },
    totalLeads: { value: 1500, change: 5.7 },
    newLeads: { value: 250, change: 12.1 },
  },
  agentPerformance: [
    {
      name: "John Doe",
      leadsHandled: 120,
      conversion: 15,
      revenue: 180000,
      score: 85,
      trend: [70, 75, 80, 82, 85, 88, 85, 87, 90, 85],
    },
    {
      name: "Jane Smith",
      leadsHandled: 95,
      conversion: 10,
      revenue: 140000,
      score: 78,
      trend: [65, 70, 72, 75, 78, 76, 78, 80, 79, 78],
    },
    {
      name: "Mike Johnson",
      leadsHandled: 150,
      conversion: 18,
      revenue: 220000,
      score: 92,
      trend: [80, 85, 88, 90, 92, 91, 92, 94, 93, 92],
    },
    {
      name: "Emily Brown",
      leadsHandled: 80,
      conversion: 8,
      revenue: 110000,
      score: 70,
      trend: [60, 65, 68, 70, 69, 70, 70, 72, 71, 70],
    },
    {
      name: "Chris Wilson",
      leadsHandled: 110,
      conversion: 13,
      revenue: 160000,
      score: 80,
      trend: [75, 78, 80, 79, 80, 81, 80, 82, 81, 80],
    },
  ],
  reports: {
    branches: ["Branch A", "Branch B", "Branch C"],
    projects: ["Project X", "Project Y"],
    salesModels: ["Direct", "Partner"],
    data: {
      "Branch A": { leads: 500, conversions: 60, revenue: 450000 },
      "Branch B": { leads: 400, conversions: 45, revenue: 350000 },
      "Branch C": { leads: 600, conversions: 80, revenue: 550000 },
      "Project X": { leads: 700, conversions: 90, revenue: 600000 },
      "Project Y": { leads: 300, conversions: 30, revenue: 250000 },
      Direct: { leads: 800, conversions: 100, revenue: 700000 },
      Partner: { leads: 400, conversions: 40, revenue: 300000 },
    },
  },
  incentives: {
    totalEarned: 50000,
    pending: 20000,
    cleared: 30000,
    byAgent: [
      { name: "John Doe", earned: 15000, pending: 5000, cleared: 10000 },
      { name: "Jane Smith", earned: 12000, pending: 6000, cleared: 6000 },
      { name: "Mike Johnson", earned: 18000, pending: 7000, cleared: 11000 },
      { name: "Emily Brown", earned: 8000, pending: 4000, cleared: 4000 },
      { name: "Chris Wilson", earned: 11000, pending: 5000, cleared: 6000 },
    ],
  },
  aging: {
    buckets: [
      { range: "0-30", count: 40, amount: 10000, actions: "Follow-up scheduled" },
      { range: "31-60", count: 30, amount: 7500, actions: "Escalated to manager" },
      { range: "61-90", count: 20, amount: 5000, actions: "Pending review" },
      { range: "90+", count: 10, amount: 2500, actions: "Legal action initiated" },
    ],
  },
};

// MiniChart Component
const MiniChart = ({ dataPoints, color }) => {
  const chartData = {
    labels: dataPoints.map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        data: dataPoints,
        fill: true,
        backgroundColor: `${color}33`,
        borderColor: color,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { line: { borderWidth: 2 } },
  };

  return <Line data={chartData} options={options} height={50} />;
};

// AgentPerformanceTable Component
const AgentPerformanceTable = ({ agents, period }) => {
  const [sortField, setSortField] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedAgents = [...agents].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
  });

  const handleSort = (field) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === "desc" ? "asc" : "desc");
  };

  const summary = {
    leadsHandled: agents.reduce((sum, a) => sum + a.leadsHandled, 0),
    conversion: (agents.reduce((sum, a) => sum + a.conversion, 0) / agents.length).toFixed(1),
    revenue: agents.reduce((sum, a) => sum + a.revenue, 0),
    score: (agents.reduce((sum, a) => sum + a.score, 0) / agents.length).toFixed(1),
  };

  const chartData = {
    labels: agents[0].trend.map((_, i) => `Day ${i + 1}`),
    datasets: agents.map((agent) => ({
      label: agent.name,
      data: agent.trend,
      borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      tension: 0.4,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Agent Performance ({period})</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Export Data</button>
      </div>
      <div className="mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>
      <table className="w-full text-sm text-gray-300">
        <thead>
          <tr className="border-b border-gray-600">
            {["Agent", "Leads Handled", "Conversion %", "Revenue", "Score", "Trend"].map((header, idx) => (
              <th
                key={header}
                className="py-2 text-left cursor-pointer"
                onClick={() =>
                  handleSort(
                    idx === 0
                      ? "name"
                      : idx === 1
                      ? "leadsHandled"
                      : idx === 2
                      ? "conversion"
                      : idx === 3
                      ? "revenue"
                      : "score"
                  )
                }
              >
                {header}{" "}
                {sortField ===
                  (idx === 0
                    ? "name"
                    : idx === 1
                    ? "leadsHandled"
                    : idx === 2
                    ? "conversion"
                    : idx === 3
                    ? "revenue"
                    : "score") && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedAgents.map((agent, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="py-3">{agent.name}</td>
              <td>{agent.leadsHandled}</td>
              <td>{agent.conversion}%</td>
              <td>₹{agent.revenue.toLocaleString()}</td>
              <td>{agent.score}</td>
              <td className="w-24">
                <MiniChart dataPoints={agent.trend} color="#60A5FA" />
              </td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="py-3">Summary</td>
            <td>{summary.leadsHandled}</td>
            <td>{summary.conversion}%</td>
            <td>₹{summary.revenue.toLocaleString()}</td>
            <td>{summary.score}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// BranchReportChart Component
const BranchReportChart = ({ reports }) => {
  const [filterType, setFilterType] = useState("branches");
  const [selectedItem, setSelectedItem] = useState(reports.branches[0]);

  const items = reports[filterType];
  const chartData = {
    labels: items,
    datasets: [
      {
        label: "Leads",
        data: items.map((item) => reports.data[item].leads),
        backgroundColor: "#60A5FA",
      },
      {
        label: "Conversions",
        data: items.map((item) => reports.data[item].conversions),
        backgroundColor: "#4ADE80",
      },
      {
        label: "Revenue (k)",
        data: items.map((item) => reports.data[item].revenue / 1000),
        backgroundColor: "#D4AF37",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Reports</h3>
        <div className="flex space-x-2">
          {["branches", "projects", "salesModels"].map((type) => (
            <button
              key={type}
              className={`px-4 py-2 rounded-lg ${
                filterType === type ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
              }`}
              onClick={() => {
                setFilterType(type);
                setSelectedItem(reports[type][0]);
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <select
          className="bg-gray-800 text-white rounded-lg p-2 w-full"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          {items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

// IncentiveCard Component
const IncentiveCard = ({ incentives }) => {
  const progress = (incentives.cleared / incentives.totalEarned) * 100;

  const chartData = {
    labels: ["Pending", "Cleared"],
    datasets: [
      {
        data: [incentives.pending, incentives.cleared],
        backgroundColor: ["#F472B6", "#4ADE80"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "right" } },
    cutout: "50%",
  };

  return (
    <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Incentives & Payments</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Total Earned</p>
            <p className="text-xl font-bold text-white">₹{incentives.totalEarned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-xl font-bold text-white">₹{incentives.pending.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Cleared</p>
            <p className="text-xl font-bold text-white">₹{incentives.cleared.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Progress</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        <div>
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-white mb-2">By Agent</h4>
        <table className="w-full text-sm text-gray-300">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 text-left">Agent</th>
              <th className="py-2 text-left">Earned</th>
              <th className="py-2 text-left">Pending</th>
              <th className="py-2 text-left">Cleared</th>
            </tr>
          </thead>
          <tbody>
            {incentives.byAgent.map((agent, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="py-3">{agent.name}</td>
                <td>₹{agent.earned.toLocaleString()}</td>
                <td>₹{agent.pending.toLocaleString()}</td>
                <td>₹{agent.cleared.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// AgingPieChart Component
const AgingPieChart = ({ aging }) => {
  const chartData = {
    labels: aging.buckets.map((b) => b.range),
    datasets: [
      {
        data: aging.buckets.map((b) => b.count),
        backgroundColor: ["#60A5FA", "#4ADE80", "#D4AF37", "#F472B6"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "right" } },
  };

  return (
    <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Aging Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Pie data={chartData} options={options} />
        </div>
        <div>
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="py-2 text-left">Range</th>
                <th className="py-2 text-left">Count</th>
                <th className="py-2 text-left">Amount</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {aging.buckets.map((bucket, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-3">{bucket.range}</td>
                  <td>{bucket.count}</td>
                  <td>₹{bucket.amount.toLocaleString()}</td>
                  <td>{bucket.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Component
const SkeletonCard = () => (
  <div className="bg-gray-800 animate-pulse p-6 rounded-xl shadow-lg">
    <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
    <div className="h-16 bg-gray-700 rounded"></div>
  </div>
);

export default function DashboardHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Daily");
  const [data, setData] = useState(null);
  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get("/user/home");
        if (data.success) {
          setData(data.data);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="mt-6">
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserSessionCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Revenue */}
            <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] flex justify-between items-center p-4 rounded-xl shadow-lg">
              <div>
                <p className="text-xs text-gray-400">Total Revenue</p>
                <h3 className="text-2xl text-white font-bold">₹{data?.revenueTotal?.toLocaleString() ?? "0"}</h3>
              </div>
              <div className="w-24">
                <MiniChart dataPoints={[10, 20, 30, 25, 40, 50, 45]} color="#D4AF37" />
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] flex justify-between items-center p-4 rounded-xl shadow-lg">
              <div>
                <p className="text-xs text-gray-400">Conversion Rate</p>
                <h3 className="text-2xl text-white font-bold">{data?.conversionRate ?? 0}%</h3>
              </div>
              <div className="w-24">
                <MiniChart dataPoints={[5, 6, 8, 7, 6, 9, 10]} color="#4ADE80" />
              </div>
            </div>

            {/* Total Leads */}
            <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] flex justify-between items-center p-4 rounded-xl shadow-lg">
              <div>
                <p className="text-xs text-gray-400">Total Leads</p>
                <h3 className="text-2xl text-white font-bold">{data?.totalLeads ?? 0}</h3>
              </div>
              <div className="w-24">
                <MiniChart dataPoints={[3, 4, 6, 5, 8, 10, 12]} color="#60A5FA" />
              </div>
            </div>

            {/* New Leads */}
            <div className="bg-gradient-to-b from-[#0c1221] to-[#0f183a] flex justify-between items-center p-4 rounded-xl shadow-lg">
              <div>
                <p className="text-xs text-gray-400">New Leads</p>
                <h3 className="text-2xl text-white font-bold">{data?.newLeads ?? 0}</h3>
              </div>
              <div className="w-24">
                <MiniChart dataPoints={[1, 2, 3, 2, 5, 3, 4]} color="#F472B6" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex space-x-4 mb-4">
            {["Daily", "Weekly", "Monthly"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <AgentPerformanceTable agents={mockData.agentPerformance} period={activeTab} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <BranchReportChart reports={mockData.reports} />
          <IncentiveCard incentives={mockData.incentives} />
        </div>
        <div className="mt-6">
          <AgingPieChart aging={mockData.aging} />
        </div>
      </div>
    </div>
  );
}
