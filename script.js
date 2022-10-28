let selectedObject = null;

(function () {
    'use strict';
    var scene, camera, renderer;
    var container, HEIGHT,
        WIDTH, fieldOfView, aspectRatio,
        nearPlane, farPlane,
        geometry, particleCount, sphereMesh,
        i, h, color, size,
        materials = [],
        mouseX = 0,
        mouseY = 0,
        windowHalfX, windowHalfY, cameraZ,
        fogHex, fogDensity, parameters = {},
        parameterCount, particles;

    init();
    animate();

    function init() {

        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;

        fieldOfView = 75;
        aspectRatio = WIDTH / HEIGHT;
        nearPlane = 25;
        farPlane = 3000;

        cameraZ = farPlane / 2;
        fogHex = 0x000000;
        fogDensity = 0.0007;
        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = cameraZ;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(fogHex, fogDensity);

        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        container = document.createElement('div');
        document.body.appendChild(container);
        document.body.style.margin = 0;
        document.body.style.overflow = 'visible';

        geometry = new THREE.Geometry();
        particleCount = 9001;

        const sphereGeometry = new THREE.SphereGeometry(85, 64, 32);
        const sphereTex = new THREE.TextureLoader().load('https://raw.githubusercontent.com/GanyuHail/port3c/main/src/weOpMin.jpg');
        const sphereMaterial = new THREE.MeshStandardMaterial({ map: sphereTex });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphereMesh);
        sphereMesh.position.set(80, 50, 200);

        const sphereGeometry2 = new THREE.SphereGeometry(40, 64, 32);
        const sphereTex2 = new THREE.TextureLoader().load('https://raw.githubusercontent.com/GanyuHail/port3c/main/src/baeLogo1.svg');
        const sphereMaterial2 = new THREE.MeshStandardMaterial({ map: sphereTex2 });
        const sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
        scene.add(sphereMesh2);
        sphereMesh2.position.set(-50, 100, 50);

        const sphereGeometry3 = new THREE.SphereGeometry(24, 64, 32);
        const sphereTex3 = new THREE.TextureLoader().load('https://raw.githubusercontent.com/GanyuHail/port3c/main/src/universe.png');
        const sphereMaterial3 = new THREE.MeshStandardMaterial({ map: sphereTex3 });
        const sphereMesh3 = new THREE.Mesh(sphereGeometry3, sphereMaterial3);
        scene.add(sphereMesh3);
        sphereMesh3.position.set(10, -100, -20);

        const sphereGeometry4 = new THREE.SphereGeometry(12, 64, 32);
        const sphereTex4 = new THREE.TextureLoader().load('https://raw.githubusercontent.com/GanyuHail/port3c/main/src/Instagram_logo_2016.svg.webp');
        const sphereMaterial4 = new THREE.MeshStandardMaterial({ map: sphereTex4 });
        const sphereMesh4 = new THREE.Mesh(sphereGeometry4, sphereMaterial4);
        scene.add(sphereMesh4);
        sphereMesh4.position.set(-100, 130, 90);

        const sphereGeometry5 = new THREE.SphereGeometry(30, 64, 32);
        const sphereTex5 = new THREE.TextureLoader().load('https://raw.githubusercontent.com/GanyuHail/port3c/main/src/loadinglogo%20(1).png');
        const sphereMaterial5 = new THREE.MeshStandardMaterial({ map: sphereTex5 });
        const sphereMesh5 = new THREE.Mesh(sphereGeometry5, sphereMaterial5);
        scene.add(sphereMesh5);
        sphereMesh5.position.set(220, 75, -100);

        const sphereGeometry6 = new THREE.SphereGeometry(30, 64, 32);
        const sphereTex6 = new THREE.TextureLoader().load('https://raw.githubusercontent.com/GanyuHail/port3c/main/src/mesmo.png');
        const sphereMaterial6 = new THREE.MeshStandardMaterial({ map: sphereTex6 });
        const sphereMesh6 = new THREE.Mesh(sphereGeometry6, sphereMaterial6);
        scene.add(sphereMesh6);
        sphereMesh6.position.set(250, 105, -110);

        for (i = 0; i < particleCount; i++) {

            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000;
            geometry.vertices.push(vertex);
        }

        parameters = [
            [
                [1, 1, 0.5], 5
            ],
            [
                [0.95, 1, 0.5], 4
            ],
            [
                [0.90, 1, 0.5], 3
            ],
            [
                [0.85, 1, 0.5], 2
            ],
            [
                [0.80, 1, 0.5], 1
            ]
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

        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(WIDTH, HEIGHT);
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('click', onMouseDown);
        window.addEventListener('touchend', touchEnd);

        function onPointerMove(event) {
            if (selectedObject) {
                selectedObject.material.color.set('white');
                selectedObject = null;
            }

            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            for (let i = 0; i < intersects.length; i++) {
                const intersect = intersects[i];

                if (intersect && intersect.object) {
                    selectedObject = intersect.object;
                    intersect.object.material.color.set('#55CDFC');
                }
            }
        };

        function onMouseDown(event) {
            if (selectedObject === sphereMesh) {
                window.location.href = "/nb";
            } else if (selectedObject === sphereMesh2) {
                window.location.href = "https://ganyuhail.github.io/bl3/";
            } else if (selectedObject === sphereMesh3) {
                window.location.href = "https://ganyuhail.github.io/3dArt/";
            } else if (selectedObject === sphereMesh4) {
                window.location.href = "https://www.instagram.com/hennohail/?hl=en";
            } else if (selectedObject === sphereMesh5) {
                window.location.href = "https://ganyuhail.github.io/enate/";
            } else if (selectedObject === sphereMesh6) {
                window.location.href = "https://ganyuhail.github.io/mesmo1/";
            }
        };

        function touchEnd(event) {
            if (selectedObject === sphereMesh) {
                window.location.href = "/nb";
            } else if (selectedObject === sphereMesh2) {
                window.location.href = "https://ganyuhail.github.io/bl3/";
            } else if (selectedObject === sphereMesh3) {
                window.location.href = "https://ganyuhail.github.io/3dArt/";
            } else if (selectedObject === sphereMesh4) {
                window.location.href = "https://www.instagram.com/hennohail/?hl=en";
            } else if (selectedObject === sphereMesh5) {
                window.location.href = "https://ganyuhail.github.io/enate/";
            } else if (selectedObject === sphereMesh6) {
                window.location.href = "https://ganyuhail.github.io/mesmo1/";
            }
        };
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        var time = Date.now() * 0.000005;

        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.position.z += (mouseY - camera.position.z) * 0.001;
        camera.lookAt(scene.position);

        for (i = 0; i < scene.children.length; i++) {
            var object = scene.children[i];
            if (object instanceof THREE.Points) {
                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
        }

        for (i = 0; i < materials.length; i++) {
            color = parameters[i][0];
            h = (360 * (color[0] + (time*7)) % 360) / 360;
            materials[i].color.setHSL(h, color[1], color[2]);
        }

        renderer.render(scene, camera);
    }

    function onDocumentMouseMove(e) {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
    }

    function onDocumentTouchStart(e) {
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

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
})();