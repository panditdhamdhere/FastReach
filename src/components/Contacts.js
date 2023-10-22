import React, { useState, useEffect } from 'react'
import styles from "./Chat.module.css";
import { init, useLazyQueryWithPagination, fetchQuery, useLazyQuery } from "@airstack/airstack-react";
import Chat from "./Chat";

init("b532399c1dcd475bbeebe849359a9355");

const Contacts = (props) => {
  const [contacts, setContacts] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [results, setResults] = useState([]);
  const [inputValue, setInputValue] = useState("")
  const [iVariables, setIVariables] = useState({
    eventId: ""
  })
  const [variables, setVariables] = useState({
    name: ""
  })

  const [loading, setLoading] = useState(true)

  const handleChange = (e) => {
    setInputValue(e.target.value)
    console.log(inputValue)
    setIVariables({ eventId: e.target.value })
    console.log(iVariables)

  }

  const handleSubmit = async () => {
    document.querySelector('#inputField').value = ""
    const res = await fetchPoapHolders(iVariables);
    console.log(res)
    setResults(res)
    props.setShowChat(false)
  }

  const poapHolders = `query GetAllAddressesSocialsAndENSOfPOAP($eventId: [String!]) {
    PoapEvents(input: {filter: {eventId: {_in: $eventId}}, blockchain: ALL}) {
      PoapEvent {
        city
        eventId
        description
        endDate
        eventName
        startDate
        tokenMints
        country
        metadata
      }
    }
      Poaps(input: {filter: {eventId: {_in: $eventId}}, blockchain: ALL, limit: 100}) {
        Poap {
          owner {
            identity
            primaryDomain {
              name
            }
            domains {
              name
            }
            socials {
              profileName
              dappName
              dappSlug
              profileImage
              profileUrl
            }
            xmtp {
              isXMTPEnabled
            }
          }
          poapEvent {
            eventId
            city
            country
            description
            endDate
            eventName
            tokenMints
            startDate
          }
          tokenId
        }
      }
    }`;

  const [fetchPoapHolders, { data: poapData, loading: poapLoading, error }] = useLazyQuery(poapHolders, iVariables)

  useEffect(() => {
    resolveContactsAndProfiles();
  }, []);

  const resolveSocial = async (address) => {
    const newQuery = ` 
    query MyQuery {
      Wallet(
        input: {identity: "${address}", blockchain: ethereum}
      ) {
        socials {
          dappName
          profileName
        }        
      }
    }
    `
    const response = await fetchQuery(newQuery)

    if (response.data.Wallet.socials && response.data.Wallet.socials.length > 0) {
      return response?.data?.Wallet?.socials[0].profileName
    }
    return "No web3 profile"
  }

  const resolveContactsAndProfiles = async () => {
    const results = await props.loadConversations()
    let existingContacts = [];
    for (const r of results) {
      existingContacts.push({
        profileName: await resolveSocial(r.peerAddress),
        address: r.peerAddress
      })
      console.log(existingContacts)
    }
    setContacts(existingContacts)
    setLoading(false)
  }

  const goBacktoChats = () => {
    props.setShowChat(true)
    setResults([])
  }

  const setContactDetails = (contact) => {
    const clonedContacts = JSON.parse(JSON.stringify(contacts));
    clonedContacts.push(contact);
    setContacts(clonedContacts);
    localStorage.setItem('airstack-contacts', JSON.stringify(clonedContacts));
    localStorage.setItem('airstack-current-contact', JSON.stringify(contact));
    props.setSelectedContact(contact);
    props.setShowContactList(false);
  }

  const selectExistingContact = (contact) => {
    props.setSelectedContact(contact);
    // props.setShowContactList(false);
  }

  const event = poapData?.PoapEvents?.PoapEvent ? poapData?.PoapEvents?.PoapEvent[0] : { city: "no event found", country: "" }

  return (
    <div className={styles.Contacts}>

      <div>
        <div className={styles.searchInput}>
          <input type="text" placeholder="POAP Id" id="inputField"
            value={inputValue}
            className={styles.inputField} onChange={handleChange} />

          <button className={styles.searchBtn} onClick={handleSubmit} >Search</button>
        </div>
      </div>

      {poapLoading && <div>
        <p>Wait for a minute.....</p>
      </div>
      }
      {error && <div>Error: {error}</div>}

      {results.data && results.data?.PoapEvents?.PoapEvent && iVariables && !props.showChat ? (
        <div className={styles.result}>
          <button className={styles.button} onClick={() => { goBacktoChats() }}>Back to chats</button>
          <div className={styles.event}>
            <img src={event?.metadata.image_url} />
            <div className={styles.eventDetails}>
              <div style={{ display: 'flex' }}>
                <p><span>ID: </span>{event?.eventId}</p>
                <p><span>City: </span>{event?.city}</p>
                <p><span>Country: </span>{event?.country}</p>
              </div>

              <p className={styles.name}>{event?.eventName}</p>

              <p><span>Description: </span>{event?.description}</p>
              <p><span>Attendies: </span>{event?.tokenMints}</p>
              <div style={{ display: 'flex' }}>
                <p><span>From</span>{event?.startDate.slice(0, 10)}</p>
                <p><span>to</span>{event?.endDate.slice(0, 10)}</p>
              </div>

            </div>
          </div>
          <div className={styles.SearchResults}>
            {
              results.data?.Poaps?.Poap.map((poap, index) => {
                const address = poap.owner.identity
                const profileName = poap?.owner.primaryDomain?.name
                return (
                  <div key={index} className={styles.box}>

                    <p className={styles.name}>{poap?.owner.identity}</p>
                    <p className={styles.name}>{poap?.owner.primaryDomain?.name}</p>


                    <div>
                      {poap?.owner.socials?.map((social, index) => {
                        return (
                          <div key={index} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", }}>
                            {social.profileImage ? <img style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "100%", marginRight: "20px" }} src={social.profileImage} /> : ""}

                            <p><span>{social.dappName}: </span>{social.profileName}</p>



                          </div>
                        )
                      })}
                    </div>

                    {

                      poap?.owner?.xmtp && poap?.owner.xmtp?.[0].isXMTPEnabled && poap?.owner?.socials && poap?.owner?.socials[0] ?

                        <button className={styles.btn} onClick={() => setContactDetails({ profileName, address: address })}>message</button>


                        : <span style={{color: "#8CABFF"}}> XMTP disabled</span>
                    }
                  </div>
                )
              })
            }

          </div>
        </div>
      ) :
        ""
      }
      {
        props.showChat ?
          <div className={styles.contacts}>

            {
              loading ? <p style={{ marginTop: "20px", textAlign: "center" }}>Getting Old Chats......</p>
                :
                <div style={{ display: "flex" }}>

                  <div className={styles.chats}>
                    {contacts?.map((c) => {
                      return (
                        <div key={c.address}>
                          <div className={styles.contact} onClick={() => selectExistingContact(c)}>
                            <h3>{c.profileName || "No name set"}</h3>
                            <p>{c.address}</p>
                          </div>

                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.chat}>
                    <Chat
                      client={props.client}
                      conversation={props.conversation}
                      messageHistory={props.messageHistory}
                      selectedContact={props.selectedContact}
                      setShowContactList={props.setShowContactList}
                    />
                  </div>
                </div>
            }
          </div>
          : ""
      }

    </div>
  )
}

export default Contacts