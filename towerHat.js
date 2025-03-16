class TowerHat extends Drawable{
	static vertexPositions = [];

    static shaderProgram = -1;
    static positionBuffer = -1;
    
    static aPositionShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;

    static uMatDiffColorShader = -1;
    static uMatSpecColorShader = -1;
    static uMatAlphaShader = -1;

    static uLightDirectionShader = -1;
    static uLightColorShader = -1;

    static calculateXZCoord(radius, dividingFactor, yval) {
        let theta = Math.PI / dividingFactor;
    
        // Center of the top circle
        let topCenter = vec3(0, yval, 0); 
        TowerHat.vertexPositions.push(topCenter);
    
        // Generate vertices for the bottom and top circles
        for (let i = 0; i <= 2 * Math.PI; i += theta) {
            let x = radius * Math.cos(i);
            let z = radius * Math.sin(i);
    
            // Bottom circle vertices
            TowerHat.vertexPositions.push(vec3(x, -yval, z));
        }
    
    }

    static divideQuad(a, b, c, d, depth) {
        if (depth>0) {

            var v1 = mult(0.5,add(a,b));
            var v2 = mult(0.5,add(b,c));
            var v3 = mult(0.5,add(c,d));
            var v4 = mult(0.5,add(d,a));
            var v5 = mult(0.5,add(a,c));

            this.divideQuad(a, v1, v5,v4, depth - 1);
            this.divideQuad(v1, b, v2,v5, depth - 1);
            this.divideQuad(v2, c, v3,v5, depth - 1);
            this.divideQuad(v3, d, v4,v5, depth - 1);

        }
        else {

            var indexA = Plane.findVertex(a);
            var indexB = Plane.findVertex(b);
            var indexC = Plane.findVertex(c);
            var indexD = Plane.findVertex(d);
            //Triangle #1
            Plane.indices.push(indexA);
            Plane.indices.push(indexB);
            Plane.indices.push(indexC);
            
            //Triangle #2
            Plane.indices.push(indexC);
            Plane.indices.push(indexD);
            Plane.indices.push(indexA);
        }
    }

    

    static findVertex(vertex){
        var loc = Plane.findIndexInList(vertex);
        if(loc < 0){
            Plane.vertexPositions.push(vertex);
            return Plane.vertexPositions.length -1;
        }else{
            return loc;
        }
    }

    static findIndexInList(vertex) {
        if(vertex in Plane.vertexPositions){
            return Plane.vertexPositions.indexOf(vertex);
        } else {
            return -1; 
        }
        
    }
		
	static initialize() {
        TowerHat.calculateXZCoord(1.1, 10, 1);
        //TowerHat.divideQuad(a, b, c, d, 5);

        TowerHat.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");

        // Load the data into the GPU
        TowerHat.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, TowerHat.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(TowerHat.vertexPositions), gl.STATIC_DRAW );
        
        // Associate our shader variables with our data buffer
        TowerHat.aPositionShader = gl.getAttribLocation( TowerHat.shaderProgram, "aPosition" );
        
        TowerHat.uModelMatrixShader = gl.getUniformLocation( TowerHat.shaderProgram, "modelMatrix" );
        TowerHat.uCameraMatrixShader = gl.getUniformLocation( TowerHat.shaderProgram, "cameraMatrix" );
        TowerHat.uProjectionMatrixShader = gl.getUniformLocation( TowerHat.shaderProgram, "projectionMatrix" );

        TowerHat.uMatDiffColorShader = gl.getUniformLocation( TowerHat.shaderProgram, "matDiffColor" );
        TowerHat.uMatSpecColorShader = gl.getUniformLocation( TowerHat.shaderProgram, "matSpecColor" );
        TowerHat.uMatAlphaShader = gl.getUniformLocation( TowerHat.shaderProgram, "matAlpha" );

        TowerHat.uLightDirectionShader = gl.getUniformLocation( TowerHat.shaderProgram, "lightDirection" );
        TowerHat.uLightColorShader = gl.getUniformLocation( TowerHat.shaderProgram, "lightColor" );
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(TowerHat.shaderProgram == -1)
        TowerHat.initialize()
        
    }
    
    draw(camera) {
        
        gl.useProgram(TowerHat.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, TowerHat.positionBuffer);
        gl.vertexAttribPointer(TowerHat.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.uniformMatrix4fv(TowerHat.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(TowerHat.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(TowerHat.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));
        
        console.log(camera1.projectionMatrix);

        gl.uniform4fv(TowerHat.uMatDiffColorShader, this.matDiffColor);
        gl.uniform4fv(TowerHat.uMatSpecColorShader, this.matSpecColor);
        gl.uniform1f(TowerHat.uMatAlphaShader, this.matAlpha);

        gl.uniform3fv(TowerHat.uLightDirectionShader, light1.direction);
        gl.uniform4fv(TowerHat.uLightColorShader, light1.color);

        gl.enableVertexAttribArray(TowerHat.aPositionShader);    
        gl.drawArrays(gl.TRIANGLE_FAN, 0, TowerHat.vertexPositions.length);
        gl.disableVertexAttribArray(TowerHat.aPositionShader);    
    }
}

