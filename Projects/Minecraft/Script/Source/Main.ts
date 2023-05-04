namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export let viewport: ƒ.Viewport;

  // @ts-ignore
  document.addEventListener("interactiveViewportStarted", start);

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    // Move the default camera
    viewport.camera.mtxPivot.rotateY(0);
    viewport.camera.mtxPivot.translateZ(0);
    viewport.camera.mtxPivot.translateX(0);

    // Create map
    createMap(5, 5, 5, viewport.getBranch());

    // @ts-ignore
    viewport.canvas.addEventListener("click", removeBlock);
    // @ts-ignore
    viewport.canvas.addEventListener("contextmenu", placeBlock)

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    // ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}