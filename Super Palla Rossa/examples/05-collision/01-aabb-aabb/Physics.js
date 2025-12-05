import { vec3, mat4 } from 'glm';
import { getGlobalModelMatrix } from 'engine/core/SceneUtils.js';
import { Transform } from 'engine/core.js';
import {GUI} from 'dat';


export class Physics {

    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.cameraOffset = [0, 6, 8];
        this.coinCount = 0;
        this.starCount = 0;
        this.enemies = 0;
        this.unavailableCoin = false;

        this.timerDuration = 100; 
        this.timer = this.timerDuration; 
        
        this.gui = new GUI();
        this.gui.add(this, 'coinCount').name('Coins').listen();
        this.gui.add(this,'starCount').name('Stars').listen();
        this.gui.add(this,'enemies').name('Enemies killed').listen();
 
        
        this.gui.domElement.style.position = 'absolute';
        this.gui.domElement.style.top = '10px';
        this.gui.domElement.style.left = '10px';
        this.gui.domElement.style.color = 'white';
        this.gui.domElement.style.fontSize = '20px';

        this.timerElement = document.createElement('div');
        this.timerElement.style.position = 'absolute';
        this.timerElement.style.top = '10px';
        this.timerElement.style.left = '50%';
        this.timerElement.style.transform = 'translateX(-50%)';
        this.timerElement.style.color = 'white';
        this.timerElement.style.fontSize = '20px';
        this.timerElement.style.fontWeight = 'bold';
        this.timerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.timerElement.style.padding = '5px 10px';
        this.timerElement.style.borderRadius = '5px';
        this.timerElement.innerHTML = `Time Left: ${this.formatTime(this.timer)}`;
        document.body.appendChild(this.timerElement);

    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    update(t, dt) {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.Death();
        }

        this.timerElement.innerHTML = `Time Left: ${this.formatTime(this.timer)}`;

