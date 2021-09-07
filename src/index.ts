import 'pathseg';
const { proxy } = require('@abcnews/dev-proxy');
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { selectMounts } from '@abcnews/mount-utils';
import TitleCard from './components/TitleCard/TitleCard.svelte';
import './global.css';

const dependencies = [proxy('long-covid'), whenOdysseyLoaded];

Promise.all(dependencies).then(() => {
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
      props: {}
    });
  }
});
