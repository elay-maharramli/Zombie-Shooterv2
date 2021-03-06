const PLAYER_WIDTH = 147;
const PLAYER_HEIGHT = 186;

const ZOMBIE_WIDTH = 123;
const ZOMBIE_HEIGHT = 198;

const SCREEN_WIDTH = 1066;
const SCREEN_HEIGHT = 600;

const KEY_A = 65;
const KEY_D  = 68;

const KEY_LEFT = 37;
const KEY_RIGHT  = 39;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

canvas.addEventListener("click", function () {
    game.bullets.push(new Bullet(
        game.player.x + PLAYER_WIDTH + 2,
        game.player.y + PLAYER_HEIGHT / 2 - 60,
        12,
        ctx
    ));
    if (game.over === false)
    {
        Helper.playSound(game.shotSound);
    }
})

class Helper
{
    static getRandomInt(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    static _timestamp()
    {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }

    /*
    Delete an element from an array without
    having to create a new array in the process
    to keep garbage collection at a minimum
    */
    static removeIndex(array, index)
    {
        if (index >= array.length || array.length <= 0)
        {
            return;
        }

        array[index] = array[array.length - 1];
        array[array.length - 1] = undefined;
        array.length = array.length - 1;
    }

    static playSound(sound)
    {
        sound.pause();
        sound.currentTime = 0;
        sound.play().then(() => {}).catch(() => {})
    }
}
class Rain {
    constructor(x, y, dy, context) {
        this.x = x;
        this.y = y;
        this.w = 2;
        this.h = 15;
        this.dy = dy;
        this.ctx = context;
    }

    update()
    {
        this.y += this.dy;
    }

    draw()
    {
        this.ctx.fillStyle = "rgb(150,150,150)";
        this.ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}
class Zombie
{
    constructor(x, y, dx, img, context) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.w = ZOMBIE_WIDTH;
        this.h = ZOMBIE_HEIGHT;
        this.ctx = context;
        this.img = img;
    }

    update()
    {
    }

    draw()
    {
        this.ctx.drawImage(
            this.img,
            this.x, this.y,
            this.w, this.h
        )
    }
}

class Bullet
{
    constructor(x, y, dx, context) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.w = 20;
        this.h = 4;
        this.ctx = context;
    }

    update()
    {
    }

    draw()
    {
        this.ctx.fillRect(this.x, this.y, this.w, this.h);
        this.ctx.fillStyle = 'rgb(255,255,0)';
    }
}

class Player
{
    constructor(x, y, dx, context) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.w = PLAYER_WIDTH;
        this.h = PLAYER_HEIGHT;
        this.ctx = context;
        this.img = new Image();
        this.img.src = "img/player.png";
    }

    update()
    {
    }

    draw()
    {
        this.ctx.drawImage(
            this.img,
            this.x, this.y,
            this.w, this.h
        )
    }
}

class Game
{
    constructor(context) {
        this.ctx = context;
        this.fps = 60;
        this.step = 1 / this.fps;
        this.now = 0;
        this.lastTime = Helper._timestamp();
        this.deltaTime = 0;
        this.shotSound = new Audio()
        this.shotSound.src = 'sound/shot.mp3';
        this.player = new Player(50,SCREEN_HEIGHT - PLAYER_HEIGHT, 5, this.ctx);
        this.bullet = new Bullet(2000, this.player.y + PLAYER_HEIGHT / 2 - 60, 12, this.ctx);
        this.rain = new Rain(Math.floor(Math.random() * 800), 16, 5, this.ctx);
        this.zombieImg = new Image();
        this.zombieImg.src = "img/zombie.png";
        this.bullets = [];
        this.rains = [];
        this.zombies = [];
        this.zombieTimer = 1;
        this.zombieSpawnInterval = 35;
        this.zombieSpawnIntervalLimit = 15;
        this.rainTimer = 0;
        this.rainSpawnInterval = 1;
        this.speedLimitA = 3;
        this.speedLimitB = 5;
        this.score = 0;
        this.lifes = 3;
        this.keyStates = {};
        this.over = false
        this.keyboardListen();
        this.loop();
    }

    loop()
    {
        this.now = Helper._timestamp();
        this.deltaTime = this.deltaTime + Math.min(1, (this.now - this.lastTime) / 1000);

        while (this.deltaTime > this.step)
        {
            this.deltaTime = this.deltaTime - this.step;
            this.update(this.step);
        }

        this.draw(this.deltaTime);
        this.lastTime = this.now;

        if (this.lifes === 0)
        {
            this.ctx.font = "70px Lucida Sans Typewriter";
            this.ctx.fillStyle = "red";
            this.ctx.fillText("Game Over!", 360, 325);
            this.over = true;
            return;
        }
        requestAnimationFrame(() => this.loop());
    }

