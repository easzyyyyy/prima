namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export let viewport: ƒ.Viewport;

  // @ts-ignore
  document.addEventListener("interactiveViewportStarted", start);

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    // Move the default camera
    viewport.camera.mtxPivot.rotateY(-45);
    viewport.camera.mtxPivot.translateX(2.5);
    viewport.camera.mtxPivot.translateY(2.5);
    viewport.camera.mtxPivot.translateZ(-15);

    // Create map
    createMap(5, 5, 5, viewport.getBranch());

    // @ts-ignore
    viewport.canvas.addEventListener("pointerdown", interactWithBlock);

    // Do not display the context menu on right click
    viewport.canvas.addEventListener("contextmenu", (_event) => {
      _event.preventDefault();
      return false;
    });

    // Create Steve
    const position = new ƒ.Vector3(1, 10, 1);
    const color = new ƒ.Color(0, 0, 255);
    const block = new Steve(position, color);
    viewport.getBranch().addChild(block);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    // ƒ.AudioManager.default.update();
  }
}