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

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(1, 32, 32);
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22
    });

    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);

    leaves.position.set(x, 2.5, z);

    scene.add(leaves);

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

// Keyboard Input

const keys = {};

window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

// Camera Position
camera.position.set(0, 8, 15);
camera.lookAt(0, 0, 0);
// Animation Loop
function animate(){

    requestAnimationFrame(animate);
const speed = 0.08;

if (keys["w"]) player.position.z -= speed;
if (keys["s"]) player.position.z += speed;
if (keys["a"]) player.position.x -= speed;
if (keys["d"]) player.position.x += speed;
    // Camera Follow

camera.position.x = player.position.x;

camera.position.z = player.position.z + 8;

camera.position.y = player.position.y + 6;

camera.lookAt(player.position);
    renderer.render(scene,camera);

}

animate();
