import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface HeroModelViewerProps {
  heroId: 'warrior' | 'mage' | string;
}

// ─── Helpers: Heater Shield ─────────────────────────────────────────
function createHeaterShield(
  ironMat: THREE.Material,
  goldMat: THREE.Material,
  crimsonMat: THREE.Material,
  steelMat: THREE.Material
): THREE.Group {
  const shieldGroup = new THREE.Group();

  // Classic heater shield 2D outline (flat top, curved sides converging to a point)
  const shape = new THREE.Shape();
  shape.moveTo(-0.24, 0.30);
  shape.lineTo(0.24, 0.30);
  shape.lineTo(0.24, 0.06);
  shape.quadraticCurveTo(0.21, -0.24, 0, -0.38);
  shape.quadraticCurveTo(-0.21, -0.24, -0.24, 0.06);
  shape.closePath();

  // Gold raised rim / outer border plate
  const rimGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.016,
    bevelThickness: 0.012,
  });
  const rimMesh = new THREE.Mesh(rimGeo, goldMat);
  rimMesh.position.set(0, 0, -0.015);
  shieldGroup.add(rimMesh);

  // Front iron shield face plate
  const faceGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.005,
    bevelThickness: 0.008,
  });
  const faceMesh = new THREE.Mesh(faceGeo, ironMat);
  faceMesh.position.set(0, 0, 0.008);
  shieldGroup.add(faceMesh);

  // Crimson heraldic chevron / horizontal cross band across center
  const bandGeo = new THREE.BoxGeometry(0.40, 0.075, 0.015);
  const band = new THREE.Mesh(bandGeo, crimsonMat);
  band.position.set(0, 0.05, 0.036);
  shieldGroup.add(band);

  // Central metal boss / stud (prominent convex boss with central peak)
  const bossGeo = new THREE.SphereGeometry(0.068, 8, 6);
  const boss = new THREE.Mesh(bossGeo, steelMat);
  boss.position.set(0, 0.05, 0.042);
  boss.scale.set(1, 1, 0.45);
  shieldGroup.add(boss);

  const spikeGeo = new THREE.ConeGeometry(0.032, 0.05, 6);
  const spike = new THREE.Mesh(spikeGeo, goldMat);
  spike.position.set(0, 0.05, 0.076);
  spike.rotation.x = Math.PI / 2;
  shieldGroup.add(spike);

  // Rim golden studs / rivets around the border
  const rivetGeo = new THREE.SphereGeometry(0.014, 5, 4);
  const rivetPositions: [number, number][] = [
    [-0.19, 0.24],
    [0.19, 0.24],
    [-0.20, 0.08],
    [0.20, 0.08],
    [-0.13, -0.15],
    [0.13, -0.15],
    [0, -0.32],
  ];
  rivetPositions.forEach(([rx, ry]) => {
    const rivet = new THREE.Mesh(rivetGeo, goldMat);
    rivet.position.set(rx, ry, 0.036);
    shieldGroup.add(rivet);
  });

  // Arm leather straps on the back of the shield
  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x24170e,
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
  });
  const strapGeo = new THREE.BoxGeometry(0.22, 0.04, 0.018);
  const strapUpper = new THREE.Mesh(strapGeo, strapMat);
  strapUpper.position.set(0, 0.12, -0.026);
  shieldGroup.add(strapUpper);

  const strapLower = new THREE.Mesh(strapGeo, strapMat);
  strapLower.position.set(0, -0.06, -0.026);
  shieldGroup.add(strapLower);

  return shieldGroup;
}

// ─── Helpers: Broadsword ────────────────────────────────────────────
function createBroadsword(
  steelMat: THREE.Material,
  goldMat: THREE.Material,
  leatherMat: THREE.Material,
  darkMat: THREE.Material
): THREE.Group {
  const swordGroup = new THREE.Group();

  // Blade: Main double-edged steel blade
  const bladeGeo = new THREE.BoxGeometry(0.082, 0.74, 0.022);
  const blade = new THREE.Mesh(bladeGeo, steelMat);
  blade.position.set(0, 0.41, 0);
  swordGroup.add(blade);

  // Fuller: Central dark blood groove running down the blade
  const fullerGeo = new THREE.BoxGeometry(0.022, 0.56, 0.024);
  const fuller = new THREE.Mesh(fullerGeo, darkMat);
  fuller.position.set(0, 0.38, 0);
  swordGroup.add(fuller);

  // Blade tip: Gothic diamond apex
  const tipGeo = new THREE.ConeGeometry(0.058, 0.16, 4);
  const tip = new THREE.Mesh(tipGeo, steelMat);
  tip.position.set(0, 0.86, 0);
  tip.rotation.y = Math.PI / 4;
  swordGroup.add(tip);

  // Crossguard: Sturdy medieval crossguard with curved quillons
  const guardCenterGeo = new THREE.BoxGeometry(0.12, 0.045, 0.062);
  const guardCenter = new THREE.Mesh(guardCenterGeo, goldMat);
  guardCenter.position.set(0, 0.025, 0);
  swordGroup.add(guardCenter);

  // Quillons extending left & right with slight forward flare
  const quillonLeftGeo = new THREE.BoxGeometry(0.09, 0.035, 0.05);
  const quillonLeft = new THREE.Mesh(quillonLeftGeo, goldMat);
  quillonLeft.position.set(-0.095, 0.035, 0);
  quillonLeft.rotation.z = -0.16;
  swordGroup.add(quillonLeft);

  const quillonRightGeo = new THREE.BoxGeometry(0.09, 0.035, 0.05);
  const quillonRight = new THREE.Mesh(quillonRightGeo, goldMat);
  quillonRight.position.set(0.095, 0.035, 0);
  quillonRight.rotation.z = 0.16;
  swordGroup.add(quillonRight);

  // Quillon end finials / caps
  const finialGeo = new THREE.OctahedronGeometry(0.028, 0);
  const finialLeft = new THREE.Mesh(finialGeo, steelMat);
  finialLeft.position.set(-0.15, 0.045, 0);
  swordGroup.add(finialLeft);

  const finialRight = new THREE.Mesh(finialGeo, steelMat);
  finialRight.position.set(0.15, 0.045, 0);
  swordGroup.add(finialRight);

  // Hilt: Leather-wrapped grip
  const hiltGeo = new THREE.CylinderGeometry(0.024, 0.027, 0.20, 6);
  const hilt = new THREE.Mesh(hiltGeo, leatherMat);
  hilt.position.set(0, -0.10, 0);
  swordGroup.add(hilt);

  // Hilt wire rings (gold bands around grip)
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(0.027, 0.005, 4, 8);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.position.set(0, -0.05 - i * 0.05, 0);
    ring.rotation.x = Math.PI / 2;
    swordGroup.add(ring);
  }

  // Pommel: Heavy faceted golden pommel for counterweight
  const pommelGeo = new THREE.OctahedronGeometry(0.048, 0);
  const pommel = new THREE.Mesh(pommelGeo, goldMat);
  pommel.position.set(0, -0.23, 0);
  pommel.scale.set(1, 1.25, 0.85);
  swordGroup.add(pommel);

  return swordGroup;
}

