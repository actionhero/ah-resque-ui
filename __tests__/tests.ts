import * as path from "path";
import { Process, task, api, specHelper } from "actionhero";

const sleep = (zzz = 100) => {
  return new Promise((resolve) => {
    setTimeout(resolve, zzz);
  });
};

const app = new Process();

describe("ah-resque-ui", () => {
  beforeAll(async () => {
    // jest.setTimeout(10000);

    await app.initialize();
    await api.redis.clients.client.flushdb();
    await app.start();

    api.tasks.tasks.testTask = {
      name: "testTask",
      description: "testTask",
      queue: "testQueue",
      frequency: 0,
      run: async (params) => {
        if (params.fail === true) {
          throw new Error("broken");
        }
      },
    };

    // api.resque.multiWorker.start();
    api.tasks.jobs.testTask = api.tasks.jobWrapper("testTask");
    await sleep(100); // for the workers to start
  });

  afterAll(async () => {
    // await api.resque.multiWorker.stop();
    delete api.tasks.tasks.testTask;
    delete api.tasks.jobs.testTask;
    await app.stop();
  });

  it("resque:redisInfo", async () => {
    const response = await specHelper.runAction("resque:redisInfo");
    const info = response.redisInfo.join("\n");
    expect(info).toMatch(/redis_version/);
    expect(info).toMatch(/used_memory/);
    expect(info).toMatch(/used_memory_human/);
  });

  it("resque:forceCleanWorker", () => {}); // TODO

  describe("with locks", () => {
    beforeEach(async () => {
      await api.resque.queue.connection.redis.set(
        api.resque.queue.connection.key("lock:lists:queueName:jobName:[{}]"),
        123
      );
    });
    beforeEach(async () => {
      await api.resque.queue.connection.redis.set(
        api.resque.queue.connection.key(
          "workerslock:lists:queueName:jobName:[{}]"
        ),
        456
      );
    });

    afterEach(async () => {
      await api.resque.queue.connection.redis.del(
        api.resque.queue.connection.key("lock:lists:queueName:jobName:[{}]")
      );
    });
    afterEach(async () => {
      await api.resque.queue.connection.redis.del(
        api.resque.queue.connection.key(
          "workerslock:lists:queueName:jobName:[{}]"
        )
      );
    });

    it("resque:locks", async () => {
      const response = await specHelper.runAction("resque:locks");
      expect(Object.keys(response.locks).length).toEqual(2);
      expect(response.locks["lock:lists:queueName:jobName:[{}]"]).toEqual(
        "123"
      );
      expect(
        response.locks["workerslock:lists:queueName:jobName:[{}]"]
      ).toEqual("456");
    });

    it("resque:delLock", async () => {
      let response = await specHelper.runAction("resque:delLock", {
        lock: "workerslock:lists:queueName:jobName:[{}]",
      });
      expect(response.count).toEqual(1);
      response = await specHelper.runAction("resque:locks");
      expect(Object.keys(response.locks).length).toEqual(1);
      expect(response.locks["lock:lists:queueName:jobName:[{}]"]).toEqual(
        "123"
      );
    });
  });

  describe("with jobs", () => {
    beforeEach(async () => {
      await specHelper.runAction("resque:delQueue", { queue: "testQueue" });
      await task.enqueue("testTask", { a: 1 }, "testQueue");
      await task.enqueue("testTask", { b: 2 }, "testQueue");
      await task.enqueue("testTask", { c: 3 }, "testQueue");
    });

    it("resque:resqueDetails", async () => {
      const response = await specHelper.runAction("resque:resqueDetails");
      expect(response.resqueDetails.queues.testQueue.length).toEqual(3);
      expect(Object.keys(response.resqueDetails.workers).length).toEqual(1);
    });

    it("resque:loadWorkerQueues", async () => {
      const response = await specHelper.runAction("resque:loadWorkerQueues");
      const workerNames = Object.keys(response.workerQueues);
      expect(workerNames.length).toBe(1);
      expect(response.workerQueues[workerNames[0]]).toContain("*");
    });

    it("resque:queued (good)", async () => {
      const response = await specHelper.runAction("resque:queued", {
        queue: "testQueue",
      });
      expect(response.jobs.length).toBe(3);
    });

    it("resque:queued (bad)", async () => {
      const response = await specHelper.runAction("resque:queued", {
        queue: "xxx",
      });
      expect(response.jobs.length).toBe(0);
    });

    it("resque:delQueue", async () => {
      await specHelper.runAction("resque:delQueue", { queue: "testQueue" });
      const response = await specHelper.runAction("resque:queued", {
        queue: "testQueue",
      });
      expect(response.jobs.length).toBe(0);
    });
  });

  describe("with delayed jobs", () => {
    beforeAll(async () => {
      await task.enqueueAt(1000, "testTask", { a: 1 }, "testQueue");
      await task.enqueueAt(2000, "testTask", { b: 2 }, "testQueue");
      await task.enqueueAt(3000, "testTask", { c: 3 }, "testQueue");
    });

    it("resque:delayedjobs (defaults)", async () => {
      const response = await specHelper.runAction("resque:delayedjobs");
      expect(response.timestampsCount).toBe(3);
      expect(Object.keys(response.delayedjobs).length).toBe(3);
      expect(response.delayedjobs["1000"].tasks[0].args[0].a).toBe(1);
      expect(response.delayedjobs["2000"].tasks[0].args[0].b).toBe(2);
      expect(response.delayedjobs["3000"].tasks[0].args[0].c).toBe(3);
    });

    it("resque:delayedjobs (pagination)", async () => {
      let response;
      response = await specHelper.runAction("resque:delayedjobs", {
        start: 0,
        stop: 1,
      });
      expect(response.timestampsCount).toBe(3);
      expect(Object.keys(response.delayedjobs).length).toBe(2);
      expect(response.delayedjobs["1000"].tasks[0].args[0].a).toBe(1);
      expect(response.delayedjobs["2000"].tasks[0].args[0].b).toBe(2);

      response = await specHelper.runAction("resque:delayedjobs", {
        start: 2,
        stop: 999,
      });
      expect(response.timestampsCount).toBe(3);
      expect(Object.keys(response.delayedjobs).length).toBe(1);
      expect(response.delayedjobs["3000"].tasks[0].args[0].c).toBe(3);
    });

    it("resque:delDelayed", () => {}); //TODO
    it("resque:runDelayed", () => {}); //TODO
  });

  describe("with failed jobs", () => {
    beforeEach(async () => {
      await specHelper.runAction("resque:delQueue", { queue: "testQueue" });
      await specHelper.runAction("resque:removeAllFailed");
      await task.enqueue("testTask", { a: 1, fail: true }, "testQueue");
      await task.enqueue("testTask", { b: 2, fail: true }, "testQueue");
      await task.enqueue("testTask", { c: 3, fail: true }, "testQueue");

      // should allow time to work the bad jobs
      await sleep(1000);
    });

    it("resque:resqueFailedCount", async () => {
      const response = await specHelper.runAction("resque:resqueFailedCount");
      expect(response.failedCount).toBe(3);
    });

    it("resque:resqueFailed (defaults)", async () => {
      const response = await specHelper.runAction("resque:resqueFailed");
      expect(response.failed.length).toBe(3);
      response.failed.forEach((j) => {
        expect(j.queue).toBe("testQueue");
        expect(j.error).toMatch("broken");
        expect(j.payload.args[0].fail).toBe(true);
      });
    });

    it("resque:resqueFailed (pagination)", async () => {
      let response;
      response = await specHelper.runAction("resque:resqueFailed", {
        start: 0,
        stop: 1,
      });
      expect(response.failed.length).toBe(2);
      expect(response.failed[0].payload.args[0].a).toBe(1);
      expect(response.failed[1].payload.args[0].b).toBe(2);

      response = await specHelper.runAction("resque:resqueFailed", {
        start: 2,
        stop: 99,
      });
      expect(response.failed.length).toBe(1);
      expect(response.failed[0].payload.args[0].c).toBe(3);
    });

    it("resque:removeFailed", async () => {
      await specHelper.runAction("resque:removeFailed", { id: 1 });
      const response = await specHelper.runAction("resque:resqueFailed");
      expect(response.failed.length).toBe(2);
      expect(response.failed[0].payload.args[0].a).toBe(1);
      expect(response.failed[1].payload.args[0].c).toBe(3);
    });

    it("resque:removeAllFailed", async () => {
      await specHelper.runAction("resque:removeAllFailed");
      const response = await specHelper.runAction("resque:resqueFailed");
      expect(response.failed.length).toBe(0);
    });

    it("resque:retryAndRemoveFailed", async () => {
      await specHelper.runAction("resque:retryAndRemoveFailed", { id: 1 });
      const response = await specHelper.runAction("resque:resqueFailed");
      expect(response.failed.length).toBe(2);
      expect(response.failed[0].payload.args[0].a).toBe(1);
      expect(response.failed[1].payload.args[0].c).toBe(3);

      const details = await specHelper.runAction("resque:resqueDetails");
      expect(details.resqueDetails.queues.testQueue.length).toBe(1);
    });

    it("resque:retryAndRemoveAllFailed", async () => {
      await specHelper.runAction("resque:retryAndRemoveAllFailed");
      const response = await specHelper.runAction("resque:resqueFailed");
      expect(response.failed.length).toBe(0);

      const details = await specHelper.runAction("resque:resqueDetails");
      expect(details.resqueDetails.queues.testQueue.length).toBe(3);
    });
  });
});
