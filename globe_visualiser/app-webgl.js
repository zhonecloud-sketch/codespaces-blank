/**
 * SDG Globe Visualizer - Pure WebGL Implementation
 * Uses a dense sphere mesh with per-vertex country coloring
 */

(function() {
  'use strict';

  // ============================================================
  // CONSTANTS & CONFIGURATION
  // ============================================================

  const DEG_TO_RAD = Math.PI / 180;
  const RAD_TO_DEG = 180 / Math.PI;

  // Metrics are now loaded dynamically from JSON files
  // See loadMetrics() function
  let METRICS = [];

  // Ocean color
  const OCEAN_COLOR = { r: 0.118, g: 0.227, b: 0.373 }; // #1e3a5f

  // ============================================================
  // STATE
  // ============================================================

  // Vertical rotation limits (degrees) - prevents viewing directly at poles
  const MAX_PHI = 60;  // Maximum tilt (looking down toward north pole)
  const MIN_PHI = -60; // Minimum tilt (looking up toward south pole)

  const state = {
    geoData: null,
    rotation: [0, 20, 0], // [lambda, phi, gamma] in degrees - lambda=horizontal, phi=vertical tilt
    rotationMatrix: null, // Computed from rotation angles
    activeMetric: METRICS[0],
    selectedCountry: null,
    isPlaying: true,
    isDragging: false,
    lastPointer: null,
    dragStartPointer: null,
    metricDataMap: new Map(),
    countryColorMap: new Map(), // Maps grid coordinates to color
    canvas: null,
    gl: null,
    width: 0,
    height: 0,
    animationId: null,
    // WebGL resources
    globeProgram: null,
    borderProgram: null,
    highlightProgram: null,
    markerProgram: null,
    sphereBuffer: null,
    borderBuffer: null,
    highlightBuffer: null,
    capitalMarkerBuffer: null,
    capitalCoords: null,
    // Sphere resolution - higher resolution for better country fill
    sphereLatSegments: 360,
    sphereLonSegments: 720,
    // Highlight state
    hoveredFeature: null,
    // Extension support
    useUint32: false,
    // Computed values
    radius: 0
  };

  // ============================================================
  // SHADER SOURCES
  // ============================================================

  const GLOBE_VERTEX_SHADER = `
    precision mediump float;
    
    attribute vec3 aPosition;
    attribute vec3 aColor;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vColor = aColor;
      vNormal = normalize(aPosition);
      vPosition = aPosition;
      
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
    }
  `;

  const GLOBE_FRAGMENT_SHADER = `
    precision mediump float;
    
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    uniform vec3 uLightDirection;
    uniform float uAmbient;
    
    void main() {
      // Simple diffuse lighting
      float diffuse = max(dot(vNormal, uLightDirection), 0.0);
      float light = uAmbient + (1.0 - uAmbient) * diffuse;
      
      vec3 finalColor = vColor * light;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Border line shaders
  const BORDER_VERTEX_SHADER = `
    precision mediump float;
    
    attribute vec3 aPosition;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    varying vec3 vPosition;
    
    void main() {
      vPosition = aPosition;
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition * 1.002, 1.0);
    }
  `;

  const BORDER_FRAGMENT_SHADER = `
    precision mediump float;
    
    varying vec3 vPosition;
    uniform mat4 uModelViewMatrix;
    
    void main() {
      // Get view-space z to fade out back-facing borders
      vec3 viewPos = (uModelViewMatrix * vec4(vPosition, 1.0)).xyz;
      float facing = step(0.0, viewPos.z);
      
      // Border color - bright white/cyan for visibility
      vec3 borderColor = vec3(0.4, 0.6, 0.8);
      float alpha = facing * 1.0;
      
      if (alpha < 0.1) discard;
      gl_FragColor = vec4(borderColor, alpha);
    }
  `;

  // Highlight shader for hovered/selected country
  const HIGHLIGHT_VERTEX_SHADER = `
    precision mediump float;
    
    attribute vec3 aPosition;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    varying vec3 vPosition;
    
    void main() {
      vPosition = aPosition;
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition * 1.003, 1.0);
    }
  `;

  const HIGHLIGHT_FRAGMENT_SHADER = `
    precision mediump float;
    
    varying vec3 vPosition;
    uniform mat4 uModelViewMatrix;
    uniform vec3 uHighlightColor;
    
    void main() {
      vec3 viewPos = (uModelViewMatrix * vec4(vPosition, 1.0)).xyz;
      float facing = step(0.0, viewPos.z);
      
      float alpha = facing * 1.0;
      if (alpha < 0.1) discard;
      
      gl_FragColor = vec4(uHighlightColor, alpha);
    }
  `;

  // Capital marker shader - renders a point at the capital location
  const MARKER_VERTEX_SHADER = `
    precision mediump float;
    
    attribute vec3 aPosition;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform float uPointSize;
    
    varying vec3 vPosition;
    
    void main() {
      vPosition = aPosition;
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition * 1.005, 1.0);
      gl_PointSize = uPointSize;
    }
  `;

  const MARKER_FRAGMENT_SHADER = `
    precision mediump float;
    
    varying vec3 vPosition;
    uniform mat4 uModelViewMatrix;
    uniform vec3 uMarkerColor;
    
    // Function to check if point is inside a 5-pointed star
    float starShape(vec2 p, float size) {
      float angle = atan(p.y, p.x);
      float radius = length(p);
      float star = cos(5.0 * angle) * 0.5 + 0.5;
      float innerR = size * 0.4;
      float outerR = size;
      float r = mix(innerR, outerR, star);
      return radius - r;
    }
    
    void main() {
      // Check if front-facing
      vec3 viewPos = (uModelViewMatrix * vec4(vPosition, 1.0)).xyz;
      float facing = step(0.0, viewPos.z);
      
      if (facing < 0.5) discard;
      
      vec2 coord = gl_PointCoord - vec2(0.5);
      float starDist = starShape(coord, 0.4);
      
      // Only show the star shape, no outer ring
      if (starDist > 0.0) discard;
      
      // Yellow star fill
      vec3 color = vec3(1.0, 0.85, 0.2);
      float alpha = 1.0;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  // ============================================================
  // MATH UTILITIES - Coordinate Conversion
  // All coordinate conversions should use these functions to ensure consistency
  // ============================================================

  /**
   * Convert grid indices to geographic coordinates
   * @param {number} latIdx - Latitude index (0 = north pole, latSegments = south pole)
   * @param {number} lonIdx - Longitude index (0 to lonSegments)
   * @param {number} latSegments - Total latitude segments
   * @param {number} lonSegments - Total longitude segments
   * @returns {[number, number]} [longitude, latitude] in degrees
   */
  function gridToGeographic(latIdx, lonIdx, latSegments, lonSegments) {
    const lat = 90 - (latIdx / latSegments) * 180;  // +90 to -90
    const lon = (lonIdx / lonSegments) * 360 - 180; // -180 to +180
    return [lon, lat];
  }

  /**
   * Convert geographic coordinates to 3D cartesian coordinates
   * This is the SINGLE SOURCE OF TRUTH for lon/lat to 3D conversion
   * @param {number} lon - Longitude in degrees (-180 to +180)
   * @param {number} lat - Latitude in degrees (-90 to +90)
   * @returns {[number, number, number]} [x, y, z] on unit sphere
   */
  function sphericalToCartesian(lon, lat) {
    // Convert to spherical angles
    // theta: 0 at north pole, PI at south pole
    // phi: angle around equator (negated to match geographic east = clockwise from above)
    const theta = (90 - lat) / 180 * Math.PI;
    const phi = -(lon + 180) / 360 * 2 * Math.PI; // Negate for correct orientation
    
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    
    // Cartesian coordinates on sphere
    // y is up (north pole at y=1), x-z is equatorial plane
    return [
      sinTheta * cosPhi,  // x
      cosTheta,           // y (up)
      sinTheta * sinPhi   // z
    ];
  }

  /**
   * Convert 3D cartesian coordinates back to geographic coordinates
   * This is the inverse of sphericalToCartesian
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @returns {[number, number]} [longitude, latitude] in degrees
   */
  function cartesianToSpherical(x, y, z) {
    // y is vertical (latitude), x-z is horizontal plane
    // From sphericalToCartesian: y = cosθ, so lat = asin(y)
    const lat = Math.asin(Math.max(-1, Math.min(1, y))) * RAD_TO_DEG;
    
    // From sphericalToCartesian: 
    //   x = sinθ * cos(phi), z = sinθ * sin(phi)
    //   where phi = -(lon + 180) / 360 * 2 * PI
    // So: atan2(z, x) = phi = -(lon + 180) * PI / 180
    // And: lon = -phi * 180 / PI - 180
    const phi = Math.atan2(z, x); // Returns -PI to +PI
    let lon = -phi * RAD_TO_DEG - 180;
    
    // Normalize to -180 to 180
    if (lon < -180) lon += 360;
    if (lon > 180) lon -= 360;
    
    return [lon, lat];
  }

  /**
   * Transpose a 4x4 matrix (for rotation matrices, transpose = inverse)
   */
  function transposeMatrix(m) {
    return new Float32Array([
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15]
    ]);
  }

  /**
   * Apply a 4x4 matrix to a 3D point (assumes w=1)
   */
  function applyMatrix(m, x, y, z) {
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12],
      m[1] * x + m[5] * y + m[9] * z + m[13],
      m[2] * x + m[6] * y + m[10] * z + m[14]
    ];
  }

  /**
   * Inverse orthographic projection
   * Convert screen coordinates to longitude/latitude
   * Uses the accumulated rotation matrix for accurate unprojection
   */
  function unproject(screenX, screenY, rotationMatrix, cx, cy, radius) {
    // Screen coordinates: origin at center, x right, y down (but we flip y)
    // Convert to normalized device coordinates on the front of the sphere
    const nx = (screenX - cx) / radius;
    const ny = -(screenY - cy) / radius;  // Flip y so up is positive
    
    // Check if point is on the sphere
    const r2 = nx * nx + ny * ny;
    if (r2 > 1) return null;
    
    // Z coordinate on unit sphere (front hemisphere, positive Z towards viewer)
    const nz = Math.sqrt(1 - r2);
    
    // The point in view space is (nx, ny, nz)
    // We need to apply the inverse of the rotation matrix
    // For rotation matrices, the inverse is the transpose
    const invMatrix = transposeMatrix(rotationMatrix);
    
    // Apply inverse rotation to get the point on the unrotated sphere
    const [x, y, z] = applyMatrix(invMatrix, nx, ny, nz);
    
    // Convert to lon/lat using cartesianToSpherical
    return cartesianToSpherical(x, y, z);
  }

  // Matrix utilities
  function createIdentityMatrix() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  function multiplyMatrices(a, b) {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = 
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    return result;
  }

  function createRotationMatrixX(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    ]);
  }

  function createRotationMatrixY(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ]);
  }

  function createOrthographicMatrix(left, right, bottom, top, near, far) {
    return new Float32Array([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (far - near), 0,
      -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
    ]);
  }

  // ============================================================
  // WEBGL UTILITIES
  // ============================================================

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }

  // ============================================================
  // COLOR UTILITIES
  // ============================================================

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.5, g: 0.5, b: 0.5 };
  }

  function interpolateColor(value, colorScale, domain) {
    const [min, max] = domain;
    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    
    const numColors = colorScale.length;
    const scaledPos = normalized * (numColors - 1);
    const index = Math.floor(scaledPos);
    const t = scaledPos - index;
    
    if (index >= numColors - 1) {
      return hexToRgb(colorScale[numColors - 1]);
    }
    
    const color1 = hexToRgb(colorScale[index]);
    const color2 = hexToRgb(colorScale[index + 1]);
    
    return {
      r: color1.r + (color2.r - color1.r) * t,
      g: color1.g + (color2.g - color1.g) * t,
      b: color1.b + (color2.b - color1.b) * t
    };
  }

  // ============================================================
  // POINT IN POLYGON TEST
  // ============================================================

  function pointInPolygon(lon, lat, ring) {
    let inside = false;
    const n = ring.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      
      if (((yi > lat) !== (yj > lat)) &&
          (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  function pointInFeature(lon, lat, feature) {
    const geometry = feature.geometry;
    if (!geometry) return false;
    
    if (geometry.type === 'Polygon') {
      const outerRing = geometry.coordinates[0];
      if (!pointInPolygon(lon, lat, outerRing)) return false;
      
      // Check holes
      for (let i = 1; i < geometry.coordinates.length; i++) {
        if (pointInPolygon(lon, lat, geometry.coordinates[i])) {
          return false;
        }
      }
      return true;
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        const outerRing = polygon[0];
        if (pointInPolygon(lon, lat, outerRing)) {
          let inHole = false;
          for (let i = 1; i < polygon.length; i++) {
            if (pointInPolygon(lon, lat, polygon[i])) {
              inHole = true;
              break;
            }
          }
          if (!inHole) return true;
        }
      }
      return false;
    }
    
    return false;
  }

  // ============================================================
  // GEOMETRY GENERATION
  // ============================================================

  /**
   * Create a dense sphere mesh where each vertex is colored based on
   * which country it falls within (or ocean if none)
   */
  function createColoredSphere(gl) {
    const { sphereLatSegments, sphereLonSegments, countryColorMap } = state;
    
    const vertices = [];
    const colors = [];
    const indices = [];
    
    // Generate vertices using common coordinate conversion functions
    for (let latIdx = 0; latIdx <= sphereLatSegments; latIdx++) {
      for (let lonIdx = 0; lonIdx <= sphereLonSegments; lonIdx++) {
        // Convert grid indices to geographic coordinates
        const [lon, lat] = gridToGeographic(latIdx, lonIdx, sphereLatSegments, sphereLonSegments);
        
        // Convert geographic to 3D cartesian
        const [x, y, z] = sphericalToCartesian(lon, lat);
        vertices.push(x, y, z);
        
        // Lookup color from pre-computed map
        const key = `${latIdx},${lonIdx}`;
        const color = countryColorMap.get(key) || OCEAN_COLOR;
        colors.push(color.r, color.g, color.b);
      }
    }
    
    // Generate indices - clockwise winding for front faces (due to negated phi)
    for (let latIdx = 0; latIdx < sphereLatSegments; latIdx++) {
      for (let lonIdx = 0; lonIdx < sphereLonSegments; lonIdx++) {
        const first = latIdx * (sphereLonSegments + 1) + lonIdx;
        const second = first + sphereLonSegments + 1;
        
        // Reversed winding order to account for flipped phi direction
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    // Use Uint16 for mobile compatibility, Uint32 if extension available
    let indexType, indexArray;
    if (state.useUint32 && indices.length > 65535) {
      indexArray = new Uint32Array(indices);
      indexType = gl.UNSIGNED_INT;
    } else {
      indexArray = new Uint16Array(indices);
      indexType = gl.UNSIGNED_SHORT;
    }
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
    
    return {
      positionBuffer,
      colorBuffer,
      indexBuffer,
      indexCount: indices.length,
      indexType
    };
  }

  /**
   * Create border lines from GeoJSON geometry
   */
  function createBorderLines(gl) {
    const { geoData } = state;
    if (!geoData) return null;
    
    const vertices = [];
    
    function addRing(ring) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [lon1, lat1] = ring[i];
        const [lon2, lat2] = ring[i + 1];
        
        // Convert to 3D
        const p1 = sphericalToCartesian(lon1, lat1);
        const p2 = sphericalToCartesian(lon2, lat2);
        
        vertices.push(p1[0], p1[1], p1[2]);
        vertices.push(p2[0], p2[1], p2[2]);
      }
    }
    
    function processGeometry(geometry) {
      if (!geometry) return;
      
      if (geometry.type === 'Polygon') {
        for (const ring of geometry.coordinates) {
          addRing(ring);
        }
      } else if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
          for (const ring of polygon) {
            addRing(ring);
          }
        }
      }
    }
    
    for (const feature of geoData) {
      processGeometry(feature.geometry);
    }
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    return {
      buffer,
      vertexCount: vertices.length / 3
    };
  }

  /**
   * Create highlight border lines for a single feature
   */
  function createHighlightBorder(gl, feature) {
    if (!feature || !feature.geometry) return null;
    
    const vertices = [];
    
    function addRing(ring) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [lon1, lat1] = ring[i];
        const [lon2, lat2] = ring[i + 1];
        
        const p1 = sphericalToCartesian(lon1, lat1);
        const p2 = sphericalToCartesian(lon2, lat2);
        
        vertices.push(p1[0], p1[1], p1[2]);
        vertices.push(p2[0], p2[1], p2[2]);
      }
    }
    
    const geometry = feature.geometry;
    if (geometry.type === 'Polygon') {
      for (const ring of geometry.coordinates) {
        addRing(ring);
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          addRing(ring);
        }
      }
    }
    
    if (vertices.length === 0) return null;
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    return {
      buffer,
      vertexCount: vertices.length / 3
    };
  }

  /**
   * Compute bounding box for a feature
   */
  function computeBoundingBox(feature) {
    let minLon = Infinity, maxLon = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    function processRing(ring) {
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
    }
    
    const geometry = feature.geometry;
    if (!geometry) return null;
    
    if (geometry.type === 'Polygon') {
      for (const ring of geometry.coordinates) {
        processRing(ring);
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          processRing(ring);
        }
      }
    }
    
    return { minLon, maxLon, minLat, maxLat };
  }

  /**
   * Build a lookup map for country colors at each grid point
   * This is done once when data is loaded or metric changes
   */
  function buildCountryColorMap() {
    const { sphereLatSegments, sphereLonSegments, geoData, activeMetric } = state;
    
    if (!geoData) return;
    
    console.log('Building country color map...');
    const startTime = performance.now();
    
    // Pre-compute bounding boxes for all features
    const featuresWithBounds = geoData.map(feature => ({
      feature,
      bounds: computeBoundingBox(feature)
    })).filter(f => f.bounds);
    
    state.countryColorMap.clear();
    
    for (let latIdx = 0; latIdx <= sphereLatSegments; latIdx++) {
      for (let lonIdx = 0; lonIdx <= sphereLonSegments; lonIdx++) {
        // Use common function for grid to geographic conversion
        const [lon, lat] = gridToGeographic(latIdx, lonIdx, sphereLatSegments, sphereLonSegments);
        
        // Find which country this point belongs to (with bounding box pre-filter)
        for (const { feature, bounds } of featuresWithBounds) {
          // Quick bounding box check
          if (lon < bounds.minLon || lon > bounds.maxLon ||
              lat < bounds.minLat || lat > bounds.maxLat) {
            continue;
          }
          
          if (pointInFeature(lon, lat, feature)) {
            const id = feature.properties?.name || feature.id || '';
            const value = state.metricDataMap.get(id);
            
            let color;
            if (value !== undefined) {
              color = interpolateColor(value, activeMetric.colorScale, activeMetric.domain);
            } else {
              color = hexToRgb('#334155');
            }
            
            const key = `${latIdx},${lonIdx}`;
            state.countryColorMap.set(key, color);
            break;
          }
        }
      }
    }
    
    console.log(`Country color map built in ${(performance.now() - startTime).toFixed(0)}ms with ${state.countryColorMap.size} land points`);
  }

  // ============================================================
  // RENDERING
  // ============================================================

  function render() {
    const { gl, width, height, globeProgram, sphereBuffer } = state;
    
    if (!gl || !globeProgram || !sphereBuffer) return;
    
    // Clear
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.06, 0.09, 0.16, 1.0); // Dark background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    // Enable backface culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    
    // Create matrices
    const aspect = width / height;
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? 2.4 : 1.2;  // Shrink globe by half on mobile
    
    // Calculate dynamic vertical offset to center globe between header and legend
    let yOffset = 0;
    if (isMobile) {
      const header = document.querySelector('.header-panel');
      const footer = document.querySelector('.footer-controls');
      const canvas = state.canvas;
      if (header && footer && canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const headerBottom = header.getBoundingClientRect().bottom - canvasRect.top;
        const footerTop = footer.getBoundingClientRect().top - canvasRect.top;
        const availableHeight = footerTop - headerBottom;
        const availableCenter = headerBottom + availableHeight / 2;
        const canvasCenter = height / 2;
        // Convert pixel offset to projection units
        const pixelOffset = canvasCenter - availableCenter;
        yOffset = (pixelOffset / height) * (2 * size);
      }
    }
    
    const projectionMatrix = createOrthographicMatrix(
      -size * aspect, size * aspect,
      -size - yOffset, size - yOffset,
      -10, 10
    );
    
    // Use accumulated rotation matrix (initialized from Euler angles, then updated by drag)
    const modelViewMatrix = state.rotationMatrix || createIdentityMatrix();
    
    // Use globe program
    gl.useProgram(globeProgram);
    
    // Set uniforms
    const uProjectionMatrix = gl.getUniformLocation(globeProgram, 'uProjectionMatrix');
    const uModelViewMatrix = gl.getUniformLocation(globeProgram, 'uModelViewMatrix');
    const uLightDirection = gl.getUniformLocation(globeProgram, 'uLightDirection');
    const uAmbient = gl.getUniformLocation(globeProgram, 'uAmbient');
    
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    gl.uniform3fv(uLightDirection, new Float32Array([0.5, 0.7, 1.0]));
    gl.uniform1f(uAmbient, 0.4);
    
    // Get attribute locations
    const aPosition = gl.getAttribLocation(globeProgram, 'aPosition');
    const aColor = gl.getAttribLocation(globeProgram, 'aColor');
    
    // Draw sphere
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer.positionBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer.colorBuffer);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereBuffer.indexBuffer);
    gl.drawElements(gl.TRIANGLES, sphereBuffer.indexCount, sphereBuffer.indexType, 0);
    
    // Draw country borders
    if (state.borderProgram && state.borderBuffer) {
      gl.useProgram(state.borderProgram);
      
      const bProjectionMatrix = gl.getUniformLocation(state.borderProgram, 'uProjectionMatrix');
      const bModelViewMatrix = gl.getUniformLocation(state.borderProgram, 'uModelViewMatrix');
      
      gl.uniformMatrix4fv(bProjectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(bModelViewMatrix, false, modelViewMatrix);
      
      const bPosition = gl.getAttribLocation(state.borderProgram, 'aPosition');
      
      gl.bindBuffer(gl.ARRAY_BUFFER, state.borderBuffer.buffer);
      gl.enableVertexAttribArray(bPosition);
      gl.vertexAttribPointer(bPosition, 3, gl.FLOAT, false, 0, 0);
      
      // Enable blending for transparent borders
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // Disable backface culling for lines
      gl.disable(gl.CULL_FACE);
      
      gl.drawArrays(gl.LINES, 0, state.borderBuffer.vertexCount);
      
      gl.disable(gl.BLEND);
    }
    
    // Draw highlight for hovered/selected country
    if (state.highlightProgram && state.highlightBuffer) {
      gl.useProgram(state.highlightProgram);
      
      const hProjectionMatrix = gl.getUniformLocation(state.highlightProgram, 'uProjectionMatrix');
      const hModelViewMatrix = gl.getUniformLocation(state.highlightProgram, 'uModelViewMatrix');
      const hHighlightColor = gl.getUniformLocation(state.highlightProgram, 'uHighlightColor');
      
      gl.uniformMatrix4fv(hProjectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(hModelViewMatrix, false, modelViewMatrix);
      
      // Use bright yellow/gold for highlight
      gl.uniform3fv(hHighlightColor, new Float32Array([1.0, 0.85, 0.2]));
      
      const hPosition = gl.getAttribLocation(state.highlightProgram, 'aPosition');
      
      gl.bindBuffer(gl.ARRAY_BUFFER, state.highlightBuffer.buffer);
      gl.enableVertexAttribArray(hPosition);
      gl.vertexAttribPointer(hPosition, 3, gl.FLOAT, false, 0, 0);
      
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.CULL_FACE);
      
      // Draw thicker lines by drawing multiple times with slight offset
      gl.lineWidth(2.0); // Note: may not work on all platforms
      gl.drawArrays(gl.LINES, 0, state.highlightBuffer.vertexCount);
      
      gl.disable(gl.BLEND);
    }
    
    // Draw capital city marker
    if (state.markerProgram && state.capitalMarkerBuffer) {
      gl.useProgram(state.markerProgram);
      
      const mProjectionMatrix = gl.getUniformLocation(state.markerProgram, 'uProjectionMatrix');
      const mModelViewMatrix = gl.getUniformLocation(state.markerProgram, 'uModelViewMatrix');
      const mMarkerColor = gl.getUniformLocation(state.markerProgram, 'uMarkerColor');
      const mPointSize = gl.getUniformLocation(state.markerProgram, 'uPointSize');
      
      gl.uniformMatrix4fv(mProjectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(mModelViewMatrix, false, modelViewMatrix);
      
      // Bright red/orange marker for capital
      gl.uniform3fv(mMarkerColor, new Float32Array([1.0, 0.3, 0.1]));
      gl.uniform1f(mPointSize, 16.0);
      
      const mPosition = gl.getAttribLocation(state.markerProgram, 'aPosition');
      
      gl.bindBuffer(gl.ARRAY_BUFFER, state.capitalMarkerBuffer.buffer);
      gl.enableVertexAttribArray(mPosition);
      gl.vertexAttribPointer(mPosition, 3, gl.FLOAT, false, 0, 0);
      
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST); // Draw on top of everything
      
      gl.drawArrays(gl.POINTS, 0, state.capitalMarkerBuffer.vertexCount);
      
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
    }
  }

  // ============================================================
  // ANIMATION
  // ============================================================

  let lastTime = 0;

  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    
    // Process any pending hover updates
    processPendingHover();
    
    // Auto-rotation (rotate around Y axis - changes lambda)
    if (state.isPlaying && !state.isDragging) {
      state.rotation[0] += 0.015 * delta;
      if (state.rotation[0] > 360) state.rotation[0] -= 360;
      updateRotationMatrix();
    }
    
    render();
    state.animationId = requestAnimationFrame(animate);
  }

  // ============================================================
  // INTERACTION HANDLERS
  // ============================================================

  function handlePointerDown(e) {
    e.preventDefault();
    state.isDragging = true;
    
    const point = getPointerPosition(e);
    state.lastPointer = point;
    state.dragStartPointer = point;
  }

  function handlePointerMove(e) {
    const point = getPointerPosition(e);
    
    if (state.isDragging && state.lastPointer) {
      const dx = point.x - state.lastPointer.x;
      const dy = point.y - state.lastPointer.y;
      
      const sensitivity = 0.3; // Degrees per pixel
      
      // Left/Right drag: rotate around Y axis (along equatorial line)
      // This changes which longitude faces the viewer
      state.rotation[0] += dx * sensitivity;
      
      // Keep lambda in 0-360 range
      if (state.rotation[0] > 360) state.rotation[0] -= 360;
      if (state.rotation[0] < 0) state.rotation[0] += 360;
      
      // Up/Down drag: tilt around X axis (along longitude line)
      // This changes the latitude view - drag up to see more of north pole
      state.rotation[1] = Math.max(MIN_PHI, Math.min(MAX_PHI, state.rotation[1] + dy * sensitivity));
      
      // Update rotation matrix from Euler angles
      updateRotationMatrix();
      
      state.lastPointer = point;
    } else {
      // Throttled hover detection (only when not dragging)
      throttledUpdateHover(point.x, point.y);
    }
  }
  
  function updateRotationMatrix() {
    const [lambda, phi, gamma] = state.rotation.map(d => d * DEG_TO_RAD);
    
    // Apply rotations in correct order for geographic intuition:
    // 1. First rotate around Y axis (longitude/equatorial rotation from left-right drag)
    // 2. Then tilt around X axis (latitude/meridian rotation from up-down drag)
    state.rotationMatrix = createIdentityMatrix();
    state.rotationMatrix = multiplyMatrices(createRotationMatrixX(phi), state.rotationMatrix);
    state.rotationMatrix = multiplyMatrices(createRotationMatrixY(lambda), state.rotationMatrix);
  }

  // Throttle hover updates to every 50ms for performance
  let lastHoverTime = 0;
  let pendingHover = null;
  
  function throttledUpdateHover(screenX, screenY) {
    const now = performance.now();
    if (now - lastHoverTime < 50) {
      // Schedule update for later
      pendingHover = { x: screenX, y: screenY };
      return;
    }
    lastHoverTime = now;
    pendingHover = null;
    updateHover(screenX, screenY);
  }
  
  // Process pending hover in animation loop
  function processPendingHover() {
    if (pendingHover && !state.isDragging) {
      const now = performance.now();
      if (now - lastHoverTime >= 50) {
        lastHoverTime = now;
        updateHover(pendingHover.x, pendingHover.y);
        pendingHover = null;
      }
    }
  }

  function updateHover(screenX, screenY) {
    const { width, height, radius, rotationMatrix, geoData, gl, visualCenterY } = state;
    const cx = width / 2;
    const cy = visualCenterY ?? height / 2;
    
    // Check if point is on globe
    const dx = screenX - cx;
    const dy = screenY - cy;
    if (dx * dx + dy * dy > radius * radius) {
      if (state.hoveredFeature) {
        state.hoveredFeature = null;
        updateHighlightBuffer(null);
        state.canvas.style.cursor = 'default';
      }
      return;
    }
    
    // Unproject to get lon/lat
    const coords = unproject(screenX, screenY, rotationMatrix, cx, cy, radius);
    if (!coords) {
      if (state.hoveredFeature) {
        state.hoveredFeature = null;
        updateHighlightBuffer(null);
        state.canvas.style.cursor = 'default';
      }
      return;
    }
    
    const [lon, lat] = coords;
    
    // Find country under cursor (use cached bounding boxes if available)
    let found = null;
    for (const feature of geoData) {
      // Quick bounding box check if available
      if (feature._bounds) {
        const b = feature._bounds;
        if (lon < b.minLon || lon > b.maxLon || lat < b.minLat || lat > b.maxLat) {
          continue;
        }
      }
      if (pointInFeature(lon, lat, feature)) {
        found = feature;
        break;
      }
    }
    
    // Only update if changed
    const currentId = state.hoveredFeature?.id || state.hoveredFeature?.properties?.name;
    const newId = found?.id || found?.properties?.name;
    
    if (currentId !== newId) {
      state.hoveredFeature = found;
      updateHighlightBuffer(found);
      state.canvas.style.cursor = found ? 'pointer' : 'default';
    }
  }

  function updateHighlightBuffer(feature) {
    const { gl } = state;
    
    // Clean up old buffer
    if (state.highlightBuffer) {
      gl.deleteBuffer(state.highlightBuffer.buffer);
      state.highlightBuffer = null;
    }
    
    // Create new buffer if feature provided
    if (feature && state.highlightProgram) {
      state.highlightBuffer = createHighlightBorder(gl, feature);
    }
  }

  function handlePointerUp(e) {
    if (state.isDragging && state.dragStartPointer) {
      const point = getPointerPosition(e);
      const dx = Math.abs(point.x - state.dragStartPointer.x);
      const dy = Math.abs(point.y - state.dragStartPointer.y);
      
      // If minimal movement, treat as click
      if (dx < 5 && dy < 5) {
        handleClick(point.x, point.y);
      }
    }
    
    state.isDragging = false;
    state.lastPointer = null;
    state.dragStartPointer = null;
  }

  function handlePointerLeave() {
    state.isDragging = false;
    state.lastPointer = null;
    state.dragStartPointer = null;
    
    // Clear hover highlight
    if (state.hoveredFeature) {
      state.hoveredFeature = null;
      updateHighlightBuffer(null);
      state.canvas.style.cursor = 'default';
    }
  }

  function handleClick(screenX, screenY) {
    const { width, height, radius, rotationMatrix, geoData, visualCenterY } = state;
    const cx = width / 2;
    const cy = visualCenterY ?? height / 2;
    
    // Check if point is on globe
    const dx = screenX - cx;
    const dy = screenY - cy;
    if (dx * dx + dy * dy > radius * radius) {
      closeCountryPanel();
      return;
    }
    
    // Unproject to get lon/lat
    const coords = unproject(screenX, screenY, rotationMatrix, cx, cy, radius);
    if (!coords) {
      closeCountryPanel();
      return;
    }
    
    const [lon, lat] = coords;
    
    // Find country under cursor
    for (const feature of geoData) {
      if (pointInFeature(lon, lat, feature)) {
        selectCountry(feature);
        return;
      }
    }
    
    closeCountryPanel();
  }

  function updateCapitalMarkerBuffer(countryName, featureId) {
    const { gl } = state;
    
    // Clean up old buffer
    if (state.capitalMarkerBuffer) {
      gl.deleteBuffer(state.capitalMarkerBuffer.buffer);
      state.capitalMarkerBuffer = null;
    }
    state.capitalCoords = null;
    
    // Get capital data
    const capitalData = capitalCitiesDataLoaded ? 
      (capitalCitiesDataLoaded[countryName] || capitalCitiesDataLoaded[featureId]) : null;
    
    if (!capitalData || !state.markerProgram) return;
    
    // Store coords for display
    state.capitalCoords = capitalData;
    
    // Convert lat/lon to 3D position on sphere
    const lat = capitalData.latitude;
    const lon = capitalData.longitude;
    const [x, y, z] = sphericalToCartesian(lon, lat);
    
    // Create buffer with single point
    const positions = new Float32Array([x, y, z]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    state.capitalMarkerBuffer = {
      buffer: buffer,
      vertexCount: 1
    };
  }

  function selectCountry(feature) {
    state.selectedCountry = feature;
    state.isPlaying = false;
    updatePlayButton();
    
    // Update capital marker
    const countryName = feature.properties?.name || 'Unknown';
    const featureId = feature.id || '';
    updateCapitalMarkerBuffer(countryName, featureId);
    
    openCountryPanel(feature);
  }

  function openCountryPanel(feature) {
    const panel = document.getElementById('country-panel');
    const nameEl = document.getElementById('country-name');
    const metricLabel = document.getElementById('panel-metric-label');
    const metricDesc = document.getElementById('panel-metric-description');
    const scoreBar = document.getElementById('score-bar');
    const population = document.getElementById('stat-population');
    const rank = document.getElementById('stat-rank');
    
    const countryName = feature.properties?.name || 'Unknown';
    nameEl.textContent = countryName;
    metricLabel.textContent = state.activeMetric.label;
    metricDesc.textContent = state.activeMetric.panelDescription || '';
    
    // Get the actual metric value for this country
    const id = feature.properties?.name || feature.id || '';
    const value = state.metricDataMap.get(id);
    const { domain, colorScale } = state.activeMetric;
    
    // Calculate percentage based on metric domain
    let scorePercent = 50;
    if (value !== undefined) {
      scorePercent = ((value - domain[0]) / (domain[1] - domain[0])) * 100;
      scorePercent = Math.max(0, Math.min(100, scorePercent));
    }
    
    // Get color that matches the country's fill color
    const colorIndex = Math.min(
      colorScale.length - 1,
      Math.floor((scorePercent / 100) * (colorScale.length - 1))
    );
    
    scoreBar.style.width = scorePercent.toFixed(0) + '%';
    scoreBar.style.backgroundColor = colorScale[colorIndex];
    
    // Format the metric value for display using valueFormat from metadata
    let valueDisplay;
    if (value !== undefined && state.activeMetric.valueFormat) {
      // Format number with commas for currency values
      const formattedValue = Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
      valueDisplay = state.activeMetric.valueFormat.replace('{value}', formattedValue);
    } else if (value !== undefined) {
      valueDisplay = value.toFixed(1);
    } else {
      valueDisplay = 'No data';
    }
    
    // Update metric label to show actual value
    metricLabel.textContent = `${state.activeMetric.label}: ${valueDisplay}`;
    
    // Calculate rank using rankOrder from metadata
    // Use original JSON data for accurate count (not metricDataMap which has duplicates from aliases)
    const metricId = state.activeMetric.id;
    const originalData = metricsData[metricId]?.originalData || [];
    const rankOrder = state.activeMetric.rankOrder || 'descending';
    const sortedCountries = [...originalData]
      .sort((a, b) => rankOrder === 'ascending' ? a.value - b.value : b.value - a.value);
    const totalCountries = sortedCountries.length;
    const rankIndex = sortedCountries.findIndex(entry => {
      // Check if this entry matches the selected country (by name or alias)
      if (entry.country === countryName || entry.country === id) return true;
      // Check aliases
      const aliases = metricsData[metricId]?.aliases?.[entry.country];
      return aliases && (aliases.includes(countryName) || aliases.includes(id));
    });
    const rankValue = rankIndex >= 0 ? rankIndex + 1 : '--';
    rank.textContent = rankIndex >= 0 ? `${rankValue}/${totalCountries}` : '--';
    
    // Get population data from capital cities data (2024, in millions)
    const capitalData = capitalCitiesDataLoaded ? 
      (capitalCitiesDataLoaded[countryName] || capitalCitiesDataLoaded[id]) : null;
    const popData = capitalData?.population;
    
    // Debug: log if population is missing
    if (!popData && popData !== 0) {
      console.log(`Population N/A for "${countryName}" (id: "${id}").`, 
        'capitalCitiesDataLoaded:', capitalCitiesDataLoaded ? 'loaded' : 'NOT LOADED',
        'Has China key:', capitalCitiesDataLoaded && 'China' in capitalCitiesDataLoaded,
        'capitalData:', capitalData);
    }
    
    if (popData !== undefined) {
      if (popData >= 1000) {
        population.textContent = (popData / 1000).toFixed(2) + 'B';
      } else if (popData >= 1) {
        population.textContent = popData.toFixed(1) + 'M';
      } else {
        population.textContent = (popData * 1000).toFixed(0) + 'K';
      }
    } else {
      population.textContent = 'N/A';
    }
    
    // Get capital city data
    const capitalEl = document.getElementById('stat-capital');
    const coordsEl = document.getElementById('stat-coordinates');
    const sourceYearEl = document.getElementById('stat-source-year');
    
    if (capitalData) {
      capitalEl.textContent = capitalData.capital;
      // Format coordinates nicely
      const latDir = capitalData.latitude >= 0 ? 'N' : 'S';
      const lonDir = capitalData.longitude >= 0 ? 'E' : 'W';
      coordsEl.textContent = `${Math.abs(capitalData.latitude).toFixed(1)}°${latDir}, ${Math.abs(capitalData.longitude).toFixed(1)}°${lonDir}`;
    } else {
      capitalEl.textContent = 'N/A';
      coordsEl.textContent = 'N/A';
    }
    
    // Get source year for this country's data
    const yearMap = metricsData[metricId]?.yearMap || {};
    const sourceYear = yearMap[countryName] || yearMap[id];
    sourceYearEl.textContent = sourceYear !== undefined ? sourceYear : 'N/A';
    
    panel.classList.add('open');
  }

  function closeCountryPanel() {
    const panel = document.getElementById('country-panel');
    panel.classList.remove('open');
    state.selectedCountry = null;
    state.isPlaying = true;
    updatePlayButton();
    
    // Clear capital marker
    if (state.capitalMarkerBuffer) {
      state.gl.deleteBuffer(state.capitalMarkerBuffer.buffer);
      state.capitalMarkerBuffer = null;
    }
    state.capitalCoords = null;
  }

  function getPointerPosition(e) {
    const rect = state.canvas.getBoundingClientRect();
    
    // For touch events
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    // For touchend, use changedTouches
    if (e.changedTouches && e.changedTouches.length > 0) {
      return {
        x: e.changedTouches[0].clientX - rect.left,
        y: e.changedTouches[0].clientY - rect.top
      };
    }
    
    // For mouse events
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // ============================================================
  // UI MANAGEMENT
  // ============================================================

  function updateMetricButtons() {
    const container = document.getElementById('metric-buttons');
    if (!container) return;
    container.innerHTML = '';
    
    for (const metric of METRICS) {
      const btn = document.createElement('button');
      btn.className = 'metric-btn' + (state.activeMetric.id === metric.id ? ' active' : '');
      btn.textContent = metric.label;
      btn.addEventListener('click', () => {
        state.activeMetric = metric;
        generateMetricData();
        rebuildSphere();
        updateMetricButtons();
        updateLegend();
        updateHeader();
        // Update country panel if one is open
        if (state.selectedCountry) {
          openCountryPanel(state.selectedCountry);
        }
      });
      container.appendChild(btn);
    }
  }

  function updateLegend() {
    const container = document.getElementById('legend-gradient');
    const lowLabel = document.getElementById('legend-low');
    const highLabel = document.getElementById('legend-high');
    
    if (!container || !state.activeMetric) return;
    container.innerHTML = '';
    
    for (const color of state.activeMetric.colorScale) {
      const div = document.createElement('div');
      div.style.backgroundColor = color;
      container.appendChild(div);
    }
    
    // Update legend labels from metadata
    if (lowLabel && highLabel) {
      lowLabel.textContent = state.activeMetric.legendLow || state.activeMetric.domain[0].toString();
      highLabel.textContent = state.activeMetric.legendHigh || state.activeMetric.domain[1].toString();
    }
  }

  function updateHeader() {
    const titleEl = document.getElementById('header-title');
    const descEl = document.getElementById('header-description');
    
    if (!titleEl || !descEl || !state.activeMetric) return;
    
    // Use title and headerDescription from metadata
    titleEl.textContent = state.activeMetric.title || state.activeMetric.label;
    descEl.textContent = state.activeMetric.headerDescription || '';
  }

  function updatePlayButton() {
    const btn = document.getElementById('play-btn');
    if (!btn) return;
    
    if (state.isPlaying) {
      btn.innerHTML = `
        <svg class="icon icon-filled" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" fill="currentColor"></rect>
          <rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>
        </svg>
      `;
    } else {
      btn.innerHTML = `
        <svg class="icon icon-filled" viewBox="0 0 24 24">
          <polygon points="5,3 19,12 5,21" fill="currentColor"></polygon>
        </svg>
      `;
    }
  }

  // ============================================================
  // COUNTRY LIST PANEL
  // ============================================================

  function openCountryList() {
    const panel = document.getElementById('country-list-panel');
    const backdrop = document.getElementById('country-list-backdrop');
    const searchInput = document.getElementById('country-search');
    
    if (panel && backdrop) {
      panel.classList.add('open');
      backdrop.classList.add('open');
      populateCountryList();
      
      // Focus search input after animation
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 300);
    }
  }

  function closeCountryList() {
    const panel = document.getElementById('country-list-panel');
    const backdrop = document.getElementById('country-list-backdrop');
    const searchInput = document.getElementById('country-search');
    
    if (panel && backdrop) {
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      if (searchInput) searchInput.value = '';
    }
  }

  function populateCountryList(filter = '') {
    const listContainer = document.getElementById('country-list');
    if (!listContainer || !state.geoData) return;
    
    // Get all countries with their values
    const countries = state.geoData
      .map(feature => {
        const name = feature.properties?.name || feature.id || '';
        const value = state.metricDataMap.get(name);
        return { name, value, feature };
      })
      .filter(c => c.name && c.name.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Filter by search term
    const filterLower = filter.toLowerCase();
    const filtered = filter 
      ? countries.filter(c => c.name.toLowerCase().includes(filterLower))
      : countries;
    
    // Build HTML
    if (filtered.length === 0) {
      listContainer.innerHTML = '<div class="country-list-empty">No countries found</div>';
      return;
    }
    
    listContainer.innerHTML = filtered.map(c => {
      let valueDisplay;
      if (c.value !== undefined && state.activeMetric.valueFormat) {
        const formattedValue = Number.isInteger(c.value) ? c.value.toLocaleString() : c.value.toFixed(1);
        const formatted = state.activeMetric.valueFormat.replace('{value}', formattedValue);
        valueDisplay = `<span class="country-list-item-value">${formatted}</span>`;
      } else if (c.value !== undefined) {
        valueDisplay = `<span class="country-list-item-value">${c.value.toFixed(1)}</span>`;
      } else {
        valueDisplay = '<span class="country-list-item-nodata">No data</span>';
      }
      
      return `
        <button class="country-list-item" data-country="${c.name}">
          <span class="country-list-item-name">${c.name}</span>
          ${valueDisplay}
        </button>
      `;
    }).join('');
    
    // Add click handlers
    listContainer.querySelectorAll('.country-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const countryName = item.dataset.country;
        selectCountryByName(countryName);
        closeCountryList();
      });
    });
  }

  function selectCountryByName(name) {
    if (!state.geoData) return;
    
    // Find the feature
    const feature = state.geoData.find(f => 
      (f.properties?.name || f.id) === name
    );
    
    if (feature) {
      selectCountry(feature);
      
      // Optionally rotate globe to center on country
      rotateToCountry(feature);
    }
  }

  function rotateToCountry(feature) {
    // Try to get capital coordinates first
    const countryName = feature.properties?.name || feature.id || '';
    const capitalData = capitalCitiesDataLoaded ? 
      (capitalCitiesDataLoaded[countryName] || capitalCitiesDataLoaded[feature.id]) : null;
    
    let centerLon, centerLat;
    
    if (capitalData) {
      // Use capital city coordinates
      centerLon = capitalData.longitude;
      centerLat = capitalData.latitude;
    } else {
      // Fall back to country centroid
      const bounds = computeBoundingBox(feature);
      if (!bounds) return;
      centerLon = (bounds.minLon + bounds.maxLon) / 2;
      centerLat = (bounds.minLat + bounds.maxLat) / 2;
    }
    
    // Set rotation to center on this location
    // Adjust offset to compensate for sphere orientation
    state.rotation[0] = -centerLon + 90;
    
    // Normalize to 0-360 range
    if (state.rotation[0] > 360) state.rotation[0] -= 360;
    if (state.rotation[0] < 0) state.rotation[0] += 360;
    
    // Phi (X rotation): positive phi tilts to show northern latitudes
    // Map latitude to phi: scale to fit within [-60, 60] limits
    // Latitude range is [-90, 90], phi range is [-60, 60], so factor is 60/90 = 0.667
    const isMobile = window.innerWidth < 768;
    
    // Base phi: map latitude to rotation angle
    let targetPhi = centerLat * 0.667;
    
    // On mobile, subtract offset to tilt globe DOWN, pushing the country UP on screen
    if (isMobile) {
      targetPhi -= 20;
    }
    
    state.rotation[1] = targetPhi;
    
    // Clamp phi to limits
    state.rotation[1] = Math.max(MIN_PHI, Math.min(MAX_PHI, state.rotation[1]));
    
    updateRotationMatrix();
  }

  function setupEventListeners() {
    const canvas = state.canvas;
    
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('mouseleave', handlePointerLeave);
    
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas.addEventListener('touchend', handlePointerUp, { passive: false });
    canvas.addEventListener('touchcancel', handlePointerLeave);
    
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        state.isPlaying = !state.isPlaying;
        updatePlayButton();
      });
    }
    
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCountryPanel);
    }
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetCamera);
    }
    
    // Country list panel
    const listBtn = document.getElementById('list-btn');
    if (listBtn) {
      listBtn.addEventListener('click', openCountryList);
    }
    
    const closeListBtn = document.getElementById('close-list-btn');
    if (closeListBtn) {
      closeListBtn.addEventListener('click', closeCountryList);
    }
    
    const listBackdrop = document.getElementById('country-list-backdrop');
    if (listBackdrop) {
      listBackdrop.addEventListener('click', closeCountryList);
    }
    
    const searchInput = document.getElementById('country-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        populateCountryList(e.target.value);
      });
    }
    
    window.addEventListener('resize', handleResize);
  }
  
  function resetCamera() {
    // Reset rotation to initial view (from above equator)
    state.rotation = [0, 20, 0]; // [lambda, phi, gamma]
    updateRotationMatrix();
  }

  function handleResize() {
    const canvas = state.canvas;
    const container = canvas.parentElement;
    
    state.width = container.clientWidth;
    state.height = container.clientHeight;
    
    canvas.width = state.width;
    canvas.height = state.height;
    
    // Calculate radius for click detection
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? 2.4 : 1.2;  // Must match render() size
    const aspect = state.width / state.height;
    // In orthographic projection, the globe fills the view based on size parameter
    state.radius = Math.min(state.width / (2 * size * aspect), state.height / (2 * size));
    
    // Calculate visual center dynamically based on header/legend positions
    if (isMobile) {
      const header = document.querySelector('.header-panel');
      const footer = document.querySelector('.footer-controls');
      const canvas = state.canvas;
      if (header && footer && canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const headerBottom = header.getBoundingClientRect().bottom - canvasRect.top;
        const footerTop = footer.getBoundingClientRect().top - canvasRect.top;
        state.visualCenterY = headerBottom + (footerTop - headerBottom) / 2;
      } else {
        state.visualCenterY = state.height / 2;
      }
    } else {
      state.visualCenterY = state.height / 2;
    }
  }

  // ============================================================
  // DATA LOADING & INITIALIZATION
  // ============================================================

  // Loaded metric data from JSON - each metric stores its data map and metadata
  let metricsData = {}; // { metricId: { dataMap: {}, metadata: {} } }
  let capitalCitiesDataLoaded = null;

  function generateMetricData() {
    state.metricDataMap.clear();
    
    if (!state.geoData || !state.activeMetric) return;
    
    const metricId = state.activeMetric.id;
    const metricData = metricsData[metricId];
    
    if (!metricData || !metricData.dataMap) return;
    
    for (const feature of state.geoData) {
      const countryName = feature.properties?.name || feature.id || '';
      const value = metricData.dataMap[countryName];
      
      if (value !== undefined) {
        state.metricDataMap.set(countryName, value);
        // Also set by feature id if different
        if (feature.id && feature.id !== countryName) {
          state.metricDataMap.set(feature.id, value);
        }
      }
    }
  }

  async function loadMetricFile(filename) {
    try {
      const response = await fetch(`resources/${filename}`);
      const json = await response.json();
      
      const metadata = json.metadata;
      const id = metadata.id;
      
      // Build data lookup maps (value and year)
      const dataMap = {};
      const yearMap = {};
      
      // Add data entries
      for (const entry of json.data) {
        dataMap[entry.country] = entry.value;
        if (entry.year !== undefined) {
          yearMap[entry.country] = entry.year;
        }
      }
      
      // Add aliases
      if (json.aliases) {
        for (const [mainName, aliasList] of Object.entries(json.aliases)) {
          const value = dataMap[mainName];
          const year = yearMap[mainName];
          if (value !== undefined) {
            for (const alias of aliasList) {
              dataMap[alias] = value;
              if (year !== undefined) {
                yearMap[alias] = year;
              }
            }
          }
        }
      }
      
      // Store in metricsData
      metricsData[id] = {
        dataMap,
        yearMap,
        metadata,
        originalData: json.data,  // Keep original data array for accurate ranking
        aliases: json.aliases || {}  // Keep aliases for country matching
      };
      
      // Build METRICS entry
      return {
        order: metadata.order || 999,
        id: metadata.id,
        label: metadata.label,
        title: metadata.title,
        headerDescription: metadata.displayHeaderText,
        panelDescription: metadata.displayPanelText,
        valueFormat: metadata.displayValueFormat,
        legendLow: metadata.displayLegendLow,
        legendHigh: metadata.displayLegendHigh,
        domain: metadata.range,
        rankOrder: metadata.rankOrder,
        colorScale: metadata.colorScale
      };
    } catch (error) {
      console.error(`Failed to load metric file ${filename}:`, error);
      return null;
    }
  }

  async function loadMetrics() {
    // Load metric files in order (metric-1.json, metric-2.json, metric-3.json)
    const metricFiles = ['metric-1.json', 'metric-2.json', 'metric-3.json'];
    
    METRICS = [];
    for (const filename of metricFiles) {
      const metric = await loadMetricFile(filename);
      if (metric) {
        METRICS.push(metric);
        console.log(`Loaded metric: ${metric.label} (${Object.keys(metricsData[metric.id].dataMap).length} countries)`);
      }
    }
    
    // Sort metrics by order field from metadata
    METRICS.sort((a, b) => (a.order || 999) - (b.order || 999));
    
    // Set first metric as active
    if (METRICS.length > 0) {
      state.activeMetric = METRICS[0];
    }
  }

  async function loadCapitalCitiesData() {
    try {
      const response = await fetch('resources/capital-cities-data.json?v=' + Date.now());
      const data = await response.json();
      
      // Build lookup map from JSON data
      capitalCitiesDataLoaded = {};
      
      for (const entry of data.capitals) {
        capitalCitiesDataLoaded[entry.country] = {
          capital: entry.capital,
          latitude: entry.latitude,
          longitude: entry.longitude,
          population: entry.population  // Population in millions
        };
      }
      
      console.log(`Loaded capital cities data for ${Object.keys(capitalCitiesDataLoaded).length} countries`);
      return true;
    } catch (error) {
      console.warn('Failed to load capital cities JSON:', error);
      return false;
    }
  }

  /**
   * Load heightmap image for terrain elevation
   * The heightmap should be an equirectangular grayscale image
   * where brightness represents elevation (white = highest, black = lowest)
   */
  function rebuildSphere() {
    const { gl } = state;
    if (!gl) return;
    
    // Clean up old buffer
    if (state.sphereBuffer) {
      gl.deleteBuffer(state.sphereBuffer.positionBuffer);
      gl.deleteBuffer(state.sphereBuffer.colorBuffer);
      gl.deleteBuffer(state.sphereBuffer.indexBuffer);
    }
    
    // Build color map and create new sphere
    buildCountryColorMap();
    state.sphereBuffer = createColoredSphere(gl);
  }

  async function loadGeoData() {
    try {
      const response = await fetch(`resources/world.geojson?v=${Date.now()}`);
      const data = await response.json();
      state.geoData = data.features;
      
      // Pre-compute and cache bounding boxes for faster hit testing
      for (const feature of state.geoData) {
        feature._bounds = computeBoundingBox(feature);
      }
      
      // Add virtual entries for small countries not in GeoJSON but in capital cities data
      // These countries are too small to render but should appear in the country list
      addVirtualCountries();
      
      generateMetricData();
    } catch (error) {
      console.error('Failed to load GeoJSON:', error);
    }
  }
  
  function addVirtualCountries() {
    // Add all small countries/territories from capital cities data that aren't in GeoJSON
    // These countries have capital coordinates but are too small to render on the globe
    
    if (!capitalCitiesDataLoaded) return;
    
    const existingNames = new Set(
      state.geoData.map(f => f.properties?.name || f.id)
    );
    
    // Get all countries from capital cities data that aren't in GeoJSON
    for (const countryName in capitalCitiesDataLoaded) {
      if (!existingNames.has(countryName)) {
        // Add a virtual feature (no geometry, just properties for the list)
        state.geoData.push({
          type: 'Feature',
          properties: { name: countryName },
          geometry: null,  // No geometry - too small to render
          _isVirtual: true  // Flag to identify virtual entries
        });
      }
    }
  }

  async function init() {
    // Get canvas and WebGL context
    state.canvas = document.getElementById('globe-canvas');
    state.gl = state.canvas.getContext('webgl', {
      antialias: true,
      depth: true,
      alpha: false
    });
    
    if (!state.gl) {
      console.error('WebGL not supported');
      return;
    }
    
    const gl = state.gl;
    
    // Enable OES_element_index_uint for large meshes (if available)
    const ext = gl.getExtension('OES_element_index_uint');
    state.useUint32 = !!ext;
    console.log('Uint32 indices supported:', state.useUint32);
    
    // Initial sizing
    handleResize();
    
    // Initialize rotation matrix from initial Euler angles
    updateRotationMatrix();
    
    // Create shaders
    state.globeProgram = createProgram(gl, GLOBE_VERTEX_SHADER, GLOBE_FRAGMENT_SHADER);
    state.borderProgram = createProgram(gl, BORDER_VERTEX_SHADER, BORDER_FRAGMENT_SHADER);
    state.highlightProgram = createProgram(gl, HIGHLIGHT_VERTEX_SHADER, HIGHLIGHT_FRAGMENT_SHADER);
    state.markerProgram = createProgram(gl, MARKER_VERTEX_SHADER, MARKER_FRAGMENT_SHADER);
    
    if (!state.globeProgram) {
      console.error('Failed to create globe shader program');
      return;
    }
    
    if (!state.borderProgram) {
      console.warn('Failed to create border shader program, borders will not be drawn');
    }
    
    if (!state.highlightProgram) {
      console.warn('Failed to create highlight shader program, hover highlight will not work');
    }
    
    if (!state.markerProgram) {
      console.warn('Failed to create marker shader program, capital markers will not be shown');
    }
    
    // Load metric data from JSON files first (sets up METRICS and activeMetric)
    await loadMetrics();
    await loadCapitalCitiesData();
    
    // Setup UI (now that METRICS is populated)
    updateMetricButtons();
    updateLegend();
    updateHeader();
    updatePlayButton();
    setupEventListeners();
    
    // Load geo data
    await loadGeoData();
    
    // Build sphere mesh with country colors
    rebuildSphere();
    
    // Build border lines
    if (state.borderProgram) {
      state.borderBuffer = createBorderLines(gl);
    }
    
    // Start animation
    requestAnimationFrame(animate);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
