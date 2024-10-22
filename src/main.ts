import "./style.css";
import Chart, {
  ChartConfiguration,
  ChartItem,
  ChartTypeRegistry,
} from "chart.js/auto";

//
// Component
//
abstract class Component {
  // All components extend from this base
}

class PositionComponent extends Component {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
}

class VelocityComponent extends Component {
  vx: number;
  vy: number;

  constructor(vx: number = 0, vy: number = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
  }
}

class MassComponent extends Component {
  mass: number;

  constructor(mass: number) {
    super();
    this.mass = mass;
  }
}

class ForceComponent extends Component {
  fx: number = 0;
  fy: number = 0;
}

class AccumulatedForceComponent extends Component {
  accumulatedFx: number = 0;
  accumulatedFy: number = 0;
}

class FrictionComponent extends Component {
  frictionCoefficient: number;

  constructor(frictionCoefficient: number = 0.05) {
    super();
    this.frictionCoefficient = frictionCoefficient;
  }
}

class MouseDragComponent extends Component {
  isDragging: boolean = false;
  targetX: number = 0;
  targetY: number = 0;
  offsetX: number = 0; // Offset from the mouse click to the box's position
  offsetY: number = 0;

  setTarget(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }

  startDrag(offsetX: number, offsetY: number) {
    this.isDragging = true;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  stopDrag() {
    this.isDragging = false;
  }
}

class SpringForceComponent extends Component {
  entityA: Entity;
  entityB: Entity;
  stiffness: number;
  damping: number;

  constructor(
    entityA: Entity,
    entityB: Entity,
    stiffness: number = 0.1,
    damping: number = 0.05,
  ) {
    super();
    this.entityA = entityA;
    this.entityB = entityB;
    this.stiffness = stiffness;
    this.damping = damping;
  }
}

class DOMComponent extends Component {
  domElement: HTMLElement;

  constructor(domElement: HTMLElement) {
    super();
    this.domElement = domElement;
  }
}

//
// Entity
//
class Entity {
  private static idCounter = 0;
  id: number;
  name: string | undefined;
  components: Map<string, Component>;
  // isActive: boolean; // Tracks if the entity is active or inactive

  constructor() {
    this.id = Entity.idCounter++;
    this.components = new Map();
    console.log("[Entity] Created entity", { entity: this });
    // this.isActive = true; // Start as active
  }

  addComponent(component: Component) {
    this.components.set(component.constructor.name, component);
  }

  getComponent<T extends Component>(
    componentClass: new (...args: any[]) => T,
  ): T | undefined {
    return this.components.get(componentClass.name) as T;
  }

  // setActiveState(state: boolean) {
  //   this.isActive = state;
  // }
}

//
// Engine
//
const VELOCITY_THRESHOLD = 0.01; // Minimum velocity to keep updating
const FORCE_THRESHOLD = 0.01; // Minimum force to keep applying updates

abstract class System {
  abstract update(entities: Entity[]): unknown;
}

class AnimationEngine {
  private entities: Entity[] = [];
  private systems: System[] = [];

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  addSystem(system: System) {
    this.systems.push(system);
  }

  update() {
    // let anyActive = false;

    // Update all systems, but only for active entities
    this.systems.forEach((system) => {
      // system.update(this.entities.filter((entity) => entity.isActive));
      system.update(this.entities);
    });

    // After updating, check if any entity should remain active
    // this.entities.forEach((entity) => {
    //   if (this.shouldEntityRemainActive(entity)) {
    //     entity.setActiveState(true);
    //     anyActive = true; // At least one entity is active
    //   } else {
    //     entity.setActiveState(false);
    //   }
    // });

    // If no entities are active, the loop will simply continue without updates
    // This means the engine remains running but skips unnecessary updates
  }

  // Determines if an entity should remain active based on velocity and force thresholds
  // shouldEntityRemainActive(entity: Entity): boolean {
  //   const velocity = entity.getComponent(VelocityComponent);
  //   const force = entity.getComponent(ForceComponent);
  //
  //   if (velocity && force) {
  //     // Check if either velocity or force exceeds the threshold
  //     return (
  //       Math.abs(velocity.vx) > VELOCITY_THRESHOLD ||
  //       Math.abs(velocity.vy) > VELOCITY_THRESHOLD ||
  //       Math.abs(force.fx) > FORCE_THRESHOLD ||
  //       Math.abs(force.fy) > FORCE_THRESHOLD
  //     );
  //   }
  //
  //   return false;
  // }

