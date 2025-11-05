declare module 'react-native-svg-charts' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface ChartProps {
    style?: ViewStyle;
    data: any[];
    svg?: any;
    contentInset?: { top?: number; bottom?: number; left?: number; right?: number };
    [key: string]: any;
  }

  export class BarChart extends Component<ChartProps> {}
  export class LineChart extends Component<ChartProps> {}
  export class AreaChart extends Component<ChartProps> {}
  export class PieChart extends Component<ChartProps> {}
  export class ProgressCircle extends Component<ChartProps> {}
  export class XAxis extends Component<any> {}
  export class YAxis extends Component<any> {}
  export class Grid extends Component<any> {}
}
