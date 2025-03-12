function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function validateAction(action) {
  assert(typeof action === 'object' || Array.isArray(action), 'actions must be an object')
  assert(typeof action.type !== 'undefined', 'action must have a type')
}

function createStore(reducer, middleware) {
  let state
  let subs = []
  const coreDispatch = action => {
    validateAction(action)
    state = reducer(state, action)
    subs.forEach(handler => handler())
  }
  const getState = () => state
  let store = {
    dispatch: coreDispatch, subscribe: handler => {
      subs.push(handler)
      return () => {
        let index = subs.indexOf(handler)
        if (index > 0) {
          subs.splice(index, 1)
        }
      }
    }
  }
  if (middleware) {
    const dispatch = action => store.dispatch(action)
    store.dispatch = middleware({ dispatch, getState })(coreDispatch)
    coreDispatch({ type: '@@state/init' })
    return store
  }
}

function applyMiddleware(...middlewares) {
  return store => {
    if (middlewares.length === 0) {
      return dispatch => dispatch
    }
    if (middlewares.length === 1) {
      return middlewares[0]
    }
    const boundMiddlewares = middlewares.map(m => m(store))
    return boundMiddlewares.reduce((a, b) => next => a(b(next)))
  }
}

const thunkMiddleware = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action({ dispatch, getState })
  }
  return next(action)
}

const loggingMiddleware = ({ dispatch, getState }) => next => action => {
  console.info('before', getState())
  console.info('action', action)
  const result = next(action)
  console.info('after', getState())
  return result
}
