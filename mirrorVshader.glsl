#version 300 es
in vec3 aPosition;


uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;
uniform vec3 lightDirection;

out vec3 L;
out vec3 V;
out vec3 N;

void main()
{
    gl_Position = projectionMatrix * cameraMatrix * modelMatrix * vec4(aPosition, 1.0);
    
    // Vertex position in camera space
    vec3 pos = (cameraMatrix * modelMatrix * vec4(aPosition, 1.0)).xyz;

    // Light direction in camera space
    L = normalize((-cameraMatrix * vec4(lightDirection, 0.0)).xyz);

    // View direction (camera at origin)
    V = normalize(inverse(cameraMatrix) * vec4(0,0,0,1) - modelMatrix*vec4(aPosition, 1.0));

    // Transform normal correctly (if scaling is applied)
    mat3 normalMatrix = transpose(inverse(mat3(modelMatrix)));
    N = normalize(modelMatrix *vec4(0,0,1, 0)).xyz;
    
}
