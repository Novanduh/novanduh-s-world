/////////////////////////////////////////////////////////
////////////////////VARIABLES///////////////////////////
////////////////////////////////////////////////////////
///////////////////CONTROL POINTS////////////////////////
P=mat4();

P[0][0]=vec3(0.0, 0.0, 0.0);
P[0][1]=vec3(0.0, 2.0, 1.1);
P[0][2]=vec3(0.0, 4.0, -0.5);
P[0][3]=vec3(0.0, 6.0, 0.3);

P[1][0]=vec3(2.0, 0.0, 1.5);
P[1][1]=vec3(2.0, 2.0, 3.9);
P[1][2]=vec3(2.0, 4.0, 2.6);
P[1][3]=vec3(2.0, 6.0, -1.1);

P[2][0]=vec3(4.0, 0.0, 2.9);
P[2][1]=vec3(4.0, 2.0, 3.1);
P[2][2]=vec3(4.0, 4.0, 2.4);
P[2][3]=vec3(4.0, 6.0, 1.3);

P[3][0]=vec3(6.0, 0.0, 0.0);
P[3][1]=vec3(6.0, 2.0, 0.7);
P[3][2]=vec3(6.0, 4.0, 0.4);
P[3][3]=vec3(6.0, 6.0, -0.2);
/////////////////////////////////////////////////////////

//////////////////////BEZIER SETUP////////////////////////
var num_u=10;
var num_v=10;
var u=0.0;
var v=0.0;
var vertices=[];
var normals=[];
var normalizedNormals=[];
var Bu=[];
var Bv=[];
var B=[];
/////////////////////////////////////////////////////////

//////////////////////WEBGL SETUP/////////////////////////
var canvas, gl;
var shaderProgram = -1;
var simpleShaderProgram = -1;
var cBuffer, normalLoc, vBuffer, positionLoc, modMatLoc, projMatLoc, vertexArrayObj;
var vshader = "./flat-vshader.glsl";
var fshader = "./flat-fshader.glsl";
/////////////////////////////////////////////////////////

///////////////////PROJECTION MATRICES////////////////////
modMat=mat4();
projMat=mat4();
eye=vec3(1.0, 1.0, 1.0);
at=vec3(2.0, 3.0, 0.0);
up=vec3(0.0, 1.0, 0.0);
/////////////////////////////////////////////////////////

///////////////////MATERIAL PROPERTIES////////////////////
var materialAmbient, materialDiffuse, materialSpecular, materialShininess;
materialAmbient = vec3(0.992,0.702,0.161);
materialDiffuse = vec3(0.992,0.702,0.161);
materialSpecular = vec3(0.992,0.702,0.161);
materialShininess = 80.0;
/////////////////////////////////////////////////////////

/////////////////////LIGHT VALUES/////////////////////////
var lightAmbient, lightDiffuse, lightSpecular;
var lightPosition=vec3(0,0,0);
lightAmbient = vec3(1.0,0.576,0.722);
lightDiffuse  = vec3(1.0,0.576,0.722);
lightSpecular = vec3(0.5,0.5,0.5);
var ambientProduct= mult(lightAmbient, materialAmbient);
var diffuseProduct= mult(lightDiffuse, materialDiffuse);
var specularProduct= mult(lightSpecular, materialSpecular);
/////////////////////////////////////////////////////////

/////////////////////CAMERA VALUES/////////////////////////
var viewMode = 0;
near = 1;
far = 100;
radius = 8;
theta = 0.5; 
phi = 0;    
fov = 100;
aspect = 1;
delH = 0.1;
delR = 0.1;
delT = 0.1;
var height=2.5;
/////////////////////////////////////////////////////////

//////////////////GIZMOS SETUP////////////////////////////
var gizmoPosLoc, gizmoModLoc, gizmoProjLoc;
/////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////
////////////////////FUNCTIONS///////////////////////////
////////////////////////////////////////////////////////

///////////////////BEZIER FUNCTIONS////////////////////
function calcBu(U){ //u blending function
    var uInc=1.0/(U-1);
    u = 0;
    var uSqr, utmp, utmpSqr;
    Bu[0]=[];
    Bu[1]=[];
    Bu[2]=[];
    Bu[3]=[];
    for(var uCtrl = 0; uCtrl<num_u; uCtrl++, u += uInc){
        uSqr=Math.pow(u, 2);
        utmp= 1.0 - u;
        utmpSqr=Math.pow(utmp,2);
        Bu[0][uCtrl] = Math.pow(utmp, 3);
        Bu[1][uCtrl] = 3 * u * Math.pow(utmp, 2);
        Bu[2][uCtrl] = 3 * uSqr * utmp;
        Bu[3][uCtrl] = Math.pow(u,3);
    }
}

