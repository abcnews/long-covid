import { Body, Engine, Render, Runner, Bodies, Composite, Common, Vector, Vertices, Svg } from 'matter-js';
import decomp from 'poly-decomp';
import DATA from './title-card.json';

Common.setDecomp(decomp);

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const IS_TEXT_SERIF = true;
const WORDS_DATA = IS_TEXT_SERIF ? DATA.wordsS : DATA.wordsSS;
const CHARACTERS_DATA = IS_TEXT_SERIF ? DATA.charactersS : DATA.charactersSS;
const WIDEST_CHARACTER_WIDTH = CHARACTERS_DATA.shapes.reduce((memo, box: Box) => Math.max(memo, box.w), 0);
const RENDER_OPTIONS = {
  wireframes: false,
  width: DATA.scene.w,
  height: DATA.scene.h,
  background: '#fff'
};

const extendDataBoxWithVertexSet = (box: Box, sampleLength?: number) => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  path.setAttribute('d', box['d']);
  box['vertexSet'] = Svg.pathToVertices(path, sampleLength);
};

CHARACTERS_DATA.shapes.forEach(shape => extendDataBoxWithVertexSet(shape, 5));
extendDataBoxWithVertexSet(DATA.ground);

const getCXCYWHArgs = (box: Box) => [box.x + box.w / 2, box.y + box.h / 2, box.w, box.h];
const getSprite = (box: Box) => ({
  texture: `${__webpack_public_path__}title-card/${box['c']}.svg`
});
const getStaticRectangleWithSprite = (box: Box) =>
  Bodies.rectangle(...getCXCYWHArgs(box), {
    isStatic: true,
    render: {
      sprite: getSprite(box)
    }
  });
const correctBodyPosition = (body: Body, intendedPositionX: number, intendedPositionY: number) => {
  const currentPosition = {
    x: (body.bounds.min.x + body.bounds.max.x) / 2,
    y: (body.bounds.min.y + body.bounds.max.y) / 2
  };
  const positionDiff = {
    x: currentPosition.x - intendedPositionX,
    y: currentPosition.y - intendedPositionY
  };

  Body.setPosition(body, Vector.create(intendedPositionX - positionDiff.x, intendedPositionY - positionDiff.y));
};
const getBodyFromVertices = (cX: number, cY: number, vertexSet, options) => {
  const { render, ...otherOptions } = options || {};
  const body = Bodies.fromVertices(
    cX,
    cY,
    vertexSet,
    {
      ...otherOptions,
      render: {
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
        ...(render || {})
      }
    },
    true
  );

  correctBodyPosition(body, cX, cY);

  return body;
};

export type RunnerStopper = () => void;
export type RunnerStarter = () => RunnerStopper;

export const createSimuation = (el: HTMLElement): RunnerStarter => {
  const [groundCX, groundCY] = getCXCYWHArgs(DATA.ground);
  const ground = getBodyFromVertices(groundCX, groundCY, DATA.ground['vertexSet'], {
    isStatic: true,
    render: {
      lineWidth: 2
    }
  });
  const person = getStaticRectangleWithSprite(DATA.person);
  const words = getStaticRectangleWithSprite(WORDS_DATA);
  const characters = CHARACTERS_DATA.shapes.map(shape =>
    getBodyFromVertices(
      CHARACTERS_DATA.x + shape.x + shape.w / 2,
      CHARACTERS_DATA.y + shape.y + shape.h / 2,
      shape['vertexSet'],
      {
        frictionAir: (0.01 / WIDEST_CHARACTER_WIDTH) * shape.w
      }
    )
  );
  const charactersAngularVelocities = [-1, 0, 1, -1, 1, 0];
  characters.forEach((body, index) => {
    Body.setAngularVelocity(body, 0.0025 * charactersAngularVelocities[index]);
  });
  const engine = Engine.create({
    gravity: {
      scale: 0.001125
    }
  });
  const render = Render.create({
    element: el,
    engine: engine,
    options: RENDER_OPTIONS
  });
  const runner = Runner.create();

  Composite.add(engine.world, [ground, person, words, ...characters]);
  Render.run(render);

  return () => {
    Runner.start(runner, engine);

    return () => Runner.stop(runner);
  };
};
