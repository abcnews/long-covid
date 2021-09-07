import { Body, Engine, Render, Runner, Bodies, Composite, Vector, Vertices, Svg } from 'matter-js';
import { TYPOGRAPHY_CHARACTERS, TYPOGRAPHY_HEIGHT, TYPOGRAPHY_WIDTH } from './typography';

const WIDTH = 1440;
const HEIGHT = 1440;
const TYPOGRAPHY_OFFSET_X = (WIDTH / 8) * 6 - TYPOGRAPHY_WIDTH / 2;
const TYPOGRAPHY_OFFSET_Y = (HEIGHT / 32) * 7 - TYPOGRAPHY_HEIGHT / 2;
const CHARACTERS_CONFIGS = TYPOGRAPHY_CHARACTERS.map(datum => {
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  pathEl.setAttribute('d', datum.d);

  const config = {
    ...datum,
    vertexSet: Svg.pathToVertices(pathEl, 30)
  };

  return config;
});
const STATIC_BODY_SHARED_CONFIG = {
  isStatic: true,
  render: {
    fillStyle: '#000',
    lineWidth: 0
  }
};

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

const createTriangle = (
  getPath: (width: number, height: number) => string,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {}
): Body => {
  const body = Body.create({
    label: 'Triangle Body',
    position: { x, y },
    ...(options || {})
  });
  const vertices = Vertices.fromPath(getPath(width, height), body);

  Body.setVertices(body, vertices);
  correctBodyPosition(body, x, y);

  return body;
};

const createDownhillTriangle = (x: number, y: number, width: number, height: number, options?: {}): Body =>
  createTriangle((width, height) => `L 0 0 L ${width} ${height} L 0 ${height}`, x, y, width, height, options);

const createUphillTriangle = (x: number, y: number, width: number, height: number, options?: {}): Body =>
  createTriangle((width, height) => `L 0 ${height} L ${width} 0 L ${width} ${height}`, x, y, width, height, options);

export const createSimuation = (el: HTMLElement) => {
  // create an engine
  const engine = Engine.create({
    gravity: {
      scale: 0.0015
    }
  });

  // create a renderer
  const render = Render.create({
    element: el,
    engine: engine,
    options: {
      wireframes: false,
      width: WIDTH,
      height: HEIGHT,
      background: '#fff'
    }
  });
  const downhill = createDownhillTriangle(
    WIDTH / 16,
    (HEIGHT / 16) * 15,
    WIDTH / 8,
    (HEIGHT / 16) * 2,
    STATIC_BODY_SHARED_CONFIG
  );
  const floor = Bodies.rectangle(WIDTH / 2, (HEIGHT / 8) * 9, WIDTH, HEIGHT / 4, STATIC_BODY_SHARED_CONFIG);
  const uphill = createUphillTriangle(
    (WIDTH / 16) * 10,
    (HEIGHT / 4) * 3,
    (WIDTH / 8) * 4,
    HEIGHT / 2,
    STATIC_BODY_SHARED_CONFIG
  );
  const right = Bodies.rectangle((WIDTH / 16) * 15, (HEIGHT / 4) * 3, WIDTH / 8, HEIGHT / 2, STATIC_BODY_SHARED_CONFIG);

  const person = Bodies.rectangle(WIDTH - 56, 624, 50, 200, {
    // const person = Bodies.rectangle(WIDTH / 2, HEIGHT / 2, 50, 200, {
    isStatic: true,
    render: {
      sprite: {
        xScale: 2,
        yScale: 2,
        xOffset: 0.2,
        yOffset: 0.05,
        texture: `${__webpack_public_path__}title-card/person.svg`
      },
      fillStyle: '#000',
      lineWidth: 0
    }
  });

  const characters = CHARACTERS_CONFIGS.map(config => {
    const x = TYPOGRAPHY_OFFSET_X + config.x + config.w / 2;
    const y = TYPOGRAPHY_OFFSET_Y + config.y + config.h / 2;

    // Simple boxes
    // const body = Bodies.rectangle(x, y, config.w, config.h, {
    //   render: {
    //     lineWidth: 0,
    //     sprite: {
    //       texture: `${__webpack_public_path__}title-card/${config.c}.svg`
    //     }
    //   }
    // });

    // Polygons from vertices
    const body = Bodies.fromVertices(
      x,
      y,
      [config.vertexSet],
      {
        render: {
          sprite: {
            texture: `${__webpack_public_path__}title-card/${config.c}.svg`
          },
          fillStyle: '#000',
          lineWidth: 0
        }
      },
      true
    );

    correctBodyPosition(body, x, y);

    return body;
  });

  // add all of the bodies to the world
  Composite.add(engine.world, [downhill, floor, uphill, right, person, ...characters]);

  // run the renderer
  // Render.setPixelRatio(render, 2);
  Render.run(render);

  // create runner
  const runner = Runner.create();

  // run the engine
  return () => {
    Runner.start(runner, engine);

    return () => Runner.stop(runner);
  };
};
