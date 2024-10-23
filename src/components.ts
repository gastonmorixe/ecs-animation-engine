import { Component } from "./ecs";

export class PositionComponent extends Component {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
}

export class VelocityComponent extends Component {
  vx: number;
  vy: number;

  constructor(vx: number = 0, vy: number = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
  }
}

export class MassComponent extends Component {
  mass: number;

  constructor(mass: number) {
    super();
    this.mass = mass;
  }
}

export class ForceComponent extends Component {
  fx: number = 0;
  fy: number = 0;
}

export class AccumulatedForceComponent extends Component {
  accumulatedFx: number = 0;
  accumulatedFy: number = 0;
}

export class FrictionComponent extends Component {
  frictionCoefficient: number;

  constructor(frictionCoefficient: number = 0.05) {
    super();
    this.frictionCoefficient = frictionCoefficient;
  }
}

// export class SpringForceComponent extends Component {
//   entityA: Entity;
//   entityB: Entity;
//   stiffness: number;
//   damping: number;
//
//   constructor(
//     entityA: Entity,
//     entityB: Entity,
//     stiffness: number = 0.1,
//     damping: number = 0.05,
//   ) {
//     super();
//     this.entityA = entityA;
//     this.entityB = entityB;
//     this.stiffness = stiffness;
//     this.damping = damping;
//   }
// }
