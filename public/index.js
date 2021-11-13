import { WEBGL } from "./js/WebGL.js";

const cameraNear = 0.001;
const cameraFar = 100000000;

let camera, scene, renderer;

if (WEBGL.isWebGLAvailable()) {
    init();
    initThree();
    animate();
} else {
    const warning = WEBGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}

function init() {
    // Fullscreen button
    var fullscreenButton = document.getElementById('fullscreen-button');
    fullscreenButton.onclick = function toggleFullScreen() {
        if (!document.fullscreenElement)
            document.documentElement.requestFullscreen();
        else if (document.exitFullscreen)
            document.exitFullscreen();
    }
    if (document.fullscreenElement && !document.exitFullscreen)
        fullscreenButton.setAttribute("disabled", true);
}

function initThree() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, cameraNear, cameraFar);

    window.onresize = onWindowResize;
    onWindowResize();
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function animate() {
    try {
        render();

        requestAnimationFrame(animate);
    } catch (error) {
        console.error(error);
    }
}

function render() {
    renderer.render(scene, camera);
}
