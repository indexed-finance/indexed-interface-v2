// Taken from https://recharts.org/en-US/examples/StraightAnglePieChart
import { Cell, Legend, Pie, PieChart } from "recharts";
import { Component } from "react";
import { convert } from "helpers";

interface Props {
  data: Array<{ name: string; value: number }>;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#eee"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
    >
      {/* {name.toUpperCase()}: {convert.toPercent(percent)} */}
    </text>
  );
};

const colors = [
  // Green
  "#38ee7b",
  // Magenta
  "#ff0482",
  // Blue
  "#00afaf",
  // Orange
  "#d89614",
];

export class PortfolioPieChart extends Component<Props> {
  render() {
    return (
      <PieChart
        width={400}
        height={400}
        margin={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Pie
          dataKey="value"
          isAnimationActive={false}
          startAngle={180}
          endAngle={0}
          data={this.props.data}
          cx="33%"
          cy="60%"
          outerRadius={80}
          fill="#032939"
          stroke="black"
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {this.props.data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={colors[index % colors.length]}
              name={entry.name}
            />
          ))}
        </Pie>
        <Legend
          layout="vertical"
          wrapperStyle={{ top: 0, left: 0 }}
          payload={this.props.data.map((entry, index) => ({
            id: entry.name,
            type: "square",
            value: `${entry.name}: ${convert.toPercent(entry.value)}`,
            color: colors[index % colors.length],
          }))}
        />
      </PieChart>
    );
  }
}
