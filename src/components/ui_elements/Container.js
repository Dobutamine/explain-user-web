import { PIXI } from "src/boot/pixi.js";

export default class Container {
  type = "Container";
  picto = "container.png";
  pixiApp = {};
  key = "";
  label = "";
  models = [];
  layout = null;
  xCenter = 0;
  yCenter = 0;
  xOffset = 0;
  yOffset = 0;
  radius = 0;
  angle = 0;
  rotation = 0;
  global_scaling = 1.0;
  max_to2 = 7.1
  sprite = {};
  text = {};
  textStyle = {};
  connectors = {};
  volume = 0.1;
  to2 = 7.4;
  animation = "none";

  constructor(pixiApp, key, label, models, layout, xCenter, yCenter, xOffset, yOffset, radius, picto, scaling) {
    // store the parameters
    this.pixiApp = pixiApp;
    this.key = key;
    this.label = label;
    this.models = models;
    this.layout = layout;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.radius = radius;
    this.picto = picto;
    this.global_scaling = scaling;
    this.animation = layout.general.animatedBy;

    // define a PIXI sprite
    this.sprite = PIXI.Sprite.from(this.picto);
    this.sprite["name_sprite"] = key;
    this.sprite["type"] = this.type;
    this.sprite.tint = this.layout.sprite.color;
    this.sprite.alpha = this.layout.general.alpha;

    this.sprite.scale.set(
      this.volume * this.layout.sprite.scale.x * this.global_scaling,
      this.volume * this.layout.sprite.scale.y * this.global_scaling
    )

    this.sprite.anchor = { 
      x: this.layout.sprite.anchor.x,
      y: this.layout.sprite.anchor.y 
    }

    this.sprite.rotation = this.layout.sprite.rotation;
    this.sprite.zIndex = this.layout.general.z_index;
      
    // place the sprite on the stage
    switch (this.layout.sprite.pos.type) {
      case "arc":
        this.sprite.x =
          this.xCenter +
          this.xOffset +
          Math.cos(this.layout.sprite.pos.dgs * 0.0174533) *
            this.xCenter *
            this.radius;
        this.sprite.y =
          this.yCenter +
          this.yOffset +
          Math.sin(this.layout.sprite.pos.dgs * 0.0174533) *
            this.xCenter *
            this.radius;
        break;
      case "rel":
        this.sprite.x =
          this.xCenter +
          this.xOffset +
          this.layout.sprite.pos.x * (this.xCenter * radius);
        this.sprite.y =
          this.yCenter +
          this.yOffset +
          this.layout.sprite.pos.y * (this.xCenter * radius);
        break;
    }

    this.pixiApp.stage.addChild(this.sprite);

    //define the caption style and text object and add it to the stage
    this.textStyle = new PIXI.TextStyle({
      fill: this.layout.label.color,
      fontSize: this.layout.label.size,
      fontFamily: "Arial",
      strokeThickness: 0,
    });

    this.text = new PIXI.Text(this.label, this.textStyle);
    this.text["name_text"] = key;
    this.text.anchor = {  x: this.layout.sprite.anchor.x, y: this.layout.sprite.anchor.y };
    this.text.alpha = this.layout.general.alpha;
    this.text.x = this.sprite.x + this.layout.label.pos_x;
    this.text.y = this.sprite.y + this.layout.label.pos_y;
    this.text.rotation = this.layout.label.rotation;
    this.text.zIndex = this.layout.general.z_index + 1;

    this.pixiApp.stage.addChild(this.text);
  }

  update(data) {
    let volume = 0;
    this.models.forEach((model) => {
      volume += data[model + ".vol"];
    });

    if (!isNaN(volume)) {
      this.volume = this.calculateRadiusFromVolume(volume);
    } else {
      this.volume = (0.15 / this.layout.sprite.scale.x) * this.global_scaling;
    }

    this.sprite.scale.set(
      this.volume * this.layout.sprite.scale.x * this.global_scaling,
      this.volume * this.layout.sprite.scale.y * this.global_scaling
    );

    this.sprite.rotation = this.layout.sprite.rotation;
    this.sprite.zIndex = this.layout.general.z_index;

    let scaleFont = this.volume * this.layout.label.size * this.global_scaling;
    if (scaleFont > 1.1) {
      scaleFont = 1.1;
    }

    this.text.rotation = this.layout.label.rotation;
    this.text.x = this.sprite.x + this.layout.label.pos_x;
    this.text.y = this.sprite.y + this.layout.label.pos_y;
    this.text.zIndex = this.sprite.zIndex + 1;

    this.text.scale.set(scaleFont, scaleFont);
    this.text.alpha = this.layout.general.alpha;

    this.sprite.tint = this.layout.sprite.color;
    
  }

  redrawConnectors() {
    Object.values(this.connectors).forEach((connector) => connector.drawPath());
  }

  calculateOnCircle(x, y) {
    const f1 = Math.pow(x - this.xCenter, 2);
    const f2 = Math.pow(y - this.yCenter, 2);
    let distance = Math.abs(Math.sqrt(f1 + f2) - this.radius * this.xCenter);
    let angle = 0;
    if (distance < 5) {
      // on circle
      angle = Math.atan2(this.yCenter - y, x - this.xCenter) * 57.2958;
      if (this.yCenter - y > 0) {
        angle = 180 + (180 - angle);
      } else {
        angle = -angle;
      }
      this.layout.pos.type = "arc";
      this.layout.pos.dgs = angle;
      // snap to the circle
      this.sprite.x =
        this.xCenter + Math.cos(angle * 0.0174533) * this.xCenter * this.radius;
      this.sprite.y =
        this.yCenter + Math.sin(angle * 0.0174533) * this.xCenter * this.radius;
      this.text.x = this.sprite.x + this.layout.text.x;
      this.text.y = this.sprite.y + this.layout.text.y;
    } else {
      this.layout.pos.type = "rel";
    }
  }

  calculateRadiusFromVolume(volume) {
    const _cubicRadius = volume / ((4.0 / 3.0) * Math.PI);
    const _radius = Math.pow(_cubicRadius, 1.0 / 3.0);
    return _radius;
  }
}