function calcBv(V){ //v blending function
    var vInc=1.0/(V-1);
    v = 0;
    var vSqr, vtmp, vtmpSqr;
    Bv[0]=[];
    Bv[1]=[];
    Bv[2]=[];
    Bv[3]=[];
    for(var vCtrl = 0; vCtrl<num_v; vCtrl++, v += vInc){
        vSqr=Math.pow(v, 2);
        vtmp= 1.0 - v;
        vtmpSqr=Math.pow(vtmp,2);
        Bv[0][vCtrl] = Math.pow(vtmp, 3);
        Bv[1][vCtrl] = 3 * v * Math.pow(vtmp, 2);
        Bv[2][vCtrl] = 3 * vSqr * vtmp;
        Bv[3][vCtrl] = Math.pow(v,3);
    }
}

function getPoint(uIndex, vIndex){ //calculates a 3d point given (u,v) pair
    var newPoint=vec3(0, 0, 0); 
    var vecBu, vecBv, tempProduct;
    for(var Pi=0; Pi<4; Pi++){
        for(var Pj=0; Pj<4; Pj++){
            vecBu = vec3(Bu[Pi][uIndex], Bu[Pi][uIndex], Bu[Pi][uIndex]);
            vecBv = vec3(Bv[Pj][vIndex],Bv[Pj][vIndex],Bv[Pj][vIndex]);
            tempProduct = mult(vecBu, vecBv);
            tempProduct = mult(tempProduct, P[Pi][Pj]);
            newPoint = add(newPoint, tempProduct);
        }
    }
    return newPoint;
}

function getBezierPoints(){ //calculates the new mesh
    cleanUp();
    calcBu(num_u);
    calcBv(num_v);
    for(var loopU=0; loopU<(num_u); loopU++){
        B[loopU]=[];
        for(var loopV=0; loopV<(num_v); loopV++)
            B[loopU][loopV]=getPoint(loopU, loopV);
    }
}

function drawBezierPatch(A, n, m){ //calculates the vertices
    var triangle1=[];
    var triangle2=[];
    var vertIndex=[];
    var n01, n02, norm;
    for(i=0; i<(n-1); i++){
        for(j=0;j<(m-1);j++){
            /////////////////////
            triangle1[0]=A[i][j];
            triangle1[1]=A[i+1][j];
            triangle1[2]=A[i][j+1];
            vertices.push(triangle1[0]);
            vertices.push(triangle1[1]);
            vertices.push(triangle1[2]);
            n01 = subtract(triangle1[1], triangle1[0]);
            n02 = subtract(triangle1[2], triangle1[0]);
            norm = cross(n01, n02);
            norm = normalize(norm);
            norm = vec4(norm[0],norm[1], norm[2], 1.0);
            normals.push(norm);
            normals.push(norm);
            normals.push(norm);
            //////////////////////
            triangle2[0]=A[i+1][j];
            triangle2[1]=A[i+1][j+1];
            triangle2[2]=A[i][j+1];
            vertices.push(triangle2[0]);
            vertices.push(triangle2[1]);
            vertices.push(triangle2[2]);
            n01 = subtract(triangle1[1], triangle1[0]);
            n02 = subtract(triangle1[2], triangle1[0]);
            norm = cross(n01, n02);
            norm = normalize(norm);
            norm = vec4(norm[0],norm[1], norm[2], 1.0);
            normals.push(norm);
            normals.push(norm);
            normals.push(norm);
        }
    }
}
////////////////////////////////////////////////////////


//////////////////INITIALIZE WINDOW//////////////////////
window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.129,0.149,0.318, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //const bodyElement = document.querySelector("body");
    //bodyElement.addEventListener("keydown", keyDown, false); 
    const vSlider = document.getElementById("v-values");
    vSlider.value=10;
    vSlider.oninput = function(){
        num_v=this.value;
        render();
    }  
    const uSlider = document.getElementById("u-values");
    uSlider.value=10;
    uSlider.oninput = function(){
        num_u=this.value;
        render();
    }         
    render();
}
/////////////////////////////////////////////////////////


///////////////////RENDER FUNCTIONS//////////////////////
function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), height, radius*Math.cos(theta));
    lightPosition = vec3(radius*Math.sin(theta)*Math.cos(phi), height+1, radius*Math.cos(theta));
    getBezierPoints();
    //drawBezierPatch(P, 4, 4);
    drawBezierPatch(B, num_u, num_v);
    setScene();
    modMat = lookAt(eye, at, up);
    projMat=ortho(-radius, radius, -radius, radius, near, far);
    gl.uniformMatrix4fv(modMatLoc, false, flatten(modMat));
    gl.uniformMatrix4fv(projMatLoc, false, flatten(projMat));
    gl.drawArrays( gl.TRIANGLES, 0, vertices.length );
    drawGizmos();
}

function setShader(){
    shaderProgram = initShaders( gl,vshader, fshader);
    simpleShaderProgram = initShaders(gl, "simple-vshader.glsl", "simple-fshader.glsl");
    gl.useProgram(shaderProgram);
}

