  //
  // FRAME
  //
  g.addFrame = () => {
    g.outerBoxLayer = new Konva.Layer();
  
    var pageOutline = new Konva.Rect({
        x: 0,
        y: 0,
        width: sceneWidth,
        height: sceneHeight,
        stroke: 'red',
        strokeWidth: 1,
    });
    g.outerBoxLayer.add(pageOutline);
  
    //create lables
    var outerBox = new Konva.Rect({
        x: g.m,
        y: g.m,
        width: sceneWidth-2*g.m,
        height: sceneHeight-2*g.m,
        fillEnabled: false,
        stroke: '#000',
        strokeWidth: 1,
    });
    g.outerBoxLayer.add(outerBox);
  
    let lh = 100;
    var topLine = new Konva.Line({
        points: [g.m, lh, sceneWidth-g.m, lh],
        stroke: 'black',
        strokeWidth: 1,
      });
    g.outerBoxLayer.add(topLine);
  
    //add layer to stage and draw
    g.outerBoxLayer.draw();
    g.stage.add(g.outerBoxLayer);
  }