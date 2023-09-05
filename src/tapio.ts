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
import { Grid } from './grid';
import { Block, BlockType } from './map';

interface GridPosition {
    xi: number;
    yi: number;
}

const getNewPosition = (
    position: GridPosition,
    direction: Direction,
): GridPosition => {
    switch (direction) {
        case Direction.Left:
            return { xi: position.xi - 1, yi: position.yi };
        case Direction.Right:
            return { xi: position.xi + 1, yi: position.yi };
        case Direction.Up:
            return { xi: position.xi, yi: position.yi - 1 };
        case Direction.Down:
            return { xi: position.xi, yi: position.yi + 1 };
        default:
            return position;
    }
};

export class Tapio {
    position: GridPosition;
    direction: Direction = Direction.Right;
    lastMoveTime: number = 0;

    constructor(xi: number, yi: number) {
        this.position = { xi, yi };
    }

    update(map: Grid<Block>, now: number): void {
        if (now - this.lastMoveTime > 1000) {
            const newPosition: GridPosition = getNewPosition(
                this.position,
                this.direction,
            );

            const block = map.get(newPosition.xi, newPosition.yi);

            if (block?.type === BlockType.Floor) {
                this.position = newPosition;
                const type: BlockType =
                    Math.random() < 0.3 ? BlockType.Tree : BlockType.Grass;
                map.set(newPosition.xi, newPosition.yi, {
                    type,
                    time: performance.now(),
                });
            } else {
                this.direction = Math.floor(Math.random() * 4) as Direction;
            }

            this.lastMoveTime = now;
        }
    }
}
