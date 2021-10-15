import 'pathseg';
const { proxy } = require('@abcnews/dev-proxy');
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { subscribe } from '@abcnews/progress-utils';
import { interpolateLab } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import AnmtrBlock from './components/Anmtr/AnmtrBlock.svelte';
import Cycle from './components/Cycle/Cycle.svelte';
import { HAS_OPTED_OUT } from './components/MotionPreference';
import MotionPreference from './components/MotionPreference/MotionPreference.svelte';
import Mind from './components/Mind/Mind.svelte';
import ForgottenWords from './components/ForgottenWords/ForgottenWords.svelte';
import Spin from './components/Spin/Spin.svelte';
import TitleCard from './components/TitleCard/TitleCard.svelte';
import './global.css';

const makeParagraphReplacement = (el: HTMLElement) => {
  el.setAttribute('data-paragraph-replacement', '');
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('role', 'presentation');
};

const initMotionPreference = () => {
  selectMounts('motionpreference').forEach(el => {
    new MotionPreference({
      target: el,
      props: {}
    });
  });
};

const initTitleCard = (prefersReducedMotion: boolean = false) => {
  const headerEl = document.querySelector('.Header');

  if (headerEl) {
    let headerMediaEl = headerEl.querySelector('.Header-media');

    if (headerMediaEl) {
      headerMediaEl.innerHTML = '';
    } else {
      headerMediaEl = document.createElement('div');
      headerMediaEl.classList.add('Header-media');
      headerEl.insertBefore(headerMediaEl, headerEl.firstChild);
    }

    new TitleCard({
      target: headerMediaEl,
      props: {
        shouldRunSimulation: !prefersReducedMotion
      }
    });
  }
};

const initCenteredParagraphs = () => {
  Array.from(document.querySelectorAll('p strong:first-child:last-child')).forEach(el => {
    const paragraphEl = el.parentElement;

    if (!paragraphEl) {
      return;
    }

    const paragraphElText = (paragraphEl.textContent || '').trim();
    const elText = (el.textContent || '').trim();

    if (paragraphElText === elText) {
      paragraphEl.setAttribute('data-centered', '');
    }
  });
};

const MODE_TOGGLE_MOUNT_PREFIX = 'modetoggle';
const MODE_TOGGLE_SELECTOR = `[data-mount][id^="${MODE_TOGGLE_MOUNT_PREFIX}"]`;
const DARK_TO_LIGHT = interpolateLab('#000', '#fff');
const LIGHT_TO_DARK = interpolateLab('#fff', '#000');
const MODE_PROGRESS_TO_COLOR_INTERPOLATION_INPUT = scaleLinear(
  window.innerHeight > window.innerWidth ? [0.45, 0.75] : [0.5, 0.7],
  [0, 1]
);

const initModeChanger = (prefersReducedMotion: boolean = false) => {
  const isInitiallyDarkMode = document.documentElement.className.indexOf('is-dark-mode') > -1;
  const initialRichtextEls = Array.from(document.querySelectorAll('.u-richtext'));
  const initialRichtextInvertEls = Array.from(document.querySelectorAll('.u-richtext-invert'));
  const initialLightHeaderEls = Array.from(document.querySelectorAll('.Header.is-light'));
  const initialDarkHeaderEls = Array.from(document.querySelectorAll('.Header.is-dark'));
  const initialLightBlockEls = Array.from(document.querySelectorAll('.Block.has-light'));
  const initialDarkBlockEls = Array.from(document.querySelectorAll('.Block.has-dark'));

  let shouldBeDarkMode = isInitiallyDarkMode;

  if (!prefersReducedMotion) {
    requestAnimationFrame(() => document.documentElement.classList.add('can-change-mode'));
  }

  subscribe(
    'modetoggles',
    message => {
      if (message.type !== 'state') {
        return;
      }

      const state = message.data;
      const shouldBeAlternativeMode = (state === null ? -1 : state._index) % 2 === 0;

      shouldBeDarkMode =
        (isInitiallyDarkMode && !shouldBeAlternativeMode) || (!isInitiallyDarkMode && shouldBeAlternativeMode);

      document.documentElement.classList[shouldBeDarkMode ? 'add' : 'remove']('is-dark-mode');
      initialRichtextEls.forEach(
        el =>
          (el.className = el.className.replace(
            /u-richtext(-invert)?/,
            `u-richtext${shouldBeDarkMode ? '' : '-invert'}`
          ))
      );
      initialRichtextInvertEls.forEach(
        el =>
          (el.className = el.className.replace(
            /u-richtext(-invert)?/,
            `u-richtext${shouldBeDarkMode ? '-invert' : ''}`
          ))
      );
      initialLightHeaderEls.forEach(
        el => (el.className = el.className.replace(/is-(light|dark)/, `is-${shouldBeDarkMode ? 'light' : 'dark'}`))
      );
      initialDarkHeaderEls.forEach(
        el => (el.className = el.className.replace(/is-(light|dark)/, `is-${shouldBeDarkMode ? 'dark' : 'light'}`))
      );
      initialLightBlockEls.forEach(
        el => (el.className = el.className.replace(/has-(light|dark)/, `has-${shouldBeDarkMode ? 'light' : 'dark'}`))
      );
      initialDarkBlockEls.forEach(
        el => (el.className = el.className.replace(/has-(light|dark)/, `has-${shouldBeDarkMode ? 'dark' : 'light'}`))
      );
    },
    {
      indicatorSelector: MODE_TOGGLE_SELECTOR,
      regionThreshold: 0.4,
      shouldOptimiseIndicatorTracking: false
    }
  );

  if (prefersReducedMotion) {
    return;
  }

  const abortModeTransition = () => {
    document.documentElement.classList.remove('is-changing-mode');
    document.documentElement.style.removeProperty('--bg');
    document.documentElement.style.removeProperty('--fg');
  };

  let lastModeTransitionUpdateTime: number | null = null;

  setInterval(() => {
    if (lastModeTransitionUpdateTime !== null && Date.now() - lastModeTransitionUpdateTime > 1000) {
      lastModeTransitionUpdateTime = null;
      abortModeTransition();
    }
  }, 1000);

  selectMounts(MODE_TOGGLE_MOUNT_PREFIX, { markAsUsed: false }).forEach((el, index) => {
    el.setAttribute('data-index', String(index));

    subscribe(
      `modetransition_${index}`,
      message => {
        if (message.type !== 'progress') {
          return;
        }

        const progress = message.data.region;

        if (progress === 0 || progress === 1) {
          return;
        }

        lastModeTransitionUpdateTime = Date.now();

        const colorInterpolationInput = MODE_PROGRESS_TO_COLOR_INTERPOLATION_INPUT(progress);

        if (colorInterpolationInput < 0 || colorInterpolationInput > 1) {
          abortModeTransition();
          return;
        }

        let fgColorInterpolationInput = 1 - colorInterpolationInput;

        if (fgColorInterpolationInput > 0.45 && fgColorInterpolationInput < 0.5) {
          fgColorInterpolationInput = 0.45;
        } else if (fgColorInterpolationInput >= 0.5 && fgColorInterpolationInput < 0.55) {
          fgColorInterpolationInput = 0.55;
        }

        const colorScale =
          (colorInterpolationInput < 0.5 && shouldBeDarkMode) || (colorInterpolationInput >= 0.5 && !shouldBeDarkMode)
            ? DARK_TO_LIGHT
            : LIGHT_TO_DARK;

        document.documentElement.classList.add('is-changing-mode');
        document.documentElement.style.setProperty('--bg', colorScale(colorInterpolationInput));
        document.documentElement.style.setProperty('--fg', colorScale(fgColorInterpolationInput));
      },
      {
        indicatorSelector: `${MODE_TOGGLE_SELECTOR}[data-index="${index}"]`
      }
    );
  });
};

