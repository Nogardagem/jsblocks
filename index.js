let mouseX = 0;
let mouseY = 0;

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

let cx=0;
let cy=0;
let delta = 0;
let lastTime = Date.now();

function frame() {
    delta = (Date.now() - lastTime) / 1000.0;
    lastTime = Date.now();

    const scene = document.querySelector('.scene');
    const rect = scene.getBoundingClientRect();
    document.querySelector('.world').style.transform = `rotateX(${- (mouseY/rect.height - 0.5) * 90}deg) rotateY(${(mouseX/rect.width - 0.5) * 90}deg)`;

    requestAnimationFrame(frame);
}