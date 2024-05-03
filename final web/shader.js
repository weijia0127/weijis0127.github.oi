// noprotect

// https://github.com/ZRNOF/Shox
import * as Shox from "https://cdn.jsdelivr.net/npm/shox@1.0.0/src/Shox.js"

export const frag = `#version 300 es
  precision mediump float;

  uniform sampler2D tex0;
  uniform sampler2D tex1;
  uniform vec2 texelSize;
  uniform vec2 canvasSize;
  uniform vec2 mouse;
  uniform float time;

  ${Shox.noiseMath}
  ${Shox.snoise3D}
  ${Shox.displace}
  ${Shox.extend}
  ${Shox.pixelate}
  ${Shox.flip}

  float brightness(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  in vec2 vTexCoord;
  out vec4 fragColor;
  void main() {
    float t = time*.5;

    vec2 uv = vTexCoord;
    vec2 mo = mouse;
    vec2 grid = floor(vec2(200.*mo));

    vec2 puv = pixelate(uv, grid);
    vec2 noise = vec2(
      snoise(vec3(puv, t+100.)), snoise(vec3(puv, t))
    );
    vec2 duv = displace(puv, noise, 0., .15);
    vec4 img = texture(tex1, flipX(duv));

    vec4 col = vec4(0.);

    float bright = brightness(img.rgb);
    if (bright < .2) {
      col = vec4(0.);
    } else if (bright >= .2 && bright < .4) {
      col = vec4(0.);
    } else if (bright >= .4 && bright < .6) {
      vec2 cuv = uv*grid;
      cuv *= 1.;
      vec2 fuv = fract(cuv);
      vec2 iuv = floor(cuv);
      if (mod(iuv.x+iuv.y, 2.) == 0.) col = vec4(.0);
      else col = vec4(1.);
    } else if (bright >= .6 && bright < .8) {
      vec2 cuv = uv*grid;
      vec2 fuv = fract(cuv);
      vec2 iuv = floor(cuv);
      if (mod(iuv.y, 2.) == 0.) col = vec4(.0);
      else col = vec4(1.);
    } else if (bright >= .8 && bright < 1.) {
      vec2 cuv = uv*grid;
      vec2 fuv = fract(cuv);
      vec2 iuv = floor(cuv);
      if (mod(iuv.x, 2.) == 0.) col = vec4(.0);
      else col = vec4(1.);
    } else if (bright >= 1.) {
      col = vec4(1.);
    }

    fragColor = col;
  }
`

export const vert = `#version 300 es

  in vec4 aPosition;
  in vec2 aTexCoord;

  out vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    gl_Position = aPosition;
  }
`
