import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Client from "./components/client";

import Overview from "./pages/overview";
import Failed from "./pages/failed";
import Workers from "./pages/workers";
import Delayed from "./pages/delayed";
import Queue from "./pages/queue";
import Locks from "./pages/locks";
import Redis from "./pages/redis";

function PageNotFound() {
  return <p>Page not found</p>;
}

export default function ApplicationRouter() {
  const client = new Client();

  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => <Overview {...props} client={client} />}
        />
        <Route
          exact
          path={["/queue/:queue", "/queue/:queue/:page"]}
          render={(props) => <Queue {...props} client={client} />}
        />
        <Route
          exact
          path={["/failed", "/failed/:page"]}
          render={(props) => <Failed {...props} client={client} />}
        />
        <Route
          exact
          path={["/delayed", "/delayed/:page"]}
          render={(props) => <Delayed {...props} client={client} />}
        />
        <Route
          exact
          path="/workers"
          render={(props) => <Workers {...props} client={client} />}
        />
        <Route
          exact
          path="/locks"
          render={(props) => <Locks {...props} client={client} />}
        />
        <Route
          exact
          path="/redis"
          render={(props) => <Redis {...props} client={client} />}
        />
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
}
