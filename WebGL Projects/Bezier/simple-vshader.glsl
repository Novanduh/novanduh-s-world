#version 300 es
in vec3 aPosition;
//in vec4 aColor;
out vec4 vColor;
uniform mat4 modMatrix;
uniform mat4 projMatrix;

void main(){
    vec3 pos = (modMatrix * vec4(aPosition, 1.0)).xyz;
    vColor = vec4(0.51,0.808,0.831,1);
    gl_Position= projMatrix* modMatrix *vec4(aPosition, 1.0);
    gl_PointSize=5.0;
}