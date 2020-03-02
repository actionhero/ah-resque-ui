import { Task, task } from "actionhero";
const LIMIT = 50;

module.exports = class MyTask extends Task {
  constructor() {
    super();
    this.name = "spawnTask";
    this.description = "an actionhero task";
    this.frequency = 10;
    this.queue = "fast-queue";
    this.middleware = [];
  }

  async run(data) {
    let i = 0;
    while (i < LIMIT) {
      await task.enqueue("fastTask", {});
      i++;
    }

    return LIMIT;
  }
};
