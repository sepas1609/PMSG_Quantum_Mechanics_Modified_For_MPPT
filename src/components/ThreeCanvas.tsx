import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraPreset, TelemetryState } from '../types';
import { ChevronDown, ChevronUp, Minimize2, Maximize2 } from 'lucide-react';

interface ThreeCanvasProps {
  telemetry: TelemetryState;
  cameraPreset: CameraPreset;
  xrayMode: boolean;
  showLabels: boolean;
  showStreamlines: boolean;
  showMagneticLines: boolean;
  showTurbineCards?: boolean;
  onPresetChange?: (preset: CameraPreset) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  telemetry,
  cameraPreset,
  xrayMode,
  showLabels,
  showStreamlines,
  showMagneticLines,
  showTurbineCards = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isClassicalCollapsed, setIsClassicalCollapsed] = useState<boolean>(false);
  const [isQuantumCollapsed, setIsQuantumCollapsed] = useState<boolean>(false);
  const stateRef = useRef<{
    telemetry: TelemetryState;
    cameraPreset: CameraPreset;
    xrayMode: boolean;
    showLabels: boolean;
    showStreamlines: boolean;
    showMagneticLines: boolean;
  }>({
    telemetry,
    cameraPreset,
    xrayMode,
    showLabels,
    showStreamlines,
    showMagneticLines,
  });

  // Keep stateRef in sync for the animation loop
  useEffect(() => {
    stateRef.current = {
      telemetry,
      cameraPreset,
      xrayMode,
      showLabels,
      showStreamlines,
      showMagneticLines,
    };
  }, [telemetry, cameraPreset, xrayMode, showLabels, showStreamlines, showMagneticLines]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.022);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.8, 14.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x2a3854, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 12, 8);
    scene.add(dirLight);

    const classicalLight = new THREE.PointLight(0xef4444, 2.5, 8);
    classicalLight.position.set(-5.5, 3.5, 0.5);
    scene.add(classicalLight);

    const quantumLight = new THREE.PointLight(0x10b981, 2.5, 8);
    quantumLight.position.set(5.5, 3.5, 0.5);
    scene.add(quantumLight);

    // Cyan accent light
    const cyanLight = new THREE.PointLight(0x06b6d4, 1.8, 10);
    cyanLight.position.set(5.5, 4.0, -1);
    scene.add(cyanLight);

    // --- Ground Grid & Lab Pedestals ---
    const gridHelper = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -2.5;
    scene.add(gridHelper);

    // Lab circular pads
    const padGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.25, 32);
    const padMatCl = new THREE.MeshStandardMaterial({
      color: 0x181014,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.15,
    });
    const padMatQm = new THREE.MeshStandardMaterial({
      color: 0x0c1e1e,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x064e3b,
      emissiveIntensity: 0.2,
    });

    const padLeft = new THREE.Mesh(padGeo, padMatCl);
    padLeft.position.set(-5.5, -2.4, 0);
    scene.add(padLeft);

    const padRight = new THREE.Mesh(padGeo, padMatQm);
    padRight.position.set(5.5, -2.4, 0);
    scene.add(padRight);

    // --- Turbine Generators Setup ---
    const classicalGroup = new THREE.Group();
    classicalGroup.position.set(-5.5, 0, 0);
    scene.add(classicalGroup);

    const quantumGroup = new THREE.Group();
    quantumGroup.position.set(5.5, 0, 0);
    scene.add(quantumGroup);

    // Reusable geometries & materials
    const towerGeo = new THREE.CylinderGeometry(0.28, 0.45, 5.0, 32);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });

    const nacelleChassisGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.6, 32);
    nacelleChassisGeo.rotateX(Math.PI / 2);

    const classicalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b1115,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
      transmission: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const quantumGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d282e,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
      transmission: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // 1. Classical Turbine Structure
    const towerCl = new THREE.Mesh(towerGeo, towerMat);
    towerCl.position.y = 0;
    classicalGroup.add(towerCl);

    const nacelleCl = new THREE.Mesh(nacelleChassisGeo, classicalGlassMat);
    nacelleCl.position.set(0, 2.5, 0);
    classicalGroup.add(nacelleCl);

    // Classical Rotor Hub & Blades
    const hubGroupCl = new THREE.Group();
    hubGroupCl.position.set(0, 2.5, 1.35);
    classicalGroup.add(hubGroupCl);

    const noseConeGeo = new THREE.ConeGeometry(0.42, 0.8, 32);
    noseConeGeo.rotateX(Math.PI / 2);
    const noseConeMatCl = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.5,
      roughness: 0.3,
    });
    const noseConeCl = new THREE.Mesh(noseConeGeo, noseConeMatCl);
    hubGroupCl.add(noseConeCl);

    // 3 Aerodynamic blades (R = 3.0 scale)
    const bladeGeo = new THREE.BoxGeometry(0.2, 2.8, 0.05);
    bladeGeo.translate(0, 1.4, 0);
    const bladeMatCl = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.3,
      roughness: 0.2,
    });

    for (let i = 0; i < 3; i++) {
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMatCl);
      bladeMesh.rotation.z = (i * 2 * Math.PI) / 3;
      hubGroupCl.add(bladeMesh);
    }

    // Inside Generator (Stator + 6-pole PM Rotor)
    const statorGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.2, 24, 1, true);
    statorGeo.rotateX(Math.PI / 2);
    const statorMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // copper coils
      metalness: 0.8,
      roughness: 0.3,
      wireframe: false,
    });
    const statorCl = new THREE.Mesh(statorGeo, statorMat);
    statorCl.position.set(0, 2.5, 0);
    classicalGroup.add(statorCl);

    // Inner 6-pole PM Rotor
    const pmRotorGroupCl = new THREE.Group();
    pmRotorGroupCl.position.set(0, 2.5, 0);
    classicalGroup.add(pmRotorGroupCl);

    const pmCoreGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.1, 16);
    pmCoreGeo.rotateX(Math.PI / 2);
    const pmCoreMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    pmRotorGroupCl.add(new THREE.Mesh(pmCoreGeo, pmCoreMat));

    // 6 Magnet poles (alternating Red / Blue)
    for (let p = 0; p < 6; p++) {
      const angle = (p * Math.PI) / 3;
      const magGeo = new THREE.BoxGeometry(0.12, 0.16, 1.05);
      const isNorth = p % 2 === 0;
      const magMat = new THREE.MeshStandardMaterial({
        color: isNorth ? 0xdc2626 : 0x2563eb,
        metalness: 0.7,
        roughness: 0.3,
        emissive: isNorth ? 0x991b1b : 0x1d4ed8,
        emissiveIntensity: 0.4,
      });
      const magMesh = new THREE.Mesh(magGeo, magMat);
      magMesh.position.set(Math.cos(angle) * 0.48, Math.sin(angle) * 0.48, 0);
      magMesh.rotation.z = angle;
      pmRotorGroupCl.add(magMesh);
    }

    // Classical Sensor: Hall-Effect bracket on stator edge
    const hallSensorGeo = new THREE.BoxGeometry(0.16, 0.22, 0.22);
    const hallSensorMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
    });
    const hallSensor = new THREE.Mesh(hallSensorGeo, hallSensorMat);
    hallSensor.position.set(0.68, 2.5, 0.35);
    classicalGroup.add(hallSensor);

    // FIFO Delay Buffer Box on nacelle
    const bufferGeo = new THREE.BoxGeometry(0.3, 0.2, 0.35);
    const bufferMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.6,
    });
    const bufferBox = new THREE.Mesh(bufferGeo, bufferMat);
    bufferBox.position.set(-0.65, 2.5, -0.4);
    classicalGroup.add(bufferBox);

    // Classical EMI Noise Particles (±5% amplitude)
    const emiParticleCount = 85;
    const emiGeo = new THREE.BufferGeometry();
    const emiPos = new Float32Array(emiParticleCount * 3);
    for (let i = 0; i < emiParticleCount; i++) {
      emiPos[i * 3] = (Math.random() - 0.5) * 0.7 + 0.68;
      emiPos[i * 3 + 1] = (Math.random() - 0.5) * 0.7 + 2.5;
      emiPos[i * 3 + 2] = (Math.random() - 0.5) * 0.7 + 0.35;
    }
    emiGeo.setAttribute('position', new THREE.BufferAttribute(emiPos, 3));
    const emiMat = new THREE.PointsMaterial({
      color: 0xff3b30,
      size: 0.075,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const emiParticles = new THREE.Points(emiGeo, emiMat);
    classicalGroup.add(emiParticles);

    // 2. Quantum NV-Enhanced Turbine Structure
    const towerQm = new THREE.Mesh(towerGeo, towerMat);
    towerQm.position.y = 0;
    quantumGroup.add(towerQm);

    const nacelleQm = new THREE.Mesh(nacelleChassisGeo, quantumGlassMat);
    nacelleQm.position.set(0, 2.5, 0);
    quantumGroup.add(nacelleQm);

    // Quantum Rotor Hub & Blades
    const hubGroupQm = new THREE.Group();
    hubGroupQm.position.set(0, 2.5, 1.35);
    quantumGroup.add(hubGroupQm);

    const noseConeMatQm = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.5,
      roughness: 0.3,
    });
    const noseConeQm = new THREE.Mesh(noseConeGeo, noseConeMatQm);
    hubGroupQm.add(noseConeQm);

    for (let i = 0; i < 3; i++) {
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMatCl);
      bladeMesh.rotation.z = (i * 2 * Math.PI) / 3;
      hubGroupQm.add(bladeMesh);
    }

    const statorQm = new THREE.Mesh(statorGeo, statorMat);
    statorQm.position.set(0, 2.5, 0);
    quantumGroup.add(statorQm);

    const pmRotorGroupQm = new THREE.Group();
    pmRotorGroupQm.position.set(0, 2.5, 0);
    quantumGroup.add(pmRotorGroupQm);
    pmRotorGroupQm.add(new THREE.Mesh(pmCoreGeo, pmCoreMat));

    for (let p = 0; p < 6; p++) {
      const angle = (p * Math.PI) / 3;
      const magGeo = new THREE.BoxGeometry(0.12, 0.16, 1.05);
      const isNorth = p % 2 === 0;
      const magMat = new THREE.MeshStandardMaterial({
        color: isNorth ? 0x10b981 : 0x06b6d4,
        metalness: 0.7,
        roughness: 0.3,
        emissive: isNorth ? 0x059669 : 0x0891b2,
        emissiveIntensity: 0.45,
      });
      const magMesh = new THREE.Mesh(magGeo, magMat);
      magMesh.position.set(Math.cos(angle) * 0.48, Math.sin(angle) * 0.48, 0);
      magMesh.rotation.z = angle;
      pmRotorGroupQm.add(magMesh);
    }

    // Quantum NV-Center Magnetometer Unit (Diamond Crystal + Optics)
    const diamondGroup = new THREE.Group();
    diamondGroup.position.set(0.68, 2.5, 0.35);
    quantumGroup.add(diamondGroup);

    // Microscopic Diamond Crystal (Octahedral geometry)
    const diamondGeo = new THREE.OctahedronGeometry(0.09, 0);
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      metalness: 0.2,
      roughness: 0.05,
      transmission: 0.95,
      ior: 2.42, // Real diamond refractive index
      emissive: 0x06b6d4,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.95,
    });
    const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
    diamondGroup.add(diamondMesh);

    // Green Laser Beam (532 nm) excitation
    const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 12);
    laserGeo.rotateZ(Math.PI / 2);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.9,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.position.set(0.35, 0, 0);
    diamondGroup.add(laserBeam);

    // Laser diode emitter box
    const laserEmitterGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16);
    laserEmitterGeo.rotateZ(Math.PI / 2);
    const laserEmitterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const laserEmitter = new THREE.Mesh(laserEmitterGeo, laserEmitterMat);
    laserEmitter.position.set(0.7, 0, 0);
    diamondGroup.add(laserEmitter);

    // Photoluminescence Beam (637 nm Red Fluorescence emission)
    const plGeo = new THREE.ConeGeometry(0.06, 0.45, 16);
    plGeo.rotateX(-Math.PI / 2);
    const plMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.75,
    });
    const plBeam = new THREE.Mesh(plGeo, plMat);
    plBeam.position.set(0, 0, -0.25);
    diamondGroup.add(plBeam);

    // Photodetector receiver
    const photodetectorGeo = new THREE.BoxGeometry(0.12, 0.12, 0.08);
    const photodetectorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.3,
    });
    const photodetector = new THREE.Mesh(photodetectorGeo, photodetectorMat);
    photodetector.position.set(0, 0, -0.48);
    diamondGroup.add(photodetector);

    // Glowing Quantum Spin Vector (Zeeman effect) arrow
    const spinArrowGroup = new THREE.Group();
    const spinShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    const spinTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.024, 0.06, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    spinTip.position.y = 0.12;
    spinArrowGroup.add(spinShaft);
    spinArrowGroup.add(spinTip);
    diamondGroup.add(spinArrowGroup);

    // Clean magnetic flux lines for Quantum turbine
    const qFluxCurve = new THREE.EllipseCurve(0, 0, 0.72, 0.72, 0, Math.PI * 2, false, 0);
    const qFluxPoints = qFluxCurve.getPoints(48);
    const qFluxGeo = new THREE.BufferGeometry().setFromPoints(
      qFluxPoints.map((p) => new THREE.Vector3(p.x, 2.5 + p.y, 0.35))
    );
    const qFluxMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
      linewidth: 1,
    });
    const qFluxLine = new THREE.LineLoop(qFluxGeo, qFluxMat);
    quantumGroup.add(qFluxLine);

    // --- Power Flow Down Towers ---
    const powerStreamCount = 40;
    const powerGeoCl = new THREE.BufferGeometry();
    const powerGeoQm = new THREE.BufferGeometry();
    const powerPosCl = new Float32Array(powerStreamCount * 3);
    const powerPosQm = new Float32Array(powerStreamCount * 3);

    for (let i = 0; i < powerStreamCount; i++) {
      const y = 2.5 - (i / powerStreamCount) * 5.0;
      powerPosCl[i * 3] = (Math.random() - 0.5) * 0.08;
      powerPosCl[i * 3 + 1] = y;
      powerPosCl[i * 3 + 2] = 0.35 + (Math.random() - 0.5) * 0.08;

      powerPosQm[i * 3] = (Math.random() - 0.5) * 0.08;
      powerPosQm[i * 3 + 1] = y;
      powerPosQm[i * 3 + 2] = 0.35 + (Math.random() - 0.5) * 0.08;
    }
    powerGeoCl.setAttribute('position', new THREE.BufferAttribute(powerPosCl, 3));
    powerGeoQm.setAttribute('position', new THREE.BufferAttribute(powerPosQm, 3));

    const powerMatCl = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.065,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const powerMatQm = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.08,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    const powerParticlesCl = new THREE.Points(powerGeoCl, powerMatCl);
    classicalGroup.add(powerParticlesCl);

    const powerParticlesQm = new THREE.Points(powerGeoQm, powerMatQm);
    quantumGroup.add(powerParticlesQm);

    // --- Dynamic 3D Wind Tunnel Streamlines ---
    const streamlineCount = 280;
    const streamlineGeo = new THREE.BufferGeometry();
    const streamlinePos = new Float32Array(streamlineCount * 3);
    const streamlineSpeed = new Float32Array(streamlineCount);

    for (let i = 0; i < streamlineCount; i++) {
      streamlinePos[i * 3] = (Math.random() - 0.5) * 22; // X range spanning both turbines
      streamlinePos[i * 3 + 1] = Math.random() * 5.5 - 1.5; // Y range
      streamlinePos[i * 3 + 2] = Math.random() * 18 - 9; // Z flow from front to back
      streamlineSpeed[i * 3] = 0.8 + Math.random() * 0.5;
    }

    streamlineGeo.setAttribute('position', new THREE.BufferAttribute(streamlinePos, 3));
    const streamlineMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.085,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const streamlineParticles = new THREE.Points(streamlineGeo, streamlineMat);
    scene.add(streamlineParticles);

    // --- Camera Interpolation Targets ---
    const targetCameraPos = new THREE.Vector3(0, 3.8, 14.5);
    const targetLookAt = new THREE.Vector3(0, 2.0, 0);
    const currentLookAt = new THREE.Vector3(0, 2.0, 0);

    // Mouse drag interaction for subtle Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitTheta = 0;
    let orbitPhi = 0.2;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      orbitTheta -= deltaX * 0.005;
      orbitPhi = Math.max(-0.5, Math.min(1.2, orbitPhi + deltaY * 0.005));
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Main Animation Loop ---
    let animId: number;
    let clock = new THREE.Clock();
    let bladeAngleCl = 0;
    let bladeAngleQm = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const currentTelemetry = stateRef.current.telemetry;
      const currentPreset = stateRef.current.cameraPreset;
      const currentXray = stateRef.current.xrayMode;
      const currentStreamlines = stateRef.current.showStreamlines;
      const currentMagneticLines = stateRef.current.showMagneticLines;

      // 1. Blade Rotations
      const omegaCl = currentTelemetry.classical.rotorSpeedRadS;
      const omegaQm = currentTelemetry.quantum.rotorSpeedRadS;
      bladeAngleCl += omegaCl * delta;
      bladeAngleQm += omegaQm * delta;

      hubGroupCl.rotation.z = -bladeAngleCl;
      pmRotorGroupCl.rotation.z = -bladeAngleCl;

      hubGroupQm.rotation.z = -bladeAngleQm;
      pmRotorGroupQm.rotation.z = -bladeAngleQm;

      // 2. Quantum Zeeman Spin Vector Oscillation & Diamond Glow
      const bField = currentTelemetry.quantum.magneticFieldGauss;
      const spinAngle = (bField / 500) * Math.sin(bladeAngleQm * 3.0);
      spinArrowGroup.rotation.x = spinAngle * 0.5;
      spinArrowGroup.rotation.y = Math.sin(clock.elapsedTime * 8) * 0.3;
      diamondMesh.rotation.y += delta * 1.5;
      diamondMesh.rotation.x += delta * 0.8;

      // 3. Classical EMI Jitter & Delay Buffer Pulsing
      const emiPositions = emiGeo.attributes.position.array as Float32Array;
      const emiNoiseAmp = currentTelemetry.classical.emiNoiseLevel * 0.04;
      for (let i = 0; i < emiParticleCount; i++) {
        emiPositions[i * 3] = 0.68 + (Math.random() - 0.5) * emiNoiseAmp;
        emiPositions[i * 3 + 1] = 2.5 + (Math.random() - 0.5) * emiNoiseAmp;
        emiPositions[i * 3 + 2] = 0.35 + (Math.random() - 0.5) * emiNoiseAmp;
      }
      emiGeo.attributes.position.needsUpdate = true;

      // Pulse delay buffer box
      const bufferPulse = 1.0 + 0.18 * Math.sin(clock.elapsedTime * 14.0);
      bufferBox.scale.set(bufferPulse, bufferPulse, bufferPulse);

      // 4. Power Flow Particles Down the Tower
      const powerPosArrCl = powerGeoCl.attributes.position.array as Float32Array;
      const powerPosArrQm = powerGeoQm.attributes.position.array as Float32Array;
      const pFlowSpeedCl = Math.max(0.5, currentTelemetry.classical.extractedPower * 0.8);
      const pFlowSpeedQm = Math.max(0.5, currentTelemetry.quantum.extractedPower * 0.8);

      for (let i = 0; i < powerStreamCount; i++) {
        powerPosArrCl[i * 3 + 1] -= delta * pFlowSpeedCl;
        if (powerPosArrCl[i * 3 + 1] < -2.4) {
          powerPosArrCl[i * 3 + 1] = 2.5;
        }

        powerPosArrQm[i * 3 + 1] -= delta * pFlowSpeedQm;
        if (powerPosArrQm[i * 3 + 1] < -2.4) {
          powerPosArrQm[i * 3 + 1] = 2.5;
        }
      }
      powerGeoCl.attributes.position.needsUpdate = true;
      powerGeoQm.attributes.position.needsUpdate = true;

      // 5. Dynamic Wind Streamlines & Particle Flow
      streamlineParticles.visible = currentStreamlines;
      qFluxLine.visible = currentMagneticLines;

      if (currentStreamlines) {
        const streamPos = streamlineGeo.attributes.position.array as Float32Array;
        const windSpd = currentTelemetry.windSpeed;
        const speedScale = windSpd * 0.8;

        for (let i = 0; i < streamlineCount; i++) {
          streamPos[i * 3 + 2] -= delta * speedScale * streamlineSpeed[i];
          // Wrap around
          if (streamPos[i * 3 + 2] < -10) {
            streamPos[i * 3 + 2] = 10;
            streamPos[i * 3] = (Math.random() - 0.5) * 22;
            streamPos[i * 3 + 1] = Math.random() * 5.5 - 1.5;
          }
        }
        streamlineGeo.attributes.position.needsUpdate = true;

        // Dynamic Color Shift based on Wind Phase:
        // Baseline 8m/s -> Cyan, Gust 14m/s -> Fiery Red, Recovery 9m/s -> Emerald
        if (currentTelemetry.phaseNumber === 2) {
          streamlineMat.color.setHex(0xf97316); // Fiery orange/red
        } else if (currentTelemetry.phaseNumber === 3) {
          streamlineMat.color.setHex(0x10b981); // Emerald recovery
        } else {
          streamlineMat.color.setHex(0x38bdf8); // Cyan baseline
        }
      }

      // 6. X-Ray & Cutaway Mode Material Updates
      if (currentXray) {
        classicalGlassMat.opacity = 0.12;
        classicalGlassMat.wireframe = true;
        quantumGlassMat.opacity = 0.12;
        quantumGlassMat.wireframe = true;
        statorMat.wireframe = true;
      } else {
        classicalGlassMat.opacity = 0.45;
        classicalGlassMat.wireframe = false;
        quantumGlassMat.opacity = 0.45;
        quantumGlassMat.wireframe = false;
        statorMat.wireframe = false;
      }

      // 7. Camera Preset Positions & Smooth Interpolation
      switch (currentPreset) {
        case 'classical_sensor':
          targetCameraPos.set(-4.5, 2.7, 2.2);
          targetLookAt.set(-5.5, 2.5, 0.35);
          break;
        case 'quantum_sensor':
          targetCameraPos.set(6.4, 2.65, 1.85);
          targetLookAt.set(5.5, 2.5, 0.35);
          break;
        case 'top_down':
          targetCameraPos.set(0, 16.0, 0.1);
          targetLookAt.set(0, 0, 0);
          break;
        case 'xray':
          targetCameraPos.set(0, 3.2, 8.5);
          targetLookAt.set(0, 2.5, 0);
          break;
        case 'dual':
        default:
          const dist = 14.5;
          targetCameraPos.set(
            dist * Math.sin(orbitTheta) * Math.cos(orbitPhi),
            3.8 + dist * Math.sin(orbitPhi) * 0.4,
            dist * Math.cos(orbitTheta) * Math.cos(orbitPhi)
          );
          targetLookAt.set(0, 2.0, 0);
          break;
      }

      camera.position.lerp(targetCameraPos, 0.06);
      currentLookAt.lerp(targetLookAt, 0.06);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Standardized 3D Overlay Billboards when enabled */}
      {showLabels && showTurbineCards && (
        <>
          {/* Left Turbine Billboard (Classical) */}
          <div
            id="billboard-classical"
            className="absolute top-16 left-3 md:left-6 max-w-xs md:max-w-sm glass-panel-classical rounded-xl p-3 text-xs transition-all duration-300 pointer-events-auto shadow-xl"
          >
            <div className="flex items-center justify-between pb-1 border-b border-red-500/30">
              <span className="font-display font-bold text-red-400 tracking-wide text-xs">
                CLASSICAL PMSG TURBINE
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-red-950/80 border border-red-500/40 text-[9px] text-red-300 font-mono-tech">
                  RED
                </span>
                <button
                  onClick={() => setIsClassicalCollapsed((prev) => !prev)}
                  className="p-0.5 rounded hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer"
                  title={isClassicalCollapsed ? 'Expand Specs' : 'Collapse Specs'}
                >
                  {isClassicalCollapsed ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {!isClassicalCollapsed ? (
              <div className="space-y-1 text-slate-300 font-mono-tech leading-relaxed mt-2 text-[11px]">
                <p className="text-slate-200">
                  <strong className="text-slate-400">Sensor:</strong> Hall-Effect + Pulse Disc
                </p>
                <p className="text-amber-300/90">
                  ⚠️ <strong className="text-amber-400">Noise:</strong> EMI Floor (±5.0%)
                </p>
                <p className="text-red-300/90">
                  ⏱️ <strong className="text-red-400">Delay:</strong> ADC & Filter (50 ms Lag)
                </p>
                <p className="text-orange-300">
                  ⚡ <strong className="text-orange-400">MPPT:</strong> {telemetry.classical.mpptStateText}
                </p>
                <div className="mt-1.5 pt-1 border-t border-red-500/20 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Energy:</span>
                  <span className="font-bold text-red-300">{telemetry.classical.cumulativeEnergy.toFixed(3)} Wh</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] font-mono-tech text-red-300 mt-1">
                <span>Power: <strong>{telemetry.classical.extractedPower.toFixed(2)} kW</strong></span>
                <span>η: <strong>{telemetry.classical.efficiency.toFixed(1)}%</strong></span>
              </div>
            )}
          </div>

          {/* Right Turbine Billboard (Quantum NV) */}
          <div
            id="billboard-quantum"
            className="absolute top-16 right-3 md:right-6 max-w-xs md:max-w-sm glass-panel-quantum rounded-xl p-3 text-xs transition-all duration-300 pointer-events-auto shadow-xl"
          >
            <div className="flex items-center justify-between pb-1 border-b border-emerald-500/30">
              <span className="font-display font-bold text-emerald-400 tracking-wide text-xs">
                QUANTUM NV-CENTER PMSG
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-300 font-mono-tech">
                  CYAN
                </span>
                <button
                  onClick={() => setIsQuantumCollapsed((prev) => !prev)}
                  className="p-0.5 rounded hover:bg-emerald-900/60 text-emerald-300 transition-colors cursor-pointer"
                  title={isQuantumCollapsed ? 'Expand Specs' : 'Collapse Specs'}
                >
                  {isQuantumCollapsed ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {!isQuantumCollapsed ? (
              <div className="space-y-1 text-slate-300 font-mono-tech leading-relaxed mt-2 text-[11px]">
                <p className="text-slate-200">
                  <strong className="text-slate-400">Sensor:</strong> Diamond NV Magnetometer
                </p>
                <p className="text-emerald-300">
                  💎 <strong className="text-emerald-400">Noise:</strong> Shot-Noise (±0.1%)
                </p>
                <p className="text-cyan-300">
                  ⚡ <strong className="text-cyan-400">Delay:</strong> Optical ODMR (&lt;300 ns)
                </p>
                <p className="text-emerald-300">
                  🚀 <strong className="text-emerald-400">MPPT:</strong> {telemetry.quantum.mpptStateText}
                </p>
                <div className="mt-1.5 pt-1 border-t border-emerald-500/20 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Energy:</span>
                  <span className="font-bold text-emerald-300">
                    {telemetry.quantum.cumulativeEnergy.toFixed(3)} Wh{' '}
                    <span className="text-cyan-400 ml-1">(+{telemetry.quantumGainPercent.toFixed(2)}%)</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] font-mono-tech text-emerald-300 mt-1">
                <span>Power: <strong>{telemetry.quantum.extractedPower.toFixed(2)} kW</strong></span>
                <span>Gain: <strong className="text-cyan-400">+{telemetry.quantumGainPercent.toFixed(1)}%</strong></span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
