let container, scene, camera, renderer, controls, geometry, mesh, material, light, anim, animGeo;
let clock;
let projector, INTERSECTED;
var raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let mousePressed = false;
let activeCell = false;
let counter = 0;
let timeFreq = 0.1;

class getPlane {
    constructor (w,h,ws,hs) {
        this.w = w;
        this.h = h;
        this.ws = ws;
        this.hs = hs;
        let plane = new THREE.PlaneGeometry(this.w,this.h,this.ws,this.hs);
        let material = new THREE.MeshPhysicalMaterial({
            color: "rgb(30,130,30)",
            metalness: 0,
            roughness: 0.5,
            clearcoat: 0,
            clearcoatRoughness: 1,
            reflectivity: 0.4,
        });
        let mesh = new THREE.Mesh(plane,material);
        mesh.receiveShadow = true;
        return(mesh);
    }
}

class getBox {
    constructor (w,h) {
        this.w = w;
        this.h = h;
        let box = new THREE.BoxGeometry(this.w,this.h);
        let material = new THREE.MeshPhysicalMaterial({
            color: "rgb(30,130,30)",
            metalness: 0,
            roughness: 0.5,
            clearcoat: 0,
            clearcoatRoughness: 1,
            reflectivity: 0.4,
        });
        let mesh = new THREE.Mesh(box,material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return(mesh);
    }
}

class getPointLight {
    constructor(intensity) {
        light = new THREE.PointLight(0xFFFFFF, intensity);
        light.castShadow = true;
        return(light);
    }
}

class getAmbientLight {
    constructor(intensity) {
        light = new THREE.AmbientLight(0x5555FF, intensity);
        return(light);
    }
}

class getSpotLight {
    constructor(intensity) {
        light = new THREE.SpotLight(0xFFFFFF, intensity);
        light.castShadow = true;
        //light.shadow.bias = 0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        return(light);
    }
}

class getDirectionalLight {
    constructor(intensity) {
        light = new THREE.DirectionalLight(0xFFFFFF, intensity);
        light.castShadow = true;
        light.shadow.bias = 0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        return(light);
    }
}


init();
animate();

function init () {

    scene = new THREE.Scene();

    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    var MAG_ANGLE = 30;

    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.y = 30;
    camera.layers.enable(1);

    renderer = new THREE.WebGLRenderer( {antialias:true} );
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor("rgb(30,30,30)");
	container = document.getElementById( 'ThreeJS' );
    container.appendChild( renderer.domElement );
    
    clock = new THREE.Clock(); // a clock object in THREE.JS to measure time. Properties of the clock object can be called in functions.

    let gui = new dat.GUI(); // dat.GUI javascript library for adding interactive controls in the browser for quick testing of the parameters

    let light01 = new getSpotLight(2);
    let lightAmbient01 = new getAmbientLight(2);

    let helper = new THREE.CameraHelper(light01.shadow.camera);

    loadMesh("/GLTF/sprout_logo.gltf", "logoMesh", scene);
    let ground = new getPlane(100,100,10,10);

    scene.add(light01);
    scene.add(lightAmbient01);
    scene.add(helper);
    scene.add(ground);

    light01.position.y = 50;
    light01.position.x = 10;
    light01.position.z = 10;
    ground.rotation.x = -Math.PI/2;
    ground.position.y = 0;

    gui.add(light01,'intensity',0,10);
    gui.add(light01.position,'y',-50,50);
    gui.add(light01.position,'x',-50,50);
    gui.add(light01.position,'z',-50,50);
    gui.add(light01, 'penumbra',0,1); // this line has to be commented out when a lightsource without the "penumbra" parameter is used. For example in the case of a directional light.

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );    
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );    
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );  
    
    console.log("init function has run, the counter is: " + counter);

    return(scene);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseDown( event ) { mousePressed = true; }
function onDocumentMouseUp( event ) { mousePressed = false; syncframe = 0; }
function onDocumentMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    
    var intersect = raycaster.intersectObjects(scene.children);

    for(var i = 0; i < intersect.length; i++) {
                intersect[i].object.material.color.setHex(0x78F9F6);
    }
}

function loadMesh(path, meshName, scene) {

    let loader = new THREE.GLTFLoader();
    loader.load(path, gltf => {
        let index = 1;
        gltf.scene.traverse( child => {
            if ( child.isMesh ) {
                let loadedMesh = child.geometry;
                let convert = new THREE.Geometry().fromBufferGeometry(loadedMesh);
                let material = new THREE.MeshPhysicalMaterial({
                    color: "rgb(50,20,10)",
                    metalness: 0,
                    roughness: 0.5,
                    clearcoat: 0,
                    clearcoatRoughness: 1,
                    reflectivity: 0.4,
                });
                let convertedMesh = new THREE.Mesh(convert,material);
                convertedMesh.castShadow = true;
                convertedMesh.receiveShadow = true;
                convertedMesh.layers.set(1);
                scene.add(convertedMesh);
                convertedMesh.name = meshName + index;
                index++;
                counter = 1;
                console.log("the loadMesh function finished, the counter is set to: " + counter);
            }
        });
    });
}

function animateLogo (clock) {

    let timeElapsed = clock.getElapsedTime(); // getElapsedTime property of the clock object is being called here.

    if (counter > 0) {
        anim = scene.getObjectByName("logoMesh1");
        animGeo = anim.geometry;
        animGeo.verticesNeedUpdate = true;
        animGeo.vertices.forEach(function (vertex,index){
            vertex.x += (Math.sin(timeElapsed*timeFreq+index)*0.3)*0.01;
            vertex.z += (Math.cos(timeElapsed*timeFreq+(index+1))*0.3)*0.01;
            vertex.y += (Math.sin(timeElapsed*timeFreq+(index+2))*0.3)*0.01;
        });
    }

}

function animate() 
{
    requestAnimationFrame( animate );
    animateLogo(clock);
	render();
	update(controls);
}

function update(controls) {

    controls.update();

    if (counter == 1) {
        let logo = scene.getObjectByName("logoMesh1");
        logo.position.x = -10;
        logo.position.y = 5;
        counter = 2;
        console.log("if statement in update function has run, the counter is set to: "+ counter);
    }
}

function render() 
{
     renderer.render(scene, camera);    
}
