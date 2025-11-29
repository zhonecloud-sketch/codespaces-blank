// 3D Japanese House - Main JavaScript
class JapaneseHouse3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.houseGroup = null;
        this.isAutoRotating = true;
        this.currentSeason = 'summer';
        this.currentWeather = 'clear';
        this.timeOfDay = 0.7; // 0-1 (0=dawn, 1=dusk)
        this.audioContext = null;
        this.natureSounds = null;
        this.isAudioEnabled = false;
        
        // Season cycle properties
        this.seasonProgress = 0; // 0-4 (cycles through seasons)
        this.seasonSpeed = 30; // 0-100 slider value
        this.seasons = ['spring', 'summer', 'autumn', 'winter'];
        
        // Material references for seasonal changes
        this.materials = {
            mapleFoliage: null,
            yellowLeaves: [],
            bushMaterials: [],
            grassBlades: [],
            grassBase: null,
            pondWater: null,
            lilyPad: null
        };
        
        // Texture loader
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};
        
        this.init();
    }

    init() {
        this.setupScene();
        this.loadTextures();
        this.setupLighting();
        this.createEnvironment();
        this.createJapaneseHouse();
        this.createGardenElements();
        this.setupControls();
        // Apply initial season colors (default is summer)
        this.updateSeason();
        // Audio and UI removed for mobile-only 3D view
        this.animate();
    }

    setupScene() {
        // Create scene with sage green background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x9CAF88);
        this.scene.fog = new THREE.Fog(0x9CAF88, 10, 50);

        // Setup camera with isometric view
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(8, 6, 8);
        this.camera.lookAt(0, 0, 0);

        // Setup renderer with mobile optimization
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows BEFORE any rendering
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;  // Good balance of quality and compatibility
        this.renderer.shadowMap.autoUpdate = true;
        
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Enable frustum culling for better performance
        this.renderer.frustumCulled = true;
        
        // Reduce precision for better mobile performance
        if (window.innerWidth < 768) {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }

        document.getElementById('scene-container').appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Monitor performance and adjust quality
        this.setupPerformanceMonitoring();
    }

    loadTextures() {
        // Load all textures
        this.textures.woodGrain = this.textureLoader.load('resources/textures/wood_grain.jpg');
        this.textures.woodGrain.wrapS = THREE.RepeatWrapping;
        this.textures.woodGrain.wrapT = THREE.RepeatWrapping;
        this.textures.woodGrain.repeat.set(2, 2);

        this.textures.clayWall = this.textureLoader.load('resources/textures/clay_wall.jpg');
        this.textures.clayWall.wrapS = THREE.RepeatWrapping;
        this.textures.clayWall.wrapT = THREE.RepeatWrapping;
        this.textures.clayWall.repeat.set(2, 2);

        this.textures.roofTiles = this.textureLoader.load('resources/textures/roof_tiles.jpg');
        this.textures.roofTiles.wrapS = THREE.RepeatWrapping;
        this.textures.roofTiles.wrapT = THREE.RepeatWrapping;
        this.textures.roofTiles.repeat.set(4, 4);

        this.textures.stoneLantern = this.textureLoader.load('resources/textures/stone_lantern.jpg');
        this.textures.stoneLantern.wrapS = THREE.RepeatWrapping;
        this.textures.stoneLantern.wrapT = THREE.RepeatWrapping;

        this.textures.waterRipples = this.textureLoader.load('resources/textures/water_ripples.jpg');
        this.textures.waterRipples.wrapS = THREE.RepeatWrapping;
        this.textures.waterRipples.wrapT = THREE.RepeatWrapping;
        this.textures.waterRipples.repeat.set(2, 2);
    }
    
    setupPerformanceMonitoring() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.lowPerformanceMode = false;
        
        // Check performance every 60 frames
        setInterval(() => {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            const fps = Math.round(this.frameCount / deltaTime * 1000);
            
            if (fps < 30 && !this.lowPerformanceMode) {
                this.enableLowPerformanceMode();
            } else if (fps > 45 && this.lowPerformanceMode) {
                this.disableLowPerformanceMode();
            }
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }, 2000);
    }
    
    enableLowPerformanceMode() {
        this.lowPerformanceMode = true;
        
        // Reduce shadow quality
        this.mainLight.shadow.mapSize.width = 512;
        this.mainLight.shadow.mapSize.height = 512;
        
        // Reduce particle count
        if (this.particles) {
            this.particles.geometry.setDrawRange(0, 25);
        }
        
        // Reduce renderer pixel ratio
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    }
    
    disableLowPerformanceMode() {
        this.lowPerformanceMode = false;
        
        // Restore shadow quality
        this.mainLight.shadow.mapSize.width = 1024;
        this.mainLight.shadow.mapSize.height = 1024;
        
        // Restore particle count
        if (this.particles) {
            this.particles.geometry.setDrawRange(0, 50);
        }
        
        // Restore renderer pixel ratio
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Main directional light (sun) - fixed position, shadows always visible
        this.mainLight = new THREE.DirectionalLight(0xfff8dc, 1.0);
        this.mainLight.position.set(10, 15, 10);
        this.mainLight.castShadow = true;
        
        this.mainLight.shadow.mapSize.width = 1024;
        this.mainLight.shadow.mapSize.height = 1024;
        this.mainLight.shadow.camera.near = 0.5;
        this.mainLight.shadow.camera.far = 50;
        this.mainLight.shadow.camera.left = -15;
        this.mainLight.shadow.camera.right = 15;
        this.mainLight.shadow.camera.top = 15;
        this.mainLight.shadow.camera.bottom = -15;
        this.mainLight.shadow.bias = -0.0001;
        this.mainLight.shadow.normalBias = 0.02;
        
        this.scene.add(this.mainLight);

        // Warm window light with flickering effect
        this.windowLight = new THREE.PointLight(0xffaa44, 0.8, 10);
        this.windowLight.position.set(0, 2, 0.5);
        this.scene.add(this.windowLight);
        
        // Additional accent lights for better atmosphere
        this.accentLight1 = new THREE.SpotLight(0xffdd99, 0.3, 8, Math.PI / 6, 0.5);
        this.accentLight1.position.set(-2, 4, 2);
        this.accentLight1.target.position.set(-2.5, 0, -1);
        this.scene.add(this.accentLight1);
        this.scene.add(this.accentLight1.target);
        
        this.accentLight2 = new THREE.SpotLight(0xffdd99, 0.2, 6, Math.PI / 8, 0.3);
        this.accentLight2.position.set(2.5, 3, 1);
        this.accentLight2.target.position.set(2.5, 0, -1);
        this.scene.add(this.accentLight2);
        this.scene.add(this.accentLight2.target);

        // Update lighting based on time of day
        this.updateTimeOfDay();
    }

    createEnvironment() {
        // Circular grassy island
        const islandGeometry = new THREE.CylinderGeometry(4, 4, 0.5, 32);
        const islandMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x7C9885,
            transparent: true,
            opacity: 0.9
        });
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        island.position.y = -0.25;
        island.receiveShadow = true;
        this.scene.add(island);

        // Grass cylinder base - completely coats the island podium including height
        const grassBaseGeometry = new THREE.CylinderGeometry(4.05, 4.05, 0.55, 32);
        const grassBaseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2E5A3C,  // Darker grass green
        });
        this.materials.grassBase = grassBaseMaterial;  // Store reference
        const grassBase = new THREE.Mesh(grassBaseGeometry, grassBaseMaterial);
        grassBase.position.y = -0.225;  // Align with island podium
        grassBase.receiveShadow = true;
        this.scene.add(grassBase);
        
        // Furry grass blades on top of base
        this.createFurryGrass();
    }
    
    createFurryGrass() {
        const grassBladeCount = 800;
        const grassColors = [0x2E5A3C, 0x3A6B4A, 0x4A7C59, 0x1E4A2C];
        
        for (let i = 0; i < grassBladeCount; i++) {
            // Random position within circle
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 3.9;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Skip grass where the house foundation is
            if (Math.abs(x) < 1.6 && Math.abs(z) < 1.6) continue;
            
            // Random grass blade properties
            const height = 0.08 + Math.random() * 0.12;
            const thickness = 0.015 + Math.random() * 0.01;
            
            const bladeGeometry = new THREE.ConeGeometry(thickness, height, 4);
            const colorIndex = Math.floor(Math.random() * grassColors.length);
            const bladeMaterial = new THREE.MeshLambertMaterial({ 
                color: grassColors[colorIndex]
            });
            
            // Store material reference for seasonal changes
            this.materials.grassBlades.push(bladeMaterial);
            
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(x, 0.02 + height / 2, z);
            
            // Slight random tilt for natural look
            blade.rotation.x = (Math.random() - 0.5) * 0.3;
            blade.rotation.z = (Math.random() - 0.5) * 0.3;
            
            this.scene.add(blade);
        }
    }

    createJapaneseHouse() {
        this.houseGroup = new THREE.Group();

        // House base/foundation
        const baseGeometry = new THREE.BoxGeometry(3, 0.3, 3);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.woodGrain,
            color: 0x8B7355 
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        this.houseGroup.add(base);

        // Main house structure
        const houseGeometry = new THREE.BoxGeometry(2.5, 2, 2.5);
        const houseMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.clayWall,
            color: 0xD4B5A0 
        });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        house.position.y = 1.3;
        house.castShadow = true;
        house.receiveShadow = true;
        this.houseGroup.add(house);

        // Pagoda-style roof
        this.createPagodaRoof();

        // Windows with warm glow
        this.createWindows();

        // Entrance
        this.createEntrance();

        this.scene.add(this.houseGroup);
    }

    createPagodaRoof() {
        const roofGroup = new THREE.Group();
        
        const roofMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.roofTiles,
            color: 0x3A3A3A 
        });

        // Create triangular prism roof with curved ridge (dips in center)
        const roofWidth = 3.2;  // Width of the roof at ridge
        const roofDepth = 3.2;  // Depth of the roof at ridge
        const roofHeight = 1.2; // Height of the peak at ends
        const ridgeDip = 0.25;  // How much the ridge dips at center
        const segments = 8;     // Number of segments along the ridge
        
        const halfWidth = roofWidth / 2;
        const halfDepth = roofDepth / 2;
        
        // Bottom of roof extends to match eaves (overhang)
        const bottomHalfWidth = halfWidth + 0.3;  // 1.9
        const bottomHalfDepth = halfDepth + 0.3;  // 1.9
        
        // Create custom geometry with curved ridge
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const uvs = [];
        
        // Generate vertices along the ridge with curve
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const zTop = halfDepth - t * roofDepth;
            const zBottom = bottomHalfDepth - t * (bottomHalfDepth * 2);
            
            // Calculate ridge height - parabolic curve dipping in center
            const centerT = (t - 0.5) * 2; // -1 to 1
            const curveHeight = roofHeight - ridgeDip * (1 - centerT * centerT);
            
            // Bottom left vertex (expanded)
            vertices.push(-bottomHalfWidth, 0, zBottom);
            uvs.push(0, t);
            
            // Ridge vertex (top center with curve)
            vertices.push(0, curveHeight, zTop);
            uvs.push(0.5, t);
            
            // Bottom right vertex (expanded)
            vertices.push(bottomHalfWidth, 0, zBottom);
            uvs.push(1, t);
        }
        
        // Generate indices for the roof faces
        for (let i = 0; i < segments; i++) {
            const base = i * 3;
            
            // Left slope (two triangles per segment)
            indices.push(base, base + 1, base + 3);      // Triangle 1
            indices.push(base + 3, base + 1, base + 4);  // Triangle 2
            
            // Right slope (two triangles per segment)
            indices.push(base + 1, base + 2, base + 4);  // Triangle 1
            indices.push(base + 4, base + 2, base + 5);  // Triangle 2
        }
        
        // Front face (triangle)
        const frontBase = 0;
        indices.push(frontBase, frontBase + 2, frontBase + 1);
        
        // Back face (triangle)
        const backBase = segments * 3;
        indices.push(backBase, backBase + 1, backBase + 2);
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        const roof = new THREE.Mesh(geometry, roofMaterial);
        roof.position.y = 2.3;
        roof.castShadow = true;
        roof.receiveShadow = true;
        roofGroup.add(roof);
        
        // Add roof overhang/eaves
        const eavesGeometry = new THREE.BufferGeometry();
        const eavesHalfWidth = halfWidth + 0.3;
        const eavesHalfDepth = halfDepth + 0.3;
        
        const eavesVertices = new Float32Array([
            // Bottom face of eaves (underside visible)
            -eavesHalfWidth, -0.05, eavesHalfDepth,
            eavesHalfWidth, -0.05, eavesHalfDepth,
            eavesHalfWidth, -0.05, -eavesHalfDepth,
            -eavesHalfWidth, -0.05, -eavesHalfDepth,
        ]);
        
        const eavesIndices = [0, 2, 1, 0, 3, 2];
        
        eavesGeometry.setAttribute('position', new THREE.BufferAttribute(eavesVertices, 3));
        eavesGeometry.setIndex(eavesIndices);
        eavesGeometry.computeVertexNormals();
        
        const eavesMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x5D4037,
            side: THREE.DoubleSide
        });
        const eaves = new THREE.Mesh(eavesGeometry, eavesMaterial);
        eaves.position.y = 2.3;
        roofGroup.add(eaves);

        this.houseGroup.add(roofGroup);
    }

    createWindows() {
        // Wooden window frame material
        const frameMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.woodGrain,
            color: 0x8B4513  // Saddle brown wood color
        });

        // Left window frame (4 pieces forming a rectangle)
        const frameThickness = 0.05;
        const frameWidth = 0.85;
        const frameHeight = 0.55;
        
        // Left window - top frame piece
        const leftTopFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameThickness, frameWidth), frameMaterial);
        leftTopFrame.position.set(-1.27, 1.5 + frameHeight/2, 0);
        this.houseGroup.add(leftTopFrame);
        
        // Left window - bottom frame piece
        const leftBottomFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameThickness, frameWidth), frameMaterial);
        leftBottomFrame.position.set(-1.27, 1.5 - frameHeight/2, 0);
        this.houseGroup.add(leftBottomFrame);
        
        // Left window - front frame piece
        const leftFrontFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), frameMaterial);
        leftFrontFrame.position.set(-1.27, 1.5, frameWidth/2);
        this.houseGroup.add(leftFrontFrame);
        
        // Left window - back frame piece
        const leftBackFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), frameMaterial);
        leftBackFrame.position.set(-1.27, 1.5, -frameWidth/2);
        this.houseGroup.add(leftBackFrame);

        // Right window - top frame piece
        const rightTopFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameThickness, frameWidth), frameMaterial);
        rightTopFrame.position.set(1.27, 1.5 + frameHeight/2, 0);
        this.houseGroup.add(rightTopFrame);
        
        // Right window - bottom frame piece
        const rightBottomFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameThickness, frameWidth), frameMaterial);
        rightBottomFrame.position.set(1.27, 1.5 - frameHeight/2, 0);
        this.houseGroup.add(rightBottomFrame);
        
        // Right window - front frame piece
        const rightFrontFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), frameMaterial);
        rightFrontFrame.position.set(1.27, 1.5, frameWidth/2);
        this.houseGroup.add(rightFrontFrame);
        
        // Right window - back frame piece
        const rightBackFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), frameMaterial);
        rightBackFrame.position.set(1.27, 1.5, -frameWidth/2);
        this.houseGroup.add(rightBackFrame);

        // Windows on side walls with warm yellow glow - horizontal/landscape orientation
        const windowGeometry = new THREE.PlaneGeometry(0.75, 0.45);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFDD44,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        // Left side wall window (rotated to face outward from left wall, horizontal)
        const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        leftWindow.position.set(-1.26, 1.5, 0);
        leftWindow.rotation.y = Math.PI / 2;  // Face left wall
        this.houseGroup.add(leftWindow);

        // Right side wall window (rotated to face outward from right wall, horizontal)
        const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        rightWindow.position.set(1.26, 1.5, 0);
        rightWindow.rotation.y = Math.PI / 2;  // Face right wall
        this.houseGroup.add(rightWindow);

        // Add stronger point lights behind windows to create warm glow effect
        const leftWindowLight = new THREE.PointLight(0xFFCC00, 1.5, 8);
        leftWindowLight.position.set(-0.8, 1.5, 0);
        this.houseGroup.add(leftWindowLight);

        const rightWindowLight = new THREE.PointLight(0xFFCC00, 1.5, 8);
        rightWindowLight.position.set(0.8, 1.5, 0);
        this.houseGroup.add(rightWindowLight);
    }

    createEntrance() {
        // Japanese sliding door (Shoji style) - wooden frame with paper panels
        const doorGroup = new THREE.Group();
        
        // Door frame material - dark wood
        const frameMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.woodGrain,
            color: 0x4A3728
        });
        
        // Main door panel - translucent paper/screen
        const panelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFF8DC,  // Cream/paper color
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });
        
        // Left sliding door
        const leftDoorGroup = new THREE.Group();
        
        // Left door frame - outer rectangle
        const leftOuterFrame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.03), frameMaterial);
        leftOuterFrame.position.set(-0.2, 0, 0);
        leftDoorGroup.add(leftOuterFrame);
        
        // Left door panel (paper screen)
        const leftPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 1.1), panelMaterial);
        leftPanel.position.set(-0.2, 0, 0.02);
        leftDoorGroup.add(leftPanel);
        
        // Left door horizontal dividers (3 lines)
        for (let i = 0; i < 3; i++) {
            const divider = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.035), frameMaterial);
            divider.position.set(-0.2, -0.3 + i * 0.3, 0);
            leftDoorGroup.add(divider);
        }
        
        // Left door vertical divider (center)
        const leftVertDivider = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.1, 0.035), frameMaterial);
        leftVertDivider.position.set(-0.2, 0, 0);
        leftDoorGroup.add(leftVertDivider);
        
        leftDoorGroup.position.set(0, 0.9, 1.31);
        doorGroup.add(leftDoorGroup);
        
        // Right sliding door
        const rightDoorGroup = new THREE.Group();
        
        // Right door frame - outer rectangle
        const rightOuterFrame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.03), frameMaterial);
        rightOuterFrame.position.set(0.2, 0, 0);
        rightDoorGroup.add(rightOuterFrame);
        
        // Right door panel (paper screen)
        const rightPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 1.1), panelMaterial);
        rightPanel.position.set(0.2, 0, 0.02);
        rightDoorGroup.add(rightPanel);
        
        // Right door horizontal dividers (3 lines)
        for (let i = 0; i < 3; i++) {
            const divider = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.035), frameMaterial);
            divider.position.set(0.2, -0.3 + i * 0.3, 0);
            rightDoorGroup.add(divider);
        }
        
        // Right door vertical divider (center)
        const rightVertDivider = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.1, 0.035), frameMaterial);
        rightVertDivider.position.set(0.2, 0, 0);
        rightDoorGroup.add(rightVertDivider);
        
        rightDoorGroup.position.set(0, 0.9, 1.31);
        doorGroup.add(rightDoorGroup);
        
        // Add warm light behind door to show interior glow
        const doorLight = new THREE.PointLight(0xFFAA44, 0.5, 4);
        doorLight.position.set(0, 0.9, 1.0);
        doorGroup.add(doorLight);
        
        doorGroup.castShadow = true;
        this.houseGroup.add(doorGroup);

        // Small entrance roof/awning - expanded for lanterns, using roof material
        const entranceRoofGeometry = new THREE.BoxGeometry(2.2, 0.05, 0.8);
        const entranceRoofMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.roofTiles,
            color: 0x3A3A3A 
        });
        const entranceRoof = new THREE.Mesh(entranceRoofGeometry, entranceRoofMaterial);
        entranceRoof.position.set(0, 1.8, 1.6);
        entranceRoof.rotation.x = Math.PI / 4;  // Tilt down 45 degrees
        entranceRoof.castShadow = true;
        this.houseGroup.add(entranceRoof);

        // Paper lanterns hanging from awning edges - lowered
        this.createPaperLantern(-0.95, 1.35, 1.75);  // Left lantern
        this.createPaperLantern(0.95, 1.35, 1.75);   // Right lantern
    }

    createPaperLantern(x, y, z) {
        const lanternGroup = new THREE.Group();
        
        // Lantern string/wire
        const stringGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8);
        const stringMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        const string = new THREE.Mesh(stringGeometry, stringMaterial);
        string.position.y = 0.1;
        lanternGroup.add(string);
        
        // Lantern body - traditional paper lantern shape (oval/cylinder)
        const lanternGeometry = new THREE.SphereGeometry(0.12, 16, 12);
        lanternGeometry.scale(1, 1.3, 1);  // Elongate vertically
        const lanternMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,  // Red-orange paper lantern
            transparent: true,
            opacity: 0.9
        });
        const lanternBody = new THREE.Mesh(lanternGeometry, lanternMaterial);
        lanternBody.position.y = -0.1;
        lanternGroup.add(lanternBody);
        
        // Lantern top cap
        const topCapGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.04, 12);
        const capMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        const topCap = new THREE.Mesh(topCapGeometry, capMaterial);
        topCap.position.y = 0.05;
        lanternGroup.add(topCap);
        
        // Lantern bottom cap
        const bottomCapGeometry = new THREE.CylinderGeometry(0.08, 0.05, 0.04, 12);
        const bottomCap = new THREE.Mesh(bottomCapGeometry, capMaterial);
        bottomCap.position.y = -0.25;
        lanternGroup.add(bottomCap);
        
        // Lantern glow light
        const lanternLight = new THREE.PointLight(0xFF6633, 0.6, 3);
        lanternLight.position.y = -0.1;
        lanternGroup.add(lanternLight);
        
        lanternGroup.position.set(x, y, z);
        this.houseGroup.add(lanternGroup);
    }

    createGardenElements() {
        // Red maple tree (left side)
        this.createMapleTree(-2.5, 0, -1);

        // Slanting tree with yellow leaves (right side)
        this.createSlantingTree(2.5, 0, -1);

        // Stone lantern (front of house)
        this.createStoneLantern(1.5, 0, 2);

        // Small pond with lily pad (front of house, not crossing base)
        this.createPond(-1.5, 0.05, 2.0);
        
        // Bushes on sides and back of house
        this.createBushes();
        
        // Stone staircase in front of door
        this.createStaircase();
        
        // Add particle effects for atmosphere
        this.createParticleEffects();
        
        // Add subtle environmental elements
        this.createEnvironmentalDetails();
    }
    
    createBushes() {
        const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x2D5A27 });  // Dark green
        this.materials.bushMaterials.push(bushMaterial);
        
        // Bush positions: sides and back of house
        const bushPositions = [
            // Left side
            { x: -1.8, z: -0.5 },
            { x: -1.8, z: 0.5 },
            // Right side
            { x: 1.8, z: -0.5 },
            { x: 1.8, z: 0.5 },
            // Back of house
            { x: -0.8, z: -1.8 },
            { x: 0, z: -1.9 },
            { x: 0.8, z: -1.8 },
        ];
        
        bushPositions.forEach(pos => {
            const bushGroup = new THREE.Group();
            
            // Create bush with multiple spheres for natural look (1.5x bigger)
            const sizes = [0.375, 0.3, 0.27];
            const offsets = [
                { x: 0, y: 0, z: 0 },
                { x: 0.15, y: 0.075, z: 0.12 },
                { x: -0.12, y: 0.045, z: -0.09 },
            ];
            
            sizes.forEach((size, i) => {
                const sphereGeometry = new THREE.SphereGeometry(size, 8, 6);
                const sphere = new THREE.Mesh(sphereGeometry, bushMaterial);
                sphere.position.set(offsets[i].x, offsets[i].y + size, offsets[i].z);
                sphere.castShadow = true;
                bushGroup.add(sphere);
            });
            
            bushGroup.position.set(pos.x, -0.025, pos.z);  // Lowered so 1/5th submerges into base
            this.scene.add(bushGroup);
        });
    }
    
    createStaircase() {
        const stoneMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.stoneLantern,
            color: 0x808080  // Gray stone
        });
        
        // Bottom step (wider) - inner edge touches door
        const step1Geometry = new THREE.BoxGeometry(1.5, 0.12, 0.5);
        const step1 = new THREE.Mesh(step1Geometry, stoneMaterial);
        step1.position.set(0, 0.11, 1.75);  // Inner edge at z=1.5 (door)
        step1.castShadow = true;
        step1.receiveShadow = true;
        this.scene.add(step1);
        
        // Top step (slightly narrower) - inner edge touches door, on top of bottom step
        const step2Geometry = new THREE.BoxGeometry(1.0, 0.12, 0.35);
        const step2 = new THREE.Mesh(step2Geometry, stoneMaterial);
        step2.position.set(0, 0.23, 1.675);  // Inner edge at z=1.5 (door), y on top of step1
        step2.castShadow = true;
        step2.receiveShadow = true;
        this.scene.add(step2);
    }
    
    createParticleEffects() {
        // Floating particles for atmosphere - changes with season
        const particleCount = 60;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = Math.random() * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
            
            velocities[i * 3] = (Math.random() - 0.5) * 0.002;
            velocities[i * 3 + 1] = -0.002 - Math.random() * 0.003;  // Falling down
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        // Default summer: light pollen - use NormalBlending to show true colors
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffcc,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        this.particleMaterial = particleMaterial;  // Store reference
        this.particles = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particles);
    }
    
    createEnvironmentalDetails() {
        // Add subtle grass details around the island
        for (let i = 0; i < 20; i++) {
            const grassGeometry = new THREE.ConeGeometry(0.02, 0.2, 3);
            const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x7C9885 });
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            
            const angle = Math.random() * Math.PI * 2;
            const radius = 3.5 + Math.random() * 0.5;
            grass.position.x = Math.cos(angle) * radius;
            grass.position.z = Math.sin(angle) * radius;
            grass.position.y = 0.1;
            grass.rotation.y = Math.random() * Math.PI * 2;
            
            this.scene.add(grass);
        }
    }

    createMapleTree(x, y, z) {
        const treeGroup = new THREE.Group();

        // Tree trunk with wood material
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 2);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.woodGrain,
            color: 0x3E2723  // Dark brown
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Tree foliage - lowered to cover most of trunk (only 1/5th visible)
        const foliageGeometry = new THREE.SphereGeometry(1.2, 8, 6);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0xB85450 });
        this.materials.mapleFoliage = foliageMaterial;  // Store reference
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 1.6;  // Lowered to show only 1/5th of trunk
        foliage.castShadow = true;
        treeGroup.add(foliage);

        treeGroup.position.set(x, y, z);
        this.mapleTree = treeGroup;  // Store reference
        this.scene.add(treeGroup);
    }

    createSlantingTree(x, y, z) {
        const treeGroup = new THREE.Group();

        // Tree trunk - short, at bush tip height, slanting at 15 degrees, with wood material
        const trunkGeometry = new THREE.CylinderGeometry(0.06, 0.1, 0.8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.woodGrain,
            color: 0x3E2723  // Dark brown
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.4;
        trunk.rotation.z = -15 * Math.PI / 180;  // 15 degrees slant
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Branch - half the thickness, same length, slanting at 60 degrees
        const branchGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.8);
        const branch = new THREE.Mesh(branchGeometry, trunkMaterial);  // Same wood material
        // Position at top of slanted trunk
        const trunkTopX = Math.sin(15 * Math.PI / 180) * 0.4;
        const trunkTopY = 0.8;
        branch.position.set(trunkTopX + 0.3, trunkTopY + 0.2, 0);
        branch.rotation.z = -60 * Math.PI / 180;  // 60 degrees slant
        branch.castShadow = true;
        treeGroup.add(branch);

        // Yellow leaves group - expanded horizontally
        const leafMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });  // Golden yellow
        this.materials.yellowLeaves.push(leafMaterial);  // Store reference
        
        // Main leaf cluster at branch end
        const branchEndX = trunkTopX + 0.3 + Math.sin(60 * Math.PI / 180) * 0.4;
        const branchEndY = trunkTopY + 0.2 + Math.cos(60 * Math.PI / 180) * 0.4;
        
        // Multiple leaf spheres - wider horizontal spread
        const leafPositions = [
            { x: 0, y: 0, z: 0, size: 0.35 },
            { x: 0.35, y: 0.05, z: 0.2, size: 0.28 },
            { x: -0.3, y: 0.08, z: -0.15, size: 0.3 },
            { x: 0.2, y: -0.05, z: -0.25, size: 0.25 },
            { x: -0.25, y: 0.03, z: 0.3, size: 0.26 },
            { x: 0.4, y: 0, z: -0.1, size: 0.22 },
            { x: -0.4, y: 0.02, z: 0.1, size: 0.24 },
        ];
        
        leafPositions.forEach(leaf => {
            const leafGeometry = new THREE.SphereGeometry(leaf.size, 8, 6);
            const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);
            leafMesh.position.set(branchEndX + leaf.x, branchEndY + leaf.y, leaf.z);
            leafMesh.castShadow = true;
            treeGroup.add(leafMesh);
        });

        treeGroup.position.set(x, y, z);
        this.slantingTree = treeGroup;  // Store reference
        this.scene.add(treeGroup);
    }

    createStoneLantern(x, y, z) {
        const lanternGroup = new THREE.Group();

        // Lantern base (scaled down)
        const baseGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.4);
        const stoneMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.stoneLantern,
            color: 0x6B6B6B 
        });
        const lanternBase = new THREE.Mesh(baseGeometry, stoneMaterial);
        lanternBase.position.y = 0.1;
        lanternBase.castShadow = true;
        lanternGroup.add(lanternBase);

        // Lantern post (shorter)
        const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        const post = new THREE.Mesh(postGeometry, stoneMaterial);
        post.position.y = 0.45;
        post.castShadow = true;
        lanternGroup.add(post);

        // Lantern housing (smaller)
        const housingGeometry = new THREE.BoxGeometry(0.26, 0.26, 0.26);
        const housing = new THREE.Mesh(housingGeometry, stoneMaterial);
        housing.position.y = 0.83;
        housing.castShadow = true;
        lanternGroup.add(housing);

        // Lantern light
        const lightGeometry = new THREE.PlaneGeometry(0.13, 0.2);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFAA44,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const lanternLight = new THREE.Mesh(lightGeometry, lightMaterial);
        lanternLight.position.set(0, 0.83, 0.14);
        lanternGroup.add(lanternLight);

        // Lantern roof - tip at y=1.1 to match paper lantern bottom
        const roofGeometry = new THREE.ConeGeometry(0.2, 0.14, 4);
        const roof = new THREE.Mesh(roofGeometry, stoneMaterial);
        roof.position.y = 1.03;
        roof.castShadow = true;
        lanternGroup.add(roof);

        lanternGroup.position.set(x, y, z);
        this.scene.add(lanternGroup);
    }

    createPond(x, y, z) {
        const pondGroup = new THREE.Group();

        // Pond bottom - dark green color, using circle geometry facing upward
        const pondBottomGeometry = new THREE.CircleGeometry(0.48, 24);
        const pondBottomMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x0D3B1F,  // Darker green
            side: THREE.DoubleSide
        });
        const pondBottom = new THREE.Mesh(pondBottomGeometry, pondBottomMaterial);
        pondBottom.rotation.x = -Math.PI / 2;  // Rotate to face upward
        pondBottom.position.y = 0.06;  // Above grass base level
        pondGroup.add(pondBottom);

        // Pond water surface - restored
        const pondGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 24);
        const pondMaterial = new THREE.MeshPhysicalMaterial({ 
            map: this.textures.waterRipples,
            color: 0x88DDDD,  // Light cyan tint
            transparent: true,
            opacity: 0.4,
            transmission: 0.8,
            roughness: 0.05,
            metalness: 0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            side: THREE.DoubleSide
        });
        const pond = new THREE.Mesh(pondGeometry, pondMaterial);
        pond.position.y = 0;
        pond.receiveShadow = true;
        pondGroup.add(pond);

        // Clay brown ring around the pond
        const ringGeometry = new THREE.TorusGeometry(0.55, 0.08, 12, 32);
        const ringMaterial = new THREE.MeshLambertMaterial({ 
            map: this.textures.clayWall,
            color: 0x8B4513  // Saddle brown
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.02;  // Lower into the base for natural clay dirt look
        pondGroup.add(ring);

        // Lily pad - small circular leaf
        const lilyPadGeometry = new THREE.CircleGeometry(0.1, 12);
        const lilyPadMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide
        });
        const lilyPad = new THREE.Mesh(lilyPadGeometry, lilyPadMaterial);
        lilyPad.position.set(0.15, 0.05, 0.1);
        lilyPad.rotation.x = -Math.PI / 2;
        lilyPad.castShadow = true;
        pondGroup.add(lilyPad);

        // Lily flower - small pink blossom
        const petalGeometry = new THREE.SphereGeometry(0.03, 6, 4);
        const petalMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        
        // Create multiple petals
        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(
                0.15 + Math.cos(angle) * 0.03,
                0.07,
                0.1 + Math.sin(angle) * 0.03
            );
            petal.scale.set(1, 0.5, 1);
            pondGroup.add(petal);
        }
        
        // Center of flower
        const centerGeometry = new THREE.SphereGeometry(0.015, 6, 4);
        const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.set(0.15, 0.08, 0.1);
        pondGroup.add(center);

        pondGroup.position.set(x, y, z);
        this.scene.add(pondGroup);
    }

    setupControls() {
        // Touch-based orbit controls for mobile
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2.83;  // ~17 degrees per second

        // Touch gesture handling
        this.setupTouchGestures();
    }

    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let isPinching = false;
        let initialDistance = 0;

        const canvas = this.renderer.domElement;

        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isPinching = true;
                initialDistance = this.getTouchDistance(e.touches);
            } else {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            if (isPinching && e.touches.length === 2) {
                const currentDistance = this.getTouchDistance(e.touches);
                const scale = currentDistance / initialDistance;
                this.camera.position.multiplyScalar(1 / scale);
                initialDistance = currentDistance;
            }
        });

        canvas.addEventListener('touchend', (e) => {
            isPinching = false;
        });
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    setupAudio() {
        // Create audio context for nature sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create ambient nature sounds using Web Audio API
            this.createNatureAmbience();
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }

    createNatureAmbience() {
        // Create white noise for water sounds
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate filtered noise for water sound
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        this.natureSounds = this.audioContext.createBufferSource();
        this.natureSounds.buffer = buffer;
        this.natureSounds.loop = true;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;
        
        this.natureSounds.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.natureSounds.start();
        this.audioGainNode = gainNode;
    }

    setupUI() {
        // Time of day slider
        const timeSlider = document.getElementById('time-slider');
        timeSlider.addEventListener('input', (e) => {
            this.timeOfDay = parseFloat(e.target.value);
            this.updateTimeOfDay();
        });

        // Weather toggle
        const weatherToggle = document.getElementById('weather-toggle');
        weatherToggle.addEventListener('change', (e) => {
            this.currentWeather = e.target.value;
            this.updateWeather();
        });

        // Season selector
        const seasonButtons = document.querySelectorAll('.season-btn');
        seasonButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                seasonButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSeason = e.target.dataset.season;
                this.updateSeason();
            });
        });

        // Audio toggle
        const audioToggle = document.getElementById('audio-toggle');
        audioToggle.addEventListener('change', (e) => {
            this.isAudioEnabled = e.target.checked;
            this.updateAudio();
        });

        // Reset view button
        const resetBtn = document.getElementById('reset-view');
        resetBtn.addEventListener('click', () => {
            this.resetCamera();
        });

        // Auto-rotate toggle
        const rotateToggle = document.getElementById('rotate-toggle');
        rotateToggle.addEventListener('change', (e) => {
            this.isAutoRotating = e.target.checked;
            this.controls.autoRotate = this.isAutoRotating;
        });
    }

    updateTimeOfDay() {
        // Update sun position and color
        const sunAngle = this.timeOfDay * Math.PI;
        this.mainLight.position.x = Math.cos(sunAngle) * 15;
        this.mainLight.position.y = Math.sin(sunAngle) * 15 + 5;
        
        // Update light color and intensity
        const sunColor = new THREE.Color();
        if (this.timeOfDay < 0.3) {
            sunColor.setHSL(0.1, 0.7, 0.8); // Dawn orange
        } else if (this.timeOfDay > 0.8) {
            sunColor.setHSL(0.05, 0.8, 0.7); // Dusk red
        } else {
            sunColor.setHSL(0.15, 0.3, 0.9); // Daylight
        }
        this.mainLight.color = sunColor;
        this.mainLight.intensity = 0.5 + this.timeOfDay * 0.8;

        // Update window light intensity
        this.windowLight.intensity = 0.3 + (1 - this.timeOfDay) * 1.0;
        
        // Update background color
        const bgColor = new THREE.Color(0x9CAF88);
        bgColor.multiplyScalar(0.7 + this.timeOfDay * 0.3);
        this.scene.background = bgColor;
        this.scene.fog.color = bgColor;
    }

    updateWeather() {
        // Update fog and lighting based on weather
        switch (this.currentWeather) {
            case 'clear':
                this.scene.fog.near = 10;
                this.scene.fog.far = 50;
                this.mainLight.intensity = 0.8;
                break;
            case 'misty':
                this.scene.fog.near = 5;
                this.scene.fog.far = 20;
                this.mainLight.intensity = 0.6;
                break;
            case 'rain':
                this.scene.fog.near = 3;
                this.scene.fog.far = 15;
                this.mainLight.intensity = 0.4;
                break;
        }
    }

    updateSeason() {
        // Season color palettes
        const seasonColors = {
            spring: {
                maple: 0xFFB7C5,      // Cherry blossom pink
                yellowTree: 0x90EE90,  // Light green (budding)
                grass: [0x7CCD7C, 0x8FBC8F, 0x98FB98, 0x6B8E6B],
                grassBase: 0x6B8E6B,
                bush: 0x5AA55A,
                particle: 0xFFB7C5,    // Cherry blossom petals
                particleSize: 0.12,
                background: 0xA8C5A8
            },
            summer: {
                maple: 0x228B22,       // Forest green
                yellowTree: 0x32CD32,  // Lime green
                grass: [0x2E5A3C, 0x3A6B4A, 0x4A7C59, 0x1E4A2C],
                grassBase: 0x2E5A3C,
                bush: 0x2D5A27,
                particle: 0xffffcc,    // Light pollen
                particleSize: 0.06,
                background: 0x9CAF88
            },
            autumn: {
                maple: 0xB85450,       // Red maple
                yellowTree: 0xFFD700,  // Golden yellow
                grass: [0x9B7B4D, 0x8B6914, 0xA0892C, 0x7D6608],
                grassBase: 0x8B7355,
                bush: 0xA0522D,        // Sienna
                particle: 0xFF6B35,    // Falling orange leaves
                particleSize: 0.15,
                background: 0xB8A888
            },
            winter: {
                maple: 0x8B7355,       // Bare brown (few leaves)
                yellowTree: 0x8B7355,  // Bare branches
                grass: [0xCCCCCC, 0xE8E8E8, 0xD4D4D4, 0xBBBBBB],  // Snow-covered
                grassBase: 0xE0E0E0,   // Snowy ground
                bush: 0x4A5A4A,        // Dark muted green
                particle: 0xFFFFFF,    // Snow
                particleSize: 0.1,
                background: 0xC8D4D8
            }
        };
        
        const colors = seasonColors[this.currentSeason];
        if (!colors) return;
        
        // Update maple tree foliage
        if (this.materials.mapleFoliage) {
            this.materials.mapleFoliage.color.setHex(colors.maple);
        }
        
        // Update yellow/slanting tree leaves
        this.materials.yellowLeaves.forEach(mat => {
            mat.color.setHex(colors.yellowTree);
        });
        
        // Update grass base
        if (this.materials.grassBase) {
            this.materials.grassBase.color.setHex(colors.grassBase);
        }
        
        // Update grass blades
        this.materials.grassBlades.forEach((mat, i) => {
            const colorIndex = i % colors.grass.length;
            mat.color.setHex(colors.grass[colorIndex]);
        });
        
        // Update bushes
        this.materials.bushMaterials.forEach(mat => {
            mat.color.setHex(colors.bush);
        });
        
        // Update particles
        if (this.particleMaterial) {
            this.particleMaterial.color.setHex(colors.particle);
            this.particleMaterial.size = colors.particleSize;
        }
        
        // Update background and fog
        const bgColor = new THREE.Color(colors.background);
        this.scene.background = bgColor;
        this.scene.fog.color = bgColor;
        
        // Update UI labels
        const seasonLabel = document.getElementById('current-season');
        const appTitle = document.getElementById('app-title');
        
        const displayNames = {
            spring: '🌸 Spring',
            summer: '☀️ Summer',
            autumn: '🍂 Autumn',
            winter: '❄️ Winter'
        };
        
        const seasonName = displayNames[this.currentSeason];
        
        if (seasonLabel) {
            seasonLabel.textContent = seasonName;
        }
        
        if (appTitle) {
            const brackets = {
                spring: '「春」',
                summer: '「夏」',
                autumn: '「秋」',
                winter: '「冬」'
            };
            appTitle.textContent = `Japanese Garden ${brackets[this.currentSeason]}`;
        }
    }
    
    setSeasonSpeed(value) {
        this.seasonSpeed = value;
    }
    
    updateSeasonCycle() {
        // Only cycle if speed > 0
        if (this.seasonSpeed === 0) return;
        
        // Speed: 0-100 maps to season change time
        // At max speed (100): ~3 seconds per season
        // At min speed (1): ~60 seconds per season
        const speedFactor = this.seasonSpeed / 100 * 0.006;
        this.seasonProgress += speedFactor;
        
        // Wrap around at 4 (4 seasons)
        if (this.seasonProgress >= 4) {
            this.seasonProgress = 0;
        }
        
        // Determine current season based on progress
        const seasonIndex = Math.floor(this.seasonProgress);
        const newSeason = this.seasons[seasonIndex];
        
        if (newSeason !== this.currentSeason) {
            this.currentSeason = newSeason;
            this.updateSeason();
        }
    }

    updateAudio() {
        if (this.audioGainNode) {
            this.audioGainNode.gain.value = this.isAudioEnabled ? 0.1 : 0;
        }
    }

    resetCamera() {
        // Reset camera position
        this.camera.position.set(8, 6, 8);
        
        // Reset OrbitControls target to origin
        this.controls.target.set(0, 0, 0);
        
        // Update camera to look at target
        this.camera.lookAt(0, 0, 0);
        
        // Force controls update
        this.controls.update();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        this.frameCount++;
        
        // Update controls
        this.controls.update();
        
        // Update season cycle
        this.updateSeasonCycle();
        
        // Skip animations in low performance mode for some effects
        if (!this.lowPerformanceMode) {
            // Gentle floating animation for the house
            if (this.houseGroup) {
                this.houseGroup.position.y = Math.sin(time) * 0.02;
            }
            
            // Animate particles (falling effect)
            if (this.particles) {
                const positions = this.particles.geometry.attributes.position.array;
                const velocities = this.particles.geometry.attributes.velocity.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    // Add some horizontal drift
                    positions[i] += velocities[i] + Math.sin(time + i) * 0.001;
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2] + Math.cos(time + i) * 0.001;
                    
                    // Reset particles that fall below ground or go too far
                    if (positions[i + 1] < -0.5) {
                        positions[i] = (Math.random() - 0.5) * 15;
                        positions[i + 1] = 8 + Math.random() * 2;
                        positions[i + 2] = (Math.random() - 0.5) * 15;
                    }
                    if (Math.abs(positions[i]) > 10) {
                        positions[i] = (Math.random() - 0.5) * 15;
                    }
                    if (Math.abs(positions[i + 2]) > 10) {
                        positions[i + 2] = (Math.random() - 0.5) * 15;
                    }
                }
                
                this.particles.geometry.attributes.position.needsUpdate = true;
                
                // Gentle rotation of particle system
                this.particles.rotation.y += 0.0003;
            }
            
            // Subtle tree swaying
            if (this.mapleTree) {
                this.mapleTree.rotation.z = Math.sin(time * 0.5) * 0.02;
            }
            if (this.slantingTree) {
                this.slantingTree.rotation.z = Math.sin(time * 0.6) * 0.015;
            }
            
            // Water ripple effect
            const pond = this.scene.children.find(child => 
                child.children && child.children.some(c => 
                    c.geometry instanceof THREE.CylinderGeometry && c.material.transparent
                )
            );
            if (pond) {
                const water = pond.children.find(c => 
                    c.geometry instanceof THREE.CylinderGeometry && c.material.transparent
                );
                if (water) {
                    water.material.opacity = 0.7 + Math.sin(time * 2) * 0.1;
                }
            }
        }
        
        // Always animate window light flickering (subtle)
        if (this.windowLight && this.timeOfDay > 0.5) {
            this.windowLight.intensity = 0.3 + (1 - this.timeOfDay) * 1.0 + Math.sin(time * 3) * 0.05;
        }
        
        // Update shadows only when needed (performance optimization)
        if (this.frameCount % 60 === 0) {
            this.renderer.shadowMap.needsUpdate = true;
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}
