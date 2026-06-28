import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
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
scene.fog = new THREE.Fog(0x87ceeb, 15, 35);
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
const material = new THREE.MeshStandardMaterial({
    color:0x228B22,
    side:THREE.DoubleSide
});

const ground = new THREE.Mesh(geometry,material);

ground.rotation.x = -Math.PI/2;

scene.add(ground);
// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(ambientLight);

// Sun Light
const sunLight = new THREE.DirectionalLight(0xffffff, 2);

sunLight.position.set(5, 10, 5);

scene.add(sunLight);
const trees = [];
// 🌳 Create Forest
for (let i = 0; i < 20; i++) {

    // Tree Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513
    });

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    const x = (Math.random() - 0.5) * 18;
    const z = (Math.random() - 0.5) * 18;

    trunk.position.set(x, 1, z);
scene.add(trunk);
    trees.push(trunk);

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(1, 32, 32);
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22
    });

    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);

    leaves.position.set(x, 2.5, z);
scene.add(leaves);
    trees.push(leaves);

}
// 🪨 Rocks
for (let i = 0; i < 15; i++) {

    const rockGeometry = new THREE.DodecahedronGeometry(
        Math.random() * 0.3 + 0.2
    );

    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080
    });

    const rock = new THREE.Mesh(
        rockGeometry,
        rockMaterial
    );

    rock.position.set(
        (Math.random() - 0.5) * 18,
        0.25,
        (Math.random() - 0.5) * 18
    );

    scene.add(rock);}

// 👤 Temporary Player

const playerGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);

const playerMaterial = new THREE.MeshStandardMaterial({
    color: 0x3366ff
});

const player = new THREE.Mesh(playerGeometry, playerMaterial);

player.position.set(0, 1, 0);

scene.add(player);
const loader = new GLTFLoader();
let mayaCharacter;
loader.load(

    "assets/models/maya.glb",

    function (gltf) {

        const maya = gltf.scene;
mayaCharacter = maya;
        maya.scale.set(1, 1, 1);

        maya.position.set(0, 0, 0);
player.visible = false;
        scene.add(maya);

    },

    undefined,

    function (error) {

        console.error("Model Load Error:", error);

    }

);
// Keyboard Input

const keys = {};

window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
    if (event.code === "Space" && !isJumping) {
    velocityY = jumpForce;
    isJumping = true;
}
});

window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});
let velocityY = 0;
let isJumping = false;

const gravity = 0.015;
const jumpForce = 0.28;
window.addEventListener("mousemove", (event) => {

    cameraAngle += event.movementX * 0.003;

    cameraPitch -= event.movementY * 0.002;

    cameraPitch = Math.max(-0.8, Math.min(0.8, cameraPitch));

});
// Camera Rotation

let cameraAngle = 0;
let cameraPitch = 0;
// Camera Position
camera.position.set(0, 8, 15);
camera.lookAt(0, 0, 0);
// Animation Loop
function animate(){

    requestAnimationFrame(animate);
const speed = keys["shift"] ? 0.16 : 0.08;
    console.log(speed);

if (keys["w"]) {
    player.position.z -= speed;
    player.rotation.y = 0;
}

if (keys["s"]) {
    player.position.z += speed;
    player.rotation.y = Math.PI;
}

if (keys["a"]) {
    player.position.x -= speed;
    player.rotation.y = Math.PI / 2;
}

if (keys["d"]) {
    player.position.x += speed;
    player.rotation.y = -Math.PI / 2;
}
// 🌍 World Boundary

player.position.x = Math.max(-9, Math.min(9, player.position.x));

player.position.z = Math.max(-9, Math.min(9, player.position.z));
    // 🎥 Smooth Camera Follow
    

const distance = 8;

camera.position.x += (
    (player.position.x + Math.sin(cameraAngle) * distance) -
    camera.position.x
) * 0.08;

camera.position.z += (
    (player.position.z + Math.cos(cameraAngle) * distance) -
    camera.position.z
) * 0.08;

camera.position.y += (
    (player.position.y + 6 + cameraPitch * 5) -
    camera.position.y
) * 0.08;

camera.lookAt(player.position);
// Jump Physics

velocityY -= gravity;

player.position.y += velocityY;
if (mayaCharacter) {

    mayaCharacter.position.copy(player.position);

}
if (player.position.y <= 1) {

    player.position.y = 1;

    velocityY = 0;

    isJumping = false;

}
renderer.render(scene, camera);
}

animate();
