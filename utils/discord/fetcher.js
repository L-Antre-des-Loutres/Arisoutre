// Récupère sur quelle serveur est le bot ainsi que le nombre de membres
client.guilds.cache.forEach(guild => {
    guild.members.fetch().then(members => {
        console.log(`Fetched ${members.size} members in ${guild.name}`);
    });
});

// Récupère la liste des salons
client.channels.cache.forEach(channel => {
    console.log(`Fetched channel ${channel.name}`);
});

// Récupère le nombre de rôle sur le serveur
client.guilds.cache.forEach(guild => {
    guild.roles.fetch().then(roles => {
        console.log(`Fetched ${roles.size} roles in ${guild.name}`);
    });
});

// Récupère le nombre d'emojis sur le serveur
client.guilds.cache.forEach(guild => {
    guild.emojis.fetch().then(emojis => {
        console.log(`Fetched ${emojis.size} emojis in ${guild.name}`);
    });
});

// Récupère les membres du serveur
client.guilds.cache.forEach(guild => {
    guild.members.fetch().then(members => {
        members.forEach(member => {
            console.log(`Fetched member ${member.user.username}`);
        });
    });
});

// Récupère les rôles du serveur
client.guilds.cache.forEach(guild => {
    guild.roles.fetch().then(roles => {
        roles.forEach(role => {
            console.log(`Fetched role ${role.name}`);
        });
    });
});

// Récupère les emojis du serveur
client.guilds.cache.forEach(guild => {
    guild.emojis.fetch().then(emojis => {
        emojis.forEach(emoji => {
            console.log(`Fetched emoji ${emoji.name}`);
        });
    });
});