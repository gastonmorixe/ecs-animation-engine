import { Entity, System } from "./ecs";

export class AnimationEngine {
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
