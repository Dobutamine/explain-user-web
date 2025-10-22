export default class HwLung {
    constructor() {
        // spin up a new model engine API worker thread
        this.hwLungEngine = new Worker(new URL("./HwLungEngine.js?worker", import.meta.url), { type: "module" });

        // set up a listener for messages from the model engine API
        this.receive();
    }
    receive() {
        this.hwLungEngine.onmessage = (event) => {
            const { type, message, payload } = event.data;

            // handle different types of messages from the model engine API here
            console.log(`Received message from HwLungEngine - Type: ${type}, Message: ${message}`, payload);
        };
    }
}