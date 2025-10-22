export default class EcmoSimulator {
    constructor() {
        // spin up a new model engine API worker thread
        this.ecmoSimulatorEngine = new Worker(new URL("./EcmoSimulatorEngine.js?worker", import.meta.url), { type: "module" });

        // set up a listener for messages from the model engine API
        this.receive();
    }
    receive() {
        this.ecmoSimulatorEngine.onmessage = (event) => {
            const { type, message, payload } = event.data;

            // handle different types of messages from the model engine API here
            console.log(`Received message from EcmoSimulatorEngine - Type: ${type}, Message: ${message}`, payload);
        };
    }
}