

const float EPS=1e-6;
const float precis = 20.;

////////////////////////////////////////////////////////////////////////////////
// parameters
const float targetCameraFocusLen = 614.1118;
const vec3  targetCameraPosition = vec3( -100000., -100000., -59000. );
const vec3  targetCameraPointAt  = vec3(       0.,       0., -59000. );
const float headUp               = 1.;
const vec3  worldPlanePoint      = vec3( 0., 0., 0. );
const vec3  worldPlaneVector     = vec3( 0., 0., 1. );

////////////////////////////////////////////////////////////////////////////////
// input datas
varying vec3 v_texCoord;

////////////////////////////////////////////////////////////////////////////////
// all uniforms 
// all source images
uniform sampler2D sourceImage ;

// parameters
uniform float targetImageWidth ;
uniform float targetImageHeight;
uniform float sourceImageWidth ;
uniform float sourceImageHeight;

// all data for merging
uniform sampler2D dataParameterHi ;
uniform sampler2D dataParameterLo ;

// world points
uniform sampler2D world3DPointsX ;
uniform sampler2D world3DPointsY ;
uniform sampler2D world3DPointsZ ;

//  some parameters for source camera 
uniform float sourceCameraMaxRadius [4];
uniform vec2  sourceCameraCentroids [4];
uniform mat4  sourceCameraMatries   [4];

// some parameters for 3D points
uniform mat4 targetMatrixT ;

// some parameters for UI input
uniform float mouseX ;

// for testing 
uniform sampler2D data ;

// get the intersect point a ray ane a plane
//  return   1. -- intersect
//  return   0. -- not intersect
float getIntersectRayPlane ( in vec3 r0,  in vec3 rv,  in vec3 pp,  in vec3 pv, out vec3 ip )
{
  float d = dot(pp,pv);
  float t = (d-dot(r0, pv))/dot(rv, pv);
  ip = r0+t*rv;
  if(t>0.)
    return 1.;
  else
    return 0.;
}

float sdPlane ( vec3 p)
{
  return -(p.z);
}

float sdSphere( vec3 p, float s )
{
    return length(p)-s;
}

float map( in vec3 pos )
{

  float res;
  res = sdPlane ( pos );
  return res;
}

vec3 castRay ( in vec3 ro, in vec3 rd )
{
  float t = 0.;
  vec3 pos;
  rd = normalize( rd );
  pos = ro+rd*t;
  for( int i=0; i<50; i++ )
  {
    t = map( pos );
    pos = pos+rd*t;
    if( t<precis ) break;
  }

  if( t>precis )
    return vec3( 0. );
  else 
    return pos;
}

void showCrossSourceImageMap (vec2 uv)
{
  gl_FragColor = texture2D( sourceImage , uv);
}

vec3 getSourceColor ( float no, float x, float y, float alpha)
{
  vec3 color = vec3(0.); 
  vec2 uv;
  if (no>=-0.5 && no <0.5) { uv=vec2(x,y)*.5+vec2( .0, .5); color = texture2D( sourceImage, uv ).rgb; }
  if (no>= 0.5 && no <1.5) { uv=vec2(x,y)*.5+vec2( .5, .5); color = texture2D( sourceImage, uv ).rgb; }
  if (no>= 1.5 && no <2.5) { uv=vec2(x,y)*.5+vec2( .0, .0); color = texture2D( sourceImage, uv ).rgb; }
  if (no>= 2.5 && no <3.5) { uv=vec2(x,y)*.5+vec2( .5, .0); color = texture2D( sourceImage, uv ).rgb; }
  return  color*alpha;
}

// get data format a data png
float getValueFromTexture ( sampler2D arrayTexture, vec2 textureDimensions, vec2 xy) 
{
  //vec2 uv = xy / textureDimensions;
  vec2 uv = xy ;
  vec4 color = texture2D(arrayTexture, uv);
  float value; 
  float r = color.r * 255.;
  float g = color.g * 255.;
  float b = color.b * 255.;
  float a = color.a * 255.;
  if( a>=128. ) a -= 128.;
  
  value = r / 256.
        + g *   1.
        + b * 256.
        + a * 256. * 256.
        ;
  if(color.a>=.5) value*=-1.;
  return value;
}

