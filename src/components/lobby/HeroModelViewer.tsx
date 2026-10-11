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

// ─── Procedural Mage Mesh ──────────────────────────────────────────
function createMageModel(): THREE.Group {
  const group = new THREE.Group();

  const robeMat = new THREE.MeshStandardMaterial({
    color: 0x2d1b69,
    roughness: 0.7,
    metalness: 0.1,
    flatShading: true,
  });
  const robeAccentMat = new THREE.MeshStandardMaterial({
    color: 0x4a2d8a,
    roughness: 0.6,
    metalness: 0.2,
    flatShading: true,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdeb887,
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  });
  const staffMat = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.8,
    metalness: 0.15,
    flatShading: true,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    emissive: 0x818cf8,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.9,
    flatShading: true,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xaabbff,
    emissive: 0x8888ff,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.1,
    flatShading: true,
  });

  // Robe body (flowing, wider at bottom)
  const robeGeo = new THREE.CylinderGeometry(0.22, 0.44, 1.0, 8);
  const robe = new THREE.Mesh(robeGeo, robeMat);
  robe.position.set(0, 0.5, 0);
  group.add(robe);

  // Robe trim / belt sash
  const sashGeo = new THREE.TorusGeometry(0.28, 0.03, 6, 12);
  const sash = new THREE.Mesh(
    sashGeo,
    new THREE.MeshStandardMaterial({ color: 0xc8a84e, roughness: 0.5, metalness: 0.6, flatShading: true })
  );
  sash.position.set(0, 0.75, 0);
  sash.rotation.x = Math.PI / 2;
  group.add(sash);

  // Head
  const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.28, 0);
  group.add(head);

  // Wizard hat (cone + brim)
  const hatGeo = new THREE.ConeGeometry(0.2, 0.48, 8);
  const hat = new THREE.Mesh(hatGeo, robeMat);
  hat.position.set(0, 1.68, 0);
  hat.rotation.z = 0.1;
  group.add(hat);

  const brimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.03, 12);
  const brim = new THREE.Mesh(brimGeo, robeAccentMat);
  brim.position.set(0, 1.42, 0);
  group.add(brim);

  // Glowing eyes
  const eyeGeo = new THREE.SphereGeometry(0.035, 6, 6);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.07, 1.3, 0.17);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.07, 1.3, 0.17);
  group.add(rightEye);

  // Arms (covered by sleeves)
  const sleeveGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.4, 6);

  const leftSleeve = new THREE.Mesh(sleeveGeo, robeMat);
  leftSleeve.position.set(-0.32, 0.85, 0);
  leftSleeve.rotation.z = 0.5;
  group.add(leftSleeve);

  const rightSleeve = new THREE.Mesh(sleeveGeo, robeMat);
  rightSleeve.position.set(0.32, 0.85, 0.05);
  rightSleeve.rotation.z = -0.6;
  rightSleeve.rotation.x = -0.15;
  group.add(rightSleeve);

  // Hand (right, holding staff)
  const handGeo = new THREE.SphereGeometry(0.06, 6, 6);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0.42, 0.6, 0.12);
  group.add(rightHand);

  // Staff (tall wooden pole + crystal orb)
  const staffGroup = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.025, 0.035, 1.6, 6);
  const pole = new THREE.Mesh(poleGeo, staffMat);
  pole.position.set(0, 0.8, 0);
  staffGroup.add(pole);

  // Crystal orb (glowing)
  const crystalGeo = new THREE.OctahedronGeometry(0.12, 0);
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.set(0, 1.65, 0);
  crystal.rotation.y = Math.PI / 4;
  staffGroup.add(crystal);

  // Crystal glow point light
  const crystalLight = new THREE.PointLight(0x818cf8, 2.5, 3);
  crystalLight.position.set(0, 1.65, 0);
  staffGroup.add(crystalLight);

  // Staff cradle (holding crystal)
  const cradleGeo = new THREE.TorusGeometry(0.09, 0.015, 4, 6);
  const cradle = new THREE.Mesh(cradleGeo, staffMat);
  cradle.position.set(0, 1.58, 0);
  cradle.rotation.x = Math.PI / 2;
  staffGroup.add(cradle);

  staffGroup.position.set(0.44, 0, 0.12);
  staffGroup.rotation.z = -0.06;
  group.add(staffGroup);

  // Floating spell runes (orbiting particles)
  for (let i = 0; i < 3; i++) {
    const runeGeo = new THREE.SphereGeometry(0.025, 4, 4);
    const runeMat = new THREE.MeshStandardMaterial({
      color: 0xaa88ff,
      emissive: 0x8866ff,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.7,
      flatShading: true,
    });
    const rune = new THREE.Mesh(runeGeo, runeMat);
    const angle = (i / 3) * Math.PI * 2;
    rune.position.set(Math.cos(angle) * 0.5, 0.9, Math.sin(angle) * 0.5);
    rune.userData.orbitAngle = angle;
    rune.userData.orbitSpeed = 0.8 + i * 0.2;
    rune.userData.orbitRadius = 0.5;
    rune.userData.isRune = true;
    group.add(rune);
  }

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

    // ── Scene Lighting & Visual Balance ──
    // 1. Hemisphere Light (Fix dark silhouette: white sky + dark slate ground at 1.2 intensity)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    // 2. Ambient light (subtle fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    // 3. Key Light (Directional, hits from top-front-right, casts shadow)
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.8);
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

    // 4. Rim Light: Amber/warm-orange point light behind the hero (0xf59e0b)
    const isWarrior = hId === 'warrior';
    const rimColor = isWarrior ? 0xf59e0b : 0xa855f7;
    const rimLight = new THREE.PointLight(rimColor, 3.6, 7.5);
    rimLight.position.set(0, 1.6, -1.8);
    rimLight.castShadow = false;
    scene.add(rimLight);

    // 5. Front fill light (soft cool fill from front-left)
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.45);
    fillLight.position.set(-3.0, 2.0, 3.0);
    scene.add(fillLight);

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
      color: isWarrior ? 0x8b4513 : 0x443399,
      roughness: 0.4,
      metalness: 0.6,
      emissive: isWarrior ? 0x442200 : 0x221155,
      emissiveIntensity: 0.4,
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

        // Animate mage runes if present
        state.heroGroup.children.forEach((child) => {
          if (child.userData.isRune) {
            const a = child.userData.orbitAngle + elapsed * child.userData.orbitSpeed;
            const r = child.userData.orbitRadius;
            child.position.set(
              Math.cos(a) * r,
              0.9 + Math.sin(elapsed * 2 + child.userData.orbitAngle) * 0.08,
              Math.sin(a) * r
            );
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
