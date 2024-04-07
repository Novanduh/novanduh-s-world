function model(name){
    var smf_file = loadFileAJAX(name);
    var lines = smf_file.split("\n"); 
    for(var line = 0; line < lines.length; line++){
        var info = lines[line].split(" ");
        if(info[0]=="v"){
            modelVertices.push(vec3(info[1], info[2], info[3]));
            vertexNormals.push(vec4(0, 0, 0, 0));
        }
        if(info[0]=="f"){
            modelFaces.push([info[1], info[2], info[3]]);
        }
    }
    for(var face = 0; face<modelFaces.length; face++){
        var p0 = modelVertices[modelFaces[face][0]-1];
        var p1 = modelVertices[modelFaces[face][1]-1];
        var p2 = modelVertices[modelFaces[face][2]-1];
        var n01 = subtract(p1, p0);
        var n02 = subtract(p2, p0);
        var n = cross(n01, n02);
        n = normalize(n);
        n = vec4(n[0],n[1], n[2], 1.0);
        modelPoints.push(p0);
        modelPoints.push(p1);
        modelPoints.push(p2);
        vertexNormals[modelFaces[face][0]-1] = add(vertexNormals[modelFaces[face][0]-1], n);
        vertexNormals[modelFaces[face][1]-1] = add(vertexNormals[modelFaces[face][1]-1], n);
        vertexNormals[modelFaces[face][2]-1] = add(vertexNormals[modelFaces[face][2]-1], n);
    } 
    for(var normal=0; normal<vertexNormals.length; normal++){
        vertexNormals[normal]=normalize(vertexNormals[normal]);
    }
    for(var face = 0; face<modelFaces.length; face++){
        var n0 = vertexNormals[modelFaces[face][0]-1];
        var n1 = vertexNormals[modelFaces[face][1]-1];
        var n2 = vertexNormals[modelFaces[face][2]-1];
        modelColors.push(n0);
        modelColors.push(n1);
        modelColors.push(n2);
    } 
}


function keyDown( event ){
    switch(event.key){
        case "q" : {console.log("inc cam radius"); radius+=delR; render();  break;}
        case "a" : {console.log("dec cam radius"); if(radius<=2) {radius=2;} else {radius-=delR;} render(); break;}
        case "w" : {console.log("inc height"); height+=delH; render(); break;}
        case "s" : {console.log("dec height"); height-=delH; render(); break;}
        case "e" : {console.log("rotate left"); theta-=delT; render(); break;}
        case "d" : {console.log("rotate right"); theta+=delT; render(); break;}
        case "Q" : {console.log("inc cam radius"); radius+=delR; render();  break;}
        case "A" : {console.log("dec cam radius"); if(radius<=2) {radius=2;} else {radius-=delR;} render(); break;}
        case "W" : {console.log("inc height"); height+=delH; render(); break;}
        case "S" : {console.log("dec height"); height-=delH; render(); break;}
        case "E" : {console.log("rotate left"); theta-=delT; render(); break;}
        case "D" : {console.log("rotate right"); theta+=delT; render(); break;}

        case "0" : {console.log("inc cam radius"); lightRadius+=delR*5; render();  break;}
        case "9" : {console.log("dec cam radius"); lightRadius-=delR*5; render(); break;}
        case "o" : {console.log("inc height"); lightHeight+=delH*5; render(); break;}
        case "l" : {console.log("dec height"); lightHeight-=delH*5; render(); break;}
        case "i" : {console.log("rotate left"); lightAngle-=delT; render(); break;}
        case "p" : {console.log("rotate right"); lightAngle+=delT; render(); break;}
        case "O" : {console.log("inc height"); lightHeight+=delH*5; render(); break;}
        case "L" : {console.log("dec height"); lightHeight-=delH*5; render(); break;}
        case "I" : {console.log("rotate left"); lightAngle-=delT; render(); break;}
        case "P" : {console.log("rotate right"); lightAngle+=delT; render(); break;}

        case "r" : {console.log("reset"); reset(); break;}

        case "1" : {console.log("inc delta radius");  delR+= 0.1; break;}
        case "2" : {console.log("dec delta radius"); {if(delR>=0.2) delR-= 0.1; } break;}
        case "3" : {console.log("inc delta height"); delH+= 0.1; break;}
        case "4" : {console.log("dec delta height"); {if(delH>=0.2) delH-= 0.1;} break;}
        case "5" : {console.log("inc delta rotate"); delT+= 0.1; break;}
        case "6" : {console.log("dec delta rotate"); {if(delT>=0.2) delT-= 0.1;} break;}
    }
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    modelVertices=[];
    modelPoints = [];
    modelFaces = [];
    modelColors = [];
    vertexNormals =[];
    eye = vec3(radius*Math.sin(theta+yValue)*Math.cos(phi), (height+xValue), radius*Math.cos(theta+yValue));
    lightPosition = vec3(radius*Math.sin(theta)*Math.cos(phi), height+1, radius*Math.cos(theta));
    secondaryLightPosition = vec3(lightRadius*Math.sin(lightAngle+lightYValue)*Math.cos(0), lightHeight+lightXValue, lightRadius*Math.cos(lightAngle+lightYValue));
    model("bound-bunny_5k.smf");
    if(matProperty==0){
        materialAmbient = vec3(0.6, 0.2, 0.2);
        materialDiffuse = vec3(1.0,0.576,0.722);
        materialSpecular = vec3(0.8, 0.8, 0.8);
        materialShininess = 80.0;
    }
    if(matProperty==1){
        materialAmbient = vec3(0.5, 0.3, 0.5);
        materialDiffuse = vec3(0.992,0.702,0.161);
        materialSpecular = vec3(0.8, 0.4, 0.2);
        materialShininess = 6;
    }
    if(matProperty==2){
        materialAmbient = vec3(0.0, 1, 1);
        materialDiffuse = vec3(0.51,0.808,0.831);
        materialSpecular = vec3(0.0, 0.2, 0.2);
        materialShininess = 30;
    }
    setScene();
    
    console.log(secondaryLightPosition);
    modMat = lookAt(eye, at, up);
    projMat=ortho(-1, 1, -1, 1, near, far);
    gl.uniformMatrix4fv(modMatLoc, false, flatten(modMat));
    gl.uniformMatrix4fv(projMatLoc, false, flatten(projMat));
    gl.drawArrays( gl.TRIANGLES, 0, modelPoints.length );
}


