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

import { Camera } from './camera';
import { Controls, getControls } from './controls';
import { easeInOutBack } from './easings';
import {
    TREE_IMAGE_HEIGHT,
    TREE_IMAGE_WIDTH,
    canvas,
    context,
    treeImage,
} from './graphics';
import { BlockType, GridMap, createMap, isBlocking } from './map';
import { Character } from './character';
import { Tapio } from './tapio';
import { GameObject, Movement, getDifference, getDistance } from './gameobject';
import { Scene } from './scene';
import { GridPosition } from './grid';
import { Item } from './item';

const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 100;

const PLAYER_SPEED = 0.3;
const ENEMY_SPEED = 0.1;

const CROSS_EFFECTIVE_TIME_MS = 10000;

export enum State {
    RUNNING,
    GAME_OVER,
    FINISHED,
}

export class Level implements Scene {
    private camera: Camera = new Camera(this, canvas);
    private player: Character = new Character();
    private tapio: Tapio = new Tapio();
    private gameObjects: GameObject[] = [];

    private crossPickTime?: number;

    map: GridMap = createMap();

    x = 0;
    y = 0;
    width = this.map.xCount * BLOCK_WIDTH;
    height = this.map.yCount * BLOCK_HEIGHT;

    state: State = State.RUNNING;

    constructor() {
        this.add(this.player, { xi: 2, yi: 28 });

        this.insertItems();

        this.camera.follow(this.player);
        this.camera.zoom = 0.5;
        this.camera.update();
    }

    private setState(newState: State): void {
        if (newState !== this.state) {
            this.state = newState;
        }
    }

    private insertItems(): void {
        for (let i = 0; i < 8; i++) {
            const cross = new Item();
            const position = this.map.findRandomFloor();
            if (position) {
                this.add(cross, position);
            }
        }
    }

    add(o: GameObject, position: GridPosition): void {
        o.x = position.xi * BLOCK_WIDTH;
        o.y = position.yi * BLOCK_HEIGHT;
        this.gameObjects.push(o);
    }

    // return time left
    playerHasCross(): number | undefined {
        const now = performance.now();

        if (this.crossPickTime == null) {
            return undefined;
        }

        const timeElapsed = now - this.crossPickTime;
        const timeLeft = CROSS_EFFECTIVE_TIME_MS - timeElapsed;

        return timeElapsed < CROSS_EFFECTIVE_TIME_MS ? timeLeft : undefined;
    }

    update(dt: number): void {
        if (this.state === State.GAME_OVER) {
            return;
        }

        const now = performance.now();
        const controls = getControls();

        this.camera.update();

        this.tapio.update(this, now);

        const objectsToRemove: GameObject[] = [];

        for (const o of this.gameObjects) {
            const isPlayer: boolean = o === this.player;
            const movement = isPlayer
                ? this.getPlayerMovement(dt, controls)
                : this.followPlayer(dt, o);

            this.move(o, movement);

            if (isPlayer) {
                if (this.hasReachedExit(o)) {
                    this.setState(State.FINISHED);
                }
            } else {
                if (o instanceof Character) {
                    if (getDistance(getDifference(o, this.player)) < 60) {
                        this.setState(State.GAME_OVER);
                    }
                }

                if (
                    o instanceof Item &&
                    getDistance(getDifference(o, this.player)) < 60
                ) {
                    objectsToRemove.push(o);
                    this.crossPickTime = now;
                }
            }
        }

        if (objectsToRemove.length > 0) {
            for (const removed of objectsToRemove) {
                this.gameObjects = this.gameObjects.filter(
                    (o) => o !== removed,
                );
            }
        }
    }

    private hasReachedExit(o: GameObject): boolean {
        // Is at the very right edge of the map.
        return this.x + this.width - 1.5 * BLOCK_WIDTH < o.x;
    }

