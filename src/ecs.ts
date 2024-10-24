export const VELOCITY_THRESHOLD = 0.01; // Minimum velocity to keep updating
export const FORCE_THRESHOLD = 0.01; // Minimum force to keep applying updates

export class Entity {
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

export abstract class Component {
  // All components extend from this base
}

export abstract class System {
  // Optional method. Prepare is called only once before the render loop
  prepare?(entities: Entity[]): unknown;

  // Render loop. Called om every frame. 
  // Abstract method, must be implemented by subclasses
  abstract update(entities: Entity[]): unknown;
}
