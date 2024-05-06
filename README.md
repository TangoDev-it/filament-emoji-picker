# Filament emoji picker

[![Latest Version on Packagist](https://img.shields.io/packagist/v/tangodev-it/filament-emoji-picker.svg?style=flat-square)](https://packagist.org/packages/tangodev-it/filament-emoji-picker)


Add an emoji picker to your Filament input fields.

## Installation

You can install the package via composer:

```bash
composer require tangodev-it/filament-emoji-picker
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-emoji-picker-config"
```

or

```bash
php artisan filament-emoji-picker:install
```

Publish the config file if you want to change the default language of the picker (English). See the "Internationalization" section below for further details.

## Usage

Just add the `EmojiPickerAction` to your existing input fields and you're ready to go!

```php
use TangoDevIt\FilamentEmojiPicker\EmojiPickerAction;

TextInput::make('title')
    ->required()
    ->maxLength(255)
    ->suffixAction(EmojiPickerAction::make('emoji-title')),
```

The result:

TODO image

You can add the `EmojiPickerAction` also as a hint action:

```php
TextInput::make('title')
    ->required()
    ->maxLength(255)
    ->hintAction(EmojiPickerAction::make('emoji-title')),
```

Result:

TODO image

Or as a prefix action:

```php
TextInput::make('title')
    ->required()
    ->maxLength(255)
    ->prefixAction(EmojiPickerAction::make('emoji-title')),
```

Result:

TODO image

You can attach the `EmojiPickerAction` also to a `Textarea` field:

```php
Textarea::make('messagge')
    ->required()
    ->maxLength(255)
    ->hintAction(EmojiPickerAction::make('emoji-messagge')),
```

Result:

TODO image

### Action customization
Like any other action, you can set the icon and the label (visible only on hint actions). 

```php
TextInput::make('title')
    ->required()
    ->maxLength(255)
    ->hintAction(EmojiPickerAction::make('emoji-title')
        ->icon('paint-brush')
        ->label('Choose an emoji')
    ),
```

TODO image

By default the icon is `heroicon-o-face-smile` and the label is `Emoji`. The label is only visible in hint actions.

### Popup positioning
You can change the position and the offset (in pixel) of the popup:

```php
TextInput::make('title')
    ->required()
    ->maxLength(255)
    ->prefixAction(EmojiPickerAction::make('emoji-titolo')
        ->popupPlacement('bottom-start')
        ->popupOffset([-7, 4])
    ),
```

TODO image

Possible placements:
 - `auto`
 - `auto-start`
 - `auto-end`
 - `top`
 - `top-start`
 - `top-end`
 - `bottom`
 - `bottom-start`
 - `bottom-end`
 - `right`
 - `right-start`
 - `right-end`
 - `left`
 - `left-start`
 - `left-end`

The default placement is `bottom-end` and the default offset is `[7,4]`.


## Internationalization
You can change the picker language by publishing the config file (see the "Installation" section) and editing it:

Here's an example for the italian translation:

```php
<?php
// config for TangoDevIt/FilamentEmojiPicker
return [
    'locale' => 'en',
    'i18n' => 'https://cdn.jsdelivr.net/npm/emoji-picker-element@1.21.3/i18n/en.js',
    'datasource' => 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@1.6.0/en/emojibase/data.json'
];
```

For further informations please refer to the [underlying javascript library documentation](https://github.com/nolanlawson/emoji-picker-element/?tab=readme-ov-file#internationalization).

## Theming

Out of the box the picker supports light and dark mode:

TODO image

To further customize the style of the picker please refer to the [underlying javascript library documentation](https://github.com/nolanlawson/emoji-picker-element/?tab=readme-ov-file#css-variables).

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [emoji-picker-element](https://github.com/nolanlawson/emoji-picker-element)
- [TangoDev](https://github.com/TangoDev-it)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
