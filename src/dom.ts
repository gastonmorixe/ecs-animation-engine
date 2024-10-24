import { Entity, Component, System } from "./ecs";
import {
  PositionComponent,
  VelocityComponent,
  ForceComponent,
} from "./components";

export class MouseForceSystem extends System {
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
      const mouseDrag = entity.getComponent(MouseDragComponent);

      // TODO: Move this to init. Make Engine/System call init on all systems
      if (mouseDrag && !mouseDrag.dragHandler) {
        mouseDrag.dragHandler = new DragHandler(entity);
      }
      
      if (
        position &&
        velocity &&
        force &&
        mouseDrag &&
        mouseDrag.isDragging
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
        const dx = mouseDrag.targetX - position.x;
        const dy = mouseDrag.targetY - position.y;

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

export class MouseDragComponent extends Component {
  isDragging: boolean = false;
  targetX: number = 0;
  targetY: number = 0;
  offsetX: number = 0; // Offset from the mouse click to the box's position
  offsetY: number = 0;
  dragHandler?: DragHandler;
  
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

export class DOMComponent extends Component {
  domElement: HTMLElement;

  constructor(domElement: HTMLElement) {
    super();
    this.domElement = domElement;
  }
}

export class DOMUpdateSystem extends System {
  // Update the DOM element positions based on the entity's position component
  update(entities: Entity[]) {
    entities.forEach((entity) => {
      const position = entity.getComponent(PositionComponent);
      const domComponent = entity.getComponent(DOMComponent);

      if (position && domComponent) {
        const domElement = domComponent.domElement;
        // TODO: Update only if it changed
        if (domElement) {
          domElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
        }
      }
    });
  }
}

export class DragHandler {
  constructor(entity: Entity) {
    super();
    this.initializeDragListeners(entity);
  }
  
  initializeDragListeners(entity: Entity) {
    const domComponent = entity.getComponent(DOMComponent);
    const mouseDrag = entity.getComponent(MouseDragComponent);
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
    mouseDragComponent: MouseDragComponent,
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

  onMouseMove(event: MouseEvent, mouseDragComponent: MouseDragComponent) {
    if (mouseDragComponent.isDragging) {
      // Update the target, accounting for the initial offset
      mouseDragComponent.setTarget(
        event.clientX - mouseDragComponent.offsetX,
        event.clientY - mouseDragComponent.offsetY,
      );
    }
  }

  onMouseUp(mouseDragComponent: MouseDragComponent, element: HTMLElement) {
    element.classList.remove("dragging");
    mouseDragComponent.stopDrag();
  }

  // Touch event equivalents
  onTouchStart(
    event: TouchEvent,
    mouseDragComponent: MouseDragComponent,
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

  onTouchMove(event: TouchEvent, mouseDragComponent: MouseDragComponent) {
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

  onTouchEnd(mouseDragComponent: MouseDragComponent, element: HTMLElement) {
    element.classList.remove("dragging");
    mouseDragComponent.stopDrag();
  }
}
