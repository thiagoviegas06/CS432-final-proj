var canvas;
var gl;
var angle = 0.0;

var objects = [];

class Light{
    constructor(loc,dir,color,alpha,cutoff,type){
    	this.location = loc;
    	this.direction = dir;
    	this.color = color;
    	this.alpha = alpha;
    	this.cutoff = cutoff;
    	this.type = type;
    	this.status = 1;
    }
    turnOff(){this.status = 0;}

    turnOn(){this.status = 1;}
}

class Camera{
    constructor(vrp,u,v,n){
    	this.vrp = vrp;
    	this.u = normalize(u);
    	this.v = normalize(v);
    	this.n = normalize(n);

    	this.projectionMatrix = perspective(90.0,1.0,0.1,100);

    	this.updateCameraMatrix();
    }

    updateCameraMatrix(){
    	let t = translate(-this.vrp[0],-this.vrp[1],-this.vrp[2]);
    	let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
    	this.cameraMatrix = mult(r,t);
    }

    getModelMatrix(){
    	return this.modelMatrix;
    }

    setModelMatrix(mm){
    	this.modelMatrix = mm;
    }
}

var camera1 = new Camera(vec3(0,0.25,5), vec3(1,0,0), normalize(vec3(0,1,0)), normalize(vec3(0,0,1)));
var camera2 = new Camera(vec3(0,5,1), vec3(1,0,0), normalize(vec3(0,0,-1)), normalize(vec3(0,1,0)));
var camera3 = new Camera(vec3(5,0,0), vec3(1,0,0), normalize(vec3(0,1,0)), normalize(vec3(-1,0,0)));

var light1 = new Light(vec3(2,2,2), vec3(-1,-1,-1), vec4(1.0, 0.85, 0.6, 1), 0, 90, 1);


//console.log(light1);
//console.log("CAMERA 1");
//console.log(camera1.cameraMatrix);

class Drawable{
    
    constructor(tx,ty,tz,scale,rotX, rotY, rotZ, diffcolor, speccolor, sh){
    	this.tx = tx;
    	this.ty = ty;
    	this.tz = tz;
    	this.scale = scale;
    	this.modelRotationX = rotX;
    	this.modelRotationY = rotY;
    	this.modelRotationZ = rotZ;
    	this.updateModelMatrix();

    	this.matDiffColor = diffcolor;
    	this.matSpecColor = speccolor;
    	this.matAlpha = sh;


    }

    updateT(deltaX, deltaY, deltaZ) {
        //console.log("Updating translation:", deltaX, deltaY, deltaZ);
    
        if (isNaN(deltaX) || isNaN(deltaY) || isNaN(deltaZ)) {
            console.error("NaN detected in updateT inputs!");
            return;
        }
    
        this.tx = deltaX;
        this.ty = deltaY;
        this.tz = deltaZ;
    
        this.updateModelMatrix();
        return 1;
    }
    

    updateModelMatrix(){
        let t = translate(this.tx, this.ty, this.tz);

    	let s = scale(this.scale,this.scale,this.scale);

    	let rx = rotateX(this.modelRotationX);
    	let ry = rotateY(this.modelRotationY);
    	let rz = rotateZ(this.modelRotationZ);

	this.modelMatrix = mult(t,mult(s,mult(rz,mult(ry,rx))));



    }

    getModelMatrix(){
      	return this.modelMatrix;
    }

    setModelMatrix(mm){
       	this.modelMatrix = mm;
    }

    isMirror(){
        return false;
    }
}

let sign = 1; // Declare sign globally
let up = 0, down = 0;
let time = 0;
let realtime = 0;

let flock = [];
let destinations = [];
const radius = 5; 
const height = 5;  
const numPoints = 12; 

for (let i = 0; i < numPoints; i++) {
    let angle = (i / numPoints) * 2 * Math.PI; // Angle in radians
    let x = radius * Math.cos(angle);
    let z = radius * Math.sin(angle);
    destinations.push(vec3(x, height, z));
}

