# Core Rulebook gap analysis (engine vs. book)

> NOTA (v487): este análisis es del 2026-11-09 y está en su mayor parte superado (Escaramuzadores, destacamentos, BS 6+, fuego indirecto, Cuidado señor, etc. ya implementados). Verificar cada punto contra el motor actual antes de trabajar en él.

Scope: core rules only (no army-book rules). The engine is `app/js/rules.js`; line numbers refer to the file as of 2026-11-09.
Book references: `core.txt Lnnnn` is the line in `rules/core.txt`. "p." is the printed page. The spec_*.md files cite PDF pages, which are printed page + 1.
Impact: **HIGH** = changes the outcome of most games or of common interactions. **MED** = noticeable in many games. **LOW** = edge case or cosmetic.

What already works (checked, no gap): to-hit, to-wound and 7+ tables; armour, ward and regen; AP and Armour Bane; Killing Blow; Multiple Wounds without spill-over; I steps with simultaneous strikes (active player first); charge I bonus of +3/+4 and its loss on a disordered charge; impact hits and stomps; supporting attacks for spears; flank and rear bonus, Disrupted by US 5+ (US 10+ against heavy infantry); rank bonus with min-per-rank and Disrupted; standard and BSB; musician tie-break; overkill; the 3-way break test with the >2x US rule; Stubborn, Unbreakable, Unstable, Shieldwall; terror -1 Ld on break; follow-up and pursuit at 2D6 (+D6 Swiftstride); overrun; panic (25% in a phase, friend destroyed or breaking within 6", fled-through, one test per phase); rally with -1 below 50% and only on double 1 below 25%; Steadying Rhythm and Quick Time; Enemy Sighted march test; 1" rule; difficult and dangerous terrain (-1 M, discard the highest charge die, 25% Disrupted); casting 2D6+Level, Perfect Invocation and miscast table; Wizardly and Fated dispel with Unbinding and Outclassed; bound spells; challenges; VP (Matched Play version), random game length, Break Point.

---

## HIGH

### H1. Casualties in the fighting rank never reduce attacks ("Fallen Warriors" / "Stepping Forward")
- **Book:** p.147 and p.151 (core.txt L4636-4642, L4780-4800). Casualties are removed from the back rank but count as slain at the ends of the fighting rank. A fighting-rank model slain by a higher-I enemy loses its attacks. Models that step forward cannot attack that phase. Excess casualties reduce supporting attacks.
- **Engine:** `attackProfile0` L1741 sets `rankModels = min(u.models, files)`, and `atk = rankModels * a` (L1749). Models leave the rear first (`applyWounds` L422-423), so a unit with spare ranks always fights with a full front rank, whatever it lost to higher-I attacks earlier in `fightGroup` (I-step loop L1992-2113). Supporting attacks (L1751) also ignore excess casualties.
- **Effect:** Striking first is worth much less than in the book. Elves, Strike First and charging units lose their main combat edge, and large blocks are overrated.
- **Sketch:** At the start of `fightGroup`, store `u.frontLost = 0` for each unit. When applying pending wounds per I-step (L2086-2090), add the models killed to `x.e.frontLost`, capped at the fighting-rank width. The unit has not attacked yet if `info.get(e.id) < st`, or if `== st` and its owner is the inactive player (simultaneous strikes are exempt per p.147). In `attackProfile0`, use `rankModels - frontLost` for the fighting rank and `support - max(0, frontLost_total - rankModels)` for supporting attacks. Reset `frontLost` at the end of the phase.

### H2. Joined characters can never be attacked in combat outside a challenge
- **Book:** p.208 "Characters In Combat" (core.txt L7005-7030). Enemy models in base contact with a character can direct their attacks against it. Impact Hits and Stomps can target it only if the unit has fewer than 5 rank-and-file models.
- **Engine:** Every melee attack in `fightGroup` is applied to the enemy *unit* (`pending.push({ e, ... })` L2051, applied L2086-2088). A joined character only loses Wounds in `duelSwing` (L1885) or from shooting when the unit has fewer than 5 models (`applyWounds` L412-418). A character in a unit is effectively immortal in combat.
- **Effect:** Generals, BSBs and heroes cannot be killed by sniping attacks. This feeds VP (King is Dead, Trophies) and keeps Inspiring Presence and Hold Your Ground alive.
- **Sketch:** When a unit attacks an enemy that has `joinedLive` characters, the attacker (AI or player) may allocate up to `min(attackers in contact with the char, n)` attacks to the character. A cheap heuristic: allocate the champion's and characters' attacks plus up to the char's frontage share (char base width / unit width x attacks). Roll those as a separate batch with the character's WS/T/Sv and apply them through a char-specific wound path (excess does not spill over, as in `duelSwing`). If the unit has fewer than 5 R&F, also allow impact and stomp hits to be split onto characters.

### H3. Wizards cannot join units, and a unit can hold only one character
- **Book:** p.207 "Characters & Units" (core.txt L6904-6922). Most characters can join a friendly unit. *"a unit can be joined by more than one character"*. There is no Wizard exception (the only Wizard restriction is Wizards & Armour, L3397-3405 and L7573).
- **Engine:** `joinCheck` L2905 returns 'Solo los personajes sin magia pueden unirse' (only non-magic characters may join) for any `cd.wizard`. L2925 refuses a second character ('La unidad ya lleva un personaje'). `autoJoin` L2996 also skips wizards and fills only empty units.
- **Effect:** Wizards are always lone models: easy targets, with no unit-based effects such as Mob Rule or self-auras on the unit. Multi-character units (General + BSB bunker) are impossible.
- **Sketch:** Drop the `cd.wizard` clause and the single-character clause. Things to fix with it: (a) `byId(s, f.src)` in the Remains-in-Play cleanup (`beginStrategy` L2528-2529) and in the vortex filter (L2526) only searches `s.units`, so a joined caster would end its own spells. Resolve sources through hosts' `joined` as well. (b) `castCheck`/`spellTargets`/`doCast` measure from the wizard. A joined wizard needs its host's x/y; copy them as `fightGroup` L2063 does, or measure from the host. (c) Several places use `joinedLive(u)[0]` or the first char (`doLeave` L2978). Iterate over all of them. (d) Enforce "Too Many Characters" (L7025-7033): fighting-rank chars ≤ R&F models.

### H4. Charge moves teleport: no path, no wheel cost, generous charge arc
- **Book:** p.120 declaration (target at least partly in the charger's front arc, LoS). p.122 and 127-129 charge move (one wheel, maximise contact, the move is measured along the path, obstructions stop or redirect). p.129 terrain on the path. p.130 multiple charge targets.
- **Engine:** `chargeTargets` L1177-1178 accepts targets within ±0.45π (81°) of the charger's facing, from centre to centre. `doCharge` compares `unitDist(u,t)` (the straight edge-to-edge gap) with the charge range (L1290). On success, `placeCharge` (L1182) puts the unit flush on the target's facing side. Only the *final* position is checked (`checkPlacement` L1294). Units or impassable ruins in between are ignored, and so is the wheel distance needed to swing round onto a flank. Terrain on the path is detected with a single centre-to-centre segment (`pathInForest` L337, used L1279).
- **Effect:** Charges round or through blocking units, flank charges that cost no wheel, and charges at targets almost beside the charger. Screening and blocking stop working.
- **Sketch:** Build the charge path as two segments: a straight segment, plus an optional single wheel, then a straight segment to `placeCharge`'s destination. Path length = straight + θ·unitWidth (the same model as the wheel cost in `previewMove` L611). Sample the swept rectangle (reuse the `previewMove` stepping loop with `checkPlacement(..., {enemyGap:0, ignore:[t.id]})`). If it is blocked, the charge fails (or stops 1" short, p.132 (d)). Check the front arc as "any corner of the target within ±45° of the charger's front-edge corners" rather than centre ±81°. Run terrain detection along the swept path.

### H5. Terror: the charger stops dead after the target flees. Fear-causers wrongly ignore Terror
- **Book:** p.180 (core.txt L5820-5842). On a failed Terror test the target *must Flee* as its charge reaction, and the charge proceeds as against any fleeing target (run down or redirect, p.130). *"Models with the Fear special rule fear models that cause Terror. Models that cause Terror are immune to Terror."* A unit that cannot flee does not test.
- **Engine:** `doCharge` L1221-1229: the Terror test is skipped if `causesFear(t)` (so Fear-causers are immune), and after `runAway` the function `return`s. The charger keeps `u.charged = true` (L1209) but never moves, so it cannot run down the target or move at all. The Fear check (L1212 and L1945) exempts `causesFear(u)` even when the enemy causes *Terror*. The Terror test also ignores frenzy and engagement (the "cannot flee → no test" clause).
- **Sketch:** Replace the `return` after the Terror flee with a fall-through into the fleeing-target branch (the same path as `lightFlee`, L1250-1262 onward), so the charge roll and run-down happen. Change the immunity test to `!has(t,'terror')` (Terror-causers only). In the Fear checks use `!(causesFear(u) && !has(e,'terror')) && !has(u,'terror')`. Skip the Terror test if the target is engaged, Frenzied or Immune to Psychology.

---

## MED

### M1. Fighting-rank models not in base contact still use their full Attacks
- **Book:** p.147 (core.txt L4625-4630). In base contact = Attacks characteristic. In the fighting rank but not in contact = **1 attack**.
- **Engine:** `attackProfile0` L1741-1749 gives `rankModels * A` for the whole rank. Five A2 swordsmen against a single 40mm monster get 10 attacks, where the book gives roughly 2x2 + 3x1 = 7.
- **Sketch:** Compute the contact width as the overlap of the two facing edges (project the target's edge onto the attacker's contacting edge; `sideOf` already gives the side). `inContact = ceil(overlap / baseW)`, then `atk = inContact*A + (rankModels-inContact)*1`.

### M2. Charging a fleeing enemy: no redirect, failed run-down treated as failed charge, no multiple charge targets
- **Book:** p.130 (core.txt L3983-4005). Run down: if the charger does not reach the fleeing unit, it moves its full charge range (this is not a failed charge). If it catches it, it may make a Ld test to reform. Redirect: Ld test, then a new charge where the new target can only Hold or Flee. p.130 multiple charge targets (L4018-4030). p.131 multiple chargers into one arc move simultaneously.
- **Engine:** `doCharge`: when the target fled and is out of reach, it drops into the failed-charge branch (L1322-1333) and moves only `roll` inches. No redirect exists anywhere (`grep redirect` = 0). When the swept or final rectangle would touch a second enemy, `checkPlacement` fails and the charge becomes a failed charge (L1294-1295).
- **Sketch:** After the target flees: (1) if `dist <= total`, run down (already done, L1306), then add a Ld test for a free reform; (2) otherwise move straight `total` inches (not `roll`). Add a `redirect` option: on a passed Ld test, call `doCharge(s,u,newT,ev,{noSaS:true})` once, with S&S disabled via a flag. For multiple targets, if the placement overlaps another enemy, declare it as a second target and align against the primary. Any other enemy aligns to the charger and counts as a disordered charge for that pairing.

### M3. Multiple Shots (X) always fires X shots with no -1 penalty
- **Book:** p.174 (core.txt L5663-5676). Choose 1 shot, or X shots at an extra -1 To Hit. All models in the unit choose the same.
- **Engine:** `resolveShot` L913 sets `shotsN = shooters * r.shots` and adds no penalty. Data uses `shots: 2/3` for pistols (`W.pistols`, data.js L245), throwing weapons, repeaters, etc.
- **Sketch:** Mark multi-shot weapons with `sr:['multiShot']` (or treat `shots > 1` with no other dice mechanic as such). If multiple shots are used, add `need += 1`. Choose automatically by expected hits: `X*p(need+1) > p(need)`, or let the player toggle it.

### M4. Intervening models never give cover. LoS is a single centre-to-centre ray
- **Book:** p.103-104 (core.txt L3080-3095) and p.139 (L4357-4370). LoS exists if *any* line from the vision arc reaches *any* part of the target. Partial or full cover comes from "terrain **or other models**" (more than half of the target's models obscured = full cover).
- **Engine:** `losClear` L642-657 samples one segment between unit centres. Any unit on that line blocks LoS completely; otherwise there is none. Characters and flyers never block (L648, contrary to "models always block"). `coverMod` L752-763 only checks forests.
- **Sketch:** Sample N=5 rays from points along the shooter's front edge to N points along the target's facing edge (`coverMod` already samples target points). LoS = any ray clear. Cover fraction = obscured target points (by forest *or* by another unit's rectangle) / N, with ≤50% = -1 and >50% = -2. Characters (lone models) should block like everything else; keep the Large Target exemption.

### M5. Fly (X) cannot pass over units or terrain, and flyers take the march test
- **Book:** p.170 (core.txt L5447-5470). Flyers pass freely over models, units and terrain, ignore terrain penalties, and can march within 8" of an enemy without a test. They cannot end on impassable terrain or a unit.
- **Engine:** `previewMove` L620-629 runs `checkPlacement` on every intermediate step for every unit, flyers included, so a flyer cannot cross a unit or a ruin. Only the terrain M penalty is skipped (L630). `apply` 'move' L3132 makes flyers take the Enemy Sighted test.
- **Sketch:** In `previewMove`, skip the intermediate `checkPlacement` when `has(u,'flyer')` (keep the final check). In `apply` 'move', add `&& !has(u,'flyer')` to the march-test condition.

### M6. Remains in Play spells can never be dispelled later
- **Book:** p.110 (core.txt L3416-3440). In the Conjuration sub-phase of any later turn, the opponent may make a Fated or Wizardly dispel against the spell's minimum CV. Perfect Invocations can also be dispelled this way.
- **Engine:** Remains-in-Play effects (`fx` entries with `rip: true`, vortices in `s.vortex`, temporary terrain) end only when the caster dies (`beginStrategy` L2526-2529) or a vortex reaches its age cap. No dispel attempt is offered.
- **Sketch:** In `beginStrategy` (Conjuration), for each enemy `rip` effect, vortex or temp terrain from the opposing player, offer (AI: auto when valuable) `tryDispel(s, caster, SPELLS[key].cv - 1, false, ev)`. `tryDispel` dispels on `> total`, so pass `cv - 1` to mean "beat the minimum casting value". This needs the spell key stored on `rip` fx entries (currently only `src`).

### M7. Unit Strength ignores joined characters
- **Book:** p.207 (core.txt L6928-6930): a joined character adds its Unit Strength to the unit.
- **Engine:** `usOf` L77-81 returns `u.models * d.us` (or wounds for machines). Every comparison uses it: the Fear US comparison (L1212, L1945), the break test 2x US (`usAfter` L2161), the panic thresholds (`friendsPanicDestroyed` L1092), objective control (`centerController`, `featController`), Break Point totals (L2776, L3115) and the flee direction (L2253).
- **Sketch:** `usOf(u) = base + joinedLive(u).reduce((t,j)=>t+usOf(j),0)`. Check callers that compute per-model fractions (`panicFromLosses` L1085 uses `D(u).us` directly and is fine).

### M8. Lone-character targeting and Look Out, Sir! are incomplete
- **Book:** p.206 (core.txt L6895-6904). A Lone character cannot be targeted by shooting or spells while within 3" of a friendly non-fleeing unit of 5+ models of the same troop type, unless it is the closest target. p.208 (L6984-7000). A joined character can also be hit when under a template. If hit with 5+ R&F, Look Out, Sir! applies: on a 1 the character takes the hit, on 2+ the unit does. Evade (p.206): a Lone character about to be contacted by a pursuit may test I to move away.
- **Engine:** `shootCheck` (L661) and `spellTargets` (L1338) have no 3" protection (only the army-specific `standBackSafe`). `applyWounds` L412 lets characters be hit only when `u.models < 5`, so templates (stone thrower, mortar, blast spells, breath) never reach a character in a big unit. There is no Evade (no `evade` in rules.js apart from Evasive).
- **Sketch:** Add a helper `loneProtected(s, shooter, t)` used in `shootCheck` and `spellTargets`: `D(t).cat==='char' && friendly unit f within 3" && !f.fleeing && f.models>=5 && same cat && t is not the nearest enemy`. For templates, pass a `template:true` flag into `applyWounds`. If the template's centre falls on the front rank and the unit has characters, roll one D6 per character, and a 1 moves one hit to the char.

### M9. Pursuit outcomes are simplified
- **Book:** p.157-158 (core.txt L5031+). A pursuer that catches a Fall-Back unit stays engaged and *counts as charging* next turn. A pursuer that contacts a *fresh* enemy unit counts as charging it (and fights if that combat has not been fought). A pursuer that leaves the table returns as reinforcements.
- **Engine:** `resolveCombats` L2324-2335: on contact with a Fall-Back unit, `movePursuer` just moves up to it, and the end-of-phase reset (L2340) clears `chargeOK`. `movePursuer` (L2343-2350) stops at any obstruction, including another enemy, which is then never engaged as a charge, and stops at the table edge.
- **Sketch:** On contact with the fallen-back unit, set `w.chargeOK=true, chargeDist=dist, chargeSide=sideOf(...)` on a flag that survives into the next opponent's turn (store `w.pursuitCharge = turnKey`, read it in `effI` and `attackProfile0`). In `movePursuer`, when the blocking unit is an enemy that is not the target, call `placeCharge` and treat it as a charge. If that group has not fought yet this phase, queue it. If the pursuer would leave the table, move it to `s.reserves` with `returnAt = next compulsory moves`.

### M10. Terrain categories missing: linear obstacles, defended obstacles, hill vantage, buildings
- **Book:** p.270-272 (core.txt L8185-8245). Low linear obstacles (difficult; straddling in combat = Disrupted; a defended obstacle forces a disordered charge unless Fly). High obstacles are impassable. Hills: Vantage Point (a unit entirely on a hill sees over units not on hills, and is seen over them) and Beyond the Crest. Special-feature buildings (Tower, Dark Ruins, p.273-276) can be occupied, with full cover and defended position.
- **Engine:** Terrain kinds are only `forest`, `swamp`, `hill` and `ruin` (+ temp `vortex`). `losClear` L643 treats hills as blockers between non-occupants but has no vantage. Only the extra shooting rank on a hill is implemented (`resolveShot` L886). The Lonely Tower feature is an impassable `ruin` (L92, L128), and occupation is not modelled. Disordered charges come only from army items (L1299).
- **Sketch:** Add `kind:'wall'` (thin rect, low/high flag) to `genTerrain`. Movement: treat low walls as difficult (`feats` in `previewMove`) and high walls as impassable (`checkPlacement`). Defended: if the target's front edge is within 0.5" of a low wall and the charger approaches through it, set `chargeDisordered` (unless flyer). Vantage: in `losClear`, if `a` is fully on a hill, skip unit blockers that are not on a hill (same for `b`). Building occupation: a unit in contact during Remaining Moves → `u.garrison = featId`, 360° arcs, -2 cover, defended obstacle when charged.

### M11. Spell-type timing and caster restrictions
- **Book:** p.108-109 (core.txt L3270-3285). Conveyance is cast in Remaining Moves. Magic Missile and Magical Vortex are cast when the Wizard is chosen in the Shooting phase, so a Wizard that marched or charged cannot cast them (p.123). A Wizard engaged in combat may still cast Assailment and **Self**-range spells. Assailment is cast when the Wizard fights, at its Initiative.
- **Engine:** `castCheck` L1355 sets `phase = missile ? 'shoot' : 'strategy'`, so Conveyance and Vortex are cast in Strategy. There is no `u.marched`/`u.charged` check for missiles. `isEngaged` blocks every spell (L1360). `autoAssail` L1673 casts the first assail spell before any blows, not at the wizard's I step.
- **Sketch:** Map the phase per type: enchant/hex → 'strategy', conveyance → 'move' (after charges; require that the target has not yet moved, or as the spell says), missile/vortex → 'shoot' (and reject if `u.marched || u.charged`). Allow `sp.range==='self'` when engaged. Move `autoAssail` into `fightGroup` at the wizard's I step (insert a pending entry when `st === info.get(host.id)`).

### M12. Fleeing movement through enemies and terrain
- **Book:** p.133-134 (core.txt L4115-4145). Each model that flees through an enemy unit takes a Peril test (D6: 1-3 loses 1 W). A fleeing unit pivots around impassable terrain and stops 1" short of enemies. Skirmishers fleeing through formed friendly units cause no panic (L6060-6066).
- **Engine:** `pushAway` L1126-1167 tracks only terrain and friendly passes. The overlap-clearing loop (L1157-1165) slides through enemies with no Peril test, ignores ruins, and can stop within 1" of an enemy. The fled-through panic (L1146-1153) applies to skirmishers too.
- **Sketch:** Record enemy ids overlapped during the step loop and, at the end, roll D6 per model of the fleeing unit (`u.models` at the time) for each enemy crossed (1-3 = 1 W). Extend the final clearing loop to also require a gap ≥1" to enemies and no overlap with a `ruin`. Skip the fled-through panic if `has(u,'skirmish') && !has(f,'skirmish')`.

### M13. Movement sequencing (declare charges → reactions → charge moves → compulsory → remaining)
- **Book:** p.116-123. All charges are declared first, then all reactions, then charge moves in the order of the active player's choosing. Units that failed to rally flee in Compulsory Moves, *after* charges.
- **Engine:** Each `charge` action (`apply` L3158) declares, reacts and moves at once (`doCharge`). Charges can be declared after other units have already done normal moves (`chargeTargets` only checks the charger's `u.moved`). `rallyFleeing` (L2701) moves non-rallied fleeing units at the end of Strategy, before charges.
- **Sketch:** Add a sub-phase flag `s.sub = 'declare' | 'chargeMove' | 'remaining'`. Collect charge declarations, resolve reactions (Terror, Flee, S&S) in one pass, then roll and move. Move the `pushAway` of non-rallied units to the start of 'remaining' (Compulsory Moves). Block `move` actions until the declare sub-phase has closed.

---

## LOW

| # | Rule (book ref) | Engine now | Book | Sketch |
|---|---|---|---|---|
| L1 | BS 6+ re-roll table (p.139, core.txt L4300s; spec_move_shoot §4.2) | `shootBase` L446 caps BS≥5 at 2+, with no re-roll. 26 models in data have BS6/7. | BS6-10: 2+ followed by a re-roll at 6+…2+; modifiers apply to the first roll only. | In `hitRoll`, take `bs` and, when `bs>=6`, re-roll misses at `12-bs`+. |
| L2 | Quick Shot S&S at any range (p.175, L5687-5696) | `doCharge` L1265 requires `dist >= mvOf(u)` for all. | Quick Shot units can S&S however close the charger is. | `|| (rangedOf(t).sr||[]).includes('quickShot')`. |
| L3 | Move & Shoot (p.174) | `shootCheck` L671 blocks any marched unit. `moveShoot` only appears in item profile L391. | May shoot after marching. | Skip the `u.marched` check if `rg.sr.includes('moveShoot')` (and not charged). |
| L4 | Fear/Terror not conferred by joined characters (p.168, L5383-5386; p.180, L5840-5842) | `JOIN_PASS` L66 includes `'fear','terror'`, so a unit gains them from a joined character. | A unit does not cause Fear/Terror (or become immune) because a character joined it. | Remove both from `JOIN_PASS`. In `causesFear(u)` keep only the unit's own rule. Fear immunity only if the unit itself has it. |
| L5 | Combat Order +1 only for Close Order (p.101, L2986-2988; p.153, L4886) | `sideScore` L2145 gives +1 to any inf/cav non-skirmish unit with files ≥ ranks, including Open Order units and 1-model remnants. | Close Order in Combat Order only. | Add `has(u,'closeOrder')` (and `u.models>1`). |
| L6 | Immune to Psychology / Frenzy cannot Flee as a reaction (p.171-172); Frenzy auto-passes Terror | `lightFlee` L1249 excludes frenzy but not immunePsy, and honours a player `react:'flee'`. The Terror test L1221 checks only `immunePsy`. | Neither may Flee; a Frenzied majority passes Terror automatically. | Add `!has(t,'immunePsy')` to `lightFlee` and reject `react:'flee'` for them. Add frenzy to the terror exemption. |
| L7 | Magic Resistance not cumulative (p.110; spec_magic §A) | `doCast` L1603 subtracts `mrOf(t) + mrItems(t)` (summed). | Use the single highest MR value. | `Math.max(mrOf(t), mrItems(t))`. |
| L8 | Miscast side effects (p.111) | `miscast` L1370-1375 sets `u.noMore` on results 2-6 too. Templates are approximated as D6 hits per unit within 1.5"/2.5". | Only 8-9 and 10-12 stop further casting. Blasts hit models under a 3"/5" template. | Remove `u.noMore=true` from the ≤6 branch. Use `circleFrac` (L735) to count models under the template. |
| L9 | Magical Vortex movement per spell (lores p.321-336) | `beginStrategy` L2530-2553 moves every vortex D6" in a random direction and hits only *enemy* units. | Spell-specific: e.g. Pillar of Fire D6" in the caster's chosen direction and hits friend and foe; Foot of Gork 2D6" random. | Store `vx.move` ('D6'/'2D6'), `vx.dir` ('caster'/'random') and `vx.friendly` in SPELLS and read them here. |
| L10 | Inspiring Presence range (p.204) | `ldOf` L380 uses a fixed 12" for the General. | 18" if the General (or its mount) is a Large Target. | Use `commandRange(gen)` (L2688). |
| L11 | Characters and models always block LoS (p.103) | `losClear` L648 skips `D(o).cat==='char'` and flyers. | All models block unless Large Target rules apply. | Remove the char and flyer skip (keep `large`). |
| L12 | War machine US (p.106) | `usOf` L79 uses current wounds. | US = starting Wounds per model. | `u.models * startW`. |
| L13 | Marching restrictions (p.123-124) | `previewMove` L599-602 allows half-speed back/side moves while marching. | Marching allows wheels only. | `if (march && mult===2) return fail`. |
| L14 | Marching Column may declare a charge (it just cannot make the move) (p.101-102, p.120) | `chargeTargets` L1173 excludes columns entirely. | Can declare, cannot move, so it is a failed charge. | Allow the declaration; in `doCharge`, force a failed charge if `isColumn(u)`. |
| L15 | Run-down reform test (p.130) | After a run-down (L1306-1309) the unit just stops. | Ld test for a free reform. | Roll Ld; on pass, allow a face change (AI: face the nearest enemy). |
| L16 | Give Ground when surrounded / accidental contact (p.132, p.135, p.156) | `pushAwayStep` L1579 moves away from one foe only and stops silently. No accidental-contact handling (placements simply fail). | Move away from *all* engaged enemies; if unable, stay (the combat continues). Units touched accidentally may commit or Give Ground. | Average the away-vectors of all engaged foes. Treat accidental front contact as a mutual engagement without charge bonuses. |
| L17 | Ambushers arrival edge (p.165, L5251-5265) | `ambushPos` L542 only allows the left or right short edges. | Any table edge, not within 8" of an enemy. | Accept all four edges in `apply` 'enter'. |
| L18 | Lone-character Evade (p.206, L6878-6886) | Not implemented. | I test to move away from a pursuer before contact. | In the pursuit loop (L2318), if the target is a lone char that is not fleeing or engaged, roll I and move it up to M away. |
| L19 | Veteran / Warband re-rolls (p.181) | Veteran re-roll only in panic and fear. Warband's majority re-roll of the charge roll is absent from `doCharge`. | Veteran re-rolls any failed Ld test except Break. Warband re-rolls the Charge roll. | Generic `ldTest(s,u,{kind})` helper with re-roll policy, used everywhere. |
| L20 | VP "<25% US" (Core p.287) | `scoreVP` L2834 uses the Matched Play value (≤25% → 50%). | Core: <25% → 25% of cost. | Deliberate MPG choice; add a toggle if pure core scoring is wanted. |

---

## Universal special rules: coverage of the core list (p.165-181)

Implemented (with the caveats above): Ambushers, Armour Bane, Armoured Hide (data), Breath Weapon, Close Order, Counter Charge, Cumbersome, Drilled, Evasive, Extra Attacks, Fast Cavalry, Fear (see H5 and L4), Feigned Flight, Fight in Extra Rank (spears only), Fire & Flee, First Charge, Flaming Attacks (damage only), Flammable, Fly (see M5), Frenzy, Furious Charge, Hatred, Horde (via maxRank), Ignores Cover, Immune to Psychology (see L6), Impact Hits, Impetuous, Killing Blow, Large Target, Levies (panic), Loner, Magic Resistance (see L7), Magical Attacks, Move or Shoot, Move Through Cover, Multiple Wounds, Open Order, Poisoned Attacks, Ponderous, Quick Shot (see L2), Rallying Cry, Random Attacks, Random Movement, Regeneration, Requires Two Hands, Reserve Move, Scouts, Shieldwall, Skirmishers (incl. -1 to hit at US1), Stomp Attacks, Strike First/Last, Stubborn, Stupidity, Swiftstride, Terror (see H5), Timmm-berrr!, Unbreakable, Unstable, Vanguard, Veteran (partial), Volley Fire, Warband (Ld part only).

Missing or no-op:
- **Multiple Shots (X):** see M3.
- **Move & Shoot:** see L3.
- **Flaming Attacks causes Fear in war beasts and swarms:** not modelled.
- **Ethereal:** no key in data or engine. Needed for Spectral Steed (Necromancy) and for scenario "Bottleneck" edges (`s.block` ignores Ethereal and Fly).
- **Chariot Runners, Monster Handlers, Monster Slayer, Motley Crew, Detachment, Regimental Unit, Howdah, Mercenaries, Warp-spawned:** not implemented. They are army-building or niche; LOW unless lists use them.
