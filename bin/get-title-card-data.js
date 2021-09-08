#!/usr/bin/env node

const {
  promises: { readFile }
} = require('fs');
const { writeFile } = require('jsonfile');
const sketch2json = require('sketch2json');

const IN_FILENAME = 'title-card.sketch';
const OUT_FILENAME = 'title-card.json';

const getProps = layer => ({
  c: layer.name,
  x: layer.frame.x,
  y: layer.frame.y,
  w: layer.frame.width,
  h: layer.frame.height
});

const getSVGPath = async layer => {
  const data = await readFile(__dirname + `/../public/title-card/${layer.name}.svg`, 'utf-8');

  const [, d] = data.match(/ d="(.*?)"/) || [];

  if (d) {
    return d;
  }

  const [, points] = data.match(/ points="(.*?)"/) || [];

  if (points) {
    const components = points.split(/\s+|,/);

    return `M${components.shift()},${components.shift()} L${components.join(' ')} z`;
  }

  return '';
};

const run = async () => {
  const buffer = await readFile(__dirname + `/../design/${IN_FILENAME}`);
  const root = await sketch2json(buffer);
  const page = Object.values(root.pages)[0];
  const artboard = page.layers[0];

  const [ground, person, characters, words] = artboard.layers;
  const [q2, q1, e, f, i, l] = characters.layers;

  const groundD = await getSVGPath(ground);
  const [q2D, q1D, eD, fD, iD, lD] = await Promise.all(characters.layers.map(layer => getSVGPath(layer)));

  const shapes = {
    words: getProps(words),
    characters: {
      ...getProps(characters),
      shapes: [
        { ...getProps(l), d: lD },
        { ...getProps(i), d: iD },
        { ...getProps(f), d: fD },
        { ...getProps(e), d: eD },
        { ...getProps(q1), d: q1D },
        { ...getProps(q2), d: q2D }
      ]
    },
    person: getProps(person),
    ground: {
      ...getProps(ground),
      d: groundD
    }
  };

  writeFile(__dirname + `/../src/components/TitleCard/${OUT_FILENAME}`, shapes, { spaces: 2 });
};

run();