  // Animation loop, always running
  private loop() {
    this.update();
    requestAnimationFrame(() => this.loop());
  }

  // Start the loop on initialization
  start() {
    this.loop();
  }
}

//
// Systems
//

class SpringForceSystem extends System {
  update(entities: Entity[]) {
    entities.forEach((entity) => {
      const spring = entity.getComponent(SpringForceComponent);
      if (spring) {
        const positionA = spring.entityA.getComponent(PositionComponent);
        const positionB = spring.entityB.getComponent(PositionComponent);
        const velocityA = spring.entityA.getComponent(VelocityComponent);
        const forceA = spring.entityA.getComponent(ForceComponent);
        const velocityB = spring.entityB.getComponent(VelocityComponent);
        const forceB = spring.entityB.getComponent(ForceComponent);

        // console.clear();
        // console.log(
        //   `[SpringForceSystem] log:`,
        //   structuredClone({
        //     positionA,
        //     positionB,
        //     velocityA,
        //     forceA,
        //     velocityB,
        //     forceB,
        //   }),
        // );

        if (!positionA) {
          throw new Error("PositionComponent missing for entityA");
        }
        if (!positionB) {
          throw new Error("PositionComponent missing for entityB");
        }
        if (!velocityA) {
          throw new Error("VelocityComponent missing for entityA");
          // return;
        }
        if (!forceA) {
          throw new Error("ForceComponent missing for entityA");
        }
        if (!velocityB) {
          throw new Error("VelocityComponent missing for entityB");
          // return;
        }
        if (!forceB) {
          throw new Error("ForceComponent missing for entityB");
        }

        const dx = positionB.x - positionA.x;
        const dy = positionB.y - positionA.y;

        // Apply spring force proportional to the distance between the two entities
        const fx = spring.stiffness * dx - spring.damping * velocityA.vx;
        const fy = spring.stiffness * dy - spring.damping * velocityA.vy;

        // Apply force to entity A (pulling towards entity B)
        forceA.fx += fx;
        forceA.fy += fy;

        // Apply equal and opposite force to entity B (pulling towards entity A)
        forceB.fx -= fx;
        forceB.fy -= fy;

        // console.log("[SpringForceSystem]", {
        //   forceA: forceA,
        //   forceB: forceB,
        //   dx: dx,
        //   dy: dy,
        //   fx: fx,
        //   fy: fy,
        // });
      }
    });
  }
}

class FrictionSystem extends System {
  update(entities: Entity[]) {
    entities.forEach((entity) => {
      const velocity = entity.getComponent(VelocityComponent);
      const friction = entity.getComponent(FrictionComponent);
      const force = entity.getComponent(ForceComponent);

      if (velocity && friction && force) {
        // Apply friction force opposite to the direction of the velocity
        const speed = Math.sqrt(
          velocity.vx * velocity.vx + velocity.vy * velocity.vy,
        );
        if (speed > VELOCITY_THRESHOLD) {
          const frictionMagnitude = friction.frictionCoefficient * speed;
          const fx = -(velocity.vx / speed) * frictionMagnitude;
          const fy = -(velocity.vy / speed) * frictionMagnitude;

          force.fx += fx;
          force.fy += fy;
        }
      }
    });
  }
}

class MovementSystem extends System {
  update(entities: Entity[]) {
    entities.forEach((entity) => {
      const position = entity.getComponent(PositionComponent);
      const velocity = entity.getComponent(VelocityComponent);
      const force = entity.getComponent(ForceComponent);
      const mass = entity.getComponent(MassComponent);
      const accumulatedForce = entity.getComponent(AccumulatedForceComponent);

      if (position && velocity && force && mass && accumulatedForce) {
        const ax = force.fx / mass.mass;
        const ay = force.fy / mass.mass;

        velocity.vx += ax;
        velocity.vy += ay;

        position.x += velocity.vx;
        position.y += velocity.vy;

        // Record the accumulated force before resetting
        accumulatedForce.accumulatedFx = force.fx;
        accumulatedForce.accumulatedFy = force.fy;

        // Reset forces after applying
        force.fx = 0;
        force.fy = 0;
      }
    });
  }
}

class MouseForceSystem extends System {
  dragStrength: number;
  damping: number;

  constructor(dragStrength: number = 0.2, damping: number = 0.1) {
    super();
    this.dragStrength = dragStrength;
    this.damping = damping;
  }

