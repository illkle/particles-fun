precision lowp float;

uniform float time;
uniform float delta;

uniform float uSizeMod;
uniform float uTotalParticles;

#define PARTICLE_TTL 5.0

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 infoData = texture2D(textureInfo, uv);
  vec4 random = texture2D(textureRandom, uv);

  float timeBorn = infoData.x;
  float timeDead = infoData.y;

 /* Could be used to fade particles toward EoL etc.
  float progressTime = time - timeBorn;
  float willLiveForTime = timeDead - timeBorn;
  float percentOfLife = progressTime / willLiveForTime;
  */

  float curParticleNum = (gl_FragCoord.y - 1.0) * resolution.x + gl_FragCoord.x;
  float curTimePeriod = mod(time, PARTICLE_TTL);
  float allowedToReset = step(abs(curParticleNum / uTotalParticles - curTimePeriod / PARTICLE_TTL), 0.01);

  float isDead = step(timeDead, time);
  float doReset = allowedToReset * isDead;

  vec4 resetVal = vec4(time, time + PARTICLE_TTL - 0.5, 1.0, random.w * uSizeMod);
  vec4 keepVal = vec4(timeBorn, timeDead, 0.0, infoData.w);
  gl_FragColor = mix(keepVal, resetVal, doReset);

}