// ─── Helpers: Greathelm / Barbute Helmet ─────────────────────────────
function createGreathelm(
  ironMat: THREE.Material,
  darkMat: THREE.Material,
  goldMat: THREE.Material,
  visorGlowMat: THREE.Material
): THREE.Group {
  const helmGroup = new THREE.Group();

  // Helmet Cranium Dome (faceted upper helmet)
  const domeGeo = new THREE.CylinderGeometry(0.20, 0.23, 0.24, 8);
  const dome = new THREE.Mesh(domeGeo, ironMat);
  dome.position.set(0, 0.08, 0);
  helmGroup.add(dome);

  // Top rounded skull cap
  const crownGeo = new THREE.SphereGeometry(0.20, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const crown = new THREE.Mesh(crownGeo, ironMat);
  crown.position.set(0, 0.20, 0);
  helmGroup.add(crown);

  // Top Crest Fin (prominent low-poly crest fin along centerline)
  const crestBaseGeo = new THREE.BoxGeometry(0.06, 0.04, 0.36);
  const crestBase = new THREE.Mesh(crestBaseGeo, ironMat);
  crestBase.position.set(0, 0.22, -0.01);
  helmGroup.add(crestBase);

  const crestFinGeo = new THREE.BoxGeometry(0.035, 0.14, 0.32);
  const crestFin = new THREE.Mesh(crestFinGeo, goldMat);
  crestFin.position.set(0, 0.29, -0.01);
  helmGroup.add(crestFin);

  // Lower faceplate cylinder
  const faceplateGeo = new THREE.CylinderGeometry(0.23, 0.20, 0.22, 8);
  const faceplate = new THREE.Mesh(faceplateGeo, ironMat);
  faceplate.position.set(0, -0.10, 0);
  helmGroup.add(faceplate);

  // Defined Brow Guard (angled visor visor rim projecting over eyes)
  const browGeo = new THREE.BoxGeometry(0.36, 0.055, 0.12);
  const brow = new THREE.Mesh(browGeo, goldMat);
  brow.position.set(0, 0.03, 0.14);
  brow.rotation.x = 0.18;
  helmGroup.add(brow);

  // Barbute cheek guards flanking the face
  const leftCheekGeo = new THREE.BoxGeometry(0.055, 0.18, 0.14);
  const leftCheek = new THREE.Mesh(leftCheekGeo, ironMat);
  leftCheek.position.set(-0.16, -0.10, 0.10);
  leftCheek.rotation.y = -0.18;
  helmGroup.add(leftCheek);

  const leftCheekTrim = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.03), goldMat);
  leftCheekTrim.position.set(-0.14, -0.10, 0.17);
  helmGroup.add(leftCheekTrim);

  const rightCheekGeo = new THREE.BoxGeometry(0.055, 0.18, 0.14);
  const rightCheek = new THREE.Mesh(rightCheekGeo, ironMat);
  rightCheek.position.set(0.16, -0.10, 0.10);
  rightCheek.rotation.y = 0.18;
  helmGroup.add(rightCheek);

  const rightCheekTrim = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.03), goldMat);
  rightCheekTrim.position.set(0.14, -0.10, 0.17);
  helmGroup.add(rightCheekTrim);

  // Chin / Jaw protector plate
  const jawGeo = new THREE.BoxGeometry(0.16, 0.08, 0.12);
  const jaw = new THREE.Mesh(jawGeo, darkMat);
  jaw.position.set(0, -0.17, 0.11);
  helmGroup.add(jaw);

  // Subtle Glowing Cyan/Blue Visor Slit
  const recessGeo = new THREE.BoxGeometry(0.24, 0.05, 0.07);
  const recess = new THREE.Mesh(recessGeo, darkMat);
  recess.position.set(0, -0.015, 0.16);
  helmGroup.add(recess);

  const slitGeo = new THREE.BoxGeometry(0.20, 0.024, 0.03);
  const slit = new THREE.Mesh(slitGeo, visorGlowMat);
  slit.position.set(0, -0.015, 0.19);
  helmGroup.add(slit);

  const visorLight = new THREE.PointLight(0x38bdf8, 0.6, 1.2);
  visorLight.position.set(0, -0.015, 0.25);
  helmGroup.add(visorLight);

  return helmGroup;
}

// ─── Helpers: Layered Pauldron ───────────────────────────────────────
function createPauldron(
  side: 'left' | 'right',
  ironMat: THREE.Material,
  goldMat: THREE.Material
): THREE.Group {
  const pGroup = new THREE.Group();
  const dir = side === 'left' ? -1 : 1;

  // Upper main shell (angled, beveled shoulder plate)
  const topShellGeo = new THREE.BoxGeometry(0.28, 0.16, 0.26);
  const topShell = new THREE.Mesh(topShellGeo, ironMat);
  pGroup.add(topShell);

  // Gold crest ridge along pauldron top
  const ridgeGeo = new THREE.BoxGeometry(0.035, 0.08, 0.26);
  const ridge = new THREE.Mesh(ridgeGeo, goldMat);
  ridge.position.set(0, 0.09, 0);
  pGroup.add(ridge);

  // Gold trim rim around main shell
  const rimGeo = new THREE.BoxGeometry(0.29, 0.035, 0.27);
  const rim = new THREE.Mesh(rimGeo, goldMat);
  rim.position.set(0, -0.065, 0);
  pGroup.add(rim);

  // Lower tiered plate (overlapping secondary plate)
  const lowerPlateGeo = new THREE.BoxGeometry(0.23, 0.12, 0.22);
  const lowerPlate = new THREE.Mesh(lowerPlateGeo, ironMat);
  lowerPlate.position.set(dir * 0.02, -0.12, 0);
  pGroup.add(lowerPlate);

  const lowerRim = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.23), goldMat);
  lowerRim.position.set(dir * 0.02, -0.17, 0);
  pGroup.add(lowerRim);

  // Besagew (golden circular deflector disc on front of shoulder)
  const besagewGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.025, 8);
  const besagew = new THREE.Mesh(besagewGeo, goldMat);
  besagew.position.set(dir * -0.02, -0.06, 0.14);
  besagew.rotation.x = Math.PI / 2;
  pGroup.add(besagew);

  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 4), ironMat);
  boss.position.set(dir * -0.02, -0.06, 0.155);
  pGroup.add(boss);

  // Angle pauldron to conform naturally to shoulder anatomy
  pGroup.rotation.z = dir * -0.35;
  pGroup.rotation.y = dir * 0.08;

  return pGroup;
}

