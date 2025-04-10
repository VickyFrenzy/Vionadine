import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { deployCommands } from './util/deploy-commands';

const token: string = process.env.DISCORD_TOKEN!;

interface ExtendedClient extends Client {
	commands: Collection<string, any>;
}

const client: ExtendedClient = new Client({ intents: [GatewayIntentBits.Guilds] }) as ExtendedClient;

client.commands = new Collection<string, any>();
const foldersPath: string = path.join(__dirname, 'commands');
const commandFolders: string[] = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath: string = path.join(foldersPath, folder);
	const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath: string = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, async (readyClient: Client) => {
	console.log(`Ready! Logged in as ${readyClient.user!.tag}`);

	await deployCommands(readyClient.user!.id);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = (interaction.client as ExtendedClient).commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(token);