function balloonAnimation(deltaTime) {
    time += deltaTime ;
    realtime += deltaTime;

    //console.log("time", time);
    //console.log("realtime", realtime);  

    let y = 0; 

    
    if (realtime > 20) {
        sign *= -1;  
        realtime = 0;
    }

    let radius = 0.009 + Math.sin(time) * 0.005;
    let x = Math.cos(time) * radius *0.1 ;
    let z = Math.sin(time) * radius * 0.1; 

    y = Math.sin(time*Math.PI*0.1) * 0.0025;  // Smooth up and down oscillation


    //console.log("y", y);    

    balloon.updateObjPosition(x, y, z);
}

let cur = 0; // Current destination index (shared across all birds)
let curDest = destinations[cur]; // Current destination (shared across all birds)

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
  


function birdFlight(deltaTime) {
    const threshold = 0.5;
    const separationDistance = 1.0;
    const noiseStrength = 0.025;

    for (let i = 0; i < flock.length; i++) {
        let bird = flock[i];
        let speed = getRandomArbitrary(0.4, 0.65);
        let curPos = bird.getObjPosition();
        let curPosXYZ = vec3(curPos[0][3], curPos[1][3], curPos[2][3]);
        let diff = subtract(curDest, curPosXYZ);

        if (length(diff) < threshold) {
            cur++;
            if (cur >= destinations.length) {
                cur = 0;
            }
            curDest = destinations[cur];
            diff = subtract(curDest, curPosXYZ);
        }

        
        let dir = normalize(diff);
        let separationForce = separation(bird, flock, separationDistance);

        
        let desiredDirection = add(dir, separationForce);
        dir = normalize(desiredDirection);

        let noisyDir = vec3(
            dir[0] + (Math.random() - 0.5) * noiseStrength,
            dir[1] + (Math.random() - 0.5) * noiseStrength,
            dir[2] + (Math.random() - 0.5) * noiseStrength
        );
        noisyDir = normalize(noisyDir);
        

        let moveFactor = speed * deltaTime;
        let move = vec3(noisyDir[0] * moveFactor, dir[1] * moveFactor, noisyDir[2] * moveFactor);
        let newPos = add(curPosXYZ, move);
        let velocity = subtract(newPos, curPosXYZ);
        let forward = normalize(velocity);

        let rotation = lookAt(curPosXYZ, curDest, vec3(0, 1, 0));
        let angles = extractRotationAngles(rotation);
        
        bird.updateModelMatrix(newPos[0], newPos[1], newPos[2], 0.125, angles.rx *2*Math.PI, angles.ry*2*Math.PI, angles.rz*2*Math.PI);
        
    }
}

function extractRotationAngles(matrix) {
    
    let right = vec3(matrix[0][0], matrix[0][1], matrix[0][2]); // First row
    let up = vec3(matrix[1][0], matrix[1][1], matrix[1][2]);    // Second row
    let fwd = vec3(-matrix[2][0], -matrix[2][1], -matrix[2][2]); // Third row (negated)

    // Calculate yaw (ry) from the forward vector
    let ry = Math.atan2(fwd[0], fwd[2]);
    //console.log("ry", ry);

    // Calculate pitch (rx) from the fwd vector
    let rx = -Math.atan2(fwd[1], Math.sqrt(fwd[0] * fwd[0] + fwd[2] * fwd[2]));
    //console.log("rx", rx);

    // Calculate roll (rz) from the right and up vectors
    let rz = Math.atan2(right[1], up[1]);
    //console.log("rz", rz);

    return { rx, ry, rz };
}

function separation(bird, flock, separationDistance) {
    let steer = vec3(0, 0, 0); 
    let count = 0; 
    let positionMatrix = bird.getObjPosition();
    let position = vec3(positionMatrix[0][3], positionMatrix[1][3], positionMatrix[2][3]);
    //console.log("bird position");
    //console.log(position);

    for (let other of flock) {
        if (other !== bird) { 
            let otherBirdPos = other.getObjPosition();
            let otherPosition = vec3(otherBirdPos[0][3], otherBirdPos[1][3], otherBirdPos[2][3]);
            //console.log("other position");
            //console.log(otherPosition);
            let distance = length(subtract(position, otherPosition));

           // console.log(distance); 

            if (distance > 0 && distance < separationDistance) {
                
                let diff = subtract(position, otherPosition);
                diff = normalize(diff);
                let updateDiff = vec3((1/distance)* diff[0],(1/distance)* diff[1], (1/distance)* diff[2]); 
                steer = add(steer, updateDiff);
                count++;
            }
        }
    }

    // Average the separation force
    if (count > 0) {
        steer = vec3(steer[0] * (1/count), steer[1] * (1/count), steer[2] * (1/count));
    }

    return steer;
}


