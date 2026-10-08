# BONKFALL — TODO

> **RULE:** Gameplay > visuals > effects. Every new system must remain lightweight and must not compromise the 60 FPS target.

## ⚡ 1. PERFORMANCE FIRST
- [ ] Keep game simulation inside Phaser; React only for UI.
- [ ] Add object pooling for enemies, projectiles, XP, damage numbers and effects.
- [ ] Avoid unnecessary allocations inside `update()`.
- [ ] Use distance-squared checks instead of expensive distance calculations where possible.
- [ ] Optimize enemy spawning and proximity/target searches.
- [ ] Cap active enemies/projectiles/effects.
- [ ] Use lightweight sprites/animations and avoid excessive particles.
- [ ] Keep 60 FPS target on normal laptops.
- [ ] Add simple FPS/performance debug mode.

## ⚔️ 2. REAL WARRIOR CHARACTER
- [X] Add idle, walk and attack animations.
- [X] Character should **face the enemy being attacked**.
- [X] Sword swing direction must match target direction.
- [X] Add attack anticipation → swing → hit timing.
- [ ] Add small hit reaction/impact feedback.
- [ ] Keep character readable at normal gameplay zoom.

## 👹 3. ENEMY QUALITY
- [ ] Give each enemy a distinct silhouette.
- [ ] Add basic idle/walk/attack animations.
- [ ] Enemies should visibly face the player.
- [ ] Add melee attack wind-up and hit feedback.
- [ ] Add different enemy movement speeds and attack ranges.
- [ ] Avoid spawning enemies directly on top of the player.

## 💥 4. COMBAT FEEL
- [ ] Target nearest valid enemy automatically.
- [ ] Character turns toward target before attacking.
- [ ] Add attack cooldown + attack range.
- [ ] Add damage numbers.
- [ ] Add hit flash / small impact effect.
- [ ] Add enemy death animation/effect.
- [ ] Add critical-hit feedback.
- [ ] Make attacks feel powerful without heavy particles.

## 📈 5. PROGRESSION
- [ ] XP gems → automatic pickup.
- [ ] Level-up trigger.
- [ ] 3 randomized upgrade choices.
- [ ] Add meaningful weapon/stat upgrades.
- [ ] Add weapon evolution system later.
- [ ] Scale enemy difficulty gradually with time.

## 🗺️ 6. WORLD + MAP
- [ ] Improve terrain so the world feels like an actual 2D arena.
- [ ] Add simple environmental landmarks.
- [ ] Make minimap dynamically track player + enemies.
- [ ] Keep world rendering lightweight.
- [ ] Add map boundaries that feel natural.

## 🎮 7. GAMEPLAY POLISH
- [ ] Pause/resume.
- [ ] Death screen.
- [ ] Run completion/boss phase.
- [ ] Restart without page reload.
- [ ] Save basic progression/settings locally.
- [ ] Add keyboard + mobile-friendly controls later.

## 🔧 8. FINAL OPTIMIZATION PASS
- [ ] Test with low-end laptop hardware.
- [ ] Test 50/100/200+ enemies on screen.
- [ ] Check memory usage during long runs.
- [ ] Remove unnecessary DOM updates.
- [ ] Profile Phaser update/render performance.
- [ ] Verify no memory leaks after restarting runs.
- [ ] Only add visual effects that have measurable gameplay value.
