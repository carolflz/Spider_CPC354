// WebGL
var gl;
var program;
var canvas;

// Global variables
var isFileExist = false;
var isPlaying = false;
var isPlayingDefaultAnim = false;
var projectionMatrix;
var instanceMatrix;
var modelViewMatrix;
var modelViewMatrixLoc;

// Arrays for figure, stack of hierarchical model and vertices to draw
var figure = [];  
var stack = [];
var vertices = [];

// Indices of body parts of Japanese spider crab figure
var bodyId = 0;
var headId = 1;

var leftFrontUpperLegId = 2;
var leftFrontLowerLegId = 3;
var leftCenter1UpperLegId = 4;
var leftCenter1LowerLegId = 5;
var leftCenter2UpperLegId = 6;
var leftCenter2LowerLegId = 7;
var leftBackUpperLegId = 8;
var leftBackLowerLegId = 9;

var rightFrontUpperLegId = 10;
var rightFrontLowerLegId = 11;
var rightCenter1UpperLegId = 12;
var rightCenter1LowerLegId = 13;
var rightCenter2UpperLegId = 14;
var rightCenter2LowerLegId = 15;
var rightBackUpperLegId = 16;
var rightBackLowerLegId = 17;

var leftUpperClawId = 18;
var leftMiddleClawId = 19;
var leftLowerClawId = 20;

var rightUpperClawId = 21;
var rightMiddleClawId = 22;
var rightLowerClawId = 23;


// Numver of total body parts
var numNodes = 24; 

// Constant height and width values of nodes
const BODY_HEIGHT = 1.2;
const BODY_WIDTH = 5.0;
const BODY_LENGTH = 5.0;

const HEAD_HEIGHT = 1.5;
const HEAD_WIDTH = 1.5;
const HEAD_LENGTH = 2.0;

const UPPER_LEG_HEIGHT = 0.3;
const UPPER_LEG_WIDTH = 0.3;
const UPPER_LEG_LENGTH = 3.0;

const LOWER_LEG_HEIGHT = 0.3;
const LOWER_LEG_WIDTH = 0.3;
const LOWER_LEG_LENGTH = 5.0;

const UPPER_CLAW_HEIGHT = 0.3;
const UPPER_CLAW_WIDTH = 0.3;
const UPPER_CLAW_LENGTH = 5.0;

const MIDDLE_CLAW_HEIGHT = 0.3;
const MIDDLE_CLAW_WIDTH = 0.3;
const MIDDLE_CLAW_LENGTH = 1.2;

const LOWER_CLAW_HEIGHT = 0.3;
const LOWER_CLAW_WIDTH = 0.3;
const LOWER_CLAW_LENGTH = 4.0;

// Constant color values for each body part
const BODY_COLOR = vec4(221, 53, 42, 255);
const HEAD_COLOR = vec4(234, 115, 108, 255);
const FRONT_LEG_COLOR = vec4(239, 179, 175, 255);
const CENTER1_LEG_COLOR = vec4(239, 179, 175, 255);
const CENTER2_LEG_COLOR = vec4(239, 179, 175, 255);
const BACK_LEG_COLOR = vec4(239, 179, 175, 255);
const CLAW_COLOR = vec4(239, 179, 175, 255);

var curTranslateX;
var curTranslateY;
var curTranslateZ;
var curTheta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var translateX;
var translateY;
var translateZ;
var theta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var thetaList = [];
var transList = [];
var loadedThetaList = [];
var loadedTransList = [];
var defaultThetaList = [];
var defaultTransList = [];

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

//Lighting
var ambientProduct;
var diffuseProduct;
var specularProduct;
// light status 
//to determine how to calculate lighting or shading for different types of light sources
var isDirectional = true; 

