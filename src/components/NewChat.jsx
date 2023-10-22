import React, { useState } from "react";
import styles from "./NewChat.module.css";
import { useAddress } from "@thirdweb-dev/react";


function NewChat({ client, messageHistory, conversation, setShowContactList, selectedContact, setShowChat }) {
  const address = useAddress();
  const [inputValue, setInputValue] = useState("");

  // Function to handle sending a message
  const handleSend = async () => {
    if (inputValue) {
      await onSendMessage(inputValue);
      setInputValue("");
    }
  };

  // Function to handle sending a text message
  const onSendMessage = async (value) => {
    return conversation.send(value);
  };

  // MessageList component to render the list of messages
  const MessageList = ({ messages }) => {
    // Filter messages by unique id
    messages = messages.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
    );

  const getUserName = (message) => {
    if(message.senderAddress === address) {
      return "You"
    } else if(selectedContact && selectedContact.profileName !== "No web3 profile") {
        
      return selectedContact.profileName
    } else if(selectedContact && selectedContact.address) {
      return selectedContact.address
    } else {
      return 
    }    
  }

    return (
      <ul className="messageList">
        {messages.map((message, index) => (
          <li
            key={message.id}
            className="messageItem"
            title="Click to log this message to the console">
            <strong style={{color: "#A3C7D6", marginRight: "5px"}}>
              {getUserName(message)}:
            </strong>
            <span>{message.content}</span>
            <span className="date"> ({message.sent.toLocaleTimeString()})</span>
            <span className="eyes" onClick={() => console.log(message)}>
              👀
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Function to handle input change (keypress or change event)
  const handleInputChange = (event) => {
    if (event.key === "Enter") {
      handleSend();
    } else {
      setInputValue(event.target.value);
    }
  };

  const handleBack = () => {
    setShowContactList(true)
    setShowChat(true)
  }

  return (
    <div className={styles.Chat}>
      <div style={{display: "flex", justifyContent: "space-between", width: "90vw", margin: "auto"}}>
        <button onClick={() => handleBack()} className={styles.backButton}>
          Back
        </button>
        <div className={styles.profile}>
          <p>{selectedContact?.profileName}</p>
          <p style={{fontSize: "10px", color: "#8CABFF"}}>{selectedContact?.address}</p>
        </div>
      </div>
      
      <div className={styles.messageContainer}>
        <MessageList messages={messageHistory} />
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.inputField}
          onKeyPress={handleInputChange}
          onChange={handleInputChange}
          value={inputValue}
          placeholder="Type your text here "
        />
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export default NewChat;
