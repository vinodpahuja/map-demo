
const mapOptions = {
  "tilt": 45,
  "zoom": 16,
  "heading": 0, // rotation
  "center": { lat: 28.61350, lng: 77.2184 } // KP
}

async function initMap() {
  const mapDiv = document.getElementById("map");
  const map = new google.maps.Map(mapDiv, { ...mapOptions, "mapId": "f7880d427f9b40ba", "mapTypeId": "hybrid" });
  const threeJSOverlayView = initOverlayView(map);
  loadModels(threeJSOverlayView);
}

let scene;

function initOverlayView(map) {
  
    scene = new THREE.Scene();
    
	const ambientLight = new THREE.AmbientLight( 0xffffff, .1 ); // soft white light
    scene.add(ambientLight);
    
	const directionalLight = new THREE.DirectionalLight(0xffffff, .5);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

	threeJSOverlayView = new google.maps.plugins.three.ThreeJSOverlayView({
		map,
		scene,
		anchor: { ...mapOptions.center, altitude: 0 },
		THREE,
	});
	
	return threeJSOverlayView;
}

function loadModels(threeJSOverlayView) {

	var loader = new THREE.GLTFLoader();
	
	var locIG = { lat: 28.6129, lng: 77.2295 };
	var source = "../assets/india_gate.glb";

    loader.load(
      source,
      gltf1 => {     
        gltf1.scene.scale.set(5, 5, 5);
        gltf1.scene.rotation.x = 90 * Math.PI/180; // rotations are in radians
		gltf1.scene.rotation.y = 90 * Math.PI/180; // rotations are in radians
		
		var v3 = threeJSOverlayView.latLngAltitudeToVector3(locIG);
		var cloned = gltf1.scene.clone(); // TODO CHECK NEED
		cloned.position.x = v3.x;
		cloned.position.y = v3.y;
		scene.add(cloned);
      }
    );
	
	
	var locNewPH = { lat: 28.6171, lng: 77.2094 };
	source = "../assets/newph.glb";
	
	loader.load(
      source,
      gltf2 => {      
        gltf2.scene.scale.set(25, 25, 25);
        gltf2.scene.rotation.x = 90 * Math.PI/180; // rotations are in radians
		gltf2.scene.rotation.y = 90 * Math.PI/180; // rotations are in radians
		
		var v3 = threeJSOverlayView.latLngAltitudeToVector3(locNewPH);
		var cloned = gltf2.scene.clone();
		cloned.position.x = v3.x;
		cloned.position.y = v3.y;
		scene.add(cloned);
      }
    );

  }