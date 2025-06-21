import { PIXI } from "src/boot/pixi.js";

export default class Connector {
  type = "Connector";
  picto = "blood.png";
  pixiApp = {};
  key = "";
  label = "";
  models = [];
  layout = null;
  dbcFrom = {};
  dbcTo = {};
  
  global_scaling = 1.0;
  global_speed = 1.0;

  sprite = {};
  spriteColor = 0xffffff;
  angle = 0;
  angleCorrection = 0;

  text = {};
  textStyle = {};

  path = null;
  pathType = "straight"
  pathColor = 0x666666;
  pathWidth = 7;
  prevPosition = 0;

  arc = {
    enabled: false,
    from: 0,
    to: 0,
    xCenter: 0,
    yCenter: 0,
    radius: 0,
    reverse: false,
    from_reverse: 0,
    to_reverse: 0,
  };

  line = {
    enabled: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    from: 0,
    to: 0,
    xCenter: 0,
    yCenter: 0,
    radius: 0,
    reverse: false,
    from_reverse: 0,
    to_reverse: 0,
  };

  spritePosition = 0;
  prevSpriteX = 0;
  prevSpriteY = 0;

  constructor(
    pixiApp,
    key,
    label,
    models,
    dbcFrom,
    dbcTo,
    layout,
    picto,
    scaling,
    global_speed = 1.0
  ) {
    this.pixiApp = pixiApp;
    this.key = key;
    this.label = label;
    this.models = models;
    this.dbcFrom = dbcFrom;
    this.dbcTo = dbcTo;
    this.layout = layout;
    this.picto = picto;
    this.global_scaling = scaling;
    this.global_speed = global_speed;
    this.pathWidth = this.layout.path.width * this.global_scaling;
    this.pathColor = this.layout.path.color;
    this.pathType = this.layout.path.type

    this.drawPath();

    this.sprite = PIXI.Sprite.from(this.picto);
    this.sprite["name_sprite"] = key;
    this.sprite["compType"] = this.type;
    this.sprite.anchor = { x: this.layout.sprite.anchor.x, y: this.layout.sprite.anchor.y };
    this.sprite.x = this.dbcFrom.sprite.x;
    this.sprite.y = this.dbcFrom.sprite.y;
    this.sprite.scale.set(
      0.035 * this.dbcFrom.global_scaling * this.layout.sprite.scale.x,
      0.035 * this.dbcFrom.global_scaling * this.layout.sprite.scale.y
    );
    this.sprite.tint = this.layout.sprite.color;
    this.sprite.zIndex = this.layout.general.z_index + 1;
    this.sprite.alpha = this.layout.general.alpha;

    this.pixiApp.stage.addChild(this.sprite);
    this.sprite.eventMode = "none";

    this.registerConnectorWithDbc();
  }
  registerConnectorWithDbc() {
    // register with the dbc
    this.dbcFrom.connectors[this.key] = this;
    this.dbcTo.connectors[this.key] = this;
  }
  drawPath() {
    if (this.path) {
      this.path.clear();
      this.pixiApp.stage.removeChild(this.path);
    }
    this.path = new PIXI.Graphics();
    this.path["name_path"] = this.key;
    this.path.zIndex = this.layout.general.z_index;
    this.path.cacheAsBitmap = true;

    switch (this.pathType) {
      case "straight":
        this.drawPathStraight();
        break;
      default:
        this.drawPathArc();
        break;
    }
  
    this.path.eventMode = "none";
    this.pixiApp.stage.addChild(this.path);
  }

