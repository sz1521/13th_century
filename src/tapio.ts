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

import { Character } from './character';
import { Grid, GridPosition } from './grid';
import { Block, BlockType, isBlocking, isForest } from './map';
import { Scene } from './scene';

const findNewPosition = (map: Grid<Block>): GridPosition | undefined => {
    for (let gridY = 0; gridY < map.yCount; gridY++) {
        for (let gridX = 0; gridX < map.xCount; gridX++) {
            const block = map.get(gridX, gridY);

            if (block?.type === BlockType.Floor) {
                const blockLeft = map.get(gridX - 1, gridY);
                const blockRight = map.get(gridX + 1, gridY);
                const blockUp = map.get(gridX, gridY - 1);
                const blockDown = map.get(gridX, gridY + 1);

                if (
                    isForest(blockLeft) ||
                    isForest(blockRight) ||
                    isForest(blockUp) ||
                    isForest(blockDown)
                ) {
                    return { xi: gridX, yi: gridY };
                }
            }
        }
    }

    return undefined;
};

export class Tapio {
    position: GridPosition;
    lastExpandTime: number = 0;
    lastSpawnTime: number = 0;

    constructor(xi: number, yi: number) {
        this.position = { xi, yi };
    }

    update(scene: Scene, now: number): void {
        const map = scene.map;

        if (now - this.lastExpandTime > 1000) {
            const newPosition = findNewPosition(map) || this.position;

            const type: BlockType =
                Math.random() < 0.6 &&
                map.everyNearby(
                    newPosition.xi,
                    newPosition.yi,
                    (block) =>
                        !(isBlocking(block) || block?.type === BlockType.Tree),
                )
                    ? BlockType.Tree
                    : BlockType.Grass;

            map.set(newPosition.xi, newPosition.yi, {
                type,
                time: performance.now(),
            });

            this.lastExpandTime = now;
        }

        if (now - this.lastSpawnTime > 5000) {
            const spot = map.findRandomGrass();
            if (spot) {
                const enemy = new Character();
                enemy.isEnemy = true;
                scene.add(enemy, spot);
            }

            this.lastSpawnTime = now;
        }
    }
}