void showMergeImage (vec2 uv)
{
  float hiAlpha = getValueFromTexture( dataParameterHi , vec2( targetImageWidth , targetImageHeight), uv*vec2(.5,.5)+vec2(.0,.5));
  float hiNo    = getValueFromTexture( dataParameterHi , vec2( targetImageWidth , targetImageHeight), uv*vec2(.5,.5)+vec2(.5,.5));
  float hiX     = getValueFromTexture( dataParameterHi , vec2( targetImageWidth , targetImageHeight), uv*vec2(.5,.5)+vec2(.0,.0));
  float hiY     = getValueFromTexture( dataParameterHi , vec2( targetImageWidth , targetImageHeight), uv*vec2(.5,.5)+vec2(.5,.0));

  float loAlpha = getValueFromTexture( dataParameterLo , vec2( targetImageWidth , targetImageHeight), uv*vec2(.5,.5)+vec2(.0,.5));
  float loNo    = getValueFromTexture( dataParameterLo , vec2( targetImageWidth , targetImageHeight), uv*vec2(.5,.5)+vec2(.5,.5));
  float loX     = getValueFromTexture( dataParameterLo , vec2( targetImageWidth , targetImageHeight), uv*vec2(.5,.5)+vec2(.0,.0));
  float loY     = getValueFromTexture( dataParameterLo , vec2( targetImageWidth , targetImageHeight), uv*vec2(.5,.5)+vec2(.5,.0));
  
  vec3 hiColor = getSourceColor ( hiNo, hiX/sourceImageWidth, 1.-hiY/sourceImageHeight, hiAlpha );
  vec3 loColor = getSourceColor ( loNo, loX/sourceImageWidth, 1.-loY/sourceImageHeight, loAlpha );

  gl_FragColor = vec4( hiColor + loColor , 1.);

}

void showDataPng ( sampler2D data, vec2 uv, float lowBound, float hiBound)
{
  float f = getValueFromTexture ( data  , vec2( targetImageWidth , targetImageHeight), uv);
  f-=lowBound;
  f/=(hiBound - lowBound);
  gl_FragColor=vec4(vec3(f),1.);
}

vec2 getSourceUndistortedImage ( float no , vec2 uv, vec2 imageSize )
{
  float maxRadius;
  if (no>=-0.5 && no <0.5) maxRadius = sourceCameraMaxRadius[0];
  if (no>= 0.5 && no <1.5) maxRadius = sourceCameraMaxRadius[1];
  if (no>= 1.5 && no <2.5) maxRadius = sourceCameraMaxRadius[2];
  if (no>= 2.5 && no <3.5) maxRadius = sourceCameraMaxRadius[3];

  vec2 centroid ; 
  if (no>=-0.5 && no <0.5) centroid = sourceCameraCentroids[0];
  if (no>= 0.5 && no <1.5) centroid = sourceCameraCentroids[1];
  if (no>= 1.5 && no <2.5) centroid = sourceCameraCentroids[2];
  if (no>= 2.5 && no <3.5) centroid = sourceCameraCentroids[3];

  vec3 color = vec3(0.); 
  vec2 sourceDiff = uv-imageSize*.5;
  float sd = sqrt( dot( sourceDiff, sourceDiff ) );
  float td = atan( sd / maxRadius )* maxRadius;
  float scale=1.;
  if(abs(sd)>0.)
  {
    scale=td/sd;
  }

  vec2 duv = centroid + scale*sourceDiff;
  return duv;

}

