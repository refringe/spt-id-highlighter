# SPT ID Highlighter

This extension aids in the development of the [Single Player Tarkov](https://github.com/sp-tarkov) project by providing additional information about items, quests, and other game objects all directly within Visual Studio Code.

## Features

- **Hover Information**: Hover over a SPT ID to see additional information about the object.
- **Multilingual Support**: Choose from a variety of languages for item names and descriptions.
- **Custom ID Support**: Add a `.sptids` file to your project to provide information on custom IDs. [Example here.](https://github.com/refringe/spt-id-highlighter/wiki/Custom-ID-Support)

![Hover Feature Example](https://github.com/refringe/spt-id-highlighter/blob/main/images/example.gif?raw=true)

## Requirements

This extension requires Visual Studio Code version 1.40.0 or later.

## Extension Settings

This extension contributes the following settings:

- `spt-id-highlighter.language`: specify the language for item names and descriptions.

## Known Issues

No known issues at this time.

## Release Notes

### v1.2.0

Updates

- Updated IDs for SPT v3.10
- Greatly expanded the data that is available on hover
- Added support for custom IDs via a `.sptids` file. [Example here.](https://github.com/refringe/spt-id-highlighter/wiki/Custom-ID-Support)

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

This extension is licensed under the [NCSA License](LICENSE). The locale assets are provided by the [SPT project](https://github.com/sp-tarkov/server) and are licensed under the [NCSA License](assets/database/locales/LICENSE).
