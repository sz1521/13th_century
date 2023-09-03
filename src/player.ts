/*
 *  Copyright 2023 Sami Heikkinen, Tero Jäntti
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Direction } from './area';
import { GameObject } from './gameobject';
import { context } from './graphics';
import {
    AnimationDefinition,
    RunningAnimation,
    getFrame,
    playerNorthStandAnimation,
    playerNorthWalkAnimation,
    playerSouthStandAnimation,
    playerSouthWalkAnimation,
    playerWestStandAnimation,
    playerWestWalkAnimation,
} from './animations';

const imageWidth = 50;
const imageHeight = 135;

const collisionWidth = imageWidth * 0.6;
const collisionHeight = collisionWidth / 2;

const xMargin = (imageWidth - collisionWidth) / 2;

const selectAnimation = (
    direction: Direction,
    walk: boolean,
): AnimationDefinition => {
    switch (direction) {
        case Direction.Left:
        case Direction.Right:
            return walk ? playerWestWalkAnimation : playerWestStandAnimation;
        case Direction.Up:
            return walk ? playerNorthWalkAnimation : playerNorthStandAnimation;
        case Direction.Down:
        default:
            return walk ? playerSouthWalkAnimation : playerSouthStandAnimation;
    }
};

export class Player implements GameObject {
    x: number = 0;
    y: number = 0;

    width = collisionWidth;
    height = collisionHeight;

    private direction: Direction = Direction.Down;
    private isMoving: boolean = false;

    private animation: RunningAnimation = {
        definition: playerSouthStandAnimation,
        startTime: performance.now(),
    };

    move(dx: number, dy: number): void {
        const oldDirection = this.direction;
        let newDirection = this.direction;

        const wasMoving = this.isMoving;
        let isMoving = false;

        if (dx !== 0) {
            this.x += dx;
            newDirection = dx < 0 ? Direction.Left : Direction.Right;
            isMoving = true;
        }
        if (dy !== 0) {
            this.y += dy;
            newDirection = dy < 0 ? Direction.Up : Direction.Down;
            isMoving = true;
        }

        if (newDirection !== oldDirection || isMoving !== wasMoving) {
            this.direction = newDirection;
            this.isMoving = isMoving;
            this.animation = {
                definition: selectAnimation(newDirection, dx !== 0 || dy !== 0),
                startTime: performance.now(),
            };
        }
    }

    draw(): void {
        context.save();

        const x = this.x - xMargin;
        const y = this.y - (imageHeight - this.height);

        context.translate(x, y);

        const now = performance.now();
        const image = getFrame(this.animation, now);

        if (this.direction === Direction.Right) {
            // mirror image
            context.translate(image.width / 2, 0);
            context.scale(-1, 1);
            context.translate(-image.width / 2, 0);
        }

        context.drawImage(image, 0, 0, imageWidth, imageHeight);

        context.restore();

        // DRAWING COLLISION AREA FOR DEBUGGING:
        // (must be after context.restore() call)
        // context.strokeStyle = 'red';
        // context.strokeRect(this.x, this.y, this.width, this.height);
    }
}