var tri;

var fakeSkybox;
var plane; 
var goal;
var cylinder;
var hat;
var mirror;
var mirrorFrame;
var planes = [];

var house;
var tree1;
var tree2;

var balloon,bird;

var then = 0.0;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

	var camera1Position = camera1.vrp;
    var pos = vec3(camera1Position[0],camera1Position[1],camera1Position[2]);
    var rot = vec3(0,0,0);
    var scale = 1.0;
    var diffcolor = vec4(0.0,1.0,0.0,1.0);
    var diffcolor2 = vec4(1.0,1.0,1.0,1.0);
    var speccolor = vec4(1.0,1.0,1.0,1.0);
    var shine = 2.0; 


    tri = new Cube(pos[0],pos[1],pos[2],scale,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);
    fakeSkybox = new Cube(1,0.5,1,10,0,0,0,diffcolor2,speccolor,shine);
    objects.push(tri);

    objects.push(fakeSkybox);


    var rotY = 57*Math.PI ;


    balloon = new ObjParser("./models/ballon/balloon.obj", 2,2,0, 0.0025, 0,0,0, diffcolor2,speccolor,shine/2, "./models/ballon/html-color-codes-color-palette-generators-hero.jpg");
    

    cylinder = new Cylinder3D(0,0.5,0,0.5,0,0,0,diffcolor2,speccolor,shine); 
    //plane = new Plane3D(0,-0.1,0,2,0,0,0, diffcolor,speccolor, shine);

    var firstX = 0;
    var firstZ = 0;

    for(let i = -10; i <= 10; i+=2){
        for(let j = -10; j <= 10; j+=2){
            let curPlane =  new Plane3D(firstX + i, -0.25, firstZ + j, 1, 0, 0, 0, diffcolor, speccolor, shine);
            planes.push(curPlane);
        } 
    }

    for(let i = 0; i < planes.length; i++){
        objects.push(planes[i]);
    }

    for(let b = 0; b < 5; b++){
        for(let i = 0; i < 2; i++){
            bird = new ObjParser("./models/bird/BirdRender_obj.obj", -5 - b, 3, i, 0.125,0,0,0,diffcolor, speccolor, shine, "./models/bird/SparrowAO.png");
            flock.push(bird);
            objects.push(bird);
        }
    }

    for(let i = 0; i < 40; i++){
        let x = getRandomArbitrary(-5,-2);
        let z = getRandomArbitrary(-5,5);
        let x2 = getRandomArbitrary(5,2);
        tree1 = new ObjParser("./models/Palm/Palm_01.obj", x,-0.1,z,0.025,0,0,0,diffcolor,speccolor,shine, "./models/Palm/VL1X8_002.png");
        tree2 = new ObjParser("./models/Palm/Palm_01.obj", x2,-0.1,z,0.025,0,0,0,diffcolor,speccolor,shine, "./models/Palm/VL1X8_002.png");

        objects.push(tree1);
        objects.push(tree2);
    }

    hat = new TowerHat(0,1.75,0,0.5,0,0,0,diffcolor2, speccolor, shine);
    mirror = new Mirror(1,0.5,0.95,0.5,-5,0,0,diffcolor2,speccolor,shine);
    mirrorFrame = new ObjParser("./models/frame/SM_frame_01.obj", 1,0.0,0.9,0.05,0,0,0,diffcolor2,speccolor,shine, "./models/frame/FrameTexture.png");
    tree = new ObjParser("./models/Palm/Palm_01.obj", -2,0,0,0.025,0,0,0,diffcolor,speccolor,shine, "./models/Palm/VL1X8_002.png");
   
    //objects.push(plane);
    objects.push(balloon);
    objects.push(cylinder); 
    objects.push(hat);
    //objects.push(bird);
    //objects.push(house);
    objects.push(mirror);
    objects.push(mirrorFrame);

 
    requestAnimationFrame(render);
    
};

