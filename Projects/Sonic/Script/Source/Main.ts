namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let sonic: Sprite

  document.addEventListener("interactiveViewportStarted", <EventListener>start);
  // document.addEventListener("keydown", handleKeyboard);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    const sonicNode = viewport.getBranch().getChildrenByName('Sonic')[0];
    sonic = new Sprite(sonicNode, 'Sonic');
    // let cmpSonic: ƒ.ComponentTransform = sonic.getComponent(ƒ.ComponentTransform);
    // cmpSonic.mtxLocal.translateX(1);

    // Move the default camera
    viewport.camera.mtxPivot.translateZ(15);
    viewport.camera.mtxPivot.rotateY(180);

    viewport.camera.mtxPivot.translateX(-4.5);
    viewport.camera.mtxPivot.translateY(3.5);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // let timeStamp = _event.timeStamp;

    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    // ƒ.AudioManager.default.update();

    // Make sonic move
    let sonicPos = sonic.getX();
    if (sonicPos > 9.2) {
      sonic.setX(0);
    } else if (sonicPos < -0.1) {
      sonic.setX(9.2);
    }

    // Control sonic

    // Right and Left
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
      sonic.speedX = 0.1;
    } else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
      sonic.speedX = -0.1;
    } else {
      sonic.speedX = 0;
    }

    // // Right and Left fun
    // if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
    //   sonic.accX = 0.005;
    // } else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
    //   sonic.accX = -0.005;
    // } else {
    //   sonic.accX = 0;
    //   sonic.speedX /= 1.1;
    // }

    // Jump
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE, ƒ.KEYBOARD_CODE.ARROW_UP])) {
      sonic.jump();
    }

    sonic.move();
  }

  class Sprite {
    name = 'Sprite';
    speedX = 0;
    speedY = 0;
    accX = 0;
    accY = -0.02;
    isJumping = false;
    node: ƒ.Node;

    constructor(node: ƒ.Node, name: string) {
      this.node = node;
      this.name = name;
    }

    getX() {
      return this.node.mtxLocal.get()[12];
    }

    getY() {
      return this.node.mtxLocal.get()[13];
    }

    getPos() {
      return {
        x: this.node.mtxLocal.get()[12],
        y: this.node.mtxLocal.get()[13]
      };
    }

    setX(x: number) {
      let newMtxLocal = this.node.mtxLocal.get()
      newMtxLocal[12] = x;
      this.node.mtxLocal.set(newMtxLocal);
    }

    setY(y: number) {
      let newMtxLocal = this.node.mtxLocal.get()
      newMtxLocal[13] = y;
      this.node.mtxLocal.set(newMtxLocal);
    }

    setPos(x: number, y: number) {
      let newMtxLocal = this.node.mtxLocal.get()
      newMtxLocal[12] = x;
      newMtxLocal[13] = y;
      this.node.mtxLocal.set(newMtxLocal);
    }

    /**
     * 1 = right, -1 = left
     * @returns side
     */
    getSide() {
      return this.node.mtxLocal.get()[0];
    }

    /**
     * 1 = right, -1 = left
     * @param side
     */
    setSide(side: number) {
      let newMtxLocal = this.node.mtxLocal.get()
      newMtxLocal[0] = side;
      this.node.mtxLocal.set(newMtxLocal);
    }

    move() {
      this.speedX += this.accX;
      this.speedY += this.accY;

      // If the speed is negativ, sonic is going to the left so we change his side
      if (this.speedX < 0) {
        this.setSide(-1);
      } else if (this.speedX > 0) {
        this.setSide(1);
      }

      // Abs because the side is automatically changed
      this.node.mtxLocal.translateX(Math.abs(this.speedX));
      this.node.mtxLocal.translateY(this.speedY);

      // So sonic don't go under 1 in y
      let posY = this.getY()
      if (posY < 1) {
        this.setY(1)
        this.isJumping = false;
      }
    }

    jump() {
      if (!this.isJumping) {
        this.speedY = 0.3;
        this.isJumping = true;
      }
    }
  }
}