// ─── Procedural Warrior Mesh (Completely Revamped) ───────────────────
function createWarriorModel(): THREE.Group {
  const group = new THREE.Group();

  // ── Stylized Material Palette (flatShading: true) ──
  const ironArmorMat = new THREE.MeshStandardMaterial({
    color: 0x4a5568, // Polished iron / slate body armor
    roughness: 0.35,
    metalness: 0.65,
    flatShading: true,
  });

  const darkArmorMat = new THREE.MeshStandardMaterial({
    color: 0x2b3240, // Dark steel joints and under-plates
    roughness: 0.45,
    metalness: 0.55,
    flatShading: true,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd69e2e, // Gold / bronze trim accents
    roughness: 0.3,
    metalness: 0.7,
    flatShading: true,
  });

  const crimsonClothMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Deep crimson cloth (tabard, cape, belt)
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const steelBladeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Metallic steel blade
    roughness: 0.15,
    metalness: 0.9,
    flatShading: true,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x3d2314, // Dark leather straps & grip
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true,
  });

  const chainmailMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Chainmail under-armor
    roughness: 0.6,
    metalness: 0.4,
    flatShading: true,
  });

  const visorGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Subtle glowing cyan/blue visor slit
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.6,
    roughness: 0.2,
    metalness: 0.1,
    flatShading: true,
  });

  // ── 1. Torso & Breastplate ──
  // Gorget / Neck armored collar
  const gorgetGeo = new THREE.CylinderGeometry(0.21, 0.26, 0.14, 8);
  const gorget = new THREE.Mesh(gorgetGeo, ironArmorMat);
  gorget.position.set(0, 1.34, 0);
  group.add(gorget);

  const gorgetRim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 6, 12), goldTrimMat);
  gorgetRim.position.set(0, 1.36, 0);
  gorgetRim.rotation.x = Math.PI / 2;
  group.add(gorgetRim);

  // Upper torso core (dark under-armor / chainmail base)
  const chestCoreGeo = new THREE.CylinderGeometry(0.36, 0.31, 0.38, 8);
  const chestCore = new THREE.Mesh(chestCoreGeo, darkArmorMat);
  chestCore.position.set(0, 1.10, 0);
  group.add(chestCore);

  // Chiseled pectoral front plate (iron, jutting forward)
  const pecGeo = new THREE.BoxGeometry(0.44, 0.28, 0.16);
  const pecPlate = new THREE.Mesh(pecGeo, ironArmorMat);
  pecPlate.position.set(0, 1.12, 0.10);
  pecPlate.rotation.x = 0.12; // Athletic forward slope
  group.add(pecPlate);

  // Central pectoral chiseled ridge / keel
  const keelGeo = new THREE.BoxGeometry(0.035, 0.28, 0.06);
  const keel = new THREE.Mesh(keelGeo, goldTrimMat);
  keel.position.set(0, 1.13, 0.19);
  keel.rotation.x = 0.12;
  group.add(keel);

  // Gold trim bar across upper breastplate
  const pecTrimGeo = new THREE.BoxGeometry(0.42, 0.035, 0.05);
  const pecTrim = new THREE.Mesh(pecTrimGeo, goldTrimMat);
  pecTrim.position.set(0, 1.24, 0.11);
  group.add(pecTrim);

  // Segmented abdominal plates (Faulds)
  const fauld1Geo = new THREE.CylinderGeometry(0.31, 0.29, 0.11, 8);
  const fauld1 = new THREE.Mesh(fauld1Geo, ironArmorMat);
  fauld1.position.set(0, 0.90, 0);
  group.add(fauld1);

  const fauld2Geo = new THREE.CylinderGeometry(0.29, 0.27, 0.11, 8);
  const fauld2 = new THREE.Mesh(fauld2Geo, ironArmorMat);
  fauld2.position.set(0, 0.81, 0);
  group.add(fauld2);

  // Gold trim along lower fauld edge
  const fauldRim = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.015, 6, 12), goldTrimMat);
  fauldRim.position.set(0, 0.76, 0);
  fauldRim.rotation.x = Math.PI / 2;
  group.add(fauldRim);

  // Waist Belt & Buckle: Thick crimson/leather waist belt
  const beltGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.12, 10);
  const belt = new THREE.Mesh(beltGeo, crimsonClothMat);
  belt.position.set(0, 0.70, 0);
  group.add(belt);

  // Leather border bands on the belt
  const beltStrap1 = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.012, 4, 12), leatherMat);
  beltStrap1.position.set(0, 0.75, 0);
  beltStrap1.rotation.x = Math.PI / 2;
  group.add(beltStrap1);

  const beltStrap2 = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.012, 4, 12), leatherMat);
  beltStrap2.position.set(0, 0.65, 0);
  beltStrap2.rotation.x = Math.PI / 2;
  group.add(beltStrap2);

  // Belt Buckle (gold outer frame + dark center)
  const buckleGeo = new THREE.BoxGeometry(0.12, 0.11, 0.06);
  const buckle = new THREE.Mesh(buckleGeo, goldTrimMat);
  buckle.position.set(0, 0.70, 0.28);
  group.add(buckle);

  const buckleInnerGeo = new THREE.BoxGeometry(0.07, 0.06, 0.065);
  const buckleInner = new THREE.Mesh(buckleInnerGeo, darkArmorMat);
  buckleInner.position.set(0, 0.70, 0.285);
  group.add(buckleInner);

  // Hanging belt tongue strap
  const strapTail = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.24, 0.02), crimsonClothMat);
  strapTail.position.set(0.05, 0.56, 0.28);
  strapTail.rotation.z = -0.05;
  group.add(strapTail);

  const strapTip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.025), goldTrimMat);
  strapTip.position.set(0.056, 0.44, 0.28);
  group.add(strapTip);

  // ── 2. Front Tabard & Back Cape ──
  // Front Tabard Flap hanging from the belt
  const tabardGeo = new THREE.BoxGeometry(0.22, 0.38, 0.02);
  const tabard = new THREE.Mesh(tabardGeo, crimsonClothMat);
  tabard.position.set(0, 0.50, 0.22);
  tabard.rotation.x = -0.06;
  group.add(tabard);

  const tabardTrim = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.025), goldTrimMat);
  tabardTrim.position.set(0, 0.32, 0.23);
  group.add(tabardTrim);

  // Cape shoulder clasps
  const claspLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6), goldTrimMat);
  claspLeft.position.set(-0.22, 1.28, -0.12);
  claspLeft.rotation.x = Math.PI / 2;
  group.add(claspLeft);

  const claspRight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6), goldTrimMat);
  claspRight.position.set(0.22, 1.28, -0.12);
  claspRight.rotation.x = Math.PI / 2;
  group.add(claspRight);

  // Low-poly faceted back cape
  const capeGroup = new THREE.Group();
  const capeCenterGeo = new THREE.BoxGeometry(0.28, 1.05, 0.025);
  const capeCenter = new THREE.Mesh(capeCenterGeo, crimsonClothMat);
  capeCenter.position.set(0, 0.70, -0.18);
  capeCenter.rotation.x = -0.10;
  capeGroup.add(capeCenter);

  const capeLeftGeo = new THREE.BoxGeometry(0.22, 1.02, 0.025);
  const capeLeft = new THREE.Mesh(capeLeftGeo, crimsonClothMat);
  capeLeft.position.set(-0.20, 0.70, -0.16);
  capeLeft.rotation.x = -0.09;
  capeLeft.rotation.y = 0.14;
  capeLeft.rotation.z = 0.06;
  capeGroup.add(capeLeft);

  const capeRightGeo = new THREE.BoxGeometry(0.22, 1.02, 0.025);
  const capeRight = new THREE.Mesh(capeRightGeo, crimsonClothMat);
  capeRight.position.set(0.20, 0.70, -0.16);
  capeRight.rotation.x = -0.09;
  capeRight.rotation.y = -0.14;
  capeRight.rotation.z = -0.06;
  capeGroup.add(capeRight);
  group.add(capeGroup);

  // ── 3. Greathelm Helmet ──
  const helmet = createGreathelm(ironArmorMat, darkArmorMat, goldTrimMat, visorGlowMat);
  helmet.position.set(0, 1.54, 0);
  group.add(helmet);

  // ── 4. Pauldrons (Shoulders) ──
  const leftPauldron = createPauldron('left', ironArmorMat, goldTrimMat);
  leftPauldron.position.set(-0.44, 1.24, 0);
  group.add(leftPauldron);

  const rightPauldron = createPauldron('right', ironArmorMat, goldTrimMat);
  rightPauldron.position.set(0.44, 1.24, 0);
  group.add(rightPauldron);

  // ── 5. Left Arm & Heater Shield ──
  const upperArmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.28, 6);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, chainmailMat);
  leftUpperArm.position.set(-0.42, 1.04, 0.02);
  leftUpperArm.rotation.z = 0.22;
  leftUpperArm.rotation.x = -0.15;
  group.add(leftUpperArm);

  const couterGeo = new THREE.ConeGeometry(0.065, 0.07, 4);
  const leftCouter = new THREE.Mesh(couterGeo, goldTrimMat);
  leftCouter.position.set(-0.48, 0.90, -0.03);
  leftCouter.rotation.x = -Math.PI / 2;
  group.add(leftCouter);

  const vambraceGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.26, 6);
  const leftForearm = new THREE.Mesh(vambraceGeo, ironArmorMat);
  leftForearm.position.set(-0.44, 0.82, 0.14);
  leftForearm.rotation.x = -0.65;
  leftForearm.rotation.z = 0.25;
  group.add(leftForearm);

  const leftCuff = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 4, 8), goldTrimMat);
  leftCuff.position.set(-0.44, 0.82, 0.14);
  leftCuff.rotation.x = Math.PI / 2;
  group.add(leftCuff);

  const fistGeo = new THREE.BoxGeometry(0.09, 0.08, 0.10);
  const leftFist = new THREE.Mesh(fistGeo, ironArmorMat);
  leftFist.position.set(-0.40, 0.76, 0.26);
  group.add(leftFist);

  // Heater Shield mounted onto left forearm facing outward
  const heaterShield = createHeaterShield(ironArmorMat, goldTrimMat, crimsonClothMat, steelBladeMat);
  heaterShield.position.set(-0.52, 0.80, 0.22);
  heaterShield.rotation.y = -0.55; // Angle outward and forward so heraldry, rim, and boss are clearly visible
  heaterShield.rotation.x = 0.10;
  heaterShield.rotation.z = 0.08;
  group.add(heaterShield);

  // ── 6. Right Arm & Broadsword (Posed Angled Forward) ──
  const rightUpperArm = new THREE.Mesh(upperArmGeo, chainmailMat);
  rightUpperArm.position.set(0.42, 1.05, 0.04);
  rightUpperArm.rotation.z = -0.28;
  rightUpperArm.rotation.x = 0.25; // Upper arm reaches slightly forward
  group.add(rightUpperArm);

  const rightCouter = new THREE.Mesh(couterGeo, goldTrimMat);
  rightCouter.position.set(0.48, 0.92, -0.04);
  rightCouter.rotation.x = -Math.PI / 2;
  group.add(rightCouter);

  const rightForearm = new THREE.Mesh(vambraceGeo, ironArmorMat);
  rightForearm.position.set(0.42, 0.82, 0.18);
  rightForearm.rotation.x = 0.70; // Forearm points forward towards the enemy
  rightForearm.rotation.y = -0.15;
  rightForearm.rotation.z = -0.20;
  group.add(rightForearm);

  const rightCuff = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 4, 8), goldTrimMat);
  rightCuff.position.set(0.42, 0.82, 0.18);
  rightCuff.rotation.x = Math.PI / 2;
  group.add(rightCuff);

  const rightFist = new THREE.Mesh(fistGeo, ironArmorMat);
  rightFist.position.set(0.42, 0.72, 0.32);
  group.add(rightFist);

  // Broadsword held firmly in right hand, blade angled forward and upward
  const broadsword = createBroadsword(steelBladeMat, goldTrimMat, leatherMat, darkArmorMat);
  broadsword.position.set(0.42, 0.72, 0.32);
  broadsword.rotation.x = 0.55; // Blade points forward towards viewer/key light
  broadsword.rotation.y = -0.20;
  broadsword.rotation.z = -0.25;
  group.add(broadsword);

  // ── 7. Legs, Greaves & Sabatons ──
  // Pelvis base
  const pelvisGeo = new THREE.CylinderGeometry(0.27, 0.24, 0.16, 8);
  const pelvis = new THREE.Mesh(pelvisGeo, darkArmorMat);
  pelvis.position.set(0, 0.58, 0);
  group.add(pelvis);

  // Left Tasset
  const tassetLeftGeo = new THREE.BoxGeometry(0.16, 0.22, 0.025);
  const tassetLeft = new THREE.Mesh(tassetLeftGeo, ironArmorMat);
  tassetLeft.position.set(-0.24, 0.50, 0.08);
  tassetLeft.rotation.z = -0.22;
  tassetLeft.rotation.y = 0.12;
  group.add(tassetLeft);

  const tassetLeftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.03), goldTrimMat);
  tassetLeftTrim.position.set(-0.26, 0.40, 0.09);
  tassetLeftTrim.rotation.z = -0.22;
  tassetLeftTrim.rotation.y = 0.12;
  group.add(tassetLeftTrim);

  // Right Tasset
  const tassetRightGeo = new THREE.BoxGeometry(0.16, 0.22, 0.025);
  const tassetRight = new THREE.Mesh(tassetRightGeo, ironArmorMat);
  tassetRight.position.set(0.24, 0.50, 0.08);
  tassetRight.rotation.z = 0.22;
  tassetRight.rotation.y = -0.12;
  group.add(tassetRight);

  const tassetRightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.03), goldTrimMat);
  tassetRightTrim.position.set(0.26, 0.40, 0.09);
  tassetRightTrim.rotation.z = 0.22;
  tassetRightTrim.rotation.y = -0.12;
  group.add(tassetRightTrim);

  // Thighs (Cuisses)
  const thighGeo = new THREE.CylinderGeometry(0.125, 0.105, 0.30, 6);
  const leftThigh = new THREE.Mesh(thighGeo, chainmailMat);
  leftThigh.position.set(-0.16, 0.42, 0.02);
  group.add(leftThigh);

  const rightThigh = new THREE.Mesh(thighGeo, chainmailMat);
  rightThigh.position.set(0.16, 0.42, -0.02);
  group.add(rightThigh);

  // Knee Poleyns (pointed knee guards)
  const kneeGeo = new THREE.BoxGeometry(0.14, 0.11, 0.09);
  const leftKnee = new THREE.Mesh(kneeGeo, ironArmorMat);
  leftKnee.position.set(-0.16, 0.25, 0.08);
  group.add(leftKnee);

  const leftKneeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.11, 0.095), goldTrimMat);
  leftKneeTrim.position.set(-0.16, 0.25, 0.085);
  group.add(leftKneeTrim);

  const rightKnee = new THREE.Mesh(kneeGeo, ironArmorMat);
  rightKnee.position.set(0.16, 0.25, 0.04);
  group.add(rightKnee);

  const rightKneeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.11, 0.095), goldTrimMat);
  rightKneeTrim.position.set(0.16, 0.25, 0.045);
  group.add(rightKneeTrim);

  // Greaves (Distinct Segmented Shin Guards)
  const calfGeo = new THREE.CylinderGeometry(0.105, 0.09, 0.30, 6);
  const greavePlateGeo = new THREE.BoxGeometry(0.13, 0.28, 0.05);
  const greaveRidgeGeo = new THREE.BoxGeometry(0.025, 0.28, 0.055);
  const greaveBandGeo = new THREE.BoxGeometry(0.135, 0.03, 0.055);

  // Left Shin
  const leftCalf = new THREE.Mesh(calfGeo, darkArmorMat);
  leftCalf.position.set(-0.16, 0.08, 0.01);
  group.add(leftCalf);

  const leftGreave = new THREE.Mesh(greavePlateGeo, ironArmorMat);
  leftGreave.position.set(-0.16, 0.08, 0.06);
  group.add(leftGreave);

  const leftGreaveRidge = new THREE.Mesh(greaveRidgeGeo, goldTrimMat);
  leftGreaveRidge.position.set(-0.16, 0.08, 0.065);
  group.add(leftGreaveRidge);

  const leftGreaveBand = new THREE.Mesh(greaveBandGeo, goldTrimMat);
  leftGreaveBand.position.set(-0.16, 0.18, 0.06);
  group.add(leftGreaveBand);

  // Right Shin
  const rightCalf = new THREE.Mesh(calfGeo, darkArmorMat);
  rightCalf.position.set(0.16, 0.08, -0.03);
  group.add(rightCalf);

  const rightGreave = new THREE.Mesh(greavePlateGeo, ironArmorMat);
  rightGreave.position.set(0.16, 0.08, 0.02);
  group.add(rightGreave);

  const rightGreaveRidge = new THREE.Mesh(greaveRidgeGeo, goldTrimMat);
  rightGreaveRidge.position.set(0.16, 0.08, 0.025);
  group.add(rightGreaveRidge);

  const rightGreaveBand = new THREE.Mesh(greaveBandGeo, goldTrimMat);
  rightGreaveBand.position.set(0.16, 0.18, 0.02);
  group.add(rightGreaveBand);

  // Sabatons (Segmented Armored Boots)
  const bootGeo = new THREE.BoxGeometry(0.15, 0.09, 0.24);
  const toeGeo = new THREE.ConeGeometry(0.075, 0.09, 4);

  // Left Boot
  const leftBoot = new THREE.Mesh(bootGeo, ironArmorMat);
  leftBoot.position.set(-0.16, -0.075, 0.05);
  group.add(leftBoot);

  const leftToe = new THREE.Mesh(toeGeo, ironArmorMat);
  leftToe.position.set(-0.16, -0.08, 0.20);
  leftToe.rotation.x = Math.PI / 2;
  leftToe.rotation.y = Math.PI / 4;
  group.add(leftToe);

  const leftBootTrim = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.025, 0.05), goldTrimMat);
  leftBootTrim.position.set(-0.16, -0.05, 0.06);
  group.add(leftBootTrim);

  // Right Boot
  const rightBoot = new THREE.Mesh(bootGeo, ironArmorMat);
  rightBoot.position.set(0.16, -0.075, 0.01);
  group.add(rightBoot);

  const rightToe = new THREE.Mesh(toeGeo, ironArmorMat);
  rightToe.position.set(0.16, -0.08, 0.16);
  rightToe.rotation.x = Math.PI / 2;
  rightToe.rotation.y = Math.PI / 4;
  group.add(rightToe);

  const rightBootTrim = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.025, 0.05), goldTrimMat);
  rightBootTrim.position.set(0.16, -0.05, 0.02);
  group.add(rightBootTrim);

  // Enable shadow casting & receiving across all warrior meshes
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return group;
}