//Initialize lighting and shading
var lightPosition = vec4(1.0, 2.0, 3.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// Material properties
var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var temp_matDiffuse;
var temp_matAmbient;
var temp_matSpecular;

// Variables used to link to vertex shader
var lightPositionLoc;
var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;
var shininessLoc;

var ambientProduct;
var diffuseProduct;
var specularProduct;

// Set the reflection coefficient for material ambient, diffuse, specular
var Kd = 1.0;
var Ka = 1.0;
var Ks = 1.0;
var KaLoc, KdLoc, KsLoc;

// Define the position of the camera (viewer's eye) in 3D space
var eye = vec3(1.0, 1.0, 1.0);

var radius = 4.0;
var far = 3.0;
var phi = 0.0;
var near = 0.3;
var dr = 5.0 * Math.PI/180.0;
var thetaCam = 0.0;
var aspect;   
var fovy = 45.0;  
var numNodes = 16;
var numAngles = 11;
var angle = 0;
var pointsArray = [];

var currentProgram;

function updateLightSource() {
  if (isDirectional) {
    // Set up directional light properties
    gl.uniform3fv(lightPositionLoc, vec3(1.0, 1.0, 1.0));
} else {
    // Set up point light properties
    gl.uniform3fv(lightPositionLoc, vec3(0.0, 0.0, 1.0));
}

  gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
  
  // Link to shininess of the material
  shininessLoc = gl.getUniformLocation(program, "shininess");

  // Link to coefficient of reflection
  KaLoc = gl.getUniformLocation(program, "Ka");
  KdLoc = gl.getUniformLocation(program, "Kd");
  KsLoc = gl.getUniformLocation(program, "Ks");

  render();
}

/***************************************************
 Convert hex value into suitable RGB format
****************************************************/
function convertHexToRGB(hex) {
  var r = parseInt(hex.substring(1, 3), 16) / 255;
  var g = parseInt(hex.substring(3, 5), 16) / 255;
  var b = parseInt(hex.substring(5, 7), 16) / 255;
  return vec4(r, g, b, 1.0); 
}

/***************************************************
  Init function of window
****************************************************/
window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL isn't available");

  // Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.width);
  gl.clearColor(0.24, 0.61, 0.93, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Initiating variables
  instanceMatrix = mat4();
  translateZ = 0;
  translateY = 0;
  translateX = 0;

  // Creating projection and model-view matrices
  projectionMatrix = perspective(90, 1, 0.02, 200);
  modelViewMatrix = lookAt(vec3(0, 4, -10), vec3(0, 1, 0), vec3(0, 1, 0));

  // Sending matrices to the shaders
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
  
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  
  cube();
  sliders();

  // var vBuffer = gl.createBuffer();
  // gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  // gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // var vPosition = gl.getAttribLocation( program, "vPosition" );
  // gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  // gl.enableVertexAttribArray( vPosition );

  // var cBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  // var vColor = gl.getAttribLocation( program, "vColor" );
  // gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
  // gl.enableVertexAttribArray( vColor );

  for (i = 0; i < numNodes; i++) 
    updateNodes(i);

  updateLightSource();
  attachEventListeners();
  render();
};

/***************************************************
  Render the Japanese spider crab figure  
****************************************************/
var render = function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(mult(lightAmbient, materialAmbient)));
  gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(mult(lightDiffuse, materialDiffuse)));
  gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(mult(lightSpecular, materialSpecular)));
  gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
  gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
  gl.uniform1f(shininessLoc, materialShininess);
  gl.uniform1f(KaLoc, Ka);
  gl.uniform1f(KdLoc, Kd);
  gl.uniform1f(KsLoc, Ks);

  // update all the body parts(node)
  for (var i = 0; i < theta.length; i++) {
    curTheta[i] = theta[i];
    updateNodes(i);
  }
  
  // move the Japanese spider crab
  curTranslateX = translateX;
  curTranslateY = translateY;
  curTranslateZ = translateZ;

  // go through the tree to render every body part in hierarchical order
  updateNodes(bodyId);
  traverse(bodyId);

  projectionMatrix = perspective(fovy, aspect, near, far);
    
  var isDirectionalLoc = gl.getUniformLocation(program, "isDirectional");
  gl.uniform1i(isDirectionalLoc, isDirectional ? 1 : 0);
  
  requestAnimFrame(render);
}

