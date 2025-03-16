class ObjParser{
	constructor(fname,tx,ty,tz,sc,rotX, rotY, rotZ, diffcolor, speccolor, sh) {
		ObjParser.matDiffColor = diffcolor;
		ObjParser.matSpecColor = speccolor;
		ObjParser.matAlpha = sh;
	
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
		ObjParser.vertices = finalVertices;

		//update model matrix:

		let t = translate(tx,ty,tz);
		let s = scale(sc, sc, sc);
		let rx = rotateX(rotX);
		let ry = rotateY(rotY);
		let rz = rotateZ(rotZ);


		ObjParser.modelMatrix = mult(t, mult(s, mult(rz, mult(ry, rx))));

		ObjParser.initialize();
		//ObjParser.initializeTexture(); 
	}
	
    static vertices = [];
    static normals  = [];
	static textures = [];

    static modelMatrix = -1;
    
    static positionBuffer = -1;
    static normalBuffer   = -1;
	//static textureBuffer  = -1;

    static aPositionShader = -1;
	static aNormalShader = -1;
	//static aTextCoordShader = -1;
   
    static uModelMatrixShader = -1;
	static uCameraMatrixShader = -1;
	static uProjectionMatrixShader = -1;

	static uMatDiffColorShader = -1;
    static uMatSpecColorShader = -1;
    static uMatAlphaShader = -1;

    static uLightDirectionShader = -1;
    static uLightColorShader = -1;

	//static texture = -1;

    static initialize(){
        ObjParser.shaderProgram = initShaders( gl, "/vshader2.glsl", "/fshader2.glsl");

        //Index Buffer
        ObjParser.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ObjParser.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(ObjParser.vertices), gl.STATIC_DRAW);

		//Normal Buffer
		ObjParser.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ObjParser.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(ObjParser.vertices), gl.STATIC_DRAW);

		//Texture Buffer
		/*
		ObjParser.textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ObjParser.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(ObjParser.vertices), gl.STATIC_DRAW);*/
	
        ObjParser.aPositionShader  = gl.getAttribLocation( ObjParser.shaderProgram, "aPosition" );
		ObjParser.aNormalShader    = gl.getAttribLocation( ObjParser.shaderProgram, "aNormal" );
		//ObjParser.aTextCoordShader = gl.getAttribLocation( ObjParser.shaderProgram, "aTexCoord" );

        ObjParser.uModelMatrixShader = gl.getUniformLocation( ObjParser.shaderProgram, "modelMatrix" );
		ObjParser.uCameraMatrixShader = gl.getUniformLocation( ObjParser.shaderProgram, "cameraMatrix" );
		ObjParser.uProjectionMatrixShader = gl.getUniformLocation( ObjParser.shaderProgram, "projectionMatrix" );

		ObjParser.uMatDiffColorShader = gl.getUniformLocation( ObjParser.shaderProgram, "matDiffColor" );
		ObjParser.uMatSpecColorShader = gl.getUniformLocation( ObjParser.shaderProgram, "matSpecColor" );
		ObjParser.uMatAlphaShader = gl.getUniformLocation( ObjParser.shaderProgram, "matAlpha" );
		ObjParser.uTextureUnitShader = gl.getUniformLocation(ObjParser.shaderProgram, "textureSampler");

		ObjParser.uLightDirectionShader = gl.getUniformLocation( ObjParser.shaderProgram, "lightDirection" );
		ObjParser.uLightColorShader = gl.getUniformLocation( ObjParser.shaderProgram, "lightColor" );

    }


    draw(camera1) {
		/*
		TODO
		*/

        gl.useProgram(ObjParser.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, ObjParser.positionBuffer);
		gl.bindBuffer( gl.ARRAY_BUFFER, ObjParser.normalBuffer);
		//gl.bindBuffer( gl.ARRAY_BUFFER, ObjParser.textureBuffer);

        gl.vertexAttribPointer(ObjParser.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
		gl.vertexAttribPointer(ObjParser.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
		//gl.vertexAttribPointer(ObjParser.aTextCoordShader, 2, gl.FLOAT, false, 0 ,0 );
		
        gl.uniformMatrix4fv(ObjParser.uModelMatrixShader, false, flatten(ObjParser.modelMatrix));
        gl.uniformMatrix4fv(ObjParser.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(ObjParser.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

		gl.uniform4fv(ObjParser.uMatDiffColorShader, ObjParser.matDiffColor);
		gl.uniform4fv(ObjParser.uMatSpecColorShader, ObjParser.matSpecColor);
		gl.uniform1f(ObjParser.uMatAlphaShader, ObjParser.matAlpha);

		gl.uniform3fv(ObjParser.uLightDirectionShader, light1.direction);
		gl.uniform4fv(ObjParser.uLightColorShader, light1.color);
        
        gl.enableVertexAttribArray(ObjParser.aPositionShader);
		gl.enableVertexAttribArray(ObjParser.aNormalShader);
		//gl.enableVertexAttribArray(ObjParser.aTextCoordShader);

        gl.drawArrays(gl.TRIANGLES, 0, ObjParser.vertices.length	);

        gl.disableVertexAttribArray(ObjParser.aPositionShader);
		gl.disableVertexAttribArray(ObjParser.aNormalShader);
		//gl.disableVertexAttribArray(ObjParser.aTextCoordShader);
    }
}