// ─── Procedural Mage Mesh (Stylized Low-Poly Wizard Overhaul) ──────
function createMageModel(): THREE.Group {
  const group = new THREE.Group();

  // ── Stylized Material Palette (flatShading: true) ──
  const robeMat = new THREE.MeshStandardMaterial({
    color: 0x3b0764, // Deep royal purple
    roughness: 0.75,
    metalness: 0.1,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const innerRobeMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b, // Deep indigo under-robe
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xeab308, // Matte yellow / gold accents & trim
    roughness: 0.35,
    metalness: 0.7,
    flatShading: true,
  });

  const capeMat = new THREE.MeshStandardMaterial({
    color: 0x581c87, // Deep violet-crimson tattered cape
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
    side: THREE.DoubleSide,
  });


  const woodStaffMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // Earthy dark brown gnarled wooden staff
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
  });

  const staffCageMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Golden cage / claw holding the jewel
    roughness: 0.3,
    metalness: 0.75,
    flatShading: true,
  });

  const facePlateMat = new THREE.MeshStandardMaterial({
    color: 0xf1ede4, // Ivory / pale flesh tone face plate under hat brim
    roughness: 0.70,
    metalness: 0.04,
    flatShading: true,
  });

  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // White sclera / eyeball
    roughness: 0.35,
    metalness: 0.0,
    flatShading: true,
  });

  const pupilMat = new THREE.MeshBasicMaterial({
    color: 0x111111, // Pitch-black pupils that never wash out in lighting
  });

  const irisRimMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // Faint arcane cyan edge framing pupils
  });

  const mustacheMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Crisp off-white mustache wings
    roughness: 0.8,
    metalness: 0.02,
    flatShading: true,
  });

  const beardTier1Mat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Crisp white upper tier
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
  });

  const beardTier2Mat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Soft gray mid tier
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
  });

  const beardTier3Mat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc, // Slate gray lower tier for depth separation
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfdba74, // Stylized tan/skin tone for cranium core
    roughness: 0.75,
    metalness: 0.05,
    flatShading: true,
  });

  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc, // Translucent glowing crystal jewel
    emissive: 0xa855f7,
    emissiveIntensity: 1.4,
    roughness: 0.1,
    metalness: 0.4,
    transparent: true,
    opacity: 0.9,
    flatShading: true,
  });

  const spellOrbMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee, // Glowing cyan spell core
    emissive: 0x06b6d4,
    emissiveIntensity: 2.2,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.9,
    flatShading: true,
  });

  const spellRingMat = new THREE.MeshStandardMaterial({
    color: 0xd946ef, // Magenta orbital energy ring
    emissive: 0xc026d3,
    emissiveIntensity: 1.8,
    roughness: 0.2,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
    flatShading: true,
  });

  // ── 1. Robes & Anatomy ──
  // Inner Robe Core (dark indigo cylinder base)
  const innerRobeGeo = new THREE.CylinderGeometry(0.24, 0.40, 0.74, 8);
  const innerRobe = new THREE.Mesh(innerRobeGeo, innerRobeMat);
  innerRobe.position.set(0, 0.35, 0);
  group.add(innerRobe);

  // Outer Robe / Tiered Split Skirt (deep royal purple with gold borders)
  // Left skirt panel
  const skirtLeftGeo = new THREE.BoxGeometry(0.24, 0.72, 0.36);
  const skirtLeft = new THREE.Mesh(skirtLeftGeo, robeMat);
  skirtLeft.position.set(-0.16, 0.34, 0);
  skirtLeft.rotation.z = -0.06;
  group.add(skirtLeft);

  const skirtLeftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.72, 0.04), goldTrimMat);
  skirtLeftTrim.position.set(-0.04, 0.34, 0.18);
  group.add(skirtLeftTrim);

  // Right skirt panel
  const skirtRightGeo = new THREE.BoxGeometry(0.24, 0.72, 0.36);
  const skirtRight = new THREE.Mesh(skirtRightGeo, robeMat);
  skirtRight.position.set(0.16, 0.34, 0);
  skirtRight.rotation.z = 0.06;
  group.add(skirtRight);

  const skirtRightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.72, 0.04), goldTrimMat);
  skirtRightTrim.position.set(0.04, 0.34, 0.18);
  group.add(skirtRightTrim);

  // Lower skirt hem gold border
  const hemTrimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.38), goldTrimMat);
  hemTrimLeft.position.set(-0.16, 0.0, 0);
  group.add(hemTrimLeft);

  const hemTrimRight = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.38), goldTrimMat);
  hemTrimRight.position.set(0.16, 0.0, 0);
  group.add(hemTrimRight);

  // Torso / Chest (tapered upper robe)
  const chestGeo = new THREE.CylinderGeometry(0.32, 0.27, 0.38, 8);
  const chest = new THREE.Mesh(chestGeo, robeMat);
  chest.position.set(0, 0.90, 0);
  group.add(chest);

  // Chest vertical gold piping
  const chestTrimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.36, 0.03), goldTrimMat);
  chestTrimLeft.position.set(-0.06, 0.90, 0.27);
  group.add(chestTrimLeft);

  const chestTrimRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.36, 0.03), goldTrimMat);
  chestTrimRight.position.set(0.06, 0.90, 0.27);
  group.add(chestTrimRight);

  // High standing collar behind the neck
  const collarGeo = new THREE.BoxGeometry(0.40, 0.18, 0.24);
  const collar = new THREE.Mesh(collarGeo, robeMat);
  collar.position.set(0, 1.20, -0.06);
  collar.rotation.x = -0.15;
  group.add(collar);

  const collarTrim = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.04), goldTrimMat);
  collarTrim.position.set(0, 1.30, -0.04);
  group.add(collarTrim);

  // Layered Shoulder Drapes / Mantle (epaulets with gold trim)
  const mantleLeftGeo = new THREE.BoxGeometry(0.24, 0.12, 0.26);
  const mantleLeft = new THREE.Mesh(mantleLeftGeo, robeMat);
  mantleLeft.position.set(-0.36, 1.10, 0.02);
  mantleLeft.rotation.z = 0.25;
  group.add(mantleLeft);

  const mantleLeftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.27), goldTrimMat);
  mantleLeftTrim.position.set(-0.36, 1.05, 0.02);
  mantleLeftTrim.rotation.z = 0.25;
  group.add(mantleLeftTrim);

  const mantleRightGeo = new THREE.BoxGeometry(0.24, 0.12, 0.26);
  const mantleRight = new THREE.Mesh(mantleRightGeo, robeMat);
  mantleRight.position.set(0.36, 1.10, 0.02);
  mantleRight.rotation.z = -0.25;
  group.add(mantleRight);

  const mantleRightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.27), goldTrimMat);
  mantleRightTrim.position.set(0.36, 1.05, 0.02);
  mantleRightTrim.rotation.z = -0.25;
  group.add(mantleRightTrim);

  // Waist Belt & Buckle
  const beltGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.10, 10);
  const belt = new THREE.Mesh(beltGeo, goldTrimMat);
  belt.position.set(0, 0.71, 0);
  group.add(belt);

  const beltInner = new THREE.Mesh(new THREE.CylinderGeometry(0.292, 0.292, 0.04, 10), innerRobeMat);
  beltInner.position.set(0, 0.71, 0);
  group.add(beltInner);

  // Diagonal Hip Drapes / Trim (as in reference art)
  const hipTrimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.035, 0.03), goldTrimMat);
  hipTrimLeft.position.set(-0.16, 0.64, 0.22);
  hipTrimLeft.rotation.z = -0.45;
  group.add(hipTrimLeft);

  const hipTrimRight = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.035, 0.03), goldTrimMat);
  hipTrimRight.position.set(0.16, 0.64, 0.22);
  hipTrimRight.rotation.z = 0.45;
  group.add(hipTrimRight);

  // Geometric Gold Buckle
  const buckleGeo = new THREE.BoxGeometry(0.12, 0.11, 0.06);
  const buckle = new THREE.Mesh(buckleGeo, goldTrimMat);
  buckle.position.set(0, 0.71, 0.28);
  group.add(buckle);

  const buckleCore = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.065), innerRobeMat);
  buckleCore.position.set(0, 0.71, 0.285);
  group.add(buckleCore);

  // Tattered Fabric Cape (hanging behind in deep violet-crimson)
  const capeGroup = new THREE.Group();
  const capeCenterGeo = new THREE.BoxGeometry(0.34, 1.02, 0.025);
  const capeCenter = new THREE.Mesh(capeCenterGeo, capeMat);
  capeCenter.position.set(0, 0.60, -0.20);
  capeCenter.rotation.x = -0.12;
  capeGroup.add(capeCenter);

  const capeLeftGeo = new THREE.BoxGeometry(0.24, 0.98, 0.025);
  const capeLeft = new THREE.Mesh(capeLeftGeo, capeMat);
  capeLeft.position.set(-0.20, 0.60, -0.18);
  capeLeft.rotation.x = -0.11;
  capeLeft.rotation.y = 0.15;
  capeLeft.rotation.z = 0.08;
  capeGroup.add(capeLeft);

  const capeRightGeo = new THREE.BoxGeometry(0.24, 0.98, 0.025);
  const capeRight = new THREE.Mesh(capeRightGeo, capeMat);
  capeRight.position.set(0.20, 0.60, -0.18);
  capeRight.rotation.x = -0.11;
  capeRight.rotation.y = -0.15;
  capeRight.rotation.z = -0.08;
  capeGroup.add(capeRight);
  group.add(capeGroup);

  // Dark Wizard Shoes (peeking out from under skirt hem)
  const shoeGeo = new THREE.BoxGeometry(0.12, 0.07, 0.20);
  const leftShoe = new THREE.Mesh(shoeGeo, innerRobeMat);
  leftShoe.position.set(-0.13, -0.07, 0.06);
  group.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeo, innerRobeMat);
  rightShoe.position.set(0.13, -0.07, 0.04);
  group.add(rightShoe);

  // ── 2. Head, Defined Face Plate, Eyes with Black Pupils, Layered Beard & Hat ──
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.32, 0.04);
  group.add(headGroup);

  // Head cranium core
  const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const head = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(head);

  // Defined Eye Socket / Face Plate under the hat brim using ivory/pale flesh tone (0xf1ede4)
  const facePlateGeo = new THREE.BoxGeometry(0.24, 0.11, 0.10);
  const facePlate = new THREE.Mesh(facePlateGeo, facePlateMat);
  facePlate.position.set(0, 0.015, 0.10);
  headGroup.add(facePlate);

  // Cheeks / temples framing face
  const cheekLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.09), facePlateMat);
  cheekLeft.position.set(-0.11, -0.01, 0.11);
  cheekLeft.rotation.y = -0.22;
  headGroup.add(cheekLeft);

  const cheekRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.09), facePlateMat);
  cheekRight.position.set(0.11, -0.01, 0.11);
  cheekRight.rotation.y = 0.22;
  headGroup.add(cheekRight);

  // Defined Brow Ridge (ivory/pale flesh tone projecting under hat brim)
  const browRidgeGeo = new THREE.BoxGeometry(0.24, 0.038, 0.08);
  const browRidge = new THREE.Mesh(browRidgeGeo, facePlateMat);
  browRidge.position.set(0, 0.052, 0.145);
  browRidge.rotation.x = -0.10;
  headGroup.add(browRidge);

  // Prominent Stylized Low-Poly Nose (jutting forward characterfully)
  const noseGeo = new THREE.BoxGeometry(0.052, 0.075, 0.07);
  const nose = new THREE.Mesh(noseGeo, facePlateMat);
  nose.position.set(0, -0.022, 0.190);
  nose.rotation.x = 0.20;
  headGroup.add(nose);

  // ── Visible Eyes with Sclera, Faint Cyan Iris Rim & Black Pupils ──
  const eyeGroup = new THREE.Group();

  const createEye = (isLeft: boolean) => {
    const eye = new THREE.Group();
    const xPos = isLeft ? -0.062 : 0.062;
    const rotZ = isLeft ? -0.08 : 0.08;
    const rotY = isLeft ? -0.10 : 0.10;

    // Sclera (Eyeball) - White flat-shaded low-poly box positioned prominently under hat line
    const scleraGeo = new THREE.BoxGeometry(0.054, 0.038, 0.026);
    const sclera = new THREE.Mesh(scleraGeo, scleraMat);
    eye.add(sclera);

    // Faint Arcane Cyan Rim around pupil
    const irisRimGeo = new THREE.BoxGeometry(0.032, 0.030, 0.009);
    const irisRim = new THREE.Mesh(irisRimGeo, irisRimMat);
    irisRim.position.set(0, 0, 0.012);
    eye.add(irisRim);

    // Distinct Black Pupil (MeshBasicMaterial 0x111111: never washes out or gets lost in lighting)
    const pupilGeo = new THREE.BoxGeometry(0.022, 0.022, 0.012);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(0, 0, 0.016);
    eye.add(pupil);

    eye.position.set(xPos, 0.018, 0.160);
    eye.rotation.set(0, rotY, rotZ);
    return eye;
  };

  eyeGroup.add(createEye(true));
  eyeGroup.add(createEye(false));
  headGroup.add(eyeGroup);

  // ── Beard & Mustache Separation ──
  // Distinct Mustache Wings flaring outward just under the nose, framing the beard
  const mustacheLeft = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.052, 0.065), mustacheMat);
  mustacheLeft.position.set(-0.082, -0.074, 0.190);
  mustacheLeft.rotation.z = -0.36;
  mustacheLeft.rotation.y = -0.22;
  mustacheLeft.rotation.x = 0.10;
  headGroup.add(mustacheLeft);

  const mustacheRight = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.052, 0.065), mustacheMat);
  mustacheRight.position.set(0.082, -0.074, 0.190);
  mustacheRight.rotation.z = 0.36;
  mustacheRight.rotation.y = 0.22;
  mustacheRight.rotation.x = 0.10;
  headGroup.add(mustacheRight);

  const mustacheCenter = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.04), mustacheMat);
  mustacheCenter.position.set(0, -0.062, 0.195);
  headGroup.add(mustacheCenter);

  // Main Beard extending downward in tiered angular facets with depth offsets
  // Tier 1 (Upper chin / jaw fullness facet in clean white 0xf1f5f9)
  const beardTier1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.12), beardTier1Mat);
  beardTier1.position.set(0, -0.16, 0.20);
  beardTier1.rotation.x = 0.06;
  headGroup.add(beardTier1);

  // Tier 2 (Mid-chest cascading fold with gray contrast 0xe2e8f0 and depth step forward)
  const beardTier2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.16, 0.11), beardTier2Mat);
  beardTier2.position.set(0, -0.30, 0.22);
  beardTier2.rotation.x = -0.04;
  headGroup.add(beardTier2);

  // Tier 3 (Lower chest drape facet in slate gray 0xcfd8dc with forward depth offset)
  const beardTier3 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.10), beardTier3Mat);
  beardTier3.position.set(0, -0.44, 0.23);
  beardTier3.rotation.x = -0.08;
  headGroup.add(beardTier3);

  // Pointed faceted tip tapering over belt
  const beardTipGeo = new THREE.ConeGeometry(0.07, 0.22, 5);
  const beardTip = new THREE.Mesh(beardTipGeo, beardTier2Mat);
  beardTip.position.set(0, -0.58, 0.22);
  beardTip.rotation.x = Math.PI - 0.10;
  headGroup.add(beardTip);

  // Side beard tufts (enhances 3/4 view silhouette and depth)
  const tuftLeft1 = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.14, 0.07), beardTier2Mat);
  tuftLeft1.position.set(-0.12, -0.20, 0.16);
  tuftLeft1.rotation.z = -0.22;
  headGroup.add(tuftLeft1);

  const tuftRight1 = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.14, 0.07), beardTier2Mat);
  tuftRight1.position.set(0.12, -0.20, 0.16);
  tuftRight1.rotation.z = 0.22;
  headGroup.add(tuftRight1);

  const tuftLeft2 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.13, 0.06), beardTier3Mat);
  tuftLeft2.position.set(-0.09, -0.33, 0.18);
  tuftLeft2.rotation.z = -0.16;
  headGroup.add(tuftLeft2);

  const tuftRight2 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.13, 0.06), beardTier3Mat);
  tuftRight2.position.set(0.09, -0.33, 0.18);
  tuftRight2.rotation.z = 0.16;
  headGroup.add(tuftRight2);

  // Hair locks framing sides of head
  const hairLeft = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.24, 0.12), beardTier1Mat);
  hairLeft.position.set(-0.16, -0.06, 0.02);
  hairLeft.rotation.z = -0.12;
  headGroup.add(hairLeft);

  const hairRight = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.24, 0.12), beardTier1Mat);
  hairRight.position.set(0.16, -0.06, 0.02);
  hairRight.rotation.z = 0.12;
  headGroup.add(hairRight);

  // ── Face Illumination (Fix the dark brim shadow) ──
  // Subtle local PointLight directly in front of and slightly below the face (color: 0xffffff, intensity: 0.85, distance: 2.0)
  const faceLight = new THREE.PointLight(0xffffff, 0.85, 2.0);
  faceLight.position.set(0, -0.04, 0.42);
  headGroup.add(faceLight);

  // ── Dynamic Wrinkled Wizard's Hat with S-Curve & Wavy Brim ──
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 1.44, 0.02);
  hatGroup.rotation.x = -0.06; // tilt back slightly so face & eyes are fully revealed
  hatGroup.rotation.z = -0.05;

  // Wavy Brim with side dips and arched front
  const brimCenterGeo = new THREE.CylinderGeometry(0.44, 0.46, 0.035, 14);
  const brimCenter = new THREE.Mesh(brimCenterGeo, robeMat);
  hatGroup.add(brimCenter);

  // Left brim dip
  const brimLeftDip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.44), robeMat);
  brimLeftDip.position.set(-0.25, -0.035, 0);
  brimLeftDip.rotation.z = -0.15;
  hatGroup.add(brimLeftDip);

  // Right brim dip
  const brimRightDip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.44), robeMat);
  brimRightDip.position.set(0.25, -0.035, 0);
  brimRightDip.rotation.z = 0.15;
  hatGroup.add(brimRightDip);

  // Front brim upward arch (lifts up over the brow ridge)
  const brimFrontArch = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.032, 0.18), robeMat);
  brimFrontArch.position.set(0, 0.02, 0.22);
  brimFrontArch.rotation.x = -0.18;
  hatGroup.add(brimFrontArch);

  // Thick Gold Band/Strap just above brim (0xeab308)
  const hatBandGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.085, 12);
  const hatBand = new THREE.Mesh(hatBandGeo, goldTrimMat);
  hatBand.position.set(0, 0.06, 0);
  hatGroup.add(hatBand);

  const hatBandInner = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.282, 0.04, 12), innerRobeMat);
  hatBandInner.position.set(0, 0.06, 0);
  hatGroup.add(hatBandInner);

  // 3D Geometric Gold Buckle / Brooch (0xd97706)
  const hatBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.05), staffCageMat);
  hatBuckle.position.set(0, 0.06, 0.28);
  hatGroup.add(hatBuckle);

  const hatBuckleInner = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.065, 0.055), goldTrimMat);
  hatBuckleInner.position.set(0, 0.06, 0.285);
  hatGroup.add(hatBuckleInner);

  // Segmented Cone with 'S'-Curve, Sag, and Wrinkles
  // Segment 1 (lower cone base)
  const hatCone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.25, 0.22, 8), robeMat);
  hatCone1.position.set(0, 0.19, 0);
  hatGroup.add(hatCone1);

  // Crease wrinkle 1
  const wrinkle1 = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.016, 4, 10), innerRobeMat);
  wrinkle1.position.set(0, 0.11, 0);
  wrinkle1.rotation.x = Math.PI / 2;
  hatGroup.add(wrinkle1);

  // Segment 2 (mid-lower crease tilted backward and left)
  const hatCone2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 0.22, 8), robeMat);
  hatCone2.position.set(-0.02, 0.38, -0.03);
  hatCone2.rotation.x = -0.22;
  hatCone2.rotation.z = -0.14;
  hatGroup.add(hatCone2);

  // Crease wrinkle 2
  const wrinkle2 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.015, 4, 10), innerRobeMat);
  wrinkle2.position.set(-0.01, 0.29, -0.01);
  wrinkle2.rotation.x = Math.PI / 2 - 0.1;
  hatGroup.add(wrinkle2);

  // Segment 3 (mid-upper sag fold S-curving forward and right)
  const hatCone3 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.22, 8), robeMat);
  hatCone3.position.set(0.02, 0.56, 0.01);
  hatCone3.rotation.x = 0.25;
  hatCone3.rotation.z = 0.12;
  hatGroup.add(hatCone3);

  // Segment 4 (drooping tip curving down and backward)
  const hatTip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.25, 7), robeMat);
  hatTip.position.set(0.01, 0.73, -0.06);
  hatTip.rotation.x = -0.38;
  hatTip.rotation.z = -0.25;
  hatGroup.add(hatTip);

  group.add(hatGroup);

  // ── 3. Left Arm & Floating Spellcasting Orb (Active Magic Off-Hand) ──
  // Upper arm: elevated forward and slightly upward
  const armLeftGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.26, 6);
  const leftUpperArm = new THREE.Mesh(armLeftGeo, innerRobeMat);
  leftUpperArm.position.set(-0.34, 1.04, 0.08);
  leftUpperArm.rotation.z = 0.55;
  leftUpperArm.rotation.x = 0.35;
  group.add(leftUpperArm);

  // Wide flared bell sleeve (expanding forward)
  const sleeveLeftGeo = new THREE.CylinderGeometry(0.18, 0.09, 0.34, 7);
  const leftSleeve = new THREE.Mesh(sleeveLeftGeo, robeMat);
  leftSleeve.position.set(-0.46, 1.02, 0.22);
  leftSleeve.rotation.x = 1.15; // points forward and up
  leftSleeve.rotation.z = 0.30;
  group.add(leftSleeve);

  const sleeveLeftTrim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.016, 4, 8), goldTrimMat);
  sleeveLeftTrim.position.set(-0.46, 1.02, 0.22);
  sleeveLeftTrim.rotation.x = 1.15;
  sleeveLeftTrim.rotation.z = 0.30;
  group.add(sleeveLeftTrim);

  // Open palm hand pointing upward
  const handGeo = new THREE.SphereGeometry(0.055, 6, 6);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(-0.48, 1.05, 0.38);
  group.add(leftHand);

  // Floating Spell Energy Orb (hovering above open palm)
  const spellGroup = new THREE.Group();
  spellGroup.position.set(-0.48, 1.24, 0.38);

  // Glowing translucent cyan/violet core
  const spellCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 1), spellOrbMat);
  spellCore.userData.isSpellCore = true;
  spellGroup.add(spellCore);

  // Inner energy octahedron (counter-rotating)
  const spellInner = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), crystalMat);
  spellInner.userData.isSpellInner = true;
  spellGroup.add(spellInner);

  // Magenta Orbital Energy Ring 1
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 4, 16), spellRingMat);
  ring1.rotation.x = Math.PI / 3;
  ring1.userData.isSpellRing1 = true;
  spellGroup.add(ring1);

  // Cyan Orbital Energy Ring 2
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.010, 4, 16), spellOrbMat);
  ring2.rotation.y = Math.PI / 4;
  ring2.userData.isSpellRing2 = true;
  spellGroup.add(ring2);

  // Swirling energy particle motes around orb
  for (let i = 0; i < 4; i++) {
    const mote = new THREE.Mesh(new THREE.OctahedronGeometry(0.02, 0), i % 2 === 0 ? spellOrbMat : spellRingMat);
    const angle = (i / 4) * Math.PI * 2;
    mote.position.set(Math.cos(angle) * 0.16, Math.sin(angle * 2) * 0.04, Math.sin(angle) * 0.16);
    mote.userData.isSpellMote = true;
    mote.userData.moteAngle = angle;
    mote.userData.moteSpeed = 2.0 + i * 0.4;
    mote.userData.moteRadius = 0.16;
    spellGroup.add(mote);
  }

  // Soft flickering PointLight illuminating hand, sleeve, and beard
  const spellLight = new THREE.PointLight(0x22d3ee, 2.6, 3.2);
  spellGroup.add(spellLight);
  group.add(spellGroup);

  // ── 4. Right Arm & Gnarled Wooden Staff with Glowing Crystal Claw ──
  const rightUpperArm = new THREE.Mesh(armLeftGeo, innerRobeMat);
  rightUpperArm.position.set(0.36, 1.02, 0.05);
  rightUpperArm.rotation.z = -0.32;
  rightUpperArm.rotation.x = 0.22;
  group.add(rightUpperArm);

  const rightSleeve = new THREE.Mesh(sleeveLeftGeo, robeMat);
  rightSleeve.position.set(0.44, 0.88, 0.16);
  rightSleeve.rotation.x = 0.70;
  rightSleeve.rotation.z = -0.25;
  group.add(rightSleeve);

  const sleeveRightTrim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 4, 8), goldTrimMat);
  sleeveRightTrim.position.set(0.44, 0.88, 0.16);
  sleeveRightTrim.rotation.x = 0.70;
  sleeveRightTrim.rotation.z = -0.25;
  group.add(sleeveRightTrim);

  // Hand gripping the staff
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0.50, 0.86, 0.26);
  group.add(rightHand);

  // Gnarled Crooked Staff Group
  const staffGroup = new THREE.Group();
  staffGroup.position.set(0.52, 0, 0.26);

  // Staff Lower Segment (ground up to grip)
  const poleLower = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.042, 0.92, 6), woodStaffMat);
  poleLower.position.set(0, 0.38, 0);
  poleLower.rotation.z = 0.04;
  staffGroup.add(poleLower);

  // Staff Mid Segment (crooked near hand grip with wooden knot branch)
  const poleMid = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.65, 6), woodStaffMat);
  poleMid.position.set(0.02, 0.98, -0.01);
  poleMid.rotation.z = -0.05;
  staffGroup.add(poleMid);

  // Wooden branch knot
  const branchKnot = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 4), woodStaffMat);
  branchKnot.position.set(0.06, 0.84, -0.02);
  branchKnot.rotation.z = -Math.PI / 3;
  staffGroup.add(branchKnot);

  // Staff Upper Segment (ascending towards head)
  const poleUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.68, 6), woodStaffMat);
  poleUpper.position.set(-0.01, 1.55, 0.01);
  poleUpper.rotation.z = 0.03;
  staffGroup.add(poleUpper);

  // Staff Head: Golden Claw / Cage holding Crystal
  const cageBase = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 5, 10), staffCageMat);
  cageBase.position.set(-0.01, 1.84, 0.01);
  cageBase.rotation.x = Math.PI / 2;
  staffGroup.add(cageBase);

  // 4 Golden Claw prongs enclosing the crystal
  for (let i = 0; i < 4; i++) {
    const prong = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.03), staffCageMat);
    const angle = (i / 4) * Math.PI * 2;
    prong.position.set(-0.01 + Math.cos(angle) * 0.065, 1.94, 0.01 + Math.sin(angle) * 0.065);
    prong.rotation.y = angle;
    prong.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.12;
    staffGroup.add(prong);
  }

  // Large Multifaceted Translucent Crystal Jewel
  const crystalGeo = new THREE.OctahedronGeometry(0.12, 0);
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.set(-0.01, 1.96, 0.01);
  crystal.scale.set(0.85, 1.85, 0.85); // elongated crystal
  crystal.userData.isStaffCrystal = true;
  staffGroup.add(crystal);

  // Internal Crystal PointLight
  const crystalLight = new THREE.PointLight(0xa855f7, 2.8, 3.8);
  crystalLight.position.set(-0.01, 1.96, 0.01);
  staffGroup.add(crystalLight);

  // Floating Ascending Spark Motes from Staff Crystal
  for (let i = 0; i < 4; i++) {
    const mote = new THREE.Mesh(new THREE.OctahedronGeometry(0.022, 0), i % 2 === 0 ? crystalMat : spellOrbMat);
    mote.userData.isStaffMote = true;
    mote.userData.moteAngle = (i / 4) * Math.PI * 2;
    mote.userData.moteSpeed = 1.4 + i * 0.3;
    mote.userData.baseY = 2.08 + i * 0.08;
    staffGroup.add(mote);
  }

  group.add(staffGroup);

  // Enable shadow casting & receiving across all meshes
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return group;
}

