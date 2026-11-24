import {useEffect, useRef} from 'react';

interface PawPrint {
  anchorEl: HTMLElement | null; // Element to anchor to for scroll/track synchronization
  localX: number;               // X offset relative to anchorEl (or screenX if anchorEl is null)
  localY: number;               // Y offset relative to anchorEl (or screenY if anchorEl is null)
  angle: number;                // Rotation angle in radians
  scale: number;                // Paw scale
  born: number;                 // Creation timestamp in ms
  maxAge: number;               // Total lifespan in ms
  holdAge: number;              // Hold duration before fading starts in ms
  alpha: number;                // Peak opacity
}

// Cubic ellipse outlines match the reference's four rotated toe pads.
function ellipsePath(cx: number, cy: number, rx: number, ry: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians), sin = Math.sin(radians);
  const point = (x: number, y: number) =>
    `${(cx + x * cos - y * sin).toFixed(2)} ${(cy + x * sin + y * cos).toFixed(2)}`;
  return `M${point(rx, 0)}C${point(rx, 0.5523 * ry)} ${point(0.5523 * rx, ry)} ${point(0, ry)}C${point(-0.5523 * rx, ry)} ${point(-rx, 0.5523 * ry)} ${point(-rx, 0)}C${point(-rx, -0.5523 * ry)} ${point(-0.5523 * rx, -ry)} ${point(0, -ry)}C${point(0.5523 * rx, -ry)} ${point(rx, -0.5523 * ry)} ${point(rx, 0)}Z`;
}

const pawPath =
  'M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5z' +
  ellipsePath(14.6, 29.2, 5.3, 6.9, -28) +
  ellipsePath(24.2, 16.6, 5.5, 7.3, -10) +
  ellipsePath(39.8, 16.6, 5.5, 7.3, 10) +
  ellipsePath(49.4, 29.2, 5.3, 6.9, 28);

/**
 * PawTrail renders both cursor paw prints and dog walking footprints
 * on a single, high-performance canvas overlay.
 */
