import { ButtonComponent, Plugin } from 'obsidian'
import Graph from './lib/graph'

export default class AwsSfnPlugin extends Plugin {

	async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessor('asl', this.blockProcessor.bind(this))
	}

	async blockProcessor(content: string, el: HTMLElement): Promise<void> {
		const container = window.createDiv()
		container.addClass('aws-sfn-graph-container')
		container.addClass('loading')
		
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
		container.appendChild(svg)

		el.replaceWith(container)

		const graph = new Graph(container)
		graph.setData(content)

		try {	
			graph.renderStateMachine()

			// do a dummy wait and redraw the graph
			setTimeout(() => {
				graph.renderStateMachine()
				container.removeClass('loading')
			}, 300)
		} catch (error) {
			container.removeClass('loading')
			container.addClass('in-error')
			container.innerHTML = error.toString()
			return
		}

		const widget = this.createWidget(graph)
		container.appendChild(widget)
	}

	createWidget(graph: Graph): HTMLElement {
		const widget = document.createElement("div");
		widget.addClass('aws-sfn-widget')

		new ButtonComponent(widget)
			.setButtonText("\u29BF")
			.onClick(async () => {
				graph.renderStateMachine()
			})

		new ButtonComponent(widget)
			.setButtonText("\u002B")
			.onClick(async () => {
				graph.zoomIn()
			})
			
		new ButtonComponent(widget)
			.setButtonText("\u2212")
			.onClick(async () => {
				graph.zoomOut()
			})

		return widget
	}

}
