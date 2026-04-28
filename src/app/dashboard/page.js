"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Header from "@/app/components/header";
import axios from "redaxios";
import {
  Users,
  UserPlus,
  CheckSquare,
  ListTodo,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Activity,
  MoreVertical,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import useAuth from "../components/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  colorClass,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-[#fffdfb] via-[#fffaf6] to-[#fff7f2] hover:from-[#fffaf6] hover:to-[#fff3eb] rounded-[16px] shadow-sm border border-[#fdeee7] p-4 sm:p-5 flex flex-col hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div
          className={`p-3 rounded-xl shadow-sm transition-colors ${colorClass}`}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
        {trend && (
          <div
            className={`flex items-center text-[11px] font-bold px-2 py-1 rounded-md shadow-sm ${trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={14} className="mr-0.5" />
            ) : (
              <ArrowDownRight size={14} className="mr-0.5" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-gray-400 text-[11px] font-bold tracking-wider uppercase mb-0.5 group-hover:text-orange-500 transition-colors">
          {title}
        </h3>
        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight group-hover:text-orange-600 transition-colors">
          {value}
        </h2>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useAuth();

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const config = { headers: { Authorization: `Bearer ${currentToken}` } };

      const [leadsRes, customersRes, tasksRes, todosRes] = await Promise.all([
        axios
          .get(`${API_BASE}/api/lead/read`, config)
          .catch(() => ({ data: { result: [] } })),
        axios
          .get(`${API_BASE}/api/customers/get-customers?limit=100`, config)
          .catch(() => ({ data: { data: [] } })),
        axios
          .get(`${API_BASE}/api/tasks/read`, config)
          .catch(() => ({ data: { result: [] } })),
        axios
          .get(`${API_BASE}/api/todos/read`, config)
          .catch(() => ({ data: [] })),
      ]);

      setLeads(
        Array.isArray(leadsRes.data?.result) ? leadsRes.data.result : [],
      );
      setCustomers(
        Array.isArray(customersRes.data?.data) ? customersRes.data.data : [],
      );

      const fetchedTasks =
        tasksRes.data?.result || tasksRes.data?.data || tasksRes.data;
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);

      const fetchedTodos =
        todosRes.data?.result || todosRes.data?.data || todosRes.data;
      setTodos(Array.isArray(fetchedTodos) ? fetchedTodos : []);
    } catch (error) {
      console.error("Dashboard Data Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Date formatting helpers
  const formatTime = (dateString, formatStr = "medium") => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: formatStr,
    });
  };

  // Convert Leads timestamps roughly to a 7-day chart using pure dates
  const computeLeadChartData = () => {
    const daysMap = {};
    const today = new Date();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
      daysMap[dayName] = { day: dayName, leads: 0, won: 0 };
    }

    const safeLeads = Array.isArray(leads) ? leads : [];
    safeLeads.forEach((lead) => {
      if (!lead.created_at) return;
      const leadDate = new Date(lead.created_at);
      const diffTime = Math.abs(today - leadDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        const dayName = leadDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });
        if (daysMap[dayName]) {
          daysMap[dayName].leads += 1;
          if (lead.status === "Won") {
            daysMap[dayName].won += 1;
          }
        }
      }
    });

    return Object.values(daysMap);
  };

  const leadChartData = computeLeadChartData();

  // Safety fallbacks to guarantee array variables
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeTodos = Array.isArray(todos) ? todos : [];
  const safeLeads = Array.isArray(leads) ? leads : [];

  // Sort tasks & todos logically
  const pendingTasks = safeTasks.slice(0, 5);
  const unfinishedTodos = safeTodos.filter((t) => !t.is_finished).slice(0, 5);
  const recentLeadsList = safeLeads.slice(0, 5);

  // Mixed activity (Tasks created + Leads generated conceptually)
  const recentActivities = [...safeTasks.slice(0, 3), ...safeLeads.slice(0, 2)]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.start_date || b.startDate) -
        new Date(a.created_at || a.start_date || a.startDate),
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 pb-12">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-5 sm:p-6 rounded-[18px] shadow-sm border border-gray-100/60 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-50/60 to-transparent pointer-events-none"></div>
          <div className="relative z-10 mb-4 md:mb-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight flex items-center">
              Dashboard Overview <Activity className="ml-3 text-orange-500 hidden sm:block" size={24} />
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Welcome back! Check your live CRM statistics and workflow progress.</p>
          </div>
          <div className="relative z-10">
            <button className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow hover:shadow-md transition-all text-sm font-bold flex items-center transform hover:-translate-y-0.5">
              <TrendingUp size={16} className="mr-2" />
              Generate Report
            </button>
          </div>
        </div> */}

        {/* Top Summary Cards */}
        {loading ? (
          <div className="h-32 flex items-center justify-center bg-white rounded-sm border border-gray-100 mb-8 shadow-sm">
            <span className="text-gray-400 font-semibold animate-pulse">
              Loading amazing metrics...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 rounded-sm">
            <DashboardCard
              onClick={() => router.push("/sales/lead")}
              title="Total Leads"
              value={leads.length}
              icon={UserPlus}
              colorClass="bg-orange-50 text-orange-500 border border-orange-100/50 group-hover:bg-orange-500 group-hover:text-white"
            />
            <DashboardCard
              onClick={() => router.push("/customer-list")}
              title="Total Customers"
              value={customers.length}
              icon={Users}
              colorClass="bg-orange-50 text-orange-500 border border-orange-100/50 group-hover:bg-orange-500 group-hover:text-white"
            />
            <DashboardCard
              onClick={() => router.push("/tasks")}
              title="Total Tasks"
              value={tasks.length}
              icon={CheckSquare}
              colorClass="bg-orange-50 text-orange-500 border border-orange-100/50 group-hover:bg-orange-500 group-hover:text-white"
            />
            <DashboardCard
              onClick={() => router.push("/todolist")}
              title="Active To-Dos"
              value={todos.filter((t) => !t.is_finished).length}
              icon={ListTodo}
              colorClass="bg-orange-50 text-orange-500 border border-orange-100/50 group-hover:bg-orange-500 group-hover:text-white"
            />
          </div>
        )}
      </main>
    </div>
  );
}


