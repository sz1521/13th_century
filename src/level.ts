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

import { Area, Direction } from './area';
import { Camera } from './camera';
import { getControls } from './controls';
import { GameObject } from './gameobject';
import { canvas, context } from './graphics';
import { Grid } from './grid';
import { Player } from './player';

const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 100;

const BLOCK_X_COUNT = 10;
const BLOCK_Y_COUNT = 10;

const SPEED = 0.1;

export class Level implements Area {
    x = 0;
    y = 0;
    width = BLOCK_X_COUNT * BLOCK_WIDTH;
    height = BLOCK_Y_COUNT * BLOCK_HEIGHT;

    private blocks: Grid<boolean> = new Grid<boolean>(
        BLOCK_X_COUNT,
        BLOCK_Y_COUNT,
    );
    private camera: Camera = new Camera(this, canvas);
    private player: Player = new Player();

    constructor() {
        this.player.x = 200;
        this.player.y = 200;

        this.blocks.set(0, 0, true);

        this.blocks.set(3, 2, true);
        this.blocks.set(4, 2, true);

        this.blocks.set(2, 4, true);
        this.blocks.set(3, 4, true);

        this.blocks.set(6, 3, true);
        this.blocks.set(6, 4, true);

        this.blocks.set(6, 0, true);
        this.blocks.set(7, 0, true);
        this.blocks.set(6, 1, true);
        this.blocks.set(7, 1, true);

        this.camera.follow(this.player);
        this.camera.zoom = 0.5;
    }

    update(dt: number): void {
        this.camera.update();

        this.move(dt, this.player);
    }

    private move(dt: number, o: GameObject): void {
        const controls = getControls();
        let dx = 0;
        let dy = 0;

        if (controls.ArrowLeft && this.x <= o.x) {
            dx = -SPEED * dt;
        } else if (
            controls.ArrowRight &&
            o.x + o.width <= this.x + this.width
        ) {
            dx = SPEED * dt;
        } else if (controls.ArrowUp && this.y <= o.y) {
            dy = -SPEED * dt;
        } else if (
            controls.ArrowDown &&
            o.y + o.height <= this.y + this.height
        ) {
            dy = SPEED * dt;
        }

        if (dx !== 0) {
            this.player.x += dx;
            this.player.direction = dx < 0 ? Direction.Left : Direction.Right;
        }
        if (dy !== 0) {
            this.player.y += dy;
            this.player.direction = dy < 0 ? Direction.Up : Direction.Down;
        }
    }

    draw(): void {
        context.save();

        // Apply camera
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(this.camera.zoom, this.camera.zoom);
        context.translate(-this.camera.x, -this.camera.y);

        // Fill background
        context.fillStyle = 'rgb(20, 40, 60)';
        context.fillRect(this.x, this.y, this.width, this.height);

        // Draw blocks
        for (let gridY = 0; gridY < this.blocks.yCount; gridY++) {
            for (let gridX = 0; gridX < this.blocks.xCount; gridX++) {
                const block = this.blocks.get(gridX, gridY);
                if (block) {
                    const x = gridX * BLOCK_WIDTH;
                    const y = gridY * BLOCK_HEIGHT;

                    context.fillStyle = 'rgb(30, 60, 60)';
                    context.fillRect(
                        x,
                        y - BLOCK_HEIGHT / 2,
                        BLOCK_WIDTH,
                        BLOCK_HEIGHT,
                    );

                    context.fillStyle = 'rgb(50, 100, 100)';
                    context.fillRect(
                        x,
                        y + BLOCK_HEIGHT / 2,
                        BLOCK_WIDTH,
                        BLOCK_HEIGHT / 2,
                    );
                }
            }

            // Draw characters in the right row, such that they appear
            // correctly behind or in front of the walls.
            const playerBottomY = this.player.y + this.player.height;
            const rowTopY = gridY * BLOCK_HEIGHT + BLOCK_HEIGHT / 2;
            const rowBottomY =
                gridY * BLOCK_HEIGHT + BLOCK_HEIGHT + BLOCK_HEIGHT / 2;

            if (rowTopY <= playerBottomY && playerBottomY < rowBottomY) {
                this.player.draw();
            }
        }

        context.restore();
    }
}
