#version 300 es
in vec3 aPosition;
in vec3 aNormal;
flat out vec3 vColor;
uniform vec3 ambientProduct, diffuseProduct, specularProduct;
uniform vec3 secondaryAmbientProduct, secondaryDiffuseProduct, secondarySpecularProduct;
uniform mat4 modMatrix;
uniform mat4 projMatrix;
uniform vec3 lightPosition, secondaryLightPosition; 
uniform float shininess;

void main(){
    vec3 pos = (modMatrix* vec4(aPosition, 1.0)).xyz;
    vec3 lightPos = (modMatrix* vec4(lightPosition, 1.0)).xyz;
    vec3 secLightPos = (modMatrix* vec4(secondaryLightPosition, 1.0)).xyz;

    vec3 L = normalize( lightPos - pos );
    vec3 E = normalize( -pos );
    vec3 H = normalize( L + E );

    vec3 N = normalize( (modMatrix*vec4(aNormal, 0.0)).xyz);
    vec3 ambient = ambientProduct;

    float diffuseTerm= max( dot(L, N), 0.0 );
    vec3  diffuse = diffuseTerm*diffuseProduct;
    float specularTerm= pow( max(dot(N, H), 0.0), shininess );
    vec3  specular = specularTerm* specularProduct;
    if( dot(L, N) < 0.0 )  
        specular = vec3(0.0, 0.0, 0.0);

    vec3 color = ambient + diffuse + specular;

    L = normalize( secLightPos - pos );
    E = normalize( -pos );
    H = normalize( L + E );

    N = normalize( (modMatrix*vec4(aNormal, 0.0)).xyz);
    ambient = secondaryAmbientProduct;

    diffuseTerm= max( dot(L, N), 0.0 );
    diffuse = diffuseTerm*secondaryDiffuseProduct;
    specularTerm= pow( max(dot(N, H), 0.0), shininess );
    specular = specularTerm* secondarySpecularProduct;
    if( dot(L, N) < 0.0 )  
        specular = vec3(0.0, 0.0, 0.0);

    color = color + ambient + diffuse + specular;

    gl_Position= projMatrix* vec4(pos, 1.0);
    vColor= min(color, 1.0);
}
    

