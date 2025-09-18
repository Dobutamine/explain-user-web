import * as models from "./ModelIndex";

export default class Model {
  // declare an object holding the model engine API worker thread
  modelEngine = {};

  // declare an object holding the model definition as loaded from the server
  modelDefinition = {};

  // declare an object holding the model data
  modelData = {};
  modelDataSlow = {};

  // declare an object holding the model state
  modelState = {};

  // declare an object holding a saved model state
  savedState = {}

  // declare object holding the status message
  statusMessage = "";

  // declare a message log
  message_log = [];
  no_logs = 25;

  // declare the events
  _rt_start_event = new CustomEvent("rt_start");
  _rt_stop_event = new CustomEvent("rt_stop");
  _rts_event = new CustomEvent("rts");
  _rtf_event = new CustomEvent("rtf");
  _status_event = new CustomEvent("status");
  _state_event = new CustomEvent("state");
  _data_event = new CustomEvent("data");
  _data_slow_event = new CustomEvent("data_slow");
  _state_saved_event = new CustomEvent("state_saved")

  constructor() {
    // spin up a new model engine API worker thread
    this.modelEngine = new Worker(new URL("./ModelEngine.js?worker", import.meta.url), { type: "module" });

    // set up a listener for messages from the model engine API
    this.receive();
  }

  // send a message to the model engine API
  send(message) {
    if (this.modelEngine) {
      this.modelEngine.postMessage(message);
    }
  }

