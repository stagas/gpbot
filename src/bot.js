import {Path} from "runtime-compat/fs";
import irc_udp from "irc-upd";
import run from "./run.js";
import gpt from "./gpt.js";
import review from "./review.js";
import explain from "./explain.js";
const conf = await new Path(import.meta.url).up(2).join("conf.json").json();

const {irc, openai} = conf;
const {channels} = irc;

const client = new irc_udp.Client(irc.network, irc.user, {channels:
  Object.keys(channels)});

const commands = [",", "."];

const onMessage = async (_, to, message) => {
  const channel = channels[to];

  // only react if in channel
  if (channel === undefined) {
    return;
  }

  if (openai?.api_key !== undefined) {
    if (channel.gpt && message.startsWith("!gpt")) {
      client.say(to, await gpt(openai.api_key, {
        ...openai.completion,
        prompt: message.slice(4).trim(),
      }));
      return;
    }
    if (channel.review && message.startsWith("!review")) {
      client.say(to, await review(openai.api_key, message, openai.review));
      return;
    }
  }

  if (!message.includes(">") && !commands.some(c => c === message)) {
    return;
  }

  const {lines, language, code, explain: _explain} = await run(message);
  lines.forEach(line => client.say(to, line));
  if (openai?.api_key !== undefined && _explain) {
    const {api_key, review} = openai;
    client.say(to, await explain(api_key, language, code, review));
  }
};

client.addListener("message", onMessage);
