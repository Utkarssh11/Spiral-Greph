const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const length_input = document.getElementById("length");
const speed_input = document.getElementById("speed");
const speed_label = document.getElementById("speed_label");
const clear = document.getElementById("clear");
let running = true;

function resize() {
    canvas1.width = window.innerWidth;
    canvas1.height = window.innerHeight;
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

function degrees_to_radians(degrees) {
    let pi = Math.PI;
    return degrees * (pi / 180);
}

let SEGMENTS = [];

class Segment {
    constructor(aPos, bPos, length = 50, angle = 0) {
        this.aPos = { 'x': 0, 'y': 0 };
        this.bPos = { 'x': length, 'y': 0 };
        this.length = length;
        this.angle = angle;
        if (aPos != null) {
            if (bPos != null) {
                this.aPos.x = aPos[0];
                this.aPos.y = aPos[1];
                this.bPos.x = bPos[0];
                this.bPos.y = bPos[1];
                let dx = this.aPos.x - this.bPos.x;
                let dy = this.aPos.y - this.bPos.y;
                this.length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                this.angle = Math.atan2(dy, dx);
            } else {
                this.aPos.x = aPos[0];
                this.aPos.y = aPos[1];
                this.calcBPos();
            }
        } else if (bPos != null) {
            this.bPos.x = bPos[0];
            this.bPos.y = bPos[1];
            this.calcAPos();
        }
        SEGMENTS.push(this);
    }


    static draw_all() {
        SEGMENTS.forEach((val, idx, arr) => {
            val.draw(ctx1);
        });
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'blue';
        ctx.moveTo(this.aPos.x, this.aPos.y);
        ctx.lineTo(this.bPos.x, this.bPos.y);
        ctx.stroke();
        ctx.closePath();
    }

    calcAPos() {
        this.aPos.x = Math.cos(degrees_to_radians(this.angle)) * this.length * -1 + this.bPos.x;
        this.aPos.y = Math.sin(degrees_to_radians(this.angle)) * this.length * -1 + this.bPos.y;
    }

    calcBPos() {
        this.bPos.x = Math.cos(degrees_to_radians(this.angle)) * this.length + this.aPos.x;
        this.bPos.y = Math.sin(degrees_to_radians(this.angle)) * this.length + this.aPos.y;
    }
}

function fRound(x, d = 0) {
    return Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
}

let min_size = Math.min(canvas1.width, canvas1.height);
let seg1 = new Segment([canvas1.width / 2, canvas1.height / 2], null, min_size / 5);
let seg2 = new Segment(null, null, length_input.value);

length_input.oninput = () => {
    seg2.length = length_input.value;
    document.getElementById("length_label").innerHTML = "Length: " + length_input.value;
}

speed_input.oninput = () => {
    speed_label.innerHTML = "Speed: " + speed_input.value;
}

clear.onclick = () => {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    seg1.angle = 0;
    seg1.calcBPos();
    seg2.angle = 0;
    seg2.calcBPos();
    lastPoint.x = seg2.bPos.x;
    lastPoint.y = seg2.bPos.y;
}

let lastPoint;
let color = 'black';
let count = 0;

function mainloop() {
    seg1.angle = (seg1.angle + 1) % 360.0; // star: 1
    seg1.calcBPos();
    seg2.angle = fRound((seg2.angle - parseFloat(speed_input.value)) % 360.0, 1); // star: 1.5
    seg2.aPos = seg1.bPos;
    seg2.calcBPos();
    
    if ((-0.01 <= seg1.angle && seg1.angle <= 0.01) && (-0.01 <= seg2.angle && seg2.angle <= 0.01)) {
        running = false;
        if (color == 'black') {
            color = 'white';
        } else {
            color = 'black';
        }
    }

    ctx1.beginPath();
    ctx1.fillStyle = 'gray';
    ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    ctx1.closePath();

    ctx1.drawImage(canvas2, 0, 0, canvas2.width, canvas2.height, 0, 0, canvas1.width, canvas1.height);

    Segment.draw_all();

    if (lastPoint != null) {
        ctx2.beginPath();
        ctx2.globalAlpha = 1.0;
        ctx2.lineWidth = 3;
        ctx2.strokeStyle = color;
        ctx2.moveTo(seg2.bPos.x, seg2.bPos.y);
        ctx2.lineTo(lastPoint.x, lastPoint.y);
        ctx2.stroke();
        ctx2.closePath();
    } else {
        lastPoint = { 'x': 0, 'y': 0 };
    }
    lastPoint.x = seg2.bPos.x;
    lastPoint.y = seg2.bPos.y;

    ctx2.beginPath();
    ctx2.lineWidth = 1;
    ctx2.strokeStyle = color;
    ctx2.fillStyle = color;
    ctx2.arc(seg2.bPos.x, seg2.bPos.y, 1, 0, 2 * Math.PI);
    ctx2.fill();
    ctx2.closePath();

    running && requestAnimationFrame(mainloop);
}

mainloop();

canvas1.addEventListener("mousedown", () => {
    if (!running) {
        running = true;
        seg1.angle = 0;
        seg1.calcBPos();
        seg2.angle = 0;
        seg2.calcBPos();
        lastPoint.x = seg2.bPos.x;
        lastPoint.y = seg2.bPos.y;
        mainloop();
    } else {
        running = true;
    }
});
