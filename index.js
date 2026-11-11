let mouseX = 0;
let mouseY = 0;

const keys = {
    Space: false,
    ShiftLeft: false,
    ShiftRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false
};

window.onload = () => {
    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });


    // 2. Update state on keydown and keyup
    window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
    });

    window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
    });

    const world = document.querySelector('.world');
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            for (let z = 0; z < 8; z++) {
                placeBlock(world, x,y,z);
            }
        }
    }
    
    
    requestAnimationFrame(frame);
}


let delta = 0;
let lastTime = Date.now();


let cam = new Vec3(0,0,0);

const walkSpeed = 5;
const flySpeed = 5;

function frame() {
    delta = (Date.now() - lastTime) / 1000.0;
    lastTime = Date.now();

    const scene = document.querySelector('.scene');
    const rect = scene.getBoundingClientRect();

    let angleX = - (mouseY/rect.height - 0.5)*2 * 90;
    let angleY = (mouseX/rect.width - 0.5)*2 * 90;


    if (keys.Space) {
        cam.y += flySpeed*delta;
    }
    if (keys.ShiftLeft || keys.ShiftRight) {
        cam.y -= flySpeed*delta;
    }
    if (keys.KeyW) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI;

        cam.z += walkSpeed*delta*Math.cos(angleY);
        cam.x += walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyS) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI;

        cam.z -= walkSpeed*delta*Math.cos(angleY);
        cam.x -= walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyA) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI - 0.5*Math.PI;

        cam.z += walkSpeed*delta*Math.cos(angleY);
        cam.x += walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyD) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI - 0.5*Math.PI;

        cam.z -= walkSpeed*delta*Math.cos(angleY);
        cam.x -= walkSpeed*delta*-Math.sin(angleY);
    }


    document.querySelector('.world').style.transform = `translateZ(50vw) rotateX(${angleX}deg) rotateY(${angleY}deg)  translateX(${cam.x*100}px) translateY(${cam.y*100}px) translateZ(${cam.z*100}px)`;
    
    //center origin
    document.querySelector('.world').style.transform += `translateX(${rect.width*0.5-50}px) translateY(${rect.height*0.5-50}px)`;

    requestAnimationFrame(frame);
}



function placeBlock(world, x, y, z) {
    const block = document.createElement('div');
    block.className = `cube b${x}_${y}_${z}`;
    block.style.transform = `translateX(${x*100}px) translateY(${-y*100}px) translateZ(${z*100}px)`;
    block.innerHTML = `
        <div class="face front">front</div>
        <div class="face back">back</div>
        <div class="face right">right</div>
        <div class="face left">left</div>
        <div class="face top">top</div>
        <div class="face bottom">bottom</div>
    `;

    let s;

    s = world.querySelector(`.cube.b${x}_${y-1}_${z}`);
    if (s) {
        s.querySelector('.top').remove();
        block.querySelector('.bottom').remove();
    }

    s = world.querySelector(`.cube.b${x}_${y+1}_${z}`);
    if (s) {
        s.querySelector('.bottom').remove();
        block.querySelector('.top').remove();
    }


    s = world.querySelector(`.cube.b${x-1}_${y}_${z}`);
    if (s) {
        s.querySelector('.right').remove();
        block.querySelector('.left').remove();
    }

    s = world.querySelector(`.cube.b${x+1}_${y}_${z}`);
    if (s) {
        s.querySelector('.left').remove();
        block.querySelector('.right').remove();
    }


    s = world.querySelector(`.cube.b${x}_${y}_${z-1}`);
    if (s) {
        s.querySelector('.front').remove();
        block.querySelector('.back').remove();
    }

    s = world.querySelector(`.cube.b${x}_${y}_${z+1}`);
    if (s) {
        s.querySelector('.back').remove();
        block.querySelector('.front').remove();
    }

    world.appendChild(block);
}