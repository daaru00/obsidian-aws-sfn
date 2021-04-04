export default interface AwsSyncPluginSettings {
	profile: string;
	region: string;
}

export const DEFAULT_SETTINGS: AwsSyncPluginSettings = {
	profile: 'default',
	region: 'us-east-1',
}
