class Plane3D extends Drawable{
	static vertexPositions = [];
    static vertexTextureCoords = [];

    static shaderProgram = -1;
    static positionBuffer = -1;
    static aPositionShader = -1;
    static textureCoordBuffer = -1;
    static aTextureCoordShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;

    //static uMatDiffColorShader = -1;
    static uMatSpecColorShader = -1;
    static uMatAlphaShader = -1;

    static uLightDirectionShader = -1;
    static uLightColorShader = -1;
    static texture = -1;
    static uTextureUnitShader = -1;

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
            //Triangle #1
            Plane3D.vertexPositions.push(a);
            var newTextureCoordinateA = mult(0.5,subtract(vec2(a[0], a[2]), vec2(-1, -1)));
            Plane3D.vertexTextureCoords.push(newTextureCoordinateA);
            Plane3D.vertexPositions.push(b);
            var newTextureCoordinateB = mult(0.5,subtract(vec2(b[0], b[2]), vec2(-1, -1)));
            Plane3D.vertexTextureCoords.push(newTextureCoordinateB);
            Plane3D.vertexPositions.push(c);
            var newTextureCoordinateC = mult(0.5,subtract(vec2(c[0], c[2]), vec2(-1, -1)));
            Plane3D.vertexTextureCoords.push(newTextureCoordinateC);
            
            //Triangle #2
            Plane3D.vertexPositions.push(c);
            Plane3D.vertexTextureCoords.push(newTextureCoordinateC);
            Plane3D.vertexPositions.push(d);
            var newTextureCoordinateD = mult(0.5,subtract(vec2(d[0], d[2]), vec2(-1, -1)));
            Plane3D.vertexTextureCoords.push(newTextureCoordinateD);
            Plane3D.vertexPositions.push(a);
            Plane3D.vertexTextureCoords.push(newTextureCoordinateA);

        }
    }
		
		static initialize() {

            var a = vec3( -1, 0, -1 );
            var b = vec3( 1, 0, -1 );
            var c = vec3( 1, 0, 1 );
            var d = vec3( -1, 0, 1 );

            Plane3D.divideQuad(a, b, c, d, 5);

			Plane3D.shaderProgram = initShaders( gl, "./vshaders/vshaderPlane.glsl", "./fshaders/fshaderPlane.glsl");

			// Load the data into the GPU
			Plane3D.positionBuffer = gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.positionBuffer);
			gl.bufferData( gl.ARRAY_BUFFER, flatten(Plane3D.vertexPositions), gl.STATIC_DRAW );
			
            Plane3D.textureCoordBuffer = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.textureCoordBuffer);
            gl.bufferData( gl.ARRAY_BUFFER, flatten(Plane3D.vertexTextureCoords), gl.STATIC_DRAW );
            Plane3D.uTextureUnitShader = gl.getUniformLocation(Plane3D.shaderProgram, "uTextureUnit");

			// Associate our shader variables with our data buffer
			Plane3D.aPositionShader = gl.getAttribLocation( Plane3D.shaderProgram, "aPosition" );
			Plane3D.aTextureCoordShader = gl.getAttribLocation( Plane3D.shaderProgram, "aTextureCoord" );
			Plane3D.uModelMatrixShader = gl.getUniformLocation( Plane3D.shaderProgram, "modelMatrix" );
			Plane3D.uCameraMatrixShader = gl.getUniformLocation( Plane3D.shaderProgram, "cameraMatrix" );
			Plane3D.uProjectionMatrixShader = gl.getUniformLocation( Plane3D.shaderProgram, "projectionMatrix" );

            //Plane3D.uMatDiffColorShader = gl.getUniformLocation( Plane3D.shaderProgram, "matDiffColor" );
            Plane3D.uMatSpecColorShader = gl.getUniformLocation( Plane3D.shaderProgram, "matSpecColor" );
            Plane3D.uMatAlphaShader = gl.getUniformLocation( Plane3D.shaderProgram, "matAlpha" );

            Plane3D.uLightDirectionShader = gl.getUniformLocation( Plane3D.shaderProgram, "lightDirection" );
		    Plane3D.uLightColorShader = gl.getUniformLocation( Plane3D.shaderProgram, "lightColor" );
        }

        static initializeTexture(){
            var imagePlane = new Image();
    
            imagePlane.onload = function(){
                Plane3D.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, Plane3D.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, imagePlane.width, imagePlane.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePlane);
                
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                
                
            }
            
            imagePlane.src = "./textures/256x grass block.png";
        }
		
		constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
            super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
			if(Plane3D.shaderProgram == -1)
            {
                Plane3D.initialize();
                Plane3D.initializeTexture();
            }
			
			
		}
		
		draw(camera) {
            if(Plane3D.texture == -1)  //only draw when texture is loaded.
        	    return;
			
			gl.useProgram(Plane3D.shaderProgram);
			
			gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.positionBuffer);
			gl.vertexAttribPointer(Plane3D.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

            gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.textureCoordBuffer);
       	    gl.vertexAttribPointer(Plane3D.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
			
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, Plane3D.texture);
            gl.uniform1i(Plane3D.uTextureUnitShader,1);

			gl.uniformMatrix4fv(Plane3D.uModelMatrixShader, false, flatten(this.modelMatrix));
			gl.uniformMatrix4fv(Plane3D.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
			gl.uniformMatrix4fv(Plane3D.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));
			
			console.log(camera1.projectionMatrix);

            //gl.uniform4fv(Plane3D.uMatDiffColorShader, this.matDiffColor);
            gl.uniform4fv(Plane3D.uMatSpecColorShader, this.matSpecColor);
            gl.uniform1f(Plane3D.uMatAlphaShader, this.matAlpha);

            gl.uniform3fv(Plane3D.uLightDirectionShader, light1.direction);
		    gl.uniform4fv(Plane3D.uLightColorShader, light1.color);

			gl.enableVertexAttribArray(Plane3D.aPositionShader);  
            gl.enableVertexAttribArray(Plane3D.aTextureCoordShader);  
			gl.drawArrays(gl.TRIANGLES, 0, Plane3D.vertexPositions.length); 
			gl.disableVertexAttribArray(Plane3D.aPositionShader);
            gl.enableVertexAttribArray(Plane3D.aTextureCoordShader);
		}
	}
	
	