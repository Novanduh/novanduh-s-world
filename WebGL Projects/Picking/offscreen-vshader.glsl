#version 300 es
in vec3 aPosition;
uniform mat4 modMatrix;
uniform mat4 projMatrix;

void main(){
    vec3 pos = (modMatrix * vec4(aPosition, 1.0)).xyz;
    gl_Position= projMatrix* modMatrix *vec4(aPosition, 1.0);
}