var canvas, gl;

var modelVertices=[];
var modelPoints = [];
var modelFaces = [];
var modelColors = [];
var  vertexNormals =[];

var shaderProgram = -1;
var cBuffer, normalLoc, vBuffer, positionLoc, modMatLoc, projMatLoc, vertexArrayObj;
modMat=mat4();
projMat=mat4();
eye=vec3(1.0, 1.0, 1.0);
at=vec3(0.0, 0.0, 0.0);
up=vec3(0.0, 1.0, 0.0);

var materialAmbient, materialDiffuse, materialSpecular, materialShininess;
materialAmbient = vec3(0.6, 0.2, 0.2);
materialDiffuse = vec3(0.9, 0.1, 0.1);
materialSpecular = vec3(0.8, 0.8, 0.8);
materialShininess = 80.0;

var lightAmbient, lightDiffuse, lightSpecular;
var lightPosition=vec3(0,0,0);
lightAmbient = vec3(0.2, 0.2, 0.2);
lightDiffuse  = vec3(0.6, 0.6, 0.6);
lightSpecular = vec3(1.0, 1.0, 1.0);

var secondaryLightPosition = vec3(-4, 5, -2);
var secondaryLightAmbient = vec3(0.4, 0.2, 0.2);
var secondaryLightDiffuse  = vec3(0.3, 0.0, 0.2);
var secondaryLightSpecular = vec3(0.6, 0.4, 0.6);

var lightHeight = 2;
var lightAngle = 5;
var lightRadius = 10;

var vshader = "./phong-vshader.glsl";
var fshader = "./phong-fshader.glsl";
var xValue=0.0;
var yValue=0.0;
var lightXValue=0.0;
var lightYValue=0.0;

near = 1;
far = 100;
radius = 2;
theta = 0; 
phi = 0;    
fov = 50;
aspect = 1;

delH = 0.1;
delR = 0.1;
delT = 0.1;

var height=radius*Math.sin(theta)*Math.sin(phi);

var modelName = 0;
var matProperty = 0;
var lighting=0;


function reset(){
    radius = 2;
    theta = 0; 
    height=radius*Math.sin(theta)*Math.sin(phi);
    delH = 0.1;
    delR = 0.1;
    delT = 0.1;
    lightHeight = 2;
    lightAngle = 5;
    lightRadius = 10;
    render();
} 

function setShader(){
    shaderProgram = initShaders( gl,vshader, fshader);
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
    
    var ambientProduct= mult(lightAmbient, materialAmbient);
    var diffuseProduct= mult(lightDiffuse, materialDiffuse);
    var specularProduct= mult(lightSpecular, materialSpecular);

    var secondaryAmbientProduct= mult(secondaryLightAmbient, materialAmbient);
    var secondaryDiffuseProduct= mult(secondaryLightDiffuse, materialDiffuse);
    var secondarySpecularProduct= mult(secondaryLightSpecular, materialSpecular);

    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"ambientProduct"), flatten(ambientProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"diffuseProduct"), flatten(diffuseProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"specularProduct"), flatten(specularProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lightPosition"),flatten(lightPosition));

    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"secondaryAmbientProduct"), flatten(secondaryAmbientProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"secondaryDiffuseProduct"), flatten(secondaryDiffuseProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"secondarySpecularProduct"), flatten(secondarySpecularProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "secondaryLightPosition"),flatten(secondaryLightPosition));

    gl.uniform1f(gl.getUniformLocation(shaderProgram, "shininess"),materialShininess);

    vertexArrayObj = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObj);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(modelColors), gl.STATIC_DRAW);

    gl.vertexAttribPointer( normalLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(modelPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
}


window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.129,0.149,0.318, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //const bodyElement = document.querySelector("body");
    //bodyElement.addEventListener("keydown", keyDown, false); 
    const xSlider = document.getElementById("x-rotation");
    xSlider.value=0;
    xSlider.oninput = function(){
        xValue=this.value*delT;
        render();
    }  
    const ySlider = document.getElementById("y-rotation");
    ySlider.value=0;
    ySlider.oninput = function(){
        yValue=this.value*delH;
        render();
    }   
    const lightXSlider = document.getElementById("light-x-rotation");
    lightXSlider.value=0;
    lightXSlider.oninput = function(){
        lightXValue=this.value*delT;
        render();
    }  
    const lightYSlider = document.getElementById("light-y-rotation");
    lightYSlider.value=0;
    lightYSlider.oninput = function(){
        lightYValue=this.value*delH;
        render();
    }   
    const matMenu = document.getElementById("material");
    matMenu.selectedIndex=0;
    matMenu.addEventListener('change', ()=>{
        matProperty = matMenu.selectedIndex;
        render();
    }); 
    render();
}