const { SlashCommandBuilder, MessageFlags, InteractionContextType, PermissionFlagsBits, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Connect the bot to a voice channel')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Channel to connect to')
				.addChannelTypes(ChannelType.GuildVoice))
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') || interaction.member.voice.channel;

		if (!channel || channel.type !== ChannelType.GuildVoice) {
			await interaction.reply({ content: 'Please provide a valid channel.', flags: MessageFlags.Ephemeral });
			return;
		}

		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		connection.subscribe(player);

		await interaction.reply({ content: '🆗', flags: MessageFlags.Ephemeral });
	},
};
