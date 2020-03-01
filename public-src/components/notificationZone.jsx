import { useState } from "react";
import { Alert } from "react-bootstrap";

function titleize(word) {
  const words = [];
  let currentWord = "";
  let i = 0;

  while (i < word.length) {
    if (currentWord.length === 0) {
      currentWord += word[i].toUpperCase();
    } else if (word[i] === word[i].toLowerCase()) {
      currentWord += word[i];
    } else {
      words.push(currentWord);
      currentWord = word[i];
    }
    i++;
  }

  if (currentWord.length > 0) {
    words.push(currentWord);
  }

  return words.join(" ");
}

function sentenceize(sentence) {
  sentence = sentence[0].toUpperCase() + sentence.substring(1);
  const end = sentence[sentence.length - 1];
  if ([".", "!"].indexOf(end) < 0) {
    sentence = sentence + ".";
  }

  return sentence;
}

export default function(props) {
  const [show, setShow] = useState(props.show || false);
  const [level, setLevel] = useState(props.level || "danger");
  const [message, setMessage] = useState(props.message || "");

  if (!show) {
    return null;
  }

  return (
    <Alert
      variant={level}
      onClose={() => {
        setShow(false);
      }}
    >
      <h4>{titleize(level)}</h4>
      <p>{sentenceize(message)}</p>
    </Alert>
  );
}
