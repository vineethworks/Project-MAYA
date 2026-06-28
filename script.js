import * as THREE from "three";
console.log("================================");
console.log("      PROJECT MAYA v0.1");
console.log("      THE BEGINNING");
console.log("================================");

window.onload = () => {

    setTimeout(() => {

        document.getElementById("loading").style.display = "none";

    },2000);

};

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("game"),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

// Ground
const geometry = new THREE.PlaneGeometry(20,20);
const material = new THREE.MeshBasicMaterial({
    color:0x228B22,
    side:THREE.DoubleSide
});

const ground = new THREE.Mesh(geometry,material);

ground.rotation.x = -Math.PI/2;

scene.add(ground);

// Camera Position
camera.position.set(0,5,8);

camera.lookAt(0,0,0);

// Animation Loop
function animate(){

    requestAnimationFrame(animate);

    renderer.render(scene,camera);

}

animate();
