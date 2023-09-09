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

import { Grid } from './grid';

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
    blocks: Grid<Block>,
    xBegin: number,
    xEnd: number,
    yBegin: number,
    yEnd: number,
): void => {
    for (let gridY = yBegin; gridY < yEnd; gridY++) {
        for (let gridX = xBegin; gridX < xEnd; gridX++) {
            blocks.set(gridX, gridY, { type: BlockType.Floor });
        }
    }
};

export const createMap = (): Grid<Block> => {
    const blocks = new Grid<Block>(BLOCK_X_COUNT, BLOCK_Y_COUNT, {
        type: BlockType.Wall,
    });

    carveRectange(blocks, 1, 6, 20, 29); // bottom-left room (start)
    carveRectange(blocks, 3, 4, 19, 20); // doorway
    carveRectange(blocks, 1, 9, 12, 19);
    carveRectange(blocks, 2, 3, 11, 12); // doorway
    carveRectange(blocks, 1, 9, 1, 11); // top-left room
    carveRectange(blocks, 9, 10, 4, 8); // doorway
    carveRectange(blocks, 10, 29, 1, 11); // top-right room
    carveRectange(blocks, 19, 21, 11, 14); // hallway
    carveRectange(blocks, 15, 28, 14, 28); // bottom-right room

    return blocks;
};
