// START: DEBUG FLAGS
const SHOW_FLOW_LAYER = false;
// END: DEBUG FLAGS

// START: CONFIG
const LINEAR_FILTERING = true; // True for smooth gradients and false for more pixelated output
const FAUCET_RING_RADIUS = 0.25; // Relative to min(width,height)
const FAUCET_BRUSH_RADIUS = 0.025; // Relative to min(width,height)
const FLOW_BRUSH_RADIUS = 0.05; // Relative to min(width,height)
const FLOW_BLUR_INTENSITY = 7.0;
const FLOW_SCALE_FACTOR = 1.001;
// END: CONFIG

let mainLayer, flowLayer;
let flowShader, blurShader;

const flowFrag = `precision highp float;
  varying vec2 vTexCoord;
  uniform sampler2D tex0;
  uniform sampler2D flowTex;
  uniform vec2 texelSize;
  uniform vec2 canvasSize;

  void main() {
    // Get the flow vector and flip it
		vec2 vFlow = (texture2D(flowTex, vTexCoord).xy - vec2(0.5,0.5)) * vec2(-40.0) / canvasSize;
		// Pick a color from the direction of the flow
    vec4 color = texture2D(tex0, vTexCoord+vFlow);
    gl_FragColor = vec4(color.rgb, 1.0);
  }`;

const blurFrag = `precision highp float;
  varying vec2 vTexCoord;
  uniform sampler2D tex0;
  uniform vec2 texelSize;
  uniform vec2 canvasSize;
	uniform float intensity;
	
	vec4 getAverageColor(vec2 pos){
		vec2 scaler = vec2(intensity)/canvasSize;
		vec4 c0 = texture2D(tex0, pos-vec2(0,0)*scaler);
		vec4 c1 = texture2D(tex0, pos-vec2(-1,0)*scaler);
		vec4 c2 = texture2D(tex0, pos-vec2(1,0)*scaler);
		vec4 c3 = texture2D(tex0, pos-vec2(0,-1)*scaler);
		vec4 c4 = texture2D(tex0, pos-vec2(0,1)*scaler);
		
		return (c0*0.5 + (c1+c2+c3+c4)*0.125);
	}

  void main() {
    vec4 color = getAverageColor(vTexCoord);
    gl_FragColor = vec4(color.rgb, 1.0);
  }`;

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	frameRate(60);
	pixelDensity(1);
	colorMode(HSB, 360, 100, 100, 100);
	
	// Initialize layers (framebuffers);
	mainLayer = createFramebuffer({
		format: FLOAT,
		depth: false,
		textureFiltering: LINEAR_FILTERING ? LINEAR : NEAREST
	});
	flowLayer = createFramebuffer({
		format: FLOAT,
		depth: false,
	});
	
	mainLayer.begin();
	background(0,0,0);
	mainLayer.end();
	
	flowLayer.begin();
	colorMode(RGB, 100);
	background(50,50,0);
	flowLayer.end();
	
	// Create flow shader
	flowShader = createFilterShader(flowFrag);
	
	// Create blur shader
	blurShader = createFilterShader(blurFrag);
	blurShader.setUniform("intensity", FLOW_BLUR_INTENSITY);
}

function draw() {
	const refSize = min(width,height);

	// Draw flow fields
	flowLayer.begin();
		// Slow zoom in on the flow
		push();
			imageMode(CENTER);
			scale(FLOW_SCALE_FACTOR);
			const offset = p5.Vector.fromAngle(frameCount/60).mult(0.1);
			image(flowLayer, offset.x, offset.y);
		pop();
	
		push();
			// Apply blur
			filter(blurShader);
	
			// Calculate flow vector from mouse
			const mv = createVector(mouseX-pmouseX, mouseY-pmouseY).limit(128);
			colorMode(RGB, 255);
			translate(-width/2, -height/2);
			// Set stroke color to velocity vector ( Red = X, Green = Y)
			stroke(mv.x+128, mv.y+128, 0);
			strokeWeight(refSize*FLOW_BRUSH_RADIUS);
			line(pmouseX, pmouseY, mouseX, mouseY);
		pop();
	flowLayer.end();

	mainLayer.begin();
		// Draw faucet
		push();
			strokeWeight(refSize*FAUCET_BRUSH_RADIUS);
			const radius = refSize*FAUCET_RING_RADIUS;
			for(let i=0, l=radius; i<l; i+=2){
				const t = i/l*TWO_PI + frameCount/30;
				const xi = cos(t)*radius;
				const yi = sin(t)*radius;
				const phase = sin(i/90-frameCount/60)**3;
				stroke((i+frameCount)%360, map(phase,-1,1,160,0), map(phase,-1,1, 0,160),25);
				point(xi,yi);
			}
		pop();
	
		// Update pixels
		flowShader.setUniform('flowTex', flowLayer);
		filter(flowShader);
	mainLayer.end();
	
	// Draw on main canvas
	if(SHOW_FLOW_LAYER){
		image(flowLayer, -width / 2, -height / 2);
	}
	else {
		image(mainLayer, -width / 2, -height / 2);
	}
}