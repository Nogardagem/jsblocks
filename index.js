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

        cam.z -= walkSpeed*delta*Math.cos(angleY);
        cam.x -= walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyS) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI;

        cam.z += walkSpeed*delta*Math.cos(angleY);
        cam.x += walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyA) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI - 0.5*Math.PI;

        cam.z -= walkSpeed*delta*Math.cos(angleY);
        cam.x -= walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyD) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI - 0.5*Math.PI;

        cam.z += walkSpeed*delta*Math.cos(angleY);
        cam.x += walkSpeed*delta*-Math.sin(angleY);
    }


    document.querySelector('.world').style.transform = `translateZ(50vw) rotateX(${angleX}deg) rotateY(${angleY}deg)  translateX(${-cam.x*100}px) translateY(${cam.y*100}px) translateZ(${-cam.z*100}px)`;
    
    //center origin
    document.querySelector('.world').style.transform += `translateX(${rect.width*0.5-50}px) translateY(${rect.height*0.5-50}px)`;

    let dir = new Vec3(0, 0, -1).rotateX(angleX*Math.PI / 180).rotateY(angleY*Math.PI / 180);
    let hit = raycast(document.querySelector('.world'), cam, dir, 20);
    //document.querySelector('.crosshair').innerText = `x:${dir.x} y:${dir.y} z:${dir.z}`;
    
    if (hit) {
        //offsets by ten for difference in highlight vs block size (halved)
        document.querySelector('.world .highlight').style.transform = `translateX(${hit.x*100 -10}px) translateY(${-hit.y*100 -10}px) translateZ(${hit.z*100}px)`;
    }

    
    requestAnimationFrame(frame);
}



function placeBlock(world, x, y, z) {
    const block = document.createElement('div');
    block.className = `cube _${x}_${y}_${z}`;
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

    s = world.querySelector(`.cube._${x}_${y-1}_${z}`);
    if (s) {
        s.querySelector('.top').remove();
        block.querySelector('.bottom').remove();
    }

    s = world.querySelector(`.cube._${x}_${y+1}_${z}`);
    if (s) {
        s.querySelector('.bottom').remove();
        block.querySelector('.top').remove();
    }


    s = world.querySelector(`.cube._${x-1}_${y}_${z}`);
    if (s) {
        s.querySelector('.right').remove();
        block.querySelector('.left').remove();
    }

    s = world.querySelector(`.cube._${x+1}_${y}_${z}`);
    if (s) {
        s.querySelector('.left').remove();
        block.querySelector('.right').remove();
    }


    s = world.querySelector(`.cube._${x}_${y}_${z-1}`);
    if (s) {
        s.querySelector('.front').remove();
        block.querySelector('.back').remove();
    }

    s = world.querySelector(`.cube._${x}_${y}_${z+1}`);
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

    s = world.querySelector(`.cube._${x}_${y-1}_${z}`);
    if (s) {
        s.innerHTML += '<div class="face top">top</div>';
    }

    s = world.querySelector(`.cube._${x}_${y+1}_${z}`);
    if (s) {
        s.innerHTML += '<div class="face bottom">bottom</div>';
    }


    s = world.querySelector(`.cube._${x-1}_${y}_${z}`);
    if (s) {
        s.innerHTML += '<div class="face right">right</div>';
    }

    s = world.querySelector(`.cube._${x+1}_${y}_${z}`);
    if (s) {
        s.innerHTML += '<div class="face left">left</div>';
    }


    s = world.querySelector(`.cube._${x}_${y}_${z-1}`);
    if (s) {
        s.innerHTML += '<div class="face front">front</div>';
    }

    s = world.querySelector(`.cube._${x}_${y}_${z+1}`);
    if (s) {
        s.innerHTML += '<div class="face back">back</div>';
    }
}



function mine() {
    const scene = document.querySelector('.scene');
    const world = document.querySelector('.world');
    const rect = scene.getBoundingClientRect();
    let angleX = - (mouseY/rect.height - 0.5)*2 * 90;
    let angleY = (mouseX/rect.width - 0.5)*2 * 90;
    let dir = new Vec3(0, 0, -1).rotateX(angleX*Math.PI / 180).rotateY(angleY*Math.PI / 180);
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