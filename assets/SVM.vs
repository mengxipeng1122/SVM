

varying vec3 v_texCoord;


void main() {

  gl_Position = vec4( position, 1.0 );

  v_texCoord = position;

}

