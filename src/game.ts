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

import { initializeControls, waitForAnyKey, waitForEnter } from './controls';
import {
    CROSS_IMAGE_HEIGHT,
    CROSS_IMAGE_WIDTH,
    canvas,
    context,
    crossImage,
} from './graphics';
import { Level, State } from './level';

import {
    initialize,
    playTune,
    SFX_START,
    SFX_MAIN,
    SFX_FINISHED,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
} from './sfx/sfx.js';

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const ITEM_FLASHING_TIME_MS = 2000;
const FLASHING_INTERVAL_MS = 400;

const maxRadius = Math.max(screen.width, screen.height) / 1.5;

enum GameState {
    Init,
    Ready,
    Running,
    GameOver,
    GameFinished,
}

let gameState: GameState = GameState.Init;

// For drawing start- and game over screens.
let radius = 0;

let lastTime = 0;
let level: Level = new Level();

const setState = (state: GameState): void => {
    gameState = state;

    switch (state) {
        case GameState.Ready:
            level = new Level();
            radius = maxRadius;
            playTune(SFX_START);
            break;
        case GameState.Running:
            playTune(SFX_MAIN);
            break;
        case GameState.GameOver:
            radius = 1;
            playTune(SFX_FINISHED);
            break;
        case GameState.GameFinished:
            radius = 1;
            break;
        default:
            break;
    }
};

const gameLoop = (t: number): void => {
    requestAnimationFrame(gameLoop);

    const dt = Math.min(t - lastTime, MAX_FRAME);
    lastTime = t;

    update(dt);
    draw();
};

const update = (dt: number): void => {
    switch (gameState) {
        case GameState.Running: {
            level.update(dt);
            if (level.state === State.GAME_OVER) {
                setState(GameState.GameOver);
            } else if (level.state === State.FINISHED) {
                setState(GameState.GameFinished);
            }
            break;
        }
        default:
            break;
    }
};

const centerText = (
    text: string,
    fontSize: number,
    fontName: string,
    alpha = 1,
    yAdjust = 0,
) => {
    context.globalAlpha = alpha > 0 ? alpha : 0;
    context.fillStyle = 'white';
    context.font = fontSize + 'px ' + fontName;
    const textWidth = context.measureText(text).width;
    context.fillText(
        text,
        (canvas.width - textWidth) / 2,
        canvas.height / 2 + yAdjust,
    );
    context.globalAlpha = 1;
};

const flashing = (now: number): boolean => {
    return Math.floor(now / FLASHING_INTERVAL_MS) % 2 === 0;
};

const drawCollectedItems = (): void => {
    const now = performance.now();

    const crossTimeLeft = level.playerHasCross();

    if (crossTimeLeft != null) {
        if (crossTimeLeft > ITEM_FLASHING_TIME_MS || flashing(now)) {
            context.drawImage(
                crossImage,
                10,
                10,
                CROSS_IMAGE_WIDTH / 2,
                CROSS_IMAGE_HEIGHT / 2,
            );
        }
    }
};

const draw = (): void => {
    level.draw();
    drawCollectedItems();

    switch (gameState) {
        case GameState.Ready: {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            if (radius <= 0) {
                setState(GameState.Running);
            } else {
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                context.fillStyle = '#206010';
                context.fill();
                centerText('Ready!', 64, 'Sans-serif', radius / maxRadius);
                radius -= 10;
            }
            break;
        }
        case GameState.GameOver: {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.fillStyle = '#802010';
            context.fill();
            centerText('GAME OVER', 64, 'Sans-serif', radius / maxRadius);

            if (radius >= maxRadius) {
                waitForEnter().then(() => setState(GameState.Ready));
            } else {
                radius += 10;
            }
            break;
        }
        case GameState.GameFinished: {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.fillStyle = '#CCCC40';
            context.fill();

            centerText('GAME FINISHED!', 64, 'Sans-serif', radius / maxRadius);
            centerText(
                'Press enter for a new game',
                32,
                'Sans-serif',
                radius / maxRadius,
                64,
            );

            if (radius >= maxRadius) {
                waitForEnter().then(() => setState(GameState.Ready));
            } else {
                radius += 10;
            }
            break;
        }
        default:
            break;
    }
};

const drawInitialScreen = (text: string): void => {
    context.fillStyle = '#206010';
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
    centerText(text, 32, 'Sans-serif');
};

export const start = async (): Promise<void> => {
    initializeControls();
    drawInitialScreen('Loading...');
    await initialize();

    drawInitialScreen('Press any key to start');
    await waitForAnyKey();

    setState(GameState.Ready);
    window.requestAnimationFrame(gameLoop);
};
