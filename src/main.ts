import "./style.css";

// Engine
import { AnimationEngine } from "./engine";

// ECS
import { MovementSystem, FrictionSystem } from "./systems";

// Specialized Systems and Entities
import { MouseForceSystem, DOMUpdateSystem, DOMMouseDragHandler } from "./dom";
import { BoxEntity, AnchorEntity } from "./entities";
import { SpringEntity, SpringPhysicsSystem } from "./spring";
import { ChartSystem } from "./chart";

//
// -- Entities --
//

// Create the box entity
const boxElement = document.getElementById("box1") as HTMLElement;
const boxEntity = new BoxEntity(boxElement, { x: 100, y: 100 }, "box1");

// Creating a fixed anchor
const anchorEntity = new AnchorEntity({ x: 100, y: 100 }, "anchor");

// Create a spring entity that connects box1 and anchor
const springEntity = new SpringEntity(boxEntity, anchorEntity, 0.2, 0.05, 1.0);
springEntity.name = "spring";

// Create second box entity
const boxElement2 = document.getElementById("box2") as HTMLElement;
const boxEntity2 = new BoxEntity(boxElement2, { x: 250, y: 100 }, "box2");

// Creating the spring force connecting box and box2
const springEntity2 = new SpringEntity(boxEntity, boxEntity2, 0.2, 0.05, 2.0);
springEntity2.name = "spring2";

// Create third box entity
const boxElement3 = document.getElementById("box3") as HTMLElement;
const boxEntity3 = new BoxEntity(boxElement3, { x: 400, y: 100 }, "box3");

// Creating the spring force connecting box2 and box3
const springEntity3 = new SpringEntity(boxEntity2, boxEntity3, 0.1, 0.05, 1.0);
springEntity3.name = "spring3";

//
// --- Systems ---
//

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

// Set up the DOM mouse drag handler to handle mouse events via the DOM component
const domMouseDragHandler = new DOMMouseDragHandler();
domMouseDragHandler.initializeDragListeners(boxEntity);

const domMouseDragHandler2 = new DOMMouseDragHandler();
domMouseDragHandler2.initializeDragListeners(boxEntity2);

const domMouseDragHandler3 = new DOMMouseDragHandler();
domMouseDragHandler3.initializeDragListeners(boxEntity3);

//
// -- Engine --
//

// Create the ECS engine
const engine = new AnimationEngine();

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
