import React, { Component } from 'react';
import querystring from 'querystring'

class App extends Component {
  constructor(props) {
    super(props)
    const url = querystring.parse(window.location.search.substring(1))
    const socket = new WebSocket(process.env.REACT_APP_SERVER_HOST || 'wss://' + window.location.host)
    const urlName = url && url.room
    socket.onopen = () => {
      if(urlName) {
        //this.state.socket.send(JSON.stringify({type:'JOIN-ROOM', name: this.refs.name.value, room: urlName}))
        // console.log('opennnn')
      }
    }
    socket.onmessage = (message) => {
      const jsonData = JSON.parse(message.data)
      console.log(jsonData)
      if(jsonData.type === 'CREATED_ROOM') {
        window.history.replaceState('', '', `?room=${jsonData.room}`)
      }
      if(jsonData.type === 'PLAYER_PREPARE') {
        this.setState({
          players: jsonData.data,
          roomId: jsonData.roomId
        })
      }
      if(jsonData.type === 'ALL_ROOM') {
        this.setState({allRoom: jsonData.data})
      }
      if(jsonData.type === 'ALREADY-PLAYER') {
        this.setState({ alreadyMember: true})
      }
      if(jsonData.type === 'CANNOT_START_GAME') {
        this.setState({ startGame: false})
      }
    }
    this.state = {
      socket,
      roomId: '',
      players: [],
      alreadyMember: false,
      name: '',
      startGame: true,
      allRoom:[]
    }
  }

  joinGame = () => {
    const url = querystring.parse(window.location.search.substring(1))
    const urlName = url && url.room
    if(urlName){
      this.state.socket.send(JSON.stringify({type:'JOIN-ROOM', name: this.refs.name.value, room: urlName}))
    }else{
      this.state.socket.send(JSON.stringify({type:'CREATE_ROOM', name: this.refs.name.value}))
    }
    this.setState({
      name: this.refs.name.value
    })
  }

  addCard = () => {
    const { name, roomId } = this.state
    this.state.socket.send(JSON.stringify({
      type: 'ADD_CARD',
      name, roomId
    }))
  }

  sendCard = () => {

  }

  onReady = (status) => {
    this.state.socket.send(JSON.stringify({
      type: 'READY_ROOM',
      ready: status,
      name: this.state.name,
      roomId: this.state.roomId
    }))
  }
  startGame = () => {
    this.state.socket.send(JSON.stringify({
      type: 'START_GAME',
      roomId: this.state.roomId,
      name: this.state.name
    }))
  }
  render() {
    const json = querystring.parse(window.location.search.substring(1));
    const urlInvite = `?room=${json.room}`
    const { name, players, alreadyMember, allRoom} = this.state
    return (
      <div className="huhoh">
        {
          players.length === 0 ?
            <div className='main-login'>
              <div className="game-title">
                21 Game
              </div>
              <div className="login-form">
                <input placeholder="Name.." type="input" className="input-form-name" ref='name'/>
                <div className="join-game-btn"  onClick={ this.joinGame }>JOIN</div>
                { alreadyMember ? <div className="rejected">Already Player</div>: null }
              </div>
            </div>
            :
            <div className="main-prepare">
              <div className="invite-player">
                <b>Invite friend</b>
                <div className="invite-url">
                  <a href={urlInvite} target="_blank">{window.location.host}{urlInvite}</a>
                </div>
              </div>
              <div className="qwop">
                <div className="prepare-player-list">
                  <div className="all-room-title">Room : wdasdawdawd-awdawd-awdawd</div>
                  <div className="prepare-player-detail">
                    { players.map((p, i) => (
                          <div  key={ p.id } className="prepare-player">
                            <div style={p.ready? {'color': 'green'}:{'color': 'red'}}>{p.name}</div>
                            { name === p.name ? 
                              p.ready === false ?
                                <div className="btn-ready" onClick={ ()=>this.onReady(!p.ready) }>READY</div>                      
                                : <div className="btn-cancle"  onClick={ ()=>this.onReady(!p.ready) }>CANCLE</div>
                              : null
                            }
                          </div>
                        )
                      )}
                    { players.map((p) => (
                        p.position === 'head' && name === p.name ?
                          <div key={p.id}>
                            <div className="btn-ready-start pd-btn" onClick={ this.startGame } >START GAME</div>
                            { !this.state.startGame &&  <div className="rejected">All player not yet ready</div> }
                          </div>
                        : null
                      )
                    )}
                  </div>
                </div>

                <div className="all-room">
                  <div className="all-room-title">
                    Other Room
                  </div>
                  <div className="room-list">
                    {
                      allRoom.map((room, i) => (
                        <div key={i} className="room-info">
                          <div className="room-name">
                          { room.roomId }
                          </div>
                          <div className="detail-info-room grid-info">
                            <div className="title-room-hold">
                              {
                                room.players.map((p) => (
                                  <div key={ p.id } className="other-room-name">{p.name}</div>
                                ))
                              }
                            </div>
                          </div>
                          { room.readyRoom ? null : <div className="join-other-room btn-cancle"> Join</div> }
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>  
        }
      </div>
    );
  }
}

function Card({ number }) {
  return (
    <div className='card'>
      <h1 className='card-content'>{ number }</h1>
    </div>
  )
}

function EnemyCard() {
  return (
    <div className='card'>
      <h1 className='card-content'>.</h1>
    </div>
  )
}

export default App;