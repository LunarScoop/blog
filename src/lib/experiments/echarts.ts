import { init, use } from 'echarts/core';
import { BarChart, LineChart, HeatmapChart } from 'echarts/charts';
import { GridComponent, VisualMapComponent, DataZoomComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
use([BarChart, LineChart, HeatmapChart, GridComponent, VisualMapComponent, DataZoomComponent, SVGRenderer]);
export { init };
