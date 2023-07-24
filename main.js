import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

var container,
  renderer,
  scene,
  camera,
  fov = 50,
  start = Date.now(),
  fireballs = [];

function createFireball() {
  var textureLoader = new THREE.TextureLoader();
  var material = new THREE.ShaderMaterial({
    uniforms: {
      tExplosion: {
        type: "t",
        value: textureLoader.load("explosion.png"),
      },
      time: {
        type: "f",
        value: 0.0,
      },
    },
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  var fireball = new THREE.Mesh(new THREE.IcosahedronGeometry(20, 4), material);

  scene.add(fireball);

  // Defina o tempo de vida do fireball (em milissegundos)
  fireball.lifespan = 10000;
  return fireball;
}

window.addEventListener("load", function () {
  container = document.getElementById("container");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 400;
  camera.position.y = -200;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  var controls = new OrbitControls(camera, renderer.domElement);

  onWindowResize();
  window.addEventListener("resize", onWindowResize);

  // Create multiple fireball instances
  for (let i = 0; i < 80; i++) {
    const fireball = createFireball();
    fireball.position.set(
      THREE.MathUtils.randFloatSpread(400),
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(400)
    );
    fireball.speed = THREE.MathUtils.randFloat(0.5, 1.5);
    fireball.birthTime = Date.now();
    fireballs.push(fireball);
  }

  render();
});

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function updateFireball(fireball) {
  const elapsedTime = (Date.now() - fireball.birthTime) * 0.001;
  const distance = elapsedTime * fireball.speed;
  const scaleFactor = 0.5; // Ajuste o valor conforme necessário

  const scale = 1.5 + elapsedTime * scaleFactor;

  // Move the fireball up along the Y-axis
  fireball.position.y += distance * 2;

  fireball.scale.set(
    scale + distance * 1.8,
    scale + distance * 1.2,
    scale + distance * 1.8
  );

  if (fireball.position.y > 1200) {
    // Reset the fireball's position and scale
    fireball.position.set(
      THREE.MathUtils.randFloatSpread(300),
      THREE.MathUtils.randFloatSpread(300),
      THREE.MathUtils.randFloatSpread(300)
    );
    fireball.scale.set(1, 1, 1);
    fireball.lifespan = 10000; // Tempo de vida de 10 segundos
    fireball.birthTime = Date.now();
  }
}

function removeExpiredFireballs() {
  const currentTime = Date.now();
  for (let i = fireballs.length - 1; i >= 0; i--) {
    const fireball = fireballs[i];
    if (currentTime - fireball.birthTime >= fireball.lifespan) {
      scene.remove(fireball);
      fireballs.splice(i, 1);
    }
  }
}

function render() {
  removeExpiredFireballs();
  fireballs.forEach((fireball) => {
    updateFireball(fireball);

    // Atualize o valor do uniforme 'time' para cada material da fireball
    fireball.material.uniforms["time"].value = 0.00015 * (Date.now() - start);
  });

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
