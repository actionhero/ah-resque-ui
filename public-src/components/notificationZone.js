import React from 'react'
import { Alert } from 'react-bootstrap'

// this.props.show: boolean
// this.props.level: level
// this.props.message: message

export default React.createClass({
  getInitialState () {
    return {
      show: this.props.show || false,
      level: this.props.level || 'danger',
      message: this.props.message || ''
    }
  },

  titleize: function (word) {
    const words = []
    let currentWord = ''
    let i = 0

    while (i < word.length) {
      if (currentWord.length === 0) {
        currentWord += word[i].toUpperCase()
      } else if (word[i] === word[i].toLowerCase()) {
        currentWord += word[i]
      } else {
        words.push(currentWord)
        currentWord = word[i]
      }
      i++
    }

    if (currentWord.length > 0) { words.push(currentWord) }

    return words.join(' ')
  },

  sentanceize: function (sentance) {
    sentance = sentance[0].toUpperCase() + sentance.substring(1)
    const end = sentance[(sentance.length - 1)]
    if (['.', '!'].indexOf(end) < 0) {
      sentance = sentance + '.'
    }

    return sentance
  },

  componentWillReceiveProps (nextProps) {
    this.setState({
      show: !(nextProps.show === null || nextProps.show === null) ? nextProps.show : this.state.show,
      level: nextProps.level ? nextProps.level : this.state.level,
      message: nextProps.message ? nextProps.message : this.state.message
    })
  },

  render () {
    if (this.state.show) {
      return (
        <Alert bsStyle={this.state.level} onDismiss={this.handleAlertDismiss}>
          <h4>{this.titleize(this.state.level)}</h4>
          <p>{this.sentanceize(this.state.message)}</p>
        </Alert>
      )
    }

    return null
  },

  handleAlertDismiss () {
    this.setState({ show: false })
  }
})
