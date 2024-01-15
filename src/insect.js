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

// Indices of body parts of spider figure
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


// Numver of total body parts (nodes) incomplete
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

var timet;
var timetLoc;
var interpolationFrame = 0;


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
  timet = 0;
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

  sliders();
  cube();

  for (i = 0; i < numNodes; i++) 
    updateNodes(i);

  // drawGround();
  render();
};

/***************************************************
  Render Function which includes animation and
    static picture of spider figure  
****************************************************/
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // drawGround();

  // if (isPlaying) {  // Animation
  //   if (timet < 1) {
  //     timet += 0.04;  // Speed of animation
  //   } else {
  //     interpolationFrame = (interpolationFrame + 1) % thetaList.length;
  //     timet = 0;
  //   }

  //   var curFrame = interpolationFrame;
  //   var nextFrame = (interpolationFrame + 1) % thetaList.length;

  //   for (var i = 0; i < theta.length; i++) {
  //     curTheta[i] = thetaList[curFrame][i] * (1 - timet) + thetaList[nextFrame][i] * timet;
  //     updateNodes(i);
  //   }

  //   curTranslateX = transList[curFrame][0] * (1 - timet) + transList[nextFrame][0] * timet;
  //   curTranslateY = transList[curFrame][1] * (1 - timet) + transList[nextFrame][1] * timet;
  //   curTranslateZ = transList[curFrame][2] * (1 - timet) + transList[nextFrame][2] * timet;
  //   updateNodes(bodyId);
  // } 
  
  // else if(isPlayingDefaultAnim) {
  //   if (timet < 1) {
  //     timet += 0.04;  // Speed of animation
  //   } else {
  //     interpolationFrame = (interpolationFrame + 1) % defaultThetaList.length;
  //     timet = 0;
  //   }

  //   var curFrame = interpolationFrame;
  //   var nextFrame = (interpolationFrame + 1) % defaultThetaList.length;

  //   for (var i = 0; i < theta.length; i++) {
  //     curTheta[i] = defaultThetaList[curFrame][i] * (1 - timet) + defaultThetaList[nextFrame][i] * timet;
  //     updateNodes(i);
  //   }

  //   curTranslateX = defaultTransList[curFrame][0] * (1 - timet) + defaultTransList[nextFrame][0] * timet;
  //   curTranslateY = defaultTransList[curFrame][1] * (1 - timet) + defaultTransList[nextFrame][1] * timet;
  //   curTranslateZ = defaultTransList[curFrame][2] * (1 - timet) + defaultTransList[nextFrame][2] * timet;
  //   updateNodes(bodyId);
  // }
  // else {  // Static picture
  for (var i = 0; i < theta.length; i++) {
    curTheta[i] = theta[i];
    updateNodes(i);
  }
  curTranslateX = translateX;
  curTranslateY = translateY;
  curTranslateZ = translateZ;
  updateNodes(bodyId);
  // }

  traverse(bodyId);
  requestAnimFrame(render);
}

