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
// Enable soft shadows (moderate settings for browser performance)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Add a clock for frame-rate independent movement
const clock = new THREE.Clock();

// Ground
const geometry = new THREE.PlaneGeometry(20,20);
const material = new THREE.MeshStandardMaterial({
    color:0x228B22,
    side:THREE.DoubleSide
});

const ground = new THREE.Mesh(geometry,material);

ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true; // receive shadows from sun and trees

scene.add(ground);
// Soft ambient illumination using HemisphereLight
const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x443322, 0.55); // soft sky / ground colors
scene.add(hemiLight);
// Subtle fill ambient to keep characters visible in deep shade
const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
scene.add(ambientLight);

// Sun Light (directional) - warm color and caster of soft shadows
const sunLight = new THREE.DirectionalLight(0xfff0c8, 1.6);

sunLight.position.set(5, 10, 5);
sunLight.castShadow = true;
// Shadow map resolution (1024 keeps quality reasonable in browser)
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
// Tweak camera bounds for the directional light (orthographic) to cover the visible world
const d = 15;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
// Softness
if (sunLight.shadow.radius !== undefined) sunLight.shadow.radius = 4;

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
    trunk.castShadow = true;
    trunk.receiveShadow = true;
scene.add(trunk);
    trees.push(trunk);

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(1, 32, 32);
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22
    });

    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);

    leaves.position.set(x, 2.5, z);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
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
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);} 

// 👤 Temporary Player

const playerGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);

const playerMaterial = new THREE.MeshStandardMaterial({
    color: 0x3366ff
});

const player = new THREE.Mesh(playerGeometry, playerMaterial);

player.position.set(0, 1, 0);
player.castShadow = true;
player.receiveShadow = true;
scene.add(player);
const loader = new GLTFLoader();
let mayaCharacter = null;
let mixer = null;
loader.load(

    "assets/models/maya.glb",

    function (gltf) {

        const maya = gltf.scene;
mayaCharacter = maya;
        mixer = new THREE.AnimationMixer(mayaCharacter);
        if (gltf.animations.length > 0) {

    const action = mixer.clipAction(gltf.animations[0]);

    action.play();

}
        maya.scale.set(1, 1, 1);
maya.rotation.y = Math.PI;
        maya.position.set(0, 0, 0);
// Ensure character meshes cast and receive shadows
maya.traverse((child) => {
    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
    }
});
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
    // Use clock to make movement frame-rate independent
    const delta = Math.max(0.0001, clock.getDelta());

const baseSpeed = keys["shift"] ? 0.16 : 0.08;
// Keep same per-frame feel at ~60 FPS by scaling with (delta * 60)
const frameScale = delta * 60;
const speed = baseSpeed * frameScale;
    console.log(baseSpeed);

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
    if (mayaCharacter) {

    mayaCharacter.rotation.y = player.rotation.y + Math.PI;
}
if (player.position.y <= 1) {

    player.position.y = 1;

    velocityY = 0;

    isJumping = false;

}
renderer.render(scene, camera);
}

animate();
