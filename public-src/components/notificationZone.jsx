import React from 'react';
import { Alert, Button } from 'react-bootstrap';

// this.props.show: boolean
// this.props.level: level
// this.props.message: message

export default React.createClass({
  getInitialState(){
    return {
      show: false,
      level: 'warning',
      message: '',
    };
  },

  titleize: function(word){
    let words = [];
    let currentWord = '';
    let i = 0;

    while(i < word.length){
      if(currentWord.length === 0){
        currentWord += word[i].toUpperCase();
      }else if(word[i] === word[i].toLowerCase()){
        currentWord += word[i];
      }else{
        words.push(currentWord);
        currentWord = word[i];
      }
      i++;
    }

    if(currentWord.length > 0){ words.push(currentWord); }

    return words.join(' ');
  },

  sentanceize: function(sentance){
    sentance = sentance[0].toUpperCase() + sentance.substring(1);
    let end = sentance[(sentance.length - 1)];
    if(['.', '!'].indexOf(end) < 0){
      sentance = sentance + '.';
    }

    return sentance;
  },

  componentWillReceiveProps(nextProps){
    if(nextProps.message){
      clearTimeout(this.state.timer);
      let timer = setTimeout(() => {
        this.setState({show: false});
      }, 5000);

      this.setState({
        timer: timer,
        show: true
      });
    }

    if(nextProps.level){ this.setState({level: nextProps.level}); }
    if(nextProps.message){ this.setState({message: nextProps.message}); }
  },

  componentWillUnmount(){
    clearTimeout(this.state.timer);
  },

  render(){
    if (this.state.show){
      return (
        <Alert bsStyle={this.state.level} onDismiss={this.handleAlertDismiss}>
          <h4>{this.titleize(this.state.level)}</h4>
          <p>{this.sentanceize(this.state.message)}</p>
        </Alert>
      );
    }

    return null;
  },

  handleAlertDismiss(){
    this.setState({show: false});
  },

  handleAlertShow(){
    this.setState({show: true});
  }
});