/***************************************************
  Creates new nodes with different parameters:
    -transform matrix(transformation applied to the object)
    -render function(render the object)
    -sibling node(next object that is in the same hierarchy as the current object)
    -child node(next object that is in the lower hierarchy than the current object)
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
  Node updates according to user chosen 
    translation and rotation parameters
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
      m = translate(-0.7, 0.5, 0.0); // -y,z,-x
      // m = mult(m, rotate(120, 1, 0, 0));
      m = mult(m, translate(0.0, 1, 0.0));
      m = mult(m, rotate(-curTheta[leftUpperClawId], 0, 0, 1));
      m = mult(m, translate(0.0, -1, 0.0));
      // m = mult(m, rotate(-120, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
      figure[leftUpperClawId] = createNode(m, leftUpperClaw, rightUpperClawId, leftMiddleClawId);
      break;
    
    case rightUpperClawId:
      m = translate(-0.7, 0.5, 0.0); // -y,z,-x
      // m = mult(m, rotate(120, 1, 0, 0));
      m = mult(m, translate(0.0, 1, 0.0));
      m = mult(m, rotate(-curTheta[rightUpperClawId], 0, 0, 1));
      m = mult(m, translate(0.0, -1, 0.0));
      // m = mult(m, rotate(-120, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
      figure[rightUpperClawId] = createNode(m, rightUpperClaw, null, rightMiddleClawId);
      break;
  
    case leftMiddleClawId:
      m = translate(0.2, 1.2, -2.0); // -y,z,-x
      m = mult(m, rotate(-80, 1, 0, 0));
      m = mult(m, translate(0.0, 3.0, 0.0));
      // m = mult(m, rotate(-curTheta[leftMiddleClawId], 1, 0, 0));
      m = mult(m, translate(0.0, -3.0, 0.0));
      m = mult(m, rotate(80, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
      figure[leftMiddleClawId] = createNode(m, leftMiddleClaw, null, leftLowerClawId);
      break;

    case rightMiddleClawId:
      m = translate(0.2, 1.2, 2.0); // -y,z,-x
      m = mult(m, rotate(120, 1, 0, 0));
      m = mult(m, translate(0.0, 3.0, 0.0));
      // m = mult(m, rotate(-curTheta[rightMiddleClawId], 0, 0, 1));
      m = mult(m, translate(0.0, -3.0, 0.0));
      m = mult(m, rotate(-120, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
      figure[rightMiddleClawId] = createNode(m, rightMiddleClaw, null, rightLowerClawId);
      break;
    
    case leftLowerClawId:
      m = translate(0.8, -0.5, 1.9); // -y,z,-x
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.0, 4.3, 0.0));
      m = mult(m, rotate(-curTheta[leftLowerClawId], 0, 0, 1));
      m = mult(m, translate(0.0, -4.3, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
      figure[leftLowerClawId] = createNode(m, leftLowerClaw, null, null);
      break;

    case rightLowerClawId:
      m = translate(0.8, -0.5, -1.9); // -y,z,-x
      m = mult(m, rotate(-90, 1, 0, 0));
      m = mult(m, translate(0.0, -4.3, 0.0));
      m = mult(m, rotate(-curTheta[rightLowerClawId], 0, 0, 1));
      m = mult(m, translate(0.0, 4.3, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
      figure[rightLowerClawId] = createNode(m, rightLowerClaw, null, null);
      break;

    case leftFrontUpperLegId:
      m = translate(-1.1, -0.4, -0.5); // -y,z,-x
      // m = mult(m, rotate(120, 1, 0, 0));
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/1.3, 0.0));
      m = mult(m, rotate(-curTheta[leftFrontUpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/1.3, 0.0));
      // m = mult(m, rotate(-120, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
      figure[leftFrontUpperLegId] = createNode(m, leftFrontUpperLeg, leftCenter1UpperLegId, leftFrontLowerLegId);
      break;

    case leftCenter1UpperLegId:
      m = translate(-1.1, -2.2, -0.7); // -y,z,-x
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-curTheta[leftCenter1UpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
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
      // m = mult(m, rotate(30, 1, 0, 0));
      m = mult(m, translate(0.0, 3.85, 0.0));
      m = mult(m, rotate(-curTheta[leftBackUpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -3.85, 0.0));
      // m = mult(m, rotate(-30, 1, 0, 0));
      figure[leftBackUpperLegId] = createNode(m, leftBackUpperLeg, rightFrontUpperLegId, leftBackLowerLegId);
      break;

    case rightFrontUpperLegId:
      m = translate(-1.1, -0.4, 0.5);
      // m = mult(m, rotate(-120, 1, 0, 0));
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/1.3, 0.0));
      m = mult(m, rotate(-curTheta[rightFrontUpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/1.3, 0.0));
      // m = mult(m, rotate(120, 1, 0, 0));
      // m = mult(m, translate(-1.0, 0.0, 0));
      figure[rightFrontUpperLegId] = createNode(m, rightFrontUpperLeg, rightCenter1UpperLegId, rightFrontLowerLegId);
      break;

    case rightCenter1UpperLegId:
      m = translate(-1.1, -2.2, 0.7);
      m = mult(m, rotate(90, 1, 0, 0));
      m = mult(m, translate(0.0, UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-curTheta[rightCenter1UpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -UPPER_LEG_LENGTH/4, 0.0));
      m = mult(m, rotate(-90, 1, 0, 0));
      // m = mult(m, translate(0.0, -0.2, -1.8));
      figure[rightCenter1UpperLegId] = createNode(m, rightCenter1UpperLeg, rightCenter2UpperLegId, rightCenter1LowerLegId);
      break;

    case rightCenter2UpperLegId:
      m = translate(-1.1, -4.0, 0.7);
      m = mult(m, rotate(-90, 1, 0, 0));
      // m = mult(m, translate(0.0, LEG_HEIGHT/2, 0.0));
      m = mult(m, rotate(-curTheta[rightCenter2UpperLegId], 0, 0, 1));
      // m = mult(m, translate(0.0, -LEG_HEIGHT/2, 0.0));
      m = mult(m, rotate(90, 1, 0, 0));
      // m = mult(m, translate(0.0, -0.2, -1.8));
      figure[rightCenter2UpperLegId] = createNode(m, rightCenter2UpperLeg, rightBackUpperLegId, rightCenter2LowerLegId);
      break;

    case rightBackUpperLegId:
      m = translate(-1.1, -5.8, 0.5);
      // m = mult(m, rotate(-30, 1, 0, 0));
      m = mult(m, translate(0.0, 3.85, 0.0));
      m = mult(m, rotate(-curTheta[rightBackUpperLegId], 0, 0, 1));
      m = mult(m, translate(0.0, -3.85, 0.0));
      // m = mult(m, rotate(30, 1, 0, 0));
      figure[rightBackUpperLegId] = createNode(m, rightBackUpperLeg, null, rightBackLowerLegId);
      break;

    case leftFrontLowerLegId:
      m = translate(0.2, 3.0, -5.8); // -y,z,-x
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
    and renders nodes using pushMatrix()/push() and popMatrix()/pop() function
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
  Render functions of each nodes
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
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_CLAW_HEIGHT, UPPER_CLAW_LENGTH, UPPER_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function rightUpperClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-120, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_CLAW_HEIGHT, UPPER_CLAW_LENGTH, UPPER_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function leftMiddleClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(20, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-80, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(MIDDLE_CLAW_HEIGHT, MIDDLE_CLAW_LENGTH, MIDDLE_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function rightMiddleClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-20, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-80, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(MIDDLE_CLAW_HEIGHT, MIDDLE_CLAW_LENGTH, MIDDLE_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function leftLowerClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(110, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_CLAW_HEIGHT, LOWER_CLAW_LENGTH, LOWER_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function rightLowerClaw() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-110, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_CLAW_HEIGHT, LOWER_CLAW_LENGTH, LOWER_CLAW_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CLAW_COLOR);
}

function leftFrontUpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(120, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(FRONT_LEG_COLOR);
}

function leftCenter1UpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER1_LEG_COLOR);
}

function leftCenter2UpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, UPPER_LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -UPPER_LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER2_LEG_COLOR);
}

function leftBackUpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, -2.4));
  instanceMatrix = mult(instanceMatrix, rotate(60, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(BACK_LEG_COLOR);
}


function rightFrontUpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-120, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(FRONT_LEG_COLOR);
}

function rightCenter1UpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-90, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER1_LEG_COLOR);
}

function rightCenter2UpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-90, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(UPPER_LEG_HEIGHT, UPPER_LEG_LENGTH, UPPER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER2_LEG_COLOR);
}

function rightBackUpperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.5, 3.1, 2.4));
  instanceMatrix = mult(instanceMatrix, rotate(-60, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-10, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
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
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(60, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER1_LEG_COLOR);
}

function leftCenter2LowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, -4.45));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(60, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER2_LEG_COLOR);
}

function leftBackLowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, -4.45));
  instanceMatrix = mult(instanceMatrix, rotate(60, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(60, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
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
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-60, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER1_LEG_COLOR);
}

function rightCenter2LowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, 4.45));
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-60, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(LOWER_LEG_HEIGHT, LOWER_LEG_LENGTH, LOWER_LEG_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  drawBodyPart(CENTER2_LEG_COLOR);
}

function rightBackLowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(-0.55, 2.0, 4.45));
  instanceMatrix = mult(instanceMatrix, rotate(120, 1, 0, 0));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, LEG_HEIGHT/2, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-60, 0, 0, 1));
  // instanceMatrix = mult(instanceMatrix, translate(0.0, -LEG_HEIGHT/2, 0.0));
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
  Draws the ground (using cubes)  
****************************************************/
function drawGround() {
  var vertices = [
    vec3(-64, -0.8, -32),
    vec3(-64, -0.8, 32),
    vec3(64, -0.8, 32),
    vec3(64, -0.8, -32)
  ];

  instanceMatrix = mult(modelViewMatrix, scale4(BODY_WIDTH, BODY_HEIGHT, BODY_WIDTH));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

  processBuffers(vec4(46, 168, 34, 255), vertices, 3);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
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
  Vertex buffers without colors
****************************************************/
function processBuffers(vertices, vSize) {
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
  Vertex buffers with colors (Overload)
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

