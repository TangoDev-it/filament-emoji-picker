<?php

namespace TangoDevIt\FilamentEmojiPicker;

use Closure;
use Filament\Forms\Components\Actions\Action;

class EmojiPickerAction extends Action
{
    protected string | Closure | null $popupPlacement = 'bottom-end';
    protected array | Closure | null $popupOffset = [7,4];

    public function popupPlacement(string | Closure $value): self
    {
        $this->popupPlacement = $value;
        return $this;
    }

    public function getPopupPlacement(): string
    {
        return (string) $this->evaluate($this->popupPlacement);
    }

    public function popupOffset(array | Closure $value): self
    {
        $this->popupOffset = $value;
        return $this;
    }

    public function getPopupOffset(): ?array
    {
        return (array) $this->evaluate($this->popupOffset);
    }

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
        $popupOffset = $this->getPopupOffset();
        $this->viewData([
            'childView' => parent::getView(),
            'popupOffsetX' => $popupOffset[0],
            'popupOffsetY' => $popupOffset[1],
        ]);
        return 'filament-emoji-picker::emoji-picker-action';
    }
    
}