  update(entities: Entity[]) {
    entities.forEach((entity) => {
      const position = entity.getComponent(PositionComponent);
      const velocity = entity.getComponent(VelocityComponent);
      const force = entity.getComponent(ForceComponent);
      const mouseDragForce = entity.getComponent(MouseDragComponent);

      if (
        position &&
        velocity &&
        force &&
        mouseDragForce &&
        mouseDragForce.isDragging
      ) {
        // console.log(
        //   "[MouseForceSystem]",
        //   structuredClone({
        //     position,
        //     velocity,
        //     force,
        //     mouseDrag,
        //   }),
        // );
        const dx = mouseDragForce.targetX - position.x;
        const dy = mouseDragForce.targetY - position.y;

        // Apply force proportional to the distance (like a spring)
        const fx = this.dragStrength * dx - this.damping * velocity.vx;
        const fy = this.dragStrength * dy - this.damping * velocity.vy;

        // Apply the drag force
        force.fx += fx;
        force.fy += fy;

        // Reactivate the entity if the forces are significant
        // if (Math.abs(fx) > FORCE_THRESHOLD || Math.abs(fy) > FORCE_THRESHOLD) {
        //   entity.setActiveState(true);
        // }
      }
    });
  }
}

class DOMUpdateSystem extends System {
  private domLinks: Map<number, HTMLElement> = new Map();

  // Link an entity with a DOM element
  linkEntityToDOM(entity: Entity, domElement: HTMLElement) {
    this.domLinks.set(entity.id, domElement);
  }

  // Update the DOM element positions based on the entity's position component
  update(entities: Entity[]) {
    entities.forEach((entity) => {
      // const position = entity.getComponent(PositionComponent);
      // if (position && this.domLinks.has(entity.id)) {
      //   const domElement = this.domLinks.get(entity.id);
      //   if (domElement) {
      //     domElement.style.left = `${position.x}px`;
      //     domElement.style.top = `${position.y}px`;
      //   }
      // }
      const position = entity.getComponent(PositionComponent);
      if (position && this.domLinks.has(entity.id)) {
        const domElement = this.domLinks.get(entity.id);
        if (domElement) {
          domElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
        }
      }
    });
  }
}

class ChartSystem extends System {
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
        .filter((e) => e.name === "box")
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

class DOMMouseDragHandler {
  initializeDragListeners(entity: Entity) {
    const domComponent = entity.getComponent(DOMComponent);
    const mouseDrag = entity.getComponent(MouseDragForceComponent);
    const position = entity.getComponent(PositionComponent);

    if (!domComponent || !mouseDrag || !position) return;

    const domElement = domComponent.domElement;

    // Attach mouse event listeners
    domElement.addEventListener("mousedown", (event) =>
      this.onMouseDown(event, mouseDrag, position, domElement),
    );
    window.addEventListener("mousemove", (event) =>
      this.onMouseMove(event, mouseDrag),
    );
    window.addEventListener("mouseup", () =>
      this.onMouseUp(mouseDrag, domElement),
    );

    // Attach touch event listeners
    domElement.addEventListener("touchstart", (event) =>
      this.onTouchStart(event, mouseDrag, position, domElement),
    );
    window.addEventListener("touchmove", (event) =>
      this.onTouchMove(event, mouseDrag),
    );
    window.addEventListener("touchend", () =>
      this.onTouchEnd(mouseDrag, domElement),
    );
  }

  onMouseDown(
    event: MouseEvent,
    mouseDragComponent: MouseDragForceComponent,
    position: PositionComponent,
    element: HTMLElement,
  ) {
    element.classList.add("dragging");

    // Calculate the offset between the mouse position and the top-left corner of the box
    const offsetX = event.clientX - position.x;
    const offsetY = event.clientY - position.y;

    mouseDragComponent.startDrag(offsetX, offsetY);
    mouseDragComponent.setTarget(
      event.clientX - mouseDragComponent.offsetX,
      event.clientY - mouseDragComponent.offsetY,
    ); // Set initial target
  }

  onMouseMove(event: MouseEvent, mouseDragComponent: MouseDragForceComponent) {
    if (mouseDragComponent.isDragging) {
      // Update the target, accounting for the initial offset
      mouseDragComponent.setTarget(
        event.clientX - mouseDragComponent.offsetX,
        event.clientY - mouseDragComponent.offsetY,
      );
    }
  }

