import { Entity, System, VELOCITY_THRESHOLD } from "./ecs";
import {
  VelocityComponent,
  PositionComponent,
  ForceComponent,
  FrictionComponent,
  MassComponent,
  AccumulatedForceComponent,
} from "./components";

export class FrictionSystem extends System {
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

export class MovementSystem extends System {
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
