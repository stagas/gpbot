import bot from "./src/bot.js";
import {default as store, sqlite} from "@primate/store";

export default {
  http: {
    port: 8181,
  },
  logger: {
    trace: true,
  },
  modules: [
    store({driver: sqlite({filename: "data.db"})}),
    (_ => {
      let client;
      return {
        name: "bot",
        init() {
          client = bot();
        },
        route(request, next) {
          return next({...request, say: (...args) => client.say(...args)});
        },
      };
    })(),
  ],
};