function setScene(){
    setShader();    

    cBuffer = gl.createBuffer();
    vBuffer = gl.createBuffer();
    
    normalLoc = gl.getAttribLocation( shaderProgram, "aNormal" );
    positionLoc = gl.getAttribLocation(shaderProgram, "aPosition");
    modMatLoc = gl.getUniformLocation(shaderProgram, "modMatrix");
    projMatLoc = gl.getUniformLocation(shaderProgram, "projMatrix");
    
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"ambientProduct"), flatten(ambientProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"diffuseProduct"), flatten(diffuseProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"specularProduct"), flatten(specularProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lightPosition"),flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "shininess"),materialShininess);

    vertexArrayObj = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObj);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    gl.vertexAttribPointer( normalLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    

    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
}

function drawGizmos(){
    gl.useProgram(simpleShaderProgram);
    gizmoPosLoc = gl.getAttribLocation(simpleShaderProgram, "aPosition");
    gizmoModLoc = gl.getUniformLocation(simpleShaderProgram, "modMatrix");
    gizmoProjLoc = gl.getUniformLocation(simpleShaderProgram, "projMatrix");
    //gizmoColorLoc = gl.getAttribLocation(simpleShaderProgram, "aColor");
    gl.uniformMatrix4fv(gizmoModLoc, false, flatten(modMat));
    gl.uniformMatrix4fv(gizmoProjLoc, false, flatten(projMat));

    pointVert=[];
    pointColors=[];
    p=0;
    for(i=0;i<4;i++){
        for(j=0;j<4;j++){
            pointVert[p]= P[i][j];
            pointColors[p]=vec4(1.0,0.576,0.722,1);
            p++;
        }
    }

    pointVBuffer = gl.createBuffer();
    pointCBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, pointVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointVert), gl.STATIC_DRAW);

    gl.vertexAttribPointer(gizmoPosLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gizmoPosLoc);
    gl.drawArrays( gl.POINTS, 0, pointVert.length );


    axisVert=[vec3(7, 0, 0), vec3(0, 0, 0), vec3(0, 7, 0), vec3(0, 0, 0), vec3(0, 0, 4), vec3(0, 0, 0)];
    //axisColors=[vec4(7, 0, 0,1), vec4(0, 0, 0,1), vec4(0, 7, 0,1), vec4(0, 0, 0,1), vec4(0, 0, 4, 1), vec4(0, 0, 0, 1)];
    axisColors=[vec4(1.0,0.576,0.722,1), vec4(1.0,0.576,0.722,1), vec4(1.0,0.576,0.722,1), vec4(1.0,0.576,0.722,1), vec4(1.0,0.576,0.722,1), vec4(1.0,0.576,0.722,1)];
    axisVBuffer = gl.createBuffer();
    axisCBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, axisCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(axisColors), gl.STATIC_DRAW);

    //gl.vertexAttribPointer( gizmoColorLoc, 4, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( gizmoColorLoc );

    gl.bindBuffer(gl.ARRAY_BUFFER, axisVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(axisVert), gl.STATIC_DRAW);

    gl.vertexAttribPointer(gizmoPosLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gizmoPosLoc);
    //l.drawArrays( gl.LINES, 0, axisVert.length );
}
/////////////////////////////////////////////////////////


/////////////////////////UTILS//////////////////////////
function cleanUp(){
    u=0.0;
    v=0.0;
    vertices=[];
    normals=[];
    normalizedNormals=[];
    Bu=[];
    Bv=[];
    B=[];
}

function reset(){
    num_u=10;
    num_v=10;
    u=0.0;
    v=0.0;
    vertices=[];
    normals=[];
    normalizedNormals=[];
    Bu=[];
    Bv=[];
    B=[];
    radius = 8;
    theta = 0.5; 
    height=2.5;
    render();
} 

function keyDown(event){
    switch(event.key){
        case "q" : {radius+=delR; render();  break;}
        case "a" : {if(radius<=8) {radius=8;} else {radius-=delR;} render(); break;}
        case "w" : {height+=delH; render(); break;}
        case "s" : {height-=delH; render(); break;}
        case "e" : {theta-=delT; render(); break;}
        case "d" : {theta+=delT; render(); break;}
        case "Q" : {radius+=delR; render();  break;}
        case "A" : {if(radius<=8) {radius=8;} else {radius-=delR;} render(); break;}
        case "W" : {height+=delH; render(); break;}
        case "S" : {height-=delH; render(); break;}
        case "E" : {theta-=delT; render(); break;}
        case "D" : {theta+=delT; render(); break;}

        case "i" : {num_u+=1; render(); break;}
        case "I" : {num_u+=1; render(); break;}
        case "o" : {if(num_u>=5) {num_u-=1; } render(); break;}
        case "O" : {if(num_u>=5) {num_u-=1; } render(); break;}
        case "k" : {num_v+=1; render(); break;}
        case "K" : {num_v+=1; render(); break;}
        case "l" : {if(num_v>=5) {num_v-=1;  } render(); break;}
        case "L" : {if(num_v>=5) {num_v-=1; } render(); break;}

        case "r" : {reset(); break;}
    }
}
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
