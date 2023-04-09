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

        constructor(node: ƒ.Node, name: string) {
            this.node = node;
            this.name = name;

            // Change the Node scale in order to respect the Sonic ratio
            this.node.mtxLocal.scaleX(177/250);
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
         * 1 = right, -1 = left
         * @param side
         */
        setSide(side: number) {
            const material = this.node.getComponent(ƒ.ComponentMaterial);

            let newMtxLocal = material.mtxPivot.scaling;
            newMtxLocal.x = side;
            material.mtxPivot.scaling = newMtxLocal;
        }

        move() {
            this.speedX += timeBased(this.accX);
            this.speedY += timeBased(this.accY);

            // If the speed is negativ, sonic is going to the left so we change his side
            if (this.speedX < 0) {
                this.setSide(-1);
            } else if (this.speedX > 0) {
                this.setSide(1);
            }

            // Not abs because the side is changed for the material, not for the node
            this.node.mtxLocal.translateX(timeBased(this.speedX));
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
            // const animation = this.node.getComponent(ƒ.ComponentAnimator)
            // if (this.speedX !== 0 && animation.animation.name !== 'SonicRun') {
            //     this.node.removeComponent(animation)
            //     // this.node.addComponent(new ƒ.ComponentAnimator)
            // }
            // else if (animation.animation.name !== 'SonicIdle') {
            //     this.node.removeComponent(animation)
            //     // this.node.addComponent(new ƒ.ComponentAnimator)
            // }
        }

        jump() {
            if (!this.isJumping) {
                this.speedY = 10;
                this.isJumping = true;
            }
        }
    }
}
