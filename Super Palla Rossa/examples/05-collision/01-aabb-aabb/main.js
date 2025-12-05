import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';

import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';
import { FirstPersonController } from 'engine/controllers/FirstPersonController.js';

import { Camera, Model, Node } from 'engine/core.js';
import { vec3, mat4 } from 'glm';
import { Transform } from 'engine/core.js';

import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from 'engine/core/MeshUtils.js';

import { Physics } from './Physics.js';

import { GUI } from 'dat';
import { Light } from './Light.js';
import { Renderer } from './Renderer.js';


export async function startGame() {

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
await renderer.initialize();


const loader = new GLTFLoader();
await loader.load(new URL('./test5/test.gltf', import.meta.url));



const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode('Camera.002');

const player = loader.loadNode('Player');
player.aabb = {
    min: [-0.28, -0.28, -0.28],
    max: [0.28, 0.28, 0.28],
};

player.addComponent(new FirstPersonController(player, canvas));


player.isDynamic = true;;
player.isGrounded = false;
player.isOnLadder = false;


// Ground


const groundNodes = [
    'Cube.001',
    'Cube.002',
    'Cube.003',
    'Cube.004',
    'Cube.005',
    'Cube.006',
    'Cube.007',
    'Cube.008',
    'Cube.009',
    'pCylinder43_lambert1_0',
    'pCylinder44_lambert1_0',
    'Cube.013',
    'Cube.014',
    'Cube.015',
    'Cube.016',
    'pCylinder91_lambert1_0.001',
    'pCylinder91_lambert1_0.002',
    'pCylinder91_lambert1_0',
    'pCylinder23_lambert1_0',
    'pCylinder21_lambert1_0'
]

groundNodes.forEach(node => {
    loader.loadNode(node).isStatic = true;
});


// Ladders

const ladderNodes = [
    'pCube16_lambert1_0',
    'pCube17_lambert1_0',
    'pCube104_lambert1_0',
    'pCube104_lambert1_0.001',
    'pCube104_lambert1_0.002'
]

ladderNodes.forEach(node => {
    loader.loadNode(node).isStatic = true;
    loader.loadNode(node).isLadder = true;
});


// Other

const otherNodes = [
    'pSphere8_lambert1_0',
    'pSphere7_lambert1_0',
    'pSphere3_lambert1_0',
    'pCube13_lambert1_0',
    'pCylinder2_lambert1_0',
    'pCube13_lambert1_0.001',
    'pCube13_lambert1_0.001',
    'polySurface3_lambert1_0',
    'pSphere114_lambert1_0',
    'pSphere3_lambert1_0.001',
    'polySurface3_lambert1_0.001',
    'pCylinder49_lambert1_0',
    'pSphere160_lambert1_0',
    'pCube111_lambert1_0.002',
    'pCube111_lambert1_0.001',
    'pCube13_lambert1_0.003',
    'pCylinder111_lambert1_0',
    'pCylinder144_lambert1_0',
    'pSphere112_lambert1_0',
    'pSphere152_lambert1_0',
    'pSphere228_lambert1_0',
    'pSphere231_lambert1_0',
    'pSphere177_lambert1_0.001',
    'pSphere180_lambert1_0',
    'pSphere180_lambert1_0.001',
    'pCylinder144_lambert1_0.001',
    'pSphere151_lambert1_0',
    'pSphere160_lambert1_0.001',
    'pCube119_lambert1_0',
    'pSphere136_lambert1_0',
    'pSphere135_lambert1_0',
    'pCone36_lambert1_0.001',
    'pCone35_lambert1_0.001',
    'pCone47_lambert1_0.001',
    'pCone48_lambert1_0.001',
    'pCone34_lambert1_0.001',
    'pCone46_lambert1_0.001',
    'pSphere137_lambert1_0',
    'pCylinder144_lambert1_0.002',
    'pCone43_lambert1_0.001',
    'pCone43_lambert1_0.002',
    'pSphere134_lambert1_0',
    'pSphere120_lambert1_0.001',
    'pSphere5_lambert1_0.001',
    'pSphere122_lambert1_0',
    'pSphere5_lambert1_0', 
    'pSphere125_lambert1_0',
    'pSphere120_lambert1_0.003',
    'pSphere120_lambert1_0.002',
    'pSphere130_lambert1_0.001',
    'pSphere130_lambert1_0',
    'pSphere129_lambert1_0',
    'pSphere126_lambert1_0',
    'pSphere127_lambert1_0',
    'pCube13_lambert1_0.002',
    'pCylinder152_lambert1_0',
    'pSphere120_lambert1_0',
]   

otherNodes.forEach(node => {
    loader.loadNode(node).isStatic = true;
});


// Buttons

loader.loadNode('pSphere117_lambert1_0').isStatic = true;
loader.loadNode('pSphere117_lambert1_0').isButton = true;
loader.loadNode('pSphere117_lambert1_0').object = loader.loadNode('pCube41_lambert1_0.003');

loader.loadNode('pSphere117_lambert1_0.002').isStatic = true;
loader.loadNode('pSphere117_lambert1_0.002').isButton = true;
loader.loadNode('pSphere117_lambert1_0.002').object = loader.loadNode('Mesh_Gold.001_0.004');

// Bridge

loader.loadNode('pCube41_lambert1_0.003').isStatic = true;
loader.loadNode('pCube41_lambert1_0.003').skipRender = true;


loader.loadNode('pCylinder49_lambert1_0').isStatic = true;

loader.loadNode('Cube.010').isStatic = true;
loader.loadNode('Cube.010').isDoor = true;
loader.loadNode('Cube.010').object = loader.loadNode('Cube.011');

loader.loadNode('Cube.011').isStatic = true;
loader.loadNode('Cube.011').isDoor = true;
loader.loadNode('Cube.011').object = loader.loadNode('Cube.010');

loader.loadNode('pCylinder143_lambert1_0.001').isStatic = true;
loader.loadNode('pCylinder143_lambert1_0.001').isTopDoor = true;
loader.loadNode('pCylinder143_lambert1_0.001').object = loader.loadNode('pCylinder143_lambert1_0');

loader.loadNode('pCylinder143_lambert1_0').isStatic = true;
loader.loadNode('pCylinder143_lambert1_0').isTopDoor = true;
loader.loadNode('pCylinder143_lambert1_0').object = loader.loadNode('pCylinder143_lambert1_0.001');

// bottom dying ground
const botGround = loader.loadNode('pCube118_lambert1_0');
botGround.isStatic = true;
botGround.ground = true;

const botGround1 = loader.loadNode('pCube118_lambert1_0.001');
botGround1.isStatic = true;
botGround1.ground = true;

// Coins


const coinNodes = [
    'Mesh_Gold.001_0',
    'Mesh_Gold.001_0.001',
    'Mesh_Gold.001_0.002',
    'Mesh_Gold.001_0.003',
    'Mesh_Gold.001_0.004',
    'Mesh_Gold.001_0.005',
    'Mesh_Gold.001_0.006',
    'Mesh_Gold.001_0.007',
    'Mesh_Gold.001_0.008',
    'Mesh_Gold.001_0.009',
    'Mesh_Gold.001_0.010',
    'Mesh_Gold.001_0.011',
    'Mesh_Gold.001_0.012',
    'Mesh_Gold.001_0.013'
]

coinNodes.forEach(node => {
    loader.loadNode(node).isStatic = true;
    loader.loadNode(node).isCoin = true;
});

loader.loadNode('Mesh_Gold.001_0.004').skipRender = true;
loader.loadNode('Mesh_Gold.001_0.004').hiddenCoin = true;


// Stars

const starNodes = [
    'pCylinder166_lambert1_0',
    'pCylinder166_lambert1_0.001',
    'pCylinder166_lambert1_0.002',
    'pCylinder166_lambert1_0.003',
]

starNodes.forEach(node => {
    loader.loadNode(node).isStatic = true;
    loader.loadNode(node).isStar = true;
});

const winningStar = 'pCylinder166_lambert1_0.004';
loader.loadNode(winningStar).isStatic = true;
loader.loadNode(winningStar).isWinningStar = true;


// Enemies


const enemyNodes = [
    'Sketchfab_model.068',
    'Sketchfab_model.069',
    'Sketchfab_model.072',
    'Sketchfab_model.073',
    'Sketchfab_model.075',
    'Sketchfab_model.077',
    'Sketchfab_model.078'
]

const enemies = [];

enemyNodes.forEach(node => {
    const e = loader.loadNode(node);

    e.name = node;
    e.isEnemy = true;
    e.pointA = vec3.clone(e.getComponentOfType(Transform).translation);
    e.pointB = vec3.create();
    e.speed = 3;
    e.targetPoint = e.pointB;
    e.aabb = {
        min: [-0.42, -0.42, -0.36],
        max: [0.42, 0.42, 0.36],
    };

    enemies.push(e);
});


vec3.add(enemies[0].pointB, enemies[0].pointA, [-8, 0, 0]);
vec3.add(enemies[1].pointB, enemies[1].pointA, [8, 0, 3]);
vec3.add(enemies[2].pointB, enemies[2].pointA, [-6, 0, -2]);
vec3.add(enemies[3].pointB, enemies[3].pointA, [-8, 0, 3]);
vec3.add(enemies[4].pointB, enemies[4].pointA, [5, 0, -4]);
enemies[4].aabb = {
    min: [-0.2, -0.2, -0.3],
    max: [0.2, 0.2, 0.3],
};
vec3.add(enemies[5].pointB, enemies[5].pointA, [-8, 0, 2]);
vec3.add(enemies[6].pointB, enemies[6].pointA, [-4, 0, 2]);
enemies[6].aabb = {
    min: [-0.2, -0.2, -0.3],
    max: [0.2, 0.2, 0.3],
};



// player
const modelPLayer = loader.loadNode('Player');
const materialPlayer = modelPLayer.getComponentOfType(Model).primitives[0].material;
materialPlayer.diffuse = 1;
materialPlayer.specular = 1;
materialPlayer.shininess = 50;


// spheres
const modelpSphere117_001 = loader.loadNode('pSphere117_lambert1_0.001');
const materialpSphere117_001 = modelpSphere117_001.getComponentOfType(Model).primitives[0].material;
materialpSphere117_001.diffuse = 1;
materialpSphere117_001.specular = 1;
materialpSphere117_001.shininess = 50;

const modelpSphere8 = loader.loadNode('pSphere8_lambert1_0');
const materialpSphere8 = modelpSphere8.getComponentOfType(Model).primitives[0].material;
materialpSphere8.diffuse = 1;
materialpSphere8.specular = 1;
materialpSphere8.shininess = 50;

const modelpSphere112 = loader.loadNode('pSphere112_lambert1_0');
const materialpSphere112 = modelpSphere112.getComponentOfType(Model).primitives[0].material;
materialpSphere112.diffuse = 1;
materialpSphere112.specular = 1;
materialpSphere112.shininess = 50;

const modelpSphere5 = loader.loadNode('pSphere5_lambert1_0.001');
const materialpSphere5 = modelpSphere5.getComponentOfType(Model).primitives[0].material;
materialpSphere5.diffuse = 1;
materialpSphere5.specular = 1;
materialpSphere5.shininess = 50;

const modelpSphere3 = loader.loadNode('pSphere3_lambert1_0.001');
const materialSphere3 = modelpSphere3.getComponentOfType(Model).primitives[0].material;
materialSphere3.diffuse = 1;
materialSphere3.specular = 1;
materialSphere3.shininess = 50;

const modelSculpture = loader.loadNode('PM3D_Sphere3D_1:ZBrush_defualt_group_lambert1_0');
const materialSculpture = modelSculpture.getComponentOfType(Model).primitives[0].material;
materialSculpture.diffuse = 1;
materialSculpture.specular = 1;
materialSculpture.shininess = 50;

const modelpSphere117_002 = loader.loadNode('pSphere117_lambert1_0.002');
const materialpSphere117_002 = modelpSphere117_002.getComponentOfType(Model).primitives[0].material;
materialpSphere117_002.diffuse = 1;
materialpSphere117_002.specular = 1;
materialpSphere117_002.shininess = 50;

const modelpSphere117_003 = loader.loadNode('pSphere117_lambert1_0.003');
const materialpSphere117_003 = modelpSphere117_003.getComponentOfType(Model).primitives[0].material;
materialpSphere117_003.diffuse = 1;
materialpSphere117_003.specular = 1;
materialpSphere117_003.shininess = 50;

const modelpSphere160 = loader.loadNode('pSphere160_lambert1_0');
const materialSphere160 = modelpSphere160.getComponentOfType(Model).primitives[0].material;
materialSphere160.diffuse = 1;
materialSphere160.specular = 1;
materialSphere160.shininess = 50;

const modelpSphere130_001 = loader.loadNode('pSphere130_lambert1_0.001');
const materialpSphere130_001 = modelpSphere130_001.getComponentOfType(Model).primitives[0].material;
materialpSphere130_001.diffuse = 1;
materialpSphere130_001.specular = 1;
materialpSphere130_001.shininess = 50;

const modelpSphere152 = loader.loadNode('pSphere152_lambert1_0');
const materialpSphere152 = modelpSphere152.getComponentOfType(Model).primitives[0].material;
materialpSphere152.diffuse = 1;
materialpSphere152.specular = 1;
materialpSphere152.shininess = 50;

const modelpSphere228 = loader.loadNode('pSphere228_lambert1_0');
const materialpSphere228 = modelpSphere228.getComponentOfType(Model).primitives[0].material;
materialpSphere228.diffuse = 1;
materialpSphere228.specular = 1;
materialpSphere228.shininess = 50;

const modelpSphere231 = loader.loadNode('pSphere231_lambert1_0');
const materialpSphere231 = modelpSphere231.getComponentOfType(Model).primitives[0].material;
materialpSphere231.diffuse = 1;
materialpSphere231.specular = 1;
materialpSphere231.shininess = 50;

const modelpSphere177_001 = loader.loadNode('pSphere177_lambert1_0.001');
const materialpSphere177_001 = modelpSphere177_001.getComponentOfType(Model).primitives[0].material;
materialpSphere177_001.diffuse = 1;
materialpSphere177_001.specular = 1;
materialpSphere177_001.shininess = 50;

const modelpSphere180 = loader.loadNode('pSphere180_lambert1_0');
const materialpSphere180 = modelpSphere180.getComponentOfType(Model).primitives[0].material;
materialpSphere180.diffuse = 1;
materialpSphere180.specular = 1;
materialpSphere180.shininess = 50;

const modelpSphere180_001 = loader.loadNode('pSphere180_lambert1_0.001');
const materialpSphere180_001 = modelpSphere180_001.getComponentOfType(Model).primitives[0].material;
materialpSphere180_001.diffuse = 1;
materialpSphere180_001.specular = 1;
materialpSphere180_001.shininess = 50;

const modelpSphere135 = loader.loadNode('pSphere135_lambert1_0');
const materialpSphere135 = modelpSphere135.getComponentOfType(Model).primitives[0].material;
materialpSphere135.diffuse = 1;
materialpSphere135.specular = 1;
materialpSphere135.shininess = 50;

const modelpSphere136 = loader.loadNode('pSphere136_lambert1_0');
const materialpSphere136 = modelpSphere136.getComponentOfType(Model).primitives[0].material;
materialpSphere136.diffuse = 1;
materialpSphere136.specular = 1;
materialpSphere136.shininess = 50;

const modelpSphere160_001 = loader.loadNode('pSphere160_lambert1_0.001');
const materialpSphere160_001 = modelpSphere160_001.getComponentOfType(Model).primitives[0].material;
materialpSphere160_001.diffuse = 1;
materialpSphere160_001.specular = 1;
materialpSphere160_001.shininess = 50;

const modelpSphere151 = loader.loadNode('pSphere151_lambert1_0');
const materialpSphere151 = modelpSphere151.getComponentOfType(Model).primitives[0].material;
materialpSphere151.diffuse = 1;
materialpSphere151.specular = 1;
materialpSphere151.shininess = 50;

// cubes
const modelpCube16 = loader.loadNode('pCube16_lambert1_0');
const materialpCube16 = modelpCube16.getComponentOfType(Model).primitives[0].material;
materialpCube16.diffuse = 1;
materialpCube16.specular = 1;
materialpCube16.shininess = 50;

const modelpCube118 = loader.loadNode('pCube118_lambert1_0');
const materialpCube118 = modelpCube118.getComponentOfType(Model).primitives[0].material;
materialpCube118.diffuse = 1;
materialpCube118.specular = 1;
materialpCube118.shininess = 50;

const modelCube001 = loader.loadNode('Cube.001');
const materialCube001 = modelCube001.getComponentOfType(Model).primitives[0].material;
materialCube001.diffuse = 1;
materialCube001.specular = 1;
materialCube001.shininess = 50;

// bridge
const modelpCube41 = loader.loadNode('pCube41_lambert1_0.003');
const materialpCube41 = modelpCube41.getComponentOfType(Model).primitives[0].material;
materialpCube41.diffuse = 1;
materialpCube41.specular = 1;
materialpCube41.shininess = 50;

const modelCube002 = loader.loadNode('Cube.002');
const materialCube002 = modelCube002.getComponentOfType(Model).primitives[0].material;
materialCube002.diffuse = 1;
materialCube002.specular = 1;
materialCube002.shininess = 50;

const modelCube003 = loader.loadNode('Cube.003');
const materialCube003 = modelCube003.getComponentOfType(Model).primitives[0].material;
materialCube003.diffuse = 1;
materialCube003.specular = 1;
materialCube003.shininess = 50;

const modelCube004 = loader.loadNode('Cube.004');
const materialCube004 = modelCube004.getComponentOfType(Model).primitives[0].material;
materialCube004.diffuse = 1;
materialCube004.specular = 1;
materialCube004.shininess = 50;

const modelCube005 = loader.loadNode('Cube.005');
const materialCube005 = modelCube005.getComponentOfType(Model).primitives[0].material;
materialCube005.diffuse = 1;
materialCube005.specular = 1;
materialCube005.shininess = 50;

const modelCube006 = loader.loadNode('Cube.006');
const materialCube006 = modelCube006.getComponentOfType(Model).primitives[0].material;
materialCube006.diffuse = 1;
materialCube006.specular = 1;
materialCube006.shininess = 50;

const modelCube007 = loader.loadNode('Cube.007');
const materialCube007 = modelCube007.getComponentOfType(Model).primitives[0].material;
materialCube007.diffuse = 1;
materialCube007.specular = 1;
materialCube007.shininess = 50;

const modelCube008 = loader.loadNode('Cube.008');
const materialCube008 = modelCube008.getComponentOfType(Model).primitives[0].material;
materialCube008.diffuse = 1;
materialCube008.specular = 1;
materialCube008.shininess = 50;

const modelCube009 = loader.loadNode('Cube.009');
const materialCube009 = modelCube009.getComponentOfType(Model).primitives[0].material;
materialCube009.diffuse = 1;
materialCube009.specular = 1;
materialCube009.shininess = 50;

const modelCube010 = loader.loadNode('Cube.010');
const materialCube010 = modelCube010.getComponentOfType(Model).primitives[0].material;
materialCube010.diffuse = 1;
materialCube010.specular = 1;
materialCube010.shininess = 50;

const modelCube011 = loader.loadNode('Cube.011');
const materialCube011 = modelCube011.getComponentOfType(Model).primitives[0].material;
materialCube011.diffuse = 1;
materialCube011.specular = 1;
materialCube011.shininess = 50;

const modelCube013 = loader.loadNode('Cube.013');
const materialCube013 = modelCube013.getComponentOfType(Model).primitives[0].material;
materialCube013.diffuse = 1;
materialCube013.specular = 1;
materialCube013.shininess = 50;

const modelCube014 = loader.loadNode('Cube.014');
const materialCube014 = modelCube014.getComponentOfType(Model).primitives[0].material;
materialCube014.diffuse = 1;
materialCube014.specular = 1;
materialCube014.shininess = 50;

const modelCube015 = loader.loadNode('Cube.015');
const materialCube015 = modelCube015.getComponentOfType(Model).primitives[0].material;
materialCube015.diffuse = 1;
materialCube015.specular = 1;
materialCube015.shininess = 50;

const modelCube016 = loader.loadNode('Cube.016');
const materialCube016 = modelCube016.getComponentOfType(Model).primitives[0].material;
materialCube016.diffuse = 1;
materialCube016.specular = 1;
materialCube016.shininess = 50;

const modelpCube13 = loader.loadNode('pCube13_lambert1_0');
const materialpCube13 = modelpCube13.getComponentOfType(Model).primitives[0].material;
materialpCube13.diffuse = 1;
materialpCube13.specular = 1;
materialpCube13.shininess = 50;

const modelpCube13001 = loader.loadNode('pCube13_lambert1_0.001');
const materialpCube13001 = modelpCube13001.getComponentOfType(Model).primitives[0].material;
materialpCube13001.diffuse = 1;
materialpCube13001.specular = 1;
materialpCube13001.shininess = 50;

const modelpCube13002 = loader.loadNode('pCube13_lambert1_0.002');
const materialpCube13002 = modelpCube13002.getComponentOfType(Model).primitives[0].material;
materialpCube13002.diffuse = 1;
materialpCube13002.specular = 1;
materialpCube13002.shininess = 50;

const modelpCube118_001 = loader.loadNode('pCube118_lambert1_0.001');
const materialpCube118_001 = modelpCube118_001.getComponentOfType(Model).primitives[0].material;
materialpCube118_001.diffuse = 1;
materialpCube118_001.specular = 1;
materialpCube118_001.shininess = 50;

const modelpCube17 = loader.loadNode('pCube17_lambert1_0');
const materialpCube17 = modelpCube17.getComponentOfType(Model).primitives[0].material;
materialpCube17.diffuse = 1;
materialpCube17.specular = 1;
materialpCube17.shininess = 50;

const modelpCube68 = loader.loadNode('pCube68_lambert1_0');
const materialpCube68 = modelpCube68.getComponentOfType(Model).primitives[0].material;
materialpCube68.diffuse = 1;
materialpCube68.specular = 1;
materialpCube68. shininess = 50;

const modelpCube111_002 = loader.loadNode('pCube111_lambert1_0.002');
const materialpCube111_002 = modelpCube111_002.getComponentOfType(Model).primitives[0].material;
materialpCube111_002.diffuse = 1;
materialpCube111_002.specular = 1;
materialpCube111_002.shininess = 50;

const modelpCube111_001 = loader.loadNode('pCube111_lambert1_0.001');
const materialpCube111_001 = modelpCube111_001.getComponentOfType(Model).primitives[0].material;
materialpCube111_001.diffuse = 2;
materialpCube111_001.specular = 1;
materialpCube111_001.shininess = 1000;

const modelpCube13_003 = loader.loadNode('pCube13_lambert1_0.003');
const materialpCube13_003 = modelpCube13_003.getComponentOfType(Model).primitives[0].material;
materialpCube13_003.diffuse = 1;
materialpCube13_003.specular = 1;
materialpCube13_003.shininess = 50;

const modelpCube68_001 = loader.loadNode('pCube68_lambert1_0.001');
const materialpCube68_001 = modelpCube68_001.getComponentOfType(Model).primitives[0].material;
materialpCube68_001.diffuse = 1;
materialpCube68_001.specular = 1;
materialpCube68_001.shininess = 50;

const modelpCube80 = loader.loadNode('pCube80_lambert1_0');
const materialpCube80 = modelpCube80.getComponentOfType(Model).primitives[0].material;
materialpCube80.diffuse = 1;
materialpCube80.specular = 1;
materialpCube80.shininess = 50;

const modelpCube78_001 = loader.loadNode('pCube78_lambert1_0.001');
const materialpCube78_001 = modelpCube78_001.getComponentOfType(Model).primitives[0].material;
materialpCube78_001.diffuse = 1;
materialpCube78_001.specular = 1;
materialpCube78_001.shininess = 50;

const modelpCube69 = loader.loadNode('pCube69_lambert1_0');
const materialpCube69 = modelpCube69.getComponentOfType(Model).primitives[0].material;
materialpCube69.diffuse = 1;
materialpCube69.specular = 1;
materialpCube69.shininess = 50;

const modelpCube119 = loader.loadNode('pCube119_lambert1_0');
const materialpCube119 = modelpCube119.getComponentOfType(Model).primitives[0].material;
materialpCube119.diffuse = 1;
materialpCube119.specular = 1;
materialpCube119.shininess = 50;

// cylinders
const modelpCylinder23 = loader.loadNode('pCylinder23_lambert1_0');
const materialpCylinder23 = modelpCylinder23.getComponentOfType(Model).primitives[0].material;
materialpCylinder23.diffuse = 1;
materialpCylinder23.specular = 1;
materialpCylinder23.shininess = 50;

const modelpCylinder21 = loader.loadNode('pCylinder21_lambert1_0');
const materialpCylinder21 = modelpCylinder21.getComponentOfType(Model).primitives[0].material;
materialpCylinder21.diffuse = 1;
materialpCylinder21.specular = 1;
materialpCylinder21.shininess = 50;

const modelpCylinder91 = loader.loadNode('pCylinder91_lambert1_0');
const materialpCylinder91 = modelpCylinder91.getComponentOfType(Model).primitives[0].material;
materialpCylinder91.diffuse = 1;
materialpCylinder91.specular = 1;
materialpCylinder91.shininess = 50;

const modelpCylinder91001 = loader.loadNode('pCylinder91_lambert1_0.001');
const materialpCylinder91001 = modelpCylinder91001.getComponentOfType(Model).primitives[0].material;
materialpCylinder91001.diffuse = 1;
materialpCylinder91001.specular = 1;
materialpCylinder91001.shininess = 50;

const modelpCylinder144 = loader.loadNode('pCylinder144_lambert1_0');
const materialpCylinder144 = modelpCylinder144.getComponentOfType(Model).primitives[0].material;
materialpCylinder144.diffuse = 1;
materialpCylinder144.specular = 1;
materialpCylinder144.shininess = 50;

const modelpCylinder44 = loader.loadNode('pCylinder44_lambert1_0');
const materialpCylinder44 = modelpCylinder44.getComponentOfType(Model).primitives[0].material;
materialpCylinder44.diffuse = 1;
materialpCylinder44.specular = 1;
materialpCylinder44.shininess = 50;

const modelpCylinder43 = loader.loadNode('pCylinder43_lambert1_0');
const materialpCylinder43 = modelpCylinder43.getComponentOfType(Model).primitives[0].material;
materialpCylinder43.diffuse = 1;
materialpCylinder43.specular = 1;
materialpCylinder43.shininess = 50;

const modelpCylinder143 = loader.loadNode('pCylinder143_lambert1_0');
const materialpCylinder143 = modelpCylinder143.getComponentOfType(Model).primitives[0].material;
materialpCylinder143.diffuse = 1;
materialpCylinder143.specular = 1;
materialpCylinder143.shininess = 50;

const modelpCylinder111 = loader.loadNode('pCylinder111_lambert1_0');
const materialpCylinder111 = modelpCylinder111.getComponentOfType(Model).primitives[0].material;
materialpCylinder111.diffuse = 1;
materialpCylinder111.specular = 1;
materialpCylinder111.shininess = 50;

const modelpCylinder49 = loader.loadNode('pCylinder49_lambert1_0');
const materialpCylinder49 = modelpCylinder49.getComponentOfType(Model).primitives[0].material;
materialpCylinder49.diffuse = 1;
materialpCylinder49.specular = 1;
materialpCylinder49.shininess = 50;

const modelpCylinder2 = loader.loadNode('pCylinder2_lambert1_0');
const materialpCylinder2 = modelpCylinder2.getComponentOfType(Model).primitives[0].material;
materialpCylinder2.diffuse = 1;
materialpCylinder2.specular = 1;
materialpCylinder2.shininess = 50;

const modelpCylinder104 = loader.loadNode('pCylinder104_lambert1_0');
const materialpCylinder104 = modelpCylinder104.getComponentOfType(Model).primitives[0].material;
materialpCylinder104.diffuse = 1;
materialpCylinder104.specular = 1;
materialpCylinder104.shininess = 50;

const modelpCylinder143_001 = loader.loadNode('pCylinder143_lambert1_0.001');
const materialpCylinder143_001 = modelpCylinder143_001.getComponentOfType(Model).primitives[0].material;
materialpCylinder143_001.diffuse = 1;
materialpCylinder143_001.specular = 1;
materialpCylinder143_001.shininess = 50;

const modelpCylinder144_001 = loader.loadNode('pCylinder144_lambert1_0.001');
const materialpCylinder144_001 = modelpCylinder144_001.getComponentOfType(Model).primitives[0].material;
materialpCylinder144_001.diffuse = 1;
materialpCylinder144_001.specular = 1;
materialpCylinder144_001.shininess = 50;

const modelpCylinder166_003 = loader.loadNode('pCylinder166_lambert1_0.003');
const materialpCylinder166_003 = modelpCylinder166_003.getComponentOfType(Model).primitives[0].material;
materialpCylinder166_003.diffuse = 1;
materialpCylinder166_003.specular = 1;
materialpCylinder166_003.shininess = 50;

// gold coins
const modelMeshGold0 = loader.loadNode('Mesh_Gold.001_0');
const materialMeshGold0 = modelMeshGold0.getComponentOfType(Model).primitives[0].material;
materialMeshGold0.diffuse = 2;
materialMeshGold0.specular = 1;
materialMeshGold0.shininess = 1000;

const modelMeshGold1 = loader.loadNode('Mesh_Gold.001_0.001');
const materialMeshGold1 = modelMeshGold1.getComponentOfType(Model).primitives[0].material;
materialMeshGold1.diffuse = 2;
materialMeshGold1.specular = 1;
materialMeshGold1.shininess = 1000;

const modelMeshGold2 = loader.loadNode('Mesh_Gold.001_0.002');
const materialMeshGold2 = modelMeshGold2.getComponentOfType(Model).primitives[0].material;
materialMeshGold2.diffuse = 2;
materialMeshGold2.specular = 1;
materialMeshGold2.shininess = 1000;

const modelMeshGold3 = loader.loadNode('Mesh_Gold.001_0.003');
const materialMeshGold3 = modelMeshGold3.getComponentOfType(Model).primitives[0].material;
materialMeshGold3.diffuse = 2;
materialMeshGold3.specular = 1;
materialMeshGold3.shininess = 1000;

const modelMeshGold4 = loader.loadNode('Mesh_Gold.001_0.004');
const materialMeshGold4 = modelMeshGold4.getComponentOfType(Model).primitives[0].material;
materialMeshGold4.diffuse = 2;
materialMeshGold4.specular = 1;
materialMeshGold4.shininess = 1000;

const modelMeshGold001_005 = loader.loadNode('Mesh_Gold.001_0.005');
const materialMeshGold001_005 = modelMeshGold001_005.getComponentOfType(Model).primitives[0].material;
materialMeshGold001_005.diffuse = 2;
materialMeshGold001_005.specular = 1;
materialMeshGold001_005.shininess = 1000;

const modelMeshGold009 = loader.loadNode('Mesh_Gold.001_0.009');
const materialMeshGold009 = modelMeshGold009.getComponentOfType(Model).primitives[0].material;
materialMeshGold009.diffuse = 2;
materialMeshGold009.specular = 1;
materialMeshGold009.shininess = 1000;

const modelMeshGold010 = loader.loadNode('Mesh_Gold.001_0.010');
const materialMeshGold010 = modelMeshGold010.getComponentOfType(Model).primitives[0].material;
materialMeshGold010.diffuse = 2;
materialMeshGold010.specular = 1;
materialMeshGold010.shininess = 1000;

// Mesh_Gold.001_0.011
const modelMeshGold011 = loader.loadNode('Mesh_Gold.001_0.011');
const materialMeshGold011 = modelMeshGold011.getComponentOfType(Model).primitives[0].material;
materialMeshGold011.diffuse = 2;
materialMeshGold011.specular = 1;
materialMeshGold011.shininess = 1000;

// polySurfaces
const modelPolySurface3 = loader.loadNode('polySurface3_lambert1_0');
const materialPolySurface3 = modelPolySurface3.getComponentOfType(Model).primitives[0].material;
materialPolySurface3.diffuse = 1;
materialPolySurface3.specular = 1;
materialPolySurface3. shininess = 50;

const modelpolySurface3 = loader.loadNode('polySurface3_lambert1_0.001');
const materialpolySurface3 = modelpolySurface3.getComponentOfType(Model).primitives[0].material;
materialpolySurface3.diffuse = 1;
materialpolySurface3.specular = 1;
materialpolySurface3.shininess = 50;

// cones
const modelpCone36_001 = loader.loadNode('pCone36_lambert1_0.001');
const materialpCone36_001 = modelpCone36_001.getComponentOfType(Model).primitives[0].material;
materialpCone36_001.diffuse = 1;
materialpCone36_001.specular = 1;
materialpCone36_001.shininess = 50;

// enemies 

const modelEnemy1 = loader.loadNode('Goomba Right Leg.001_Material.001_0.002');
const materialEnemy1 = modelEnemy1.getComponentOfType(Model).primitives[0].material;
materialEnemy1.diffuse = 1;
materialEnemy1.specular = 1;
materialEnemy1.shininess = 50;

const modelEnemy2 = loader.loadNode('sket');
const materialEnemy2 = modelEnemy2.getComponentOfType(Model).primitives[0].material;
materialEnemy2.diffuse = 1;
materialEnemy2.specular = 1;
materialEnemy2.shininess = 50;

const modelEnemy3 = loader.loadNode('Goomba Right Leg.001_Material.001_0.014');
const materialEnemy3 = modelEnemy3.getComponentOfType(Model).primitives[0].material;
materialEnemy3.diffuse = 1;
materialEnemy3.specular = 1;
materialEnemy3.shininess = 50;

const modelEnemy4 = loader.loadNode('Goomba Body.001_Material.001_0.002');
const materialEnemy4 = modelEnemy4.getComponentOfType(Model).primitives[0].material;
materialEnemy4.diffuse = 1;
materialEnemy4.specular = 1;
materialEnemy4.shininess = 50;

const modelEnemy5 = loader.loadNode('Goomba Right Leg.001_Material.001_0.017');
const materialEnemy5 = modelEnemy5.getComponentOfType(Model).primitives[0].material;
materialEnemy5.diffuse = 1;
materialEnemy5.specular = 1;
materialEnemy5.shininess = 50;

const modelEnemy6 = loader.loadNode('Goomba Body.001_Material.001_0.005');
const materialEnemy6 = modelEnemy6.getComponentOfType(Model).primitives[0].material;
materialEnemy6.diffuse = 1;
materialEnemy6.specular = 1;
materialEnemy6.shininess = 50;

const modelEnemy7 = loader.loadNode('Goomba Right Leg.001_Material.001_0.019');
const materialEnemy7 = modelEnemy7.getComponentOfType(Model).primitives[0].material;
materialEnemy7.diffuse = 1;
materialEnemy7.specular = 1;
materialEnemy7.shininess = 50;

const physics = new Physics(scene, camera);
scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }

    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
});

const light = new Node();
light.addComponent(new Transform({
    translation: [-20, 100, 70],
}));
light.addComponent(new Light({
    intensity: 3500,
}));
scene.addChild(light);

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    physics.update(time, dt);
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
}