function changeCamera() {
  eye[0] = radius*Math.sin(thetaCam)*Math.cos(phi);
  eye[1] = radius*Math.sin(thetaCam)*Math.sin(phi);
  eye[2] = radius*Math.cos(thetaCam);
  modelViewMatrix = lookAt(eye, at, up);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  render();
}

function changeCameraPosition() {
  modelViewMatrix = lookAt(eye, at, up);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  render();
}

/***************************************************
  Modify the size of the body parts
****************************************************/
function scale4(a, b, c) {
  var result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
  return result;
}

/***************************************************
  Creates new nodes with different parameters
  to perform hierarchical modelling
****************************************************/
function createNode(transform, render, sibling, child) {
  var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  }
  return node;
}

/***************************************************
  Update the nodes according to the default rotation/
  translation parameter and user input
****************************************************/
function updateNodes(id) {
  var m = mat4();

  switch (id) {
    case bodyId:
      m = translate(-curTranslateX, curTranslateY, curTranslateZ);
      m = mult(m, rotate(curTheta[bodyId], 0, 1, 0));
      // orient the crab properly
      m = mult(m, rotate(-90, 0, 0, 1));
      m = mult(m, rotate(-75, 1, 0, 0));
      figure[bodyId] = createNode(m, body, null, headId);
      break;

    case headId:
      m = translate(-0.4, 1.2 * BODY_HEIGHT, 0.0);
      m = mult(m, rotate(curTheta[headId], 0, 0, 1));
      m = mult(m, translate(0.0, -0.8 * BODY_HEIGHT, 0.0));
      figure[headId] = createNode(m, head, leftFrontUpperLegId, leftUpperClawId);
      break;

    case leftUpperClawId:
      m = translate(-0.7, 0.5, 0.0); 
      m = mult(m, translate(0.0, 1, 0.0));
      m = mult(m, rotate(-curTheta[leftUpperClawId], 0, 0, 1));
      m = mult(m, translate(0.0, -1, 0.0));
      figure[leftUpperClawId] = createNode(m, leftUpperClaw, rightUpperClawId, leftMiddleClawId);
      break;
    
    case rightUpperClawId:
      m = translate(-0.7, 0.5, 0.0);
      m = mult(m, translate(0.0, 1, 0.0));
      m = mult(m, rotate(-curTheta[rightUpperClawId], 0, 0, 1));
      m = mult(m, translate(0.0, -1, 0.0));
      figure[rightUpperClawId] = createNode(m, rightUpperClaw, null, rightMiddleClawId);
      break;
  
    case leftMiddleClawId:
      m = translate(0.2, 1.2, -2.0);
      figure[leftMiddleClawId] = createNode(m, leftMiddleClaw, null, leftLowerClawId);
      break;

    case rightMiddleClawId:
      m = translate(0.2, 1.2, 2.0); 
      figure[rightMiddleClawId] = createNode(m, rightMiddleClaw, null, rightLowerClawId);
      break;
    
    case leftLowerClawId:
      m = translate(0.8, -0.5, 1.9);
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.0, 4.3, 0.0));
      m = mult(m, rotate(-curTheta[leftLowerClawId], 0, 0, 1));
      m = mult(m, translate(0.0, -4.3, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      figure[leftLowerClawId] = createNode(m, leftLowerClaw, null, null);
      break;

    case rightLowerClawId:
      m = translate(0.8, -0.5, -1.9); 
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.0, -4.3, 0.0));
      m = mult(m, rotate(-curTheta[rightLowerClawId], 0, 0, 1));
      m = mult(m, translate(0.0, 4.3, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      figure[rightLowerClawId] = createNode(m, rightLowerClaw, null, null);
      break;

    case leftFrontUpperLegId:
      m = translate(-1.1, -0.4, -0.5); 
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/1.3, 0.0));
      m = mult(m, rotate(-curTheta[leftFrontUpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/1.3, 0.0));
      figure[leftFrontUpperLegId] = createNode(m, leftFrontUpperLeg, leftCenter1UpperLegId, leftFrontLowerLegId);
      break;

    case leftCenter1UpperLegId:
      m = translate(-1.1, -2.2, -0.7);
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-curTheta[leftCenter1UpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      figure[leftCenter1UpperLegId] = createNode(m, leftCenter1UpperLeg, leftCenter2UpperLegId, leftCenter1LowerLegId);
      break;

    case leftCenter2UpperLegId:
      m = translate(-1.1, -4.0, -0.7);
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-curTheta[leftCenter2UpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      figure[leftCenter2UpperLegId] = createNode(m, leftCenter2UpperLeg, leftBackUpperLegId, leftCenter2LowerLegId);
      break;

    case leftBackUpperLegId:
      m = translate(-1.1, -5.8, -0.5);
      m = mult(m, translate(0.0, 3.85, 0.0));
      m = mult(m, rotate(-curTheta[leftBackUpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -3.85, 0.0));
      figure[leftBackUpperLegId] = createNode(m, leftBackUpperLeg, rightFrontUpperLegId, leftBackLowerLegId);
      break;

    case rightFrontUpperLegId:
      m = translate(-1.1, -0.4, 0.5);
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/1.3, 0.0));
      m = mult(m, rotate(-curTheta[rightFrontUpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/1.3, 0.0));
      figure[rightFrontUpperLegId] = createNode(m, rightFrontUpperLeg, rightCenter1UpperLegId, rightFrontLowerLegId);
      break;

    case rightCenter1UpperLegId:
      m = translate(-1.1, -2.2, 0.7);
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-curTheta[rightCenter1UpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      figure[rightCenter1UpperLegId] = createNode(m, rightCenter1UpperLeg, rightCenter2UpperLegId, rightCenter1LowerLegId);
      break;

    case rightCenter2UpperLegId:
      m = translate(-1.1, -4.0, 0.7);
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, rotate(-curTheta[rightCenter2UpperLegId], 0, 0, 1));
      m = mult(m, rotate(90, 1, 0, 0));
      figure[rightCenter2UpperLegId] = createNode(m, rightCenter2UpperLeg, rightBackUpperLegId, rightCenter2LowerLegId);
      break;

    case rightBackUpperLegId:
      m = translate(-1.1, -5.8, 0.5);
      m = mult(m, translate(0.0, 3.85, 0.0));
      m = mult(m, rotate(-curTheta[rightBackUpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -3.85, 0.0));
      figure[rightBackUpperLegId] = createNode(m, rightBackUpperLeg, null, rightBackLowerLegId);
      break;

    case leftFrontLowerLegId:
      m = translate(0.2, 3.0, -5.8);
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-curTheta[leftFrontLowerLegId], 0, 0, 1));
      m = mult(m, translate(-0.0, -LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.55, -2.2, 4.2));
      figure[leftFrontLowerLegId] = createNode(m, leftFrontLowerLeg, null, null);
      break;

    case leftCenter1LowerLegId:
      m = translate(0.2, 4.1, -6.0);
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-curTheta[leftCenter1LowerLegId], 0, 0, 1));
      m = mult(m, translate(-0.0, -LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(2.75, -3.0, 5.3));
      figure[leftCenter1LowerLegId] = createNode(m, leftCenter1LowerLeg, null, null);
      break;
    
    case leftCenter2LowerLegId:
      m = translate(0.2, 4.1, -6.0);
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-curTheta[leftCenter2LowerLegId], 0, 0, 1));
      m = mult(m, translate(-0.0, -LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(2.75, -3.0, 5.3))
      figure[leftCenter2LowerLegId] = createNode(m, leftCenter2LowerLeg, null, null);
      break;

    case leftBackLowerLegId:
      m = translate(0.2, 2.8, -5.6);
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-curTheta[leftBackLowerLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(2.75, -3.0, 5.3));
      figure[leftBackLowerLegId] = createNode(m, leftBackLowerLeg, null, null);
      break;

    case rightFrontLowerLegId:
      m = translate(0.2, 3.0, 5.8);
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.0, LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-curTheta[rightFrontLowerLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.55, -2.2, -4.2));
      figure[rightFrontLowerLegId] = createNode(m, rightFrontLowerLeg, null, null);
      break;

    case rightCenter1LowerLegId:
      m = translate(0.2, 4.1, 6.0);
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.0, LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-curTheta[rightCenter1LowerLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(2.75, -3.0, -5.3));
      figure[rightCenter1LowerLegId] = createNode(m, rightCenter1LowerLeg, null, null);
      break;

    case rightCenter2LowerLegId:
      m = translate(0.2, 4.1, 6.0);
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.0, LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-curTheta[rightCenter2LowerLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(2.75, -3.0, -5.3));
      figure[rightCenter2LowerLegId] = createNode(m, rightCenter2LowerLeg, null, null);
      break;

    case rightBackLowerLegId:
      m = translate(0.2, 2.8, 5.6);
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.0, LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(-curTheta[rightBackLowerLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -LOWER_LEG_LENGTH/2.2, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(2.75, -3.0, -5.3));
      figure[rightBackLowerLegId] = createNode(m, rightBackLowerLeg, null, null);
      break;
  }
}

