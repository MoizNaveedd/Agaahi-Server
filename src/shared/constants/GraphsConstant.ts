// Centralized arrays of colors for stroke and fill
export const strokeColors = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
export const fillColors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

export const graphConst = {
    graphs: [
        {
            id: 1,
            name: "Line Chart",
            category: "Line Chart",
            image: "graphImages().lineCharts.LineChart",
            defaultData: [
                { name: "Page A", uv: 4000, pv: 2400, amt: 2400, stroke: strokeColors[0] },
                { name: "Page B", uv: 3000, pv: 1398, amt: 2210, stroke: strokeColors[1] },
                { name: "Page C", uv: 2000, pv: 9800, amt: 2290, stroke: strokeColors[2] },
                { name: "Page D", uv: 2780, pv: 3908, amt: 2000, stroke: strokeColors[3] },
                { name: "Page E", uv: 1890, pv: 4800, amt: 2181, stroke: strokeColors[4] },
                { name: "Page F", uv: 2390, pv: 3800, amt: 2500, stroke: strokeColors[5] },
                { name: "Page G", uv: 3490, pv: 4300, amt: 2100, stroke: strokeColors[6] },
            ],
        },
        {
            id: 2,
            name: "Stacked Area Chart",
            category: "Line Chart",
            image: "graphImages().lineCharts.StackedAreaChart",
            defaultData: {
                "data": [
                  { "name": "Page A", "uv": 4000, "pv": 2400, "amt": 2400 },
                  { "name": "Page B", "uv": 3000, "pv": 1398, "amt": 2210 },
                  { "name": "Page C", "uv": 2000, "pv": 9800, "amt": 2290 },
                  { "name": "Page D", "uv": 2780, "pv": 3908, "amt": 2000 },
                  { "name": "Page E", "uv": 1890, "pv": 4800, "amt": 2181 },
                  { "name": "Page F", "uv": 2390, "pv": 3800, "amt": 2500 },
                  { "name": "Page G", "uv": 3490, "pv": 4300, "amt": 2100 }
                ],
                "dataKeys": ["uv", "pv", "amt"]
              },
        },
        {
            id: 3,
            name: "Customize Line Chart",
            category: "Line Chart",
            image: "graphImages().lineCharts.CustomizeLineChart",
            defaultData: {
                data: [
                    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
                    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
                    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
                    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
                    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
                    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
                    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
                ],
                config: [
                    { dataKey: 'pv', stroke: strokeColors[0] },
                    { dataKey: 'uv', stroke: strokeColors[1] },
                ],
            },
        },
        {
            id: 4,
            name: "Simple Bar Chart",
            category: "Bar Chart",
            image: "graphImages().barCharts.SimpleBarChart",
            defaultData: {
                data: [
                    { name: 'Category 1', uv: 500, pv: 300, amt: 200 },
                    { name: 'Category 2', uv: 400, pv: 200, amt: 300 },
                    { name: 'Category 3', uv: 300, pv: 400, amt: 100 },
                ],
                bars: [
                    { dataKey: 'uv' },
                    { dataKey: 'pv' },
                ],
            },
        },
        {
            id: 5,
            name: "Customize Shape Bar Chart",
            category: "Bar Chart",
            image: "graphImages().barCharts.CustomizeShapeBarChart",
            defaultData: {
                "data": [
                    { "name": "Page A", "uv": 4000, "pv": 2400, "amt": 2400 },
                    { "name": "Page B", "uv": 3000, "pv": 1398, "amt": 2210 },
                    { "name": "Page C", "uv": 2000, "pv": 9800, "amt": 2290 },
                    { "name": "Page D", "uv": 2780, "pv": 3908, "amt": 2000 },
                    { "name": "Page E", "uv": 1890, "pv": 4800, "amt": 2181 },
                    { "name": "Page F", "uv": 2390, "pv": 3800, "amt": 2500 },
                    { "name": "Page G", "uv": 3490, "pv": 4300, "amt": 2100 }
                ],
                "dataKey": "uv"
            },
        },
        {
            id: 6,
            name: "Line And Bar Chart",
            category: "Bar Chart",
            image: "graphImages().barCharts.LineAndBarChart",
            defaultData: {
                "data": [
                    { "name": "Page A", "uv": 590, "pv": 800, "amt": 1400, "cnt": 490 },
                    { "name": "Page B", "uv": 868, "pv": 967, "amt": 1506, "cnt": 590 },
                    { "name": "Page C", "uv": 1397, "pv": 1098, "amt": 989, "cnt": 350 },
                    { "name": "Page D", "uv": 1480, "pv": 1200, "amt": 1228, "cnt": 480 },
                    { "name": "Page E", "uv": 1520, "pv": 1108, "amt": 1100, "cnt": 460 },
                    { "name": "Page F", "uv": 1400, "pv": 680, "amt": 1700, "cnt": 380 }
                ],
                "areaConfig": { "dataKey": "amt" },
                "barConfig": { "dataKey": "pv" },
                "lineConfig": { "dataKey": "uv" },
                "scatterConfig": { "dataKey": "cnt" }
            }
        },
        {
            id: 7,
            name: "Pie Chart",
            category: "Pie Chart",
            image: "graphImages().pieCharts.PieChart",
            defaultData: {
                "data": [
                    { "name": "Category 1", "value": 500 },
                    { "name": "Category 2", "value": 300 },
                    { "name": "Category 3", "value": 200 }
                ],
                "dataKey": "value"
            },
        },
        {
            id: 8,
            name: "Geo Chart",
            category: "Others",
            image: "graphImages().otherCharts.GeoChart",
            defaultData: [
                { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
                { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
                { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
                { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
                { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
                { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
                { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
            ],
        },
        {
            id: 9,
            name: "Radar Chart",
            category: "Others",
            image: "graphImages().otherCharts.RadarChart",
            defaultData: {
                "data": [
                    { "subject": "Math", "A": 120, "B": 110, "fullMark": 150 },
                    { "subject": "Chinese", "A": 98, "B": 130, "fullMark": 150 },
                    { "subject": "English", "A": 86, "B": 130, "fullMark": 150 },
                    { "subject": "Geography", "A": 99, "B": 100, "fullMark": 150 },
                    { "subject": "Physics", "A": 85, "B": 90, "fullMark": 150 },
                    { "subject": "History", "A": 65, "B": 85, "fullMark": 150 }
                ],
                "radarConfigs": [
                    { "name": "Student A", "dataKey": "A" },
                    { "name": "Student B", "dataKey": "B" }
                ]
            }
        },
        {
            id: 10,
            name: "Radial Chart",
            category: "Others",
            image: "graphImages().otherCharts.RadialChart",
            defaultData: {
                data: [
                    { name: '18-24', uv: 31.47, pv: 2400 },
                    { name: '25-29', uv: 26.69, pv: 4567 },
                    { name: '30-34', uv: 15.69, pv: 1398 },
                    { name: '35-39', uv: 8.22, pv: 9800 },
                    { name: '40-49', uv: 8.63, pv: 3908 },
                    { name: '50+', uv: 2.63, pv: 4800 },
                    { name: 'unknown', uv: 6.67, pv: 4800 },
                ],
                dataKey: 'uv',
            },
        },
        {
            id: 11,
            name: "Card",
            category: "Others",
            image: "graphImages().otherCharts.MetricsCard",
            defaultData: [
                { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
                { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
                { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
                { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
                { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
                { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
                { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
            ],
        },
    ],
};