        this.scene.traverse(node => {
            if (node.isDynamic) {

                node.isOnLadder = false;
                node.isGrounded = false;

                this.scene.traverse(other => {
                    if (node !== other && (other.isStatic || other.isEnemy)) {

                        this.resolveCollision(node, other);
                    }
                });
                
                    
                this.updateCameraPosition(node, this.cameraOffset);
            }
            else if (node.isEnemy && !node.skipRender) {
                
                const transform = node.getComponentOfType(Transform);
                if (!transform) return;

                const position = transform.translation;
                const target = node.targetPoint;

                const direction = vec3.sub(vec3.create(), target, position);
                const distance = vec3.length(direction);
                //console.log(direction);
                
                vec3.normalize(direction, direction);
                
                vec3.scaleAndAdd(position, position, direction, node.speed * dt);

                // console.log(distance);
                
                if (distance < 0.6) {
                    
                    node.targetPoint = vec3.equals(target, node.pointA) ? node.pointB : node.pointA;
                    //console.log(node.pointA);
                }
            }
        });

    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    getTransformedAABB(node) {
        // Transform all vertices of the AABB from local to global space
        const matrix = getGlobalModelMatrix(node);
        const { min, max } = node.aabb;
        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, matrix));

        // Find new min and max by component
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }

    Death() {
        if (this.timerElement) {
            this.timerElement.remove();
        }
        window.location.href = "you-died.html";
    }
    
    Won() {
        window.location.href = "won.html";
    }

    Heaven() {
        window.location.href = "heaven.html";
    }
   

    resolveCollision(a, b) {
        // Get global space AABBs
        const aBox = this.getTransformedAABB(a);
        const bBox = this.getTransformedAABB(b);
        

        // Check if there is collision
        const isColliding = this.aabbIntersection(aBox, bBox);
        if (!isColliding || b.skipRender) {
            return;
        }


        if (b.isLadder) {
            a.isOnLadder = true;
            a.isGrounded = true;
        }
        else if (b.isButton) {
            b.skipRender = true;
            b.object.skipRender = false;
            const button = document.getElementById('button');
             if (button) {
                 button.currentTime = 0; 
                 button.play().catch(error => {
                     console.warn("Failed to play sound:", error);
                 });
             } else {
             console.error("Button sound element not found!");
             }
        }
        else if (b.isDoor) {
            const targetTransform = b.object.getComponentOfType(Transform);
            const playerTransform = a.getComponentOfType(Transform);
            
            playerTransform.translation = [
                targetTransform.translation[0],
                targetTransform.translation[1],
                targetTransform.translation[2] + 5
            ];
        }

    
        else if (b.isCoin) {

            b.skipRender = true;
             const coinSound = document.getElementById('coinSound');
             if (coinSound) {
                 coinSound.currentTime = 0; 
                 coinSound.play().catch(error => {
                     console.warn("Failed to play coin sound:", error);
                 });
             } else {
             console.error("Coin sound element not found!");
             }
             
             if(b.hiddenCoin) {
                this.unavailableCoin = true;
             }

             this.coinCount += 1;
        }
        else if (b.isStar) {
            b.skipRender = true;

            const starSound = document.getElementById('starSound');
            if (starSound) {
                starSound.currentTime = 0; 
                starSound.play().catch(error => {
                    console.warn("Failed to play star sound:", error);
                });
            } else {
            console.error("Star sound element not found!");
            }
            
            this.starCount += 1;
            
        }

        else if (b.isWinningStar) {
            if (this.starCount >= 2 && this.coinCount >= 10 && this.enemies >= 5 && this.unavailableCoin) {
                b.skipRender = true;

                const starSound = document.getElementById('starSound');
                if (starSound) {
                    starSound.currentTime = 0; 
                    starSound.play().catch(error => {
                        console.warn("Failed to play star sound:", error);
                    });
                } else {
                console.error("Star sound element not found!");
                }
        
                console.log("won");
                this.Won();
            }
            else {
                console.log("collect more stuff! :)");
            }
        }

        else if (b.ground) {
            console.log("Vo rajot ste!");
            this.Heaven();
        }
        
        else {
            // Move node A minimally to avoid collision
            const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
            const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);


            let minDiff = Infinity;
            let minDirection = [0, 0, 0];
            if (diffa[1] >= 0 && diffa[1] < minDiff) {
                minDiff = diffa[1];
                minDirection = [0, minDiff, 0];
                
            }
            if (diffa[0] >= 0 && diffa[0] < minDiff) {
                minDiff = diffa[0];
                minDirection = [minDiff, 0, 0];
            }
            if (diffa[2] >= 0 && diffa[2] < minDiff) {
                minDiff = diffa[2];
                minDirection = [0, 0, minDiff];
            }
            if (diffb[0] >= 0 && diffb[0] < minDiff) {
                minDiff = diffb[0];
                minDirection = [-minDiff, 0, 0];
            }
            if (diffb[1] >= 0 && diffb[1] < minDiff) {
                minDiff = diffb[1];
                minDirection = [0, -minDiff, 0];
            }
            if (diffb[2] >= 0 && diffb[2] < minDiff) {
                minDiff = diffb[2];
                minDirection = [0, 0, -minDiff];
            }
            
            const upVector = [0, 1, 0];
            const dotProduct = vec3.dot(vec3.normalize(vec3.create(), minDirection), upVector);
            if (dotProduct > 0.98) {
                if (b.isTopDoor) {
                    const targetTransform = b.object.getComponentOfType(Transform);
                    const playerTransform = a.getComponentOfType(Transform);
                    
                    playerTransform.translation = [
                        targetTransform.translation[0],
                        targetTransform.translation[1],
                        targetTransform.translation[2] + 4
                    ];
                    return;
                }
                else if (b.isEnemy) {
                    b.skipRender = true;
                    console.log(b.name);
                    const Goomba = document.getElementById('Goomba');
                    if (Goomba) {
                        Goomba.currentTime = 0; 
                        Goomba.play().catch(error => {
                        console.warn("Failed to play sound:", error);
                    });
                    } else {
                        console.error("Goomba element not found!");
                    }
                    this.enemies += 1
                }

                a.isGrounded = true;
                this.velocityY = 0;
            }
            else{
                if(b.isEnemy){
                    console.log("dead");
                    this.Death();
                }        
                    
            }

            

            const transform = a.getComponentOfType(Transform);
            if (!transform) {
                return;
            }

            vec3.add(transform.translation, transform.translation, minDirection);

            
        }
    }


    updateCameraPosition(player, cameraOffset) {
        const transform = player.getComponentOfType(Transform);
        if (transform) {
            const cameraTransform = this.camera.getComponentOfType(Transform);
            vec3.add(cameraTransform.translation, transform.translation, cameraOffset);
        }
    }
}
