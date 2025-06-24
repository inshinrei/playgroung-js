export const weissConfig = {
  actions: new Map([
    [
      'send_message',
      {
        tt: 'Send message',
        // Object, or Array (in order) [[tt, String], [tt, LongString]]
        required: {
          recipient: 'string',
          message: 'string_long'
        }
      }
    ]
  ])
}

function decor() {
}

@decor('Send message', [['to']])
function outer() {
}

/**
 *
 * */