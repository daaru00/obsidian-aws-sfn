import sfn from './external/sfn-0.1.5'

export default class Graph {
  el: HTMLElement;
  data: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph: any;

  constructor(el: HTMLElement) {
    this.el = el
    this.data = '{}'
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
