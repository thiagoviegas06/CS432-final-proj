#version 300 es
precision mediump float;

in vec3 vTextureCoord;
uniform samplerCube uTextureUnit;

out vec4 fColor;

void main()
{
    fColor = texture(uTextureUnit, vTextureCoord);
    fColor.a = 1.0;     
}
