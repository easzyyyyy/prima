namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export let viewport: ƒ.Viewport;
  export let graph: ƒ.Node;
  export let camera: ƒ.ComponentCamera;
  export let karting: Karting;
  export let track: Track;
  export let gamestate: Gamestate;

  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;
    graph = viewport.getBranch();
    camera = viewport.camera;
    gamestate = new Gamestate()
    console.log(gamestate);

    // See colliders
    viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.COLLIDERS;

    // Initialize karting
    const kartingNode: ƒ.Node = graph.getChildrenByName('Karting')[0];
    karting = new Karting(kartingNode);

    // Initialize track
    const trackNode: ƒ.Node = graph.getChildrenByName('Track')[0];
    track = new Track(trackNode);
    await track.loadTextures();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    karting.loop();

    ƒ.Physics.simulate(); // if physics is included and used
    viewport.draw();
    // ƒ.AudioManager.default.update();
  }
}