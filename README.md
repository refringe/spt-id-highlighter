# SPT ID Highlighter

This extension aids in the development of the [Single Player Tarkov](https://github.com/sp-tarkov) project by providing additional information about items, quests, and other game objects all directly within Visual Studio Code.

## Features

- **Hover Information**: Hover over an item ID to see the full item name or short name, depending on your settings.
- **Multilingual Support**: Choose from a variety of languages for item names and descriptions.

![Hover Feature Example](https://github.com/refringe/spt-id-highlighter/blob/main/images/example.gif?raw=true)

## Requirements

This extension requires Visual Studio Code version 1.40.0 or later.

## Extension Settings

This extension contributes the following settings:

- `spt-id-highlighter.language`: specify the language for item names and descriptions.
- `spt-id-highlighter.nameType`: choose between displaying the full item name or the short name on hover.

## Known Issues

No known issues at this time.

## Release Notes

### v1.1.0

Updates

- Updated to for SPT v3.8.0
- Added trader names
- Added quest names

Fixes

- IDs should now only be highlighted when there are corresponding names available.

### v1.0.2

Enabled for JSON Files

- Update the extension to also work within JSON files.

### v1.0.1

Small README Update

- Updated the README with the correct configuration option names.

### v1.0.0

Initial release of SPT Dev Extension.

- Hover to see item names and descriptions.
- Syntax highlighting for item IDs.
- Language selection for multilingual support.

## License

This extension is licensed under the [NCSA License](LICENSE). The locale assets are provided by the [SPT-AKI project](https://dev.sp-tarkov.com/SPT-AKI/Server) and are licensed under the [NCSA License](assets/database/locales/LICENSE).
