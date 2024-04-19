// HTML 요소 선택(물리엔진 그려질 영역)
const matterContainer = document.querySelector("#melody");

// 지면 두께 및 캔버스 영역 계산
const groundThickness = 60;
let canvasArea = matterContainer.clientWidth * matterContainer.clientHeight;

// Matter.js 모듈 별칭 지정
let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Events = Matter.Events,
  Common = Matter.Common,
  World = Matter.World,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint,
  Composite = Matter.Composite;

// 엔진 생성 및 중력 설정
let engine = Engine.create();
engine.gravity.y = 0.9; // 값이 클 수록 빨라짐
engine.gravity.x = 0;
engine.gravity.scale = 0.001;

// 렌더러 생성
let render = Render.create({
  element: matterContainer,
  engine: engine,
  options: {
    width: matterContainer.clientWidth,
    height: matterContainer.clientHeight,
    background: "transparent",
    wireframes: false,
    showAngleIndicator: false,
  },
});

// 지면 생성
var ground = Bodies.rectangle(
  matterContainer.clientWidth / 2,
  matterContainer.clientHeight + groundThickness / 2 - 100, // - 100 is here for debugging
  matterContainer.clientWidth,
  groundThickness,
  {
    isStatic: true,
    render: {
      fillStyle: "transparent",
    },
  }
);
// 여러 이미지 경로를 배열에 넣기
let imageTextures = ["img/heart.png", "img/clear_heart.png", "img/3d.png"];

// 개체 생성
let imageCount; // 갯수
let imageScale; // 크기
// 이미지 사이즈
let imageSize = {
  width: null,
  height: null,
};

imageScale = 0.2;
imageSize.width = 55;
imageSize.height = 314;
imageCount = 10;

let bottles = [];

for (let i = 0; i < imageCount; i++) {
  let textureIndex = Math.floor(Math.random() * imageTextures.length); // 랜덤한 이미지 인덱스 선택
  let texturePath = imageTextures[textureIndex]; // 선택된 이미지 경로

  let bottle = Bodies.rectangle(
    Math.random() * matterContainer.clientWidth, // 랜덤한 x 위치
    -200, // 시작 지점 (화면 위쪽 밖)
    imageSize.width,
    imageSize.height,
    {
      render: {
        sprite: {
          texture: texturePath, // 랜덤한 이미지 텍스처 지정
          xScale: imageScale,
          yScale: imageScale,
        },
      },
      chamfer: {
        radius: 0,
      },
      friction: 0.3,
      frictionAir: 0.000005,
      restitution: 0.5,
    }
  );

  Body.rotate(bottle, Math.random() * Math.PI); // 랜덤한 회전 각도
  bottles.push(bottle);
}

for (let i = 0; i < bottles.length; i++) {
  let bottle = bottles[i];
  Body.rotate(bottle, Math.floor(Math.random() * 360));
  setTimeout(() => {
    Composite.add(engine.world, bottle);
  }, i * 250);
}

// 왼쪽과 오른쪽 벽 생성
let leftWall = Bodies.rectangle(
  0 - groundThickness / 2,
  matterContainer.clientHeight / 2,
  groundThickness,
  matterContainer.clientHeight * 5,
  {
    isStatic: true,
    render: {
      fillStyle: "transparent",
    },
  }
);

let rightWall = Bodies.rectangle(
  matterContainer.clientWidth + groundThickness / 2,
  matterContainer.clientHeight / 2,
  groundThickness,
  matterContainer.clientHeight * 5,
  {
    isStatic: true,
    render: {
      fillStyle: "transparent",
    },
  }
);
// 마우스 제어 추가
let mouse = Mouse.create(render.canvas);
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});

let shakeScene = function (engine, bodies) {
  let timeScale = 1000 / 60 / engine.timing.lastDelta;

  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i];

    if (!body.isStatic) {
      // scale force for mass and time applied
      let forceMagnitude = 0.03 * body.mass * timeScale;

      // apply the force over a single update
      Body.applyForce(body, body.position, {
        x:
          (forceMagnitude + Common.random() * forceMagnitude) *
          Common.choose([1, -1]),
        y: -forceMagnitude + Common.random() * -forceMagnitude,
      });
    }
  }
};

//마우스 이벤트 핸들러
Events.on(mouseConstraint, "mousemove", function (event) {
  // get bodies
  let foundPhysics = Matter.Query.point(bottles, event.mouse.position);
  shakeScene(engine, foundPhysics);
});

// allow scroll through canvas
mouseConstraint.mouse.element.removeEventListener(
  "mousewheel",
  mouseConstraint.mouse.mousewheel
);
mouseConstraint.mouse.element.removeEventListener(
  "DOMMouseScroll",
  mouseConstraint.mouse.mousewheel
);

// 터치 이벤트 비활성화
mouseConstraint.mouse.element.removeEventListener(
  "touchmove",
  mouseConstraint.mouse.mousemove
);
mouseConstraint.mouse.element.removeEventListener(
  "touchstart",
  mouseConstraint.mouse.mousedown
);
mouseConstraint.mouse.element.removeEventListener(
  "touchend",
  mouseConstraint.mouse.mouseup
);

render.mouse = mouse;

// 엔진에 이미지와 벽, 마우스제어 추가
Composite.add(engine.world, [ground, leftWall, rightWall], mouseConstraint);

// 렌더러 실행
Render.run(render);

// 엔진 생성
var runner = Runner.create();

// 엔진 실행
Runner.run(runner, engine);
