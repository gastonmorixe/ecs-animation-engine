import { Component, Entity, System } from "./ecs";
import {
  PositionComponent,
  VelocityComponent,
  ForceComponent,
} from "./components";

// Define SpringComponent
export class SpringComponent extends Component {
  stiffness: number;
  damping: number;
  restLengthRatio: number; // Ratio of rest length relative to initial length
  initialLength?: number; // Initial length derived from connected entities

  constructor(
    stiffness: number,
    damping: number,
    restLengthRatio: number = 1.0,
  ) {
    super();
    this.stiffness = stiffness;
    this.damping = damping;
    this.restLengthRatio = restLengthRatio;
  }
}

// Define SpringEndpointsComponent to store references to connected entities
class SpringEndpointsComponent extends Component {
  entityA: Entity;
  entityB: Entity;

  constructor(entityA: Entity, entityB: Entity) {
    super();
    this.entityA = entityA;
    this.entityB = entityB;
  }
}

// Define SpringEntity to represent a spring force between two entities
export class SpringEntity extends Entity {
  constructor(
    entityA: Entity,
    entityB: Entity,
    stiffness: number,
    damping: number,
    restLengthRatio: number,
  ) {
    super();
    // Add SpringComponent to the spring entity
    this.addComponent(new SpringComponent(stiffness, damping, restLengthRatio));
    // Add SpringEndpointsComponent to store references to connected entities
    this.addComponent(new SpringEndpointsComponent(entityA, entityB));
  }
}

export class SpringPhysicsSystem extends System {
  update(entities: Entity[]): void {
    entities.forEach((entity) => {
      const springComponent = entity.getComponent(SpringComponent);
      const endpoints = entity.getComponent(SpringEndpointsComponent);

      if (springComponent && endpoints) {
        const positionA = endpoints.entityA.getComponent(PositionComponent);
        const positionB = endpoints.entityB.getComponent(PositionComponent);
        const velocityA = endpoints.entityA.getComponent(VelocityComponent);
        const velocityB = endpoints.entityB.getComponent(VelocityComponent);
        const forceA = endpoints.entityA.getComponent(ForceComponent);
        const forceB = endpoints.entityB.getComponent(ForceComponent);

        if (
          positionA &&
          positionB &&
          velocityA &&
          velocityB &&
          forceA &&
          forceB
        ) {
          // Calculate the current length between the connected entities
          const dx = positionB.x - positionA.x;
          const dy = positionB.y - positionA.y;
          const currentLength = Math.sqrt(dx * dx + dy * dy);

          // Prevent division by zero when currentLength is zero
          if (currentLength === 0) {
            // console.warn(
            //   "[SpringPhysicsSystem] Current length is zero, skipping force calculation.",
            // );
            return;
          }

          // Calculate the initial length if not yet set
          if (springComponent.initialLength === undefined) {
            springComponent.initialLength = currentLength;
          }

          // Calculate the rest length using the restLengthRatio
          const restLength =
            springComponent.restLengthRatio * springComponent.initialLength;

          // Calculate the spring force magnitude using Hooke's Law
          const springForceMagnitude =
            springComponent.stiffness * (currentLength - restLength);

          // Calculate the spring forces in x and y directions
          const fx = springForceMagnitude * (dx / currentLength);
          const fy = springForceMagnitude * (dy / currentLength);

          // Apply damping to the velocities directly along each axis
          const dampingForceX = -springComponent.damping * velocityA.vx;
          const dampingForceY = -springComponent.damping * velocityA.vy;

          // Total forces in the direction of each axis
          const totalForceX = fx + dampingForceX;
          const totalForceY = fy + dampingForceY;

          // Apply equal and opposite forces to each connected entity
          forceA.fx += totalForceX;
          forceA.fy += totalForceY;
          forceB.fx -= totalForceX;
          forceB.fy -= totalForceY;

          // Logging for debugging
          // console.log("[SpringPhysicsSystem]", {
          //   currentLength,
          //   restLength,
          //   springForceMagnitude,
          //   fx,
          //   fy,
          //   dampingForceX,
          //   dampingForceY,
          //   totalForceX,
          //   totalForceY,
          // });
        }
      }
    });
  }
}

