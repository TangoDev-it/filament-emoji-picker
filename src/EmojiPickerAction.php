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
        $this->extraAttributes(function(Action $action) {
            return [
                'x-bind' => 'emojiPickerButton',
                'data-state-path' => $action->getComponent()->getStatePath(),
            ];
        });
    }

    public function isLivewireClickHandlerEnabled(): bool
    {
        return false;
    }
    
}