import "./style.css";

// Engine
import { AnimationEngine } from "./engine";

// ECS
import { Entity } from "./ecs";
import {
  PositionComponent,
  VelocityComponent,
  MassComponent,
  ForceComponent,
  AccumulatedForceComponent,
  FrictionComponent,
} from "./components";
import { MovementSystem, FrictionSystem } from "./systems";

// Specific Components and Systems
import {
  MouseDragComponent,
  MouseForceSystem,
  DOMComponent,
  DOMUpdateSystem,
  DOMMouseDragHandler,
} from "./dom";
import { SpringEntity, SpringPhysicsSystem } from "./spring";
import { ChartSystem } from "./chart";

//
// Application Logic
//

// Create the ECS engine
const engine = new AnimationEngine();

// Create the box entity
const boxEntity = new Entity();
boxEntity.name = "box1";
boxEntity.addComponent(new PositionComponent(100, 100)); // Initial position
boxEntity.addComponent(new VelocityComponent(0, 0)); // Initial velocity
boxEntity.addComponent(new MassComponent(1)); // Mass of the entity
boxEntity.addComponent(new ForceComponent()); // Force acting on the entity
boxEntity.addComponent(new AccumulatedForceComponent()); // Force acting on the entity TODO: may not be needed
boxEntity.addComponent(new MouseDragComponent()); // Component for mouse dragging
boxEntity.addComponent(new FrictionComponent(0.05));

const boxElement = document.getElementById("box1") as HTMLElement;
boxEntity.addComponent(new DOMComponent(boxElement));

// Creating the spring force
const anchorEntity = new Entity();
anchorEntity.name = "anchor";
anchorEntity.addComponent(new PositionComponent(100, 100)); // Fixed point for the spring
anchorEntity.addComponent(new VelocityComponent(0, 0)); // Initial velocity of the anchor point
anchorEntity.addComponent(new ForceComponent()); // Force acting on the anchor point
anchorEntity.addComponent(new AccumulatedForceComponent()); // Force acting on the anchor point

// Create a spring entity that connects entityA and entityB
const springEntity = new SpringEntity(boxEntity, anchorEntity, 0.2, 0.05, 1.0);
springEntity.name = "spring";

// Create second box entity
const boxEntity2 = new Entity();
boxEntity2.name = "box2";
boxEntity2.addComponent(new PositionComponent(250, 100)); // Initial position
boxEntity2.addComponent(new VelocityComponent(0, 0)); // Initial velocity
boxEntity2.addComponent(new MassComponent(1)); // Mass of the entity
boxEntity2.addComponent(new ForceComponent()); // Force acting on the entity
boxEntity2.addComponent(new AccumulatedForceComponent()); // Force acting on the entity TODO: may not be needed
boxEntity2.addComponent(new MouseDragComponent()); // Component for mouse dragging
boxEntity2.addComponent(new FrictionComponent(0.05));

const boxElement2 = document.getElementById("box2") as HTMLElement;
boxEntity2.addComponent(new DOMComponent(boxElement2));

// Creating the spring force connecting box and box2
const springEntity2 = new SpringEntity(boxEntity, boxEntity2, 0.2, 0.05, 2.0);
springEntity2.name = "spring2";

// Create third box entity
const boxEntity3 = new Entity();
boxEntity3.name = "box3";
boxEntity3.addComponent(new PositionComponent(400, 100)); // Initial position
boxEntity3.addComponent(new VelocityComponent(0, 0)); // Initial velocity
boxEntity3.addComponent(new MassComponent(1)); // Mass of the entity
boxEntity3.addComponent(new ForceComponent()); // Force acting on the entity
boxEntity3.addComponent(new AccumulatedForceComponent()); // Force acting on the entity
boxEntity3.addComponent(new MouseDragComponent()); // Component for mouse dragging
boxEntity3.addComponent(new FrictionComponent(0.05));

const boxElement3 = document.getElementById("box3") as HTMLElement;
boxEntity3.addComponent(new DOMComponent(boxElement3));

// Creating the spring force connecting box2 and box3
const springEntity3 = new SpringEntity(boxEntity2, boxEntity3, 0.1, 0.05, 1.0);
springEntity3.name = "spring3";

// Set up the movement system (handles physics and movement)
const movementSystem = new MovementSystem();

// Creating the friction component and system
const frictionSystem = new FrictionSystem();

// Spring physics system
const springPhysicsSystem = new SpringPhysicsSystem();

// Set up the mouse force system (handles the spring-like dragging effect)
const mouseForceSystem = new MouseForceSystem(0.2, 0.1); // Drag strength and damping

// Set up the DOM update system (handles syncing the DOM with the entity position)
const domUpdateSystem = new DOMUpdateSystem();
domUpdateSystem.linkEntityToDOM(boxEntity, boxElement);
domUpdateSystem.linkEntityToDOM(boxEntity2, boxElement2);
domUpdateSystem.linkEntityToDOM(boxEntity3, boxElement3);

// Set up the DOM mouse drag handler to handle mouse events via the DOM component
const domMouseDragHandler = new DOMMouseDragHandler();
domMouseDragHandler.initializeDragListeners(boxEntity);

const domMouseDragHandler2 = new DOMMouseDragHandler();
domMouseDragHandler2.initializeDragListeners(boxEntity2);

const domMouseDragHandler3 = new DOMMouseDragHandler();
domMouseDragHandler3.initializeDragListeners(boxEntity3);

// Add Entities to the engine
engine.addEntity(anchorEntity);
engine.addEntity(boxEntity);
engine.addEntity(boxEntity2);
engine.addEntity(boxEntity3);
engine.addEntity(springEntity);
engine.addEntity(springEntity2);
engine.addEntity(springEntity3);

// Add systems to the engine
engine.addSystem(springPhysicsSystem);
engine.addSystem(frictionSystem);
engine.addSystem(mouseForceSystem);
engine.addSystem(movementSystem);
engine.addSystem(domUpdateSystem);

// Initialize the chart system
const chartContext = document.getElementById("chart") as HTMLCanvasElement;
if (chartContext) {
  const chartSystem = new ChartSystem(chartContext);
  engine.addSystem(chartSystem);
}

// Start the engine
engine.start();

// TODO
// -[ ] Prepare specific entities kinds (anchor, box, etc). The components should be added in the constructor like the spring, this minimizes the amount of components to add manually to an entity.
// -[ ] Cleanup creation examples, it's easy to forget to add entities to the engine if not added right after creation.
// -[ ] Take initial and drop velocity into account
// -[ ] Attach multiple entities to the spring force. Make a cloth like simulation.
// -[ ] Add a start and stop button to the simulation.
// -[ ] Render springs
// -[ ] On spring click it will remove them.
// -[ ] On box click it will fix it. how? a very strong spring force or any strong force.?
// -[ ] Make the forces method "add" or "apply" instead of directly mutating it
// -[ ] Use verlet integration instead of Euler integration.
// -[ ] Measure performance and optimize it wherever possible.
// -[ ] If it's a DOM element write itself in web, or canvas, etc, make this abstract and platform independent.
// -[ ] Make the dragging interaction or any input interaction abstract and platform independent.
// -[ ] Make the chart system abstract and platform independent.
// -[ ] Make the mouse force be a spring by using spring component/entities/systems.
// -[ ] Add collision system.
// -[ ] Add magnetic force system.
// -[ ] Add wind force