  drawPathArc() {
    if (this.dbcFrom.layout.sprite.pos.type == "arc" && this.dbcTo.layout.sprite.pos.type == "arc") {
      // get the path characteristics
      this.line.enabled = false;
      this.arc.enabled = true;
      let c = 0;
      if (this.dbcFrom.layout.sprite.pos.dgs > this.dbcTo.layout.sprite.pos.dgs) {
        c = 360;
      }
      this.arc.from = this.dbcFrom.layout.sprite.pos.dgs * 0.0174533;
      this.arc.to = (this.dbcTo.layout.sprite.pos.dgs + c) * 0.0174533;
      this.arc.radius = this.dbcFrom.xCenter * this.dbcFrom.radius;
      this.arc.xCenter = this.dbcFrom.xCenter + this.dbcFrom.xOffset;
      this.arc.yCenter = this.dbcFrom.yCenter + this.dbcFrom.yOffset;
      this.arc.reverse = false
      if (this.pathType == "arc_r") {
        this.arc.reverse = true;
        let arc_delta = this.arc.to - this.arc.from
        this.arc.from_reverse = this.arc.to
        this.arc.to_reverse = this.arc.to + (2 * Math.PI - arc_delta)
      }

      // draw the path
      this.path.lineStyle(this.pathWidth, this.pathColor, 1);
      this.path.arc(this.arc.xCenter, this.arc.yCenter, this.arc.radius, this.arc.from, this.arc.to, this.arc.reverse);
        this.spritePosition = this.dbcFrom.layout.sprite.pos.dgs * 0.0174533;
    } else {
      this.arc.enabled = false;
      this.line.enabled = true;

      // now it is difficult to calculate the arc. first calculate center x
      this.line.x1 = this.dbcFrom.sprite.x;
      this.line.y1 = this.dbcFrom.sprite.y;
      this.line.x2 = this.dbcTo.sprite.x;
      this.line.y2 = this.dbcTo.sprite.y;
      this.line.radius = this.dbcFrom.xCenter * this.dbcFrom.radius;

      if (this.pathType == "arc_r") {
        this.line.reverse = true;
      }

      if (this.line.reverse) {
        let radsq = this.line.radius * this.line.radius;
        let q = Math.sqrt(
          (this.line.x2 - this.line.x1) * (this.line.x2 - this.line.x1) +
            (this.line.y2 - this.line.y1) * (this.line.y2 - this.line.y1)
        );
        let x3 = (this.line.x1 + this.line.x2) / 2;
        let y3 = (this.line.y1 + this.line.y2) / 2;

        this.line.xCenter = x3 - Math.sqrt(radsq - (q / 2) * (q / 2)) * ((this.line.y1 - this.line.y2) / q);
        this.line.yCenter = y3 - Math.sqrt(radsq - (q / 2) * (q / 2)) * ((this.line.x2 - this.line.x1) / q)
      } else {
        let radsq = this.line.radius * this.line.radius;
        let q = Math.sqrt(
          (this.line.x2 - this.line.x1) * (this.line.x2 - this.line.x1) +
            (this.line.y2 - this.line.y1) * (this.line.y2 - this.line.y1)
        );
        let x3 = (this.line.x1 + this.line.x2) / 2;
        let y3 = (this.line.y1 + this.line.y2) / 2;

        this.line.xCenter = x3 + Math.sqrt(radsq - (q / 2) * (q / 2)) * ((this.line.y1 - this.line.y2) / q);
        this.line.yCenter = y3 + Math.sqrt(radsq - (q / 2) * (q / 2)) * ((this.line.x2 - this.line.x1) / q);
      }

      let angle1 = Math.atan2(this.line.yCenter - this.line.y1, this.line.x1 - this.line.xCenter) * 57.2958;
      if (this.line.yCenter - this.line.y1 >= 0) {
        angle1 = 180 + (180 - angle1);
      } else {
        angle1 = -angle1;
      }
      this.line.from = angle1 * 0.0174533;

      let angle2 = Math.atan2(this.line.yCenter - this.line.y2, this.line.x2 - this.line.xCenter) * 57.2958;
      if (this.line.yCenter - this.line.y2 >= 0) {
        angle2 = 180 + (180 - angle2);
      } else {
        angle2 = -angle2;
      }
      this.line.to = angle2 * 0.0174533;

      if (this.line.reverse) {
        let line_delta = this.line.to - this.line.from
        this.line.from_reverse = this.line.to;
        this.line.to_reverse = this.line.to + (2 * Math.PI - line_delta)
      }

      this.path.lineStyle(this.pathWidth, this.pathColor, 1);
      this.path.arc(this.line.xCenter, this.line.yCenter, this.line.radius, this.line.from, this.line.to, this.line.reverse);

      this.angleCorrection = 0;
      // if the position line.from is greater then line.to we need a correction factor
      if (this.line.from > this.line.to) {
        this.angleCorrection = Math.PI * 2.0;
      }
    }
  }

  drawPathStraight() {
    this.arc.enabled = false;
    this.line.enabled = true;

    // now it is difficult to calculate the arc. first calculate center x
    this.line.x1 = this.dbcFrom.sprite.x;
    this.line.y1 = this.dbcFrom.sprite.y;
    this.line.x2 = this.dbcTo.sprite.x;
    this.line.y2 = this.dbcTo.sprite.y;

    this.path.lineStyle(this.pathWidth, this.pathColor, 1);
    this.path.moveTo(this.line.x1, this.line.y1);
    this.path.lineTo(this.line.x2, this.line.y2);
  }
  
