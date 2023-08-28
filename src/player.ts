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
import {
    context,
    playerNorthStandImage,
    playerSouthStandImage,
    playerWestStandImage,
} from './graphics';

const imageWidth = playerSouthStandImage.width;
const imageHeight = playerSouthStandImage.height;

export class Player implements GameObject {
    x: number = 0;
    y: number = 0;
    direction: Direction = Direction.Down;

    get width() {
        return imageWidth;
    }
    get height() {
        // For pseudo-3D -effect.
        return imageHeight / 2;
    }

    draw(): void {
        context.save();

        const x = this.x;
        const y = this.y - this.height; // For pseudo-3D -effect.

        context.translate(x, y);

        let image: CanvasImageSource;

        if (this.direction === Direction.Left) {
            image = playerWestStandImage;
        } else if (this.direction === Direction.Right) {
            image = playerWestStandImage;

            // mirror image
            context.translate(image.width / 2, 0);
            context.scale(-1, 1);
            context.translate(-image.width / 2, 0);
        } else if (this.direction === Direction.Up) {
            image = playerNorthStandImage;
        } else {
            image = playerSouthStandImage;
        }

        context.drawImage(image, 0, 0);

        context.restore();
    }
}
