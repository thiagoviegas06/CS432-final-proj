class Cylinder3D extends Drawable{
	static vertexPositions = [];
    static indices = [];
    static textureCoords = []; 

    static shaderProgram = -1;
    static positionBuffer = -1;
    static uTextureUnitShader = -1; 

    static textureBuffer = -1;
    static indexBuffer = -1;
    static aPositionShader = -1;
    static aTextureCoordShader = -1; 

    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;

    static uMatDiffColorShader = -1;
    static uMatSpecColorShader = -1;
    static uMatAlphaShader = -1;

    static uLightDirectionShader = -1;
    static uLightColorShader = -1;

    static texture = -1; 

    static calculateXZCoord(radius, dividingFactor, yval) {
        let theta = Math.PI / dividingFactor;
    
        // Center of the bottom circle
        let bottomCenter = vec3(0, -yval, 0); 
        Cylinder3D.vertexPositions.push(bottomCenter);
        Cylinder3D.textureCoords.push(vec2(0.5, 0.5));
    
        // Center of the top circle
        let topCenter = vec3(0, yval, 0); 
        Cylinder3D.vertexPositions.push(topCenter);
        Cylinder3D.textureCoords.push(vec2(0.5, 0.5));
    
        // Generate vertices for the bottom and top circles
        for (let i = 0; i < 2 * Math.PI; i += theta) {
            let x = radius * Math.cos(i);
            let z = radius * Math.sin(i);
    
            // Bottom circle vertices
            Cylinder3D.vertexPositions.push(vec3(x, -yval, z));
            Cylinder3D.textureCoords.push(vec2(i / (2 * Math.PI), 0));
    
            // Top circle vertices
            Cylinder3D.vertexPositions.push(vec3(x, yval, z));
            Cylinder3D.textureCoords.push(vec2(i / (2 * Math.PI), 1));
        }
    
        let vertexArraySize = Cylinder3D.vertexPositions.length;
    
        // Generate indices for the bottom circle
        for (let j = 2; j < vertexArraySize; j += 2) {
            let val0 = 0; // Bottom center
            let val1 = j;
            let val2 = j + 2;
            if (val2 >= vertexArraySize) {
                val2 = 2;
            }
    
            Cylinder3D.indices.push(val0);
            Cylinder3D.indices.push(val1);
            Cylinder3D.indices.push(val2);
        }
    
        // Generate indices for the top circle
        for (let j = 3; j < vertexArraySize; j += 2) {
            let val0 = 1; // Top center
            let val1 = j;
            let val2 = j + 2;
            if (val2 >= vertexArraySize) {
                val2 = 3;
            }
    
            Cylinder3D.indices.push(val0);
            Cylinder3D.indices.push(val1);
            Cylinder3D.indices.push(val2);
        }
    
        // Generate indices for the side walls
        for (let j = 2; j < vertexArraySize - 2; j += 2) {
            let val0 = j;
            let val1 = j + 1;
            let val2 = j + 2;
    
            Cylinder3D.indices.push(val0);
            Cylinder3D.indices.push(val1);
            Cylinder3D.indices.push(val2);
    
            let val3 = j + 1;
            let val4 = j + 2;
            let val5 = j + 3;
    
            Cylinder3D.indices.push(val3);
            Cylinder3D.indices.push(val4);
            Cylinder3D.indices.push(val5);
        }

    }

    /*

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
*/
    static initializeTexture(){
        var image = new Image();

        image.onload = () => {
            Cylinder3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, Cylinder3D.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }

        image.src = "./textures/brickpixels.jpg";
    }
		
	static initialize() {
        Cylinder3D.calculateXZCoord(1, 10, 1.5);
        Cylinder3D.initializeTexture(); 
        //Cylinder3D.divideQuad(a, b, c, d, 5);

        Cylinder3D.shaderProgram = initShaders( gl, "./vshaders/vshaderPlane.glsl", "./fshaders/fshaderPlane.glsl");

        // Load the data into the GPU
        Cylinder3D.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder3D.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Cylinder3D.vertexPositions), gl.STATIC_DRAW );

        //INDEX BUFFER
        Cylinder3D.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cylinder3D.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Cylinder3D.indices), gl.STATIC_DRAW );

        //Texture Buffer
        Cylinder3D.textureBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder3D.textureBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Cylinder3D.textureCoords), gl.STATIC_DRAW );
        
        // Associate our shader variables with our data buffer
        Cylinder3D.aPositionShader = gl.getAttribLocation( Cylinder3D.shaderProgram, "aPosition" );
        Cylinder3D.aTextureCoordShader = gl.getAttribLocation( Cylinder3D.shaderProgram, "aTextureCoord" );
        Cylinder3D.uTextureUnitShader = gl.getUniformLocation(Cylinder3D.shaderProgram, "uTextureUnit");
        
        
        Cylinder3D.uModelMatrixShader = gl.getUniformLocation( Cylinder3D.shaderProgram, "modelMatrix" );
        Cylinder3D.uCameraMatrixShader = gl.getUniformLocation( Cylinder3D.shaderProgram, "cameraMatrix" );
        Cylinder3D.uProjectionMatrixShader = gl.getUniformLocation( Cylinder3D.shaderProgram, "projectionMatrix" );

        //Cylinder3D.uMatDiffColorShader = gl.getUniformLocation( Cylinder3D.shaderProgram, "matDiffColor" );
        Cylinder3D.uMatSpecColorShader = gl.getUniformLocation( Cylinder3D.shaderProgram, "matSpecColor" );
        Cylinder3D.uMatAlphaShader = gl.getUniformLocation( Cylinder3D.shaderProgram, "matAlpha" );

        Cylinder3D.uLightDirectionShader = gl.getUniformLocation( Cylinder3D.shaderProgram, "lightDirection" );
        Cylinder3D.uLightColorShader = gl.getUniformLocation( Cylinder3D.shaderProgram, "lightColor" );
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(Cylinder3D.shaderProgram == -1)
        Cylinder3D.initialize()
        
    }
    
    draw(camera) {

        if(Cylinder3D.texture == -1)  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(Cylinder3D.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder3D.positionBuffer);
        gl.vertexAttribPointer(Cylinder3D.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.uniformMatrix4fv(Cylinder3D.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Cylinder3D.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(Cylinder3D.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));

        gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder3D.textureBuffer);
       	gl.vertexAttribPointer(Cylinder3D.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Cylinder3D.texture);
        gl.uniform1i(Cylinder3D.uTextureUnitShader,0);
        console.log(camera1.projectionMatrix);

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cylinder3D.indexBuffer);

        //gl.uniform4fv(Cylinder3D.uMatDiffColorShader, this.matDiffColor);
        gl.uniform4fv(Cylinder3D.uMatSpecColorShader, this.matSpecColor);
        gl.uniform1f(Cylinder3D.uMatAlphaShader, this.matAlpha);

        gl.uniform3fv(Cylinder3D.uLightDirectionShader, light1.direction);
        gl.uniform4fv(Cylinder3D.uLightColorShader, light1.color);

        gl.enableVertexAttribArray(Cylinder3D.aPositionShader); 
        gl.enableVertexAttribArray(Cylinder3D.aTextureCoordShader);   
        gl.drawElements(gl.TRIANGLES, Cylinder3D.indices.length, gl.UNSIGNED_INT, 0);
        gl.disableVertexAttribArray(Cylinder3D.aPositionShader);
        gl.disableVertexAttribArray(Cylinder3D.aTextureCoordShader);      
    }
}

