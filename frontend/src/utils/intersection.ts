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

  private shouldUpdate = (entry: any) => {}
}
