import * as os from 'os'
import * as path from 'path'
import { Plugin } from 'obsidian'
import AwsCredentials, { AwsProfile } from './lib/aws'
import AwsSfnPluginSettings, { DEFAULT_SETTINGS } from './settings'
import AwsSfnSettingTab from './settings-tab'
import { graphvizSync } from "@hpcc-js/wasm";

export default class AwsSfnPlugin extends Plugin {
	settings: AwsSfnPluginSettings;
	statusBarItem: HTMLElement;
	awsCredentials: AwsCredentials;

	async onload(): Promise<void> {
		this.awsCredentials = new AwsCredentials(path.join(os.homedir(), '.aws', 'credentials'))
		await this.awsCredentials.loadProfiles()

		await this.loadSettings();
		this.addSettingTab(new AwsSfnSettingTab(this.app, this));

		const profile = this.getConfiguredProfile()
		this.statusBarItem = this.addStatusBarItem()
		this.setStatusBarProfile(profile)

		this.registerMarkdownCodeBlockProcessor('asl', this.blockProcessor.bind(this))
	}

	setStatusBarProfile(profile?: AwsProfile|undefined): void {
		let msg = 'AWS profile: '
		if (profile) {
			msg += profile.name
		}
		this.statusBarItem.setText(msg)
	}

	getConfiguredProfile(): AwsProfile | null {
		const configuredProfile = this.awsCredentials.getProfileByName(this.settings.profile)

		if (!configuredProfile) {
			return null
		}

		return configuredProfile
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);

		const profile = this.getConfiguredProfile()
		this.setStatusBarProfile(profile)
	}

	async blockProcessor(content: string, el: HTMLElement): Promise<void> {
		const containerId = 'test' // (new Date()).getTime().toString()

		const container = window.createDiv()
		container.setAttribute("id", containerId)
		container.addClass('aws-sfn')
		el.replaceWith(container);

		const graphviz = await graphvizSync()

		container.innerHTML = graphviz.layout(content, "svg", "dot");
	}
}
