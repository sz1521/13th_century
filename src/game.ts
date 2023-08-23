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

import { canvas, context, playerImage } from './graphics';
import { Player } from './player';

// These must match the definitions in KeyboardEvent.code
type Key = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';

type Controls = Record<Key, boolean>;

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const SPEED = 0.1;

let lastTime = 0;

const player: Player = new Player();
player.x = 200;
player.y = 200;

const controls: Controls = {
    ['ArrowLeft']: false,
    ['ArrowRight']: false,
    ['ArrowUp']: false,
    ['ArrowDown']: false,
};

const gameLoop = (t: number): void => {
    requestAnimationFrame(gameLoop);

    const dt = Math.min(t - lastTime, MAX_FRAME);
    lastTime = t;

    update(dt);
    draw();
};

const update = (dt: number): void => {
    if (controls.ArrowLeft) {
        player.x -= SPEED * dt;
    } else if (controls.ArrowRight) {
        player.x += SPEED * dt;
    }

    if (controls.ArrowUp) {
        player.y -= SPEED * dt;
    } else if (controls.ArrowDown) {
        player.y += SPEED * dt;
    }
};

const draw = (): void => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(playerImage, player.x, player.y);
};

const onKeyDown = (event: KeyboardEvent): void => {
    if (event.code in controls) {
        controls[event.code as Key] = true;
    }
};

const onKeyUp = (event: KeyboardEvent): void => {
    if (event.code in controls) {
        controls[event.code as Key] = false;
    }
};

export const start = (): void => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.requestAnimationFrame(gameLoop);
};