  onMouseUp(mouseDragComponent: MouseDragForceComponent, element: HTMLElement) {
    element.classList.remove("dragging");
    mouseDragComponent.stopDrag();
  }

  // Touch event equivalents
  onTouchStart(
    event: TouchEvent,
    mouseDragComponent: MouseDragForceComponent,
    position: PositionComponent,
    element: HTMLElement,
  ) {
    event.preventDefault(); // Prevent scrolling

    const touch = event.touches[0]; // Get the first touch point
    element.classList.add("dragging");

    // Calculate the offset between the touch position and the top-left corner of the box
    const offsetX = touch.clientX - position.x;
    const offsetY = touch.clientY - position.y;

    mouseDragComponent.startDrag(offsetX, offsetY);
    mouseDragComponent.setTarget(
      touch.clientX - mouseDragComponent.offsetX,
      touch.clientY - mouseDragComponent.offsetY,
    ); // Set initial target
  }

  onTouchMove(event: TouchEvent, mouseDragComponent: MouseDragForceComponent) {
    if (mouseDragComponent.isDragging) {
      event.preventDefault(); // Prevent scrolling
      const touch = event.touches[0]; // Get the first touch point

      // Update the target, accounting for the initial offset
      mouseDragComponent.setTarget(
        touch.clientX - mouseDragComponent.offsetX,
        touch.clientY - mouseDragComponent.offsetY,
      );
    }
  }

  onTouchEnd(mouseDragComponent: MouseDragForceComponent, element: HTMLElement) {
    element.classList.remove("dragging");
    mouseDragComponent.stopDrag();
  }
}

// Create the ECS engine
const engine = new AnimationEngine();

// Create the box entity
const boxEntity = new Entity();
boxEntity.name = "box";
boxEntity.addComponent(new PositionComponent(100, 100)); // Initial position
boxEntity.addComponent(new VelocityComponent(0, 0)); // Initial velocity
boxEntity.addComponent(new MassComponent(1)); // Mass of the entity
boxEntity.addComponent(new ForceComponent()); // Force acting on the entity
boxEntity.addComponent(new AccumulatedForceComponent()); // Force acting on the entity
boxEntity.addComponent(new MouseDragComponent()); // Component for mouse dragging
boxEntity.addComponent(new FrictionComponent(0.05));

const boxElement = document.getElementById("box") as HTMLElement;
boxEntity.addComponent(new DOMComponent(boxElement));

// Creating the spring force
const anchorEntity = new Entity();
anchorEntity.addComponent(new PositionComponent(100, 100)); // Fixed point for the spring
anchorEntity.addComponent(new VelocityComponent(0, 0)); // Initial velocity of the anchor point
anchorEntity.addComponent(new ForceComponent()); // Force acting on the anchor point
anchorEntity.addComponent(new AccumulatedForceComponent()); // Force acting on the anchor point
// Add spring force to the entity, attached between box and anchor
boxEntity.addComponent(
  new SpringForceComponent(boxEntity, anchorEntity, 0.2, 0.05),
);

// Set up the movement system (handles physics and movement)
const movementSystem = new MovementSystem();

// Creating the friction component and system
const frictionSystem = new FrictionSystem();

// Spring Force System
const springForceSystem = new SpringForceSystem();

// Set up the mouse force system (handles the spring-like dragging effect)
const mouseForceSystem = new MouseForceSystem(0.2, 0.1); // Drag strength and damping

// Set up the DOM update system (handles syncing the DOM with the entity position)
const domUpdateSystem = new DOMUpdateSystem();
domUpdateSystem.linkEntityToDOM(boxEntity, boxElement);

// Set up the DOM mouse drag handler to handle mouse events via the DOM component
const domMouseDragHandler = new DOMMouseDragHandler();
domMouseDragHandler.initializeDragListeners(boxEntity);

// Add Entities to the engine
engine.addEntity(anchorEntity);
engine.addEntity(boxEntity);

// Add systems to the engine
engine.addSystem(springForceSystem);
engine.addSystem(frictionSystem);
engine.addSystem(mouseForceSystem);
engine.addSystem(movementSystem);
engine.addSystem(domUpdateSystem);

// Initialize the chart system
const chartContext = document.getElementById("chart") as ChartItem;
if (chartContext) {
  const chartSystem = new ChartSystem(chartContext);
  engine.addSystem(chartSystem);
}

// Start the engine
engine.start();
