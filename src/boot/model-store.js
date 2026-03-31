import { boot } from "quasar/wrappers";
import { useModelStore } from "src/stores/model";

export default boot(({ store }) => {
  const modelStore = useModelStore(store);
  modelStore.init();
});
