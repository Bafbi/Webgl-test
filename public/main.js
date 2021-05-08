const { mat2, mat3, mat4, vec2, vec3, vec4 } = glMatrix;

const canvas = document.getElementById("display");
const gl = canvas.getContext("webgl");

if (!gl) throw new Error("Pas de Webgl pour toi");

const vertexData = [
    // Front
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,

    // Left
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,

    // Back
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,

    // Right
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,

    // Top
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,

    // Bottom
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
];

function randomColor() {
    return [Math.random(), Math.random(), Math.random()];
}

let colorData = [];
for (let face = 0; face < 6; face++) {
    let faceColor = randomColor();
    for (let vertex = 0; vertex < 6; vertex++) {
        colorData.push(...faceColor);
    }
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

function loadTexture(url) {
    const texture = gl.createTexture();
    const image = new Image();
    image.src = "";
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
    vertexShader,
    `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform mat4 matrix;

void main() {
    vColor = color;
    gl_Position = matrix * vec4(position, 1);
}
`
);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
    fragmentShader,
    `
precision mediump float;

varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor,1);
}
`
);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

const uniformLocations = {
    matrix: gl.getUniformLocation(program, `matrix`),
};

const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(
    projectionMatrix,
    (75 * Math.PI) / 180, // vertical field-of-view (angle, radians)
    canvas.width / canvas.height, // aspect W/H
    1e-4, // near cull distance
    1e4 // far cull distance
);

const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();
//mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 8);
mat4.translate(modelMatrix, modelMatrix, [0, 0, -4]);
//mat4.translate(viewMatrix, viewMatrix, [-3, 0, 1]);
//mat4.scale(matrix, matrix, [0.5, 0.5, 0.5]);

mat4.invert(viewMatrix, viewMatrix);
function animate() {
    requestAnimationFrame(animate);
    //mat4.rotateZ(matrix, matrix, Math.PI / 2 / 60);
    //mat4.rotateX(matrix, matrix, Math.PI / 2 / 70);
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 2 / 80);

    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

animate();

window.addEventListener("keydown", (event) => {
    mat4.invert(viewMatrix, viewMatrix);
    const moveMatrix = mat4.create();
    if (event.code == "KeyD") mat4.translate(moveMatrix, moveMatrix, [0.1, 0, 0]);
    else if (event.code == "KeyA") mat4.translate(moveMatrix, moveMatrix, [-0.1, 0, 0]);
    else if (event.code == "KeyW") mat4.translate(moveMatrix, moveMatrix, [0, 0, -0.1]);
    else if (event.code == "KeyS") mat4.translate(moveMatrix, moveMatrix, [0, 0, 0.1]);
    console.log(moveMatrix);
    mat4.multiply(viewMatrix, viewMatrix, moveMatrix);
    mat4.invert(viewMatrix, viewMatrix);
});

canvas.addEventListener("mousemove", (event) => {
    if (canvasFocus) {
        mat4.invert(viewMatrix, viewMatrix);
        mat4.rotateY(viewMatrix, viewMatrix, (-Math.PI / 1536) * event.movementX);
        mat4.rotateX(viewMatrix, viewMatrix, (-Math.PI / 1536) * event.movementY);
        mat4.invert(viewMatrix, viewMatrix);
    }
});
let canvasFocus = false;
canvas.addEventListener("mousedown", () => {
    canvasFocus = true;
});
window.addEventListener("mouseup", () => {
    canvasFocus = false;
});
