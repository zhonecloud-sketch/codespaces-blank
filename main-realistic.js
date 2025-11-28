// Realistic Solar System with Elliptical Orbits and Accurate Rotations
class RealisticSolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planets = [];
        this.sun = null;
        this.controls = {
            mouseDown: false,
            mouseX: 0,
            mouseY: 0,
            cameraDistance: 100,
            cameraAngleX: -0.125,
            cameraAngleY: 0.4,
            isAnimating: false,
            animationId: 0
        };
        this.animationSpeed = 1.0;
        this.isPaused = false;
        this.showOrbits = true;
        this.showLabels = true;
        this.educationalScale = false;
        this.autoRotate = false;
        this.selectedPlanet = null;
        this.textures = {};
        this.atmospheres = {};
        
        // Scale factor: 1 AU = 10 scene units (adjustable for visibility)
        this.AU_SCALE = 50;
        
        // Planet visual size multiplier (planets would be invisible at true scale)
        this.PLANET_SIZE_MULTIPLIER = 1.2;
        
        // Real astronomical data with accurate orbital and rotational parameters
        this.planetData = {
            mercury: {
                name: 'Mercury',
                radius: 0.38 * this.PLANET_SIZE_MULTIPLIER,
                // Orbital parameters (accurate)
                semiMajorAxis: 0.387,  // AU
                eccentricity: 0.2056,
                inclination: 7.0,      // degrees
                longitudeOfAscendingNode: 48.3, // degrees - orientation of orbital tilt
                // Rotation parameters
                axialTilt: 0.01,       // degrees - almost no tilt
                rotationDirection: 'prograde',
                // Animation speeds (relative, not to scale)
                orbitSpeed: 0.04,      // Fastest orbit
                rotationSpeed: 0.017,  // 58.6 Earth days per rotation (24/1407 hrs)
                // Visual properties
                color: 0x8c8c8c,
                hasAtmosphere: false,
                hasRings: false,
                // Info
                description: 'The smallest planet and closest to the Sun. Has almost no axial tilt (0.01°), resulting in no seasons. Its highly eccentric orbit (e=0.206) causes significant distance variation from the Sun.',
                realDistance: '57.9 million km (0.387 AU)',
                diameter: '4,879 km',
                orbitPeriod: '88 Earth days',
                rotationPeriod: '59 Earth days',
                axialTiltInfo: '0.01° - No seasons'
            },
            venus: {
                name: 'Venus',
                radius: 0.95 * this.PLANET_SIZE_MULTIPLIER,
                // Orbital parameters
                semiMajorAxis: 0.723,
                eccentricity: 0.0068,  // Nearly circular
                inclination: 3.4,
                longitudeOfAscendingNode: 76.7, // degrees
                // Rotation parameters - RETROGRADE!
                axialTilt: 177.4,      // degrees - nearly upside down!
                rotationDirection: 'retrograde', // Rotates BACKWARDS
                orbitSpeed: 0.015,
                rotationSpeed: 0.004,  // 243 Earth days per rotation (24/5832 hrs)
                // Visual properties
                color: 0xffd700,
                hasAtmosphere: true,
                hasRings: false,
                atmosphereColor: 0xffaa00,
                atmosphereOpacity: 0.4,
                // Info
                description: 'Venus rotates BACKWARDS (retrograde) and is nearly upside down with a 177.4° axial tilt. The Sun rises in the west and sets in the east. One Venus day is longer than its year!',
                realDistance: '108.2 million km (0.723 AU)',
                diameter: '12,104 km',
                orbitPeriod: '225 Earth days',
                rotationPeriod: '243 Earth days (retrograde)',
                axialTiltInfo: '177.4° - Upside down, retrograde rotation'
            },
            earth: {
                name: 'Earth',
                radius: 1.0 * this.PLANET_SIZE_MULTIPLIER,
                // Orbital parameters
                semiMajorAxis: 1.000,
                eccentricity: 0.0167,
                inclination: 0.0,      // Reference plane
                longitudeOfAscendingNode: 0.0,  // degrees (reference)
                // Rotation parameters
                axialTilt: 23.4,       // degrees - causes seasons
                rotationDirection: 'prograde',
                orbitSpeed: 0.01,
                rotationSpeed: 1.0,    // Baseline: 24 hours per rotation
                // Visual properties
                color: 0x4169e1,
                hasAtmosphere: true,
                hasRings: false,
                atmosphereColor: 0x87ceeb,
                atmosphereOpacity: 0.3,
                // Info
                description: 'Our home planet with a 23.4° axial tilt that creates our familiar four seasons. The only known planet with liquid water on its surface and life.',
                realDistance: '149.6 million km (1.0 AU)',
                diameter: '12,756 km',
                orbitPeriod: '365.25 days',
                rotationPeriod: '24 hours',
                axialTiltInfo: '23.4° - Causes our seasons'
            },
            mars: {
                name: 'Mars',
                radius: 0.53 * this.PLANET_SIZE_MULTIPLIER,
                // Orbital parameters
                semiMajorAxis: 1.524,
                eccentricity: 0.0934,  // Notable eccentricity
                inclination: 1.9,
                longitudeOfAscendingNode: 49.6, // degrees
                // Rotation parameters
                axialTilt: 25.2,       // degrees - similar to Earth
                rotationDirection: 'prograde',
                orbitSpeed: 0.008,
                rotationSpeed: 0.976,  // 24.6 hours per rotation (24/24.6)
                // Visual properties
                color: 0xcd5c5c,
                hasAtmosphere: true,
                hasRings: false,
                atmosphereColor: 0xffa07a,
                atmosphereOpacity: 0.15,
                // Info
                description: 'The Red Planet has seasons similar to Earth due to its 25.2° axial tilt, though they last nearly twice as long. Its eccentric orbit causes significant seasonal variation.',
                realDistance: '227.9 million km (1.524 AU)',
                diameter: '6,792 km',
                orbitPeriod: '687 Earth days',
                rotationPeriod: '24.6 hours',
                axialTiltInfo: '25.2° - Earth-like seasons'
            },
            jupiter: {
                name: 'Jupiter',
                // True scale: 11.2× Earth radius. Scaled to 5.0 for visibility
                radius: 5.0 * this.PLANET_SIZE_MULTIPLIER,
                // Orbital parameters
                semiMajorAxis: 5.203,
                eccentricity: 0.0489,
                inclination: 1.3,
                longitudeOfAscendingNode: 100.5, // degrees
                // Rotation parameters
                axialTilt: 3.1,        // degrees - nearly upright
                rotationDirection: 'prograde',
                orbitSpeed: 0.002,
                rotationSpeed: 2.42,   // 9.9 hours per rotation (24/9.9)
                // Visual properties
                color: 0xdaa520,
                hasAtmosphere: true,
                hasRings: true,
                atmosphereColor: 0xffd700,
                atmosphereOpacity: 0.6,
                ringInnerRadius: 5.5,
                ringOuterRadius: 9,
                ringOpacity: 0.2,
                // Info
                description: 'The largest planet with minimal axial tilt (3.1°), resulting in very mild seasons. Rotates incredibly fast - one day is only 9.9 hours despite its massive size!',
                realDistance: '778.5 million km (5.203 AU)',
                diameter: '142,984 km',
                orbitPeriod: '12 Earth years',
                rotationPeriod: '9.9 hours',
                axialTiltInfo: '3.1° - Very mild seasons'
            },
            saturn: {
                name: 'Saturn',
                // True scale: 9.45× Earth radius. Scaled to 4.5 for visibility
                radius: 4.5 * this.PLANET_SIZE_MULTIPLIER,
                // Orbital parameters
                semiMajorAxis: 9.537,
                eccentricity: 0.0565,
                inclination: 2.5,
                longitudeOfAscendingNode: 113.7, // degrees
                // Rotation parameters
                axialTilt: 26.7,       // degrees - noticeable tilt
                rotationDirection: 'prograde',
                orbitSpeed: 0.001,
                rotationSpeed: 2.24,   // 10.7 hours per rotation (24/10.7)
                // Visual properties
                color: 0xf0e68c,
                hasAtmosphere: true,
                hasRings: true,
                atmosphereColor: 0xfff8dc,
                atmosphereOpacity: 0.5,
                ringInnerRadius: 5.5,
                ringOuterRadius: 11,
                ringOpacity: 0.8,
                ringTilt: 26.7,        // Rings share axial tilt
                // Info
                description: 'Famous for its prominent rings. Its 26.7° axial tilt creates noticeable seasons, and the changing ring angle as seen from Earth varies throughout its orbit.',
                realDistance: '1.43 billion km (9.537 AU)',
                diameter: '120,536 km',
                orbitPeriod: '29 Earth years',
                rotationPeriod: '10.7 hours',
                axialTiltInfo: '26.7° - Noticeable seasons'
            },
            uranus: {
                name: 'Uranus',
                // True scale: 4.01× Earth radius. Scaled to 2.5 for visibility
                radius: 2.5 * this.PLANET_SIZE_MULTIPLIER,
                // Orbital parameters
                semiMajorAxis: 19.189,
                eccentricity: 0.0463,
                inclination: 0.8,
                longitudeOfAscendingNode: 74.0, // degrees
                // Rotation parameters - EXTREME TILT!
                axialTilt: 97.8,       // degrees - rotates on its SIDE!
                rotationDirection: 'retrograde', // Considered retrograde due to extreme tilt
                orbitSpeed: 0.0004,
                rotationSpeed: 1.40,   // 17.2 hours per rotation (24/17.2)
                // Visual properties
                color: 0x00ffff,
                hasAtmosphere: true,
                hasRings: true,
                atmosphereColor: 0xafeeee,
                atmosphereOpacity: 0.4,
                ringInnerRadius: 3,
                ringOuterRadius: 5,
                ringOpacity: 0.2,
                // Info
                description: 'Uranus rotates almost completely on its SIDE with a 97.8° axial tilt! This causes extreme seasons where each pole gets 42 years of continuous sunlight followed by 42 years of darkness.',
                realDistance: '2.87 billion km (19.189 AU)',
                diameter: '51,118 km',
                orbitPeriod: '84 Earth years',
                rotationPeriod: '17.2 hours (retrograde)',
                axialTiltInfo: '97.8° - Rotates on its side!'
            },
            neptune: {
                name: 'Neptune',
                // True scale: 3.88× Earth radius. Scaled to 2.4 for visibility
                radius: 2.4 * this.PLANET_SIZE_MULTIPLIER,
                // Orbital parameters
                semiMajorAxis: 30.0699,
                eccentricity: 0.0095,  // Nearly circular
                inclination: 1.8,
                longitudeOfAscendingNode: 131.8, // degrees
                // Rotation parameters
                axialTilt: 28.3,       // degrees - Earth-like tilt
                rotationDirection: 'prograde',
                orbitSpeed: 0.0002,
                rotationSpeed: 1.49,   // 16.1 hours per rotation (24/16.1)
                // Visual properties
                color: 0x0000cd,
                hasAtmosphere: true,
                hasRings: true,
                atmosphereColor: 0x4169e1,
                atmosphereOpacity: 0.5,
                ringInnerRadius: 3,
                ringOuterRadius: 4.5,
                ringOpacity: 0.15,
                // Info
                description: 'Neptune has an Earth-like axial tilt of 28.3°, but its seasons last over 40 Earth years each due to its 165-year orbit. Has the strongest winds in the solar system.',
                realDistance: '4.5 billion km (30.07 AU)',
                diameter: '49,528 km',
                orbitPeriod: '165 Earth years',
                rotationPeriod: '16.1 hours',
                axialTiltInfo: '28.3° - Long seasons (40+ years each)'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.loadTextures();
        this.createSun();
        this.createPlanets();
        // this.createStarfield(); // Disabled stars background
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        
        // Hide loading screen after initialization
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            setTimeout(() => {
                document.getElementById('instructions').classList.add('show');
            }, 1000);
        }, 3000);
    }
    
    createScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup - adjusted for new scale
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            5000
        );
        // Position camera at upper left corner to view all planets (Neptune at ~1500 units)
        this.camera.position.set(-800, 600, 800);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }
    
    loadTextures() {
        // Create a loading manager to track texture loading
        const loadingManager = new THREE.LoadingManager(
            () => console.log('All textures loaded successfully!'),
            (url, loaded, total) => console.log(`Loading textures: ${loaded}/${total}`),
            (url) => console.error(`Failed to load texture: ${url}`)
        );
        
        const textureLoader = new THREE.TextureLoader(loadingManager);
        
        const textureFiles = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'sun'];
        
        textureFiles.forEach(name => {
            this.textures[name] = textureLoader.load(
                `./${name}-texture.jpg`,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    // texture.minFilter = THREE.LinearFilter;
                    // texture.magFilter = THREE.LinearFilter;
                    // Add Anisotropy for sharper textures at oblique angles
                    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                },
                undefined,
                (error) => {
                    console.warn(`Could not load ${name}-texture.png, using fallback color`);
                    this.textures[name] = null;
                }
            );
        });
    }
    
    createSun() {
        // True scale: Sun radius = 109× Earth radius (~130.8 at our scale)
        // Scaled down to 12 for practical visualization
        const sunGeometry = new THREE.SphereGeometry(12, 64, 64);
        
        // Use MeshBasicMaterial (doesn't need light, always bright)
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            map: this.textures.sun,
            color: this.textures.sun ? 0xffffff : 0xffcc00
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);
        
        // Multiple layers of sun glow for better effect
        const glowLayers = [
            { radius: 12.8, opacity: 0.4, color: 0xffaa00 },
            { radius: 13.5, opacity: 0.2, color: 0xff6600 },
            { radius: 14.5, opacity: 0.1, color: 0xff4400 }
        ];
        
        glowLayers.forEach(layer => {
            const glowGeometry = new THREE.SphereGeometry(layer.radius, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: layer.color,
                transparent: true,
                opacity: layer.opacity
            });
            const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
            this.sun.add(sunGlow);
        });
    }
    
    /**
     * Calculate position in elliptical orbit using the polar equation:
     * r = a(1-e²) / (1 + e·cos(θ))
     * 
     * Where:
     * - r: distance from Sun to planet
     * - a: semi-major axis
     * - e: eccentricity
     * - θ: true anomaly (angle from perihelion)
     * 
     * The orbital plane is defined by:
     * - i: inclination (tilt from reference plane)
     * - Ω: longitude of ascending node (orientation of the tilt)
     */
    calculateEllipticalPosition(data, trueAnomaly) {
        const a = data.semiMajorAxis * this.AU_SCALE; // Convert AU to scene units
        const e = data.eccentricity;
        
        // Polar equation for ellipse with Sun at focus
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));
        
        // Position in orbital plane (before applying inclination)
        const xOrbital = r * Math.cos(trueAnomaly);
        const yOrbital = r * Math.sin(trueAnomaly);
        
        // Convert orbital elements to radians
        const i = (data.inclination || 0) * Math.PI / 180;           // Inclination
        const omega = (data.longitudeOfAscendingNode || 0) * Math.PI / 180; // Longitude of ascending node
        
        // Apply 3D rotation to transform from orbital plane to ecliptic coordinates
        // This uses the standard orbital mechanics transformation:
        // 1. Rotate by longitude of ascending node (Ω) around Z-axis
        // 2. Rotate by inclination (i) around the new X-axis
        // 
        // The transformation matrix combines these rotations:
        const cosOmega = Math.cos(omega);
        const sinOmega = Math.sin(omega);
        const cosI = Math.cos(i);
        const sinI = Math.sin(i);
        
        // Transform from orbital plane to 3D space
        // X-Z is the ecliptic plane, Y is "up" (north ecliptic pole)
        const x = (cosOmega * xOrbital - sinOmega * cosI * yOrbital);
        const z = (sinOmega * xOrbital + cosOmega * cosI * yOrbital);
        const y = (sinI * yOrbital);
        
        return new THREE.Vector3(x, y, z);
    }
    
    createPlanets() {
        Object.keys(this.planetData).forEach((key) => {
            const data = this.planetData[key];
            
            // Create a group to hold the planet and handle orbital position
            const planetGroup = new THREE.Group();
            
            // Create pivot for axial tilt (separate from orbital movement)
            const tiltPivot = new THREE.Group();
            
            // Planet geometry and material
            const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
            
            // Create material with texture or fallback color
            const material = new THREE.MeshPhongMaterial({ 
                map: this.textures[key],
                color: this.textures[key] ? 0xffffff : data.color,
                shininess: data.hasAtmosphere ? 50 : 30,
            });
            
            const planetMesh = new THREE.Mesh(geometry, material);
            planetMesh.castShadow = true;
            planetMesh.receiveShadow = false;
            
            // Add planet to tilt pivot
            tiltPivot.add(planetMesh);
            
            // Apply axial tilt properly:
            // In astronomy, axial tilt (obliquity) is measured from the perpendicular to the orbital plane.
            // The tilt is applied around the Z-axis (perpendicular to the Sun direction in the XZ orbital plane)
            // This makes the planet's north pole tilt toward/away from the Sun as expected.
            // 
            // Convention: 
            // - 0° = axis perpendicular to orbital plane (no tilt)
            // - 23.4° (Earth) = north pole tilts toward Sun at one point in orbit
            // - 90° = axis in orbital plane (rotates on its side, like Uranus)
            // - 177.4° (Venus) = nearly upside down relative to other planets
            const axialTiltRad = data.axialTilt * Math.PI / 180;
            tiltPivot.rotation.z = axialTiltRad;
            
            // Add atmosphere if planet has one
            if (data.hasAtmosphere) {
                const atmosphere = this.createAtmosphere(data);
                tiltPivot.add(atmosphere);
                this.atmospheres[key] = atmosphere;
            }
            
            // Add rings if planet has them
            if (data.hasRings) {
                const rings = this.createRings(data);
                tiltPivot.add(rings);
            }
            
            // Add tilt pivot to planet group
            planetGroup.add(tiltPivot);
            
            // Create planet label
            const label = this.createLabel(data.name);
            label.position.y = data.radius + 3;
            planetGroup.add(label);
            
            // Store references and data
            planetGroup.userData = { 
                ...data, 
                key,
                trueAnomaly: Math.random() * Math.PI * 2, // Random starting position in orbit
                originalRadius: data.radius,
                tiltPivot: tiltPivot,
                planetMesh: planetMesh
            };
            
            // Create orbital path visualization
            this.createOrbitPath(data);
            
            // Set initial position
            const initialPosition = this.calculateEllipticalPosition(data, planetGroup.userData.trueAnomaly);
            planetGroup.position.copy(initialPosition);
            
            this.planets.push(planetGroup);
            this.scene.add(planetGroup);
        });
    }
    
    createAtmosphere(data) {
        const atmosphereGeometry = new THREE.SphereGeometry(
            data.radius * 1.05, 
            32, 
            32
        );
        
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: data.atmosphereColor,
            transparent: true,
            opacity: data.atmosphereOpacity,
            side: THREE.BackSide
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        atmosphere.userData = { isAtmosphere: true };
        
        return atmosphere;
    }
    
    createRings(data) {
        const ringGeometry = new THREE.RingGeometry(
            data.ringInnerRadius,
            data.ringOuterRadius,
            128
        );
        
        // Fix ring UV mapping for proper texture display
        const pos = ringGeometry.attributes.position;
        const uv = ringGeometry.attributes.uv;
        
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const distance = Math.sqrt(x * x + y * y);
            const normalizedDistance = (distance - data.ringInnerRadius) / 
                                        (data.ringOuterRadius - data.ringInnerRadius);
            uv.setXY(i, normalizedDistance, 0.5);
        }
        
        // Create ring texture
        const ringCanvas = document.createElement('canvas');
        ringCanvas.width = 512;
        ringCanvas.height = 64;
        const ctx = ringCanvas.getContext('2d');
        
        // Create gradient for rings
        const gradient = ctx.createLinearGradient(0, 0, 512, 0);
        gradient.addColorStop(0, 'rgba(200, 200, 200, 0.1)');
        gradient.addColorStop(0.2, 'rgba(180, 160, 140, 0.9)');
        gradient.addColorStop(0.5, 'rgba(160, 140, 120, 0.7)');
        gradient.addColorStop(0.8, 'rgba(180, 160, 140, 0.9)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 64);
        
        // Add ring gaps and variations
        for (let i = 0; i < 150; i++) {
            ctx.fillStyle = `rgba(100, 80, 60, ${Math.random() * 0.3})`;
            const x = Math.random() * 512;
            ctx.fillRect(x, 0, 1, 64);
        }
        
        const ringTexture = new THREE.CanvasTexture(ringCanvas);
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: data.ringOpacity
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2; // Make rings horizontal relative to planet
        rings.userData = { isRing: true };
        
        return rings;
    }
    
    createOrbitPath(data) {
        const orbitPoints = [];
        const segments = 256;
        
        // Generate points along the elliptical orbit using the polar equation
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const position = this.calculateEllipticalPosition(data, theta);
            orbitPoints.push(position);
        }
        
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ 
            color: 0x444466,
            transparent: true,
            opacity: 0.4
        });
        
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        orbit.userData = { isOrbit: true };
        this.scene.add(orbit);
    }
    
    createLabel(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#ffd700';
        context.font = 'bold 24px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(5, 1.25, 1);
        sprite.userData = { isLabel: true };
        
        return sprite;
    }
    
    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 20000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Distribute stars randomly in a large cube (no spherical shell effect)
            const range = 2000;
            positions[i3] = (Math.random() - 0.5) * range * 2;
            positions[i3 + 1] = (Math.random() - 0.5) * range * 2;
            positions[i3 + 2] = (Math.random() - 0.5) * range * 2;
            
            // Vary star colors slightly
            const colorVariation = 0.8 + Math.random() * 0.2;
            colors[i3] = colorVariation;
            colors[i3 + 1] = colorVariation;
            colors[i3 + 2] = colorVariation;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }
    
    setupLighting() {
        // Ambient light - very dim
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // Sun light (point light at origin)
        const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // Subtle rim lighting for visibility
        const rimLight = new THREE.DirectionalLight(0x4488ff, 0.1);
        rimLight.position.set(-100, 50, 50);
        this.scene.add(rimLight);
    }
    
    setupControls() {
        const canvas = this.renderer.domElement;
        
        // Mouse controls
        canvas.addEventListener('mousedown', (e) => {
            this.controls.mouseDown = true;
            this.controls.isAnimating = false; // Stop any running animation
            this.controls.mouseX = e.clientX;
            this.controls.mouseY = e.clientY;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.controls.mouseDown) {
                const deltaX = e.clientX - this.controls.mouseX;
                const deltaY = e.clientY - this.controls.mouseY;
                
                this.controls.cameraAngleX += deltaX * 0.01;
                this.controls.cameraAngleY += deltaY * 0.01;
                this.controls.cameraAngleY = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.controls.cameraAngleY));
                
                this.controls.mouseX = e.clientX;
                this.controls.mouseY = e.clientY;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            this.controls.mouseDown = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.controls.mouseDown = false;
        });
        
        // Zoom controls
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.controls.isAnimating = false; // Stop any running animation
            this.controls.cameraDistance += e.deltaY * 0.5;
            this.controls.cameraDistance = Math.max(30, Math.min(2500, this.controls.cameraDistance));
        });
        
        // Touch controls
        this.setupTouchControls();
        
        // Planet click detection
        canvas.addEventListener('click', (e) => {
            const mouse = new THREE.Vector2();
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            // Check intersection with planet meshes
            const planetMeshes = this.planets.map(p => p.userData.planetMesh);
            const intersects = raycaster.intersectObjects(planetMeshes);
            
            if (intersects.length > 0) {
                // Find the parent planet group
                const clickedMesh = intersects[0].object;
                const planetGroup = this.planets.find(p => p.userData.planetMesh === clickedMesh);
                if (planetGroup) {
                    this.showPlanetInfo(planetGroup);
                }
            }
        });
    }
    
    setupTouchControls() {
        const canvas = this.renderer.domElement;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartDistance = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                this.controls.mouseDown = true;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                touchStartDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && this.controls.mouseDown) {
                const deltaX = e.touches[0].clientX - touchStartX;
                const deltaY = e.touches[0].clientY - touchStartY;
                
                this.controls.cameraAngleX += deltaX * 0.01;
                this.controls.cameraAngleY += deltaY * 0.01;
                this.controls.cameraAngleY = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.controls.cameraAngleY));
                
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (touchStartDistance > 0) {
                    const scale = touchStartDistance / distance;
                    this.controls.isAnimating = false; // Stop any running animation
                    this.controls.cameraDistance *= scale;
                    this.controls.cameraDistance = Math.max(30, Math.min(2500, this.controls.cameraDistance));
                }
                touchStartDistance = distance;
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.controls.mouseDown = false;
            touchStartDistance = 0;
        }, { passive: false });
    }
    
    setupEventListeners() {
        // Speed control
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.animationSpeed = parseFloat(e.target.value);
                if (speedValue) speedValue.textContent = this.animationSpeed.toFixed(1);
            });
        }
        
        // Pause button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', (e) => {
                this.isPaused = !this.isPaused;
                e.target.textContent = this.isPaused ? 'Play' : 'Pause';
                e.target.classList.toggle('active');
            });
        }
        
        // Reset view button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetView());
        }
        
        // Toggle buttons
        const orbitToggle = document.getElementById('orbitToggle');
        if (orbitToggle) {
            orbitToggle.addEventListener('click', (e) => {
                this.showOrbits = !this.showOrbits;
                e.target.classList.toggle('active');
                this.toggleOrbits();
            });
        }
        
        const labelsToggle = document.getElementById('labelsToggle');
        if (labelsToggle) {
            labelsToggle.addEventListener('click', (e) => {
                this.showLabels = !this.showLabels;
                e.target.classList.toggle('active');
                this.toggleLabels();
            });
        }
        
        const scaleToggle = document.getElementById('scaleToggle');
        if (scaleToggle) {
            scaleToggle.addEventListener('click', (e) => {
                this.educationalScale = !this.educationalScale;
                e.target.classList.toggle('active');
                this.updatePlanetScales();
            });
        }
        
        const autoRotateBtn = document.getElementById('autoRotateBtn');
        if (autoRotateBtn) {
            autoRotateBtn.addEventListener('click', (e) => {
                this.autoRotate = !this.autoRotate;
                e.target.classList.toggle('active');
            });
        }
        
        const topViewBtn = document.getElementById('topViewBtn');
        if (topViewBtn) {
            topViewBtn.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                if (e.target.classList.contains('active')) {
                    this.setTopView();
                } else {
                    this.resetView(); // Return to default view when toggled off
                }
            });
        }
        
        // Mobile controls
        const zoomInBtn = document.getElementById('zoomInBtn');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.controls.cameraDistance *= 0.8;
                this.controls.cameraDistance = Math.max(30, this.controls.cameraDistance);
            });
        }
        
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.controls.cameraDistance *= 1.2;
                this.controls.cameraDistance = Math.min(2500, this.controls.cameraDistance);
            });
        }
        
        const resetViewBtn = document.getElementById('resetViewBtn');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.resetView());
        }
        
        // Info panel close
        const closeInfoBtn = document.getElementById('closeInfoBtn');
        if (closeInfoBtn) {
            closeInfoBtn.addEventListener('click', () => {
                document.getElementById('infoPanel').classList.remove('active');
                this.resetView(); // Return to default view
            });
        }
        
        // Instructions
        const startExploring = document.getElementById('startExploring');
        if (startExploring) {
            startExploring.addEventListener('click', () => {
                document.getElementById('instructions').classList.remove('show');
            });
        }
        
        // Planet list panel click handlers
        const planetListItems = document.querySelectorAll('.planet-list-item');
        planetListItems.forEach(item => {
            item.addEventListener('click', () => {
                const planetName = item.dataset.planet;
                // Find the planet by name
                const planet = this.planets.find(p => p.userData.key === planetName.toLowerCase());
                if (planet) {
                    // Show planet info (this also updates the list selection and focuses on planet)
                    this.showPlanetInfo(planet);
                }
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    updatePlanetScales() {
        const scaleFactor = this.educationalScale ? 2 : 1;
        
        this.planets.forEach(planetGroup => {
            const data = planetGroup.userData;
            const newRadius = data.originalRadius * scaleFactor;
            
            // Update planet geometry
            const planetMesh = data.planetMesh;
            planetMesh.geometry.dispose();
            planetMesh.geometry = new THREE.SphereGeometry(newRadius, 64, 64);
            
            // Update atmosphere if present
            if (this.atmospheres[data.key]) {
                const atmosphere = this.atmospheres[data.key];
                atmosphere.geometry.dispose();
                atmosphere.geometry = new THREE.SphereGeometry(newRadius * 1.05, 32, 32);
            }
            
            // Update rings if present
            data.tiltPivot.children.forEach(child => {
                if (child.userData.isRing) {
                    child.geometry.dispose();
                    child.geometry = new THREE.RingGeometry(
                        data.ringInnerRadius * scaleFactor,
                        data.ringOuterRadius * scaleFactor,
                        128
                    );
                    child.rotation.x = Math.PI / 2;
                }
            });
        });
    }
    
    toggleOrbits() {
        this.scene.children.forEach(child => {
            if (child.userData.isOrbit) {
                child.visible = this.showOrbits;
            }
        });
    }
    
    toggleLabels() {
        this.planets.forEach(planetGroup => {
            planetGroup.children.forEach(child => {
                if (child.userData.isLabel) {
                    child.visible = this.showLabels;
                }
            });
        });
    }
    
    resetView() {
        // Get actual camera world position from Three.js
        const camPos = this.camera.position.clone();
        
        // Calculate Sun-relative spherical coordinates from actual camera position
        const distanceFromSun = camPos.length();
        const xzDist = Math.sqrt(camPos.x * camPos.x + camPos.z * camPos.z);
        
        // Clear selected planet - we're switching to Sun-centered view
        this.selectedPlanet = null;
        
        // Set starting spherical coordinates based on actual camera position
        this.controls.cameraDistance = Math.max(distanceFromSun, 50);
        if (xzDist > 0.001) {
            this.controls.cameraAngleX = Math.atan2(camPos.z, camPos.x);
        }
        this.controls.cameraAngleY = Math.atan2(camPos.y, xzDist);
        
        // Clear planet list selection
        document.querySelectorAll('.planet-list-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Simple animation without anime.js dependency
        // Default view: zoomed in to see inner planets including Mercury
        const targetDistance = 100;
        const targetAngleX = -0.05;
        const targetAngleY = 0.4;
        
        this.controls.isAnimating = true;
        this.controls.animationId++;
        const currentAnimationId = this.controls.animationId;
        
        const animate = () => {
            // Stop if a new animation started
            if (this.controls.animationId !== currentAnimationId) return;
            
            this.controls.cameraDistance += (targetDistance - this.controls.cameraDistance) * 0.1;
            this.controls.cameraAngleX += (targetAngleX - this.controls.cameraAngleX) * 0.1;
            this.controls.cameraAngleY += (targetAngleY - this.controls.cameraAngleY) * 0.1;
            
            if (Math.abs(this.controls.cameraDistance - targetDistance) > 0.1) {
                requestAnimationFrame(animate);
            } else {
                this.controls.isAnimating = false;
            }
        };
        animate();
    }
    
    setTopView() {
        // Get actual camera world position from Three.js
        const camPos = this.camera.position.clone();
        
        // Calculate Sun-relative spherical coordinates from actual camera position
        const distanceFromSun = camPos.length();
        const xzDist = Math.sqrt(camPos.x * camPos.x + camPos.z * camPos.z);
        
        // Clear selected planet - we're switching to Sun-centered view
        this.selectedPlanet = null;
        
        // Set starting spherical coordinates based on actual camera position
        this.controls.cameraDistance = Math.max(distanceFromSun, 100);
        if (xzDist > 0.001) {
            this.controls.cameraAngleX = Math.atan2(camPos.z, camPos.x);
        }
        this.controls.cameraAngleY = Math.atan2(camPos.y, xzDist);
        
        // Clear planet list selection
        document.querySelectorAll('.planet-list-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Hide info panel
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) infoPanel.classList.remove('active');
        
        // Top view: looking straight down at the solar system
        const targetDistance = 1800;
        const targetAngleX = this.controls.cameraAngleX; // Keep current horizontal angle
        const targetAngleY = Math.PI / 2 - 0.1;
        
        this.controls.isAnimating = true;
        this.controls.animationId++;
        const currentAnimationId = this.controls.animationId;
        
        const animate = () => {
            // Stop if a new animation started or user interrupted
            if (this.controls.animationId !== currentAnimationId) return;
            
            this.controls.cameraDistance += (targetDistance - this.controls.cameraDistance) * 0.1;
            this.controls.cameraAngleY += (targetAngleY - this.controls.cameraAngleY) * 0.1;
            
            const distanceDiff = Math.abs(this.controls.cameraDistance - targetDistance);
            const angleYDiff = Math.abs(this.controls.cameraAngleY - targetAngleY);
            
            if (distanceDiff > 1 || angleYDiff > 0.01) {
                requestAnimationFrame(animate);
            } else {
                this.controls.cameraDistance = targetDistance;
                this.controls.cameraAngleY = targetAngleY;
                this.controls.isAnimating = false;
            }
        };
        animate();
    }
    
    showPlanetInfo(planetGroup) {
        const data = planetGroup.userData;
        const infoPanel = document.getElementById('infoPanel');
        
        if (!infoPanel) return;
        
        const setTextContent = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        
        setTextContent('planetName', data.name);
        setTextContent('planetDistance', data.realDistance);
        setTextContent('planetDiameter', data.diameter);
        setTextContent('planetPeriod', data.orbitPeriod);
        setTextContent('planetRotation', data.rotationPeriod);
        setTextContent('planetDescription', data.description);
        
        // Add axial tilt info if element exists
        setTextContent('planetAxialTilt', data.axialTiltInfo);
        
        infoPanel.classList.add('active');
        
        // Update planet list selection
        const planetListItems = document.querySelectorAll('.planet-list-item');
        planetListItems.forEach(item => {
            if (item.dataset.planet && item.dataset.planet.toLowerCase() === data.key) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Focus camera on planet
        this.focusOnPlanet(planetGroup);
    }
    
    focusOnPlanet(planetGroup) {
        const data = planetGroup.userData;
        
        // Get the planet's current position
        const planetPosition = planetGroup.position.clone();
        const planetDistance = planetPosition.length(); // Distance from Sun to planet
        
        // Calculate the direction from Sun (origin) to the planet
        const directionFromSun = planetPosition.clone().normalize();
        
        // Target camera angles: align along the Sun-planet axis
        const targetAngleX = Math.atan2(directionFromSun.z, directionFromSun.x);
        
        // Target elevation: align with the planet's orbital plane
        const xzDistance = Math.sqrt(planetPosition.x * planetPosition.x + planetPosition.z * planetPosition.z);
        const targetAngleY = Math.atan2(planetPosition.y, xzDistance);
        
        // Calculate viewing distance to capture full globe and label
        const fov = 75 * Math.PI / 180; // Camera FOV in radians
        
        // Use ring outer radius only for Saturn (prominent rings with opacity >= 0.5)
        const hasProminentRings = data.hasRings && data.ringOpacity >= 0.5;
        const effectiveRadius = hasProminentRings 
            ? Math.max(data.ringOuterRadius, data.radius) 
            : data.radius;
        
        // Label is positioned at radius + 3, so total height to capture is radius + label
        const labelHeight = data.radius + 3 + 1.25;
        const totalHeight = Math.max(effectiveRadius, labelHeight);
        
        // Calculate distance needed to fit the planet and label in view
        // This is the distance FROM the planet (since camera will orbit around selected planet)
        const viewingDistance = totalHeight / Math.tan(fov / 2) * 1.5;
        const minViewingDistance = 15;
        const planetViewDistance = Math.max(viewingDistance, minViewingDistance);
        
        // Target distance from Sun (for the animation phase)
        const targetDistance = planetDistance + planetViewDistance;
        
        // Clear selected planet during animation - camera orbits Sun during transition
        this.selectedPlanet = null;
        
        // Animate the camera smoothly to the target position
        this.controls.isAnimating = true;
        this.controls.animationId++;
        const currentAnimationId = this.controls.animationId;
        
        const animate = () => {
            // Stop if a new animation started
            if (this.controls.animationId !== currentAnimationId) return;
            
            // Smooth interpolation with easing factor (lower = slower)
            const easing = 0.4;
            
            this.controls.cameraDistance += (targetDistance - this.controls.cameraDistance) * easing;
            this.controls.cameraAngleX += (targetAngleX - this.controls.cameraAngleX) * easing;
            this.controls.cameraAngleY += (targetAngleY - this.controls.cameraAngleY) * easing;
            
            // Check if we're close enough to target
            const distanceDiff = Math.abs(this.controls.cameraDistance - targetDistance);
            const angleXDiff = Math.abs(this.controls.cameraAngleX - targetAngleX);
            const angleYDiff = Math.abs(this.controls.cameraAngleY - targetAngleY);
            
            if (distanceDiff > 0.5 || angleXDiff > 0.001 || angleYDiff > 0.001) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete - now set selectedPlanet and adjust distance
                this.controls.cameraDistance = planetViewDistance; // Distance from planet, not Sun
                this.controls.cameraAngleX = targetAngleX;
                this.controls.cameraAngleY = targetAngleY;
                this.selectedPlanet = planetGroup; // Now camera orbits around planet
                this.controls.isAnimating = false;
            }
        };
        
        animate();
    }
    
    updateCamera() {
        if (this.autoRotate && !this.controls.mouseDown) {
            this.controls.cameraAngleX += 0.01; // Rotate ~34°/sec at 60fps
        }
        
        // Determine the look-at target (selected planet or Sun)
        let lookAtTarget = new THREE.Vector3(0, 0, 0); // Default: Sun
        
        if (this.selectedPlanet) {
            lookAtTarget = this.selectedPlanet.position.clone();
        }
        
        // Calculate camera position relative to the target
        const x = lookAtTarget.x + Math.cos(this.controls.cameraAngleX) * Math.cos(this.controls.cameraAngleY) * this.controls.cameraDistance;
        const y = lookAtTarget.y + Math.sin(this.controls.cameraAngleY) * this.controls.cameraDistance;
        const z = lookAtTarget.z + Math.sin(this.controls.cameraAngleX) * Math.cos(this.controls.cameraAngleY) * this.controls.cameraDistance;
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(lookAtTarget);
    }
    
    updatePlanets() {
        if (this.isPaused) return;
        
        this.planets.forEach(planetGroup => {
            const data = planetGroup.userData;
            
            // Update true anomaly (position in orbit)
            data.trueAnomaly -= data.orbitSpeed * this.animationSpeed;
            
            // Calculate new position using elliptical orbit equation
            const position = this.calculateEllipticalPosition(data, data.trueAnomaly);
            planetGroup.position.copy(position);
            
            // Update planet rotation on its axis
            // Venus and Uranus rotate retrograde (opposite direction)
            const rotationMultiplier = data.rotationDirection === 'retrograde' ? -1 : 1;
            data.planetMesh.rotation.y += data.rotationSpeed * rotationMultiplier * this.animationSpeed;
            
            // Update label to always face camera
            planetGroup.children.forEach(child => {
                if (child.userData.isLabel) {
                    child.position.y = data.radius + 3;
                }
            });
        });
        
        // Rotate sun slowly
        if (this.sun) {
            this.sun.rotation.y += 0.002 * this.animationSpeed;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateCamera();
        this.updatePlanets();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RealisticSolarSystem();
});