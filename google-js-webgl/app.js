

var hash = window.location.hash || "#ig";


var loc;
var source;

var intialTilt = 0;
var intialZoom = 17.5;
var intialHeading;
var intialScaleY = 1;

var finalTilt = 45;
var finalZoom = 18;
var finalHeading;
var finalScaleY;

if(hash == "#ig") {
	loc = { lat: 28.6129, lng: 77.2295 };
	source = "india_gate.glb";
	intialHeading = 90;
	finalHeading = intialHeading + 0;
	intialScaleY = 5;
	finalScaleY = 5;
	document.title = "India Gate";
} else if(hash== "#newph") {
	loc = { lat: 28.6172, lng: 77.2094 };
	source = "newph.glb";
	intialHeading = -90;
	finalHeading = intialHeading + 90;
	intialScaleY = 5;
	finalScaleY = 25;
	document.title = "New Parliament House";
}

const mapOptions = {
  "tilt": intialTilt,
  "zoom": intialZoom,
  "heading" : intialHeading,
  "center": loc
}

async function initMap() {
  const mapDiv = document.getElementById("map");
  const map = new google.maps.Map(mapDiv, { 
  ...mapOptions, 
  "mapId": "f7880d427f9b40ba", 
  "mapTypeId": "hybrid" 
  //"mapTypeId": "satellite"
  });
  const view = initWebGLOverlayView(map);
}

function initWebGLOverlayView(map) {
 
  let scene, renderer, camera, loader, gltfRef;
  const webGLOverlayView = new google.maps.WebGLOverlayView();
  
  webGLOverlayView.onAdd = () => {   
    
	camera = new THREE.PerspectiveCamera();
	
	// set up the scene
    scene = new THREE.Scene();
    
	const ambientLight = new THREE.AmbientLight( 0xffffff, 1 ); // soft white light
    scene.add(ambientLight);
    
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
  
    // load the model    
    loader = new THREE.GLTFLoader();                   
    loader.load(
      source,
      gltf => {
		gltfRef = gltf;
		gltf.scene.rotation.x = 90 * Math.PI/180; // rotations are in radians
		gltf.scene.rotation.y = 90 * Math.PI/180; // rotations are in radians
		if(hash == "#ig") {
			gltf.scene.scale.set(5, intialScaleY, 5);
		} else if(hash== "#newph") {
			gltf.scene.scale.set(25, intialScaleY, 25);
		}
        scene.add(gltf.scene);
      }
    );
  }
  
  webGLOverlayView.onContextRestored = ({gl}) => {
    // create the three.js renderer, using the
    // maps's WebGL rendering context.
    renderer = new THREE.WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // wait to move the camera until the 3D model loads    
    loader.manager.onLoad = () => {        
      renderer.setAnimationLoop(() => {

		// 2d to 3d 
		if (mapOptions.tilt < finalTilt) {
          mapOptions.tilt += .25;
		  // intialScaleY += .25;
		  // gltfRef.scene.scale.set(25, intialScaleY, 25);
		  // mapOptions.heading -= .5;
		} 
		// zoom in
		else if (mapOptions.zoom < finalZoom) {
		  mapOptions.zoom += 0.01;
        } 
        // rotate the map 360 degrees 
        else if (mapOptions.heading <= finalHeading) {
          mapOptions.heading += 0.2;
		  if(hash == "#ig") {
			intialScaleY += .01;
			gltfRef.scene.scale.set(5, intialScaleY, 5);
		  } else if(hash== "#newph") {
			intialScaleY += .05;
			gltfRef.scene.scale.set(25, intialScaleY, 25);
		  }
        } 
		else if (intialScaleY <= finalScaleY) {
          //intialScaleY += .05;
		  //gltfRef.scene.scale.set(25, intialScaleY, 25);
        }
		else 
		{
          renderer.setAnimationLoop(null)
        }
		
		map.moveCamera(mapOptions);
		
      });        
    }
  }

  webGLOverlayView.onDraw = ({gl, transformer}) => {
    
	// update camera matrix to ensure the model is georeferenced correctly on the map
	const matrix = transformer.fromLatLngAltitude({...mapOptions.center, altitude: 00});
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
    
    webGLOverlayView.requestRedraw();      
    renderer.render(scene, camera);                  

    // always reset the GL state
    renderer.resetState();
  }

  webGLOverlayView.setMap(map);
  return webGLOverlayView;
}

window.alert = function(message) {
  console.log(message);
}