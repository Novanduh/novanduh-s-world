#version 300 es
precision mediump float;
out vec4 fColor;
uniform int index;
void main() {
    vec4 colors[3];
    colors[0] = vec4(1, 0, 0, 1);
    colors[1] = vec4(0, 1, 0, 1);
    colors[2] = vec4(0, 0, 1, 1);
     fColor = colors[index];
}