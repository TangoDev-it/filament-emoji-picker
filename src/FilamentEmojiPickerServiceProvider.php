<?php

namespace TangoDevIt\FilamentEmojiPicker;

use Filament\Support\Facades\FilamentView;
use Illuminate\Contracts\View\View;
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
            ->hasInstallCommand(function (InstallCommand $command) {
                $command->askToStarRepoOnGitHub('tangodev-it/filament-emoji-picker');
            });

        if (file_exists($package->basePath('/../resources/views'))) {
            $package->hasViews(static::$viewNamespace);
        }
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

        FilamentView::registerRenderHook(
            'panels::body.end',
            fn (): View => view('filament-emoji-picker::emoji-picker'),
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
            Js::make('filament-emoji-picker-scripts', __DIR__ . '/../resources/dist/filament-emoji-picker.js'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getScriptData(): array
    {
        return [];
    }
}
