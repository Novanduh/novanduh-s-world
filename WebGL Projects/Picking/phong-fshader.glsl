#version 300 es
precision mediump float;
uniform vec3 ambientProduct;
uniform vec3 diffuseProduct;
uniform vec3 specularProduct;
uniform vec3 secondaryAmbientProduct;
uniform vec3 secondaryDiffuseProduct;
uniform vec3 secondarySpecularProduct;
uniform float shininess;
in vec3 vN, vL, vE;
in vec3 secN, secL, secE;
out vec4 fColor;

void main(){
    vec3 N = normalize(vN);
    vec3 E = normalize(vE);
    vec3 L = normalize(vL);
    vec3 color;
    vec3 H = normalize( L + E );
    vec3 ambient = ambientProduct;
    float diffuseTerm= max( dot(L, N), 0.0 );
    vec3  diffuse = diffuseTerm*diffuseProduct;
    float specularTerm= pow( max(dot(N, H), 0.0), shininess );
    vec3  specular = specularTerm* specularProduct;
    if ( dot(L, N) < 0.0 ) 
        specular = vec3(0.0, 0.0, 0.0);
    color = ambient + diffuse + specular;

    N = normalize(secN);
    E = normalize(secE);
    L = normalize(secL);
    color;
    H = normalize( L + E );
    ambient = secondaryAmbientProduct;
    diffuseTerm= max( dot(L, N), 0.0 );
    diffuse = diffuseTerm*secondaryDiffuseProduct;
    specularTerm= pow( max(dot(N, H), 0.0), shininess );
    specular = specularTerm* secondarySpecularProduct;
    if ( dot(L, N) < 0.0 ) 
        specular = vec3(0.0, 0.0, 0.0);
    color = color + ambient + diffuse + specular;

    fColor= vec4(min(color,1.0), 1.0);
}