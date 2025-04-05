import { RefObject } from 'react'

enum LoadMoreDirection {}

type Props = {
  ref?: RefObject<HTMLDivElement>
  style?: string
  className?: string
  entries?: any[]
  entrySelector?: string
  preloadBackwards?: number
  sensitiveArea?: number
  withAbsolutePositioning?: boolean
  maxHeight?: number
  noScrollRestore?: boolean
  noScrollRestoreOnTop?: boolean
  cacheBuster?: any
  beforeChildren?: React.ReactNode
  scrollContainerClosest?: string
  children: React.ReactNode
  onLoadMore?: ({
    direction,
  }: {
    direction: LoadMoreDirection
    noScroll?: boolean
  }) => void
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  onWheel?: (e: React.WheelEvent<HTMLDivElement>) => void
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<any>) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void
}

const DEFAULT_LIST_SELECTOR = '.listitem'
const DEFAULT_PRELOAD_BACKWARDS = 20
const DEFAULT_SENSITIVE_AREA = 800

function InfiniteScroll({
  ref,
  style,
  className,
  entries,
  entrySelector = DEFAULT_LIST_SELECTOR,
  preloadBackwards = DEFAULT_PRELOAD_BACKWARDS,
  sensitiveArea = DEFAULT_SENSITIVE_AREA,
  withAbsolutePositioning,
  maxHeight,
  noScrollRestore = false,
  noScrollRestoreOnTop = false,
  cacheBuster,
  beforeChildren,
  children,
  scrollContainerClosest,
  onLoadMore,
  onScroll,
  onWheel,
  onClick,
  onKeyDown,
  onDragOver,
  onDragLeave,
}: Props) {}
