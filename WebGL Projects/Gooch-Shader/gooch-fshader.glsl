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
    float alpha = 0.1;
    float beta = 0.4;
    vec3 warmColor = vec3(0.4,0.4,0);
    vec3 coolColor = vec3(0,0,0.7);
    vec3 N = normalize(vN);
    vec3 E = normalize(vE);
    vec3 L = normalize(vL);
    vec3 color;
    vec3 H = normalize( L + E );
    vec3 ambient = ambientProduct;
    float diffuseTerm= dot(L, N);
    //vec3  diffuse = diffuseTerm*diffuseProduct;
    vec3 kCool = coolColor + (alpha*diffuseProduct);
    vec3 kWarm = warmColor + (beta*diffuseProduct);
    float goochTerm = (1.0 + diffuseTerm)/2.0;
    vec3 diffuse = (goochTerm*kCool) + ((1.0 - goochTerm)*kWarm);
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
    diffuseTerm= dot(L, N);
    //diffuse = diffuseTerm*secondaryDiffuseProduct;
    alpha=0.1;
    beta=0.1;
    warmColor = vec3(0.2,0.2,0);
    coolColor = vec3(0.0,0,0.5);
    kCool = coolColor + (alpha*secondaryDiffuseProduct);
    kWarm = warmColor + (beta*secondaryDiffuseProduct);
    goochTerm = (1.0 + diffuseTerm)/2.0;
    diffuse = (goochTerm*kCool) + ((1.0 - goochTerm)*kWarm);
    specularTerm= pow( max(dot(N, H), 0.0), shininess );
    specular = specularTerm* secondarySpecularProduct;
    if ( dot(L, N) < 0.0 ) 
        specular = vec3(0.0, 0.0, 0.0);
    color = color + ambient + diffuse + specular;

    fColor= vec4(min(color,1.0), 1.0);
}