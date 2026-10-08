# ⚔️ Bonkfall V2

<p align="center">
  <strong>A lightweight, high-performance 2D browser survival game built with a Custom Vanilla Canvas Engine and React.</strong>
</p>

---

## 📖 Overview

**Bonkfall V2** is an open-source browser game inspired by the **survivor-like and roguelite** genres, thrusting players into a dark, horror-fantasy world. 

The objective is simple: survive escalating waves of procedurally drawn, terrifying enemies, collect experience points (XP), choose randomized stat upgrades, and build an unstoppable character during every run. 

The project is intentionally engineered from the ground up to remain **lightweight, performant, and highly extensible**. It utilizes a custom Vanilla Canvas rendering engine decoupled entirely from the React DOM UI, guaranteeing buttery smooth 60fps performance even with massive swarms of monsters.

---

## 📂 Architecture & Structure

The codebase is highly modular, split between the high-frequency game loop and static React overlays:

- **`src/engine/Game.ts`**: The core orchestrator. Manages the `requestAnimationFrame` loop, camera zoom tracking, entity updates, wave spawning, and collision logic. It communicates back to React solely through a `Snapshot` interface.
- **`src/entities/`**: Contains autonomous game actors:
  - `Warrior.ts` & `Mage.ts`: The heroes, featuring unique movement and attack state machines.
  - `Enemy.ts`: The terrifying swarm logic. Includes boids-like separation forces, knockback velocity physics, and procedural horror rendering.
  - `Projectiles.ts`: Manages Magic Missiles and targeted Enemy Projectiles.
- **`src/effects/`**: The "Game Juice" layer (`HitImpact`, `BloodSplatter`, `ScreenShake`, `FloatingText`). Completely decoupled and managed globally to keep entity files clean.
- **`src/App.tsx` & `src/styles.css`**: The React DOM overlay. Handles character selection, the dark-fantasy HUD, pause screens (with deep blur layers), and the final run results. React re-renders are kept strictly isolated from the 60hz game canvas.

---

## 🦑 Procedural Horror & Enemy Design

The enemies in Bonkfall V2 have been meticulously designed to look dynamic and terrifying without relying on heavy or rigid sprite sheets:

* **Procedural Wriggling:** Enemies are drawn dynamically on the canvas using vertex jitter driven by sine waves (`performance.now()`), creating a sickening, writhing appearance.
* **Orientation & Glare:** The monsters track their movement angle and accurately rotate their bodies to face the player. Piercing red/amber slit eyes dynamically glare forward.
* **Distinct Archetypes:** 
  * *Swarmers:* Fast, spiky arachnid-like creatures with rapidly twitching legs.
  * *Brutes:* High-mass, asymmetric jagged squares with multiple chaotic pinpoint eyes.
  * *Stalkers:* Floating parasite eyeballs with undulating tail tendrils trailing their movement vector.
* **Combat Juice:** 
  * Heavy hits trigger dynamic screen shakes and spawn bright red floating damage numbers.
  * Taking damage causes enemies to briefly flash pure white and physically deform using a **Squash and Stretch** scaling tween.
  * Dying enemies don't just vanish—they explode into decaying `BloodSplatter` particles that retain their physical momentum.

---

## ⚡ Performance Philosophy

* **Custom Canvas Renderer:** By rendering strictly to a 2D canvas context using paths and gradients, the game bypasses DOM layout overhead entirely.
* **Boids Flocking:** Enemies utilize optimized spatial proximity checks, pushing away from one another so they swarm naturally as a horde rather than stacking perfectly on top of each other.
* **UI Isolation:** React only updates via an intermittent data snapshot. Zero DOM interference happens during active combat sequences.

---

## 🛠️ Local Development

### Prerequisites
* [Node.js](https://nodejs.org) (LTS Version recommended)
* NPM (Injected natively with Node)
* A modern, hardware-accelerated web browser

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bonkfall.git
   cd bonkfall
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Launch the development server:**
   ```bash
   npm run dev
   ```

4. **Play the game:**  
   Open your browser and navigate to the local hosting port printed by Vite (typically `http://localhost:5173`).

---

## 🤝 Contributing

We welcome contributions from developers, artists, and designers! If you want to help make Bonkfall V2 better, follow these steps:

1. **Fork** the repository to your own account.
2. Create a clean **feature branch** (`git checkout -b feature/AmazingFeature`).
3. Commit your changes safely (`git commit -m 'Add some AmazingFeature'`).
4. **Push** your branch up to GitHub (`git push origin feature/AmazingFeature`).
5. Open a comprehensive **Pull Request** detailing your modifications.

---

## 📄 License

This project is open-source and available under the standard MIT guidelines. Feel free to use, modify, and extend the engine as you see fit.
