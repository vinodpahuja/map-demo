
const mapOptions = {
  "tilt": 0,
  "zoom": 18,
  "heading": 0, // rotation
  "center": { lat: 28.612952919340955, lng: 77.22956784426097 }
}

async function initMap() {
  const mapDiv = document.getElementById("map");
  const map = new google.maps.Map(mapDiv, { ...mapOptions, "mapId": "f7880d427f9b40ba", "mapTypeId": "satellite" });
  const view = initWebGLOverlayView(map);
}

function initWebGLOverlayView(map) {
 
  let scene, renderer, camera, loader;
  const webGLOverlayView = new google.maps.WebGLOverlayView();
  
  webGLOverlayView.onAdd = () => {   
    
	camera = new THREE.PerspectiveCamera();
	
	// set up the scene
    scene = new THREE.Scene();
    
	const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 ); // soft white light
    scene.add(ambientLight);
    
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);
  
    // load the model    
    loader = new THREE.GLTFLoader();               
    const source = "india_gate.glb";
    loader.load(
      source,
      gltf => {      
        gltf.scene.scale.set(5, 5, 5);
        gltf.scene.rotation.x = 90 * Math.PI/180; // rotations are in radians
		gltf.scene.rotation.y = 90 * Math.PI/180; // rotations are in radians
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
		if (mapOptions.tilt < 45) {
          mapOptions.tilt += 1;
		} else 
		// zoom in
		if (mapOptions.zoom < 17.5) {
		  mapOptions.zoom += 0.05;
        } else
        // rotate the map 360 degrees 
        if (mapOptions.heading <= 90) {
          mapOptions.heading += 0.2;
        } else 
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