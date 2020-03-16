let geometry;
let mesh;
let material;
let light;

function init () {

    let renderer = new THREE.WebGLRenderer();
    let camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
    let scene = new THREE.Scene();


    let clock = new THREE.Clock(); // a clock object in THREE.JS to measure time. Properties of the clock object can be called in functions.

    let gui = new dat.GUI(); // dat.GUI javascript library for adding interactive controls in the browser for quick testing of the parameters

    let logo = new loadMesh("/GLTF/sprout_logo.glb", "logoMesh");

    let light01 = new getDirectionalLight(2);
    let lightAmbient01 = new getAmbientLight(2);

    let helper = new THREE.CameraHelper(light01.shadow.camera);

    scene.add(light01);
    scene.add(lightAmbient01);
    scene.add(helper);

    light01.position.y = 5;

    gui.add(light01,'intensity',0,10);
    gui.add(light01.position,'y',0,5);
    gui.add(light01.position,'x',-5,5);
    gui.add(light01.position,'z',-5,5);

    // gui.add(light01, 'penumbra',0,1); // this line has to be commented out when a lightsource without the "penumbra" parameter is used. For example in the case of a directional light.

    camera.position.z = 5;
    camera.position.y = 2;

    // camera.lookAt(new THREE.Vector3(0,2,0));

    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("rgb(30,30,30)");

    document.getElementById("webgl").appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);

    update(renderer, scene, camera, controls, clock);

    return(scene);
}

class loadMesh {
    constructor(path, meshName) {
        this.path = path;
        let loader = new THREE.GLTFLoader();
        loader.load(path, function(gltf) {
            let index = 1;
            gltf.scene.traverse( function ( child ) {
                if ( child.isMesh ) {
                    let loadedMesh = child.geometry;
                    let convert = new THREE.Geometry().fromBufferGeometry(loadedMesh);
                    material = new THREE.MeshPhongMaterial({color:"rgb(30,30,30)"});
                    let convertedMesh = new THREE.Mesh(convert,material);
                    scene.add(convertedMesh);
                    convertedMesh.name = meshName + index;
                    index++;
                }

            } );
        });
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
        light.shadow.bias = 0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        return(light);
    }
}

class getDirectionalLight {
    constructor(intensity) {
        light = new THREE.DirectionalLight(0xFFFFFF, intensity);
        light.castShadow = true;
        return(light);
    }
}

function animateLogo(timeElapsed) {
    let logoAnim = scene.getObjectByName("logoMesh1");
    let logoGeo = logoAnim.geometry;
    logoGeo.verticesNeedUpdate = true;
    logoGeo.vertices.forEach(function(vertex, index){
    vertex.z = Math.sin(timeElapsed + index) * 0.5;
    })
}

function update(renderer, scene, camera, controls, clock) {

    controls.update;

    let timeElapsed = clock.getElapsedTime(); // getElapsedTime property of the clock object is being called here.

    animateLogo(timeElapsed);

    renderer.render(scene,camera);

    requestAnimationFrame(function() {
        update(renderer,scene,camera, controls, clock); // This is a Callback Function in a recursive manner (it calls itself). When a function is passed as an argument, it's called a Callback Function. The Callback Function is executed after the function that calls it is finished executing.
    })
}

let scene = init();
