class Mirror extends Drawable{
    static vertexPositions = [
        vec3(-0.5, 0.5, 0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
    ];
    static textureCoords = [
        vec2(0,0),
        vec2(0,1),
        vec2(1,1),
        vec2(1,0),
        
        
    ];


    static shaderProgram = -1;
    static positionBuffer = -1;
    static aPositionShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;

    static aTextureCoordShader = -1;

    //static uMatDiffColorShader = -1;
    static uMatSpecColorShader = -1;
    static uMatAlphaShader = -1;

    static uLightDirectionShader = -1;
    static uLightColorShader = -1;

    static texture = -1;
    static textureBuffer = -1; 
    static uTextureUnitShader = -1;

    static frameBuffer = -1;
    static depthBuffer = -1;

    static texsize = 256;

    static tx = 0;
    static ty = 0;
    static tz = 0;

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        Mirror.tx = tx;
        Mirror.ty = ty;
        Mirror.tz = tz;


        if(Mirror.shaderProgram == -1)
        Mirror.initialize()

    }

    isMirror(){
        return true;
    }


    static initialize() {
        //Mirror.initializeTexture();
        Mirror.shaderProgram = initShaders( gl, "./vshaders/mirrorVshader.glsl", "./fshaders/mirrorFShader.glsl");
        Mirror.initializeTexture();

        // Load the data into the GPU
        Mirror.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Mirror.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Mirror.vertexPositions), gl.STATIC_DRAW );

        
        Mirror.textureBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Mirror.textureBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Mirror.textureCoords), gl.STATIC_DRAW );

        // Associate our shader variables with our data buffer
        Mirror.aPositionShader = gl.getAttribLocation( Mirror.shaderProgram, "aPosition" );

        Mirror.uTextureUnitShader = gl.getUniformLocation(Mirror.shaderProgram, "uTextureUnit");
        Mirror.aTextureCoordShader = gl.getAttribLocation( Mirror.shaderProgram, "aTexCoord" );

        Mirror.uModelMatrixShader = gl.getUniformLocation( Mirror.shaderProgram, "modelMatrix" );
        Mirror.uCameraMatrixShader = gl.getUniformLocation( Mirror.shaderProgram, "cameraMatrix" );
        Mirror.uProjectionMatrixShader = gl.getUniformLocation( Mirror.shaderProgram, "projectionMatrix" );
        
        //Mirror.uMatDiffColorShader = gl.getUniformLocation( Mirror.shaderProgram, "matDiffColor" );
        Mirror.uMatSpecColorShader = gl.getUniformLocation( Mirror.shaderProgram, "matSpecColor" );
        Mirror.uMatAlphaShader = gl.getUniformLocation( Mirror.shaderProgram, "matAlpha" );

        Mirror.uLightDirectionShader = gl.getUniformLocation( Mirror.shaderProgram, "lightDirection" );
        Mirror.uLightColorShader = gl.getUniformLocation( Mirror.shaderProgram, "lightColor" ); 

    }

    static initializeTexture() {
        Mirror.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, Mirror.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Mirror.texsize, Mirror.texsize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        

        Mirror.frameBuffer = gl.createFramebuffer();
        Mirror.frameBuffer.width = Mirror.texsize;
        Mirror.frameBuffer.height = Mirror.texsize;

    }

    static renderBuffer(camera) {
        var origu = vec3(camera.u);
        var origv = vec3(camera.v);
        var orign = vec3(camera.n);
        var origVRP = vec3(camera.vrp);
        var origProjectionMat = camera.projectionMatrix;
    
        var viewportParameters = gl.getParameter(gl.VIEWPORT);
        gl.viewport(0, 0, Mirror.texsize, Mirror.texsize);
    
        camera.projectionMatrix = perspective(60.0, 1.0, 0.1, 100);
        
        camera.vrp = vec3(Mirror.tx, Mirror.ty, Mirror.tz);
        gl.bindFramebuffer(gl.FRAMEBUFFER, Mirror.frameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, Mirror.texture);
        gl.depthMask(false); 
    
        camera.u = vec3(-1, 0, 0);
        camera.v = vec3(0, -1, 0);
        camera.n = vec3(0, 0, -1);
        
        // Attach texture to framebuffer
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, Mirror.texture, 0);
        
        camera.updateCameraMatrix();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
        // Draw objects into the framebuffer
        for (var i = 1; i < objects.length; i++) {
           
            if (!objects[i].isMirror()) {
               
                objects[i].draw(camera);
            }
        }
    
        // Restore original camera and viewport
        camera.u = origu;
        camera.v = origv;
        camera.n = orign;
        camera.vrp = origVRP;
        camera.projectionMatrix = origProjectionMat;
        camera.updateCameraMatrix();
    
        gl.viewport(viewportParameters[0], viewportParameters[1], viewportParameters[2], viewportParameters[3]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.depthMask(true);

       
        return 1;
    }

    
    

    draw(camera) {
       Mirror.renderBuffer(camera);
        if (Mirror.texture ===-1){
            return; 
        }

        
        gl.useProgram(Mirror.shaderProgram);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Mirror.texture);

        gl.uniform1i(Mirror.uTextureUnitShader, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, Mirror.positionBuffer);
        gl.vertexAttribPointer(Mirror.aPositionShader, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer( gl.ARRAY_BUFFER, Mirror.textureBuffer);
       	gl.vertexAttribPointer(Mirror.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray(Mirror.aPositionShader);
    
        gl.uniformMatrix4fv(Mirror.uModelMatrixShader, false, flatten(this.getModelMatrix()));
        gl.uniformMatrix4fv(Mirror.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(Mirror.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));

        //gl.uniform4fv(Mirror.uMatDiffColorShader, this.matDiffColor);
        gl.uniform4fv(Mirror.uMatSpecColorShader, this.matSpecColor);
        gl.uniform1f(Mirror.uMatAlphaShader, this.matAlpha);

        //Assuming light direction is normalized
        gl.uniform3fv(Mirror.uLightDirectionShader, light1.direction);
        gl.uniform4fv(Mirror.uLightColorShader, light1.color);

        gl.enableVertexAttribArray(Mirror.aTextureCoordShader);  

        // Draw the object
        gl.drawArrays(gl.TRIANGLE_FAN, 0, Mirror.vertexPositions.length); 
        gl.disableVertexAttribArray(Mirror.aPositionShader);
        gl.disableVertexAttribArray(Mirror.aTextureCoordShader);

       
    }

}