/*
#cycle
"I'd have a fever for an hour...a sore throat for four hours...then dizziness for two hours...then I was OK for an hour".
*/
const initCycle = () => {
  selectMounts('cycle').forEach(el => {
    const followingParagraphEl = el.nextElementSibling;

    if (!followingParagraphEl || followingParagraphEl.tagName !== 'P') {
      return;
    }

    makeParagraphReplacement(el as unknown as HTMLElement);
    el.setAttribute('data-cycle', '');
    new Cycle({
      target: el,
      props: {}
    });
  });
};

/*
#forgottenwords
“Heaps of people say, ‘Oh, I get that and I'm young’, but it just feels different… you'd be mid sentence and then completely forget what you were talking about”
*/
const initForgottenWords = () => {
  selectMounts('forgottenwords').forEach((el, index) => {
    const followingParagraphEl = el.nextElementSibling;

    if (!followingParagraphEl || followingParagraphEl.tagName !== 'P') {
      return;
    }

    makeParagraphReplacement(el as unknown as HTMLElement);
    el.setAttribute('data-forgottenwords', String(index));
    new ForgottenWords({
      target: el,
      props: {
        mountIndex: index,
        text: followingParagraphEl.textContent || ''
      }
    });
  });
};

/*
#mind
"I just feel like I’m losing my mind.".
*/
const initMind = () => {
  selectMounts('mind').forEach(el => {
    const followingParagraphEl = el.nextElementSibling;

    if (!followingParagraphEl || followingParagraphEl.tagName !== 'P') {
      return;
    }

    makeParagraphReplacement(el as unknown as HTMLElement);
    el.setAttribute('data-mind', '');
    new Mind({
      target: el,
      props: {
        text: followingParagraphEl.textContent || ''
      }
    });
  });
};

/*
#mind
"I just feel like I’m losing my mind.".
*/
const initSpin = () => {
  selectMounts('spin').forEach(el => {
    const followingParagraphEl = el.nextElementSibling;

    if (!followingParagraphEl || followingParagraphEl.tagName !== 'P') {
      return;
    }

    makeParagraphReplacement(el as unknown as HTMLElement);
    el.setAttribute('data-spin', '');
    new Spin({
      target: el,
      props: {
        text: followingParagraphEl.textContent || ''
      }
    });
  });
};

/*
#anmtrNAMEadam
---
#anmtrNAMEbronwyn
---
#anmtrNAMEfreya
---
#anmtrNAMEjudy
*/
const initAnmtr = () => {
  selectMounts('anmtr').forEach(el => {
    const name = getMountValue(el).split('NAME')[1];

    el.setAttribute('data-anmtr', name);
    el.classList.add('u-full');
    new AnmtrBlock({
      target: el,
      props: {
        name
      }
    });
  });
};

Promise.all([proxy('long-covid'), whenOdysseyLoaded]).then(() => {
  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    initMotionPreference();
  }

  prefersReducedMotion = prefersReducedMotion || !!HAS_OPTED_OUT;

  initTitleCard(prefersReducedMotion);
  initCenteredParagraphs();
  initModeChanger(prefersReducedMotion);

  if (!prefersReducedMotion) {
    initCycle();
    initForgottenWords();
    initMind();
    initSpin();
    initAnmtr();
  }
});
