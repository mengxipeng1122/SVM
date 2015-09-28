////////////////////////////////////////////////////////////////////////////////
// some configure variables

var loadTextures = false;
var screenWidth  = 720;
var screenHeight = 480;

var cameraWidth  = 720;
var cameraHeight = 576;

var sourceCameraMaxRadius = [ 223.5400,  232.3587,  216.0200,  220.1189 ];
var sourceCameraCentroids = [ 
        new THREE.Vector2( 363.0831  , 276.2352 ) ,
        new THREE.Vector2( 346.2323  , 296.3118 ) ,
        new THREE.Vector2( 362.3837  , 275.7586 ) ,
        new THREE.Vector2( 350.5791  , 270.7908 ) ,
       ];
var sourceCameraMatries   = [
        new THREE.Matrix4(),
        new THREE.Matrix4(),
        new THREE.Matrix4(),
        new THREE.Matrix4(),
       ];

// initial all matries
sourceCameraMatries[0].set(
       213.159013191336,         291.784798718661,         231.709935655638,         8492378.57446373,
      -4.73344790102066,         356.022406455844,        -6.46415452881334,         6936956.72215477,
    -0.0429749570104113,        0.786507434053093,        0.616083768045525,         22384.8920675525,
                     0.,                       0.,                       0.,                       1. 
    );

sourceCameraMatries[1].set(

       -239.168019075949,         274.874692348556,        -176.729360154799,        -12513499.3346437,
       -21.3701660826391,         355.479749108392,         13.3855578697136,          9104331.2560586,
     -0.0866947667606109,         0.84802924794289,       -0.522810110890885,        -36560.3929826117,
                      0.,                       0.,                       0.,                      -1. 
    );

sourceCameraMatries[2].set(
      -211.637030127258,         306.147934432566,         208.957361187573,         16489985.5981204,
       29.9191927917387,         354.935864664492,        -12.9106894736759,         7389812.38525476,
     -0.566227918507329,        0.823016092331101,      -0.0450605821855691,         5543.76303680174,
                     0.,                       0.,                       0.,                       1. 
    );

sourceCameraMatries[3].set(
       214.224408825772,         291.740016770463,        -227.104187025555,        -13475871.6959159,
      -37.4548004992642,         357.611666199224,         15.4472679482157,         9966889.11774281,
      0.576696432734151,        0.815549578110809,       0.0479594632474782,         12416.4353417095,
                     0.,                       0.,                       0.,                       1. 
    );

var targetMatrixT = new THREE.Matrix4();
targetMatrixT.set(
     0,       -0.707106781186547,         0.707106781186547,                   -100000,
     0,        0.707106781186547,         0.707106781186547,                   -100000,
    -1,                        0,                         0,                    -59000,
     0,                        0,                         0,                         1
   );


   

