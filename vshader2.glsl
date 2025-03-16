#version 300 es
in vec3 aPosition;
in vec3 aNormal; 
//in vec2 aTexCoord; 

uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;
uniform vec3 lightDirection;

out vec3 L; 
out vec3 V; 
out vec3 N; 
//out vec2 texCoord; 

void main()
{
    // Transform vertex position to clip space
    gl_Position = projectionMatrix * cameraMatrix * modelMatrix * vec4(aPosition, 1.0);

    // Vertex position in camera space
    vec3 pos = (cameraMatrix * modelMatrix * vec4(aPosition, 1.0)).xyz;

    L = normalize((-cameraMatrix * vec4(lightDirection, 0.0)).xyz);

    N = normalize((cameraMatrix * modelMatrix * vec4(aNormal, 0.0)).xyz);

    V = normalize(vec3(0,0,0) - pos);
   
    //texCoord = aTexCoord;
}
