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
import { initialize, playTune, SFX_START, SFX_FINISHED } from './sfx/sfx.js';

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

const centerText = (text: string, fontSize: number, fontName: string, alpha = 1) => {
    context.globalAlpha = alpha > 0 ? alpha : 0;
    context.fillStyle = 'white';
    context.font = fontSize + 'px ' + fontName;
    const textWidth = context.measureText(text).width;
    context.fillText(text, (canvas.width - textWidth) / 2, canvas.height / 2);
    context.globalAlpha = 1;
};

const draw = (): void => {
    level.draw();

    if (level.state === State.GAME_OVER) {
        playTune(SFX_FINISHED);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const maxRadius = Math.sqrt(
            Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2),
        );
        let radius = 1;

        const draw = () => {
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.fillStyle = '#802010';
            context.fill();

            radius += 10;

            if (radius <= maxRadius) {
                requestAnimationFrame(draw);
            }
            centerText('GAME OVER', 64, 'Sans-serif', radius / maxRadius);
        };
        draw();

        //TODO: Stop level and wait for button to go to start screen
    }
};

const startLevel = () => {
    window.removeEventListener('keydown', startLevel);
    playTune(SFX_START);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const maxRadius = Math.sqrt(
        Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2),
    );
    let radius = maxRadius;

    window.requestAnimationFrame(gameLoop);

    const draw = () => {
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.fillStyle = '#206010';
        context.fill();

        radius -= 10;
        if (radius > 0) {
            requestAnimationFrame(draw);
        }
        centerText('Ready!', 64, 'Sans-serif', radius / maxRadius);
    };
    draw();
};

export const start = (): void => {
    context.fillStyle = '#206010';
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
    centerText('Press any key to start', 32, 'Sans-serif');

    initializeControls();
    initialize().then(() => {
        window.addEventListener('keydown', startLevel);
    });
};
