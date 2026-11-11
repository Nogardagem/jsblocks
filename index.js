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
    // var cube = document.querySelector('.cube');
    // var radioGroup = document.querySelector('.radio-group');
    // var currentClass = '';

    // function changeSide() {
    // var checkedRadio = radioGroup.querySelector(':checked');
    // var showClass = 'show-' + checkedRadio.value;
    // if ( currentClass ) {
    //     cube.classList.remove( currentClass );
    // }
    // cube.classList.add( showClass );
    // currentClass = showClass;
    // }
    // // set initial side
    // changeSide();

    // radioGroup.addEventListener( 'change', changeSide );

    

    const scene = document.querySelector('.scene');

    scene.addEventListener('mousemove', (event) => {
        const rect = scene.getBoundingClientRect();
        
        // Subtract the element's top/left offset from the mouse viewport coordinates
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        mouseX = x;
        mouseY = y;
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

    
    const rect = document.querySelector('.scene').getBoundingClientRect();

    for (cube of document.querySelectorAll('.cube')) {
        let x = Math.floor(Math.random() * 5) - 2;
        let y = -Math.floor(Math.random() * 5) - 1;

        cube.style.transform = `translateX(${x*100 + rect.width*0.5-50}px) translateY(${y*100 + rect.height*0.5-50}px)`;
    }

    const world = document.querySelector('.world');
    for (let x = -3; x <= 3; x++) {
        for (let z = -3; z <= 3; z++) {
            const block = document.createElement('div');
            block.className = 'cube';
            block.style.transform = `translateX(${x*100 + rect.width*0.5-50}px) translateY(${rect.height*0.5-50}px) translateZ(${z*100}px)`;
            block.innerHTML = `
                <div class="face front">front</div>
                <div class="face back">back</div>
                <div class="face right">right</div>
                <div class="face left">left</div>
                <div class="face top">top</div>
                <div class="face bottom">bottom</div>
            `;

            world.appendChild(block);
        }
    }
    
    requestAnimationFrame(frame);
}


let delta = 0;
let lastTime = Date.now();


let camX = 0;
let camY = 0;
let camZ = 0;

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
        camY += flySpeed*delta;
    }
    if (keys.ShiftLeft || keys.ShiftRight) {
        camY -= flySpeed*delta;
    }
    if (keys.KeyW) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI;

        camZ += walkSpeed*delta*Math.cos(angleY);
        camX += walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyS) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI;

        camZ -= walkSpeed*delta*Math.cos(angleY);
        camX -= walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyA) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI - 0.5*Math.PI;

        camZ += walkSpeed*delta*Math.cos(angleY);
        camX += walkSpeed*delta*-Math.sin(angleY);
    }
    if (keys.KeyD) {
        let angleY = (mouseX/rect.width - 0.5)*2 * 0.5*Math.PI - 0.5*Math.PI;

        camZ -= walkSpeed*delta*Math.cos(angleY);
        camX -= walkSpeed*delta*-Math.sin(angleY);
    }


    document.querySelector('.world').style.transform = `translateZ(50vw) rotateX(${angleX}deg) rotateY(${angleY}deg)  translateX(${camX*100}px) translateY(${camY*100}px) translateZ(${camZ*100}px)`;

    requestAnimationFrame(frame);
}