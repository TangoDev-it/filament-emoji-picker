<?php

namespace TangoDevIt\FilamentEmojiPicker;

use Filament\Support\Assets\Asset;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Spatie\LaravelPackageTools\Commands\InstallCommand;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentEmojiPickerServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-emoji-picker';

    public static string $viewNamespace = 'filament-emoji-picker';

    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package->name(static::$name)
            ->hasViews(static::$viewNamespace)
            ->hasConfigFile('emoji-picker')
            ->hasInstallCommand(function (InstallCommand $command) {
                // The install command can be run using: php artisan filament-emoji-picker:install
                $command
                    ->publishConfigFile()
                    ->askToStarRepoOnGitHub('tangodev-it/filament-emoji-picker');
            });
    }

    public function packageRegistered(): void
    {
    }

    public function packageBooted(): void
    {
        // Asset Registration
        FilamentAsset::register(
            $this->getAssets(),
            $this->getAssetPackageName()
        );

        FilamentAsset::registerScriptData(
            $this->getScriptData(),
            $this->getAssetPackageName()
        );
    }

    protected function getAssetPackageName(): ?string
    {
        return 'tangodev-it/filament-emoji-picker';
    }

    /**
     * @return array<Asset>
     */
    protected function getAssets(): array
    {
        return [
            Js::make('filament-emoji-picker-scripts', __DIR__ . '/../resources/dist/filament-emoji-picker.js')->loadedOnRequest(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getScriptData(): array
    {
        return [
            'emojiPicker' => [
                'locale' => config('emoji-picker.locale'),
                'i18n' => config('emoji-picker.i18n'),
                'datasource' => config('emoji-picker.datasource'),
            ]
        ];
    }
}