////////////////////////////////////////////////////////////////////////////////

  function createStats()
  {
    var stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left     = '0';
    stats.domElement.style.top      = '0';

    return stats;
  }

  function createMesh(geom, imageFile) 
  {
    var texture = THREE.ImageUtils.loadTexture(imageFile);
    var mat = new THREE.MeshPhongMaterial();
    mat.map = texture;
  
    var mesh = new THREE.Mesh(geom, mat);
    return mesh;
  }


  function getSourceSynch(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
  };

  


    // once everything is loaded, we run our Three.js stuff.
    function init() 
    {


        // create a scene, that will hold all our elements such as objects, cameras and lights.
        var scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        var camera = new THREE.OrthographicCamera( screenWidth /-2, screenWidth / 2, screenHeight/ 2, screenHeight/-2, .1, 15000);
        // position and point the camera to the center of the scene
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 100;
        camera.lookAt(scene.position);
        scene.add(camera);

        // create a render and set the size
        var renderer = new THREE.WebGLRenderer();

        //renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
        renderer.setSize(screenWidth, screenHeight);
        renderer.shadowMapEnabled = true;

        // create the ground plane
        var planeGeometry = new THREE.PlaneGeometry(720, 576, 1, 1);
        var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
        // 
        var defines={};
        defines['USE_MAP']="";
        // some data texture 
        var textureParameterHi ;
        var textureParameterLo ;
        // all source image
        var textureSourceImage ;
        // world point 3D
        var textureWorldPointX ;
        var textureWorldPointY ;
        var textureWorldPointZ ;
        // testing
        var textureData        ;
        // mouse position
        //var mouseX = screenWidth/2;
        var mouseX = .2;
        // all source image
        textureSourceImage = THREE.ImageUtils.loadTexture('imgs/sourceImage.png');
        textureSourceImage.magFilter = THREE.NearestFilter;
        textureSourceImage.minFilter = THREE.NearestFilter;

        if (loadTextures)
        {
          // some data texture 
          textureParameterHi = THREE.ImageUtils.loadTexture('imgs/parameterHi.png');
          textureParameterLo = THREE.ImageUtils.loadTexture('imgs/parameterLo.png');
          // world point 3D
          textureWorldPointX = THREE.ImageUtils.loadTexture('imgs/world3DPointsX.png');
          textureWorldPointY = THREE.ImageUtils.loadTexture('imgs/world3DPointsY.png');
          textureWorldPointZ = THREE.ImageUtils.loadTexture('imgs/world3DPointsZ.png');
          // testing
          textureData        = THREE.ImageUtils.loadTexture('imgs/data.png'       );

          textureParameterHi.magFilter = THREE.NearestFilter;
          textureParameterLo.magFilter = THREE.NearestFilter;
          textureWorldPointX.magFilter = THREE.NearestFilter;
          textureWorldPointY.magFilter = THREE.NearestFilter;
          textureWorldPointZ.magFilter = THREE.NearestFilter;
          textureData       .magFilter = THREE.NearestFilter;

          textureParameterHi.minFilter = THREE.NearestFilter;
          textureParameterLo.minFilter = THREE.NearestFilter;
          textureWorldPointX.minFilter = THREE.NearestFilter;
          textureWorldPointY.minFilter = THREE.NearestFilter;
          textureWorldPointZ.minFilter = THREE.NearestFilter;
          textureData       .minFilter = THREE.NearestFilter;
        }

        var uniforms;
        uniforms={
          // some parameters
              targetImageWidth : { type: 'f', value : screenWidth },
              targetImageHeight: { type: 'f', value : screenHeight},
              sourceImageWidth : { type: 'f', value : cameraWidth },
              sourceImageHeight: { type: 'f', value : cameraHeight},
          // load all source images
              sourceImage      : { type: 't', value : textureSourceImage },
              targetMatrixT    : { type : 'm4' ,  value : targetMatrixT  },
          // some parameters 
              sourceCameraMaxRadius : { type : 'fv1',  value : sourceCameraMaxRadius },
              sourceCameraCentroids : { type : 'v2v',  value : sourceCameraCentroids },
              sourceCameraMatries   : { type : 'm4v',  value : sourceCameraMatries   },
          // mouse position
              mouseX                : { type : 'f',    value : mouseX           },

            };
        if(loadTextures)
        {
          // load all data for merge
          uniforms['dataParameterHi'] = { type: 't', value : textureParameterHi };
          uniforms['dataParameterLo'] = { type: 't', value : textureParameterLo };
          // world 3D points
          uniforms['world3DPointsX' ] = { type : 't',    value : textureWorldPointX  };
          uniforms['world3DPointsY' ] = { type : 't',    value : textureWorldPointY  };
          uniforms['world3DPointsZ' ] = { type : 't',    value : textureWorldPointZ  };
          // for testing 
          uniforms['data'           ] = { type : 't', value : textureData };
        }
        var vertexShader   =  getSourceSynch('assets/SVM.vs');
        var fragmentShader =  getSourceSynch('assets/SVM.fs');
        var material = new THREE.ShaderMaterial({
              defines          : defines
            , uniforms         : uniforms
            , vertexShader     : vertexShader
            , fragmentShader   : fragmentShader
          });

        var plane = new THREE.Mesh(planeGeometry, material);

        // rotate and position the plane
        plane.position.x = 0;
        plane.position.y = 0;
        plane.position.z = 0;

        // add the plane to the scene
        scene.add(plane);

        var mousePressed=false;

        var webGLOutputer = document.getElementById('WebGL-output');
        // add the output of the renderer to the html element
        webGLOutputer.appendChild(renderer.domElement);

        // add the mouse handle function for mouse input
        webGLOutputer.onmousedown = function (e)
          {
            mousePressed = true;     
          }
        webGLOutputer.onmouseup = function (e)
          {
            mousePressed = false;    
          }
        webGLOutputer.onmousemove = function (e)
          {
            if (mousePressed)
            {
               mouseX = e.layerX;
            }
          }

        // add FPS stats
        var stats = createStats();

        document.body.appendChild( stats.domElement);

        render();

        function render() 
        {
            requestAnimationFrame(render);

            uniforms.mouseX.value = mouseX;
            uniforms.mouseX.needsUpdate = true;

            renderer.render(scene, camera);
            stats.update();
        }

    }

    window.onload = init;

