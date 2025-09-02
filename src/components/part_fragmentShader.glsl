precision lowp float;

uniform float uLightPosX;
uniform float uLightPosY;
uniform float uLightPower;
uniform float uShadowRound;
uniform float uShadowDirectional;

varying vec3 vPosition;

varying float vLightness;
varying float vPointInGlobalMod;

#define PI 3.141592
#define PI_2 6.283185

float cubicOut(float t) {
    float f = t - 1.0;
    return f * f * f + 1.0;
}

void main() {

    float rawStren = distance(gl_PointCoord, vec2(0.5));
    float strength = 1.0 - step(0.2, rawStren);

    vec2 lightPos = vec2(uLightPosX, uLightPosY);

    /* This creates fake shadows (dark pixels around particle with darker color at the side which is further from "light"). 
    Shadows are the most expensive part. m2 max can do 30fps@1mil with them and 70fps@1mil without them */

    /* Gradient from black center to transparent edge */
    vec4 backShadow = vec4(vec3(0.0), (1.0 - rawStren - 0.5));

    vec3 particleColor = vec3(vLightness);
    vec4 mainParticle = vec4(particleColor, strength);

    float pixelInTexture = atan(gl_PointCoord.y - 0.5, gl_PointCoord.x - 0.5);
    float pixelInTextureMod = mod(0.0 - pixelInTexture, PI_2) / PI_2;

    float angleDistance = distance(vPointInGlobalMod, pixelInTextureMod);

    float s1 = 0.3;
    float s2 = 0.01;
    float lightConeA = smoothstep(s1, s2, angleDistance);
    float lightConeB = smoothstep(1.0 - s1, 1.0 - s2, angleDistance);

    vec4 maskedShadow = mix(vec4(0.0) + backShadow * uShadowRound, backShadow * uShadowDirectional, lightConeA + lightConeB);

    gl_FragColor = maskedShadow + mainParticle * strength;
}