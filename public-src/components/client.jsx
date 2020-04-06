class Client {
  constructor(baseRoute = null) {
    this.baseRoute = baseRoute || window.location.origin;
    this.notifiers = [];
  }

  addNotifier(f) {
    this.notifiers.push(f);
  }

  notify(message) {
    console.error(`[API ERROR] ${message}`);
    this.notifiers.map((n) => n(message));
  }

  async action(data = { file: "" }, path, verb = "GET") {
    let i;

    for (i in data) {
      if (data[i] === null || data[i] === undefined) {
        delete data[i];
      }
    }

    const options = {
      credentials: "include",
      method: verb,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    if (
      Object.keys(data).length > 0 &&
      verb.toUpperCase() === "GET" &&
      path.indexOf("?") < 0
    ) {
      path += "?";
      for (i in data) {
        path += i + "=" + data[i] + "&";
      }
    }

    if (verb.toUpperCase() === "GET") {
      //
    } else if (data.file) {
      delete options.headers;
      options["body"] = new FormData();
      for (i in data) {
        options["body"].append(i, data[i]);
      }
    } else {
      options["body"] = JSON.stringify(data);
    }

    function parseJSON(response) {
      return response.json();
    }

    return fetch(this.baseRoute + path, options)
      .then(parseJSON)
      .then(function (response) {
        if (response.error) {
          throw response.error;
        }
        return response;
      })
      .catch((error) => {
        this.notify(error);
      });
  }
}

export default Client;
