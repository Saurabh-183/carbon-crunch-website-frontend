import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const data = [
  {
    month: "Jan",
    noida: 400,
    mumbai: 240,
    bangalore: 180,
  },
  {
    month: "Feb",
    noida: 300,
    mumbai: 139,
    bangalore: 220,
  },
  {
    month: "Mar",
    noida: 200,
    mumbai: 980,
    bangalore: 210,
  },
  {
    month: "Apr",
    noida: 278,
    mumbai: 390,
    bangalore: 250,
  },
  {
    month: "May",
    noida: 189,
    mumbai: 480,
    bangalore: 210,
  },
  {
    month: "Jun",
    noida: 239,
    mumbai: 380,
    bangalore: 250,
  },
  {
    month: "Jul",
    noida: 400,
    mumbai: 240,
    bangalore: 180,
  },
  {
    month: "Aug",
    noida: 300,
    mumbai: 139,
    bangalore: 220,
  },
  {
    month: "Sep",
    noida: 200,
    mumbai: 980,
    bangalore: 210,
  },
  {
    month: "Oct",
    noida: 278,
    mumbai: 390,
    bangalore: 250,
  },
  {
    month: "Nov",
    noida: 189,
    mumbai: 480,
    bangalore: 210,
  },
  {
    month: "Dec",
    noida: 239,
    mumbai: 380,
    bangalore: 250,
  },
];

const FacilityEmissionsBarChart = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const AnimatedLabel = ({ x, y, width, value, index }) => {
    const isHovered = index === hoveredIndex;

    return (
      <g>
        <text
          x={Number(x) + Number(width) / 2}
          y={y - 8}
          fill="#111827"
          fontSize={12}
          fontWeight={600}
          textAnchor="middle"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full max-w-6xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Facility Contribution
        </h3>
        <p className="text-sm text-gray-400">Monthly emission comparison</p>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
            onMouseLeave={() => setHoveredIndex(null)}
            barGap={4}
            barCategoryGap="15%"
          >
            <CartesianGrid
              vertical={false}
              stroke="#f1f5f9"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />

            <Bar
              dataKey="noida"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
              barSize={16}
              onMouseOver={(_, index) => setHoveredIndex(index)}
            >
              <LabelList content={(props) => <AnimatedLabel {...props} />} />
            </Bar>

            <Bar
              dataKey="mumbai"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              barSize={16}
              onMouseOver={(_, index) => setHoveredIndex(index)}
            >
              <LabelList content={(props) => <AnimatedLabel {...props} />} />
            </Bar>

            <Bar
              dataKey="bangalore"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              barSize={16}
              onMouseOver={(_, index) => setHoveredIndex(index)}
            >
              <LabelList content={(props) => <AnimatedLabel {...props} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FacilityEmissionsBarChart;