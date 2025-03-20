class ObjParser{
	constructor(fname,tx,ty,tz,sc,rotX, rotY, rotZ, diffcolor, speccolor, sh, texturePath) {
		this.matDiffColor = diffcolor;
		this.matSpecColor = speccolor;
		this.matAlpha = sh;
		this.texturePath = texturePath;
	
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
		this.textureCoords = [];
		this.normals = [];
		this.texture = -1;
		this.shaderProgram = -1;
		this.positionBuffer = -1;
		this.normalBuffer   = -1;
		this.textureBuffer  = -1;

		this.aPositionShader = -1;
		this.aNormalShader = -1;
		this.aTextCoordShader = -1;
	
		this.uModelMatrixShader = -1;
		this.uCameraMatrixShader = -1;
		this.uProjectionMatrixShader = -1;

		//this.uMatDiffColorShader = -1;
		this.uMatSpecColorShader = -1;
		this.uMatAlphaShader = -1;

		this.uLightDirectionShader = -1;
		this.uLightColorShader = -1;


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
						if(objNormals.length === 0)
						{
							finalNormals.push(objPositions[vIndex]);
						}
						else
						{
							finalNormals.push(objNormals[vnIndex]);
						}
						
					}
					break;
			}
		}
	
		// Store final buffers
		this.vertices = finalVertices;
		this.textureCoords = finalTextures;
		this.normals = finalNormals;

		//update model matrix:

		let t = translate(tx,ty,tz);
		let s = scale(sc, sc, sc);
		let rx = rotateX(rotX);
		let ry = rotateY(rotY);
		let rz = rotateZ(rotZ);


		this.modelMatrix = mult(t, mult(s, mult(rz, mult(ry, rx))));
		if(this.shaderProgram == -1)
		{
			this.initialize();
			this.initializeTexture(); 
		}
		
	}
	
    

    initialize(){

        this.shaderProgram = initShaders( gl, "./vshaders/vshader2.glsl", "./fshaders/fshader2.glsl");

        //Index Buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

		//Normal Buffer
		this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

		//Texture Buffer
		
		this.textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.textureCoords), gl.STATIC_DRAW);
	
        this.aPositionShader  = gl.getAttribLocation( this.shaderProgram, "aPosition" );
		this.aNormalShader    = gl.getAttribLocation( this.shaderProgram, "aNormal" );
		this.aTextCoordShader = gl.getAttribLocation( this.shaderProgram, "aTexCoord" );

        this.uModelMatrixShader = gl.getUniformLocation( this.shaderProgram, "modelMatrix" );
		this.uCameraMatrixShader = gl.getUniformLocation( this.shaderProgram, "cameraMatrix" );
		this.uProjectionMatrixShader = gl.getUniformLocation( this.shaderProgram, "projectionMatrix" );

		//this.uMatDiffColorShader = gl.getUniformLocation( this.shaderProgram, "matDiffColor" );
		this.uMatSpecColorShader = gl.getUniformLocation( this.shaderProgram, "matSpecColor" );
		this.uMatAlphaShader = gl.getUniformLocation( this.shaderProgram, "matAlpha" );
		this.uTextureUnitShader = gl.getUniformLocation(this.shaderProgram, "textureSampler");

		this.uLightDirectionShader = gl.getUniformLocation( this.shaderProgram, "lightDirection" );
		this.uLightColorShader = gl.getUniformLocation( this.shaderProgram, "lightColor" );

    }

	isMirror(){
		return false;
	}

 	initializeTexture(){
		/*this.textures = [];
		this.texturePath.forEach(path => {
			let imagePlane = new Image();

			imagePlane.onload = function(){
				let newTexture = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, newTexture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, imagePlane.width, imagePlane.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePlane);
				
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
				console.log(this.textures);
				console.log(newTexture);
				this.textures.push(newTexture);
			}
		
			imagePlane.src = path;
		});*/
		var imageObj = new Image();
		
		//var tempTexture = this.texture;
		imageObj.objectRef = this;
		imageObj.onload = function(){
			//console.log(tempTexture);
			this.objectRef.texture = gl.createTexture();
			
			gl.bindTexture(gl.TEXTURE_2D, this.objectRef.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, imageObj.width, imageObj.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageObj);
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		}
		//console.log(this.texture);
		//console.log(this.texturePath);
		imageObj.src = this.texturePath;
	}

	

    draw(camera1) {
		/*
		TODO
		*/
		console.log(this.texture);
		if(this.texture == -1)  //only draw when texture is loaded.
        	return;

        gl.useProgram(this.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer);
		gl.vertexAttribPointer(this.aTextCoordShader, 2, gl.FLOAT, false, 0 ,0 );
		
		gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uTextureUnitShader,2);

        gl.uniformMatrix4fv(this.uModelMatrixShader, false, flatten(this.modelMatrix));


		
        gl.uniformMatrix4fv(this.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(this.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

		//gl.uniform4fv(this.uMatDiffColorShader, this.matDiffColor);
		gl.uniform4fv(this.uMatSpecColorShader, this.matSpecColor);
		gl.uniform1f(this.uMatAlphaShader, this.matAlpha);

		gl.uniform3fv(this.uLightDirectionShader, light1.direction);
		gl.uniform4fv(this.uLightColorShader, light1.color);
        
        gl.enableVertexAttribArray(this.aPositionShader);
		gl.enableVertexAttribArray(this.aNormalShader);
		gl.enableVertexAttribArray(this.aTextCoordShader);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length	);

        gl.disableVertexAttribArray(this.aPositionShader);
		gl.disableVertexAttribArray(this.aNormalShader);
		gl.disableVertexAttribArray(this.aTextCoordShader);
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