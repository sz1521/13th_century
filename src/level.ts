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

import { Area } from './area';
import { Camera } from './camera';
import { getControls } from './controls';
import { easeInOutBack } from './easings';
import {
    TREE_IMAGE_HEIGHT,
    TREE_IMAGE_WIDTH,
    canvas,
    context,
    treeImage,
} from './graphics';
import { Grid } from './grid';
import { Block, BlockType, createMap, isBlocking } from './map';
import { Player } from './player';
import { Tapio } from './tapio';

const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 100;

const SPEED = 0.3;

export class Level implements Area {
    private map: Grid<Block> = createMap();
    private camera: Camera = new Camera(this, canvas);
    private player: Player = new Player();
    private tapio: Tapio = new Tapio(0, 20);

    x = 0;
    y = 0;
    width = this.map.xCount * BLOCK_WIDTH;
    height = this.map.yCount * BLOCK_HEIGHT;

    constructor() {
        this.player.x = 2 * BLOCK_WIDTH;
        this.player.y = 28 * BLOCK_HEIGHT;

        this.camera.follow(this.player);
        this.camera.zoom = 0.5;
    }

    update(dt: number): void {
        const now = performance.now();

        this.camera.update();

        this.tapio.update(this.map, now);
        this.move(dt, this.player);
    }

    private move(dt: number, o: Player): void {
        const controls = getControls();
        let dx = 0;
        let dy = 0;

        // Calculate movement according to controls

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

        const newX = o.x + dx;
        const newY = o.y + dy;

        // Find the four blocks that the object may be touching
        // (assuming that the object is not bigger than one block)

        const minXIndex: number = Math.floor((newX - this.x) / BLOCK_WIDTH);
        const maxXIndex: number = Math.floor(
            (newX + o.width - this.x) / BLOCK_WIDTH,
        );
        const minYIndex: number = Math.floor((newY - this.y) / BLOCK_HEIGHT);
        const maxYIndex: number = Math.floor(
            (newY + o.height - this.y) / BLOCK_HEIGHT,
        );

        const blockUpLeft = isBlocking(this.map.get(minXIndex, minYIndex));
        const blockDownLeft = isBlocking(this.map.get(minXIndex, maxYIndex));
        const blockUpRight = isBlocking(this.map.get(maxXIndex, minYIndex));
        const blockDownRight = isBlocking(this.map.get(maxXIndex, maxYIndex));

        // Adjust movement if hitting a block

        if (dx < 0 && (blockUpLeft || blockDownLeft)) {
            dx = 0;
        } else if (dx > 0 && (blockUpRight || blockDownRight)) {
            dx = 0;
        }

        if (dy < 0 && (blockUpLeft || blockUpRight)) {
            dy = 0;
        } else if (dy > 0 && (blockDownLeft || blockDownRight)) {
            dy = 0;
        }

        o.move(dx, dy);
    }

    draw(): void {
        const now = performance.now();
        context.save();

        // Apply camera
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(this.camera.zoom, this.camera.zoom);
        context.translate(-this.camera.x, -this.camera.y);

        // Fill background
        context.fillStyle = 'rgb(20, 40, 60)';
        context.fillRect(this.x, this.y, this.width, this.height);

        // Draw blocks
        for (let gridY = 0; gridY < this.map.yCount; gridY++) {
            for (let gridX = 0; gridX < this.map.xCount; gridX++) {
                const block = this.map.get(gridX, gridY);
                if (!block) {
                    continue;
                }

                const x = gridX * BLOCK_WIDTH;
                const y = gridY * BLOCK_HEIGHT;

                switch (block.type) {
                    case BlockType.Wall: {
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
                        break;
                    }

                    case BlockType.Tree: {
                        // Grass:
                        context.fillStyle = '#005000';
                        context.fillRect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT);

                        const growthProgress =
                            Math.min(1000, now - block.time!) / 1000.0;
                        const sizeRatio = Math.max(
                            0,
                            easeInOutBack(growthProgress),
                        );
                        const treeX =
                            x +
                            (BLOCK_WIDTH - TREE_IMAGE_WIDTH * sizeRatio) / 2;
                        const treeY =
                            y - (TREE_IMAGE_HEIGHT * sizeRatio - BLOCK_HEIGHT);

                        context.save();
                        context.translate(treeX, treeY);
                        context.scale(sizeRatio, sizeRatio);
                        context.drawImage(
                            treeImage,
                            0,
                            0,
                            TREE_IMAGE_WIDTH,
                            TREE_IMAGE_HEIGHT,
                        );
                        context.restore();
                        break;
                    }

                    case BlockType.Grass: {
                        context.fillStyle = '#005000';
                        context.fillRect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT);
                        break;
                    }

                    case BlockType.Floor:
                    default:
                        break;
                }
            }

            // Draw characters in the right row, such that they appear
            // correctly behind or in front of the walls.
            const playerBottomY = this.player.y + this.player.height;
            const rowTopY = gridY * BLOCK_HEIGHT;
            const rowBottomY = gridY * BLOCK_HEIGHT + BLOCK_HEIGHT;

            if (rowTopY <= playerBottomY && playerBottomY < rowBottomY) {
                this.player.draw();
            }

            // For debug drawing:
            //
            // context.strokeStyle = 'orange';
            // context.strokeRect(
            //     this.tapio.position.xi * BLOCK_WIDTH,
            //     this.tapio.position.yi * BLOCK_HEIGHT,
            //     BLOCK_WIDTH,
            //     BLOCK_HEIGHT,
            // );
        }

        context.restore();
    }
}
