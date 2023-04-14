namespace Script {
    import ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");

    let viewport: ƒ.Viewport;
    let game: ƒ.Node
    let sonic: Sprite;
    let terrain: ƒ.Node;

    document.addEventListener("interactiveViewportStarted", <EventListener>start);
    // document.addEventListener("keydown", handleKeyboard);

    function start(_event: CustomEvent): void {
        viewport = _event.detail;

        game = viewport.getBranch()

        // Setup music
        const music = game.getComponent(ƒ.ComponentAudio)
        const musicAudio = ƒ.Project.getResourcesByName('music.mp3')[0] as ƒ.Audio
        music.setAudio(musicAudio)
        music.play(true)

        // Setup Sonic
        const sonicNode = viewport.getBranch().getChildrenByName('Sonic')[0];
        sonic = new Sprite(sonicNode, 'Sonic');

        // Setup audio
        let audioListener: ƒ.ComponentAudioListener = sonicNode.getComponent(ƒ.ComponentAudioListener);
        ƒ.AudioManager.default.listenWith(audioListener);
        ƒ.AudioManager.default.listenTo(game);
        ƒ.Debug.log("Audio:", ƒ.AudioManager.default);

        // Move the default camera
        viewport.camera.mtxPivot.translateZ(15);
        viewport.camera.mtxPivot.rotateY(180);
        viewport.camera.mtxPivot.translateY(5);

        // Load terrain
        terrain = viewport.getBranch().getChildrenByName('Terrain')[0];

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }

    function update(_event: Event): void {
        // let timeStamp = _event.timeStamp;

        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        // ƒ.AudioManager.default.update();

        // Move camera
        cameraFollowSprite(sonic.node, viewport);

        // Control sonic
        // Right and Left
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
            sonic.speedX = 6;
        } else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
            sonic.speedX = -6;
        } else {
            sonic.speedX = 0;
        }

        // Jump
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE, ƒ.KEYBOARD_CODE.ARROW_UP])) {
            sonic.jump();
        }

        sonic.move();
        sonic.anim();

        // Test collisions
        let tiles: ƒ.Node[] = terrain.getChildren()
        for (let tile of tiles) {
            const collision = collide(sonic.node, tile)
            if (collision) {
                sonic.isJumping = false;
                sonic.speedY = 0;
                sonic.speedX = 0;
            }
        }

        // Test if game is over
        if (sonic.getY() < -5) {
            sonic.playSound('death.mp3');
            sonic.setPos(0, 1);
        }
    }
}
