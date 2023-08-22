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

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

let lastTime = 0;

let x = 0;

const gameLoop = (t: number): void => {
    requestAnimationFrame(gameLoop);

    const dt = Math.min(t - lastTime, MAX_FRAME);
    lastTime = t;

    update(dt);
    draw();
};

const update = (dt: number): void => {
    x += 0.01 * dt;
    if (x > canvas.width) {
        x = 0;
    }
};

const draw = (): void => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(playerImage, x, 30);
};

export const start = (): void => {
    requestAnimationFrame(gameLoop);
};
