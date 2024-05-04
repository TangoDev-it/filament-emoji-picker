<?php

namespace TangoDevIt\FilamentEmojiPicker;

use Filament\Forms\Components\Actions\Action;

class EmojiPickerAction extends Action
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->label('Emoji');
        $this->icon('heroicon-o-face-smile');
        $this->extraAttributes(function() {
            return [
                'class' => 'emoji-picker-button',
                'x-on:click' => 'toggle',
            ];
        });
    }

    public function isLivewireClickHandlerEnabled(): bool
    {
        return false;
    }

    public function getView(): string
    {
        $this->viewData([
            'childView' => parent::getView(),
            'statePath' => $this->getComponent()->getStatePath()
        ]);
        return 'filament-emoji-picker::emoji-picker-action';
    }
    
}