    update()
    {
        this.player.update();
        this.bullet.update();
        this.handleInput();

        if (this.zombieTimer % this.zombieSpawnInterval === 0)
        {
            this.zombies.push(new Zombie(
                SCREEN_WIDTH - PLAYER_WIDTH + 140,
                SCREEN_HEIGHT - PLAYER_HEIGHT - 10,
                Helper.getRandomInt(this.speedLimitA,this.speedLimitB),
                this.zombieImg,
                this.ctx
            ));
            this.zombieTimer = 0;
        }
        this.zombieTimer++;

        if (this.player.x <= -5)
        {
            this.player.x += this.player.dx;
        }
        if (this.player.x >= SCREEN_WIDTH + 2 - PLAYER_WIDTH)
        {
            this.player.x -= this.player.dx;
        }


        this.bullets.forEach((bullet, index) => {
            bullet.x += bullet.dx;

            if (bullet.x > SCREEN_WIDTH)
            {
                Helper.removeIndex(this.bullets, index);
            }
        })
        this.rain.update();

        if (this.rainTimer % this.rainSpawnInterval === 0)
        {
            this.rains.push(new Rain(
                Math.floor(Math.random() * SCREEN_WIDTH),
                -20,
                Helper.getRandomInt(8, 10),
                this.ctx
            ));

            this.rainTimer = 0;
        }

        this.rainTimer++;

        this.rains.forEach((rain, index) => {
            ctx.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);

            if (rain.y > SCREEN_HEIGHT)
            {
                Helper.removeIndex(this.rains, index);
            }
            rain.update();
        });
        this.zombies.forEach((zombie, index) => {
            zombie.x -= zombie.dx;
            if (zombie.x < -ZOMBIE_WIDTH)
            {
                Helper.removeIndex(this.zombies, index);
            }
            for (let b in this.bullets)
            {
                if (zombie.x >= this.bullets[b].x &&
                    zombie.x <= this.bullets[b].x + this.bullets[b].w
                )
                {
                    Helper.removeIndex(this.zombies, index);
                    this.bullets[b].x = 2000;
                    this._scoreUpdate(1)
                    if (this.score % 20 === 0)
                    {
                        if (this.zombieSpawnInterval > this.zombieSpawnIntervalLimit)
                        {
                            this.zombieSpawnInterval -= 1;
                            this.speedLimitA += 1;
                            this.speedLimitB += 1;
                        }
                    }
                }
            }
            const zombieCenterX = zombie.x + zombie.w / 2;
            const zombieCenterY = zombie.y + zombie.h / 2;
            if (
                zombieCenterX >= this.player.x &&
                zombieCenterX <= this.player.x + this.player.w &&
                zombieCenterY >= this.player.y &&
                zombieCenterY <= this.player.y + this.player.h
            )
            {
                this._lifeUpdate(1);
                Helper.removeIndex(this.zombies, index);
            }
            zombie.update();
        })
    }

    draw()
    {
        this.ctx.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
        for (let i in this.rains)
        {
            if (this.rains.hasOwnProperty(i))
            {
                this.rains[i].draw();
            }
        }
        //this.rain.draw();
        this.player.draw();
        this.bullet.draw();

        for (let b in this.bullets)
        {
            if (this.bullets.hasOwnProperty(b))
            {
                this.bullets[b].draw();
            }
        }
        for (let z in this.zombies)
        {
            if (this.zombies.hasOwnProperty(z))
            {
                this.zombies[z].draw();
            }
        }
    }

    keyboardListen()
    {
        document.addEventListener('keydown', (e) =>
        {
            this.setKeyState(true, e);
        });
        document.addEventListener('keyup', (e) =>
        {
            this.setKeyState(false, e);
        });
    }

    setKeyState(keydown, e)
    {
        this.keyStates[e.keyCode] = keydown;
    }

    handleInput()
    {
        if (this.keyStates[KEY_D] || this.keyStates[KEY_RIGHT])
        {
            this.player.x += this.player.dx;
        }

        if (this.keyStates[KEY_A] || this.keyStates[KEY_LEFT])
        {
            this.player.x -= this.player.dx;
        }

    }

    _scoreUpdate(score)
    {
        this.score += score;
        document.getElementById("game-score").innerText = '' + this.score
    }

    _lifeUpdate(life)
    {
        this.lifes -= life
        document.getElementById("player-life").innerText = '' + this.lifes
    }

}

game = new Game(ctx);
game.update();
game.draw();
