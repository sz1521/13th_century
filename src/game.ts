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

import { initializeControls } from './controls';
import { canvas, context } from './graphics';
import { Level, State } from './level';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { initialize, playTune, SFX_MAIN } from './sfx/sfx.js';

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

let lastTime = 0;

const level: Level = new Level();

const gameLoop = (t: number): void => {
    requestAnimationFrame(gameLoop);

    const dt = Math.min(t - lastTime, MAX_FRAME);
    lastTime = t;

    update(dt);
    draw();
};

const update = (dt: number): void => {
    level.update(dt);
};

const draw = (): void => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    level.draw();

    if (level.state === State.GAME_OVER) {
        context.font = '22px Sans-serif';
        context.fillStyle = 'white';
        context.fillText('GAME OVER', canvas.width * 0.45, canvas.height / 2);
    }
};

const playSong = () => {
    window.removeEventListener('keydown', playSong);
    playTune(SFX_MAIN);
};

export const start = (): void => {
    initializeControls();
    initialize().then(() => {
        window.addEventListener('keydown', playSong);
    });

    window.requestAnimationFrame(gameLoop);
};
