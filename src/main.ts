import { ButtonComponent, Plugin } from 'obsidian'
import './lib/icons'
import Graph, {IsGraphVisible} from './lib/graph'
import { DEFAULT_SETTINGS, PluginSettings } from './settings'
import SettingTab from './settings-tab'

export default class AwsSfnPlugin extends Plugin {
	settings: PluginSettings
	graphs: Graph[]
	scrollTimeout: number

	async onload(): Promise<void> {
		await this.loadSettings()
		this.addSettingTab(new SettingTab(this.app, this))

		this.registerMarkdownCodeBlockProcessor('asl', this.blockProcessor.bind(this))
		this.registerMarkdownPostProcessor(this.postProcessor.bind(this))

		this.registerEvent(
			this.app.workspace.on('resize', () => {
				this.refreshVisibleGraphs()
			})
		)

		this.registerEvent(
			this.app.workspace.on('layout-ready', () => {
				const markdownPreview = document.getElementsByClassName('markdown-preview-view')[0] as HTMLElement
				if (!markdownPreview) {
					return
				}
				
				this.registerDomEvent(markdownPreview, 'scroll', () => {
					window.clearTimeout(this.scrollTimeout)
					window.setTimeout(this.onScroll.bind(this), 100)
				})
			})
		)
	}

	async blockProcessor(content: string, el: HTMLElement): Promise<void> {
		const container = window.createDiv()
		container.addClass('aws-sfn-graph-container')
		container.addClass('loading')

		if (this.settings.colorizedVersion) {
			container.addClass('colorized')
		}
		
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
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

		const widget = createWidget(graph)
		container.appendChild(widget)
	}

	onScroll(): void {
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
	}

	onBlockAppear(el: HTMLElement): void {
		el.dispatchEvent(new Event('redraw'))
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

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings)

		if (this.settings.colorizedVersion) {
			window.document.querySelectorAll('.aws-sfn-graph-container:not(.colorized)')
				.forEach(graph => graph.addClass('colorized'))
		} else {
			window.document.querySelectorAll('.aws-sfn-graph-container.colorized')
				.forEach(graph => graph.removeClass('colorized'))
		}
	}
}

function createWidget(graph: Graph): HTMLElement {
	const widget = document.createElement('div')
	widget.addClass('aws-sfn-widget')

	new ButtonComponent(widget)
		.setIcon('aws-sfn-zoom-in')
		.onClick(async () => {
			graph.zoomIn()
		})
		
	new ButtonComponent(widget)
		.setIcon('aws-sfn-zoom-out')
		.onClick(async () => {
			graph.zoomOut()
		})

	new ButtonComponent(widget)
		.setIcon('aws-sfn-center')
		.onClick(async () => {
			graph.renderStateMachine()
		})

	return widget
}
