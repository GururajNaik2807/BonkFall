# BonkFall — Product Requirements Document

> A fast, chaotic 2D survival game where movement, positioning, upgrades, and escalating enemy pressure determine how long you survive.

## 1. Product Overview

BonkFall is a 2D top-down survival action game inspired by the accessible gameplay loop of survivor-style games.

The player controls a character inside a large continuously active world. Enemies spawn around the player, chase them, and become progressively more dangerous. The player survives by moving intelligently, automatically attacking nearby enemies, collecting experience, leveling up, and selecting powerful upgrades.

The game should prioritize:

- Responsive movement
- Satisfying combat
- Clear enemy feedback
- Meaningful progression
- Increasing difficulty
- Strong visual feedback
- Short, replayable runs
- Stable performance

The goal is not to create a technically complicated game. The goal is to make a small game feel polished, readable, responsive, and fun.

---

# 2. Core Game Loop

```text
                ┌───────────────────┐
                │   START RUN       │
                └─────────┬─────────┘
                          ↓
                ┌───────────────────┐
                │ Explore / Move    │
                │ Around the World  │
                └─────────┬─────────┘
                          ↓
                ┌───────────────────┐
                │ Enemies Spawn     │
                │ & Chase Player    │
                └─────────┬─────────┘
                          ↓
                ┌───────────────────┐
                │ Auto Combat       │
                │ / Player Attacks  │
                └─────────┬─────────┘
                          ↓
                ┌───────────────────┐
                │ Enemies Defeated  │
                └─────────┬─────────┘
                          ↓
                ┌───────────────────┐
                │ XP Gems Dropped   │
                └─────────┬─────────┘
                          ↓
                    Level Up?
                     /      \
                   No        Yes
                   │          ↓
                   │   ┌───────────────┐
                   │   │ Choose 1 of 3 │
                   │   │ Power-ups     │
                   │   └───────┬───────┘
                   │           ↓
                   └────→ Continue Run
                               ↓
                     Difficulty Increases
                               ↓
                    Survive / Defeat Boss
                               ↓
                    Victory / Game Over