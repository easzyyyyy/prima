namespace Script {
    import ƒ = FudgeCore;

    export class Sprite {
        name = 'Sprite';
        speedX = 0;
        speedY = 0;
        accX = 0;
        accY = -30;
        isJumping = false;
        node: ƒ.Node;
        transform: ƒ.Node;
        visual: ƒ.Node;
        audio: ƒ.ComponentAudio;

        constructor(node: ƒ.Node, name: string) {
            this.node = node;
            this.transform = this.node.getChildrenByName('SonicTransform')[0];
            this.visual = this.transform.getChildrenByName('SonicVisual')[0];
            this.audio = this.node.getComponent(ƒ.ComponentAudio);
            this.name = name;

            // Change the Node scale in order to respect the Sonic ratio
            this.node.mtxLocal.scaleX(177/250);
            // Because the spritesheet is on the wrong side
            this.transform.mtxLocal.rotateY(180);
        }

        getX() {
            return this.node.mtxLocal.translation.x;
        }

        getY() {
            return this.node.mtxLocal.translation.y;
        }

        getPos() {
            return this.node.mtxLocal.translation;
        }

        setX(x: number) {
            let newTranslation = this.node.mtxLocal.translation;
            newTranslation.x = x;
            this.node.mtxLocal.translation = newTranslation;
        }

        setY(y: number) {
            let newTranslation = this.node.mtxLocal.translation;
            newTranslation.y = y;
            this.node.mtxLocal.translation = newTranslation;
        }

        setPos(x: number, y: number) {
            let newTranslation = this.node.mtxLocal.translation;
            newTranslation.x = x;
            newTranslation.y = y;
            this.node.mtxLocal.translation = newTranslation;
        }

        /**
         * 1 = right, -1 = left
         * @returns side
         */
        getSide() {
            return this.node.mtxLocal.get()[0];
        }

        /**
         * right or left
         * @param {string} side
         */
        setSide(side: string) {
            let newRotation = this.node.mtxLocal.rotation;
            newRotation.y = side === 'right' ? 0 : 180;
            this.node.mtxLocal.rotation = newRotation;
        }

        move() {
            this.speedX += timeBased(this.accX);
            this.speedY += timeBased(this.accY);

            // If the speed is negativ, sonic is going to the left so we change his side
            if (this.speedX < 0) {
                this.setSide('left');
            } else if (this.speedX > 0) {
                this.setSide('right');
            }

            // abs because the side is changed for the node
            this.node.mtxLocal.translateX(timeBased(Math.abs(this.speedX)));
            this.node.mtxLocal.translateY(timeBased(this.speedY));

            // So sonic don't go under 1 in y
            // let posY = this.getY()
            // if (posY < 1) {
            //     this.setY(1);
            //     this.isJumping = false;
            //     this.speedY = 0;
            // }
        }

        anim() {
            const currentAnimation = this.visual.getComponent(ƒ.ComponentAnimator)
            let nextAnimationName = null
            if (this.isJumping) {
                nextAnimationName = 'SonicJump'
            } else if (this.speedX !== 0) {
                nextAnimationName = 'SonicRun'
            } else {
                nextAnimationName = 'SonicIdle'
            }

            if (currentAnimation.animation.name !== nextAnimationName) {
                const nextAnimation = ƒ.Project.getResourcesByName(nextAnimationName)[0] as ƒ.AnimationSprite
                currentAnimation.animation = nextAnimation
            }
        }

        playSound(name: string) {
            const sound = ƒ.Project.getResourcesByName(name)[0] as ƒ.Audio;
            this.audio.setAudio(sound);
            this.audio.play(true);
        }

        jump() {
            if (!this.isJumping) {
                this.speedY = 10;
                this.isJumping = true;
                this.playSound('jump.mp3');
            }
        }
    }
}
