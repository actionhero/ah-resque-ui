import { Process } from "actionhero";

async function main() {
  const app = new Process();

  app.registerProcessSignals();

  await app.start();
}

main();
