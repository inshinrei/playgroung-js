interface IIntersectionObserver {}

interface IntersectionObserverParams {
  header: Element | null | undefined
  sections: NodeListOf<Element> | null | undefined
  headerLinks: NodeListOf<Element> | null | undefined
  threshold: number | undefined
}

interface IntersectionObserverOptions {
  rootMargin: string
  threshold: number
}

export class IntersectionObserver implements IIntersectionObserver {
  private header: Element | null = document.querySelector('[data-header]') ?? null
  private sections: NodeListOf<Element> | [] = document.querySelectorAll('[data-section]') ?? []
  private headerLinks: NodeListOf<Element> | [] = document.querySelectorAll('[data-link]') ?? []

  prevYPosition = 0
  direction: 'up' | 'down' = 'up'

  private options: IntersectionObserverOptions = {
    rootMargin: '0px',
    threshold: 0,
  }

  constructor(params: IntersectionObserverParams) {
    const { threshold } = params
    this.options = {
      threshold: threshold || 0,
      rootMargin: `${(this.header as any)?.offsetHeight * -1}px`,
    }
  }

  private getTargetSection = (entry: any) => {
    const index = sections.findIndex(section => section == entry.target)

    if (index >= sections.length - 1) {
      return entry.target
    } else {
      return sections[index + 1]
    }
  }

  private updateColors = (target: any) => {
    const theme = target?.dataset?.section
    this.header?.setAttribute('data-theme', theme)
  }

  private shouldUpdate = (entry: any) => {
    if (this.direction === 'down' && !entry?.isIntersecting) {
      return true
    }

    if (this.direction === 'up' && entry?.isIntersecting) {
      return true
    }

    return false
  }

  private updateMarker = (target: any) => {
    const { id } = target

    if (!id) {
      return
    }

    let link = this.headerLinks.find((link: Element) => link.getAttribute('href') === `#${id}`)
    link = link || headerLinks[0]

    const distanceFromLeft = link.getBoundingClientRect().left

    this.header?.style.setProperty('--markerWidth', `${link.clientWidth}px`)
    this.header?.style.setProperty('--markerLeft', `${distanceFromLeft}px`)
  }

  public onIntersect = (entries: any[]) => {}
}