export function PawTrail() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext('2d');
    if (!context) return;

    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const path = new Path2D(pawPath);
    const prints: PawPrint[] = [];

    let ratio = 1;
    let frame = 0;
    let running = false;

    // Cursor tracking state
    let cursorPrevX = NaN;
    let cursorPrevY = NaN;
    let cursorDistance = 0;
    let cursorSide = 1;

    // Dog tracking state
    let prevActorLeft = NaN;
    let prevActorTop = NaN;
    let prevTrackLeft = NaN;
    let dogDistance = 0;
    let dogSide = 1;

    let actorObserver: MutationObserver | null = null;
    let domObserver: MutationObserver | null = null;

    const clear = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, element.width, element.height);
    };

    const reset = () => {
      cancelAnimationFrame(frame);
      running = false;
      prints.length = 0;
      cursorPrevX = NaN;
      cursorPrevY = NaN;
      cursorDistance = 0;
      cursorSide = 1;
      prevActorLeft = NaN;
      prevActorTop = NaN;
      prevTrackLeft = NaN;
      dogDistance = 0;
      dogSide = 1;
      clear();
    };

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(innerWidth * ratio);
      element.height = Math.round(innerHeight * ratio);
    };

    const draw = (now: number) => {
      clear();
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      for (let i = prints.length - 1; i >= 0; i--) {
        const print = prints[i];
        const age = now - print.born;
        if (age > print.maxAge) {
          prints.splice(i, 1);
          continue;
        }

        // Calculate screen coordinates based on anchor element
        let screenX = print.localX;
        let screenY = print.localY;
        if (print.anchorEl) {
          const rect = print.anchorEl.getBoundingClientRect();
          screenX = rect.left + print.localX;
          screenY = rect.top + print.localY;
        }

        // Skip prints far outside viewport bounds
        if (screenX < -60 || screenX > viewW + 60 || screenY < -60 || screenY > viewH + 60) {
          continue;
        }

        const fadeDuration = print.maxAge - print.holdAge;
        const opacity = age < print.holdAge ? 1 : Math.max(0, 1 - (age - print.holdAge) / fadeDuration);
        context.globalAlpha = print.alpha * opacity * opacity;
        context.setTransform(
          print.scale * ratio,
          0,
          0,
          print.scale * ratio,
          screenX * ratio,
          screenY * ratio
        );
        context.rotate(print.angle);
        context.translate(-32, -34);
        context.fillStyle = '#c2622b';
        context.fill(path);
      }

      if (prints.length > 0) {
        frame = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    // Cursor movement listener
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !mouse.matches || reduced.matches) return;
      if (Number.isNaN(cursorPrevX)) {
        cursorPrevX = event.clientX;
        cursorPrevY = event.clientY;
        return;
      }

      const dx = event.clientX - cursorPrevX;
      const dy = event.clientY - cursorPrevY;
      cursorDistance += Math.hypot(dx, dy);

      if (cursorDistance >= 46) {
        cursorDistance = 0;
        cursorSide = -cursorSide;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const offset = 7 * cursorSide;

        prints.push({
          anchorEl: null,
          localX: event.clientX + Math.cos(angle) * offset + 14,
          localY: event.clientY + Math.sin(angle) * offset + 16,
          angle,
          scale: 0.27,
          born: performance.now(),
          maxAge: 1000,
          holdAge: 600,
          alpha: 0.42,
        });

        if (prints.length > 70) prints.shift();
        if (!running) {
          running = true;
          frame = requestAnimationFrame(draw);
        }
      }

      cursorPrevX = event.clientX;
      cursorPrevY = event.clientY;
    };

    // Dog movement tracker
    const updateDogStep = () => {
      if (reduced.matches) return;
      const actor = document.querySelector<HTMLElement>('.pup-actor');
      if (!actor || actor.offsetParent === null) {
        prevActorLeft = NaN;
        prevActorTop = NaN;
        prevTrackLeft = NaN;
        return;
      }

      const actorRect = actor.getBoundingClientRect();
      if (actorRect.width < 10 || actorRect.height < 10) return;

      // Check for horizontal doors track in tp-meet
      const track = document.querySelector<HTMLElement>('.tp-meet__track');
      const trackRect = track ? track.getBoundingClientRect() : null;
      const currentTrackLeft = trackRect ? trackRect.left : 0;

      const currentActorLeft = actorRect.left;
      const currentActorTop = actorRect.top;

      if (Number.isNaN(prevActorLeft)) {
        prevActorLeft = currentActorLeft;
        prevActorTop = currentActorTop;
        prevTrackLeft = currentTrackLeft;
        return;
      }

      const deltaActorX = currentActorLeft - prevActorLeft;
      const deltaActorY = currentActorTop - prevActorTop;
      const deltaTrackX = trackRect && !Number.isNaN(prevTrackLeft) ? currentTrackLeft - prevTrackLeft : 0;

      // Determine if puppy is in the door showcase track
      const isOnTrack =
        trackRect !== null &&
        actorRect.bottom >= trackRect.top - 40 &&
        actorRect.top <= trackRect.bottom + 120 &&
        Math.abs(deltaTrackX) > 0.2;

      // Facing direction: true = left, false = right
      const rootG = actor.querySelector<SVGGElement>('g[data-p="root"]');
      const isFacingLeft = rootG?.getAttribute('transform')?.includes('scale(-1') ?? false;

      let stepDistance = 0;
      let isHorizontalWalk = false;
      let moveAngle = 0;

      if (isOnTrack) {
        stepDistance = Math.abs(deltaTrackX);
        isHorizontalWalk = true;
        moveAngle = isFacingLeft ? Math.PI : 0;
      } else {
        stepDistance = Math.hypot(deltaActorX, deltaActorY);
        if (Math.abs(deltaActorX) > 1.8 * Math.abs(deltaActorY) || Math.abs(deltaActorY) < 3) {
          isHorizontalWalk = true;
          moveAngle = isFacingLeft ? Math.PI : 0;
        } else {
          moveAngle = Math.atan2(deltaActorY, deltaActorX);
        }
      }

      const dogScale = Math.max(0.45, Math.min(1.2, actorRect.width / 260));

      if (stepDistance > 0.5 && stepDistance < 180) {
        dogDistance += stepDistance;
        const strideThreshold = 26 * dogScale;

        if (dogDistance >= strideThreshold) {
          dogDistance = 0;
          dogSide = -dogSide; // Alternate left and right paws

          // Locate puppy's actual feet contact point using shadow
          const shadow = actor.querySelector<SVGElement>('[data-p="shadow"]');
          let footScreenX = 0;
          let footScreenY = 0;

          if (shadow) {
            const sRect = shadow.getBoundingClientRect();
            footScreenX = sRect.left + sRect.width / 2;
            footScreenY = sRect.top + sRect.height / 2;
          } else {
            footScreenX = actorRect.left + actorRect.width * (isFacingLeft ? 0.42 : 0.58);
            footScreenY = actorRect.bottom - actorRect.height * 0.06;
          }

          // In pawPath, toes point UP (-Y).
          // To point toes in movement direction:
          // Moving Right: rotate +PI/2
          // Moving Left: rotate -PI/2
          // Moving Down: rotate PI
          let printAngle = moveAngle + Math.PI / 2;
          if (isHorizontalWalk) {
            printAngle = isFacingLeft ? -Math.PI / 2 : Math.PI / 2;
          }

          let printX = footScreenX;
          let printY = footScreenY;

          if (isHorizontalWalk) {
            // When walking horizontally, left and right paws alternate along the horizontal floor line
            printX = footScreenX + (dogSide * 2 * dogScale);
            printY = footScreenY + (dogSide * 6 * dogScale);
          } else {
            const perpAngle = moveAngle + Math.PI / 2;
            const lateralOffset = 8 * dogScale * dogSide;
            printX = footScreenX + Math.cos(perpAngle) * lateralOffset;
            printY = footScreenY + Math.sin(perpAngle) * lateralOffset;
          }

          // Anchor to floor: track if in tp-meet, otherwise current scene
          let anchorEl: HTMLElement | null = null;
          if (isOnTrack && track) {
            anchorEl = track;
          } else {
            const scenes = Array.from(document.querySelectorAll<HTMLElement>('.tp-scene'));
            anchorEl =
              scenes.find(s => {
                const r = s.getBoundingClientRect();
                return footScreenY >= r.top - 60 && footScreenY <= r.bottom + 60;
              }) || null;
          }

          const anchorRect = anchorEl ? anchorEl.getBoundingClientRect() : null;
          const localX = anchorRect ? printX - anchorRect.left : printX;
          const localY = anchorRect ? printY - anchorRect.top : printY;

          prints.push({
            anchorEl,
            localX,
            localY,
            angle: printAngle,
            scale: 0.22 * dogScale,
            born: performance.now(),
            maxAge: 1200,
            holdAge: 450,
            alpha: 0.48,
          });

          if (prints.length > 70) prints.shift();
          if (!running) {
            running = true;
            frame = requestAnimationFrame(draw);
          }
        }

        prevActorLeft = currentActorLeft;
        prevActorTop = currentActorTop;
        prevTrackLeft = currentTrackLeft;
      } else if (stepDistance >= 180) {
        prevActorLeft = currentActorLeft;
        prevActorTop = currentActorTop;
        prevTrackLeft = currentTrackLeft;
        dogDistance = 0;
      }
    };

    const attachActorObserver = () => {
      const actor = document.querySelector<HTMLElement>('.pup-actor');
      if (actor && !actorObserver) {
        actorObserver = new MutationObserver(() => {
          updateDogStep();
        });
        actorObserver.observe(actor, { attributes: true, attributeFilter: ['style'] });
      }
    };

    const onScroll = () => {
      updateDogStep();
      if (prints.length > 0 && !running) {
        running = true;
        frame = requestAnimationFrame(draw);
      }
    };

    domObserver = new MutationObserver(() => {
      attachActorObserver();
    });
    domObserver.observe(document.body, { childList: true, subtree: true });

    attachActorObserver();
    resize();

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    mouse.addEventListener('change', reset);
    reduced.addEventListener('change', reset);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      mouse.removeEventListener('change', reset);
      reduced.removeEventListener('change', reset);
      actorObserver?.disconnect();
      domObserver?.disconnect();
      reset();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      data-paw-trail="true"
      className="pointer-events-none fixed inset-0 z-[70] size-full"
    />
  );
}
