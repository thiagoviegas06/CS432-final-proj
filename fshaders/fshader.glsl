#version 300 es
precision mediump float;

uniform vec4 matDiffColor;
uniform vec4 matSpecColor;
uniform float matAlpha;
uniform vec4 lightColor;

in vec3 L;
in vec3 V;
in vec3 N;

out vec4 fColor;

void main()
{
    vec3 fL = normalize(L);
    vec3 fV = normalize(V);
    vec3 fN = normalize(N);

    // Halfway vector
    vec3 H = normalize(fL + fV);

    // Diffuse lighting (Lambertian reflection)
    float Kd = max(dot(fL, fN), 0.0);
    vec4 diffuse = Kd * lightColor * matDiffColor;

    // Specular lighting (Blinn-Phong reflection)
    float Ks = pow(max(dot(fN, H), 0.0), matAlpha);
    vec4 specular = Ks * Kd * lightColor * matSpecColor; // Specular should depend on diffuse

    // Final color computation
    vec4 finalColor = diffuse + specular;
    finalColor.a = 1.0;

    fColor = finalColor;
}
