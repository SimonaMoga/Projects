import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

type Stats = {
  [category: string]: {
    correct: number;
    incorrect: number;
  };
};

export default function Profile() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://127.0.0.1:5000/user_stats/${userId}`)
        .then((res) => setStats(res.data))
        .catch((err) => console.error("❌ Failed to fetch stats", err));

      axios
        .get(`http://127.0.0.1:5000/suggest_category/${userId}`)
        .then((res) => {
          setSuggestion(res.data.suggestion);
          setReason(res.data.reason);
        })
        .catch((err) => console.error("❌ Failed to fetch suggestion", err));
    }
  }, []);

  const chartData = stats && {
    labels: Object.keys(stats),
    datasets: [
      {
        label: "Correct",
        data: Object.values(stats).map((p) => p.correct),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
      },
      {
        label: "Incorrect",
        data: Object.values(stats).map((p) => p.incorrect),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
      },
      y: {
        ticks: { color: "#fff" },
      },
    },
  };

  return (
    <div className="profile-page">
      <h2>Your Quiz Progress</h2>

      {suggestion && (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <p style={{ fontSize: "1.2rem", color: "#000" }}>
            🎯 Suggested category to try next:{" "}
            <strong>{suggestion}</strong>
            {reason && <span> — {reason}</span>}
          </p>
          <button
            onClick={() =>
              navigate(`/dashboard?suggested=${encodeURIComponent(suggestion)}`)
            }
            style={{
              padding: "10px 20px",
              backgroundColor: "#1a1a2e",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Play Now
          </button>
        </div>
      )}

      {stats ? (
        <>
          <div className="stats-list">
            {Object.entries(stats).map(([cat, data]) => (
              <div key={cat} className="stat-item">
                <h4>{cat}</h4>
                <p>✅ Correct: {data.correct}</p>
                <p>❌ Incorrect: {data.incorrect}</p>
              </div>
            ))}
          </div>
          <div className="chart-container">
            <Bar data={chartData!} options={chartOptions} />
          </div>
        </>
      ) : (
        <p>Loading stats...</p>
      )}
    </div>
  );
}
