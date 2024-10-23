import { Entity, System } from "./ecs";
import { AccumulatedForceComponent } from "./components";

import Chart, { ChartConfiguration, ChartItem } from "chart.js/auto";

export class ChartSystem extends System {
  private chart: Chart;
  private data: {
    time: number;
    // positionX: number;
    // positionY: number;
    // velocityX: number;
    // velocityY: number;
    // forceX: number;
    // forceY: number;
    accumulatedForceX: number;
    accumulatedForceY: number;
  }[] = [];
  private time: number = 0;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 20; // Update every X ms
  private windowSize: number = 200; // Rolling window of X data points
  private samplingRate: number = 2;

  constructor(chartContext: ChartItem) {
    super();
    const chartConfig: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        datasets: [
          // {
          //   // showLine: false,
          //   label: "Position X",
          //   borderColor: "red",
          //   borderWidth: 1,
          //   data: [],
          //   pointStyle: "circle",
          //   pointRadius: 3,
          //   pointBorderWidth: 0,
          // },
          // {
          //   // showLine: false,
          //   label: "Position Y",
          //   borderColor: "blue",
          //   borderWidth: 1,
          //   data: [],
          //   pointStyle: "circle",
          //   pointRadius: 3,
          //   pointBorderWidth: 0,
          // },
          // {
          //   // showLine: false,
          //   label: "Velocity X",
          //   borderColor: "red",
          //   borderWidth: 1,
          //   data: [],
          //   pointStyle: "circle",
          //   pointRadius: 3,
          //   pointBorderWidth: 0,
          // },
          // {
          //   // showLine: false,
          //   label: "Velocity Y",
          //   borderColor: "blue",
          //   borderWidth: 1,
          //   data: [],
          //   pointStyle: "circle",
          //   pointRadius: 3,
          //   pointBorderWidth: 0,
          // },
          // {
          //   // showLine: false,
          //   label: "Force X",
          //   borderColor: "orange",
          //   borderWidth: 1,
          //   data: [],
          //   pointStyle: "circle",
          //   pointRadius: 2,
          //   pointBorderWidth: 0,
          // },
          // {
          //   // showLine: false,
          //   label: "Force Y",
          //   borderColor: "brown",
          //   borderWidth: 1,
          //   data: [],
          //   pointStyle: "circle",
          //   pointRadius: 2,
          //   pointBorderWidth: 0,
          // },
          {
            // showLine: false,
            label: "Accumulated Force X",
            borderColor: "red",
            borderWidth: 1,
            data: [],
            pointStyle: "circle",
            pointRadius: 2,
            pointBorderWidth: 0,
          },
          {
            // showLine: false,
            label: "Accumulated Force Y",
            borderColor: "blue",
            borderWidth: 1,
            data: [],
            pointStyle: "circle",
            pointRadius: 2,
            pointBorderWidth: 0,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        // stacked: false,
        interaction: { intersect: false },
        scales: {
          x: { type: "linear", title: { display: true, text: "Time" } },
          y: { title: { display: true, text: "Value" } },
        },
      },
    };
    this.chart = new Chart(chartContext, chartConfig);
  }

  update(entities: Entity[]): void {
    const currentTime = performance.now();

    // Collect data at every update call
    if (this.time % this.samplingRate === 0) {
      entities
        .filter((e) => e.name === "box1")
        .forEach((entity) => {
          // const position = entity.getComponent(PositionComponent);
          // const velocity = entity.getComponent(VelocityComponent);
          // const force = entity.getComponent(ForceComponent);
          const accumulatedForce = entity.getComponent(
            AccumulatedForceComponent,
          );

          // if (position && velocity && force) {
          if (accumulatedForce) {
            this.data.push({
              time: this.time,
              // positionX: position.x,
              // positionY: position.y,
              // velocityX: velocity.vx,
              // velocityY: velocity.vy,
              // forceX: force.fx,
              // forceY: force.fy,
              accumulatedForceX: accumulatedForce.accumulatedFx,
              accumulatedForceY: accumulatedForce.accumulatedFy,
            });
          }
        });
    }

    // Only update the chart every updateInterval (e.g., 1000ms)
    if (currentTime - this.lastUpdateTime >= this.updateInterval) {
      this.data.forEach((entry) => {
        // this.chart.data.datasets[0].data.push({
        //   x: entry.time,
        //   y: entry.positionX,
        // });
        // this.chart.data.datasets[1].data.push({
        //   x: entry.time,
        //   y: entry.positionY,
        // });
        // this.chart.data.datasets[0].data.push({
        //   x: entry.time,
        //   y: entry.velocityX,
        // });
        // this.chart.data.datasets[1].data.push({
        //   x: entry.time,
        //   y: entry.velocityY,
        // });
        this.chart.data.datasets[0].data.push({
          x: entry.time,
          y: entry.accumulatedForceX,
        });
        this.chart.data.datasets[1].data.push({
          x: entry.time,
          y: entry.accumulatedForceY,
        });
      });

      // Enforce rolling window by slicing the dataset to ensure it doesn't grow beyond windowSize
      this.chart.data.datasets.forEach((dataset) => {
        if (dataset.data.length > this.windowSize) {
          dataset.data = dataset.data.slice(-this.windowSize);
        }
      });

      this.chart.update();
      this.data = []; // Clear the collected data after batching it to the chart
      this.lastUpdateTime = currentTime; // Update the last update time
    }

    this.time++;
  }
}
