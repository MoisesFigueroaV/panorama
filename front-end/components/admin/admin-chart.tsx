// Create this file for the admin chart component
"use client"

import { ChartData, ChartOptions } from "chart.js"
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
  Filler,
} from "chart.js"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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
        borderColor: "rgb(175, 65, 225)", // primary color
        backgroundColor: "rgba(175, 65, 225, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(175, 65, 225)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Nuevos organizadores",
        data: [5, 8, 10, 12, 15, 18, 20],
        borderColor: "rgb(76, 116, 255)", // accent color
        backgroundColor: "rgba(76, 116, 255, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(76, 116, 255)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
          "rgb(235, 65, 135)", // music
          "rgb(76, 116, 255)", // sports
          "rgb(245, 158, 11)", // food
          "rgb(175, 65, 225)", // art
          "rgb(16, 185, 129)", // tech
          "rgb(101, 163, 13)", // outdoor
        ],
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const commonOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        displayColors: true,
        usePointStyle: true,
      },
    },
  }

  const lineOptions: ChartOptions<"line"> = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          padding: 8,
        },
      },
    },
  }

  const barOptions: ChartOptions<"bar"> = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          padding: 8,
        },
      },
    },
  }

  return (
    <div className="w-full h-full min-h-[250px] sm:min-h-[300px]">
      {type === "line" ? (
        <Line data={lineData} options={lineOptions} />
      ) : (
        <Bar data={barData} options={barOptions} />
      )}
    </div>
  )
}
