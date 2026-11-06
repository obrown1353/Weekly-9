import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';        
const loader = new THREE.TextureLoader();
const mLoader = new GLTFLoader();
const clock = new THREE.Clock();
let mixer;
let cowMixer;
let player;
let playerMixer;
let idleAction;
let walkAction;
let currentAction;


// ----------------------------------------------------
// Scene
// ----------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// ----------------------------------------------------
// Camera
// ----------------------------------------------------
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(20, 15, 20);

// ----------------------------------------------------
// Renderer
// ----------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

// ----------------------------------------------------
// Orbit Controls
// Allows Zoom, Pan, Orbit (Tilt/Rotate)
// ----------------------------------------------------
const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

//
// Texutres
//

const wallColor = loader.load('textures/castleWall/wall_color.jpg');
const wallNormal = loader.load('textures/castleWall/wall_normal.jpg');
const wallRough = loader.load('textures/castleWall/wall_rough.jpg');

const woodColor = loader.load('textures/wood/wood_color.jpg');
const woodNormal = loader.load('textures/wood/wood_normal.jpg');
const woodRough = loader.load('textures/wood/wood_rough.jpg');

const metalColor = loader.load('textures/metal/metall_color.jpg');
const metalNormal = loader.load('textures/metal/metal_normal.jpg');
const metalRough = loader.load('textures/metal/metal_rough.jpg');

const flag = loader.load('textures/flag/flag.jpg');

const crateColor = loader.load('textures/crate/crate_color.jpg');
const crateNormal = loader.load('textures/crate/crate_normal.jpg');
const crateRough = loader.load('textures/crate/crate_rough.jpg');


// ----------------------------------------------------
// Ground Plane
// ----------------------------------------------------
const groundGeometry = new THREE.PlaneGeometry(100, 100);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x66aa66
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);

//
// Houses
//
mLoader.load('models/house.glb', function (gltf) {
    const house1 = gltf.scene;
    house1.position.set(0, 0, 14);
    house1.scale.set(8,8,8);
    scene.add(house1);

    const house2 = gltf.scene.clone();
    house2.position.set(0, 0, -14);
    house2.scale.set(8,8,8);
    house2.rotateY(Math.PI);
    scene.add(house2);
});

//
// crops
//
mLoader.load('models/crops.glb', function (gltf) {
    const crops = gltf.scene;
    crops.position.set(0, 0, 20);
    crops.scale.set(4, 4, 4);
    scene.add(crops);
});

//
// Farmer
//

mLoader.load('models/farmer.glb', function (gltf) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    const slashClip = THREE.AnimationClip.findByName(gltf.animations,'CharacterArmature|Sword_Slash');
    const action = mixer.clipAction(slashClip);
    action.play();

    const farmer = gltf.scene;
    farmer.position.set(2, 0, 17);
    farmer.scale.set(2, 2, 2);
    scene.add(farmer);
});

//
// cow
//

mLoader.load('models/cow.glb', function (gltf) {
    cowMixer = new THREE.AnimationMixer(gltf.scene);
    const eatClip = THREE.AnimationClip.findByName(gltf.animations,'AnimalArmature|Eating');
    const action = cowMixer.clipAction(eatClip);
    action.play();

    const cow = gltf.scene;
    cow.position.set(-2, 0, 18);
    cow.scale.set(0.5, 0.5, 0.5);
    cow.rotation.y = Math.PI / 6;
    scene.add(cow);
});

//
// Player
//

mLoader.load('models/player.glb', function (gltf) {
    playerMixer = new THREE.AnimationMixer(gltf.scene);
    walkAction = playerMixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, 'CharacterArmature|Walk'));
    idleAction = playerMixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, 'CharacterArmature|Idle'));
    setPlayerAction(idleAction);

    player = gltf.scene;
    player.position.set(0, 0, 0);
    player.scale.set(2, 2, 2);
    scene.add(player);
});

// ----------------------------------------------------
// Walls
// ----------------------------------------------------
const sideWallGeometry = new THREE.BoxGeometry(15, 10, 0.5);
const backWallGeometry = new THREE.BoxGeometry(7, 10, 0.5);
const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallColor,
    normalMap: wallNormal,
    roughnessMap: wallRough
});

