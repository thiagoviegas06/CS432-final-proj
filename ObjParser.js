class ObjParser{
	constructor(fname,tx,ty,tz,sc,rotX, rotY, rotZ, diffcolor, speccolor, sh) {
		this.matDiffColor = diffcolor;
		this.matSpecColor = speccolor;
		this.matAlpha = sh;
	
		var f = loadFileAJAX(fname);
		var lines = f.split('\n');
	
		// Store original OBJ data
		const objPositions = [];
		const objTexcoords = [];
		const objNormals = [];
	
		// Store final indexed data for WebGL
		const finalVertices = [];
		const finalNormals  = [];
		const finalTextures = [];
		this.vertices = [];
		this.modelMatrix = -1;
	
		for (let line of lines) {
			let strings = line.trim().split(/\s+/);
			if (strings.length === 0) continue;
	
			switch (strings[0]) {
				case 'v': // Position
					objPositions.push([
						parseFloat(strings[1]),
						parseFloat(strings[2]),
						parseFloat(strings[3])
					]);
					break;
	
				case 'vt': // Texture Coordinates
					objTexcoords.push([
						parseFloat(strings[1]),
						parseFloat(strings[2])
					]);
					break;
	
				case 'vn': // Normals
					objNormals.push([
						parseFloat(strings[1]),
						parseFloat(strings[2]),
						parseFloat(strings[3])
					]);
					break;
	
				case 'f': // Faces
					for (let i = 1; i <= 3; i++) { 
						let indicesStr = strings[i].split('/');
						let vIndex = parseInt(indicesStr[0]) - 1;
						let vtIndex = parseInt(indicesStr[1]) - 1;
						let vnIndex = parseInt(indicesStr[2])- 1 ;

						finalVertices.push(objPositions[vIndex]);
						finalTextures.push(objTexcoords[vtIndex]);
						finalNormals.push(objNormals[vnIndex]);
					}
					break;
			}
		}
	
		// Store final buffers
		this.vertices = finalVertices;

		//update model matrix:

		let t = translate(tx,ty,tz);
		let s = scale(sc, sc, sc);
		let rx = rotateX(rotX);
		let ry = rotateY(rotY);
		let rz = rotateZ(rotZ);


		this.modelMatrix = mult(t, mult(s, mult(rz, mult(ry, rx))));

		this.initialize();
		//this.initializeTexture(); 
	}
	
    

    initialize(){
		
		this.normals  = [];
		this.textures = [];

		
		
		this.positionBuffer = -1;
		this.normalBuffer   = -1;
		//this.textureBuffer  = -1;

		this.aPositionShader = -1;
		this.aNormalShader = -1;
		//this.aTextCoordShader = -1;
	
		this.uModelMatrixShader = -1;
		this.uCameraMatrixShader = -1;
		this.uProjectionMatrixShader = -1;

		this.uMatDiffColorShader = -1;
		this.uMatSpecColorShader = -1;
		this.uMatAlphaShader = -1;

		this.uLightDirectionShader = -1;
		this.uLightColorShader = -1;

		//this.texture = -1;
        this.shaderProgram = initShaders( gl, "./vshaders/vshader2.glsl", "./fshaders/fshader2.glsl");

        //Index Buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

		//Normal Buffer
		this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

		//Texture Buffer
		/*
		this.textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);*/
	
        this.aPositionShader  = gl.getAttribLocation( this.shaderProgram, "aPosition" );
		this.aNormalShader    = gl.getAttribLocation( this.shaderProgram, "aNormal" );
		//this.aTextCoordShader = gl.getAttribLocation( this.shaderProgram, "aTexCoord" );

        this.uModelMatrixShader = gl.getUniformLocation( this.shaderProgram, "modelMatrix" );
		this.uCameraMatrixShader = gl.getUniformLocation( this.shaderProgram, "cameraMatrix" );
		this.uProjectionMatrixShader = gl.getUniformLocation( this.shaderProgram, "projectionMatrix" );

		this.uMatDiffColorShader = gl.getUniformLocation( this.shaderProgram, "matDiffColor" );
		this.uMatSpecColorShader = gl.getUniformLocation( this.shaderProgram, "matSpecColor" );
		this.uMatAlphaShader = gl.getUniformLocation( this.shaderProgram, "matAlpha" );
		this.uTextureUnitShader = gl.getUniformLocation(this.shaderProgram, "textureSampler");

		this.uLightDirectionShader = gl.getUniformLocation( this.shaderProgram, "lightDirection" );
		this.uLightColorShader = gl.getUniformLocation( this.shaderProgram, "lightColor" );

    }

	isMirror(){
		return false;
	}


    draw(camera1) {
		/*
		TODO
		*/

        gl.useProgram(this.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer);
		//gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer);

        gl.vertexAttribPointer(this.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer(this.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
		//gl.vertexAttribPointer(this.aTextCoordShader, 2, gl.FLOAT, false, 0 ,0 );
		
        gl.uniformMatrix4fv(this.uModelMatrixShader, false, flatten(this.modelMatrix));

        gl.uniformMatrix4fv(this.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(this.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

		gl.uniform4fv(this.uMatDiffColorShader, this.matDiffColor);
		gl.uniform4fv(this.uMatSpecColorShader, this.matSpecColor);
		gl.uniform1f(this.uMatAlphaShader, this.matAlpha);

		gl.uniform3fv(this.uLightDirectionShader, light1.direction);
		gl.uniform4fv(this.uLightColorShader, light1.color);
        
        gl.enableVertexAttribArray(this.aPositionShader);
		gl.enableVertexAttribArray(this.aNormalShader);
		//gl.enableVertexAttribArray(this.aTextCoordShader);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length	);

        gl.disableVertexAttribArray(this.aPositionShader);
		gl.disableVertexAttribArray(this.aNormalShader);
		//gl.disableVertexAttribArray(this.aTextCoordShader);
    }


	updateObjPosition(tx,ty,tz){
		let t = translate(tx,ty,tz);
		this.modelMatrix = mult(t, this.modelMatrix);
	}

	getObjPosition(){
		return this.modelMatrix;
	}

	updateModelMatrix(tx, ty, tz, sc, modelRotationX, modelRotationY, modelRotationZ){
        let t = translate(tx, ty, tz);

    	let s = scale(sc,sc,sc);

    	let rx = rotateX(modelRotationX);
    	let ry = rotateY(modelRotationY);
    	let rz = rotateZ(modelRotationZ);

		this.modelMatrix = mult(t,mult(s,mult(rz,mult(ry,rx))));
    }


}