#version 300 es
in vec3 aPosition;
in vec2 aTextureCoord;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;
uniform vec3 lightDirection;

//out vec3 L;
//out vec3 V;
//out vec3 N;

out vec2 vTextureCoord;

void main()
{
    gl_Position = projectionMatrix * cameraMatrix * modelMatrix * vec4(aPosition, 1.0);
    
    // Vertex position in camera space
    vec3 pos = (cameraMatrix * modelMatrix * vec4(aPosition, 1.0)).xyz;

    // Light direction in camera space
    //L = normalize((-cameraMatrix * vec4(lightDirection, 0.0)).xyz);

    // View direction (camera at origin)
    //V = normalize(-pos);

    vTextureCoord = aTextureCoord; 

    // Transform normal correctly (if scaling is applied)
    //mat3 normalMatrix = transpose(inverse(mat3(modelMatrix)));
    //N = normalize(cameraMatrix*vec4(0,1,0,0)).xyz;
    
}
