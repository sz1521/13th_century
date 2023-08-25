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
import { GameObject } from './gameobject';
import { canvas, context, playerImage } from './graphics';
import { Player } from './player';

const SPEED = 0.1;

export class Level implements Area {
    x = 0;
    y = 0;
    width = 400;
    height = 300;

    private camera: Camera = new Camera(this, canvas);
    private player: Player = new Player(playerImage);

    constructor() {
        this.player.x = 200;
        this.player.y = 200;

        this.camera.follow(this.player);
    }

    update(dt: number): void {
        this.camera.update();

        this.move(dt, this.player);
    }

    private move(dt: number, o: GameObject): void {
        const controls = getControls();

        if (controls.ArrowLeft && this.x <= o.x) {
            o.x -= SPEED * dt;
        } else if (
            controls.ArrowRight &&
            o.x + o.width <= this.x + this.width
        ) {
            o.x += SPEED * dt;
        }

        if (controls.ArrowUp && this.y <= o.y) {
            o.y -= SPEED * dt;
        } else if (
            controls.ArrowDown &&
            o.y + o.height <= this.y + this.height
        ) {
            o.y += SPEED * dt;
        }
    }

    draw(): void {
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(this.camera.zoom, this.camera.zoom);
        context.translate(-this.camera.x, -this.camera.y);

        this.player.draw();

        context.restore();
    }
}
