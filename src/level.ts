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

import { getControls } from './controls';
import { context, playerImage } from './graphics';
import { Player } from './player';

const SPEED = 0.1;

export class Level {
    width = 400;
    height = 300;

    private player: Player = new Player();

    constructor() {
        this.player.x = 200;
        this.player.y = 200;
    }

    update(dt: number): void {
        const controls = getControls();

        if (controls.ArrowLeft) {
            this.player.x -= SPEED * dt;
        } else if (controls.ArrowRight) {
            this.player.x += SPEED * dt;
        }

        if (controls.ArrowUp) {
            this.player.y -= SPEED * dt;
        } else if (controls.ArrowDown) {
            this.player.y += SPEED * dt;
        }
    }

    draw(): void {
        context.drawImage(playerImage, this.player.x, this.player.y);
    }
}
