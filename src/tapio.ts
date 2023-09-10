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
import { GridPosition } from './grid';
import { BlockType, GridMap, isBlocking } from './map';
import { Scene } from './scene';
import { randomInt } from './utils';

const findNewPosition = (map: GridMap): GridPosition | undefined => {
    for (let i = 0; i < 10; i++) {
        const forestPos = map.findRandomForest();

        if (forestPos) {
            const left = { xi: forestPos.xi - 1, yi: forestPos.yi };
            const right = { xi: forestPos.xi + 1, yi: forestPos.yi };
            const up = { xi: forestPos.xi, yi: forestPos.yi - 1 };
            const down = { xi: forestPos.xi, yi: forestPos.yi + 1 };

            const expansionBlocks = [left, right, up, down]
                .map((pos) => ({ pos, block: map.get(pos.xi, pos.yi) }))
                .filter((item) => item.block?.type === BlockType.Floor);

            if (expansionBlocks.length > 0) {
                return expansionBlocks[randomInt(expansionBlocks.length)].pos;
            }
        }
    }

    return undefined;
};

export class Tapio {
    lastExpandTime: number = 0;
    lastSpawnTime: number = 0;

    update(scene: Scene, now: number): void {
        const map = scene.map;

        if (now - this.lastExpandTime > 1000) {
            this.expandForest(map);
            this.lastExpandTime = now;
        }

        if (now - this.lastSpawnTime > 5000) {
            this.spawnEnemy(scene);
            this.lastSpawnTime = now;
        }
    }

    private expandForest(map: GridMap): void {
        const newPosition = findNewPosition(map);

        if (!newPosition) {
            return;
        }

        const type: BlockType =
            Math.random() < 0.6 &&
            // Do not place a tree unless there is space around it.
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
    }

    private spawnEnemy(scene: Scene): void {
        const position = scene.map.findRandomGrass();

        if (!position) {
            return;
        }

        const enemy = new Character();
        enemy.isEnemy = true;
        scene.add(enemy, position);
    }
}