// Define the SpringPhysicsSystem
// export class SpringPhysicsSystem extends System {
//   update(entities: Entity[]): void {
//     entities.forEach((entity) => {
//       const springComponent = entity.getComponent(SpringComponent);
//       const endpoints = entity.getComponent(SpringEndpointsComponent);
//
//       if (springComponent && endpoints) {
//         const positionA = endpoints.entityA.getComponent(PositionComponent);
//         const positionB = endpoints.entityB.getComponent(PositionComponent);
//         const velocityA = endpoints.entityA.getComponent(VelocityComponent);
//         const velocityB = endpoints.entityB.getComponent(VelocityComponent);
//         const forceA = endpoints.entityA.getComponent(ForceComponent);
//         const forceB = endpoints.entityB.getComponent(ForceComponent);
//
//         if (
//           positionA &&
//           positionB &&
//           velocityA &&
//           velocityB &&
//           forceA &&
//           forceB
//         ) {
//           // Calculate the current length between the connected entities
//           const dx = positionB.x - positionA.x;
//           const dy = positionB.y - positionA.y;
//           const currentLength = Math.sqrt(dx * dx + dy * dy);
//
//           // Prevent division by zero when currentLength is zero
//           if (currentLength === 0) {
//             console.warn(
//               "[SpringPhysicsSystem] Current length is zero, skipping force calculation.",
//             );
//             return;
//           }
//
//           // Calculate the initial length if not yet set
//           if (springComponent.initialLength === undefined) {
//             springComponent.initialLength = currentLength;
//           }
//
//           // Calculate the rest length using the restLengthRatio
//           const restLength =
//             springComponent.restLengthRatio * springComponent.initialLength;
//
//           // Calculate the spring force magnitude using Hooke's Law
//           const springForceMagnitude =
//             springComponent.stiffness * (currentLength - restLength);
//
//           // Normalize the direction vector
//           const lengthInverse = 1 / currentLength;
//           const directionX = dx * lengthInverse;
//           const directionY = dy * lengthInverse;
//
//           // Calculate the relative velocity along the spring direction
//           const relativeVelocityX = velocityB.vx - velocityA.vx;
//           const relativeVelocityY = velocityB.vy - velocityA.vy;
//           const relativeVelocityAlongSpring =
//             relativeVelocityX * directionX + relativeVelocityY * directionY;
//
//           // Apply damping force along the spring direction
//           const dampingForce =
//             -springComponent.damping * relativeVelocityAlongSpring;
//           const dampingForceX = dampingForce * directionX;
//           const dampingForceY = dampingForce * directionY;
//
//           // Total forces in the direction of the spring
//           const forceX = springForceMagnitude * directionX + dampingForceX;
//           const forceY = springForceMagnitude * directionY + dampingForceY;
//
//           // Apply equal and opposite forces to each connected entity
//           forceA.fx += forceX;
//           forceA.fy += forceY;
//           forceB.fx -= forceX;
//           forceB.fy -= forceY;
//
//           // Logging for debugging
//           console.log("[SpringPhysicsSystem]", {
//             currentLength,
//             restLength,
//             springForceMagnitude,
//             directionX,
//             directionY,
//             dampingForceX,
//             dampingForceY,
//             forceX,
//             forceY,
//           });
//         }
//       }
//     });
//   }
// }

// Define SpringPhysicsSystem to calculate spring forces between
// export class SpringPhysicsSystem extends System {
//   update(entities: Entity[]): void {
//     entities.forEach((entity) => {
//       const springComponent = entity.getComponent(SpringComponent);
//       const endpoints = entity.getComponent(SpringEndpointsComponent);
//
//       if (springComponent && endpoints) {
//         const positionA = endpoints.entityA.getComponent(PositionComponent);
//         const positionB = endpoints.entityB.getComponent(PositionComponent);
//         const velocityA = endpoints.entityA.getComponent(VelocityComponent);
//         const velocityB = endpoints.entityB.getComponent(VelocityComponent);
//         const forceA = endpoints.entityA.getComponent(ForceComponent);
//         const forceB = endpoints.entityB.getComponent(ForceComponent);
//
//         if (
//           positionA &&
//           positionB &&
//           velocityA &&
//           velocityB &&
//           forceA &&
//           forceB
//         ) {
//           // Calculate the current length between the connected entities
//           const dx = positionB.x - positionA.x;
//           const dy = positionB.y - positionA.y;
//           const currentLength = Math.sqrt(dx * dx + dy * dy);
//
//           // Prevent division by zero when currentLength is zero
//           if (currentLength === 0) {
//             console.warn(
//               "[SpringPhysicsSystem] Current length is zero, skipping force calculation.",
//             );
//             return;
//           }
//
//           // Calculate the initial length if not yet set
//           if (springComponent.initialLength === undefined) {
//             springComponent.initialLength = currentLength;
//           }
//
//           // Calculate the rest length using the restLengthRatio
//           const restLength =
//             springComponent.restLengthRatio * springComponent.initialLength;
//
//           // Calculate the spring force magnitude using Hooke's Law
//           const springForceMagnitude =
//             springComponent.stiffness * (currentLength - restLength);
//
//           // Normalize the direction vector
//           const lengthInverse = 1 / currentLength;
//           const directionX = dx * lengthInverse;
//           const directionY = dy * lengthInverse;
//
//           // Apply damping to the velocities
//           const relativeVelocityX = velocityB.vx - velocityA.vx;
//           const relativeVelocityY = velocityB.vy - velocityA.vy;
//           const dampingForceX = -springComponent.damping * relativeVelocityX;
//           const dampingForceY = -springComponent.damping * relativeVelocityY;
//
//           // Total forces in the direction of the spring
//           const forceX = springForceMagnitude * directionX + dampingForceX;
//           const forceY = springForceMagnitude * directionY + dampingForceY;
//
//           // Apply equal and opposite forces to each connected entity
//           forceA.fx += forceX;
//           forceA.fy += forceY;
//           forceB.fx -= forceX;
//           forceB.fy -= forceY;
//
//           // Logging for debugging
//           console.log("[SpringPhysicsSystem]", {
//             currentLength,
//             restLength,
//             springForceMagnitude,
//             directionX,
//             directionY,
//             dampingForceX,
//             dampingForceY,
//             forceX,
//             forceY,
//           });
//         }
//       }
//     });
//   }
// }
