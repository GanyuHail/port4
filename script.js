let selectedObject = null;


// === 3D Scene Setup with Three.js ===
(function () {
    'use strict';
    // --- Global Variables ---
    var scene, camera, renderer;
    var container, HEIGHT, WIDTH, fieldOfView, aspectRatio, nearPlane, farPlane;
    var geometry, particleCount, sphereMesh, vertex, vertices;
    var i, h, color, size;
    var materials = [], mouseX = 0, mouseY = 0;
    var windowHalfX, windowHalfY, cameraZ;
    var fogHex, fogDensity, parameters = {}, parameterCount, particles;

    // === Initialize Scene ===
    init();
    animate();


    // --- Raycaster for Object Interaction (declare at top scope for touch handler) ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function init() {
        // --- Window and Camera Setup ---
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;
        fieldOfView = 120;
        aspectRatio = WIDTH / HEIGHT;
        nearPlane = 1;
        farPlane = 3000;
        cameraZ = farPlane / 2;
        fogHex = 0x000000;
        fogDensity = 0.0006;
        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = cameraZ;
        camera.layers.enable(1);

        // --- Scene and Lighting ---
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(fogHex, fogDensity);
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        // --- DOM Container ---
        container = document.createElement('div');
        document.body.appendChild(container);
        document.body.style.margin = 0;
        document.body.style.overflow = 'visible';

        // --- Particle Geometry ---
        geometry = new THREE.Geometry();
        particleCount = 1000; // Reduce for faster load

        // --- Spheres with Textures (Clickable/Touchable) ---
        // Use lower segment counts for faster geometry creation
        const sphereParams = [
            { size: 30, url: 'https://raw.githubusercontent.com/GanyuHail/port3c/main/src/moon.jpg', pos: [80, 50, 200] },
            { size: 40, url: 'https://raw.githubusercontent.com/GanyuHail/port4/main/src/romance.png', pos: [-50, 100, 50] },
            { size: 24, url: 'https://raw.githubusercontent.com/GanyuHail/port4/main/src/ripple.png', pos: [10, -100, -20] },
            { size: 12, url: 'https://raw.githubusercontent.com/GanyuHail/port4/main/src/Instagram_logo_2016.svg.webp', pos: [-100, 130, 90] },
            { size: 60, url: 'https://raw.githubusercontent.com/GanyuHail//port4/main/src/oestroalt2.png', pos: [220, 125, -100] },
            { size: 30, url: 'https://raw.githubusercontent.com/GanyuHail/port4/main/src/mesmo.png', pos: [250, 170, -110] },
            { size: 60, url: 'https://raw.githubusercontent.com/GanyuHail/port4/main/src/RecycleRabbit.png', pos: [200, -20, -70] },
            { size: 50, url: 'https://raw.githubusercontent.com/GanyuHail/port4/main/src/lines.png', pos: [0, 0, -100] },
            { size: 120, url: 'https://raw.githubusercontent.com/GanyuHail/port4/main/src/leaves.jpg', pos: [-100, -100, -100] },
        ];
        // Preload all textures, then add spheres
        const loader = new THREE.TextureLoader();
        const sphereMeshes = [];
        let loaded = 0;
        for (let idx = 0; idx < sphereParams.length; idx++) {
            loader.load(sphereParams[idx].url, function (tex) {
                const geo = new THREE.SphereGeometry(sphereParams[idx].size, 24, 16); // Lower segments
                const mat = new THREE.MeshStandardMaterial({ map: tex });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(...sphereParams[idx].pos);
                scene.add(mesh);
                sphereMeshes[idx] = mesh;
                loaded++;
            });
        }
        // Assign sphereMesh, sphereMesh2, ... for compatibility with event handlers
        var sphereMesh, sphereMesh2, sphereMesh3, sphereMesh4, sphereMesh5, sphereMesh6, sphereMesh7, sphereMesh8, sphereMesh9;
        loader.load(sphereParams[0].url, function (tex) { sphereMesh = sphereMeshes[0]; });
        loader.load(sphereParams[1].url, function (tex) { sphereMesh2 = sphereMeshes[1]; });
        loader.load(sphereParams[2].url, function (tex) { sphereMesh3 = sphereMeshes[2]; });
        loader.load(sphereParams[3].url, function (tex) { sphereMesh4 = sphereMeshes[3]; });
        loader.load(sphereParams[4].url, function (tex) { sphereMesh5 = sphereMeshes[4]; });
        loader.load(sphereParams[5].url, function (tex) { sphereMesh6 = sphereMeshes[5]; });
        loader.load(sphereParams[6].url, function (tex) { sphereMesh7 = sphereMeshes[6]; });
        loader.load(sphereParams[7].url, function (tex) { sphereMesh8 = sphereMeshes[7]; });
        loader.load(sphereParams[8].url, function (tex) { sphereMesh9 = sphereMeshes[8]; });

        // --- Particle Field ---
        for (i = 0; i < particleCount; i++) {
            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000;
            geometry.vertices.push(vertex);
        }

        // --- Particle Materials ---
        parameters = [
            [[1, 1, 0.5], 5],
            [[0.95, 1, 0.5], 4],
            [[0.90, 1, 0.5], 3],
            [[0.85, 1, 0.5], 2],
            [[0.80, 1, 0.5], 1]
        ];
        parameterCount = parameters.length;
        for (i = 0; i < parameterCount; i++) {
            size = parameters[i][1];
            materials[i] = new THREE.PointsMaterial({
                transparent: true,
                size: 1,
            });
            particles = new THREE.Points(geometry, materials[i]);
            particles.rotation.x = Math.random() * 6;
            particles.rotation.y = Math.random() * 6;
            particles.rotation.z = Math.random() * 6;
            scene.add(particles);
        }

        // --- Renderer Setup ---
        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(WIDTH, HEIGHT);
        container.appendChild(renderer.domElement);

        // --- Event Listeners ---
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        document.addEventListener('touchend', onDocumentTouchEnd, false);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('click', onMouseDown);
        window.addEventListener('touchend', onTouchRaycast);

        // --- Pointer Move Handler (Hover Highlight) ---
        function onPointerMove(event) {
            if (selectedObject) {
                selectedObject.material.color.set('white');
                selectedObject = null;
            }
            raycaster.layers.set(0);
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            for (let i = 0; i < intersects.length; i++) {
                const intersect = intersects[i];
                if (intersect && intersect.object) {
                    selectedObject = intersect.object;
                    intersect.object.material.color.set('hotpink');
                } else if (intersect == null) {
                    selectedObject = null;
                }
            }
        }

        // --- Mouse Click Handler (Open Link) ---
        function onMouseDown(event) {
            if (selectedObject === sphereMesh) {
                myFunction();
            } else if (selectedObject === sphereMesh2) {
                window.location.href = "https://ganyuhail.github.io/RomanceDemo/";
            } else if (selectedObject === sphereMesh3) {
                window.location.href = "https://ganyuhail.github.io/ripple/";
            } else if (selectedObject === sphereMesh4) {
                window.location.href = "https://www.instagram.com/hennohail/?hl=en";
            } else if (selectedObject === sphereMesh5) {
                window.location.href = "https://www.oestrogeneration.org/";
            } else if (selectedObject === sphereMesh6) {
                window.location.href = "https://ganyuhail.github.io/mesmo1/";
            } else if (selectedObject === sphereMesh7) {
                window.location.href = "https://ganyuhail.github.io/recyclerabbit/page.html";
            } else if (selectedObject === sphereMesh8) {
                window.location.href = "https://ganyuhail.github.io/paintlines2/";
            } else if (selectedObject === sphereMesh9) {
                window.location.href = "https://blossomprism.etsy.com";
            }
        }

        // Touch handler is now defined at top scope
        // --- Touch Handler (Raycast & Open Link) ---
        function onTouchRaycast(event) {
            // These variables must be accessible at top scope
            if (!event.changedTouches || event.changedTouches.length === 0) return;
            const touch = event.changedTouches[0];
            const x = (touch.clientX / window.innerWidth) * 2 - 1;
            const y = - (touch.clientY / window.innerHeight) * 2 + 1;
            raycaster.layers.set(0);
            pointer.x = x;
            pointer.y = y;
            // camera, scene, and sphereMesh variables are all at top scope
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                // Check which mesh was touched and open the corresponding link
                if (obj === sphereMesh) {
                    myFunction();
                } else if (obj === sphereMesh2) {
                    window.location.href = "https://ganyuhail.github.io/RomanceDemo/";
                } else if (obj === sphereMesh3) {
                    window.location.href = "https://ganyuhail.github.io/ripple/";
                } else if (obj === sphereMesh4) {
                    window.location.href = "https://www.instagram.com/hennohail/?hl=en";
                } else if (obj === sphereMesh5) {
                    window.location.href = "https://www.oestrogeneration.org/";
                } else if (obj === sphereMesh6) {
                    window.location.href = "https://ganyuhail.github.io/mesmo1/";
                } else if (obj === sphereMesh7) {
                    window.location.href = "https://ganyuhail.github.io/nb/";
                } else if (obj === sphereMesh8) {
                    window.location.href = "https://ganyuhail.github.io/paintlines2/";
                } else if (obj === sphereMesh9) {
                    window.location.href = "https://blossomprism.etsy.com";
                }
            }
        }
    }
    //     function touchEnd(event) {
    //         selectedObject = null;
    //     }
    // }


    // === Animation Loop ===
    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    // === Render Scene and Animate Camera/Particles ===
    function render() {
        var time = Date.now() * 0.000005;

        // Smooth camera movement based on mouse position
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.position.z += (mouseY - camera.position.z) * 0.0065;

        // Keep camera at a minimum distance from scene center
        const minDistance = 400;
        const lerpFactor = 0.05;
        const cameraPosition = camera.position.clone();
        const distanceToCenter = cameraPosition.distanceTo(scene.position);
        if (distanceToCenter < minDistance) {
            const direction = cameraPosition.sub(scene.position).normalize();
            const targetPosition = direction.multiplyScalar(minDistance).add(scene.position);
            camera.position.lerp(targetPosition, lerpFactor);
        }
        camera.lookAt(scene.position);

        // Rotate particle clouds
        for (let i = 0; i < scene.children.length; i++) {
            var object = scene.children[i];
            if (object instanceof THREE.Points) {
                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
        }

        // Animate particle colors
        for (let i = 0; i < materials.length; i++) {
            const color = parameters[i][0];
            const h = (360 * (color[0] + (time * 7)) % 360) / 360;
            materials[i].color.setHSL(h, color[1], color[2]);
        }

        renderer.render(scene, camera);
    }


    // === Mouse/Touch Position Handlers ===
    function onDocumentMouseMove(e) {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
    }

    function onDocumentTouchEnd(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    // === Responsive Resize Handler ===
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
})();