# Entity Component System (ECS) Physics Animation Engine

![CleanShot 2024-10-21 at 19 21 00](https://github.com/user-attachments/assets/93241f1c-50c1-4c76-bdbe-3b4e958aa734)


### Description

**Entity Component System (ECS) physics animation engine with damped harmonic oscillator (springs, and friction)**

This project is a physics animation engine built using the Entity Component System (ECS) architectural pattern. The engine simulates the motion of entities affected by forces such as springs and friction, incorporating physical concepts like damped harmonic oscillators to create realistic interactions.

The engine provides an efficient way to simulate and visualize complex systems with multiple entities, leveraging ECS for high performance and modularity.

### Features

- **ECS Architecture**: Modular design using an Entity Component System for a flexible, scalable physics simulation.
- **Spring System**: Damped harmonic oscillators for realistic spring-based motion.
- **Friction System**: Implemented friction that opposes velocity, creating natural deceleration.
- **Mouse Interaction**: Drag and release entities with realistic forces applied, such as spring pullback and friction.
- **Chart Visualization**: Real-time visualization of entity properties (position, velocity, and force) using Chart.js, allowing you to observe the effect of forces over time.

### Usage 

Check `src/main.ts` 

```ts
// Engine
import { AnimationEngine } from "./engine";

// ECS - Core
import { MovementSystem, FrictionSystem } from "./systems";
import { BoxEntity, AnchorEntity } from "./entities";

// Specialized Systems and Entities
import { MouseForceSystem, DOMUpdateSystem } from "./dom";
import { SpringEntity, SpringPhysicsSystem } from "./spring";

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

// Create second box entity
const boxElement2 = document.getElementById("box2") as HTMLElement;
const boxEntity2 = new BoxEntity(boxElement2, { x: 250, y: 100 }, "box2");

// Creating the spring force connecting box and box2
const springEntity2 = new SpringEntity(boxEntity, boxEntity2, 0.2, 0.05, 2.0);

// Create third box entity
const boxElement3 = document.getElementById("box3") as HTMLElement;
const boxEntity3 = new BoxEntity(boxElement3, { x: 400, y: 100 }, "box3");

// Creating the spring force connecting box2 and box3
const springEntity3 = new SpringEntity(boxEntity2, boxEntity3, 0.1, 0.05, 1.0);

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

// Start the engine
engine.start();
```

### Getting Started

#### Prerequisites

- **Bun**

#### Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/gastonmorixe/ecs-animation-engine.git
   cd ecs-animation-engine
   ```

2. **Install Dependencies**:
   ```sh
   bun install
   ```

#### Running the Engine

1. **Start the Development Server**:
   ```sh
   bun run dev
   ```
   This command will start a local development server, and you can view the engine in your browser at `http://localhost:5173`.

2. **Interact with the Simulation**:
   - **Click and drag** the blue box to move it around.
   - **Release the mouse** to see the effects of spring forces and friction as the entity moves back towards its anchor.

### Code Overview

#### ECS Pattern
- **Entities**: Represent the objects in the simulation (e.g., `box`, `anchor`).
- **Components**: Contain the data needed to describe various aspects of an entity, such as `PositionComponent`, `VelocityComponent`, `ForceComponent`, and `FrictionComponent`.
- **Systems**: Implement the logic that operates on entities with specific components (e.g., `MovementSystem`, `SpringForceSystem`, `FrictionSystem`).

#### Key Systems
- **Movement System**: Calculates the new positions of entities based on the forces acting on them.
- **Spring Force System**: Applies spring forces between entities, creating the effect of a damped harmonic oscillator.
- **Mouse Force System**: Handles user interactions for dragging entities with the mouse.
- **Friction System**: Simulates the force of friction opposing entity movement, providing a realistic deceleration.
- **Chart System**: Visualizes key properties such as position, velocity, and forces over time using Chart.js.

### File Structure

```
├── bun.lockb
├── index.html
├── package.json
├── public
├── src
│   ├── main.ts
│   ├── style.css
│   └── vite-env.d.ts
└── tsconfig.json
```

### How It Works
- **Mouse Interaction**: Users can interact with the `box` entity by clicking and dragging it. Upon releasing the mouse, the box is affected by spring and friction forces, resulting in realistic motion and smooth oscillation back towards the anchor point.
- **Rolling Window for Charts**: To keep the real-time chart visualization readable, a rolling window is used to limit the number of data points shown, preventing performance issues and ensuring clarity.

### Contributing

1. **Fork the Project**
2. **Create a Branch** (`git checkout -b feature/YourFeature`)
3. **Commit Your Changes** (`git commit -m 'Add some feature'`)
4. **Push to the Branch** (`git push origin feature/YourFeature`)
5. **Open a Pull Request**

### License

This project is licensed under the MIT License. See `LICENSE` for more information.

### Contact

**Gaston Morixe** - [@gastonmorixe](https://x.com/gastonmorixe) - gaston@gastonmorixe.com

Project Link: [https://github.com/gastonmorixe/ecs-animation-engine](https://github.com/gastonmorixe/ecs-animation-engine)

### Acknowledgements
- **Chart.js** for real-time data visualization
- **ECS Pattern** inspiration for flexible game development

