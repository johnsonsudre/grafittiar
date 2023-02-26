var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1;

var mesh1;

initialize();
animate();

function initialize() {
  scene = new THREE.Scene();

  let ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
  scene.add(ambientLight);

  camera = new THREE.Camera();
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(640, 480);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  deltaTime = 0;
  totalTime = 0;

  ////////////////////////////////////////////////////////////
  // setup arToolkitSource
  ////////////////////////////////////////////////////////////

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
  });

  function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
  }

  arToolkitSource.init(function onReady() {
    onResize();
  });

  // handle resize event
  window.addEventListener("resize", function () {
    onResize();
  });

  ////////////////////////////////////////////////////////////
  // setup arToolkitContext
  ////////////////////////////////////////////////////////////

  // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "data/camera_para.dat",
    detectionMode: "mono",
  });

  // copy projection matrix to camera when initialization complete
  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  ////////////////////////////////////////////////////////////
  // setup markerRoots
  ////////////////////////////////////////////////////////////

  // build markerControls
  markerRoot1 = new THREE.Group();
  markerRoot1.name = "marker1";
  scene.add(markerRoot1);
  let markerControls1 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot1,
    {
      type: "pattern",
      patternUrl: "data/ananse-ntontan.patt",
    }
  );

  // the inside of the hole
  let geometry1 = new THREE.CubeGeometry(1, 1, 1);
  let loader = new THREE.TextureLoader();
  let texture = loader.load("images/tiles.jpg");
  let material1 = new THREE.MeshLambertMaterial({
    transparent: true,
    map: texture,
    side: THREE.BackSide,
  });

  mesh1 = new THREE.Mesh(geometry1, material1);
  mesh1.position.y = -1;

  mesh2 = createMesh();
  mesh1.add(mesh2);

  markerRoot1.add(mesh1);

  // the invisibility cloak (box with a hole)
  // let geometry0 = new THREE.BoxGeometry(1, 1, 1);
  // geometry0.faces.splice(4, 2); // make hole by removing top two triangles

  // let material0 = new THREE.MeshBasicMaterial({
  //   colorWrite: false,
  // });

  // let mesh0 = new THREE.Mesh(geometry0, material0);
  // mesh0.scale.set(1, 1, 1).multiplyScalar(1.01);
  // mesh0.position.y = -1;
  // markerRoot1.add(mesh0);

  ////////////////////////////////////////////////////////////
  // setup particles
  ////////////////////////////////////////////////////////////
  particle = new ParticleCloud(scene);

  ////////////////////////////////////////////////////////////
  // presentation
  ////////////////////////////////////////////////////////////
  presentation = new Presentation(scene);
  presentation.add();
  console.log(presentation.assets.children[0]);
  // markerRoot1.add(presentation.assets);
}

function update() {
  // update artoolkit on every frame
  if (arToolkitSource.ready !== false)
    arToolkitContext.update(arToolkitSource.domElement);
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  deltaTime = clock.getDelta();
  totalTime += deltaTime;
  particle.update(0.01);
  update();
  render();
}
