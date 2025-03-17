class Cube extends Drawable{
    static vertexPositions = [
    	vec3(-0.5,-0.5,0.5),
    	vec3(-0.5,0.5,0.5),
    	vec3(0.5,0.5,0.5),
    	vec3(0.5,-0.5,0.5),
    	vec3(-0.5,-0.5,-0.5),
    	vec3(-0.5,0.5,-0.5),
    	vec3(0.5,0.5,-0.5),
    	vec3(0.5,-0.5,-0.5),
    ];

    static textureCoords = [];

    static indices = [
        0,3,2,
        0,2,1,
        2,3,7,
        2,7,6,
        0,4,7,
        0,7,3,
        1,2,6,
        1,6,5,
        4,5,6,
        4,6,7,
        0,1,5,
        0,5,4
    ];

    static positionBuffer = -1;
    static indexBuffer = -1;

    static shaderProgram = -1;
    static aPositionShader = -1;
    static aNormalShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;

    static uMatDiffColorShader = -1;
    static uMatSpecColorShader = -1;
    static uMatAlphaShader = -1;

    static texture = -1;
	static loadedImages = 0;
	
    static uTextureUnitShader = -1;
    //static textureCoordBuffer = -1;
   // static aTextureCoordShader = -1; 


    static initialize() {
        //Cube.computeNormals();
    	Cube.shaderProgram = initShaders( gl, "./vshaders/skyVshader.glsl", "./fshaders/skyFshader.glsl");

		// Load the data into the GPU
		Cube.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cube.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Cube.vertexPositions), gl.STATIC_DRAW );

        /*Cube.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Cube.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Cube.textureCoords), gl.STATIC_DRAW );*/

        Cube.uTextureUnitShader = gl.getUniformLocation(Cube.shaderProgram, "uTextureUnit");

		Cube.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Cube.indices), gl.STATIC_DRAW );

		// Associate our shader variables with our data buffer
		Cube.aPositionShader = gl.getAttribLocation( Cube.shaderProgram, "aPosition" );
        //Cube.aTextureCoordShader = gl.getAttribLocation( Cube.shaderProgram, "aTextureCoord" );

		Cube.uModelMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "modelMatrix" );
		Cube.uCameraMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "cameraMatrix" );
		Cube.uProjectionMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "projectionMatrix" );


    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(Cube.shaderProgram == -1){
            Cube.initialize(); 
            Cube.initializeTexture();
        }
            

    }


    static initializeTexture() {
		var images = [
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, src: "./textures/sky-top.jpg"},
			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, src: "./textures/sky-bottom.jpg", },
			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, src: "./textures/sky-left.jpg" },
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, src: "./textures/sky-right.jpg" },
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, src: "./textures/sky-front.jpg" },
			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, src: "./textures/sky-back.jpg"}
		];
	
		Cube.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
	
		
	
		images.forEach(function(imageInfo) {
			var img = new Image();
			img.onload = function() {
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
				gl.texImage2D(imageInfo.target, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
	
				Cube.loadedImages++;
				if (Cube.loadedImages === images.length) {
					// All images have loaded, set texture parameters once
					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	
					// Optionally, generate mipmaps if needed
					gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
				}
			};
			img.src = imageInfo.src;
		});
	}
    

    draw(camera) {
        if(Cube.texture == -1)  //only draw when texture is loaded.
        	return;

		if(Cube.loadedImages < 6)
			return; 

        gl.useProgram(Cube.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, Cube.positionBuffer);
       	gl.vertexAttribPointer(Cube.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

        //gl.bindBuffer( gl.ARRAY_BUFFER, Cube.textureCoordBuffer);
       	//gl.vertexAttribPointer(Cube.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
		gl.uniform1i(Cube.uTextureUnitShader, 0);

		gl.uniformMatrix4fv(Cube.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Cube.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
		gl.uniformMatrix4fv(Cube.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);

		gl.enableVertexAttribArray(Cube.aPositionShader);
        //gl.enableVertexAttribArray(Cube.aTextureCoordShader);
		gl.disable(gl.DEPTH_TEST);
		
		gl.drawElements(gl.TRIANGLES, Cube.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Cube.aPositionShader);
		gl.enable(gl.DEPTH_TEST);

        //gl.disableVertexAttribArray(Cube.aTextureCoordShader);
    	
    }
}

