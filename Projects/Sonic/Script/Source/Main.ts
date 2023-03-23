namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let sonic: ƒ.Node

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    sonic = viewport.getBranch().getChildrenByName('Sonic')[0];
    // let cmpSonic: ƒ.ComponentTransform = sonic.getComponent(ƒ.ComponentTransform);
    // cmpSonic.mtxLocal.translateX(1);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();

    // Make sonic move
    let sonicPos = sonic.mtxLocal.get()[12];
    if (sonicPos < 9) {
      sonic.mtxLocal.translateX(0.1);
    } else {
      sonic.mtxLocal.translateX(-9);
    }
  }
}