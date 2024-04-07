#version 300 es
in vec3 aPosition;
in vec3 aNormal;
out vec3 vN, vL, vE;
out vec3 secN, secL, secE;
uniform mat4 modMatrix;
uniform mat4 projMatrix;
uniform vec3 lightPosition, secondaryLightPosition;

void main(){
    vec3 pos = (modMatrix * vec4(aPosition, 1.0)).xyz;
    vec3 lightPos = (modMatrix * vec4(lightPosition, 1.0)).xyz;
    vec3 secLightPos = (modMatrix* vec4(secondaryLightPosition, 1.0)).xyz;    
    vL = normalize( lightPos - pos );
    vE = normalize( -pos );
    vN = normalize( (modMatrix*vec4(aNormal, 0.0)).xyz);
    secL = normalize( secLightPos - pos );
    secE = normalize( -pos );
    secN = normalize( (modMatrix*vec4(aNormal, 0.0)).xyz);
    gl_Position = projMatrix * vec4(pos, 1.0);
}
