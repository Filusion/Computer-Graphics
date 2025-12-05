import { quat, vec3, mat4 } from 'glm';

import { Transform } from '../core/Transform.js';

export class FirstPersonController {

    constructor(node, domElement, {
        pitch = 0,
        yaw = 0,
        velocity = [0, 0, 0],
        acceleration = 50,
        velocityY = 0,
        maxSpeed = 5,
        decay = 0.99999,
        pointerSensitivity = 0.002,
        climbSpeed = 3
    } = {}) {
        this.node = node;
        this.domElement = domElement;

        this.keys = {};

        this.pitch = pitch;
        this.yaw = yaw;

        this.velocity = velocity;
        this.velocityY = velocityY;

        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        this.decay = decay;
        this.pointerSensitivity = pointerSensitivity;
        this.climbSpeed = climbSpeed;

        this.isOnLadder = false;

        this.initHandlers();
    }

    initHandlers() {
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);
        doc.addEventListener('keyup', this.keyupHandler);

        element.addEventListener('click', e => element.requestPointerLock());
        doc.addEventListener('pointerlockchange', e => {
            if (doc.pointerLockElement === element) {
                doc.addEventListener('pointermove', this.pointermoveHandler);
            } else {
                doc.removeEventListener('pointermove', this.pointermoveHandler);
            }
        });
    }

    update(t, dt) {

        // Calculate forward and right vectors.
        const cos = Math.cos(this.yaw);
        const sin = Math.sin(this.yaw);
        // const forward = [-sin, 0, -cos];
        // const right = [cos, 0, -sin];
        const forward = [0, 0, -1];
        const right = [1, 0, 0];
        const acc = vec3.create();

        if (this.node.isGrounded) this.velocityY = 0;

        
        const GRAVITY = -9;  
        const JUMP_STRENGTH = 7;

        const transform = this.node.getComponentOfType(Transform);
        if (!transform) return;

        if (this.node.isOnLadder) {
            
            this.velocity = [0, 0, 0];
            if (this.keys['KeyW']) {
                transform.translation[1] += dt * this.climbSpeed;
                vec3.add(acc, acc, forward);
                vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);
            }
            if (this.keys['KeyS']) {
                transform.translation[1] -= dt * this.climbSpeed;
            }

            
            if (this.keys['Space']) {
                this.node.isOnLadder = false;

                const pushBackForce = 0.5;
                // const forward = this.getCameraForward();
                const pushBackDirection = [-forward[0], 1, -forward[2]];

                vec3.normalize(pushBackDirection, pushBackDirection);
                vec3.scaleAndAdd(transform.translation, transform.translation, pushBackDirection, pushBackForce);
            }

            return;
        }
    
        // Map user input to the acceleration vector.
        //const acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }
    
        // Update horizontal velocity based on acceleration.
        vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);
    
        // Apply decay when there is no input.
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            const decay = Math.exp(dt * Math.log(1 - this.decay));
            vec3.scale(this.velocity, this.velocity, decay);
        }
    
        // Limit speed.
        const speed = vec3.length(this.velocity);
        if (speed > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
        }

        if (this.keys['Space'] && this.node.isGrounded) {
            this.velocityY = JUMP_STRENGTH;
            this.node.isGrounded = false;
        }
        
        // Apply gravity
        this.velocityY += GRAVITY * dt;
    
        // Update position
        if (transform) {
            // Update horizontal translation
            vec3.scaleAndAdd(transform.translation, transform.translation, this.velocity, dt);
    
            // Update vertical translation
            transform.translation[1] += this.velocityY * dt;

    
            // Update rotation based on the Euler angles.
            const rotation = quat.create();
            quat.rotateY(rotation, rotation, this.yaw);
            quat.rotateX(rotation, rotation, this.pitch);
            transform.rotation = rotation;
        }

    }
    
    // getCameraForward() {
    //     const cosYaw = Math.cos(this.yaw);
    //     const sinYaw = Math.sin(this.yaw);
    //     return [-sinYaw, 0, -cosYaw]; // Forward vector in the XZ plane (ignoring Y)
    // }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.pointerSensitivity;
        this.yaw   -= dx * this.pointerSensitivity;

        const twopi = Math.PI * 2;
        const halfpi = Math.PI / 2;

        this.pitch = Math.min(Math.max(this.pitch, -halfpi), halfpi);
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}
