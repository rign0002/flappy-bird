// select canvas
const canvas = document.querySelector('#mycanvas')
const ctx = canvas.getContext('2d')

// game variables and consts
let frames = 0
const DEGREE = Math.PI / 180

// load flappyimg img
const flappyimg = new Image()
flappyimg.src = 'https://rign0002.github.io/flappy-bird/img/flappyimg.png'

// load sounds

const scoreSound = new Audio()
scoreSound.src = 'https://rign0002.github.io/flappy-bird/audio/sfx_point.wav'

const flap = new Audio()
flap.src = 'https://rign0002.github.io/flappy-bird/audio/sfx_flap.wav'

const hit = new Audio()
hit.src = 'https://rign0002.github.io/flappy-bird/audio/sfx_hit.wav'

const swoosh = new Audio()
swoosh.src = 'https://rign0002.github.io/flappy-bird/audio/sfx_swooshing.wav'

const die = new Audio()
die.src = 'https://rign0002.github.io/flappy-bird/audio/sfx_die.wav'
// game state
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}

// start button

const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

// control the game
const changeGameState = ev => {
    switch (state.current) {
        case state.getReady:
            state.current = state.game
            swoosh.play()
            break
        case state.game:
            bird.flap()
            flap.play()
            break
        case state.over:
            let rect = canvas.getBoundingClientRect()
            let clickX = ev.clientX - rect.left
            let clickY = ev.clientY - rect.top
            
            // check if we click the start button
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset()
                score.reset()
                bird.speedReset()
                state.current = state.getReady
            }
            break
    }
}

canvas.addEventListener('click', changeGameState)
document.addEventListener('keydown', changeGameState)
// background
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: canvas.height - 226,
    draw() {
        ctx.drawImage(flappyimg, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(flappyimg, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }

}

// foreground
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: canvas.height - 112,
    dx: 2,
    draw() {
        ctx.drawImage(flappyimg, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(flappyimg, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },
    update() {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2)
        }
    }
}

// bird
const bird = {
    animation: [
        {
            sX: 276,
            sY: 112
        },
        {
            sX: 276,
            sY: 139
        },
        {
            sX: 276,
            sY: 164
        },
        {
            sX: 276,
            sY: 139
        },
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    frame: 0,
    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,
    radius: 12,
    draw() {
        let bird = this.animation[this.frame]

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        ctx.drawImage(flappyimg, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h)

        ctx.restore()
    },
    flap() {
        this.speed = -this.jump
    },
    update() {
        // if the game state is get ready sate, the bird must flap slowly
        this.period = state.current == state.getReady ? 10 : 5
        // increment the frame by 1, each period
        this.frame += frames % this.period == 0 ? 1 : 0
        // frame goes from 0 to 4, then back to 0
        this.frame = this.frame % this.animation.length

        if (state.current == state.getReady) {
            this.y = 150 // reset position after game over
            this.rotation = 0 * DEGREE
        } else {
            this.speed += this.gravity
            this.y += this.speed

            if (this.y + this.h / 2 >= canvas.height - fg.h) {
                this.y = canvas.height - fg.h - this.h / 2
                if (state.current == state.game) {
                    state.current = state.over
                    die.play()
                }
            }

            // if the speed is greater than the jump, it means the bird is falling down
            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE
                this.frame = 1
            } else {
                this.rotation = -25 * DEGREE
            }
        }
    },
    speedReset(){
        this.speed = 0
    }
}

// pipes
const pipes = {
    position: [],
    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 502,
        sY: 0
    },
    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,
    draw() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i]

            let topYPos = p.y
            let bottomYPos = p.y + this.h + this.gap

            //top pipe
            ctx.drawImage(flappyimg, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h)

            //bottom pipe
            ctx.drawImage(flappyimg, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h)
        }
    },
    update() {
        if (state.current !== state.game) return

        if (frames % 100 == 0) {
            this.position.push({
                x: canvas.width,
                y: this.maxYPos * (Math.random() + 1)
            })
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i]

            let bottomPipeYPos = p.y + this.h + this.gap

            // collision detection
            // top pipe
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over
                hit.play()
            }

            // bottom pipe
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                state.current = state.over
                hit.play()
            }

            // move the pipes to the left
            p.x -= this.dx

            // if pipes go beyond canvas, delete from array
            if (p.x + this.w <= 10) {
                this.position.shift()
                score.value += 1
                scoreSound.play()
                score.best = Math.max(score.value, score.best)
                localStorage.setItem('best', score.best)
            }
        }
    },
    reset(){
        this.position = []
    }
}

// score
const score = {
    best: parseInt(localStorage.getItem('best')) || 0,
    value: 0,
    draw(){
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        
        if(state.current === state.game){
            ctx.lineWidth = 2
            ctx.font = '35px Teko'
            ctx.fillText(this.value, canvas.width/2, 50)
            ctx.strokeText(this.value, canvas.width/2, 50)
        } else if (state.current === state.over){
            // score value
            ctx.font = '25px Teko'
            ctx.fillText(this.value, 225, 186)
            ctx.strokeText(this.value, 225, 186)
            // best score
            ctx.fillText(this.best, 225, 228)
            ctx.strokeText(this.best, 225, 228)
            
        }
    },
    reset(){
        this.value = 0
    }
}

// get ready message
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: canvas.width / 2 - 173 / 2,
    y: 80,
    draw() {
        if (state.current === state.getReady) {
            ctx.drawImage(flappyimg, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}

// game over message 
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: canvas.width / 2 - 225 / 2,
    y: 90,
    draw() {
        if (state.current === state.over) {
            ctx.drawImage(flappyimg, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}

// draw
const draw = () => {
    ctx.fillStyle = '#70c5ce'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    bg.draw()
    pipes.draw()
    fg.draw()
    bird.draw()
    getReady.draw()
    gameOver.draw()
    score.draw()
}


// update
const update = () => {
    bird.update()
    fg.update()
    pipes.update()
}


// loop
const loop = () => {
    update()
    draw()

    frames++

    requestAnimationFrame(loop)
}

loop()
