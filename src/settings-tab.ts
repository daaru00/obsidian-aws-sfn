import { App, PluginSettingTab, Setting } from 'obsidian'
import AwsSfnPlugin from './main';
import { AwsProfile, REGIONS } from './lib/aws'

export default class AwsSfnSettingTab extends PluginSettingTab {
	plugin: AwsSfnPlugin;

	constructor(app: App, plugin: AwsSfnPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const {containerEl} = this;

		containerEl.empty();

		const profiles = await this.plugin.awsCredentials.loadProfiles()
		if (profiles.length > 0) {
			new Setting(containerEl)
				.setName('AWS Profile')
				.setDesc('The name AWS profile name configured in credentials file')
				.addDropdown(dropdown => dropdown
					.addOptions(profiles.reduce((acc: {[key: string]: string}, profile: AwsProfile) => {
						acc[profile.name] = profile.name
						return acc
					}, {}))
					.setValue(this.plugin.settings.profile)
					.onChange(async (value) => {
						this.plugin.settings.profile = value;
						await this.plugin.saveSettings();
					}));
		} else {
			containerEl.createEl('p', {text: 'Cloud not find any AWS profiles!', cls: ['setting-item']});
		}

    new Setting(containerEl)
      .setName('AWS Region')
      .setDesc('The region where Step Function are created')
      .addDropdown(dropdown => dropdown
        .addOptions(REGIONS)
        .setValue(this.plugin.settings.region)
        .onChange(async (value) => {
          this.plugin.settings.region = value;
          await this.plugin.saveSettings();
        }));
	}
}
