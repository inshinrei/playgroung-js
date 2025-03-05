import { createDomElement } from './dom-util.js'

const HOST_COMPONENT = 'host'
const CLASS_COMPONENT = 'class'
const HOST_ROOT = 'root'

const PLACEMENT = 1
const DELETION = 2
const UPDATE = 3
const ENOUGH_TIME = 1
const updateQueue = []
let nextUnitOfWork = null
let pendingCommit = null

export function render(element, container) {
  updateQueue.push({
    from: HOST_ROOT,
    dom: container,
    newProps: { children: elements },
  })
}

export function scheduleUpdate(instance, partialState) {
  updateQueue.push({ from: CLASS_COMPONENT, instance, partialState })
  requestIdleCallback(performWork)
}

function performWork(deadline) {
  workLoop(deadline)
  if (nextUnitOfWork || updateQueue.length > 0) {
    requestIdleCallback(performWork)
  }
}

function workLoop(deadline) {
  if (!nextUnitOfWork) {
    resetNextUnitOfWork()
  }
  while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if (pendingCommit) {
    commitAllWork()
  }
}

function resetNextUnitOfWork() {
  let update = updateQueue.shift()
  if (!update) {
    return
  }
  if (update.partialState) {
    update.instance.__fiber.partialState = update.partialState
  }
  let root =
    update.from === HOST_ROOT
      ? update.dom.__rootContainerFiber
      : getRoot(update.instance.__fiber)
  nextUnitOfWork = {
    tag: HOST_ROOT,
    stateNode: update.dom || root.stateNode,
    props: update.newProps || root.props,
    alternate: root,
  }
}

function getRoot(fiber) {
  let node = fiber
  while (node.parent) {
    node = node.parent
  }
  return node
}

function performUnitOfWork(wipFiber) {
  beginWork(wipFiber)
  if (wipFiber.child) {
    return wipFiber.child
  }
  let uow = wipFiber
  while (uow) {
    completeWork(uow)
    if (uow.sibling) {
      return uow.sibling
    }
    uow = uow.parent
  }
}

function beginWork(wipFiber) {
  if (wipFiber.tag === CLASS_COMPONENT) {
    updateClassComponent(wipFiber)
  } else {
    updateHostComponent(wipFiber)
  }
}

function updateHostComponent(wipFiber) {
  if (!wipFiber.stateNode) {
    wipFiber.stateNode = createDomElement(wipFiber)
  }
  let newChildElements = wipFiber.props.children
  reconcileChildrenArray(wipFiber, newChildElements)
}

function updateClassComponent(wipFiber) {
  let instance = wipFiber.stateNode
  if (instance === null) {
    instance = wipFiber.stateNode = createInstance(wipFiber)
  } else if (wipFiber.props === instance.props && !wipFiber.partialState) {
    cloneChildFibers(wipFiber)
    return
  }
  instance.props = wipFiber.props
  instance.state = { ...instance.state, ...wipFiber.partialState }
  wipFiber.partialState = null
  let newChildElements = wipFiber.stateNode.render()
  reconcileChildrenArray(wipFiber, newChildElements)
}

function arrify(val) {
  return val == null ? [] : Array.isArray(val) ? val : [val]
}

function reconcileChildrenArray(wipFiber, newChildElements) {
  let elements = arrify(newChildElements)
  let index = 0
  let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null
  let newFiber = null
  while (index < elements.length || oldFiber !== null) {
    let prevFiber = newFiber
    let element = index < elements.length && elements[index]
    let sameType = oldFiber && elements && element.type === oldFiber.type
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        tag: oldFiber.tag,
        stateNode: oldFiber.stateNode,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        partialState: oldFiber.partialState,
        effectTag: UPDATE,
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        tag:
          typeof element.type === 'string' ? HOST_COMPONENT : CLASS_COMPONENT,
        props: element.props,
        parent: wipFiber,
        effectTag: PLACEMENT,
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = DELETION
      wipFiber.effects = wipFiber.effects || []
      wipFiber.effects.push(oldFiber)
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    if (index === 0) {
      wipFiber.child = newFiber
    } else if (prevFiber && element) {
      prevFiber.sibling = newFiber
    }
    index += 1
  }
}

function cloneChildFibers(parentFiber) {
  let oldFiber = parentFiber.alternate
  if (!oldFiber.child) {
    return
  }
  let oldChild = oldFiber.child
  let prevChild = null
  while (oldChild) {
    let newChild = {
      type: oldChild.type,
      tag: oldChild.tag,
      stateNode: oldChild.stateNode,
      props: oldChild.props,
      partialState: oldChild.partialState,
      alternate: oldChild,
      parent: parentFiber,
    }
    if (prevChild) {
      prevChild.sibling = newChild
    } else {
      parentFiber.child = newChld
    }
    prevChild = newChild
    oldChild = oldChild.sibling
  }
}

function completeWork(fiber) {
  if (fiber.tag === CLASS_COMPONENT) {
    fiber.stateNode.__fiber = fiber
  }
  if (fiber.parent) {
    let childEffects = (fiber.effects = [])
    let thisEffect = fiber.effectTag !== null ? [fiber] : []
    let parentEffects = fiber.parent.effects || []
    fiber.parent.effects = parentEffects.concat(childEffects, thisEffect)
  } else {
    pendingCommit = fiber
  }
}

function commitAllWork(fiber) {
  fiber.effects.forEach((f) => {
    commitWork(f)
  })
  fiber.stateNode._rootContainerFiber = fiber
  nextUnitOfWork = null
  pendingCommit = null
}

function commitWork(fiber) {
  if (fiber.tag === HOST_ROOT) {
    return
  }
  let domParentFiber = fiber.parent
  while (domParentFiber.tag === CLASS_COMPONENT) {
    domParentFiber.domParentFiber.parent
  }
  let domParent = domParentFiber.stateNode
  if (fiber.effectTag === PLACEMENT && fiber.tag === HOST_COMPONENT) {
    domParent.appendChld(fiber.stateNode)
  } else if (fiber.effectTag === UPDATE) {
    updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === DELETION) {
    commitDeletion(fiber, domParent)
  }
}

function commitDeletion(fiber, domParent) {
  let node = fiber
  while (true) {
    if (node.tag === CLASS_COMPONENT) {
      node = node.child
      continue
    }
    domParent.removeChild(node.stateNode)
    while (node !== fiber && !node.sibling) {
      node = node.parent
    }
    if (node === fiber) {
      return
    }
    node = node.sibling
  }
}
