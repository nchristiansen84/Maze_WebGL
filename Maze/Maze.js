"use strict";
var canvas;
var gl;
var program;

var n = 10;
var m = 10;
var won = false;
var curCell = 100;
var fCount = 0;
var sCount = 5;
var turn = 3;
var direction = ["Southwest", "West", "Northwest", "North", "Northeast", "East", "Southeast", "South"];
var maze = [];
var walls = [];

var numVertices  = 0;

var points = [];
var colors = [];
var texCoords = [];

var texture;
var thetaLoc;

var near = 0.01;
var zfar = 100.0;
var radius = m+1;
var theta  = 0.0;
var phi    = 0.0;

var fovy = 40.0;
var aspect = 1.0;

var normals = [];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.5, 0.7, 0.9, 1.0 );
var lightDiffuse = vec4( 2.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.5, 0.5, 0.5, 1.0 );
var materialDiffuse = vec4( 1.0, 0.9, 0.5, 1.0);
var materialSpecular = vec4( 1.0, 0.9, 0.5, 1.0 );
var materialShininess = 60.0;
var ambientColor, diffuseColor, specularColor;
var viewerPos;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const at2 = vec3(-1.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function updateEye(eyePos){
	if(won)
		document.getElementById("direction").innerHTML = "YOU WON!";
	else
		document.getElementById("direction").innerHTML = direction[turn];
}

function createMaze(){
	for(var i=0; i<m; ++i){
		for(var j=0; j<n; ++j){
			var wall = texturedCubeModel(maze[i][j]);
			walls.push(wall);
			wall.rotate(-90, [0,1,0]);
			wall.translate(i,0,-j);
			points = points.concat(wall.points);
			normals = normals.concat(wall.normals);
			colors = colors.concat(wall.colors);
			texCoords = texCoords.concat(wall.texCoords);
			numVertices += wall.numVertices;
		}
	}
}

function genMaze(){
	var unvisited = [];
	for(var i=0; i<m; ++i){
		maze.push([]);
		unvisited.push([]);
		for(var j=0; j<n; ++j){
			maze[i][j] = [0,0,0,0];
			unvisited[i][j] = true;
		}
	}
	
	var numCells = n*m;
	var currentCell = [Math.floor(Math.random()*m), Math.floor(Math.random()*n)];
    var path = [currentCell];
    unvisited[currentCell[0]][currentCell[1]] = false;
	var visited = 1;
	
	while(visited < numCells){
		var pot = [[currentCell[0]-1, currentCell[1], 0, 2],
			[currentCell[0], currentCell[1]+1, 1, 3],
			[currentCell[0]+1, currentCell[1], 2, 0],
			[currentCell[0], currentCell[1]-1, 3, 1]];
		var neighbors = [];
        
        for(var l = 0; l < 4; l++){
            if (pot[l][0] > -1 && pot[l][0] < m && pot[l][1] > -1 && pot[l][1] < n && unvisited[pot[l][0]][pot[l][1]])
				neighbors.push(pot[l]);
        }
		
        if(neighbors.length){
            var next = neighbors[Math.floor(Math.random()*neighbors.length)];
            
            maze[currentCell[0]][currentCell[1]][next[2]] = 1;
            maze[next[0]][next[1]][next[3]] = 1;
            
            unvisited[next[0]][next[1]] = false;
            visited++;
            currentCell = [next[0], next[1]];
            path.push(currentCell);
        }
        else{
            currentCell = path.pop();
        }
	}
	
	maze[0][n-1][0] = 1;
	maze[m-1][0][2] = 1;
}

function atNorthWall(){
	if(curCell == 100){
		fCount++;
		if(fCount == 15){
			curCell -= 10;
			fCount = 0;
		}
	}
	else if(curCell == -1){
		won = true;
	}
	else {
		fCount++;
		if(fCount == 10){
			if(maze[Math.floor(curCell/10)][curCell%10][0] == 0){
				//console.log("WALL NORTH! - fCount["+fCount+"], curCell["+curCell+"]");
				fCount--;
				return true;
			}
			curCell -= 10;
			fCount = 0;
		}
		//console.log("No north wall - fCount["+fCount+"], curCell["+curCell+"]");
	}
	
	return false;
}

function atSouthWall(){
	if(curCell == 100){
		fCount--;
		if(fCount == -5){
			fCount++;
			return true;
		}
	}
	else {
		fCount--;
		if(fCount == 0){
			if(maze[Math.floor(curCell/10)][curCell%10][2] == 0){
				//console.log("WALL SOUTH! - fCount["+fCount+"], curCell["+curCell+"]");
				fCount++;
				return true;
			}
			fCount = 0;
			if(curCell == 100)
				fCount = 14;
		}
		else if(fCount == -1){
			curCell += 10;
			fCount = 9;
			if(curCell == 100)
				fCount = 14;
		}
		//console.log("No south wall - fCount["+fCount+"], curCell["+curCell+"]");
	}
	
	return false;
}

function atWestWall(){
	if(curCell == 100){
		sCount--;
		if(sCount == 0){
			sCount++;
			return true;
		}
	}
	else {
		sCount--;
		if(sCount == 0){
			if(maze[Math.floor(curCell/10)][curCell%10][3] == 0){
				//console.log("WALL WEST! - sCount["+sCount+"], curCell["+curCell+"]");
				sCount++;
				return true;
			}
			sCount = 0;
		}
		else if(sCount == -1){
			curCell -= 1;
			sCount = 9;
		}
		//console.log("No west wall - sCount["+sCount+"], curCell["+curCell+"]");
	}

	return false;
}

function atEastWall(){
	if(curCell == 100){
		sCount++;
		if(sCount == 10){
			sCount--;
			return true;
		}
	}
	else {
		sCount++;
		if(sCount == 10){
			if(maze[Math.floor(curCell/10)][curCell%10][1] == 0){
				//console.log("WALL EAST! - sCount["+sCount+"], curCell["+curCell+"]");
				sCount--;
				return true;
			}
			curCell += 1;
			sCount = 0;
		}
		//console.log("No east wall - sCount["+sCount+"], curCell["+curCell+"]");
	}

	return false;
}

function resetPosition(){
	won = false;
	curCell = 100;
	fCount = 0;
	sCount = 5;
	turn = 3;
	radius = m+1;
	theta  = 0.0;
	phi    = 0.0;
	at[0] = 0.0; at[1] = 0.0; at[2] = 0.0;
	at2[0] = -1.0; at2[1] = 0.0; at2[2] = 0.0;
	up[0] = 0.0; up[1] = 1.0; up[2] = 0.0;
}

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 0.9 );

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	genMaze();
	createMaze();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	
    viewerPos = vec3(0.0, 0.0, -20.0 );
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
	
    // Initialize a texture
    var image = new Image();
    image.onload = function() {
       configureTexture( image );
    }
    image.src = "cubeTexture.png"
    configureTexture( image );

    thetaLoc = gl.getUniformLocation(program, "theta");

	document.onkeydown = function handleKeyDown(event) {
		if(won){}
        else if(String.fromCharCode(event.keyCode) == "W") {
			if(!atNorthWall())
				radius -= 0.1;
        }
        else if(String.fromCharCode(event.keyCode) == "S") {
			if(!atSouthWall())
				radius += 0.1;
        }
        else if(String.fromCharCode(event.keyCode) == "A") {
			if(!atWestWall())
				theta += 0.1;
        }
        else if(String.fromCharCode(event.keyCode) == "D") {
			if(!atEastWall())
				theta -= 0.1;
        }
        else if(String.fromCharCode(event.keyCode) == "Q") {
			turn--;
			if(turn == -1)
				turn = 7;
			
			if(turn == 0){
				at2[0] = 1;
				at2[2] = 1;
			}
			else if(turn == 1){
				at2[0] = 0;
				at2[2] = 1;
			}
			else if(turn == 2){
				at2[0] = -1;
				at2[2] = 1;
			}
			else if(turn == 3){
				at2[0] = -1;
				at2[2] = 0;
			}
			else if(turn == 4){
				at2[0] = -1;
				at2[2] = -1;
			}
			else if(turn == 5){
				at2[0] = 0;
				at2[2] = -1;
			}
			else if(turn == 6){
				at2[0] = 1;
				at2[2] = -1;
			}
			else if(turn == 7){
				at2[0] = 1;
				at2[2] = 0;
			}
        }
        else if(String.fromCharCode(event.keyCode) == "E") {
			turn++;
			if(turn == 8)
				turn = 0;
			
			if(turn == 0){
				at2[0] = 1;
				at2[2] = 1;
			}
			else if(turn == 1){
				at2[0] = 0;
				at2[2] = 1;
			}
			else if(turn == 2){
				at2[0] = -1;
				at2[2] = 1;
			}
			else if(turn == 3){
				at2[0] = -1;
				at2[2] = 0;
			}
			else if(turn == 4){
				at2[0] = -1;
				at2[2] = -1;
			}
			else if(turn == 5){
				at2[0] = 0;
				at2[2] = -1;
			}
			else if(turn == 6){
				at2[0] = 1;
				at2[2] = -1;
			}
			else if(turn == 7){
				at2[0] = 1;
				at2[2] = 0;
			}
        }
    }
	
	document.getElementById("RestartMaze").onclick = function(){
		resetPosition();
	};
	
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

    render();
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform3fv(thetaLoc, flatten([0,0,0]));

    eye = vec3(radius,0, theta);
	at[0] = radius + at2[0];
	at[2] = theta + at2[2];
	
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, zfar);
	updateEye(eye);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);
}