/***************************************************
  Traverses the node tree recursively 
  and renders nodes using pushMatrix()/push() 
  and popMatrix()/pop() function
****************************************************/
function traverse(id) {
  if (id == null) 
    return;

  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[id].transform);
  figure[id].render();

  if (figure[id].child != null) 
    traverse(figure[id].child);
  modelViewMatrix = stack.pop();

  if (figure[id].sibling != null) 
    traverse(figure[id].sibling);
}

/***************************************************
  Functions to render the body parts (nodes)
****************************************************/
function body() {
  instanceMatrix = mult(modelViewMatrix, scale4(BODY_HEIGHT, BODY_LENGTH, BODY_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(BODY_COLOR);
}

function head() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 2.0* BODY_HEIGHT, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(HEAD_HEIGHT, HEAD_LENGTH, HEAD_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(HEAD_COLOR);
}

function leftUpperClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(120, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_CLAW_HEIGHT, UPPER_CLAW_LENGTH, UPPER_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function rightUpperClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-120, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_CLAW_HEIGHT, UPPER_CLAW_LENGTH, UPPER_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function leftMiddleClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(20, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-80, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(MIDDLE_CLAW_HEIGHT, MIDDLE_CLAW_LENGTH, MIDDLE_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function rightMiddleClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-20, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-80, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(MIDDLE_CLAW_HEIGHT, MIDDLE_CLAW_LENGTH, MIDDLE_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function leftLowerClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(110, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_CLAW_HEIGHT, LOWER_CLAW_LENGTH, LOWER_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function rightLowerClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-110, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_CLAW_HEIGHT, LOWER_CLAW_LENGTH, LOWER_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function leftFrontUpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(120, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(FRONT_LEG_COLOR);
}

function leftCenter1UpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER1_LEG_COLOR);
}

function leftCenter2UpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER2_LEG_COLOR);
}

function leftBackUpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(60, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(BACK_LEG_COLOR);
}

function rightFrontUpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-120, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(FRONT_LEG_COLOR);
}

function rightCenter1UpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-90, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER1_LEG_COLOR);
}

