#version 300 es

in vec3 aPosition;       
in vec2 aTexCoord;
out vec3 R; 

out vec3 L;
out vec3 V;
out vec3 N;

out vec2 vTexCoord;         

uniform mat4 modelMatrix;       
uniform mat4 cameraMatrix;      
uniform mat4 projectionMatrix;
uniform vec3 lightDirection;  

void main() {
    // Transform the vertex position
    gl_Position = projectionMatrix * cameraMatrix * modelMatrix * vec4(aPosition, 1.0);

    // Light direction in camera space
    L = normalize((-cameraMatrix * vec4(lightDirection, 0.0)).xyz);

    // View direction in camera space
    V = normalize(inverse(cameraMatrix)* vec4(0,0,0,1) - modelMatrix * vec4(aPosition,1.0)).xyz;

    // Normal in camera space
    N = normalize(modelMatrix*vec4(0.0,0.0,1.0,0.0)).xyz;

    // Correct reflection vector
    vec3 R = reflect(-V, N);
    vTexCoord = R.xy;
}