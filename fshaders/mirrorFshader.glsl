#version 300 es
precision mediump float;

in vec3 L; 
in vec3 V; 
in vec3 N; 
//in vec2 texCoord; 

uniform vec4 lightColor;  
uniform vec4 matDiffColor; 
uniform vec4 matSpecColor; 

uniform float matAlpha;    

//uniform sampler2D textureSampler; 

out vec4 fcolor;

void main()
{
    // Normalize inputs
    vec3 norm = normalize(N);
    vec3 lightDir = normalize(L);
    vec3 viewDir = normalize(V);

    
    vec3 R = normalize(2.0 * dot(norm,viewDir) * N - V);

    // Diffuse lighting
    float Kd = max(dot(lightDir, norm), 0.0);
    vec4 diffuse = Kd * lightColor * matDiffColor;

    // Specular lighting
    float Ks = pow ( max(dot(R, viewDir), 0.0), matAlpha);
    vec4 spec = Ks * lightColor * matSpecColor;

    fcolor = diffuse + spec;
    fcolor.a = 1.0;
}