function rightCenter2UpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-90, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER2_LEG_COLOR);
}

function rightBackUpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-60, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(BACK_LEG_COLOR);
}

function leftFrontLowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 4.3, -4.2)); //y, x, z
  instanceMatrix = mult(instanceMatrix, rotate(120, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, translate(0.0, LOWER_LEG_LENGTH/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(60, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, translate(0.0, -LOWER_LEG_LENGTH/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(FRONT_LEG_COLOR);
}

function leftCenter1LowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, -4.45));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(60, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER1_LEG_COLOR);
}

function leftCenter2LowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, -4.45));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(60, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER2_LEG_COLOR);
}

function leftBackLowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, -4.45));
  instanceMatrix = mult(instanceMatrix, rotate(60, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(60, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(BACK_LEG_COLOR);
}

function rightFrontLowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 4.3, 4.2));
  instanceMatrix = mult(instanceMatrix, rotate(-120, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, translate(0.0, LOWER_LEG_LENGTH/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(60, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, translate(0.0, -LOWER_LEG_LENGTH/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(FRONT_LEG_COLOR);
}

function rightCenter1LowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, 4.45));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-60, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER1_LEG_COLOR);
}

function rightCenter2LowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, 4.45));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-60, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER2_LEG_COLOR);
}

function rightBackLowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, 4.45));
  instanceMatrix = mult(instanceMatrix, rotate(120, 1, 0, 0));
  instanceMatrix = mult(instanceMatrix, rotate(-60, 0, 0, 1));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(BACK_LEG_COLOR);
}

/***************************************************
  Draws body parts of figure (using cubes)  
****************************************************/
function drawBodyPart(color) {
  processBuffers(color, vertices, 4);
  for(var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

/***************************************************
  Custom scale function for mat4 type of matrices
****************************************************/
function scale4(a, b, c) {
  var result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
  return result;
}

/***************************************************
  Slider listeners
****************************************************/
function sliders() {
  document.getElementById("sliderBody").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("bodyText").value = sliderValue;
    theta[bodyId] = sliderValue;
    updateNodes(bodyId);
  };

  document.getElementById("sliderHead").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("headText").value = sliderValue;
    theta[headId] = sliderValue;
    updateNodes(headId);
  };

  document.getElementById("sliderLFU").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LFUText").value = sliderValue;
    theta[leftFrontUpperLegId] = sliderValue;
    updateNodes(leftFrontUpperLegId);
  };

  document.getElementById("sliderLFL").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LFLText").value = sliderValue;
    theta[leftFrontLowerLegId] = sliderValue;
    updateNodes(leftFrontLowerLegId);
  };

  document.getElementById("sliderLC1U").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LC1UText").value = sliderValue;
    theta[leftCenter1UpperLegId] = sliderValue;
    updateNodes(leftCenter1UpperLegId);
  };

  document.getElementById("sliderLC2U").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LC2UText").value = sliderValue;
    theta[leftCenter2UpperLegId] = sliderValue;
    updateNodes(leftCenter2UpperLegId);
  };

  document.getElementById("sliderLC1L").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LC1LText").value = sliderValue;
    theta[leftCenter1LowerLegId] = sliderValue;
    updateNodes(leftCenter1LowerLegId);
  };

  document.getElementById("sliderLC2L").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LC2LText").value = sliderValue;
    theta[leftCenter2LowerLegId] = sliderValue;
    updateNodes(leftCenter2LowerLegId);
  };

  document.getElementById("sliderLBU").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LBUText").value = sliderValue;
    theta[leftBackUpperLegId] = sliderValue;
    updateNodes(leftBackUpperLegId);
  };

  document.getElementById("sliderLBL").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LBLText").value = sliderValue;
    theta[leftBackLowerLegId] = sliderValue;
    updateNodes(leftBackLowerLegId);
  };

  document.getElementById("sliderRFU").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RFUText").value = sliderValue;
    theta[rightFrontUpperLegId] = sliderValue;
    updateNodes(rightFrontUpperLegId);
  };

  document.getElementById("sliderRFL").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RFLText").value = sliderValue;
    theta[rightFrontLowerLegId] = sliderValue;
    updateNodes(rightFrontLowerLegId);
  };

  document.getElementById("sliderRC1U").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RC1UText").value = sliderValue;
    theta[rightCenter1UpperLegId] = sliderValue;
    updateNodes(rightCenter1UpperLegId);
  };

  document.getElementById("sliderRC2U").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RC2UText").value = sliderValue;
    theta[rightCenter2UpperLegId] = sliderValue;
    updateNodes(rightCenter2UpperLegId);
  };

  document.getElementById("sliderRC1L").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RC1LText").value = sliderValue;
    theta[rightCenter1LowerLegId] = sliderValue;
    updateNodes(rightCenter1LowerLegId);
  };

  document.getElementById("sliderRC2L").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RC2LText").value = sliderValue;
    theta[rightCenter2LowerLegId] = sliderValue;
    updateNodes(rightCenter2LowerLegId);
  };

  document.getElementById("sliderRBU").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RBUText").value = sliderValue;
    theta[rightBackUpperLegId] = sliderValue;
    updateNodes(rightBackUpperLegId);
  };

  document.getElementById("sliderRBL").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RBLText").value = sliderValue;
    theta[rightBackLowerLegId] = sliderValue;
    updateNodes(rightBackLowerLegId);
  };

  document.getElementById("sliderLUC").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LUCText").value = sliderValue;
    theta[leftUpperClawId] = sliderValue;
    updateNodes(leftUpperClawId);
  };

  document.getElementById("sliderRUC").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RUCText").value = sliderValue;
    theta[rightUpperClawId] = sliderValue;
    updateNodes(rightUpperClawId);
  };

  document.getElementById("sliderLLC").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("LLCText").value = sliderValue;
    theta[leftLowerClawId] = sliderValue;
    updateNodes(leftLowerClawId);
  };

  document.getElementById("sliderRLC").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("RLCText").value = sliderValue;
    theta[rightLowerClawId] = -sliderValue;
    updateNodes(rightLowerClawId);
  };

  document.getElementById("sliderX").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("XText").value = sliderValue;
    translateX = sliderValue;
    updateNodes(bodyId);
  };

  document.getElementById("sliderY").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("YText").value = sliderValue;
    translateY = sliderValue;
    updateNodes(bodyId);
  };

  document.getElementById("sliderZ").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("ZText").value = sliderValue;
    translateZ = sliderValue;
    updateNodes(bodyId);
  };

  document.getElementById("diffuseSlider").oninput = function() {
    var x = document.getElementById("diffuseSlider").value;
    lightDiffuse = vec4(x, x, 0.1, 1.0);
    lightDiffusebp = vec4(x, x, 0.1, 1.0);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    // diffuseProductLoc = gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    updateLightSource();
  };

  document.getElementById("ambientSlider").oninput = function() {
    var x = document.getElementById("ambientSlider").value;
    lightAmbient = vec4(x, x, 0.1, 1.0);
    lightAmbientbp = vec4(x, x, 0.1, 1.0);
    ambientProduct = mult(lightAmbient, materialAmbient);
    // ambientProductLoc = gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    updateLightSource();    
  };

  document.getElementById("specularSlider").oninput = function() {
    var x = document.getElementById("specularSlider").value;
    lightSpecular = vec4(x, x, 0.1, 1.0);
    lightSpecularbp = vec4(x, x, 0.1, 1.0);
    specularProduct = mult(lightSpecular, materialSpecular);
    // specularProductLoc = gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    updateLightSource();
  };

  document.getElementById("materialDiffuse").oninput = function(){
    temp_matDiffuse  = this.value
    materialDiffuse  = convertHexToRGB(temp_matDiffuse);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
  };

  document.getElementById("materialAmbient").oninput = function(){
    temp_matAmbient = this.value
    materialAmbient = convertHexToRGB(temp_matAmbient);
    ambientProduct = mult(lightAmbient, materialAmbient);
  };

  document.getElementById("materialSpecular").oninput = function(){
    temp_matSpecular = this.value
    materialSpecular = convertHexToRGB(temp_matSpecular);
    specularProduct = mult(lightSpecular, materialSpecular);
  };

  document.getElementById("lightPosXSlider").oninput = function() {
    lightPosition[0] = parseFloat(this.value);
    updateLightSource();
  };
  
  document.getElementById("lightPosYSlider").oninput = function() {
      lightPosition[1] = parseFloat(this.value);
      updateLightSource();
  };
  
  document.getElementById("lightPosZSlider").oninput  = function() {
      lightPosition[2] = parseFloat(this.value);
      updateLightSource();
  };

  // Distance and point light
  document.getElementById("btn_toggle_position").addEventListener("click", function() {
    isDirectional = !isDirectional;
    lightPosition[3] = isDirectional ? 0.0 : 1.0;
    // Update button text
    this.textContent = isDirectional ? "Change to Point Light" : "Change to Distant Light";

    // Update the light source properties
    updateLightSource();

    // Render the scene
    render();
});

  
  document.getElementById("coeMDiffuse").oninput = function(){
  Kd = this.value;
  };

  document.getElementById("coeMSpecular").oninput = function(){
  Ka = this.value;
  };

  document.getElementById("coeMAmbient").oninput = function(){
  Ks = this.value;
  updateLightSource();
  };

