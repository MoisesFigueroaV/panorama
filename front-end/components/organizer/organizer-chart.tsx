// Create this file for the organizer chart component
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

interface OrganizerChartProps {
  type: "line" | "bar"
  data?: {
    eventosPorCategoria?: {
      categoria: string;
      cantidad: number;
    }[];
  }
}

export function OrganizerChart({ type, data }: OrganizerChartProps) {
  // Sample data for line chart (ticket sales) - keeping this for now
  const lineData: ChartData<"line"> = {
    labels: ["1 May", "5 May", "10 May", "15 May", "20 May", "25 May", "30 May"],
    datasets: [
      {
        label: "Tickets vendidos",
        data: [65, 78, 90, 120, 150, 180, 210],
        borderColor: "#AF41E1", // primary color
        backgroundColor: "rgba(175, 65, 225, 0.1)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Ingresos ($)",
        data: [650, 780, 900, 1200, 1500, 1800, 2100],
        borderColor: "#4C74FF", // accent color
        backgroundColor: "rgba(76, 116, 255, 0.1)",
        tension: 0.3,
        fill: true,
        hidden: true,
      },
    ],
  }

  // Real data for bar chart (events by category)
  const barData: ChartData<"bar"> = {
    labels: data?.eventosPorCategoria?.map(item => item.categoria) || ["Música", "Deportes", "Gastronomía", "Arte", "Tecnología", "Aire libre"],
    datasets: [
      {
        label: "Número de eventos",
        data: data?.eventosPorCategoria?.map(item => item.cantidad) || [12, 8, 5, 7, 3, 6],
        backgroundColor: [
          "#EB4187", // music
          "#4C74FF", // sports
          "#F59E0B", // food
          "#AF41E1", // art
          "#10B981", // tech
          "#65A30D", // outdoor
          "#EF4444", // red
          "#8B5CF6", // purple
          "#06B6D4", // cyan
          "#84CC16", // lime
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
