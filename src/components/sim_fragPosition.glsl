precision lowp float;

uniform float time;
uniform float delta;
uniform vec3 uEmitter;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 position = texture2D(texturePosition, uv).xyz;
    vec4 infoData = texture2D(textureInfo, uv);

    float isFresh = infoData.z;
    position = mix(position, uEmitter, isFresh);

    vec3 velocity = texture2D(textureVelocity, uv).xyz;

    gl_FragColor = vec4(position + velocity * delta * 70.0, 0.0);

}