// Update the shininess of the object
  document.getElementById("materialShininess").oninput = function(){
  materialShininess = this.value;
  };

  
}

function convertHexToRGB(hex) {
  var r = parseInt(hex.substring(1, 3), 16) / 255;
  var g = parseInt(hex.substring(3, 5), 16) / 255;
  var b = parseInt(hex.substring(5, 7), 16) / 255;
  return vec4(r, g, b, 1.0); 
}

/***************************************************
  Makes quadrilateral
****************************************************/
function quad(a, b, c, d) {
  vertices.push(cubeVertices[a]);
  vertices.push(cubeVertices[b]);
  vertices.push(cubeVertices[c]);
  vertices.push(cubeVertices[d]);
}

/***************************************************
  Simple cube creation with using quadrilaterals
****************************************************/
function cube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}

/***************************************************
  Vertices for drawing a simple cube
****************************************************/
var cubeVertices = [
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0)
];

/***************************************************
  Vertex buffers with colors
****************************************************/
function processBuffers(color, vertices, vSize) {
  var colors = [];
  
  // Create color array as much as vertices length
  for(var i = 0; i < vertices.length; i++)
    colors.push(color);

  // Load the color data into the GPU
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  // Associate out vertex color variables with our color buffer
  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  // Load the vertex data into the GPU
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, vSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
}

