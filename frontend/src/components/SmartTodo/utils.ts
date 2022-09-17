import {
  ICategorySelection,
  INumberUtility,
  IPosition,
  IPositionUtility,
  ITodoUtility,
  TodoItemCategory,
} from './types'

export function defaultCategorySelection(): ICategorySelection {
  return { current: null, previous: null }
}

export const NumberUtility: INumberUtility = {
  clamp: (min, value, max) => Math.min(Math.max(min, value), max),
  rand: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
}

export const PositionUtility: IPositionUtility = {
  calculate: (center, radius, count, size, index) => {
    let angle = 0,
      step = (2 * Math.PI) / count

    for (let i = 0; i < index; i += 1) {
      angle += step
    }

    return {
      left: center.left + radius * Math.cos(angle) - size / 2,
      top: center.top + radius * Math.sin(angle) - size / 2,
    }
  },
}

export const TodoUtility: ITodoUtility = {
  applyZones: items => {
    let last = -1,
      zones: number[] = []

    function getZone(): number {
      const next = NumberUtility.rand(1, 4)

      if (!zones.includes(next) && next !== last) {
        zones.push(next)
        last = next

        return next
      } else if (zones.length === 4) {
        zones = []
      }

      return getZone()
    }

    return items.map(item => ({ ...item, zone: getZone() }))
  },
  determineFinalPosition: (count, size, index) => {
    const rect = document.getElementById('smart-todo-selected-category')?.getBoundingClientRect(),
      radius = NumberUtility.clamp(100, window.innerWidth / 4, 300)

    if (!rect) {
      return {
        left: 0,
        top: 0,
      }
    }

    const center: IPosition = { left: rect?.width / 2, top: rect?.height / 2 }

    return PositionUtility.calculate(center, radius, count, size, index)
  },
  determineTargetPosition: id => {
    const rect = document.getElementById(id)?.getBoundingClientRect()

    if (!rect) {
      return {
        left: 0,
        top: 0,
      }
    }

    return {
      left: rect.left,
      top: rect.top,
    }
  },
  getBaseSize: () => NumberUtility.clamp(60, window.innerWidth / 8, 160),
  getIcon: category => {
    switch (category) {
      case TodoItemCategory.Grocery:
        return 'basket'
      case TodoItemCategory.Task:
        return 'check'
      case TodoItemCategory.Reminder:
        return 'bell'
    }
  },
  list: () => {
    const items = [
      {
        category: TodoItemCategory.Grocery,
        description: 'Tomatoes',
        image:
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dG9tYXRvZXN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        quantity: 3,
      },
      {
        category: TodoItemCategory.Grocery,
        description: 'Bunch of cherries',
        image:
          'https://images.unsplash.com/photo-1593070322326-a46449a3db8c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Y2hlcnJpZXN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        quantity: 1,
      },
      {
        category: TodoItemCategory.Grocery,
        description: 'Onions',
        image:
          'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8b25pb25zfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
        quantity: 6,
      },
      {
        category: TodoItemCategory.Grocery,
        description: 'Heads of garlic',
        image:
          'https://images.unsplash.com/photo-1501420193726-1f65acd36cda?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Z2FybGljfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
        quantity: 3,
      },
      {
        category: TodoItemCategory.Grocery,
        description: 'Bag spring mix',
        image:
          'https://images.unsplash.com/photo-1617884638394-d9eef1b0f40e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8c2FsYWR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        quantity: 1,
      },
      {
        category: TodoItemCategory.Grocery,
        description: 'Apples',
        image:
          'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YXBwbGVzfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
        quantity: 8,
      },
      {
        category: TodoItemCategory.Task,
        description: 'Clean gutters',
        image:
          'https://images.unsplash.com/photo-1582586420763-f768dda3d6d0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Z3V0dGVyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      },
      {
        category: TodoItemCategory.Task,
        description: 'Recycling and trash',
        image:
          'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8cmVjeWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      },
      {
        category: TodoItemCategory.Task,
        description: 'Dishes',
        image:
          'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZGlzaGVzfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      },
      {
        category: TodoItemCategory.Task,
        description: 'Vacuum backyard',
        image:
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dmFjdXVtfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      },
      {
        category: TodoItemCategory.Reminder,
        description: 'Cancel gym membership',
        image:
          'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGd5bXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      },
      {
        category: TodoItemCategory.Reminder,
        description: 'Take package to the post office',
        image:
          'https://images.unsplash.com/photo-1531564701487-f238224b7ce3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cG9zdCUyMG9mZmljZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      },
      {
        category: TodoItemCategory.Reminder,
        description: "Call Avery about Ali's party (afternoon)",
        image:
          'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YmlydGhkYXklMjBwYXJ0eXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      },
      {
        category: TodoItemCategory.Reminder,
        description: 'Water the dogs',
        image:
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      },
      {
        category: TodoItemCategory.Reminder,
        description: 'Fold laundry',
        image:
          'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8bGF1bmRyeXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      },
    ].map((item, index) => ({
      ...item,
      id: index.toString(),
      selected: false,
      size: NumberUtility.rand(80, 120) / 100,
      zone: 0,
    }))

    return TodoUtility.applyZones(TodoUtility.shuffle(items))
  },
  shuffle: items => {
    const shuffled = [...items]

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))

      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
  },
  sumSize: (items, size) => {
    return items.reduce((sum, item) => sum + size * ((item as any).size ?? 1) * 1.5, 0)
  },
}