  // recieve messages from the model engine API
  receive() {
    // set up a listener for messages from the model engine
    this.modelEngine.onmessage = (e) => {
      switch (e.data.type) {
        case "state":
          this.modelState = e.data.payload;
          document.dispatchEvent(this._state_event);
          break;
        case "status":
          this.statusMessage = e.data.message
          this.message_log.push({ time: new Date(), message: e.data.message });
          if (this.message_log.length > this.no_logs) {
            this.message_log.shift();
          }
          document.dispatchEvent(this._status_event)
          break;
        case "model_ready":
          const model_ready_event = new CustomEvent("model_ready", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(model_ready_event);
          break;
        case "rt_start":
          document.dispatchEvent(this._rt_start_event);
          break;
        case "rt_stop":
          document.dispatchEvent(this._rt_stop_event);
          break;
        case "data":
          this.modelData = e.data.payload;
          document.dispatchEvent(this._data_event);
          break;
        case "data_slow":
          this.modelDataSlow = e.data.payload;
          document.dispatchEvent(this._data_slow_event);
          break;
        case "rtf":
          this.modelData = e.data.payload;
          document.dispatchEvent(this._rtf_event);
          break;
        case "rts":
          this.modelDataSlow = e.data.payload;
          document.dispatchEvent(this._rts_event);
          break;
        case "prop_value":
          const _prop_value_event = new CustomEvent("prop_value", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_prop_value_event)
          break;
        case "model_props":
          const _model_props_event = new CustomEvent("model_props", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_model_props_event)
          break;
        case "model_interface":
          const _model_interface_event = new CustomEvent("model_interface", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_model_interface_event)
          break;
        case "modeltype_interface":
          const _modeltype_interface_event = new CustomEvent("modeltype_interface", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_modeltype_interface_event)
          break;
        case "model_types":
          const _model_types_event = new CustomEvent("model_types", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_model_types_event)
          break;
        case "state_saved":
          this.savedState = this._processModelState({...e.data.payload})
          const _state_saved_event = new CustomEvent("state_saved");
          document.dispatchEvent(_state_saved_event)
          break;
        default:
          console.log("Unknown message type received from model engine");
          console.log(e.data);
          break;
      }
    };
  }

  // ---------------------------------------------------------
  // API CALLS
  // ---------------------------------------------------------

  // build the model from the model definition object
  build(explain_definition) {
    this.message_log = [];
    console.log("Model: Injecting the model definition into the ModelEngine.")
    this.modelDefinition = { ...explain_definition };
    this.send({
      type: "POST",
      message: "build",
      payload: JSON.stringify(explain_definition),
    });
  }

  // restart the model engine
  restart() {
    this.message_log = [];
    this.send({
      type: "POST",
      message: "build",
      payload: JSON.stringify(this.modelDefinition),
    });
  }

  // calculate the model output for a specific time period
  calculate(time_to_calculate) {
    this.send({
      type: "POST",
      message: "calc",
      payload: parseInt(time_to_calculate),
    });
  }

  // start the realtime model
  start() {
    this.send({
      type: "POST",
      message: "start",
      payload: [],
    });
  }

  // stop the realtime model
  stop() {
    this.send({
      type: "POST",
      message: "stop",
      payload: [],
    });
  }

  // clear the model property watch list (fast update)
  clearWatchList() {
    this.send({
      type: "DELETE",
      message: "watchlist",
      payload: [],
    });
  }

  // clear the model property watch list (slow update)
  clearWatchListSlow() {
    this.send({
      type: "DELETE",
      message: "watchlist_slow",
      payload: [],
    });
  }

  // add properties to the watch list (fast update)
  watchModelProps(args) {
    // args is an array of strings with format model.prop1.prop2
    if (typeof args === "string") {
      args = [args];
    }
    this.send({
      type: "POST",
      message: "watch",
      payload: args,
    });
  }

  // add properties to the watch list (slow update)
  watchModelPropsSlow(args) {
    // args is an array of strings with format model.prop1.prop2
    if (typeof args === "string") {
      args = [args];
    }
    this.send({
      type: "POST",
      message: "watch_slow",
      payload: args,
    });
  }

  // get the data from the DataCollector (fast update data)
  getModelData() {
    this.send({
      type: "GET",
      message: "data",
      payload: [],
    });
  }

  // get the data from the DataCollector (fast update data)
  getModelDataSlow() {
    this.send({
      type: "GET",
      message: "data_slow",
      payload: [],
    });
  }

  // set the fast update sample interval in seconds of the model engine DataCollector
  setSampleInterval(new_interval) {
    this.send({
      type: "PUT",
      message: "sample_interval",
      payload: new_interval,
    });
  }

  // set the slow update sample interval in seconds of the model engine DataCollector
  setSampleIntervalSlow(new_interval) {
    this.send({
      type: "PUT",
      message: "sample_interval_slow",
      payload: new_interval,
    });
  }

  // get the current model state
  getModelState() {
    this.send({
      type: "GET",
      message: "state",
      payload: [],
    });
  }

  // save the current model state
  saveModelState() {
    this.send({
      type: "POST",
      message: "save",
      payload: [],
    });
  }

  // get the properties of a specific model instance
  getModelProps(model_name) {
    // get the properties of a specific model
    this.send({
      type: "GET",
      message: "model_props",
      payload: model_name,
    });
  }

  // get all the model types
  getModelTypes() {
    // get all the model types
    this.send({
      type: "GET",
      message: "model_types",
      payload: {},
    });
  }

  // get the interface of a model type
  getModelTypeInterface(model_type) {
    // get the interface of a specific modeltype
    return models[model_type].model_interface || [];
  }

  // get the interface of a specific model instance
  getModelInterface(model_name) {
    // get the model type of a specific model
    let model_type = this.modelState.models[model_name].model_type;
    // get the interface of a specific model type
    return models[model_type].model_interface || [];
  }

  // get the blood composition of a blood containing model instance
  getBloodComposition(model_name) {
    // get the interface of a specific model
    this.send({
      type: "GET",
      message: "blood_composition",
      payload: model_name,
    });
  }

  // add a new model instance
  addNewModel(model_args) {
    // get the interface of a specific model
    this.send({
      type: "POST",
      message: "add",
      payload: model_args,
    });
  }

  // delete a model instance
  deleteModel(model_name) {
    // get the interface of a specific model
    this.send({
      type: "DELETE",
      message: "remove",
      payload: model_name,
    });
  }

  // get the value of a property of a model instance
  getPropValue(property) {
    // get the value of a specific property with string format model.prop1.prop2
    this.send({
      type: "GET",
      message: "property_value",
      payload: property,
    });
  }

  // set the value of a property of a model instance
  setPropValue(prop, new_value, it = 1, at = 0) {
    // make sure the it is not zero
    if (it < 0) {
      it = 0;
    }
    let result = prop.split(".");
    let model = result[0];
    let prop1 = result[1];
    let prop2 = null;
    if (result.length > 2) {
      prop2 = result[2];
    }
    // set the property of a model with format {prop: model.prop1.prop2, v: value, at: time, it: time, type: task_type}
    this.send({
      type: "PUT",
      message: "property_value",
      payload: JSON.stringify({
        model: model,
        prop1: prop1,
        prop2: prop2,
        t: new_value,
        it: it,
        at: at,
        type: typeof new_value,
      }),
    });
  }

  // call a function of a specific model instance
  callModelFunction(model_function, args, at = 0) {
    this.send({
      type: "POST",
      message: "call",
      payload: JSON.stringify({
        func: model_function,
        args: args,
        it: 0,
        at: at,
        type: "function",
      }),
    });
  }

  // ------------------------------------------------------------------------------------
  // define the local model functions
  // ------------------------------------------------------------------------------------

  // process the model state before sending it
  _processModelState(model_state) {
    // transfrom the modelstate object to a serializable object by removing the helper objects
    delete model_state["DataCollector"];
    delete model_state["TaskScheduler"];
    // remove the ncc counters
    for (const key in model_state) {
      if (key.startsWith("ncc")) {
        delete model_state[key];
      }
    }
    // iterate over all model and delete the local attributes
    Object.values(model_state.models).forEach((m) => {
      for (const key in m) {
        if (key.startsWith("_")) {
          delete m[key];
        }
        if (key === 'components') {
          if (Object.keys(m[key]).length > 0) {
            // build name array of keys
            let key_names = [] 
            Object.keys(m[key]).forEach(k => {
              key_names.push(k)
            })
            // replace
            key_names.forEach( key_name => {
              m['components'][key_name] = model_state.models[key_name]
              delete model_state.models[key_name]
            })
          }

        }
        delete m["model_interface"];
      }
    });
    return model_state;
  }
}
