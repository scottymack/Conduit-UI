export interface RedisSettings {
    host?:string; // 	default: 127.0.0.1	IP address of the Redis server
    port?:number; // 	    default: 6379	Port of the Redis server
    path?:string; //	    default: null	The UNIX socket string of the Redis server
    url?: string; //	    default: null	The URL of the Redis server. Format: [redis[s]:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]
    string_numbers?: boolean; // default:	null	Set to true, Node Redis will return Redis number values as Strings instead of javascript Numbers. Useful if you need to handle big numbers (above Number.MAX_SAFE_INTEGER === 2^53). Hiredis is incapable of this behavior, so setting this option to true will result in the built-in javascript parser being used no matter the value of the parser option.
    return_buffers?: boolean;  //  default:	false	If set to true, then all replies will be sent to callbacks as Buffers instead of Strings.
    detect_buffers?: boolean; // default:	false	If set to true, then replies will be sent to callbacks as Buffers. This option lets you switch between Buffers and Strings on a per-command basis, whereas return_buffers applies to every command on a client. Note: This doesn't work properly with the pubsub mode. A subscriber has to either always return Strings or Buffers.
    socket_keepalive?: boolean; // default:true	If set to true, the keep-alive functionality is enabled on the underlying socket.
    socket_initial_delay?: number; // default: 0	Initial Delay in milliseconds, and this will also behave the interval keep alive message sending to Redis.
    no_ready_check?: boolean; // default: false	When a connection is established to the Redis server, the server might still be loading the database from disk. While loading, the server will not respond to any commands. To work around this, Node Redis has a "ready check" which sends the INFO command to the server. The response from the INFO command indicates whether the server is ready for more commands. When ready, node_redis emits a ready event. Setting no_ready_check to true will inhibit this check.
    enable_offline_queue?: boolean // default: true	By default, if there is no active connection to the Redis server, commands are added to a queue and are executed once the connection has been established. Setting enable_offline_queue to false will disable this feature and the callback will be executed immediately with an error, or an error will be emitted if no callback is specified.
    retry_unfulfilled_commands?: boolean // default:	false	If set to true, all commands that were unfulfilled while the connection is lost will be retried after the connection has been reestablished. Use this with caution if you use state altering commands (e.g. incr). This is especially useful if you use blocking commands.
    password?: string // default:	null	If set, client will run Redis auth command on connect. Alias auth_pass Note Node Redis < 2.5 must use auth_pass
    db?: string // default:	null	If set, client will run Redis select command on connect.
    family?: string // default:	IPv4	You can force using IPv6 if you set the family to 'IPv6'. See Node.js net or dns modules on how to use the family type.
    disable_resubscribing?: boolean // default:	false	If set to true, a client won't resubscribe after disconnecting.
    rename_commands?: any // default:	null	Passing an object with renamed commands to use instead of the original functions. For example, if you renamed the command KEYS to "DO-NOT-USE" then the rename_commands object would be: { KEYS : "DO-NOT-USE" } . See the Redis security topics for more info.
    tls?: any // default:	null	An object containing options to pass to tls.connect to set up a TLS connection to Redis (if, for example, it is set up to be accessible via a tunnel).
    prefix?: string // default:	null	A string used to prefix all used keys (e.g. namespace:test). Please be aware that the keys command will not be prefixed. The keys command has a "pattern" as argument and no key and it would be impossible to determine the existing keys in Redis if this would be prefixed.
    retry_strategy?: any // default: null function that receives an options object as parameter including the retry attempt, the total_retry_time indicating how much time passed since the last time connected, the error why the connection was lost and the number of times_connected in total. If you return a number from this function, the retry will happen exactly after that time in milliseconds. If you return a non-number, no further retry will happen and all offline commands are flushed with errors. Return an error to return that specific error to all offline commands
}