void show3DPoint ( float no, vec2 uv, vec3 point3D )
{
  mat4 mtx ; 

  if (no>=-0.5 && no <0.5) mtx = sourceCameraMatries [0] ;
  if (no>= 0.5 && no <1.5) mtx = sourceCameraMatries [1] ;
  if (no>= 1.5 && no <2.5) mtx = sourceCameraMatries [2] ;
  if (no>= 2.5 && no <3.5) mtx = sourceCameraMatries [3] ;

  vec4 pointTargetFrame = mtx * vec4 ( point3D, 1. )  ;

  vec2 point2D = pointTargetFrame.xy / pointTargetFrame.z ;
  if (pointTargetFrame.z < 0.) 
  {
    gl_FragColor = vec4 ( 0., 0. , 0. , 1. );
    return ;
  }

  vec2 duv = getSourceUndistortedImage (  no ,  point2D, vec2 ( targetImageWidth , targetImageHeight ) );

  duv /= vec2 ( sourceImageWidth, sourceImageHeight );
  duv = clamp(duv, 0., 1. );
  duv = duv*vec2(1., -1.)+vec2(0., 1.);
  if ( no > -0.5 && no < 0.5 ) duv = duv*.5+vec2(.0,.5);
  if ( no >  0.5 && no < 1.5 ) duv = duv*.5+vec2(.5,.5);
  if ( no >  1.5 && no < 2.5 ) duv = duv*.5+vec2(.0,.0);
  if ( no >  2.5 && no < 3.5 ) duv = duv*.5+vec2(.5,.0);
  gl_FragColor = texture2D( sourceImage , duv);
}

void showAll3DPoint ( vec2 uv )
{
  float px = getValueFromTexture ( world3DPointsX , vec2 ( targetImageWidth , targetImageHeight ) , uv ) ;
  float py = getValueFromTexture ( world3DPointsY , vec2 ( targetImageWidth , targetImageHeight ) , uv ) ;
  float pz = getValueFromTexture ( world3DPointsZ , vec2 ( targetImageWidth , targetImageHeight ) , uv ) ;

  vec3 point3D = vec3 ( px, py, pz );

  mat4 mtx ; 

  vec2 doff[4];
  doff[0] = vec2(.0,.5);
  doff[1] = vec2(.5,.5);
  doff[2] = vec2(.0,.0);
  doff[3] = vec2(.5,.0);

  float c =0.; 
  vec3 rgb = vec3(0.) ;

  for ( int i=0; i<4 ; i++ )
  {
    mtx = sourceCameraMatries [i] ;
    vec4 pointTargetFrame = mtx * vec4 ( point3D, 1. )  ;

    vec2 point2D = pointTargetFrame.xy / pointTargetFrame.z ;
    if (pointTargetFrame.z < 0.) 
    {
      continue ;
    }

    c+=1.;

    vec2 duv = getSourceUndistortedImage (  float(i) ,  point2D, vec2 ( targetImageWidth , targetImageHeight ) );

    duv /= vec2 ( sourceImageWidth, sourceImageHeight );
    duv = clamp(duv, 0., 1. );
    duv = duv*vec2(1., -1.)+vec2(0., 1.);
    duv = duv*.5+doff[i];
    rgb += texture2D( sourceImage , duv) . rgb;
  }

  
  gl_FragColor =  vec4(vec3(0.), 1.);

  if(c>0.)
  {
    gl_FragColor =  vec4( rgb/c, 1.);
  }



}

void showXYZ ()
{
  float zDst = 10000.;
  float focusLen = 227.;
  vec2 uv = (v_texCoord.xy+1.)*.5;
  uv*=vec2( targetImageWidth, targetImageHeight );
  vec3 r0 = vec3(0., 0., - focusLen -zDst );
  vec3 rd = normalize( vec3(uv, focusLen ) );

  vec3 pos = castRay (r0, rd);
  
  gl_FragColor = vec4( pos, 1. );

  uv = (v_texCoord.xy+1.)*.5;

  show3DPoint ( 0., uv, pos );
}


void main() {

  // showXYZ ();
  vec2 uv = (v_texCoord.xy+1.)*.5;

  // show 3D point with calculate point3D
  // get point3D 
  vec3 point3D;
  vec3 r0 = (targetMatrixT * vec4(0., 0., 0., 1.)).xyz;
  vec3 rv = (targetMatrixT * vec4(v_texCoord.x*targetImageWidth /2., 
                                  v_texCoord.y*targetImageHeight/2., 
                                  targetCameraFocusLen, 0.)).xyz;

  if( uv.x > mouseX / targetImageWidth )
  {
    getIntersectRayPlane( r0, rv, worldPlanePoint, worldPlaneVector, point3D); 
    
  }
  else
  {
    point3D = castRay( r0, rv );
    // show 3D point with new algorithm
  }

  show3DPoint ( 0. ,  uv , point3D ) ;

  //  gl_FragColor = texture2D( sourceImage , uv);
}

