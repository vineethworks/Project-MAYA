import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Sky } from "three/addons/objects/Sky.js";
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
// We'll use a Sky shader for a realistic sky instead of a flat color
// (background will be provided by the Sky mesh)

// Add subtle exponential fog for atmospheric haze (matches sky feel)
scene.fog = new THREE.FogExp2(0xbfdfff, 0.0025); // very light fog for depth

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

// Better color handling and tonemapping for more realistic colors
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

renderer.setSize(window.innerWidth, window.innerHeight);
// Enable soft shadows (moderate settings for browser performance)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Add a clock for frame-rate independent movement
const clock = new THREE.Clock();

// ---------- SKY (physically plausible) ----------
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

// Sun position vector used by both Sky shader and directional light
const sunPosition = new THREE.Vector3();

// Sky shader parameters
const skyUniforms = sky.material.uniforms;
skyUniforms["turbidity"].value = 8;
skyUniforms["rayleigh"].value = 2.0;
skyUniforms["mieCoefficient"].value = 0.005;
skyUniforms["mieDirectionalG"].value = 0.8;

// Set a pleasant sun altitude/azimuth
const sunAltitude = 45; // degrees above horizon
const sunAzimuth = 180; // degrees, 180 = behind camera initially
const phi = THREE.MathUtils.degToRad(90 - sunAltitude);
const theta = THREE.MathUtils.degToRad(sunAzimuth);
sunPosition.setFromSphericalCoords(1, phi, theta);
skyUniforms["sunPosition"].value.copy(sunPosition);

// Match fog color with sky tint for smooth blending
const skyColor = new THREE.Color().setHSL(0.58, 0.6, 0.85); // light bluish
scene.fog.color.copy(skyColor);

// ---------- TEXTURES / GROUND MATERIAL ----------
const textureLoader = new THREE.TextureLoader();

// High-quality tileable grass texture (hosted on threejs examples site)
const grassTexture = textureLoader.load('https://threejs.org/examples/textures/grasslight-big.jpg');
grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(8, 8);
grassTexture.encoding = THREE.sRGBEncoding;

// Create a small noise canvas to use as a roughness map (adds dirt/variation without external assets)
function createNoiseTexture(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
        const v = Math.floor(Math.random() * 255);
        const idx = i * 4;
        // grayscale noise
        imageData.data[idx] = v;
        imageData.data[idx + 1] = v;
        imageData.data[idx + 2] = v;
        imageData.data[idx + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    return tex;
}
const noiseTexture = createNoiseTexture(128);

// Ground geometry and PBR-like material using the tiled grass texture and noise roughness
const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
const groundMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    roughnessMap: noiseTexture,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.DoubleSide
});

const ground = new THREE.Mesh(geometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true; // receive shadows from sun and scene objects
scene.add(ground);

// Ambient Light + Hemisphere light for soft fill (preserve daylight feeling)
const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x443322, 0.55); // soft sky / ground colors
scene.add(hemiLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
scene.add(ambientLight);

// Sun / Directional light - warm, shadow caster (keep parameters tuned for web)
const sunLight = new THREE.DirectionalLight(0xfff0c8, 1.6);
// Position will be aligned to sky's sun position below
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
const d = 15;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 200;
if (sunLight.shadow.radius !== undefined) sunLight.shadow.radius = 4;
scene.add(sunLight);

// Align directional light position with Sky's sun vector and scale appropriately
sunLight.position.copy(sunPosition).multiplyScalar(30);

// Store trees/rocks for later visual upgrades but keep them unchanged now
const trees = [];
// 🌳 Create Forest (unchanged shapes, only now set shadow flags)
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
// 🪨 Rocks (same geometry but with shadows)
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
    scene.add(rock);
}

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
                // ensure correct color encoding for GLTF textures
                if (child.material && child.material.map) child.material.map.encoding = THREE.sRGBEncoding;
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
