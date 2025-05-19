// Create this file for the admin chart component
"use client"

import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface AdminChartProps {
  type: "line" | "bar"
}

export function AdminChart({ type }: AdminChartProps) {
  // Sample data for line chart (user growth)
  const lineData: ChartData<"line"> = {
    labels: ["1 May", "5 May", "10 May", "15 May", "20 May", "25 May", "30 May"],
    datasets: [
      {
        label: "Nuevos usuarios",
        data: [25, 38, 45, 52, 68, 75, 85],
        borderColor: "#AF41E1", // primary color
        backgroundColor: "rgba(175, 65, 225, 0.1)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Nuevos organizadores",
        data: [5, 8, 10, 12, 15, 18, 20],
        borderColor: "#4C74FF", // accent color
        backgroundColor: "rgba(76, 116, 255, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  // Sample data for bar chart (events by category)
  const barData: ChartData<"bar"> = {
    labels: ["Música", "Deportes", "Gastronomía", "Arte", "Tecnología", "Aire libre"],
    datasets: [
      {
        label: "Número de eventos",
        data: [42, 28, 15, 37, 23, 16],
        backgroundColor: [
          "#EB4187", // music
          "#4C74FF", // sports
          "#F59E0B", // food
          "#AF41E1", // art
          "#10B981", // tech
          "#65A30D", // outdoor
        ],
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {type === "line" ? <Line data={lineData} options={lineOptions} /> : <Bar data={barData} options={barOptions} />}
    </div>
  )
}