const sideWallLeft = new THREE.Mesh(
    sideWallGeometry,
    wallMaterial
);

const backCorner = new THREE.Mesh(
    backWallGeometry,
    wallMaterial
)

backCorner.position.y = 5;
backCorner.position.set(7.75, 5, -6.75);
backCorner.rotation.y = Math.PI / 2;
backCorner.castShadow = true;
scene.add(backCorner);

const backCornerRight = backCorner.clone();
backCornerRight.position.set(7.75, 5, 6.75)
scene.add(backCornerRight);

sideWallLeft.position.y = 5;
sideWallLeft.position.z = -10;
sideWallLeft.castShadow = true;
scene.add(sideWallLeft);

const sideWallRight = sideWallLeft.clone();
sideWallRight.position.z = 10;
scene.add(sideWallRight);

//
// WALL BANNERS
//
const bannerGeometry = new THREE.BoxGeometry(1.8, 3, 0.1);
const bannerMaterial = new THREE.MeshStandardMaterial({
    map: flag
});

for (const wallZ of [-9.69, 9.69]) {
    for (const x of [-4.5, -1, 2.5]) {
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(x, 7.5, wallZ);
        banner.castShadow = true;
        scene.add(banner);
    }
}

//
// GATE
//
const gatePanelGeometry = new THREE.BoxGeometry(1, 10, 1);
const gatePanelMaterial = new THREE.MeshStandardMaterial({
    map: woodColor,
    normalMap: woodNormal,
    roughnessMap: woodRough
});

const gatePanelLeft = new THREE.Mesh(gatePanelGeometry, gatePanelMaterial);
gatePanelLeft.position.set(7.75, 5, -2.75);
gatePanelLeft.rotation.y = Math.PI / 2;
gatePanelLeft.castShadow = true;
scene.add(gatePanelLeft);

const gatePanelRight = gatePanelLeft.clone();
gatePanelRight.position.z = 2.75;
scene.add(gatePanelRight);

const gateTop = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 6.5),
    gatePanelMaterial
);
gateTop.position.set(7.75, 10.25, 0);
gateTop.castShadow = true;
scene.add(gateTop);

const spikeGeometry = new THREE.ConeGeometry(0.35, 1, 8);
const spikeMaterial = new THREE.MeshStandardMaterial({
    map: metalColor,
    normalMap: metalNormal,
    roughnessMap: metalRough
    
});

for (let z = -2.5; z <= 2.5; z += 1.25) {
    const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
    spike.position.set(7.75, 9.5, z);
    spike.rotation.x = Math.PI;
    spike.castShadow = true;
    scene.add(spike);
}

//
// TOWERS
//

const towerGeometry = new THREE.CylinderGeometry(1.25, 1.5, 12, 12);
const towerMaterial = new THREE.MeshStandardMaterial({
    map: wallColor
});

const towerPositions = [
    [-7.5, -10],
    [-7.5, 10],
    [7.75, -10],
    [7.75, 10]
];

const towers = [];

for (const [x, z] of towerPositions) {
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    towers.push(tower);
    tower.position.set(x, 6, z);
    tower.castShadow = true;
    tower.receiveShadow = true;
    scene.add(tower);
}

//
// CRATES
//
const crateGeometry = new THREE.BoxGeometry(1.1, 1.1, 1.1);
const crateMaterial = new THREE.MeshStandardMaterial({
    map: crateColor,
    normalMap: crateNormal,
    roughnessMap: crateRough
});
const crateTemplate = new THREE.Mesh(crateGeometry, crateMaterial);
crateTemplate.castShadow = true;
crateTemplate.receiveShadow = true;

