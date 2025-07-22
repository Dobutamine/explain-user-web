import { PIXI } from "src/boot/pixi.js";

export default class Exchanger {
  type = "Exchanger";
  picto = "exchanger.png"
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
  rotation = 0;
  global_scaling = 1.0;
  sprite = {};
  text = {};
  textStyle = {};
  connectors = {};
  rotation = 0;
  volume = 0.1;
  editingMode = 1;
  prevX = 0;
  prevyY = 0;
  gas = ""

  constructor(
    pixiApp,
    key,
    label,
    models,
    layout,
    xCenter,
    yCenter,
    xOffset,
    yOffset,
    radius,
    picto,
    scaling
  ) {
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

    // this is a blood compartment sprite which uses
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

    this.gas = ".flux_" + this.layout.general.animatedBy;
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

    // enable interactivity
    this.sprite.eventMode = 'static';
    this.sprite.on('pointertap', (event) => {
      this.tapped(event)
    });

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

    // enable interactivity
    this.text.eventMode = 'static';
    this.text.on('pointertap', (event) => {
      this.tapped(event)
    });

    this.pixiApp.stage.addChild(this.text);
  }

  update(data) {
    let difO2 = 0;

    this.models.forEach((model) => {
      difO2 += data[model + this.gas];
    });
    if (isNaN(difO2)) {
      difO2 = 0.0;
      this.text.alpha = 0.1;
      this.sprite.tint = 0x666666;
    } else {
      this.sprite.tint = 0xbbbbbb;
      this.text.alpha = 1.0;
    }

    // calculate factors
    this.rotation += (difO2 / this.models.length) * 10000;
    if (this.rotation > 2 * Math.PI) {
      this.rotation = 0;
    }
    //console.log(this.rotation);
    this.sprite.rotation = -this.rotation;
    this.text.rotation = this.layout.rotation;
  }

  tapped(event) {
    let selection = { model: "", diagram: this.key}
    if (this.models.length > 0) {
      selection.model = this.models[0]
    }
    const _tap_event = new CustomEvent("sprite_tapped", { detail: selection, bubbles: true, cancelable: true, composed: false });
    document.dispatchEvent(_tap_event)
  }

  redrawConnectors() {
    Object.values(this.connectors).forEach((connector) => connector.drawPath());
  }
  calculateOnCircle(x, y) {
    const f1 = Math.pow(x - this.xCenter, 2);
    const f2 = Math.pow(y - this.yCenter, 2);
    let distance = Math.abs(Math.sqrt(f1 + f2) - this.radius * this.xCenter);
    //console.log(distance - this.radius * this.xCenter);
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
}
