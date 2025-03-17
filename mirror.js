class Mirror extends Drawable{
    static vertexPositions = [
        vec3(-0.5, 0.5, 0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
    ];

    

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

    static texture = -1;
    static textureBuffer = -1; 

    static frameBuffer = -1;

    static texsize = 256;

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(Mirror.shaderProgram == -1)
        Mirror.initialize()
        
    }

    static initialize() {
        Mirror.shaderProgram = initShaders( gl, "./vshaders/mirrorVshader.glsl", "./fshaders/mirrorFShader.glsl");
        Mirror.initializeTexture();

        // Load the data into the GPU
        Mirror.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Mirror.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Mirror.vertexPositions), gl.STATIC_DRAW );

        Mirror.frameBuffer = gl.createFramebuffer();
        Mirror.frameBuffer.width = Mirror.texsize;
        Mirror.frameBuffer.height = Mirror.texsize;


        Mirror.textureBuffer = gl.createTexture();
        gl.bindBuffer( gl.ARRAY_BUFFER, Mirror.textureBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(Mirror.texsize * Mirror.texsize * 4), gl.STATIC_DRAW );

        // Associate our shader variables with our data buffer
        Mirror.aPositionShader = gl.getAttribLocation( Mirror.shaderProgram, "aPosition" );
        
        Mirror.uModelMatrixShader = gl.getUniformLocation( Mirror.shaderProgram, "modelMatrix" );
        Mirror.uCameraMatrixShader = gl.getUniformLocation( Mirror.shaderProgram, "cameraMatrix" );
        Mirror.uProjectionMatrixShader = gl.getUniformLocation( Mirror.shaderProgram, "projectionMatrix" );
        
        Mirror.uMatDiffColorShader = gl.getUniformLocation( Mirror.shaderProgram, "matDiffColor" );
        Mirror.uMatSpecColorShader = gl.getUniformLocation( Mirror.shaderProgram, "matSpecColor" );
        Mirror.uMatAlphaShader = gl.getUniformLocation( Mirror.shaderProgram, "matAlpha" );

        Mirror.uLightDirectionShader = gl.getUniformLocation( Mirror.shaderProgram, "lightDirection" );
        Mirror.uLightColorShader = gl.getUniformLocation( Mirror.shaderProgram, "lightColor" ); 

    }

    static initializeTexture() {
        Mirror.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, Mirror.texture);

        gl.texParametersi(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParametersi(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParametersi(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParametersi(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    }

    static renderBuffer(camera){
        Mirror.createEnvironmentMap();

        var origu   = vec3(camera.u[0], camera.u[1], camera.u[2]);
        var origv   = vec3(camera.v[0], camera.v[1], camera.v[2]);
        var orign   = vec3(camera.n[0], camera.n[1], camera.n[2]);
        var origVRP = vec3(camera.vrp[0], camera.vrp[1], camera.vrp[2]);

        var viewportParameters = gl.getParameter(gl.VIEWPORT);
        gl.viewport(0, 0, Mirror.texsize, Mirror.texsize);

        camera.projectionMatrix = perspective(180.0, 1.0, 0.1, 100);
        camera.vrp = vec3(Mirror.tx , Mirror.ty , Mirror.tz);

        gl.bindBuffer(gl.FRAMEBUFFER, Mirror.frameBuffer);

        gl.bindTexture(gl.TEXTURE_2D, Mirror.texture);

        camera.u = vec3(-1, 0, 0);
        camera.v = vec3(0, -1, 0);
        camera.n = vec3(0, 0, 1);

        gl.frameBufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, Mirror.texture, 0);

        camera.updateCameraMatrix();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(var i = 0; i < objects.length; i++){
            if(objects[i] != this){
                objects[i].draw(camera);
            }
        }

        camera.u = origu;
        camera.v = origv;
        camera.n = orign;
        camera.vrp = origVRP;

        camera.projectionMatrix = perspective(90.0, 1.0, 0.1, 100);
        gl.viewport(viewportParameters[0], viewportParameters[1], viewportParameters[2], viewportParameters[3]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return 1;
    }

    static draw(camera) {
        gl.useProgram(Mirror.shaderProgram);

        if (Mirror.renderBuffer(camera) !==1){
            return; 
        }
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Mirror.texture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "mirrorTexture"), 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, Mirror.positionBuffer);
        gl.vertexAttribPointer(Mirror.aPositionShader, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Mirror.aPositionShader);

        gl.uniformMatrix4fv(Mirror.uModelMatrixShader, false, flatten(this.getModelMatrix()));
        gl.uniformMatrix4fv(Mirror.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(Mirror.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));

        gl.uniform4fv(Mirror.uMatDiffColorShader, this.matDiffColor);
        gl.uniform4fv(Mirror.uMatSpecColorShader, this.matSpecColor);
        gl.uniform1f(Mirror.uMatAlphaShader, this.matAlpha);

        //Assuming light direction is normalized
        gl.uniform3fv(Mirror.uLightDirectionShader, light1.direction);
        gl.uniform4fv(Mirror.uLightColorShader, light1.color);

        // Draw the object
        gl.drawArrays(gl.TRIANGLE_FAN, 0, Mirror.vertexPositions.length / 3);
    }

}

