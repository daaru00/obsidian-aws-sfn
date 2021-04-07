import { ButtonComponent, Plugin } from 'obsidian'
import Graph, {IsGraphVisible} from './lib/graph'

export default class AwsSfnPlugin extends Plugin {
	graphs: Graph[]

	async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessor('asl', this.blockProcessor.bind(this))
		this.registerMarkdownPostProcessor(this.postProcessor.bind(this))

		this.registerEvent(
			this.app.workspace.on('resize', () => {
				this.refreshVisibleGraphs()
			})
		)

		this.registerEvent(
			this.app.workspace.on('layout-ready', () => {
				const markdownPreview = document.getElementsByClassName('markdown-preview-view')[0] as HTMLElement;
				if (!markdownPreview) {
					return
				}
				
				this.registerDomEvent(markdownPreview, 'scroll', () => {
					const graphs = this.getAllGraphs()
					for (const graph of graphs) {
						if (IsGraphVisible(graph)) {
							if (graph.classList.contains('.visible')) {
								continue
							}

							graph.removeClass('.hidden')
							graph.addClass('.visible')

							this.onBlockAppear(graph)
						} else {
							if (graph.classList.contains('.hidden')) {
								continue
							}

							graph.removeClass('.visible')
							graph.addClass('.hidden')
						}
					}
				})
			})
		)
	}

	async blockProcessor(content: string, el: HTMLElement): Promise<void> {
		const container = window.createDiv()
		container.addClass('aws-sfn-graph-container')
		container.addClass('loading')
		container.addClass('colorized')
		
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
		container.appendChild(svg)

		el.replaceWith(container)

		const graph = new Graph(container)
		graph.setData(content)

		try {
			graph.renderStateMachine()
			container.removeClass('loading')
		} catch (error) {
			container.removeClass('loading')
			container.addClass('in-error')
			container.innerHTML = error.toString()
			return
		}

		const widget = this.createWidget(graph)
		container.appendChild(widget)
	}

	onBlockAppear(el: HTMLElement): void {
		el.dispatchEvent(new Event('redraw'))
		//console.log('a wild block appeared!', el)
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

	postProcessor(): void {
		this.refreshVisibleGraphs()
	}

	getAllGraphs(): HTMLElement[] {
		return Array.from(window.document.querySelectorAll('.aws-sfn-graph-container'))
	}

	getVisibleGraphs(): HTMLElement[] {
		return this.getAllGraphs().filter(graph => IsGraphVisible(graph))
	}

	refreshVisibleGraphs(): void {
		this.getVisibleGraphs().forEach(graph => graph.dispatchEvent(new Event('redraw')))
	}
}
