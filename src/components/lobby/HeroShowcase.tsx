import React, { useState, useEffect, useRef } from 'react';
import type { HeroDefinition } from '../../config/characters';
import { HERO_LIST } from '../../config/characters';
import { HeroModelViewer } from './HeroModelViewer';

interface HeroShowcaseProps {
  activeHero: HeroDefinition;
  onSelectHero: (id: string) => void;
  showStats?: boolean;
}

export function HeroShowcase({ activeHero, onSelectHero, showStats = false }: HeroShowcaseProps) {
  const playSelectSound = () => {
    try {
      const audio = new Audio('/assets/sfx/hover.wav');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // Cycle between available heroes
  const currentIndex = HERO_LIST.findIndex(h => h.id === activeHero.id);
  const cycleHero = (dir: number) => {
    playSelectSound();
    const nextIdx = (currentIndex + dir + HERO_LIST.length) % HERO_LIST.length;
    onSelectHero(HERO_LIST[nextIdx].id);
  };

  const isWarrior = activeHero.id === 'warrior';

  return (
    <div className="lobby-region-hero">
      {/* Quick Hero Selector Tabs */}
      <div className="hero-switch-bar">
        {HERO_LIST.map(hero => (
          <button
            key={hero.id}
            className={`hero-switch-pill ${activeHero.id === hero.id ? 'active' : ''}`}
            style={{
              '--hero-accent': hero.accentColor,
            } as React.CSSProperties}
            onClick={() => {
              if (activeHero.id !== hero.id) {
                playSelectSound();
                onSelectHero(hero.id);
              }
            }}
          >
            <span className="pill-icon">{hero.icon}</span>
            <span className="pill-name">{hero.name}</span>
          </button>
        ))}
      </div>

      {/* 3D Model Viewer Pedestal */}
      <div className="hero-presentation-container">
        <div className={`stone-pedestal-frame ${isWarrior ? 'theme-warrior' : 'theme-mage'}`}>
          {/* WebGL 3D Model Viewer */}
          <HeroModelViewer heroId={activeHero.id} />

          {/* Previous / Next Arrow Controls */}
          <button
            className="pedestal-nav-btn prev"
            onClick={(e) => { e.stopPropagation(); cycleHero(-1); }}
            title="Previous Hero"
            aria-label="Previous Hero"
          >
            ‹
          </button>
          <button
            className="pedestal-nav-btn next"
            onClick={(e) => { e.stopPropagation(); cycleHero(1); }}
            title="Next Hero"
            aria-label="Next Hero"
          >
            ›
          </button>
        </div>
      </div>

      {/* Dynamic Hero Nameplate & Class Role */}
      <div className="hero-nameplate">
        <div className="hero-role-badge" style={{ color: activeHero.accentColor, borderColor: `${activeHero.accentColor}55` }}>
          {activeHero.title}
        </div>
        <h2>{activeHero.name}</h2>
        <span className="hero-perk-summary">
          <i style={{ color: activeHero.accentColor }}>✦</i> {activeHero.startingPerk}
        </span>
      </div>

      {/* Extended Hero Stats (shown in Heroes Tab) */}
      {showStats && (
        <div className="active-hero-stats">
          <div className="stat-row">
            <span>Health</span>
            <div className="bar"><div className="fill" style={{ width: `${(activeHero.stats.health / 150) * 100}%` }} /></div>
            <span className="val">{activeHero.stats.health}</span>
          </div>
          <div className="stat-row">
            <span>Speed</span>
            <div className="bar"><div className="fill" style={{ width: `${activeHero.stats.speed}%` }} /></div>
            <span className="val">{activeHero.stats.speed}</span>
          </div>
          <div className="stat-row">
            <span>Damage</span>
            <div className="bar"><div className="fill" style={{ width: `${(activeHero.stats.damage / 30) * 100}%` }} /></div>
            <span className="val">{activeHero.stats.damage}</span>
          </div>
          <div className="stat-row">
            <span>Range</span>
            <span className="val-text" style={{ color: activeHero.accentColor }}>{activeHero.stats.range}</span>
          </div>
        </div>
      )}
    </div>
  );
}

