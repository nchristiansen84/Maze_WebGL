// Grabbed cubeModel from https://github.com/esangel/WebGL and modified it to be able to apply texture to the cube
"use strict";

function texturedCubeModel(walls){
	var results={};

	var numVertices = 0;
	var texSize = 64;

	var points = [];
	var normals = [];
	var colors = [];
	var texCoords = [];

	var originalVertices = [
		vec4( -0.5, -0.5,  0.5, 1.0 ),
		vec4( -0.5,  0.5,  0.5, 1.0 ),
		vec4(  0.5,  0.5,  0.5, 1.0 ),
		vec4(  0.5, -0.5,  0.5, 1.0 ),
		vec4( -0.5, -0.5, -0.5, 1.0 ),
		vec4( -0.5,  0.5, -0.5, 1.0 ),
		vec4(  0.5,  0.5, -0.5, 1.0 ),
		vec4(  0.5, -0.5, -0.5, 1.0 )
	];
	var vertices =[
		vec4( -0.5, -0.5,  0.5, 1.0 ),
		vec4( -0.5,  0.5,  0.5, 1.0 ),
		vec4(  0.5,  0.5,  0.5, 1.0 ),
		vec4(  0.5, -0.5,  0.5, 1.0 ),
		vec4( -0.5, -0.5, -0.5, 1.0 ),
		vec4( -0.5,  0.5, -0.5, 1.0 ),
		vec4(  0.5,  0.5, -0.5, 1.0 ),
		vec4(  0.5, -0.5, -0.5, 1.0 )
	];

	var vertexColors = [
		vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
		vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
		vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
		vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
		vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
		vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
		vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
		vec4( 1.0, 1.0, 1.0, 1.0 )   // white
	];
	
	var texCoord = [
		vec2(0, 0),
		vec2(0, 0.5),
		vec2(0.5, 0.5),
		vec2(0.5, 0),

		vec2(0.5, 0.5),
		vec2(0.5, 0),
		vec2(0, 0),
		vec2(0, 0.5),
		
		vec2(0.5, 0.5),
		vec2(0.5, 1),
		vec2(1, 1),
		vec2(1, 0.5),

		vec2(0, 0.5),
		vec2(0, 1),
		vec2(0.5, 1),
		vec2(0.5, 0.5)
	];

	function initializeVertices(){
		for (var i=0; i<vertices.length; i++){
			for (var j=0; j<4; j++){
				vertices[i][j] = originalVertices[i][j];
			}
		}
	}

	function textureWall()
	{
		if(walls[0] == 0)
			quad(1, 0, 3, 2, 4); //north
		if(walls[3] == 0)
			quad(2, 3, 7, 6, 0); //west
		quad(3, 0, 4, 7, 8); //bottom
		quad(6, 5, 1, 2, 12); //top
		if(walls[2] == 0)
			quad(4, 5, 6, 7, 0); //south
		if(walls[1] == 0)
			quad(5, 4, 0, 1, 4); //east
	}

	function quad(a, b, c, d, loc) {
		var t1 = subtract(vertices[b], vertices[a]);
		var t2 = subtract(vertices[c], vertices[b]);
		var normal = cross(t1, t2);
		var normal = vec3(normal);
		
		
		points.push(vertices[a]);
		colors.push(vertexColors[a]);
		texCoords.push(texCoord[loc]);
		normals.push(normal);

		points.push(vertices[b]);
		colors.push(vertexColors[a]);
		texCoords.push(texCoord[loc+1]);
		normals.push(normal);

		points.push(vertices[c]);
		colors.push(vertexColors[a]);
		texCoords.push(texCoord[loc+2]);
		normals.push(normal);

		points.push(vertices[a]);
		colors.push(vertexColors[a]);
		texCoords.push(texCoord[loc]);
		normals.push(normal);

		points.push(vertices[c]);
		colors.push(vertexColors[a]);
		texCoords.push(texCoord[loc+2]);
		normals.push(normal);

		points.push(vertices[d]);
		colors.push(vertexColors[a]);
		texCoords.push(texCoord[loc+3]);
		normals.push(normal);

		numVertices += 6;
	}

	function translate(dx, dy, dz){
		for(var i=0; i<8; i++) {
			vertices[i][0] += dx;
			vertices[i][1] += dy;
			vertices[i][2] += dz;
		};
	}

	function scale(sx, sy, sz){
		for(var i=0; i<8; i++) {
			vertices[i][0] *= sx;
			vertices[i][1] *= sy;
			vertices[i][2] *= sz;
		};
	};

	function rotate( angle, axis) {
		var d = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);

		var x = axis[0]/d;
		var y = axis[1]/d;
		var z = axis[2]/d;

		var c = Math.cos( radians(angle) );
		var omc = 1.0 - c;
		var s = Math.sin( radians(angle) );

		var mat = [
			[ x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s ],
			[ x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s ],
			[ x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c ]
		];

		for(var i=0; i< vertices.length; i++) {
			var t = [0, 0, 0];
			for( var j =0; j<3; j++)
				for( var k =0 ; k<3; k++)
					t[j] += mat[j][k]*vertices[i][k];
			for( var j =0; j<3; j++) 
				vertices[i][j] = t[j];
		};
	}

	textureWall();

	results.points = points;
	results.normals = normals;
	results.colors = colors;
	results.texCoords = texCoords;

	results.translate = translate;
	results.rotate = rotate;
	results.scale = scale;
	results.numVertices = numVertices;
	results.reset = initializeVertices;

	return results;
};
