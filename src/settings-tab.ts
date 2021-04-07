import AwsSfnPlugin from './main'
import { App, PluginSettingTab, Setting} from 'obsidian'

export default class SettingTab extends PluginSettingTab {
	plugin: AwsSfnPlugin;

	constructor(app: App, plugin: AwsSfnPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Enable colorized version')
			.setDesc('Add colors to rendered state machines')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.colorizedVersion)
				.onChange(async value => {
					this.plugin.settings.colorizedVersion = value
					await this.plugin.saveSettings()
				})
			)
	}
}
