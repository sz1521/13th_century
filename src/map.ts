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

import { Grid, GridPosition } from './grid';

const BLOCK_X_COUNT = 30;
const BLOCK_Y_COUNT = 30;

export enum BlockType {
    Floor,
    Grass,
    Tree,
    Wall,
}

export type Block =
    | {
          type: BlockType.Floor | BlockType.Grass | BlockType.Wall;
      }
    | {
          type: BlockType.Tree;
          time: number;
      };

export const isBlocking = (block: Block | undefined): boolean => {
    return !!block && block.type === BlockType.Wall;
};

export const isForest = (block: Block | undefined): boolean => {
    return (
        !!block &&
        (block.type === BlockType.Grass || block.type === BlockType.Tree)
    );
};

const carveRectange = (
    map: GridMap,
    xBegin: number,
    xEnd: number,
    yBegin: number,
    yEnd: number,
): void => {
    for (let gridY = yBegin; gridY < yEnd; gridY++) {
        for (let gridX = xBegin; gridX < xEnd; gridX++) {
            map.set(gridX, gridY, { type: BlockType.Floor });
        }
    }
};

export class GridMap extends Grid<Block> {
    grassCount = 0;

    constructor() {
        super(BLOCK_X_COUNT, BLOCK_Y_COUNT, { type: BlockType.Wall });
    }

    override set(xIndex: number, yIndex: number, value: Block): void {
        const oldType = this.get(xIndex, yIndex)?.type;

        super.set(xIndex, yIndex, value);

        if (oldType !== BlockType.Grass && value.type === BlockType.Grass) {
            this.grassCount++;
        } else if (
            oldType === BlockType.Grass &&
            value.type !== BlockType.Grass
        ) {
            this.grassCount--;
        }
    }

    findRandomGrass(): GridPosition | undefined {
        const targetIndex: number = Math.floor(Math.random() * this.grassCount);
        let currentIndex: number = 0;

        for (let gridY = 0; gridY < this.yCount; gridY++) {
            for (let gridX = 0; gridX < this.xCount; gridX++) {
                const block = this.get(gridX, gridY);

                if (block?.type === BlockType.Grass) {
                    if (currentIndex === targetIndex) {
                        return { xi: gridX, yi: gridY };
                    }

                    currentIndex++;
                }
            }
        }

        return undefined;
    }
}

export const createMap = (): GridMap => {
    const map = new GridMap();

    carveRectange(map, 1, 6, 20, 29); // bottom-left room (start)
    carveRectange(map, 3, 4, 19, 20); // doorway
    carveRectange(map, 1, 9, 12, 19);
    carveRectange(map, 2, 3, 11, 12); // doorway
    carveRectange(map, 1, 9, 1, 11); // top-left room
    carveRectange(map, 9, 10, 4, 8); // doorway
    carveRectange(map, 10, 29, 1, 11); // top-right room
    carveRectange(map, 19, 21, 11, 14); // hallway
    carveRectange(map, 15, 28, 14, 28); // bottom-right room

    return map;
};
