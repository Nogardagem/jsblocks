let mouseX = 0;
let mouseY = 0;

let angleX = 0;
let angleY = 0;

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
    const ui = document.querySelector('.ui');
    const scene = document.querySelector('.scene');
    const rect = scene.getBoundingClientRect();
    // Pointer lock requires a user gesture like a click
    ui.addEventListener('click', async () => {
        await ui.requestPointerLock({
            unadjustedMovement: true,
        });
    });

    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === ui) {
            // Use movementX/Y because clientX/Y remain frozen when locked
            mouseX += event.movementX;
            mouseY += event.movementY;

            // if (mouseY < 0) {mouseY = 0;}
            // if (mouseY > rect.height) {mouseY = rect.height;}
            angleX += -event.movementY*0.005;
            angleY += event.movementX*0.005;

            if (angleX > 0.5*Math.PI) {angleX = 0.5*Math.PI;}
            if (angleX < -0.5*Math.PI) {angleX = -0.5*Math.PI;}

            while (angleY < 0) {
                angleY += Math.PI*2.0;
            }
            while (angleY > Math.PI*2.0) {
                angleY -= Math.PI * 2.0;
            }
        }
    });

    // window.addEventListener('mousemove', (event) => {
    //     mouseX = event.clientX;
    //     mouseY = event.clientY;
    // });

    window.addEventListener('mousedown', (event) => {
        mine();
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

const walkSpeed = 10;
const flySpeed = 10;

function frame() {
    delta = (Date.now() - lastTime) / 1000.0;
    lastTime = Date.now();

    const scene = document.querySelector('.scene');
    const rect = scene.getBoundingClientRect();

    // let angleX = - (mouseY/rect.height - 0.5) * Math.PI;
    // let angleY = (mouseX/rect.width - 0.5) * Math.PI;


    if (keys.Space) {
        cam.y += flySpeed*delta;
    }
    if (keys.ShiftLeft || keys.ShiftRight) {
        cam.y -= flySpeed*delta;
    }
    if (keys.KeyW) {
        cam.z -= walkSpeed*delta*Math.cos(angleY);
        cam.x -= walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyS) {
        cam.z += walkSpeed*delta*Math.cos(angleY);
        cam.x += walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyA) {
        cam.z -= walkSpeed*delta*Math.cos(angleY - 0.5*Math.PI);
        cam.x -= walkSpeed*delta*-Math.sin(angleY - 0.5*Math.PI);
    }
    if (keys.KeyD) {
        cam.z += walkSpeed*delta*Math.cos(angleY - 0.5*Math.PI);
        cam.x += walkSpeed*delta*-Math.sin(angleY - 0.5*Math.PI);
    }


    document.querySelector('.world').style.transform = `translateZ(50vw) rotateX(${angleX}rad) rotateY(${angleY}rad)  translateX(${-cam.x*100}px) translateY(${cam.y*100}px) translateZ(${-cam.z*100}px)`;
    
    //center origin
    document.querySelector('.world').style.transform += `translateX(${rect.width*0.5-50}px) translateY(${rect.height*0.5-50}px)`;

    let dir = new Vec3(0, 0, -1).rotateX(angleX).rotateY(angleY);
    let hit = raycast(document.querySelector('.world'), cam, dir);
    //document.querySelector('.crosshair').innerText = `x:${dir.x} y:${dir.y} z:${dir.z}`;
    
    const highlight = document.querySelector('.world .highlight');

    if (hit) {
        //offsets by ten for difference in highlight vs block size (halved)
        highlight.style.transform = `translateX(${hit.x*100 -10}px) translateY(${-hit.y*100 -10}px) translateZ(${hit.z*100}px)`;
        highlight.style.display = 'block';
    }
    else {
        highlight.style.display = 'none';
    }

    
    requestAnimationFrame(frame);
}



function placeBlock(world, x, y, z) {
    const block = makeBlockDiv(x, y, z);

    let s;

    s = getBlockDiv(world, x, y-1, z);
    if (s) {
        s.querySelector('.top').remove();
        block.querySelector('.bottom').remove();
    }

    s = getBlockDiv(world, x, y+1, z);
    if (s) {
        s.querySelector('.bottom').remove();
        block.querySelector('.top').remove();
    }


    s = getBlockDiv(world, x-1, y, z);
    if (s) {
        s.querySelector('.right').remove();
        block.querySelector('.left').remove();
    }

    s = getBlockDiv(world, x+1, y, z);
    if (s) {
        s.querySelector('.left').remove();
        block.querySelector('.right').remove();
    }


    s = getBlockDiv(world, x, y, z-1);
    if (s) {
        s.querySelector('.front').remove();
        block.querySelector('.back').remove();
    }

    s = getBlockDiv(world, x, y, z+1);
    if (s) {
        s.querySelector('.back').remove();
        block.querySelector('.front').remove();
    }

    world.appendChild(block);
}

function breakBlock(world, x, y, z) {
    const b = world.querySelector(`.cube._${x}_${y}_${z}`);
    b.remove();

    let s;

    s = getBlockDiv(world, x, y-1, z);
    if (s) {
        s.innerHTML += faceDiv('top');
    }
    s = getBlockDiv(world, x, y+1, z);
    if (s) {
        s.innerHTML += faceDiv('bottom');
    }

    s = getBlockDiv(world, x-1, y, z);
    if (s) {
        s.innerHTML += faceDiv('right');
    }
    s = getBlockDiv(world, x+1, y, z);
    if (s) {
        s.innerHTML += faceDiv('left');
    }

    s = getBlockDiv(world, x, y, z-1);
    if (s) {
        s.innerHTML += faceDiv('front');
    }
    s = getBlockDiv(world, x, y, z+1);
    if (s) {
        s.innerHTML += faceDiv('back');
    }
}

function faceDiv(face) {
    return `<div class="face ${face}">${face}</div>`;
}


function getBlockDiv(world, x, y, z) {
    return world.querySelector(`.cube._${x}_${y}_${z}`);
}

function makeBlockDiv(x, y, z) {
    const block = document.createElement('div');
    block.className = `cube _${x}_${y}_${z}`;
    block.style.transform = `translateX(${x*100}px) translateY(${-y*100}px) translateZ(${z*100}px)`;
    block.innerHTML = faceDiv('front') + faceDiv('back') + faceDiv('left') + faceDiv('right') + faceDiv('top') + faceDiv('bottom');
    return block;
}


function mine() {
    const scene = document.querySelector('.scene');
    const world = document.querySelector('.world');
    const rect = scene.getBoundingClientRect();
    // let angleX = - (mouseY/rect.height - 0.5) * Math.PI;
    // let angleY = (mouseX/rect.width - 0.5) * Math.PI;
    let dir = new Vec3(0, 0, -1).rotateX(angleX).rotateY(angleY);
    let hit = raycast(world, cam, dir, 20);

    if (hit) {
        breakBlock(world, hit.x, hit.y, hit.z);
    }
}


function raycast(world, from, dir, range=10) {
    for (let i = 0; i < range; i+= 0.1) {
        let test = from.add(dir.scale(i));
        let t = world.querySelector(`._${Math.round(test.x)}_${Math.round(test.y)}_${Math.round(test.z)}`);

        if (t) {
            return new Vec3(Math.round(test.x), Math.round(test.y), Math.round(test.z));
        }
    }

    return undefined;
}