function rotateAroundV(theta){
	let M = rotate(theta, camera1.v); 
	let n = camera1.n;
	var tempN = normalize(mult(M,vec4(n[0],n[1],n[2],0.0)));
	let u = camera1.u;
	var tempU = normalize(mult(M,vec4(u[0],u[1],u[2],0.0)));

	camera1.n = vec3(tempN[0], tempN[1], tempN[2]);
	camera1.u = vec3(tempU[0], tempU[1], tempU[2]);
}

let currentCamera = camera1;
function myfunction(event){
    switch (event.code){
        case "KeyW":
            if(currentCamera === camera1){
                let newX = camera1.vrp[0]-(0.25)*camera1.n[0];
                let newY = camera1.vrp[1]-(0.25)*camera1.n[1];
                let newZ = camera1.vrp[2]-(0.25)*camera1.n[2];
                let newPosition = vec3(newX, newY, newZ);

                camera1.vrp = newPosition;
                tri.updateT(newX,newY,newZ);
                camera1.updateCameraMatrix();
               
            }
            break;
        case "KeyS":
            if(currentCamera === camera1){
                let newSX = camera1.vrp[0]+(0.25)*camera1.n[0];
                let newSY = camera1.vrp[1]+(0.25)*camera1.n[1];
                let newSZ = camera1.vrp[2]+(0.25)*camera1.n[2];
                
                let newPositionS = vec3(newSX, newSY, newSZ);
                camera1.vrp = newPositionS;
                tri.updateT(newSX,newSY,newSZ);
                camera1.updateCameraMatrix();
               
            }
            break;
        case "KeyA":
            if(currentCamera === camera1){

                let newAX = camera1.vrp[0]-(0.25)*camera1.u[0];
                let newAY = camera1.vrp[1]-(0.25)*camera1.u[1];
                let newAZ = camera1.vrp[2]-(0.25)*camera1.u[2];

                let newPositionA = vec3(newAX,newAY ,newAZ );
                camera1.vrp = newPositionA;
                tri.updateT(newAX,newAY,newAZ);
                camera1.updateCameraMatrix(camera1);
               
            }
            break;
            
        case "KeyD":
            if(currentCamera === camera1){
                let newDX = camera1.vrp[0]+(0.25)*camera1.u[0];
                let newDY = camera1.vrp[1]+(0.25)*camera1.u[1];
                let newDZ = camera1.vrp[2]+(0.25)*camera1.u[2];

                let newPositionD = vec3(newDX, newDY, newDZ);
                camera1.vrp = newPositionD;
                tri.updateT(newDX, newDY,newDZ);
                camera1.updateCameraMatrix();
               
            }
            break;

        case "KeyQ":
            if(currentCamera === camera1){
                rotateAroundV(1);
                camera1.updateCameraMatrix();
                
            }
			break;
        case "KeyE":
            if(currentCamera === camera1){
                rotateAroundV(-1);
                camera1.updateCameraMatrix();
                
            }
			break;
        case "Space":
    
            if(currentCamera === camera1){
                currentCamera = camera2;
                let camera2Position = camera2.vrp;

                tri.updateT(camera2Position[0],camera2Position[1],camera2Position[2]);
                //console.log("switching to camera 2");
            }else{
                currentCamera = camera1;
                let camera1Position = camera1.vrp;
                tri.updateT(camera1Position[0],camera1Position[1],camera1Position[2]);
                //console.log("switching to camera 1");
            }
            
            break;
        case "KeyP":
            if(currentCamera === camera1){
                tri.updateT(0,0,1);
                //console.log("this is tri mondels\n"); 
                //console.log(tri.modelMatrix);
                
            }
            break;
    }

   
}

window.addEventListener("keydown", myfunction);

function render(now){

    now = now*0.001;
    var deltaTime = now - then;
    then = now;

    


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(let i = 0; i < objects.length; i++){
        if(i !== 1){
            objects[i].draw(currentCamera);
        }
        
    }

    balloonAnimation(deltaTime);
    birdFlight(deltaTime); 
    
	
   

    requestAnimationFrame(render);
}


