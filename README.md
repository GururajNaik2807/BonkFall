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

- **`src/components/lobby/LobbyLayout.tsx`**: An immersive, full-viewport Single Page Application (SPA) dashboard. Features a persistent Navigation Rail to smoothly hot-swap between Home, Hero Select, Settings, and Archives without breaking the game flow.
- **`src/engine/Game.ts`**: The core orchestrator. Manages the `requestAnimationFrame` loop, camera zoom tracking, entity updates, wave spawning, and collision logic. Features built-in custom Frame Capping (e.g., 60/144 FPS toggles). It communicates back to React solely through a `Snapshot` interface.
- **`src/engine/AudioManager.ts`**: A robust, layered polyphonic audio engine built on the Web Audio API. It supports external `.mp3` loading while featuring high-fidelity, procedurally generated synthesis fallbacks for weapon strikes and vocal exertions. It implements pitch-jitter, shuffle-bags (anti-repetition), and probabilistic cadence throttling.
- **`src/engine/Overlay.ts`**: A zero-garbage-collection overlay manager. It handles a completely decoupled, hardware-accelerated Minimap and a throttled FPS indicator to keep DOM repaints to a minimum. 
- **`src/entities/`**: Contains autonomous game actors:
  - `Warrior.ts` & `Mage.ts`: The heroes, featuring unique movement, fluid combat (no root-lock), and combo state machines.
  - `Enemy.ts`: The terrifying swarm logic. Includes boids-like separation forces, knockback velocity physics, and procedural horror rendering.
  - `Abilities.ts`: A modular active-ability system supporting Orbiting Orbs, Chain Lightning, and Fire Auras.
- **`src/effects/`**: The "Game Juice" layer (`KineticSlash`, `SparkParticle`, `HitImpact`, `BloodSplatter`, `ScreenShake`, Hit-Stops). Completely decoupled and managed globally.
- **`src/data/upgrades.ts`**: A scalable roguelite progression registry defining stat boosts and active powerups.
- **`src/config/characters.ts`**: A declarative schema for rendering High-Fidelity Pixel Art heroes dynamically into the UI (including their stats, specific UI glow `accentColor`, and dynamic SVG silhouetting).
- **`src/App.tsx` & `src/styles.css`**: The React DOM overlay. Handles the Lobby Dashboard, HUD, pause screens, and level-up drafting modals.

---

## 🦑 Procedural Horror & Combat Juice

The enemies and combat mechanics in Bonkfall V2 have been meticulously designed to feel terrifying and incredibly punchy:

* **Procedural Wriggling:** Enemies are drawn dynamically using vertex jitter driven by sine waves (`performance.now()`), creating a sickening, writhing appearance with piercing slit eyes tracking the player.
* **Distinct Archetypes:** 
  * *Swarmers:* Fast, spiky arachnid-like creatures with rapidly twitching legs.
  * *Brutes:* High-mass, asymmetric jagged squares.
  * *Ranged/Elites:* Purple elites and ranged stalkers that fire targeted projectiles.
* **Massive Combat Feel (Juice):** 
  * Heavy melee strikes trigger **Hit-Stop** (micro frame-freezes), dynamic screen shakes, and sharp `KineticSlash` pixel-art trails.
  * Hitting an enemy applies directional knockback, preventing unfair stacking.
  * Taking damage causes enemies to briefly flash pure white and physically deform using a **Squash and Stretch** scaling tween.
  * Dying enemies explode into decaying `BloodSplatter` particles that retain their physical momentum.
* **Dynamic Audio Layers:** 
  * Every attack fires two synchronized audio layers: an FX layer (sword slash/spell whoosh) and an Exertion layer (vocal grunt/chant).
  * Audio pools use a Shuffle Bag and heavy pitch modulation (±8%) to prevent player fatigue, ensuring no two attacks sound perfectly alike.
  * Fully integrated global **Mute State** toggled directly from the Dashboard.

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
