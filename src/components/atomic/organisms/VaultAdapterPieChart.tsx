// Taken from https://recharts.org/en-US/examples/CustomActiveShapePieChart
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";
import { PureComponent } from "react";

const RADIAN = Math.PI / 180;


const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 260;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload,  apr, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#888">{`Weight ${value}%`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`APR ${apr}%`}
      </text>
    </g>
  );
};

interface Props {
  data: Array<{ name: string; weight: number; }>;
}
export class VaultAdapterPieChart extends PureComponent<Props> {
  state = {
    activeIndex: 0,
  };

  onPieEnter = (_: any, index: number) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            activeIndex={this.state.activeIndex}
            activeShape={renderActiveShape}
            data={this.props.data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={this.onPieEnter}
          />
        </PieChart>
      </ResponsiveContainer>
      // <ResponsiveContainer width="100%" height="100%">
      //   <PieChart width={400} height={400}>
      //     <Pie
      //       activeIndex={this.state.activeIndex}
      //       dataKey="value"
      //       isAnimationActive={false}
      //       data={this.props.data}
      //       cx="50%"
      //       cy="50%"
      //       outerRadius={80}
      //       fill="#8884d8"
      //       // label={renderCustomizedLabel}
      //     />
      //     <Tooltip content={<CustomTooltip />} />
      //   </PieChart>
      // </ResponsiveContainer>
    );
  }
}


/* extends PureComponent<Props> {
  static demoUrl =
    "https://codesandbox.io/s/pie-chart-with-customized-active-shape-y93si";

  state = {
    activeIndex: 0,
  };

  onPieEnter = (_: any, index: number) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={this.state.activeIndex}
            activeShape={renderActiveShape}
            data={this.props.data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={this.onPieEnter}
            label={renderCustomizedLabel}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }
} */
