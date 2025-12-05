
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var addSplineButton = document.getElementById("addSpline");
var deleteAllSplinesButton = document.getElementById("deleteSplines");
var ensureContinuityButton = document.getElementById("ensureContinuity");
var ensureSmoothnesButton = document.getElementById("ensureSmoothness");
var points = [];
var patches = [[]];
var index = 0;
var controlPointsToDraw = [];
var selectedCurve = null;
var curveToEdit = null;
var isDragging = false;
var pointToMove = null;
var wasDragging = false;
var addedSpline = false;
var lastUpdateTime = 0;


// EventListener on click
canvas.addEventListener('click', (coordinates) => {
    const rect = canvas.getBoundingClientRect();
    const x = coordinates.clientX - rect.left;
    const y = coordinates.clientY - rect.top;
    // console.log(x + " " + y);
    // console.log(index);
    selectedCurve = findCurveNearPoint(x, y);
    curveToEdit = findCurveNearPoint(x, y);

    if (selectedCurve || wasDragging) {
        wasDragging = false;
        console.log("Curve found!!!");
        
    }
    else { 
        ctx.strokeStyle = 'black';

        points.push([x, y]);

        if (!patches[index]) {
            patches[index] = [];
        }

        if (points.length % 4 == 0) {
            patches[index].push([...points]);
            console.log("Curve added to spline " + (index + 1));
            controlPointsToDraw.push(points[0]);
            controlPointsToDraw.push(points[3]);
            ensureContinuity();
            ensureSmoothness();
            points = [points[3]];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (points.length == 5) {
                var element = points[points.length-1];
                points = [points[3]];
                points.push(element);
            }
        }
        // console.log("Points length: " + points.length);
    }
    
    drawCanvas();
});