  update(data) {
    let noData = false;
    this.xCenter = this.dbcFrom.xCenter + this.dbcFrom.xOffset;
    this.yCenter = this.dbcFrom.yCenter + this.dbcFrom.yOffset;

    // get the speed
    let flow = 0;
    let direction = 0;

    this.models.forEach((model) => {
      flow += data[model + ".flow"];
    });

    if (isNaN(flow)) {
      flow = 0.0;
      noData = true;
    }

    if (this.pathType == 'arc_r') {
      this.spritePosition -= (flow / this.models.length) * this.global_speed;
    } else {
      this.spritePosition += (flow / this.models.length) * this.global_speed;
    }
    

    if (flow >= 0) {
      direction = 0;
      if (this.layout.general.tinting) {
        this.sprite.tint = this.dbcFrom.sprite.tint;
      } 
    } else {
      direction = Math.PI;
      if (this.layout.general.tinting) {
        this.sprite.tint = this.dbcTo.sprite.tint;
      }
    }

    if (noData) {
      this.sprite.alpha = 0.0;
    } else {
      this.sprite.alpha = this.layout.general.alpha;
    }

    // get the position of the dbc's
    const x1 = this.dbcFrom.sprite.x;
    const y1 = this.dbcFrom.sprite.y;
    const x2 = this.dbcTo.sprite.x;
    const y2 = this.dbcTo.sprite.y;

    // calculate the angle
    this.angle = 0;
    this.angle = Math.atan2(this.sprite.y - y2, this.sprite.x - x2) - 0.785 * 2;
    if (flow < 0) {
      this.angle = Math.atan2(this.sprite.y - y1, this.sprite.x - x1) - 0.785 * 2;
    }

    // caulcate the new position if the
    if (this.pathType == "straight") {
      this.followPathStraight(x1, y1, x2, y2)
    } else {
      this.followPathArc(x1, y1, x2, y2)
    }

    this.sprite.rotation = this.angle + direction;
    this.prevPosition = this.spritePosition;

    this.prevSpriteX = this.sprite.x;
    this.prevSpriteY = this.sprite.y;
  }

  followPathArc(x1, y1, x2, y2) {
    if (this.line.enabled) {
      if (this.line.reverse) {
        if (this.spritePosition > this.line.to_reverse) {
          this.spritePosition = this.line.from_reverse + this.angleCorrection;
        }
        if (this.spritePosition < this.line.from_reverse + this.angleCorrection) {
          this.spritePosition = this.line.to_reverse;
        }
      } else {
        if (this.spritePosition > this.line.to) {
          this.spritePosition = this.line.from - this.angleCorrection;
        }
        if (this.spritePosition < this.line.from - this.angleCorrection) {
          this.spritePosition = this.line.to;
        }
      }

      this.sprite.x = this.line.xCenter + Math.cos(this.spritePosition) * this.line.radius;
      this.sprite.y = this.line.yCenter + Math.sin(this.spritePosition) * this.line.radius;

      this.angle = this.spritePosition + Math.PI;
    }

    if (this.arc.enabled) {
      if (this.arc.reverse) {
        if (this.spritePosition > this.arc.to_reverse) {
          this.spritePosition = this.arc.from_reverse;
        }
        if (this.spritePosition < this.arc.from_reverse) {
          this.spritePosition = this.arc.to_reverse;
        }
      } else {
        if (this.spritePosition > this.arc.to) {
          this.spritePosition = this.arc.from;
        }
        if (this.spritePosition < this.arc.from) {
          this.spritePosition = this.arc.to;
        }
      }

        this.sprite.x = this.arc.xCenter + Math.cos(this.spritePosition) * this.arc.radius;
        this.sprite.y = this.arc.yCenter + Math.sin(this.spritePosition) * this.arc.radius;

        this.angle = this.spritePosition + Math.PI;
    }
  }

  followPathStraight(x1, y1, x2, y2) {
    const remapT = this.remap(this.spritePosition, 0, 1, 0, 1);
    const t = remapT / 1;
    this.sprite.x = (1 - t) * x1 + t * x2;
    this.sprite.y = (1 - t) * y1 + t * y2;

    if (remapT > 1) {
      this.spritePosition = 0;
    }
    if (remapT < 0) {
      this.spritePosition = 1;
    }
  }

  remap(value, from1, to1, from2, to2) {
    return ((value - from1) / (to1 - from1)) * (to2 - from2) + from2;
  }
}