const cratePositions = [
    { x: -5.1, y: 0.55, z: -8.9 },
    { x: -4, y: 0.55, z: -8.8 },
    { x: -4.75, y: 1.65, z: -8.9 },
    { x: -1.7, y: 0.55, z: -8.85 },
    { x: -0.6, y: 0.55, z: -8.9 },
    { x: -1.2, y: 1.65, z: -8.8 },
    { x: -0.9, y: 2.75, z: -8.9 },
    { x: 1.2, y: 0.55, z: -7.5 },
    { x: 1.8, y: 0.55, z: -7.4 },
    { x: 1.5, y: 1.65, z: -7.45 },
    { x: 2.2, y: 0.55, z: -8.85 },
    { x: 3.3, y: 0.55, z: -8.9 },
    { x: 2.8, y: 1.65, z: -8.8 },
    { x: 4.8, y: 0.55, z: -8.9 },
    { x: -4.7, y: 0.55, z: 8.9 },
    { x: -3.6, y: 0.55, z: 8.85 },
    { x: -4.1, y: 1.65, z: 8.9 },
    { x: -0.8, y: 0.55, z: 8.9 },
    { x: 0.3, y: 0.55, z: 8.85 },
    { x: 0.1, y: 1.65, z: 8.9 },
    { x: -2.2, y: 0.55, z: 7.5 },
    { x: -1.1, y: 0.55, z: 7.4 },
    { x: -1.65, y: 1.65, z: 7.45 },
    { x: 3.2, y: 0.55, z: 8.85 },
    { x: 4.3, y: 0.55, z: 8.9 },
    { x: 3.8, y: 1.65, z: 8.85 }
];

for (const { x, y, z } of cratePositions) {
    const crate = crateTemplate.clone();
    crate.position.set(x, y, z);
    scene.add(crate);
}


// ----------------------------------------------------
// Ambient Light
// ----------------------------------------------------
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1
);

scene.add(ambientLight);

// ----------------------------------------------------
// Directional Light
// ----------------------------------------------------
const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

directionalLight.position.set(20, 30, 10);
directionalLight.castShadow = true;

scene.add(directionalLight);

// ----------------------------------------------------
// Toggle Lights
// ----------------------------------------------------
let lightsOn = true;

document
    .getElementById("toggleButton")
    .addEventListener("click", () => {

        lightsOn = !lightsOn;

        ambientLight.visible = lightsOn;
        directionalLight.visible = lightsOn;
    });

// ----------------------------------------------------
// Window Resize
// ----------------------------------------------------
window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

const keys = {};

document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

function setPlayerAction(next) {
    if (!next || next === currentAction) return;
    next.reset().fadeIn(0.2).play();
    if (currentAction) currentAction.fadeOut(0.2);
    currentAction = next;
}

const castleBoxes = [
    sideWallLeft,
    sideWallRight,
    backCorner,
    backCornerRight,
    ...towers
].map((mesh) => new THREE.Box3().setFromObject(mesh));

const playerBox = new THREE.Box3();
const playerHalfSize = new THREE.Vector3(0.5, 1, 0.5);

function hitsCastle() {
    const p = player.position;
    playerBox.setFromCenterAndSize(
        new THREE.Vector3(p.x, playerHalfSize.y, p.z),
        playerHalfSize.clone().multiplyScalar(2)
    );
    return castleBoxes.some((box) => box.intersectsBox(playerBox));
}

function movePlayer() {
    if (!player) return;

    const dx = (keys["ArrowRight"] ? 1 : 0) - (keys["ArrowLeft"] ? 1 : 0);
    const dz = (keys["ArrowDown"] ? 1 : 0) - (keys["ArrowUp"] ? 1 : 0);
    if (dx === 0 && dz === 0) {
        setPlayerAction(idleAction);
        return;
    }
    setPlayerAction(walkAction);

    const oldX = player.position.x;
    player.position.x += dx * 0.1;
    if (hitsCastle()) player.position.x = oldX;

    const oldZ = player.position.z;
    player.position.z += dz * 0.1;
    if (hitsCastle()) player.position.z = oldZ;

    player.rotation.y = Math.atan2(dx, dz);
}

// ----------------------------------------------------
// Animation Loop
// ----------------------------------------------------
function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    movePlayer();
    if (mixer) {
        mixer.update(delta);    
    }
    if (playerMixer) {
        playerMixer.update(delta);
    }
    if (cowMixer) {
        cowMixer.update(delta);
    }

    controls.update();

    renderer.render(scene, camera);
}

animate();