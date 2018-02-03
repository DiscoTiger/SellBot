# Sellbot Guide

Here are some important bits of info if you've added Sellbot to your server:
### Prefix:
The default prefix for sellbot is $. You can change this with the cfg command:
```
cfg prefix !
```

### Commands:
* cfg: Sets values in your servers configuration file
* convert: Converts an ammount one cryptocurrency to another
* help: Displays help about all or specific commands
* info: Displays detailed information about a coin.
* prices: Displays info about a list of currencies configured by your server.

### Administration:
The 'cfg' command can only be used by an administrator. By default, the only administrator is the server owner. Administrators can use the cfg command to add more administrators. The 'admins' key contains user IDs of administrators, and the 'adminRoles' key contains role IDs of administrators.

The following command will make the user with the ID '123456789012345678' an administrator:
```
cfg admins 123456789012345678 add
```

The following command will make any users with the role with the ID '987654321098765432' an administrator:
```
cfg adminRoles 987654321098765432 add
```

If you type `cfg` with no additional arguments you will receive a list of all the options you can set with the `cfg` command.

### Help:
By default, Sellbot will send the response to the help command in a direct message to the user that asked for it. This can be configured with the cfg command.

The following command will make Sellbot send help to a text channel in your server:
```
cfg sendHelpToDM 0
```

The following command will make Sellbot send help to the users DMs:
```
cfg sendHelpToDM 1
```

### Currencies:
The 'prices' command of Sellbot will display information about a list of cryptocurrencies you can configure.
By default the list includes: BTC, BCH, ZEC, ETH, XMR, and LTC
You can add **up to 8** currencies with the following command:
```
cfg currencies YOUR_CURRENCY_SYMBOL_HERE add
```

You can remove currencies from this list with the following command:
```
cfg currencies YOUR_CURRENCY_SYMBOL_HERE remove
```
[![Discord Bots](https://discordbots.org/api/widget/status/323591523713155074.svg)](https://discordbots.org/bot/323591523713155074)
[![Discord Bots](https://discordbots.org/api/widget/servers/323591523713155074.svg)](https://discordbots.org/bot/323591523713155074)