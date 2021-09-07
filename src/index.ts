import 'pathseg';
const { proxy } = require('@abcnews/dev-proxy');
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { selectMounts } from '@abcnews/mount-utils';
import TitleCard from './components/TitleCard/TitleCard.svelte';
import './global.css';

const dependencies = [proxy('long-covid'), whenOdysseyLoaded];

Promise.all(dependencies).then(() => {
  const [titleCardMount] = selectMounts('titlecard');

  if (titleCardMount) {
    new TitleCard({
      target: titleCardMount,
      props: {}
    });
  }
});
