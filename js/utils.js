

// this file put some javascript functions

function getRotateMatrixByAxes(  ms,  mr )
{

  var ms11 = ms.elements[0];
  var ms21 = ms.elements[1];
  var ms31 = ms.elements[2];
  
  var ms12 = ms.elements[3];
  var ms22 = ms.elements[4];
  var ms32 = ms.elements[5];
  
  var ms13 = ms.elements[6];
  var ms23 = ms.elements[7];
  var ms33 = ms.elements[8];
  
  var mr11 = mr.elements[0];
  var mr21 = mr.elements[1];
  var mr31 = mr.elements[2];
  
  var mr12 = mr.elements[3];
  var mr22 = mr.elements[4];
  var mr32 = mr.elements[5];
  
  var mr13 = mr.elements[6];
  var mr23 = mr.elements[7];
  var mr33 = mr.elements[8];
  
  var R = new THREE.Matrix3();
  
  R.set(
        new THREE.Vector3( ms11, ms21, ms31 ).dot( new THREE.Vector3( mr11, mr21, mr31) ),
        new THREE.Vector3( ms11, ms21, ms31 ).dot( new THREE.Vector3( mr12, mr22, mr32) ),
        new THREE.Vector3( ms11, ms21, ms31 ).dot( new THREE.Vector3( mr13, mr23, mr33) ),

        new THREE.Vector3( ms12, ms22, ms32 ).dot( new THREE.Vector3( mr11, mr21, mr31) ),
        new THREE.Vector3( ms12, ms22, ms32 ).dot( new THREE.Vector3( mr12, mr22, mr32) ),
        new THREE.Vector3( ms12, ms22, ms32 ).dot( new THREE.Vector3( mr13, mr23, mr33) ),

        new THREE.Vector3( ms13, ms23, ms33 ).dot( new THREE.Vector3( mr11, mr21, mr31) ),
        new THREE.Vector3( ms13, ms23, ms33 ).dot( new THREE.Vector3( mr12, mr22, mr32) ),
        new THREE.Vector3( ms13, ms23, ms33 ).dot( new THREE.Vector3( mr13, mr23, mr33) ) 
      );
      
  return R; 
  
}

function eval_getRotateMatrixByAxes()
{ 

  var ms = new THREE.Matrix3();
  ms.set(
        0, 0, 1,
        0, 1, 0,
        1, 0, 0 
            );
  var mr = new THREE.Matrix3();
  mr.set(
        0, 1, 0,
        0, 0, 1,
        1, 0, 0 
            );
  var R = getRotateMatrixByAxes(mr, ms) 
  // output the result
  console.log('R');
  for(var i =0;i<9;i++)
  {
    console.log(i+' '+ R.elements[i]);
  }
}

function getCameraRT( cameraPosition, cameraPointAt, headup)
{
  var EPS = 1e-10;
  var vx0 = new THREE.Vector3( 1, 0, 0 );
  var vy0 = new THREE.Vector3( 0, 1, 0 );
  var vz0 = new THREE.Vector3( 0, 0, 1 );

  var vx;
  var vz  = cameraPointAt-cameraPosition; 
  var vz1 = vz/vz.norm();

  var vx1 ;
  var vy1 ; 

  if ( abs(vz.x)<EPS && abs(vz.z) <EPS)
  {
    console.log(' getCameraRT speical case ' );
    vx1 = new THREE.Vector3( 1, 0 , 0 );  
    vy1 = new THREE.Vector3( 0, 0 ,-1 );  
  }
  else
  {
    if (headup)
    {
      vx = new THREE.Vector3(0, 1, 0).cross( vz1 );
    }
    else
    {
      vx = new THREE.Vector3(0,-1, 0).cross( vz1 );
    }
    vx1 = vx/vx.norm();
  }

  var ms = new THREE.Matrix3();
  ms.set(
      vx0.x, vx0.y, vx0.z,
      vy0.x, vy0.y, vy0.z,
      vz0.x, vz0.y, vz0.z 
    );
  var mr = new THREE.Matrix3();
  mr.set(
      vx1.x, vx1.y, vx1.z,
      vy1.x, vy1.y, vy1.z,
      vz1.x, vz1.y, vz1.z 
  );
  var R  = getRotateMatrixByAxes ( ms, mr );
  var RC = R.inv().muliply(cameraPosition);

  var mtx = new THREE.Matrix4();
  mtx.set(
    R.elements[0], R.elements[1], R.elements[2], -RC.x, 
    R.elements[3], R.elements[4], R.elements[5], -RC.y, 
    R.elements[6], R.elements[7], R.elements[8], -RC.z, 
                0,             0,             0,     1
  );
  var mtxT = new THREE.Matrix4();
  mtxT.set(
    R.elements[0], R.elements[3], R.elements[6], cameraPosition.x, 
    R.elements[1], R.elements[4], R.elements[7], cameraPosition.y, 
    R.elements[2], R.elements[5], R.elements[8], cameraPosition.z, 
                0,             0,             0,                1
  );

  return [ mtx, mtxT ] ;
}


