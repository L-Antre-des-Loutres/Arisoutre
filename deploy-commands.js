const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const commands = [];

const foldersPath = path.join(__dirname, './commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[AVERTISSEMENT] La commande à ${filePath} manque une propriété "data" ou "execute" requise.`);
		}
	}
}


const rest = new REST().setToken(token);

// Déployer les commandes globales
(async () => {
	try {
		console.log(`[INFO] Rafraîchissement de ${commands.length} commandes (/) globales...`);

		// La méthode REST#put() prend deux arguments : une route et un objet de configuration.
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`[INFO] ${commands.length} Commandes (/) globales déployées avec succès.`);
	} catch (error) {
		console.error(`[ERROR] Erreur lors du déploiement des commandes globales : ${error}`);	
	}
})();