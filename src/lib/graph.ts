import sfn from './external/sfn-0.1.5'

export function IsGraphVisible(el: HTMLElement): boolean {
  const scrollPositionTo = el.parentElement.scrollTop + el.parentElement.offsetHeight
    
    const rect = el.getBoundingClientRect()
    const graphPositionFrom = rect.y
    const graphPositionTo = rect.y + el.offsetHeight

    // If bottom of graph is below the top of container
    if (graphPositionTo < 0) {
      return false
    }

    // If top of graph is above the bottom of container
    if (graphPositionFrom > scrollPositionTo) {
      return false
    }
    
    return true
}

export default class Graph {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph: any;
  el: HTMLElement;
  data: string;
  visible: boolean;

  constructor(el: HTMLElement) {
    this.data = '{}'
    this.el = el
    this.el.addEventListener('redraw', this.renderStateMachine.bind(this))
    this.visible = false
  }

  setData(data: string): void {
    this.data = data
  }

  renderStateMachine(): void {
    this.graph = new sfn.StateMachineGraph(JSON.parse(this.data), this.el, {
      width: this.el.offsetWidth,
      height: this.el.offsetHeight,
      resizeHeight: false,
      hideTooltip: true,
    })
    this.graph.render()
  }

  zoomIn(): void {
    if (this.graph) {
      this.graph.zoomIn()
    }
  }

  zoomOut(): void {
    if (this.graph) {
      this.graph.zoomOut()
    }
  }
}