canvas.addEventListener('mousedown', (event) => {
    if (patches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    curveToEdit = findCurveNearPoint(x, y);
    if (curveToEdit) {
        pointToMove = findNearestPoint(x, y);
        }
    if(curveToEdit) {
        isDragging = true;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // console.log("Trying to move curve!");
    drawCanvas();
});


canvas.addEventListener('mousemove', (event) => { 
    
    if (isDragging && curveToEdit) {
        var now = Date.now();
        if (now - lastUpdateTime < 16) return; 
        lastUpdateTime = now;
        const rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        const offsetX = x - pointToMove[0];
        const offsetY = y - pointToMove[1];

        for (let i = 0; i < patches.length; i++) {
            patches[i].forEach((patch) => {
                if (patch === curveToEdit) {
                    for (let j = 0; j < patch.length; j++) {
                        if (patch[j][0] === pointToMove[0] && patch[j][1] === pointToMove[1]) {

                            patch[j][0] += offsetX;
                            patch[j][1] += offsetY;

                            
                        }
                    }
                }
            }); 
        }
        pointToMove[0] = x;
        pointToMove[1] = y;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // console.log("Trying to move curve!");
        drawCanvas();
        wasDragging = true;
    }
    
});


canvas.addEventListener('mouseup', () => {
    isDragging = false;
    curveToEdit = null;
    pointToMove = null;
});



document.addEventListener('keydown', (event) => {
    if (event.key == 'Delete') { 
        if (selectedCurve) { 
            for (let i = 0; i < patches.length; i += 1) {
                const indexOfPatch = patches[i].indexOf(selectedCurve); 
                if (indexOfPatch != -1) {
                    var patchesToAdd = patches[i].splice(indexOfPatch + 1)
                    patches[i].splice(indexOfPatch);
                    index += 1;
                    patches[index] = [];
                    patches[index].push(...patchesToAdd);                    
                   
                    
                    points = [];
                    selectedCurve = null; 
                    
                    drawCanvas(); 
                    console.log("Curve deleted!");
                    break;
                }
            }
        }
        points = controlPointsToDraw.slice(-1);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCanvas(); 

    }
});


addSplineButton.addEventListener('click', () => {
    if(index == 0 && patches.length > 0)
        index += 1;
    if(patches[index]) {
        index += 1;
    }
    points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCanvas();
    console.log("Added spline " + (index+1));
});


ensureContinuityButton.addEventListener('click', () => {
    ensureContinuity();
    console.log("Continuity ensured!");
});


ensureSmoothnesButton.addEventListener('click', () => {
    ensureSmoothness();
    console.log("Smoothness ensured!");
});


deleteAllSplinesButton.addEventListener('click', () => {
    points = [];
    patches = [[]];
    controlPointsToDraw = [];
    index = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCanvas();
    console.log("All splines have been deleted!");
});




function findNearestPoint(x, y) {
    if (!curveToEdit || curveToEdit.length === 0) return null;

    let nearestPoint = curveToEdit[0];
    let minDistance = Math.sqrt((nearestPoint[0] - x) ** 2 + (nearestPoint[1] - y) ** 2);

    for (let i = 1; i < curveToEdit.length; i++) {
        const currentPoint = curveToEdit[i];
        const distance = Math.sqrt((currentPoint[0] - x) ** 2 + (currentPoint[1] - y) ** 2);
        if (distance < minDistance) {
            minDistance = distance;
            nearestPoint = currentPoint;
        }
    }

    return nearestPoint;
}


function findCurveNearPoint(x, y) {
    if (patches.length == 0) return null;

    const threshold = 10; 
    
    for (let i = 0; i < patches.length; i += 1) {   
        for (let patch of patches[i]) { 
            for (let t = 0; t <= 1; t += 0.01) { 
                const point = deCasteljau(patch, t);
                const distance = Math.sqrt((point[0] - x) ** 2 + (point[1] - y) ** 2);
                if (distance < threshold) {
                    return patch;
                }
            }
        }
    }

    return null;
}


function ensureContinuity() {
    for (let i = 0; i < patches.length; i++) {
        for (let j = 0; j < patches[i].length - 1; j++) {
            const currentCurve = patches[i][j];
            const nextCurve = patches[i][j + 1];

            const p3 = currentCurve[3];  
            const p2 = currentCurve[2];  

            const p1 = nextCurve[1];     
            const p0 = nextCurve[0];     
            
            p0[0] = p3[0];
            p0[1] = p3[1];

            
            const dx = p3[0] - p2[0];
            const dy = p3[1] - p2[1];

            const distance = Math.sqrt(dx * dx + dy * dy); 

            const scale = 0.5; 

            p1[0] = p0[0] + scale * dx / distance;
            p1[1] = p0[1] + scale * dy / distance;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCanvas();
}


function ensureSmoothness() {
    for (let i = 0; i < patches.length; i++) {
        for (let j = 0; j < patches[i].length - 1; j++) {
            const currentCurve = patches[i][j];
            const nextCurve = patches[i][j + 1];

            const p3 = currentCurve[3];  
            const p2 = currentCurve[2];  

            const p1 = nextCurve[1];     
            const p0 = nextCurve[0];     

            
            const dx = p3[0] - p2[0];
            const dy = p3[1] - p2[1];

            
            p0[0] = p3[0];
            p0[1] = p3[1];

            
            p1[0] = p0[0] + dx;
            p1[1] = p0[1] + dy;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCanvas();
}


// Algorithm de Casteljau
function lerp(start, end, t) {
    return start + (end - start) * t;
}


function deCasteljau(controlPoints, t) {
    var points = [...controlPoints]; 
    
    while (points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
            var x = lerp(points[i][0], points[i + 1][0], t);
            var y = lerp(points[i][1], points[i + 1][1], t);
            points[i] = [x, y];
        }
        points.pop(); 
    }
    
    return points[0];
}


// Drawing functions
function drawCurve(controlPoints) {
    const step = 0.01;
    ctx.fillStyle = "#04AA6D";
    const x = controlPoints[0][0];
    const y = controlPoints[0][1];
    const x1 = controlPoints[3][0];
    const y1 = controlPoints[3][1];
    drawPoint(x, y);
    drawPoint(x1, y1);

    if(selectedCurve == controlPoints)
        ctx.strokeStyle = "red";
    else
        ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(controlPoints[0][0], controlPoints[0][1]);

    for (let i = step; i <= 1; i += step) {
        const point = deCasteljau(controlPoints, i); 
        ctx.lineTo(point[0], point[1]); 
    }
    ctx.stroke();
}



function drawCanvas() {
    ctx.fillStyle = "#04AA6D";
    for(let i = 0; i < points.length; i += 1) {
        var x = points[i][0];
        var y = points[i][1];
        drawPoint(x, y);
    }

    if (!patches.length) {
        return;
    }

    ctx.fillStyle = "black";
    
    for (let i = 0; i < patches.length; i++) {
        patches[i].forEach((patch) => {
            if (patch == selectedCurve) {
                ctx.strokeStyle = 'red';
            }
            else {
                ctx.strokeStyle = 'black';
            }

            drawCurve(patch);
        });
    }
}


function drawPoint(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}


// Helping functions
function printPatches(patches) {
    console.log(JSON.stringify(patches, null, 2));
}
