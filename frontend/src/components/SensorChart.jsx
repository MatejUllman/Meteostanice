import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SensorChart = ({ data, dataKey, label }) => {
  return (
    <div className="p-6">
      <h3>{label}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="measured_at"
            tickFormatter={(value) =>
              new Date(value).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            minTickGap={20}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(value) =>
              `Čas: ${new Date(value).toLocaleString()}`
            }
            formatter={(value) => `${value}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            name={label}
            stroke="#155dfc"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;
