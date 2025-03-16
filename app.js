var canvas;
var gl;
var angle = 0.0;

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

var camera1 = new Camera(vec3(0,0,7), vec3(1,0,0), normalize(vec3(0,1,0)), normalize(vec3(0,0,1)));
var camera2 = new Camera(vec3(0,5,1), vec3(1,0,0), normalize(vec3(0,0,-1)), normalize(vec3(0,1,0)));

var light1 = new Light(vec3(0,2,0),vec3(0,-1,-0),vec4(0.75,0.75,0.75,1),0,45,1);

console.log(light1);

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
        console.log("Updating translation:", deltaX, deltaY, deltaZ);
    
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

	console.log(this.modelMatrix);

    }

    getModelMatrix(){
      	return this.modelMatrix;
    }

    setModelMatrix(mm){
       	this.modelMatrix = mm;
    }
}

var tri;
var plane; 
var goal;
var cylinder;
var hat;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

	
    var pos = vec3(0,-2,2);
    var rot = vec3(0,0,0);
    var scale = 1.0;
    var diffcolor = vec4(0.0,1.0,0.0,1.0);
    var diffcolor2 = vec4(1.0,1.0,1.0,1.0);
    var speccolor = vec4(1.0,1.0,1.0,1.0);
    var shine = 5.0; 
    tri = new Cube(pos[0],pos[1],pos[2],scale,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);

    var rotY = 57*Math.PI ;

    goal = new ObjParser("./models/soccerGoal.obj", 1, 0,1, 0.005, 0,rotY,0, diffcolor2,speccolor,shine/2);

    //penguin = new SMFModel("./models/bound-cow.smf",diffcolor2,speccolor,shine);

    cylinder = new Cylinder3D(0,0,0,0.5,0,0,0,diffcolor2,speccolor,shine); 
    plane = new Plane3D(0,-0.2,0,10,0,0,0, diffcolor,speccolor, shine);
    hat = new TowerHat(0,1.25,0,0.5,0,0,0,diffcolor2, speccolor, shine);


    render(camera1);
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
                render(camera1); 
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
                render(camera1); 
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
                render(camera1); 
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
                render(camera1); 
            }
            break;

        case "KeyQ":
            if(currentCamera === camera1){
                rotateAroundV(1);
                camera1.updateCameraMatrix();
                render(camera1);
            }
			break;
        case "KeyE":
            if(currentCamera === camera1){
                rotateAroundV(-1);
                camera1.updateCameraMatrix();
                render(camera1);
            }
			break;
        case "Space":
    
            if(currentCamera === camera1){
                currentCamera = camera2;
                console.log("switching to camera 2");
            }else{
                currentCamera = camera1;
                console.log("switching to camera 1");
            }
            render(currentCamera); 
            break;
        case "KeyP":
            if(currentCamera === camera1){
                tri.updateT(0,0,1);
                console.log("this is tri mondels\n"); 
                console.log(tri.modelMatrix);
                render(currentCamera); 
            }
            break;
    }

   
}

function render(camera){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    tri.draw(camera);
    plane.draw(camera);
    //goal.draw(camera); 
	//penguin.draw(camera1);
    cylinder.draw(camera); 
    hat.draw(camera); 
	window.addEventListener("keydown", myfunction);
}