    private getPlayerMovement(dt: number, controls: Controls): Movement {
        let dx = 0;
        let dy = 0;

        if (this.state === State.GAME_OVER) {
            return { dx: 0, dy: 0 };
        }

        // Calculate movement according to controls
        if (controls.ArrowLeft && this.x <= this.player.x) {
            dx = -PLAYER_SPEED * dt;
        } else if (
            controls.ArrowRight &&
            this.player.x + this.player.width <= this.x + this.width
        ) {
            dx = PLAYER_SPEED * dt;
        } else if (controls.ArrowUp && this.y <= this.player.y) {
            dy = -PLAYER_SPEED * dt;
        } else if (
            controls.ArrowDown &&
            this.player.y + this.player.height <= this.y + this.height
        ) {
            dy = PLAYER_SPEED * dt;
        }

        return { dx, dy };
    }

    private followPlayer(dt: number, o: GameObject): Movement {
        const diff = getDifference(o, this.player);
        const distance = getDistance(diff);
        let dx = 0;
        let dy = 0;

        if (50 < distance && distance < 400) {
            dx = Math.sign(diff.dx) * ENEMY_SPEED * dt;
            dy = Math.sign(diff.dy) * ENEMY_SPEED * dt;
        }

        if (this.playerHasCross() != null) {
            // Evade player instead.
            dx = -(dx / 3);
            dy = -(dy / 3);
        }

        return { dx, dy };
    }

    private move(o: GameObject, { dx, dy }: Movement): void {
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

        o.move({ dx, dy });
    }

    draw(): void {
        const now = performance.now();
        context.save();

        // Apply camera
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(this.camera.zoom, this.camera.zoom);
        context.translate(-this.camera.x, -this.camera.y);

        // Fill background
        if (this.playerHasCross() != null) {
            context.fillStyle = 'rgb(20, 40, 60)';
        } else {
            context.fillStyle = 'rgb(0, 20, 40)';
        }
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
                        if (this.playerHasCross() != null) {
                            context.fillStyle = 'rgb(40, 70, 70)';
                        } else {
                            context.fillStyle = 'rgb(10, 40, 40)';
                        }
                        context.fillRect(
                            x,
                            y - BLOCK_HEIGHT / 2,
                            BLOCK_WIDTH,
                            BLOCK_HEIGHT,
                        );

                        if (this.playerHasCross() != null) {
                            context.fillStyle = 'rgb(50, 80, 80)';
                        } else {
                            context.fillStyle = 'rgb(20, 50, 50)';
                        }
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
                        if (this.playerHasCross() != null) {
                            context.fillStyle = '#005000';
                        } else {
                            context.fillStyle = '#003000';
                        }
                        context.fillRect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT);

                        const growthProgress =
                            Math.min(1000, now - block.time) / 1000.0;
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
                        if (this.playerHasCross() == null) {
                            context.filter = 'brightness(0.6)';
                        }
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
                        if (this.playerHasCross() != null) {
                            context.fillStyle = '#005000';
                        } else {
                            context.fillStyle = '#003000';
                        }
                        context.fillRect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT);
                        break;
                    }

                    case BlockType.Floor:
                    default:
                        break;
                }
            }

            // Draw game objects that are on the current row, such that
            // they appear correctly behind or in front of the walls.
            const gameObjectsOnRow: GameObject[] = [];

            // Find out game objects that are on the same row.
            for (const o of this.gameObjects) {
                const bottomY = o.y + o.height;
                const rowTopY = gridY * BLOCK_HEIGHT;
                const rowBottomY = gridY * BLOCK_HEIGHT + BLOCK_HEIGHT;

                if (rowTopY <= bottomY && bottomY < rowBottomY) {
                    gameObjectsOnRow.push(o);
                }
            }

            // Sort the game objects so they are drawn in the right order.
            gameObjectsOnRow.sort((a, b) => a.y + a.height - (b.y + b.height));

            for (const o of gameObjectsOnRow) {
                o.draw();
            }
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

        const centerX = this.player.x;
        const centerY = this.player.y;
        const radius =
            Math.max(canvas.width, canvas.height) /
            (this.playerHasCross() ? 1 : 2);
    
        const gradient = context.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            radius,
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent at the center
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)'); // Fully black at the outer edge
    
        context.fillStyle = gradient;
        console.info(this.camera.zoom)
        context.fillRect(0, 0, canvas.width / this.camera.zoom, canvas.height / this.camera.zoom);

        context.restore();
    }
}