// ─── The Component ─────────────────────────────────────────────────
export function HeroModelViewer({ heroId }: HeroModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    animId: number;
    heroGroup: THREE.Group | null;
    clock: THREE.Clock;
    isDragging: boolean;
    prevMouse: { x: number; y: number };
    rotationY: number;
    targetRotationY: number;
    disposed: boolean;
  } | null>(null);

  const buildScene = useCallback((container: HTMLDivElement, hId: string) => {
    // Clean up old scene if present
    if (sceneRef.current) {
      sceneRef.current.disposed = true;
      cancelAnimationFrame(sceneRef.current.animId);
      sceneRef.current.renderer.dispose();
      sceneRef.current.renderer.forceContextLoss();
      sceneRef.current.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (sceneRef.current.renderer.domElement.parentElement) {
        sceneRef.current.renderer.domElement.remove();
      }
      sceneRef.current = null;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Style the canvas to layer on top of CSS background
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.borderRadius = '20px';
    renderer.domElement.style.pointerEvents = 'auto';

    // ── Scene ──
    const scene = new THREE.Scene();

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.15, 3.8);
    camera.lookAt(0, 0.72, 0);

    const isWarrior = hId === 'warrior';

    // ── Scene Lighting & Visual Balance ──
    // 1. Hemisphere Light (Amplified for Mage: white sky + dark indigo ground 0x111827 at 1.4 intensity)
    const hemiGroundColor = isWarrior ? 0x1e293b : 0x111827;
    const hemiIntensity = isWarrior ? 1.2 : 1.4;
    const hemiLight = new THREE.HemisphereLight(0xffffff, hemiGroundColor, hemiIntensity);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    // 2. Ambient light (subtle fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, isWarrior ? 0.25 : 0.35);
    scene.add(ambientLight);

    // 3. Key Light (Directional, hits from top-front-right, casts shadow onto pedestal)
    const keyLight = new THREE.DirectionalLight(0xfff8ee, isWarrior ? 1.8 : 1.7);
    keyLight.position.set(3.2, 5.0, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -1;
    keyLight.shadow.bias = -0.001;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);

    // 4. Rim Light:
    // Warrior: Amber point light behind hero (0xf59e0b)
    // Mage: Dramatic cyan back/rim light catching edge of hat, cape, and staff from behind-left (0x06b6d4, 2.5, 5)
    const rimLight = isWarrior
      ? new THREE.PointLight(0xf59e0b, 3.6, 7.5)
      : new THREE.PointLight(0x06b6d4, 2.5, 5.0);
    rimLight.position.set(isWarrior ? 0 : -1.4, isWarrior ? 1.6 : 2.0, isWarrior ? -1.8 : -1.6);
    rimLight.castShadow = false;
    scene.add(rimLight);

    // 5. Front fill light (soft cool fill from front-left)
    const fillLight = new THREE.DirectionalLight(isWarrior ? 0x94a3b8 : 0x818cf8, 0.45);
    fillLight.position.set(-3.0, 2.0, 3.0);
    scene.add(fillLight);

    // 6. Soft ambient fill for mage's upper robes
    if (!isWarrior) {
      const faceFillLight = new THREE.PointLight(0x818cf8, 0.25, 2.5);
      faceFillLight.position.set(0, 1.30, 0.85);
      scene.add(faceFillLight);
    }

    // ── Ground Pedestal ──
    const groundGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.12, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a20,
      roughness: 0.85,
      metalness: 0.15,
      flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, -0.18, 0);
    ground.receiveShadow = true;
    ground.castShadow = false;
    scene.add(ground);

    // Pedestal edge ring
    const edgeGeo = new THREE.TorusGeometry(1.3, 0.025, 8, 32);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: isWarrior ? 0x8b4513 : 0x7c3aed,
      roughness: 0.4,
      metalness: 0.6,
      emissive: isWarrior ? 0x442200 : 0x4c1d95,
      emissiveIntensity: 0.5,
      flatShading: true,
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.set(0, -0.11, 0);
    edge.rotation.x = Math.PI / 2;
    scene.add(edge);

    // Shadow-catching ground plane (transparent, only renders shadow)
    const shadowPlaneGeo = new THREE.PlaneGeometry(6, 6);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.11;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ── Hero Model ──
    const heroGroup = isWarrior ? createWarriorModel() : createMageModel();
    scene.add(heroGroup);

    // ── State ──
    const state = {
      renderer,
      scene,
      camera,
      animId: 0,
      heroGroup,
      clock: new THREE.Clock(),
      isDragging: false,
      userHasDragged: false,
      dragBaseAngle: -0.35,
      prevMouse: { x: 0, y: 0 },
      rotationY: -0.35,
      targetRotationY: -0.35,
      disposed: false,
    };
    sceneRef.current = state;

    // ── Mouse / Touch interaction (360 Drag rotation) ──
    const onPointerDown = (e: PointerEvent) => {
      state.isDragging = true;
      state.userHasDragged = true;
      state.prevMouse = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.prevMouse.x;
      state.dragBaseAngle += dx * 0.008;
      state.targetRotationY = state.dragBaseAngle;
      state.prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      state.isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.style.cursor = 'grab';

    const cleanupListeners = () => {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    // ── Resize observer ──
    const resizeObserver = new ResizeObserver((entries) => {
      if (state.disposed) return;
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    // ── Animation Loop ──
    const animate = () => {
      if (state.disposed) return;
      state.animId = requestAnimationFrame(animate);
      const elapsed = state.clock.getElapsedTime();

      // Subtle heroic sway when not dragging
      if (!state.isDragging) {
        if (!state.userHasDragged) {
          state.targetRotationY = -0.35 + Math.sin(elapsed * 0.7) * 0.22;
        } else {
          state.targetRotationY = state.dragBaseAngle + Math.sin(elapsed * 0.7) * 0.08;
        }
      }
      // Smooth lerp rotation
      state.rotationY += (state.targetRotationY - state.rotationY) * 0.08;

      if (state.heroGroup) {
        state.heroGroup.rotation.y = state.rotationY;

        // Subtle idle bobbing (breathing)
        state.heroGroup.position.y = Math.sin(elapsed * 1.6) * 0.03;

        // Dynamic Magical VFX animation (Spell Orb, Rings, Staff Motes)
        state.heroGroup.traverse((child) => {
          if (child.userData.isSpellCore) {
            child.rotation.y = elapsed * 1.8;
            child.rotation.x = elapsed * 1.2;
            const s = 1.0 + Math.sin(elapsed * 4.5) * 0.07;
            child.scale.set(s, s, s);
          } else if (child.userData.isSpellInner) {
            child.rotation.y = -elapsed * 2.4;
            child.rotation.z = elapsed * 1.6;
          } else if (child.userData.isSpellRing1) {
            child.rotation.z = elapsed * 2.8;
          } else if (child.userData.isSpellRing2) {
            child.rotation.x = elapsed * 2.2;
            child.rotation.y = elapsed * 1.9;
          } else if (child.userData.isSpellMote) {
            const a = child.userData.moteAngle + elapsed * child.userData.moteSpeed;
            const r = child.userData.moteRadius;
            child.position.x = Math.cos(a) * r;
            child.position.z = Math.sin(a) * r;
            child.position.y = Math.sin(elapsed * 3.5 + child.userData.moteAngle) * 0.04;
          } else if (child.userData.isStaffCrystal) {
            const pulse = 1.0 + Math.sin(elapsed * 2.8) * 0.035;
            child.scale.set(0.85 * pulse, 1.85 * pulse, 0.85 * pulse);
          } else if (child.userData.isStaffMote) {
            const t = (elapsed * child.userData.moteSpeed) % 1.0;
            const a = child.userData.moteAngle + elapsed * 1.5;
            child.position.x = -0.01 + Math.cos(a) * 0.07;
            child.position.z = 0.01 + Math.sin(a) * 0.07;
            child.position.y = child.userData.baseY + t * 0.22;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      state.disposed = true;
      cancelAnimationFrame(state.animId);
      cleanupListeners();
      resizeObserver.disconnect();
      renderer.dispose();
      renderer.forceContextLoss();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (renderer.domElement.parentElement) {
        renderer.domElement.remove();
      }
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const cleanup = buildScene(mountRef.current, heroId);
    return cleanup;
  }, [heroId, buildScene]);

  return (
    <div
      ref={mountRef}
      className="hero-model-viewer"
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '20px',
        overflow: 'hidden',
        zIndex: 5,
      }}
    />
  );
}
