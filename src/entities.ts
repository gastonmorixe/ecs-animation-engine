import { Entity } from "./ecs";
import {
  PositionComponent,
  VelocityComponent,
  ForceComponent,
  FrictionComponent,
  MassComponent,
  AccumulatedForceComponent,
} from "./components";
import { DOMComponent, MouseDragComponent } from "./dom";

// Define BoxEntity to represent a box that can be dragged
export class BoxEntity extends Entity {
  constructor(
    domElement: HTMLElement,
    initialPositon: { x: number; y: number },
    name?: string,
    initialVelocity: { vx: number; vy: number } = { vx: 0, vy: 0 },
    mass: number = 1,
    friction: number = 0.05,
  ) {
    super();

    this.name = name;
    this.addComponent(
      new PositionComponent(initialPositon.x, initialPositon.y),
    ); // Initial position
    this.addComponent(
      new VelocityComponent(initialVelocity.vx, initialVelocity.vy),
    ); // Initial velocity
    this.addComponent(new MassComponent(mass)); // Mass of the entity
    this.addComponent(new ForceComponent()); // Force acting on the entity
    this.addComponent(new AccumulatedForceComponent()); // Force acting on the entity
    this.addComponent(new MouseDragComponent()); // Component for mouse dragging
    this.addComponent(new FrictionComponent(friction)); // Friction acting on the entity
    this.addComponent(new DOMComponent(domElement)); // DOM element associated with the entity
  }
}

// Define an AnchorEntity to represent a fixed anchor point
export class AnchorEntity extends Entity {
  constructor(initialPositon: { x: number; y: number }, name?: string) {
    super();
    this.name = name;
    this.addComponent(
      new PositionComponent(initialPositon.x, initialPositon.y),
    ); // Initial position
    this.addComponent(new VelocityComponent(0, 0)); // Initial velocity
    this.addComponent(new ForceComponent()); // Force acting on the entity
    this.addComponent(new AccumulatedForceComponent()); // Force acting on the entity
  }
}
