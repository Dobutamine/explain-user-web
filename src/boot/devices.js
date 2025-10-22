import HwLung from "src/devices/HwLung";
import Manikin from "src/devices/Manikin";
import EcmoSimulator from "src/devices/EcmoSimulator";

const hwLung = new HwLung();
const manikin = new Manikin();
const ecmoSimulator = new EcmoSimulator();

export { hwLung, manikin, ecmoSimulator };