/***************************************************
  Changing the location and orientation of the camera via LookAt function.
****************************************************/
function attachEventListeners() {
  document.getElementById("cameraXSlider").addEventListener("input", function () {
    var sliderValue = parseFloat(this.value);
    eye[0] = sliderValue;
    updateCamera();
  });

  document.getElementById("cameraYSlider").addEventListener("input", function () {
    var sliderValue = parseFloat(this.value);
    eye[1] = sliderValue;
    updateCamera();
  });

  document.getElementById("cameraZSlider").addEventListener("input", function () {
    var sliderValue = parseFloat(this.value);
    eye[2] = sliderValue;
    updateCamera();
  });

  document.getElementById("flatShaderBtn").onclick = function() {
    switchShader("vertex-shader-flat", "fragment-shader-flat");
  };

  document.getElementById("phongShaderBtn").onclick = function() {
    switchShader("vertex-shader-smooth", "fragment-shader-smooth");
  };

  document.getElementById("defaultShaderBtn").onclick = function() {
    switchShader("vertex-shader", "fragment-shader");
  };
}

function updateCamera() {
  modelViewMatrix = lookAt(eye, at, up);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  render();
}

// function switchShader(vertexShaderId, fragmentShaderId) {
//   var newProgram = initShaders(gl, vertexShaderId, fragmentShaderId);
//   gl.useProgram(newProgram);
//   currentProgram = newProgram;

//   var vBuffer = gl.createBuffer();
//   gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
//   gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

//   var vPosition = gl.getAttribLocation( program, "vPosition" );
//   gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
//   gl.enableVertexAttribArray( vPosition );

//   var cBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

//   var vColor = gl.getAttribLocation( program, "vColor" );
//   gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
//   gl.enableVertexAttribArray( vColor );

//   for (i = 0; i < numNodes; i++) 
//     updateNodes(i);

//   updateLightSource();
//   // drawGround();
//   attachEventListeners();
//   render();
// }
