// Taken from https://recharts.org/en-US/examples/StraightAnglePieChart
import { Cell, Pie, PieChart } from "recharts";
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
      //   fontWeight={900}
      fontSize={10}
    >
      {name.toUpperCase()}: {convert.toPercent(percent)}
    </text>
  );
};

const colors = [
  // Green
  "#005500",
  // Magenta
  "#ff0482",
  // Blue
  "#8F9DB2",
  // Gray
  "#333333",
];

export class PortfolioPieChart extends Component<Props> {
  render() {
    return (
      <PieChart width={400} height={400}>
        <Pie
          dataKey="value"
          isAnimationActive={false}
          startAngle={180}
          endAngle={0}
          minAngle={20}
          data={this.props.data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#032939"
          stroke="black"
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {this.props.data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]}>
              hi
            </Cell>
          ))}
        </Pie>
      </PieChart>
    );
  }
}
