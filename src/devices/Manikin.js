export default class Manikin {
    constructor() {
        // spin up a new model engine API worker thread
        this.manikinEngine = new Worker(new URL("./ManikinEngine.js?worker", import.meta.url), { type: "module" });

        // set up a listener for messages from the model engine API
        this.receive();
    }
    receive() {
        this.manikinEngine.onmessage = (event) => {
            const { type, message, payload } = event.data;

            // handle different types of messages from the model engine API here
            console.log(`Received message from ManikinEngine - Type: ${type}, Message: ${message}`, payload);
        };
    }
}