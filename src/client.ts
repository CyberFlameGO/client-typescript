import EventEmitter from 'eventemitter3'
import WebSocket from 'isomorphic-ws'
import { type Buffer } from 'node:buffer'
import {
  type ClientMessage,
  type ClientMessageEvent,
  type ClientMessageReply,
} from './types/clientBound.js'
import { type Uuid } from './types/common.js'
import {
  type HandshakeRequest,
  type ServerMessage,
} from './types/serverBound.js'
import { decode, encode } from './utils/msgpack.js'
import { generateUuid } from './utils/uuid.js'

export interface ClientOptions {
  /**
   * WorldQL WebSocket Address
   */
  url: string

  /**
   * Server Auth Token
   */
  auth?: string

  /**
   * Connect to WebSocket automatically
   *
   * Defaults to `false`
   */
  autoconnect?: boolean
}

// #region Events
// eslint-disable-next-line @typescript-eslint/ban-types
type NoArgs = []

interface ClientEvents {
  ready: NoArgs
  error: [error: Error]
}
// #endregion

// #region Connection
interface PartialConnection {
  uuid: Uuid
  ws: WebSocket
}

interface Connection extends PartialConnection {
  token: string
}

// @ts-expect-error Type Predicate
const isFullyConnected: (
  connection: Connection | PartialConnection
) => connection is Connection = connection => {
  if ('token' in connection) {
    return connection.token !== ''
  }

  return false
}
// #endregion

export class Client extends EventEmitter<ClientEvents> {
  private readonly _options: Readonly<ClientOptions>

  private _connection: PartialConnection | Connection | undefined

  constructor(options: Readonly<ClientOptions>) {
    super()

    this._options = options
    if (options.autoconnect) this.connect()
  }

  // #region Public Properties
  public get connected(): boolean {
    return this._connection !== undefined && isFullyConnected(this._connection)
  }
  // #endregion

  // #region Lifecycle
  public connect(): void {
    if (this._connection !== undefined) {
      throw new Error('cannot connect if already connected')
    }

    const uuid = generateUuid()
    const ws = new WebSocket(this._options.url)

    const connection: PartialConnection = { uuid, ws }
    this._connection = connection

    ws.addEventListener('error', ({ error }) => {
      this.emit('error', error)
    })

    ws.addEventListener('open', () => {
      this._onOpen()
    })

    ws.addEventListener('message', async ({ data }) => {
      if (typeof data === 'string') return
      if (Array.isArray(data)) return

      const buffer =
        typeof window === 'undefined'
          ? (data as Buffer)
          : await (data as unknown as Blob).arrayBuffer()

      this._onMessage(buffer)
    })
  }

  public disconnect(): void {
    if (this._connection !== undefined) {
      this._connection.ws.close()
    }

    this._connection = undefined
  }
  // #endregion

  // #region WebSocket Handlers
  private _onOpen(): void {
    if (this._connection === undefined) {
      throw new Error('_onOpen called with no connection')
    }

    const handshake: HandshakeRequest = {
      request: 'handshake',
      server_auth: this._options.auth,
    }

    const message: ServerMessage = {
      sender: this._connection.uuid,
      token: '',
      payload: handshake,
    }

    const encoded = encode(message)
    this._connection.ws.send(encoded)
  }

  private _onMessage(data: ArrayBuffer): void {
    const decoded = decode(data) as ClientMessage

    switch (decoded.type) {
      case 'event': {
        this._handleEvent(decoded)
        break
      }

      case 'reply': {
        this._handleReply(decoded)
        break
      }

      default:
        console.warn('unhandled message type')
        console.log(decoded)

        break
    }
  }

  private _handleEvent(message: ClientMessageEvent): void {
    if (this._connection === undefined) {
      throw new Error('_handleEvent called with no connection')
    }

    // TODO
  }

  private _handleReply(message: ClientMessageReply): void {
    if (this._connection === undefined) {
      throw new Error('_handleReply called with no connection')
    }

    // Handle Handshakes
    if (message.reply === 'handshake') {
      if (message.status === 'error') {
        // TODO
        return
      }

      const connection: Connection = {
        ...this._connection,
        token: message.auth_token,
      }

      this._connection = connection
      this.emit('ready')
    }
  }
  // #endregion
}