#version 300 es
in vec3 aPosition;
in vec3 aNormal;
flat out vec3 vColor;
uniform vec3 ambientProduct, diffuseProduct, specularProduct;

uniform mat4 modMatrix;
uniform mat4 projMatrix;
uniform vec3 lightPosition; 
uniform float shininess;

void main(){
    vec3 pos = (modMatrix* vec4(aPosition, 1.0)).xyz;
    vec3 lightPos = (modMatrix* vec4(lightPosition, 1.0)).xyz;
   
    vec3 L = normalize( lightPos - pos );
    vec3 E = normalize( -pos );
    vec3 H = normalize( L + E );

    vec3 N = normalize( (modMatrix*vec4(aNormal, 0.0)).xyz);
    vec3 ambient = ambientProduct;
    if (dot(E,N) < 0.0) 
        N = vec3(-1,-1,-1) * N;

    float diffuseTerm= max( dot(L, N), 0.0 );
    vec3  diffuse = diffuseTerm*diffuseProduct;
    float specularTerm= pow( max(dot(N, H), 0.0), shininess );
    vec3  specular = specularTerm* specularProduct;
    if( dot(L, N) < 0.0 )  
        specular = vec3(0.0, 0.0, 0.0);

    vec3 color = ambient + diffuse + specular;
    gl_Position= projMatrix* vec4(pos, 1.0);
    gl_PointSize=5.0;
    vColor= min(color, 1.0);
}
    

