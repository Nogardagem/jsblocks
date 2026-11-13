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
    KeyD: false,
    ArrowLeft: false,
    ArrowRight: false,
    ArrowDown: false,
    ArrowUp: false
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
        if (event.button === 0) {
            //left button
            mine();
        }
        else if (event.button === 1) {
            //middle mouse button
        }
        else if (event.button === 2) {
            //right button
            build();
        }
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


let cam = new Vec3(4,9,4);

const walkSpeed = 10;
const flySpeed = 10;


let boxSize = new Vec3(2,1,3);
let boxPos = new Vec3(0,10,0);


function frame() {
    delta = (Date.now() - lastTime) / 1000.0;
    lastTime = Date.now();

    const scene = document.querySelector('.scene');
    const rect = scene.getBoundingClientRect();


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


    if (keys.ArrowUp) {
        boxPos.y += walkSpeed*delta;
    }
    if (keys.ArrowDown) {
        boxPos.y -= walkSpeed*delta;
    }
    if (keys.ArrowLeft) {
        boxPos.x -= walkSpeed*delta;
    }
    if (keys.ArrowRight) {
        boxPos.x += walkSpeed*delta;
    }


    document.querySelector('.world').style.transform = `translateZ(50vw) rotateX(${angleX}rad) rotateY(${angleY}rad)  translateX(${-cam.x*100}px) translateY(${cam.y*100}px) translateZ(${-cam.z*100}px)`;
    
    //center origin
    document.querySelector('.world').style.transform += `translateX(${rect.width*0.5}px) translateY(${rect.height*0.5}px)`;

    let dir = new Vec3(0, 0, -1).rotateX(angleX).rotateY(angleY);
    let hit = raycast(document.querySelector('.world'), cam, dir);
    //document.querySelector('.crosshair').innerText = `x:${dir.x} y:${dir.y} z:${dir.z}`;
    
    const highlight = document.querySelector('.world .highlight');

    if (hit) {
        //offsets by ten for difference in highlight vs block size (halved)
        highlight.style.transform = `translateX(${hit.x*100 -60}px) translateY(${-hit.y*100 -60}px) translateZ(${hit.z*100}px)`;
        highlight.style.display = 'block';
    }
    else {
        highlight.style.display = 'none';
    }

    const testbox = document.querySelector('#testbox');
    testbox.style.setProperty('--width', `${boxSize.x*100}px`);
    testbox.style.setProperty('--height', `${boxSize.y*100}px`);
    testbox.style.setProperty('--depth', `${boxSize.z*100}px`);

    testbox.style.transform = `translate3d(${boxPos.x*100}px, ${-boxPos.y*100}px, ${boxPos.z*100}px)`;

    if (boxHits(document.querySelector('.world'), boxSize.x, boxSize.y, boxSize.z, boxPos.x, boxPos.y, boxPos.z)) {
        testbox.querySelector('.top').innerText = 'HITS';
    }
    else {
        testbox.querySelector('.top').innerText = 'nope';
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
    const b = getBlockDiv(world, x, y, z);
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
    block.style.transform = `translateX(${x*100-50}px) translateY(${-y*100-50}px) translateZ(${z*100}px)`;
    block.innerHTML = faceDiv('front') + faceDiv('back') + faceDiv('left') + faceDiv('right') + faceDiv('top') + faceDiv('bottom');
    return block;
}


function mine() {
    const world = document.querySelector('.world');
    let dir = new Vec3(0, 0, -1).rotateX(angleX).rotateY(angleY);
    let hit = raycast(world, cam, dir);

    if (hit) {
        breakBlock(world, hit.x, hit.y, hit.z);
    }
}

function build() {
    const world = document.querySelector('.world');
    let dir = new Vec3(0, 0, -1).rotateX(angleX).rotateY(angleY);
    let hit = raycastBefore(world, cam, dir);

    if (hit && !(getBlockDiv(world, hit.x, hit.y, hit.z))) {
        placeBlock(world, hit.x, hit.y, hit.z);
    }
}


function raycast(world, from, dir, range=10) {
    for (let i = 0; i < range; i+= 0.05) {
        let test = from.add(dir.scale(i));
        let t = getBlockDiv(world, Math.round(test.x), Math.round(test.y), Math.round(test.z));

        if (t) {
            return new Vec3(Math.round(test.x), Math.round(test.y), Math.round(test.z));
        }
    }

    return undefined;
}

//raycast but stop the block before hit
function raycastBefore(world, from, dir, range=10) {
    let last = from;

    for (let i = 0; i < range; i+= 0.05) {
        let test = from.add(dir.scale(i));
        let t = getBlockDiv(world, Math.round(test.x), Math.round(test.y), Math.round(test.z));

        if (t) {
            return last;
        }
        last = new Vec3(Math.round(test.x), Math.round(test.y), Math.round(test.z));
    }

    return undefined;
}


function boxHits(world, w, h, d, x, y, z) {
    if (raycast(world, new Vec3(x-w/2, y-h/2, z-d/2), new Vec3(0,0,1), d)) {
        return true;
    }
    if (raycast(world, new Vec3(x-w/2, y-h/2, z-d/2), new Vec3(0,1,0), h)) {
        return true;
    }
    if (raycast(world, new Vec3(x-w/2, y-h/2, z-d/2), new Vec3(1,0,0), w)) {
        return true;
    }

    if (raycast(world, new Vec3(x+w/2, y+h/2, z+d/2), new Vec3(0,0,-1), d)) {
        return true;
    }
    if (raycast(world, new Vec3(x+w/2, y+h/2, z+d/2), new Vec3(0,-1,0), h)) {
        return true;
    }
    if (raycast(world, new Vec3(x+w/2, y+h/2, z+d/2), new Vec3(-1,0,0), w)) {
        return true;
    }

    if (raycast(world, new Vec3(x+w/2, y-h/2, z-d/2), new Vec3(0,0,1), d)) {
        return true;
    }
    if (raycast(world, new Vec3(x+w/2, y-h/2, z-d/2), new Vec3(0,1,0), h)) {
        return true;
    }

    if (raycast(world, new Vec3(x-w/2, y+h/2, z-d/2), new Vec3(0,0,1), d)) {
        return true;
    }
    if (raycast(world, new Vec3(x-w/2, y+h/2, z-d/2), new Vec3(1,0,0), w)) {
        return true;
    }

    if (raycast(world, new Vec3(x-w/2, y-h/2, z+d/2), new Vec3(0,1,0), h)) {
        return true;
    }
    if (raycast(world, new Vec3(x-w/2, y-h/2, z+d/2), new Vec3(1,0,0), w)) {
        return true;
    }
    
    return false;
}