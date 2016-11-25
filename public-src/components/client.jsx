class Client {
  constructor (baseRoute) {
    this.baseRoute = baseRoute || window.location.origin
  };

  notify (message, level) {
    console.log(`[${level}]: ${message}`)
    if (level === 'error') { console.error(message) }
  }

  action (data, path, verb, successCallback, errorCallback) {
    let i

    // TODO
    // $('button').prop('disabled', true);

    if (typeof successCallback !== 'function') {
      successCallback = (response) => {
        let successMessage = 'OK!'
        if (response.message) { successMessage = response.message }
        this.notify(successMessage, 'success')
      }
    }

    if (typeof errorCallback !== 'function') {
      errorCallback = (errorMessage, error) => {
        this.notify(errorMessage, 'danger')
      }
    }

    for (i in data) {
      if (data[i] === null || data[i] === undefined) { delete data[i] }
    }

    let options = {
      credentials: 'include',
      method: verb,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

    if (Object.keys(data).length > 0 && (verb.toUpperCase() === 'GET') && path.indexOf('?') < 0) {
      path += '?'
      for (i in data) { path += i + '=' + data[i] + '&' }
    }

    if (verb.toUpperCase() === 'GET') {
      //
    } else if (data.file) {
      delete options.headers
      options.body = new FormData()
      for (i in data) { options.body.append(i, data[i]) }
    } else {
      options.body = JSON.stringify(data)
    }

    function parseJSON (response) {
      return response.json()
    }

    fetch(this.baseRoute + path, options).then(parseJSON).then(function (response) {
      // $('button').prop('disabled', false);
      if (response.error) { return errorCallback(response.error) }
      return successCallback(response)
    }).catch(function (error) {
      // $('button').prop('disabled', false);
      return errorCallback(error.toString(), error)
    })
  }

}

export default Client
